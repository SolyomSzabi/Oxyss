from datetime import date

from pydantic import BaseModel


class Slot(BaseModel):
    time: str  # "HH:MM"
    available: bool
    reason: str = ""
    after_hours: bool = False
    price: float | None = None  # set only when the slot has a special (after-hours) price


class DaySlots(BaseModel):
    date: date
    barber_id: str
    service_duration: int
    slots: list[Slot]


class AvailableDates(BaseModel):
    barber_id: str
    service_id: str
    available_dates: list[date]
