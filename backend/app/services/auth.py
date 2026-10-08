"""Staff authentication."""

from typing import Any

from starlette.concurrency import run_in_threadpool

from app.core.database import Database
from app.core.security import burn_password_check, verify_password

_NO_ID = {"_id": 0}


async def authenticate(db: Database, email: str, password: str) -> dict[str, Any] | None:
    """Return the barber for valid, active credentials, else None. bcrypt runs off the event loop."""
    account = await db.barber_auth.find_one({"email": email.lower(), "is_active": True}, _NO_ID)
    if account is None:
        await run_in_threadpool(burn_password_check)
        return None
    if not await run_in_threadpool(verify_password, password, account["password_hash"]):
        return None
    return await db.barbers.find_one({"id": account["barber_id"]}, _NO_ID)


async def get_active_barber(db: Database, barber_id: str) -> dict[str, Any] | None:
    """The barber behind a token, provided they still have an active login."""
    if await db.barber_auth.find_one({"barber_id": barber_id, "is_active": True}, {"_id": 1}) is None:
        return None
    return await db.barbers.find_one({"id": barber_id}, _NO_ID)
