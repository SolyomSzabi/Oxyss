"""MongoDB client lifecycle and index setup."""

import asyncio
import logging

from pymongo import ASCENDING, AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.errors import PyMongoError

from app.core.config import Settings

logger = logging.getLogger(__name__)

Database = AsyncDatabase


def create_client(settings: Settings) -> AsyncMongoClient:
    return AsyncMongoClient(
        settings.mongo_url.get_secret_value(),
        serverSelectionTimeoutMS=5000,
        appname="oxyss-api",
    )


async def ensure_indexes(db: Database) -> None:
    """Create the indexes the API relies on. Failures are logged, not fatal, so the API can still start."""
    specs = [
        ("barbers", [("id", ASCENDING)], {"unique": True}),
        ("services", [("id", ASCENDING)], {"unique": True}),
        ("barber_services", [("barber_id", ASCENDING), ("service_id", ASCENDING)], {}),
        ("barber_auth", [("email", ASCENDING)], {"unique": True}),
        ("barber_auth", [("barber_id", ASCENDING)], {}),
        ("appointments", [("id", ASCENDING)], {"unique": True}),
        ("appointments", [("barber_id", ASCENDING), ("appointment_date", ASCENDING)], {}),
        ("barber_breaks", [("id", ASCENDING)], {"unique": True}),
        ("barber_breaks", [("barber_id", ASCENDING), ("break_date", ASCENDING)], {}),
    ]

    async def create(collection: str, keys: list, options: dict) -> None:
        try:
            await db[collection].create_index(keys, **options)
        except PyMongoError:
            logger.exception("Could not create index %s on %s", keys, collection)

    await asyncio.gather(*(create(*spec) for spec in specs))
