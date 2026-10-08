import os

# Settings are read at import time, so configure the environment before importing the app.
os.environ.update(
    {
        "ENVIRONMENT": "test",
        "MONGO_URL": "mongodb://unused",
        "DB_NAME": "test",
        "SECRET_KEY": "test-secret-key-that-is-long-enough-0123456789",
        "CORS_ORIGINS": "https://oxyssstyle.ro",
        "EMAIL_USERNAME": "",
    }
)

from datetime import datetime  # noqa: E402

import bcrypt  # noqa: E402
import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.api.routes import appointments as appointment_routes  # noqa: E402
from app.api.routes import catalog as catalog_routes  # noqa: E402
from app.core import rate_limit  # noqa: E402
from app.core.business import SHOP_TIMEZONE  # noqa: E402
from app.core.config import get_settings  # noqa: E402
from app.core.security import create_access_token  # noqa: E402
from app.main import create_app  # noqa: E402
from app.services import notifications  # noqa: E402
from tests.fake_db import FakeDatabase  # noqa: E402

# Monday 5 October 2026, 08:00 in Bucharest: before opening, so every slot today is still bookable.
NOW = datetime(2026, 10, 5, 8, 0, tzinfo=SHOP_TIMEZONE)
MONDAY = "2026-10-05"
SATURDAY = "2026-10-10"
SUNDAY = "2026-10-11"

HAIRCUT = "b5a81fce-8d76-4837-a7df-46d658881e1c"  # one of the after-hours services
BEARD = "svc-beard"
OXY = "barber-oxy"
HELGA = "barber-helga"
PASSWORD = "correct-horse-battery-staple"
_HASH = bcrypt.hashpw(PASSWORD.encode(), bcrypt.gensalt(rounds=4)).decode()


def seed(db: FakeDatabase) -> None:
    db.barbers.docs += [
        {"id": OXY, "name": "Oxy", "description": "Founder", "experience_years": 15, "specialties": []},
        {"id": HELGA, "name": "Helga", "description": "Stylist", "experience_years": 8, "specialties": []},
    ]
    db.services.docs += [
        {"id": HAIRCUT, "name": "Men's Haircut", "duration": 45, "base_price": 80.0},
        {"id": BEARD, "name": "Beard Trim", "duration": 30, "base_price": 40.0},
    ]
    db.barber_services.docs += [
        {"id": "offer-1", "barber_id": OXY, "service_id": HAIRCUT, "price": 90.0, "is_available": True},
        {"id": "offer-2", "barber_id": OXY, "service_id": BEARD, "price": 45.0, "is_available": True},
        {"id": "offer-3", "barber_id": HELGA, "service_id": BEARD, "price": 40.0, "is_available": True},
    ]
    db.barber_auth.docs += [
        {"id": "auth-1", "barber_id": OXY, "email": "oxy@example.com", "password_hash": _HASH, "is_active": True},
        {"id": "auth-2", "barber_id": HELGA, "email": "helga@example.com", "password_hash": _HASH, "is_active": True},
    ]


@pytest.fixture
def db() -> FakeDatabase:
    database = FakeDatabase()
    seed(database)
    return database


@pytest.fixture(autouse=True)
def _isolate(monkeypatch):
    for limiter in rate_limit.ALL_LIMITERS:
        limiter.reset()
    monkeypatch.setattr(appointment_routes, "now_local", lambda: NOW)
    monkeypatch.setattr(appointment_routes, "today_local", lambda: NOW.date())
    monkeypatch.setattr(catalog_routes, "now_local", lambda: NOW)


@pytest.fixture
def sent_emails(monkeypatch) -> list[tuple[str, str, str]]:
    sent: list[tuple[str, str, str]] = []

    async def fake_send(to: str, subject: str, body: str) -> None:
        sent.append((to, subject, body))

    monkeypatch.setattr(notifications, "send_email", fake_send)
    return sent


@pytest.fixture
def client(db, sent_emails) -> TestClient:
    app = create_app(get_settings(), connect_db=False)
    app.state.db = db
    with TestClient(app) as test_client:
        yield test_client


def auth_headers(barber_id: str = OXY) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(barber_id)}"}
