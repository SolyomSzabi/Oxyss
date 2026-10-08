from datetime import date

from fastapi import APIRouter

from app.api.deps import DB, CurrentBarber
from app.schemas.breaks import BarberBreak, BarberBreakCreate
from app.schemas.common import Id
from app.services import breaks as break_service

router = APIRouter(tags=["breaks"])


@router.get("/barbers/{barber_id}/breaks", response_model=list[BarberBreak])
async def list_breaks(
    barber_id: Id, db: DB, _: CurrentBarber, date_from: date | None = None, date_to: date | None = None
):
    return await break_service.list_breaks(db, barber_id, date_from, date_to)


@router.post("/breaks", response_model=BarberBreak, status_code=201)
async def create_break(data: BarberBreakCreate, db: DB, staff: CurrentBarber):
    return await break_service.create_break(db, data, staff)


@router.delete("/breaks/{break_id}")
async def delete_break(break_id: Id, db: DB, staff: CurrentBarber):
    await break_service.delete_break(db, break_id, staff)
    return {"message": "Break deleted"}
