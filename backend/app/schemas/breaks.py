from datetime import UTC, date, datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.common import Id, SingleLineText, WholeMinuteTime


class BarberBreak(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    barber_id: str
    break_date: date
    start_time: str  # "HH:MM:SS"
    end_time: str
    title: str = "Break"
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class BarberBreakCreate(BaseModel):
    barber_id: Id
    break_date: date
    start_time: WholeMinuteTime
    end_time: WholeMinuteTime
    title: SingleLineText = "Break"

    @model_validator(mode="after")
    def _end_after_start(self) -> "BarberBreakCreate":
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self
