"""Booking confirmation e-mails (Romanian, Hungarian and English in one message)."""

import logging
from datetime import date
from email.message import EmailMessage
from typing import Any

import aiosmtplib

from app.core.business import SHOP_NAME, SHOP_PHONE, after_hours_window
from app.core.config import get_settings
from app.schemas.common import format_minutes

logger = logging.getLogger(__name__)

_SEPARATOR = "-" * 60


def build_confirmation_email(appointment: dict[str, Any], after_hours: bool) -> tuple[str, str]:
    a = appointment
    day = date.fromisoformat(a["appointment_date"])
    time = a["appointment_time"][:5]

    window = after_hours_window(day) if after_hours else None
    window_label = f"{format_minutes(window[0])}-{format_minutes(window[1])}" if window else ""
    note_ro = f"\n• Notă: Programare în afara programului normal ({window_label})" if window else ""
    note_hu = f"\n• Megjegyzés: Program utáni időpont ({window_label})" if window else ""
    note_en = f"\n• Note: After-hours appointment ({window_label})" if window else ""

    subject = f"Confirmare / Visszaigazolás / Confirmation – {SHOP_NAME}"
    body = f"""\
🇷🇴 Confirmare Programare – {SHOP_NAME}

Dragă {a["customer_name"]},

Îți mulțumim că ai efectuat o programare la {SHOP_NAME}!

Detaliile programării tale:

• Serviciu: {a["service_name"]}
• Stilist: {a["barber_name"]}
• Dată: {a["appointment_date"]}
• Ora: {time}
• Durată estimată: {a["duration"]} minute
• Preț: {a["price"]} RON{note_ro}

Dacă dorești să modifici sau să anulezi programarea, ne poți contacta la:
Telefon: {SHOP_PHONE}

Te așteptăm cu drag în salonul nostru!

Cu respect,
{a["barber_name"]} și echipa {SHOP_NAME}

{_SEPARATOR}

🇭🇺 Foglalás visszaigazolása – {SHOP_NAME}

Kedves {a["customer_name"]},

Köszönjük, hogy időpontot foglalt az {SHOP_NAME} szalonba!

Az alábbiakban megtalálod a foglalásod részleteit:

• Szolgáltatás: {a["service_name"]}
• Fodrász: {a["barber_name"]}
• Dátum: {a["appointment_date"]}
• Időpont: {time}
• Várható időtartam: {a["duration"]} perc
• Ár: {a["price"]} RON{note_hu}

Amennyiben módosítanád vagy lemondanád az időpontot, kérjük vedd fel velünk a kapcsolatot:
Telefon: {SHOP_PHONE}

Várunk szeretettel az {SHOP_NAME} szalonban!

Üdvözlettel,
{a["barber_name"]} és az {SHOP_NAME} csapat

{_SEPARATOR}

🇬🇧 Appointment Confirmation – {SHOP_NAME}

Dear {a["customer_name"]},

Thank you for booking an appointment at {SHOP_NAME}!

Here are the details of your appointment:

• Service: {a["service_name"]}
• Hair Stylist: {a["barber_name"]}
• Date: {a["appointment_date"]}
• Time: {time}
• Estimated duration: {a["duration"]} minutes
• Price: {a["price"]} RON{note_en}

If you need to modify or cancel your appointment, feel free to contact us:
Phone: {SHOP_PHONE}

We look forward to welcoming you at {SHOP_NAME}!

Best regards,
{a["barber_name"]} and the {SHOP_NAME} Team
"""
    return subject, body


async def send_email(to: str, subject: str, body: str) -> None:
    """Send a plain-text e-mail. Runs as a background task, so failures are logged rather than raised."""
    settings = get_settings()
    if not settings.email_enabled:
        logger.warning("E-mail is not configured; skipping message")
        return

    message = EmailMessage()
    message["From"] = settings.email_from
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.email_host,
            port=settings.email_port,
            start_tls=True,
            username=settings.email_username,
            password=settings.email_password.get_secret_value(),
            timeout=20,
        )
    except (aiosmtplib.SMTPException, OSError):
        logger.exception("Sending e-mail failed")


async def send_booking_confirmation(appointment: dict[str, Any], after_hours: bool) -> None:
    subject, body = build_confirmation_email(appointment, after_hours)
    await send_email(appointment["customer_email"], subject, body)
