"""Barber breaks (blocked time in the calendar)."""

import uuid
from datetime import UTC, date, datetime
from typing import Any

from app.core.database import Database
from app.core.errors import ForbiddenError, NotFoundError
from app.schemas.breaks import BarberBreakCreate
from app.schemas.common import to_mongo

_NO_ID = {"_id": 0}


async def list_breaks(
    db: Database, barber_id: str, date_from: date | None = None, date_to: date | None = None
) -> list[dict[str, Any]]:
    query: dict[str, Any] = {"barber_id": barber_id}
    date_filter = {}
    if date_from:
        date_filter["$gte"] = date_from.isoformat()
    if date_to:
        date_filter["$lte"] = date_to.isoformat()
    if date_filter:
        query["break_date"] = date_filter
    return await db.barber_breaks.find(query, _NO_ID).sort("break_date", 1).to_list(None)


async def create_break(db: Database, data: BarberBreakCreate, staff: dict[str, Any]) -> dict[str, Any]:
    if data.barber_id != staff["id"]:
        raise ForbiddenError("You can only add breaks to your own calendar")
    doc = to_mongo({"id": str(uuid.uuid4()), **data.model_dump(), "created_at": datetime.now(UTC)})
    await db.barber_breaks.insert_one(doc)
    doc.pop("_id", None)
    return doc


async def delete_break(db: Database, break_id: str, staff: dict[str, Any]) -> None:
    item = await db.barber_breaks.find_one({"id": break_id}, _NO_ID)
    if item is None:
        raise NotFoundError("Break not found")
    if item["barber_id"] != staff["id"]:
        raise ForbiddenError("You can only delete your own breaks")
    await db.barber_breaks.delete_one({"id": break_id})
