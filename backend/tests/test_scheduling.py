from datetime import date, datetime, timedelta

from app.core.business import SHOP_TIMEZONE
from app.services import scheduling
from tests.conftest import HAIRCUT, NOW

MONDAY = date(2026, 10, 5)
SATURDAY = date(2026, 10, 10)
SUNDAY = date(2026, 10, 11)
NEXT_MONDAY = date(2026, 10, 12)


def hm(text: str) -> int:
    hours, minutes = text.split(":")
    return int(hours) * 60 + int(minutes)


def test_weekday_grid_covers_opening_hours():
    slots = scheduling.regular_slots(NEXT_MONDAY, 45, [], NOW)
    assert slots[0].time == "09:00"
    assert slots[-1].time == "18:15"  # 18:15 + 45 min = closing time
    assert len(slots) == 38
    assert all(slot.available for slot in slots)


def test_saturday_closes_at_one_and_sunday_is_closed():
    assert scheduling.regular_slots(SATURDAY, 30, [], NOW)[-1].time == "12:30"
    assert scheduling.regular_slots(SUNDAY, 30, [], NOW) == []


def test_past_slots_today_are_unavailable():
    now = datetime(2026, 10, 5, 10, 0, tzinfo=SHOP_TIMEZONE)
    slots = {slot.time: slot for slot in scheduling.regular_slots(MONDAY, 30, [], now)}
    assert not slots["10:00"].available
    assert slots["10:00"].reason == scheduling.REASON_PAST
    assert slots["10:15"].available


def test_overlapping_slots_are_unavailable():
    busy = [(hm("10:00"), hm("10:45"))]
    slots = {slot.time: slot.available for slot in scheduling.regular_slots(NEXT_MONDAY, 30, busy, NOW)}
    assert slots["09:30"]  # ends exactly when the appointment starts
    assert not slots["09:45"]
    assert not slots["10:30"]
    assert slots["10:45"]


def test_after_hours_offers_only_the_first_gap_free_start():
    assert scheduling.next_after_hours_start(NEXT_MONDAY, 45, [], NOW) == hm("19:00")
    assert scheduling.next_after_hours_start(NEXT_MONDAY, 45, [(hm("19:00"), hm("19:45"))], NOW) == hm("19:45")
    # An appointment running past closing time pushes the first after-hours slot back.
    assert scheduling.next_after_hours_start(NEXT_MONDAY, 45, [(hm("18:30"), hm("19:15"))], NOW) == hm("19:15")
    assert scheduling.next_after_hours_start(SATURDAY, 45, [], NOW) == hm("13:00")
    assert scheduling.next_after_hours_start(SUNDAY, 45, [], NOW) is None


def test_after_hours_window_full():
    busy = [(hm("19:00"), hm("20:30"))]
    assert scheduling.next_after_hours_start(NEXT_MONDAY, 45, busy, NOW) is None


def test_regular_slot_start_rules():
    assert scheduling.is_regular_slot_start(NEXT_MONDAY, hm("09:15"), 45)
    assert not scheduling.is_regular_slot_start(NEXT_MONDAY, hm("09:05"), 45)  # off the grid
    assert not scheduling.is_regular_slot_start(NEXT_MONDAY, hm("08:45"), 45)  # before opening
    assert not scheduling.is_regular_slot_start(NEXT_MONDAY, hm("18:30"), 45)  # runs past closing
    assert not scheduling.is_regular_slot_start(SUNDAY, hm("10:00"), 45)


def test_day_slots_adds_priced_after_hours_slot_only_for_eligible_services():
    slots = scheduling.day_slots(NEXT_MONDAY, HAIRCUT, 45, [], NOW)
    assert slots[-1].after_hours and slots[-1].time == "19:00" and slots[-1].price == 120.0
    assert not any(slot.after_hours for slot in scheduling.day_slots(NEXT_MONDAY, "other", 45, [], NOW))


def test_no_slots_beyond_booking_horizon_or_in_the_past():
    assert scheduling.day_slots(MONDAY + timedelta(days=365), HAIRCUT, 45, [], NOW) == []
    assert scheduling.day_slots(MONDAY - timedelta(days=1), HAIRCUT, 45, [], NOW) == []


def test_legacy_appointment_without_duration_uses_default():
    assert scheduling.appointment_interval({"appointment_time": "10:00:00"}) == (hm("10:00"), hm("10:45"))
