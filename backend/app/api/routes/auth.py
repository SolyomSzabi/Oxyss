from fastapi import APIRouter, HTTPException, Request, status

from app.api.deps import DB
from app.core import rate_limit
from app.core.config import get_settings
from app.core.security import create_access_token
from app.schemas.auth import LoginRequest, Token
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest, request: Request, db: DB) -> Token:
    email = str(credentials.email).lower()
    rate_limit.enforce(rate_limit.login_ip_limiter, f"login:{rate_limit.client_ip(request)}")
    rate_limit.enforce(rate_limit.login_account_limiter, f"login:{email}")

    barber = await auth_service.authenticate(db, email, credentials.password)
    if barber is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return Token(
        access_token=create_access_token(barber["id"]),
        expires_in=get_settings().access_token_expire_minutes * 60,
        barber_id=barber["id"],
        barber_name=barber["name"],
    )
