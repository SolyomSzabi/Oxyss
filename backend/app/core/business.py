"""Shop-specific business rules: opening hours, booking grid and after-hours pricing."""

from datetime import date, datetime
from zoneinfo import ZoneInfo

SHOP_NAME = "Oxyss Style"
SHOP_PHONE = "+40 74 116 1016"
SHOP_TIMEZONE = ZoneInfo("Europe/Bucharest")

SLOT_INTERVAL_MINUTES = 15
DEFAULT_APPOINTMENT_MINUTES = 45  # used for legacy appointments stored without a duration
BOOKING_HORIZON_DAYS = 120  # how far ahead customers can book online

# Appointments in these states occupy the barber's time.
BLOCKING_STATUSES = ("pending", "confirmed")

# Opening hours as (start, end) minutes after midnight, keyed by weekday (0 = Monday). Sunday is closed.
_WEEKDAY_HOURS = (9 * 60, 19 * 60)
_SATURDAY_HOURS = (9 * 60, 13 * 60)

# Only these services can be booked after closing time, at a separate price (RON).
AFTER_HOURS_PRICING: dict[str, float] = {
    "b5a81fce-8d76-4837-a7df-46d658881e1c": 120.0,  # Men's Haircut / Férfi Hajvágás
    "ceae8f66-1620-4c46-9423-45f3ccb4481a": 145.0,  # Men's BRONZE (haircut + beard)
}
# The after-hours window is the two hours following closing time.
_AFTER_HOURS_LENGTH = 2 * 60


def now_local() -> datetime:
    return datetime.now(SHOP_TIMEZONE)


def today_local() -> date:
    return now_local().date()


def opening_hours(day: date) -> tuple[int, int] | None:
    weekday = day.weekday()
    if weekday <= 4:
        return _WEEKDAY_HOURS
    if weekday == 5:
        return _SATURDAY_HOURS
    return None


def after_hours_window(day: date) -> tuple[int, int] | None:
    hours = opening_hours(day)
    if hours is None:
        return None
    closing = hours[1]
    return closing, closing + _AFTER_HOURS_LENGTH


def is_after_hours_service(service_id: str) -> bool:
    return service_id in AFTER_HOURS_PRICING
