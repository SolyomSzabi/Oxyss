"""Read access to barbers, services and per-barber offerings."""

from typing import Any

from app.core.database import Database
from app.core.errors import NotFoundError
from app.schemas.catalog import BarberServiceOffer

_NO_ID = {"_id": 0}


async def list_barbers(db: Database) -> list[dict[str, Any]]:
    return await db.barbers.find({}, _NO_ID).to_list(None)


async def get_barber(db: Database, barber_id: str) -> dict[str, Any]:
    barber = await db.barbers.find_one({"id": barber_id}, _NO_ID)
    if barber is None:
        raise NotFoundError("Barber not found")
    return barber


async def list_services(db: Database) -> list[dict[str, Any]]:
    return await db.services.find({}, _NO_ID).to_list(None)


async def get_service(db: Database, service_id: str) -> dict[str, Any]:
    service = await db.services.find_one({"id": service_id}, _NO_ID)
    if service is None:
        raise NotFoundError("Service not found")
    return service


async def get_offer(db: Database, barber_id: str, service_id: str) -> dict[str, Any] | None:
    return await db.barber_services.find_one({"barber_id": barber_id, "service_id": service_id}, _NO_ID)


async def list_barber_offers(db: Database, barber_id: str) -> list[BarberServiceOffer]:
    offers = await db.barber_services.find({"barber_id": barber_id, "is_available": True}, _NO_ID).to_list(None)
    service_ids = [offer["service_id"] for offer in offers]
    services = await db.services.find({"id": {"$in": service_ids}}, _NO_ID).to_list(None)
    services_by_id = {service["id"]: service for service in services}

    result = []
    for offer in offers:
        service = services_by_id.get(offer["service_id"])
        if service is None:
            continue
        result.append(
            BarberServiceOffer(
                id=offer["id"],
                barber_id=offer["barber_id"],
                service_id=offer["service_id"],
                price=offer["price"],
                is_available=offer["is_available"],
                service_name=service["name"],
                service_name_hu=service.get("name_hu", ""),
                service_name_ro=service.get("name_ro", ""),
                service_description=service.get("description", ""),
                service_description_hu=service.get("description_hu", ""),
                service_description_ro=service.get("description_ro", ""),
                duration=service["duration"],
                category=service.get("category", "Men"),
            )
        )
    return result
