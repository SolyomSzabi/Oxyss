from datetime import date

from fastapi import APIRouter, BackgroundTasks, Request

from app.api.deps import DB, CurrentBarber, OptionalBarber
from app.core import rate_limit
from app.core.business import now_local, today_local
from app.schemas.appointment import (
    Appointment,
    AppointmentCreate,
    AppointmentDurationUpdate,
    AppointmentStatus,
    AppointmentStatusUpdate,
)
from app.schemas.common import Id, minutes_of
from app.services import appointments as appointment_service
from app.services import notifications, scheduling

router = APIRouter(tags=["appointments"])


@router.post("/appointments", response_model=Appointment, status_code=201)
async def create_appointment(
    data: AppointmentCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    db: DB,
    staff: OptionalBarber,
):
    if staff is None:
        rate_limit.enforce(rate_limit.booking_limiter, f"booking:{rate_limit.client_ip(request)}")
    appointment = await appointment_service.create_appointment(db, data, now_local(), staff)
    after_hours = scheduling.is_in_after_hours_window(data.appointment_date, minutes_of(data.appointment_time))
    background_tasks.add_task(notifications.send_booking_confirmation, appointment, after_hours)
    return appointment


# ── Staff only ───────────────────────────────────────────────────────────────
# Every logged-in barber can see the whole shop's calendar (the "all appointments" view).


@router.get("/barbers/{barber_id}/appointments", response_model=list[Appointment])
async def list_barber_appointments(
    barber_id: Id,
    db: DB,
    _: CurrentBarber,
    status: AppointmentStatus | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
):
    return await appointment_service.list_barber_appointments(db, barber_id, status, date_from, date_to)


@router.get("/barbers/{barber_id}/appointments/today", response_model=list[Appointment])
async def list_barber_appointments_today(barber_id: Id, db: DB, _: CurrentBarber):
    return await appointment_service.list_day_appointments(db, barber_id, today_local())


@router.patch("/appointments/{appointment_id}")
async def update_appointment_status(appointment_id: Id, update: AppointmentStatusUpdate, db: DB, _: CurrentBarber):
    await appointment_service.update_status(db, appointment_id, update.status)
    return {"message": "Appointment status updated", "status": update.status}


@router.patch("/appointments/{appointment_id}/duration")
async def update_appointment_duration(
    appointment_id: Id, update: AppointmentDurationUpdate, db: DB, staff: CurrentBarber
):
    await appointment_service.shorten(db, appointment_id, update.duration, staff)
    return {"message": "Appointment duration updated", "duration": update.duration, "appointment_id": appointment_id}


@router.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: Id, db: DB, _: CurrentBarber):
    appointment = await appointment_service.delete(db, appointment_id)
    return {
        "message": "Appointment deleted",
        "appointment_id": appointment_id,
        "customer_name": appointment.get("customer_name", ""),
        "appointment_time": appointment.get("appointment_time", ""),
    }
