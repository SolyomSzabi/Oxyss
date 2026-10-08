"""Public, read-only catalogue endpoints."""

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.api.deps import DB
from app.core import rate_limit
from app.core.business import now_local
from app.schemas.availability import AvailableDates, DaySlots
from app.schemas.catalog import Barber, BarberServiceOffer, Service
from app.schemas.common import Id
from app.services import appointments as appointment_service
from app.services import catalog

router = APIRouter(tags=["catalog"])

_availability_limit = Depends(rate_limit.limit_by_ip(rate_limit.availability_limiter, "availability"))


@router.get("/barbers", response_model=list[Barber])
async def list_barbers(db: DB):
    return await catalog.list_barbers(db)


@router.get("/barbers/{barber_id}", response_model=Barber)
async def get_barber(barber_id: Id, db: DB):
    return await catalog.get_barber(db, barber_id)


@router.get("/services", response_model=list[Service])
async def list_services(db: DB):
    return await catalog.list_services(db)


@router.get("/barbers/{barber_id}/services", response_model=list[BarberServiceOffer])
async def list_barber_services(barber_id: Id, db: DB):
    return await catalog.list_barber_offers(db, barber_id)


@router.get("/barbers/{barber_id}/available-slots", response_model=DaySlots, dependencies=[_availability_limit])
async def available_slots(barber_id: Id, date: date, service_id: Annotated[Id, Query()], db: DB):
    return await appointment_service.get_day_slots(db, barber_id, date, service_id, now_local())


@router.get("/barbers/{barber_id}/available-dates", response_model=AvailableDates, dependencies=[_availability_limit])
async def available_dates(
    barber_id: Id,
    year: Annotated[int, Query(ge=2024, le=2100)],
    month: Annotated[int, Query(ge=1, le=12)],
    service_id: Annotated[Id, Query()],
    db: DB,
):
    return await appointment_service.get_available_dates(db, barber_id, year, month, service_id, now_local())
