import asyncio

import pytest

from app.core.errors import ConflictError
from app.services.appointments import _resolve_double_booking
from tests.conftest import BEARD, HAIRCUT, HELGA, MONDAY, OXY, SATURDAY, SUNDAY, auth_headers


def booking(**overrides) -> dict:
    payload = {
        "customer_name": "Ion Popescu",
        "customer_email": "ion@example.com",
        "customer_phone": "+40 712 345 678",
        "service_id": HAIRCUT,
        "barber_id": OXY,
        "appointment_date": MONDAY,
        "appointment_time": "10:00:00",
    }
    return {**payload, **overrides}


def test_public_booking_uses_server_side_names_price_and_duration(client, db, sent_emails):
    response = client.post(
        "/api/appointments",
        json=booking(service_name="<b>FREE</b>", barber_name="Someone", price=1, duration=15, status="completed"),
    )
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["service_name"] == "Men's Haircut"
    assert body["barber_name"] == "Oxy"
    assert body["price"] == 90.0  # barber-specific price
    assert body["duration"] == 45  # client-supplied duration is ignored for the public
    assert body["status"] == "confirmed"
    assert "_id" not in body
    assert len(db.appointments.docs) == 1
    assert sent_emails and sent_emails[0][0] == "ion@example.com"


@pytest.mark.parametrize(
    ("overrides", "status"),
    [
        ({"appointment_time": "07:00:00"}, 400),  # before opening
        ({"appointment_time": "09:05:00"}, 400),  # off the 15-minute grid
        ({"appointment_time": "18:30:00"}, 400),  # would run past closing
        ({"appointment_date": SUNDAY}, 400),  # closed
        ({"appointment_date": "2026-10-04"}, 400),  # in the past
        ({"appointment_date": "2027-12-01"}, 400),  # beyond the booking horizon
        ({"barber_id": HELGA}, 400),  # Helga does not offer this service
        ({"barber_id": "no-such-barber"}, 404),
        ({"service_id": "no-such-service"}, 404),
        ({"customer_email": "not-an-email"}, 422),
        ({"customer_name": "Line\nBreak"}, 422),
        ({"customer_phone": "call me maybe"}, 422),
        ({"barber_id": {"$ne": ""}}, 422),  # operator injection
    ],
)
def test_public_booking_validation(client, db, overrides, status):
    response = client.post("/api/appointments", json=booking(**overrides))
    assert response.status_code == status, response.text
    assert db.appointments.docs == []


def test_overlapping_booking_is_rejected(client):
    assert client.post("/api/appointments", json=booking()).status_code == 201
    response = client.post("/api/appointments", json=booking(appointment_time="10:30:00", customer_name="Other"))
    assert response.status_code == 409


def test_public_booking_is_rate_limited(client):
    times = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"]
    codes = [client.post("/api/appointments", json=booking(appointment_time=f"{t}:00")).status_code for t in times]
    assert codes == [201] * 5 + [429]


def test_staff_can_book_walk_ins_with_a_shorter_duration(client):
    response = client.post(
        "/api/appointments",
        json=booking(appointment_time="09:05:00", duration=20, barber_id=HELGA, service_id=HAIRCUT),
        headers=auth_headers(),
    )
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["duration"] == 20
    assert body["price"] == 80.0  # base price: Helga has no own price for this service


def test_after_hours_booking_must_take_the_next_slot_and_gets_special_price(client):
    response = client.post("/api/appointments", json=booking(appointment_time="19:15:00"))
    assert response.status_code == 409
    assert "next: 19:00" in response.json()["detail"]

    response = client.post("/api/appointments", json=booking(appointment_time="19:00:00"))
    assert response.status_code == 201
    assert response.json()["price"] == 120.0

    response = client.post("/api/appointments", json=booking(appointment_date=SATURDAY, appointment_time="13:00:00"))
    assert response.status_code == 201


def test_after_hours_window_is_only_for_eligible_services(client):
    response = client.post("/api/appointments", json=booking(service_id=BEARD, appointment_time="19:00:00"))
    assert response.status_code == 400


def test_concurrent_double_booking_keeps_only_the_first(db):
    first = {
        "id": "a",
        "barber_id": OXY,
        "appointment_date": MONDAY,
        "appointment_time": "10:00:00",
        "duration": 45,
        "status": "confirmed",
        "created_at": "2026-10-05T05:00:00.000001+00:00",
    }
    second = {**first, "id": "b", "appointment_time": "10:15:00", "created_at": "2026-10-05T05:00:00.000002+00:00"}
    db.appointments.docs += [first, second]

    asyncio.run(_resolve_double_booking(db, first))  # the earlier booking survives
    with pytest.raises(ConflictError):
        asyncio.run(_resolve_double_booking(db, second))
    assert [doc["id"] for doc in db.appointments.docs] == ["a"]


def test_available_slots_and_dates(client):
    response = client.get(f"/api/barbers/{OXY}/available-slots", params={"date": MONDAY, "service_id": HAIRCUT})
    assert response.status_code == 200
    slots = response.json()["slots"]
    assert slots[0] == {"time": "09:00", "available": True, "reason": "", "after_hours": False, "price": None}
    assert slots[-1]["after_hours"] and slots[-1]["price"] == 120.0

    response = client.get(
        f"/api/barbers/{OXY}/available-dates", params={"year": 2026, "month": 10, "service_id": HAIRCUT}
    )
    dates = response.json()["available_dates"]
    assert dates[0] == MONDAY  # nothing before today
    assert SUNDAY not in dates
    assert "2026-10-31" in dates  # Saturday


def test_available_dates_rejects_nonsense_months(client):
    params = {"year": 2026, "month": 13, "service_id": HAIRCUT}
    assert client.get(f"/api/barbers/{OXY}/available-dates", params=params).status_code == 422


def test_staff_manage_appointments(client):
    created = client.post("/api/appointments", json=booking()).json()
    headers = auth_headers(OXY)

    listed = client.get(f"/api/barbers/{OXY}/appointments", headers=headers).json()
    assert [a["id"] for a in listed] == [created["id"]]
    assert client.get(f"/api/barbers/{OXY}/appointments/today", headers=headers).json()[0]["id"] == created["id"]

    url = f"/api/appointments/{created['id']}"
    assert client.patch(url, json={"status": "completed"}, headers=headers).status_code == 200
    assert client.patch(url, json={"status": "hacked"}, headers=headers).status_code == 422

    assert client.patch(f"{url}/duration", json={"duration": 30}, headers=auth_headers(HELGA)).status_code == 403
    assert client.patch(f"{url}/duration", json={"duration": 60}, headers=headers).status_code == 400
    assert client.patch(f"{url}/duration", json={"duration": 30}, headers=headers).status_code == 200

    assert client.delete(url, headers=headers).status_code == 200
    assert client.delete(url, headers=headers).status_code == 404


def test_breaks_are_owned_by_their_barber(client):
    payload = {"barber_id": OXY, "break_date": MONDAY, "start_time": "12:00", "end_time": "12:30", "title": "Lunch"}
    assert client.post("/api/breaks", json=payload, headers=auth_headers(HELGA)).status_code == 403
    assert client.post("/api/breaks", json={**payload, "end_time": "11:00"}, headers=auth_headers()).status_code == 422

    created = client.post("/api/breaks", json=payload, headers=auth_headers())
    assert created.status_code == 201
    break_id = created.json()["id"]

    slots = client.get(f"/api/barbers/{OXY}/available-slots", params={"date": MONDAY, "service_id": BEARD}).json()
    assert not {s["time"]: s for s in slots["slots"]}["12:00"]["available"]

    assert client.delete(f"/api/breaks/{break_id}", headers=auth_headers(HELGA)).status_code == 403
    assert client.delete(f"/api/breaks/{break_id}", headers=auth_headers()).status_code == 200
