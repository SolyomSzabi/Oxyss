from datetime import UTC, datetime, timedelta

import jwt
import pytest

from tests.conftest import OXY, PASSWORD, auth_headers

PROTECTED = [
    ("get", f"/api/barbers/{OXY}/appointments"),
    ("get", f"/api/barbers/{OXY}/appointments/today"),
    ("get", f"/api/barbers/{OXY}/breaks"),
    ("patch", "/api/appointments/some-id"),
    ("patch", "/api/appointments/some-id/duration"),
    ("delete", "/api/appointments/some-id"),
    ("post", "/api/breaks"),
    ("delete", "/api/breaks/some-id"),
]

REMOVED = [
    ("get", "/__export_db"),
    ("post", "/api/auth/create"),
    ("post", "/api/init-data"),
    ("post", "/api/init-services"),
    ("post", "/api/migrate-services"),
    ("post", "/api/migrate-appointments"),
    ("post", "/api/barbers"),
    ("post", "/api/services"),
    ("post", "/api/barber-services"),
    ("get", "/api/contact"),
    ("get", "/api/appointments"),
    ("get", "/api/appointments/today"),
    ("get", "/api/appointments/some-id"),
]


@pytest.mark.parametrize(("method", "path"), PROTECTED)
def test_staff_endpoints_require_a_token(client, method, path):
    assert getattr(client, method)(path).status_code == 401


@pytest.mark.parametrize(("method", "path"), REMOVED)
def test_dangerous_legacy_endpoints_are_gone(client, method, path):
    assert getattr(client, method)(path).status_code in (404, 405)


def test_login_returns_a_working_token(client):
    response = client.post("/api/auth/login", json={"email": "OXY@example.com", "password": PASSWORD})
    assert response.status_code == 200
    body = response.json()
    assert body["barber_id"] == OXY and body["token_type"] == "bearer"
    headers = {"Authorization": f"Bearer {body['access_token']}"}
    assert client.get(f"/api/barbers/{OXY}/breaks", headers=headers).status_code == 200


@pytest.mark.parametrize(
    ("email", "password"),
    [("oxy@example.com", "wrong-password"), ("nobody@example.com", PASSWORD)],
)
def test_login_rejects_bad_credentials_with_the_same_message(client, email, password):
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_login_is_rate_limited(client):
    for _ in range(10):
        client.post("/api/auth/login", json={"email": "oxy@example.com", "password": "wrong"})
    response = client.post("/api/auth/login", json={"email": "oxy@example.com", "password": PASSWORD})
    assert response.status_code == 429


def test_deactivated_login_is_rejected_even_with_a_valid_token(client, db):
    headers = auth_headers(OXY)
    db.barber_auth.docs[0]["is_active"] = False
    assert client.get(f"/api/barbers/{OXY}/breaks", headers=headers).status_code == 401
    response = client.post("/api/auth/login", json={"email": "oxy@example.com", "password": PASSWORD})
    assert response.status_code == 401


def _token(secret: str, **overrides) -> str:
    now = datetime.now(UTC)
    payload = {"sub": OXY, "iat": now, "exp": now + timedelta(hours=1), "type": "access", **overrides}
    return jwt.encode(payload, secret, algorithm="HS256")


@pytest.mark.parametrize(
    "token",
    [
        "not-a-jwt",
        _token("some-other-secret-that-is-also-long-enough-000"),
        _token("test-secret-key-that-is-long-enough-0123456789", exp=datetime.now(UTC) - timedelta(minutes=1)),
        _token("test-secret-key-that-is-long-enough-0123456789", type="refresh"),
        jwt.encode({"sub": OXY}, key=None, algorithm="none"),
    ],
    ids=["garbage", "wrong-secret", "expired", "wrong-type", "alg-none"],
)
def test_invalid_tokens_are_rejected(client, token):
    response = client.get(f"/api/barbers/{OXY}/breaks", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


def test_production_hides_api_docs(db):
    from fastapi.testclient import TestClient

    from app.core.config import get_settings
    from app.main import create_app

    app = create_app(get_settings().model_copy(update={"environment": "production"}), connect_db=False)
    app.state.db = db
    with TestClient(app) as production_client:
        assert production_client.get("/api/docs").status_code == 404
        assert production_client.get("/api/openapi.json").status_code == 404
        assert "Strict-Transport-Security" in production_client.get("/api/health").headers


def test_security_headers_and_cors(client):
    response = client.get("/api/health", headers={"Origin": "https://oxyssstyle.ro"})
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["access-control-allow-origin"] == "https://oxyssstyle.ro"

    response = client.get("/api/health", headers={"Origin": "https://evil.example"})
    assert "access-control-allow-origin" not in response.headers
