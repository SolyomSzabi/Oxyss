"""Pure scheduling rules (no I/O). Times are minutes after midnight; intervals are half-open [start, end)."""

from collections.abc import Iterable, Mapping
from datetime import date, datetime, timedelta
from typing import Any

from app.core.business import (
    AFTER_HOURS_PRICING,
    BOOKING_HORIZON_DAYS,
    DEFAULT_APPOINTMENT_MINUTES,
    SLOT_INTERVAL_MINUTES,
    after_hours_window,
    is_after_hours_service,
    opening_hours,
)
from app.schemas.availability import Slot
from app.schemas.common import format_minutes, minutes_of

Interval = tuple[int, int]

REASON_PAST = "Time slot is in the past"
REASON_TAKEN = "Time slot is not available"


def appointment_interval(doc: Mapping[str, Any]) -> Interval:
    start = minutes_of(doc["appointment_time"])
    return start, start + int(doc.get("duration") or DEFAULT_APPOINTMENT_MINUTES)


def break_interval(doc: Mapping[str, Any]) -> Interval:
    return minutes_of(doc["start_time"]), minutes_of(doc["end_time"])


def busy_intervals(appointments: Iterable[Mapping[str, Any]], breaks: Iterable[Mapping[str, Any]]) -> list[Interval]:
    return [appointment_interval(a) for a in appointments] + [break_interval(b) for b in breaks]


def overlaps(start: int, end: int, busy: Iterable[Interval]) -> bool:
    return any(start < busy_end and end > busy_start for busy_start, busy_end in busy)


def is_past(day: date, start: int, now: datetime) -> bool:
    today = now.date()
    if day != today:
        return day < today
    return start <= now.hour * 60 + now.minute


def is_within_horizon(day: date, now: datetime) -> bool:
    today = now.date()
    return today <= day <= today + timedelta(days=BOOKING_HORIZON_DAYS)


def is_in_after_hours_window(day: date, start: int) -> bool:
    window = after_hours_window(day)
    return window is not None and window[0] <= start < window[1]


def is_regular_slot_start(day: date, start: int, duration: int) -> bool:
    """True if `start` lies on the booking grid and the appointment fits within opening hours."""
    hours = opening_hours(day)
    if hours is None:
        return False
    opening, closing = hours
    return opening <= start and start + duration <= closing and (start - opening) % SLOT_INTERVAL_MINUTES == 0


def regular_slots(day: date, duration: int, busy: list[Interval], now: datetime) -> list[Slot]:
    hours = opening_hours(day)
    if hours is None:
        return []
    opening, closing = hours
    slots = []
    for start in range(opening, closing - duration + 1, SLOT_INTERVAL_MINUTES):
        if is_past(day, start, now):
            reason = REASON_PAST
        elif overlaps(start, start + duration, busy):
            reason = REASON_TAKEN
        else:
            reason = ""
        slots.append(Slot(time=format_minutes(start), available=not reason, reason=reason))
    return slots


def next_after_hours_start(day: date, duration: int, busy: list[Interval], now: datetime) -> int | None:
    """Earliest free start in the after-hours window.

    Only the first gap-free slot is offered so the barber is not left waiting between late appointments.
    """
    window = after_hours_window(day)
    if window is None:
        return None
    window_start, window_end = window
    clipped = sorted(
        (max(start, window_start), min(end, window_end))
        for start, end in busy
        if start < window_end and end > window_start
    )
    candidate = window_start
    for busy_start, busy_end in clipped:
        if candidate + duration <= busy_start:
            break
        candidate = max(candidate, busy_end)
    if candidate + duration > window_end or is_past(day, candidate, now):
        return None
    return candidate


def day_slots(day: date, service_id: str, duration: int, busy: list[Interval], now: datetime) -> list[Slot]:
    if not is_within_horizon(day, now):
        return []
    slots = regular_slots(day, duration, busy, now)
    if is_after_hours_service(service_id):
        start = next_after_hours_start(day, duration, busy, now)
        if start is not None:
            slots.append(
                Slot(
                    time=format_minutes(start),
                    available=True,
                    after_hours=True,
                    price=AFTER_HOURS_PRICING[service_id],
                )
            )
    return slots
