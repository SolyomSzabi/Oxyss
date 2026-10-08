"""Password hashing and JWT access tokens."""

from datetime import UTC, datetime, timedelta
from functools import lru_cache

import bcrypt
import jwt

from app.core.config import get_settings

ALGORITHM = "HS256"
# bcrypt only looks at the first 72 bytes of a password; longer inputs are rejected instead of truncated.
MAX_PASSWORD_BYTES = 72
MIN_PASSWORD_LENGTH = 12


class InvalidTokenError(Exception):
    pass


def hash_password(password: str) -> str:
    validate_new_password(password)
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    encoded = password.encode()
    if len(encoded) > MAX_PASSWORD_BYTES:
        return False
    try:
        return bcrypt.checkpw(encoded, password_hash.encode())
    except ValueError:
        return False


@lru_cache
def _dummy_hash() -> bytes:
    return bcrypt.hashpw(b"timing-equaliser", bcrypt.gensalt())


def burn_password_check() -> None:
    """Spend the same time as a real check so login timing does not reveal which e-mails exist."""
    bcrypt.checkpw(b"not-the-password", _dummy_hash())


def validate_new_password(password: str) -> None:
    if len(password) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters")
    if len(password.encode()) > MAX_PASSWORD_BYTES:
        raise ValueError(f"Password must be at most {MAX_PASSWORD_BYTES} bytes")


def create_access_token(subject: str) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    payload = {
        "sub": subject,
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
        "type": "access",
    }
    return jwt.encode(payload, settings.secret_key.get_secret_value(), algorithm=ALGORITHM)


def decode_access_token(token: str) -> str:
    """Return the token subject (barber id) or raise InvalidTokenError."""
    try:
        payload = jwt.decode(
            token,
            get_settings().secret_key.get_secret_value(),
            algorithms=[ALGORITHM],
            options={"require": ["sub", "exp", "iat"]},
        )
    except jwt.PyJWTError as exc:
        raise InvalidTokenError from exc
    if payload.get("type") != "access" or not isinstance(payload.get("sub"), str):
        raise InvalidTokenError
    return payload["sub"]
