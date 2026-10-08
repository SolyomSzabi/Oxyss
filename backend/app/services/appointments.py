"""Appointment booking, availability and staff management."""

import calendar
import uuid
from collections import defaultdict
from datetime import UTC, date, datetime, timedelta
from typing import Any

from app.core.business import AFTER_HOURS_PRICING, BLOCKING_STATUSES, BOOKING_HORIZON_DAYS
from app.core.database import Database
from app.core.errors import BadRequestError, ConflictError, ForbiddenError, NotFoundError
from app.schemas.appointment import AppointmentCreate
from app.schemas.availability import AvailableDates, DaySlots
from app.schemas.common import format_minutes, minutes_of, to_mongo
from app.services import catalog, scheduling

_NO_ID = {"_id": 0}


async def _day_documents(db: Database, barber_id: str, day: date) -> tuple[list[dict], list[dict]]:
    day_iso = day.isoformat()
    appointments = await db.appointments.find(
        {"barber_id": barber_id, "appointment_date": day_iso, "status": {"$in": list(BLOCKING_STATUSES)}}, _NO_ID
    ).to_list(None)
    breaks = await db.barber_breaks.find({"barber_id": barber_id, "break_date": day_iso}, _NO_ID).to_list(None)
    return appointments, breaks


async def get_day_slots(db: Database, barber_id: str, day: date, service_id: str, now: datetime) -> DaySlots:
    await catalog.get_barber(db, barber_id)
    service = await catalog.get_service(db, service_id)
    appointments, breaks = await _day_documents(db, barber_id, day)
    busy = scheduling.busy_intervals(appointments, breaks)
    return DaySlots(
        date=day,
        barber_id=barber_id,
        service_duration=service["duration"],
        slots=scheduling.day_slots(day, service_id, service["duration"], busy, now),
    )


async def get_available_dates(
    db: Database, barber_id: str, year: int, month: int, service_id: str, now: datetime
) -> AvailableDates:
    """Days in the month that still have at least one free slot, so the calendar can disable full days."""
    await catalog.get_barber(db, barber_id)
    service = await catalog.get_service(db, service_id)

    today = now.date()
    first = max(date(year, month, 1), today)
    last = min(date(year, month, calendar.monthrange(year, month)[1]), today + timedelta(days=BOOKING_HORIZON_DAYS))
    available: list[date] = []
    if first <= last:
        date_range = {"$gte": first.isoformat(), "$lte": last.isoformat()}
        appointments = await db.appointments.find(
            {"barber_id": barber_id, "appointment_date": date_range, "status": {"$in": list(BLOCKING_STATUSES)}},
            _NO_ID,
        ).to_list(None)
        breaks = await db.barber_breaks.find({"barber_id": barber_id, "break_date": date_range}, _NO_ID).to_list(None)

        appointments_by_day: dict[str, list[dict]] = defaultdict(list)
        breaks_by_day: dict[str, list[dict]] = defaultdict(list)
        for appointment in appointments:
            appointments_by_day[appointment["appointment_date"]].append(appointment)
        for item in breaks:
            breaks_by_day[item["break_date"]].append(item)

        day = first
        while day <= last:
            key = day.isoformat()
            busy = scheduling.busy_intervals(appointments_by_day[key], breaks_by_day[key])
            if any(slot.available for slot in scheduling.day_slots(day, service_id, service["duration"], busy, now)):
                available.append(day)
            day += timedelta(days=1)

    return AvailableDates(barber_id=barber_id, service_id=service_id, available_dates=available)


async def create_appointment(
    db: Database, data: AppointmentCreate, now: datetime, staff: dict[str, Any] | None = None
) -> dict[str, Any]:
    """Validate and store a booking.

    Public bookings must use a slot the booking page offers. Authenticated staff may book any free time
    (e.g. walk-ins) and may shorten the duration to fit a gap.
    """
    is_staff = staff is not None
    service = await catalog.get_service(db, data.service_id)
    barber = await catalog.get_barber(db, data.barber_id)
    offer = await catalog.get_offer(db, data.barber_id, data.service_id)

    if not is_staff and (not barber.get("is_available", True) or not offer or not offer.get("is_available", True)):
        raise BadRequestError("This barber does not offer the selected service")

    price = float(offer["price"]) if offer else float(service["base_price"])
    duration = data.duration if is_staff and data.duration else int(service["duration"])
    day = data.appointment_date
    start = minutes_of(data.appointment_time)

    if scheduling.is_past(day, start, now):
        raise BadRequestError("This time slot is in the past")
    if not is_staff and not scheduling.is_within_horizon(day, now):
        raise BadRequestError(f"Appointments can be booked at most {BOOKING_HORIZON_DAYS} days in advance")

    appointments, breaks = await _day_documents(db, data.barber_id, day)
    busy = scheduling.busy_intervals(appointments, breaks)

    is_after_hours = scheduling.is_in_after_hours_window(day, start)
    if is_after_hours:
        if data.service_id not in AFTER_HOURS_PRICING:
            raise BadRequestError("This service cannot be booked in the after-hours window")
        next_start = scheduling.next_after_hours_start(day, duration, busy, now)
        if next_start != start:
            hint = f"next: {format_minutes(next_start)}" if next_start is not None else "the window is full"
            raise ConflictError(f"This is not the next available after-hours slot ({hint})")
        price = AFTER_HOURS_PRICING[data.service_id]
    elif not is_staff and not scheduling.is_regular_slot_start(day, start, duration):
        raise BadRequestError("This time is outside of the bookable opening hours")

    if scheduling.overlaps(start, start + duration, busy):
        raise ConflictError("This time slot is no longer available")

    doc = to_mongo(
        {
            "id": str(uuid.uuid4()),
            "customer_name": data.customer_name,
            "customer_email": str(data.customer_email),
            "customer_phone": data.customer_phone,
            "service_id": service["id"],
            "service_name": service["name"],
            "barber_id": barber["id"],
            "barber_name": barber["name"],
            "appointment_date": day,
            "appointment_time": data.appointment_time,
            "duration": duration,
            "price": price,
            "status": "confirmed",
            "created_at": datetime.now(UTC),
        }
    )
    await db.appointments.insert_one(doc)
    doc.pop("_id", None)
    await _resolve_double_booking(db, doc)
    return doc


async def _resolve_double_booking(db: Database, doc: dict[str, Any]) -> None:
    """Guard against two simultaneous requests booking the same time.

    Both requests may pass the overlap check before either is stored. After inserting, each request looks
    again; if an overlapping booking created earlier exists, this one withdraws. Exactly one survives.
    """
    start, end = scheduling.appointment_interval(doc)
    others = await db.appointments.find(
        {
            "barber_id": doc["barber_id"],
            "appointment_date": doc["appointment_date"],
            "status": {"$in": list(BLOCKING_STATUSES)},
            "id": {"$ne": doc["id"]},
        },
        _NO_ID,
    ).to_list(None)
    mine = (doc["created_at"], doc["id"])
    for other in others:
        other_start, other_end = scheduling.appointment_interval(other)
        if start < other_end and end > other_start and (str(other.get("created_at", "")), other["id"]) < mine:
            await db.appointments.delete_one({"id": doc["id"]})
            raise ConflictError("This time slot is no longer available")


async def list_barber_appointments(
    db: Database,
    barber_id: str,
    status: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
) -> list[dict[str, Any]]:
    query: dict[str, Any] = {"barber_id": barber_id}
    if status:
        query["status"] = status
    date_filter = {}
    if date_from:
        date_filter["$gte"] = date_from.isoformat()
    if date_to:
        date_filter["$lte"] = date_to.isoformat()
    if date_filter:
        query["appointment_date"] = date_filter
    return await db.appointments.find(query, _NO_ID).sort("appointment_date", -1).to_list(None)


async def list_day_appointments(db: Database, barber_id: str, day: date) -> list[dict[str, Any]]:
    query = {"barber_id": barber_id, "appointment_date": day.isoformat()}
    return await db.appointments.find(query, _NO_ID).sort("appointment_time", 1).to_list(None)


async def _get(db: Database, appointment_id: str) -> dict[str, Any]:
    appointment = await db.appointments.find_one({"id": appointment_id}, _NO_ID)
    if appointment is None:
        raise NotFoundError("Appointment not found")
    return appointment


async def update_status(db: Database, appointment_id: str, status: str) -> None:
    result = await db.appointments.update_one({"id": appointment_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise NotFoundError("Appointment not found")


async def shorten(db: Database, appointment_id: str, duration: int, staff: dict[str, Any]) -> None:
    """Barbers may only shorten their own appointments (e.g. when a cut finished early)."""
    appointment = await _get(db, appointment_id)
    if appointment["barber_id"] != staff["id"]:
        raise ForbiddenError("You can only modify your own appointments")
    if duration > int(appointment.get("duration") or 0):
        raise BadRequestError("The duration can only be reduced, not increased")
    await db.appointments.update_one({"id": appointment_id}, {"$set": {"duration": duration}})


async def delete(db: Database, appointment_id: str) -> dict[str, Any]:
    appointment = await _get(db, appointment_id)
    await db.appointments.delete_one({"id": appointment_id})
    return appointment
