"""Shared field types and MongoDB (de)serialisation helpers.

Dates are stored as ISO strings ("2025-11-14") and times as "HH:MM:SS" strings, matching the existing data.
"""

import re
from datetime import date, datetime, time
from typing import Annotated, Any

from pydantic import AfterValidator, StringConstraints

_CONTROL_CHARS = re.compile(r"[\x00-\x1f\x7f]")


def _no_control_chars(value: str) -> str:
    if _CONTROL_CHARS.search(value):
        raise ValueError("must not contain control characters or line breaks")
    return value


def _whole_minutes(value: time) -> time:
    if value.second or value.microsecond:
        raise ValueError("must be a whole minute (HH:MM)")
    return value.replace(tzinfo=None)


Id = Annotated[str, StringConstraints(min_length=1, max_length=64, pattern=r"^[A-Za-z0-9-]+$")]
SingleLineText = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100), AfterValidator(_no_control_chars)
]
PhoneNumber = Annotated[str, StringConstraints(strip_whitespace=True, pattern=r"^\+?[0-9 ()./-]{6,20}$")]
WholeMinuteTime = Annotated[time, AfterValidator(_whole_minutes)]

_DATE_FIELDS = ("appointment_date", "break_date")
_TIME_FIELDS = ("appointment_time", "start_time", "end_time")
_DATETIME_FIELDS = ("created_at",)


def to_mongo(data: dict[str, Any]) -> dict[str, Any]:
    doc = dict(data)
    for field in _DATE_FIELDS:
        if isinstance(doc.get(field), date):
            doc[field] = doc[field].isoformat()
    for field in _TIME_FIELDS:
        if isinstance(doc.get(field), time):
            doc[field] = doc[field].strftime("%H:%M:%S")
    for field in _DATETIME_FIELDS:
        if isinstance(doc.get(field), datetime):
            doc[field] = doc[field].isoformat()
    return doc


def minutes_of(value: time | str) -> int:
    """Minutes after midnight for a time or an "HH:MM[:SS]" string."""
    if isinstance(value, str):
        hours, minutes = value.split(":")[:2]
        return int(hours) * 60 + int(minutes)
    return value.hour * 60 + value.minute


def format_minutes(total: int) -> str:
    return f"{total // 60:02d}:{total % 60:02d}"
