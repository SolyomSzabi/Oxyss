from typing import Annotated, Any

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.database import Database
from app.core.security import InvalidTokenError, decode_access_token
from app.services import auth as auth_service

_bearer = HTTPBearer(auto_error=False)


def get_db(request: Request) -> Database:
    return request.app.state.db


DB = Annotated[Database, Depends(get_db)]


def _unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def _barber_from_credentials(credentials: HTTPAuthorizationCredentials, db: Database) -> dict[str, Any]:
    try:
        barber_id = decode_access_token(credentials.credentials)
    except InvalidTokenError:
        raise _unauthorized() from None
    barber = await auth_service.get_active_barber(db, barber_id)
    if barber is None:
        raise _unauthorized()
    return barber


async def get_current_barber(
    db: DB, credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)]
) -> dict[str, Any]:
    if credentials is None:
        raise _unauthorized()
    return await _barber_from_credentials(credentials, db)


async def get_optional_barber(
    db: DB, credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)]
) -> dict[str, Any] | None:
    """Staff member if a token was sent (an invalid token is still rejected), else None."""
    if credentials is None:
        return None
    return await _barber_from_credentials(credentials, db)


CurrentBarber = Annotated[dict[str, Any], Depends(get_current_barber)]
OptionalBarber = Annotated[dict[str, Any] | None, Depends(get_optional_barber)]
