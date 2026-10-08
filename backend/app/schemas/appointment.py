from datetime import UTC, date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.common import Id, PhoneNumber, SingleLineText, WholeMinuteTime

AppointmentStatus = Literal["pending", "confirmed", "completed", "cancelled"]


class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    customer_name: str
    customer_email: str
    customer_phone: str
    service_id: str
    service_name: str
    barber_id: str
    barber_name: str
    appointment_date: date
    appointment_time: str  # "HH:MM:SS"
    duration: int | None = None
    price: float | None = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class AppointmentCreate(BaseModel):
    """Booking request. Service/barber names and the price are looked up server-side, never trusted."""

    model_config = ConfigDict(extra="ignore")

    customer_name: SingleLineText
    customer_email: EmailStr = Field(max_length=254)
    customer_phone: PhoneNumber
    service_id: Id
    barber_id: Id
    appointment_date: date
    appointment_time: WholeMinuteTime
    # Staff only: book a shorter slot than the service's default length. Ignored for public bookings.
    duration: int | None = Field(default=None, ge=15, le=8 * 60)


class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus


class AppointmentDurationUpdate(BaseModel):
    duration: int = Field(ge=15, le=8 * 60)
