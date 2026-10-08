"""Manage barber logins directly in the database (there is intentionally no HTTP endpoint for this).

Usage (from the backend/ directory, with MONGO_URL, DB_NAME and SECRET_KEY set):
    python -m scripts.manage_accounts list
    python -m scripts.manage_accounts create --barber-id <id> --email <email>
    python -m scripts.manage_accounts set-password --email <email>
    python -m scripts.manage_accounts deactivate --email <email>

Passwords are always read from an interactive prompt so they never end up in shell history.
On Fly.io, run it inside the app machine: `fly ssh console -C "python -m scripts.manage_accounts list"`.
"""

import argparse
import asyncio
import getpass
import sys
import uuid

from app.core.config import get_settings
from app.core.database import create_client
from app.core.security import hash_password, validate_new_password


def prompt_password() -> str:
    while True:
        password = getpass.getpass("New password: ")
        try:
            validate_new_password(password)
        except ValueError as exc:
            print(exc)
            continue
        if getpass.getpass("Repeat password: ") == password:
            return password
        print("Passwords do not match.")


async def main(args: argparse.Namespace) -> int:
    settings = get_settings()
    client = create_client(settings)
    db = client[settings.db_name]
    try:
        if args.command == "list":
            barbers = {b["id"]: b["name"] for b in await db.barbers.find({}, {"_id": 0}).to_list(None)}
            print("Barbers:")
            for barber_id, name in barbers.items():
                print(f"  {barber_id}  {name}")
            print("Logins:")
            async for account in db.barber_auth.find({}, {"_id": 0, "password_hash": 0}):
                state = "active" if account.get("is_active") else "inactive"
                print(f"  {account['email']:<40} {barbers.get(account['barber_id'], '?'):<15} {state}")
            return 0

        email = args.email.strip().lower()
        if args.command == "create":
            if await db.barbers.find_one({"id": args.barber_id}) is None:
                print("No barber with that id (see `list`).", file=sys.stderr)
                return 1
            if await db.barber_auth.find_one({"email": email}) is not None:
                print("That e-mail already has a login.", file=sys.stderr)
                return 1
            await db.barber_auth.insert_one(
                {
                    "id": str(uuid.uuid4()),
                    "barber_id": args.barber_id,
                    "email": email,
                    "password_hash": hash_password(prompt_password()),
                    "is_active": True,
                }
            )
            print("Login created.")
            return 0

        if await db.barber_auth.find_one({"email": email}) is None:
            print("No login with that e-mail.", file=sys.stderr)
            return 1
        if args.command == "set-password":
            update = {"password_hash": hash_password(prompt_password()), "is_active": True}
        else:
            update = {"is_active": False}
        await db.barber_auth.update_one({"email": email}, {"$set": update})
        print("Done.")
        return 0
    finally:
        await client.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("list", help="list barbers and their logins")
    create = commands.add_parser("create", help="create a login for an existing barber")
    create.add_argument("--barber-id", required=True)
    create.add_argument("--email", required=True)
    for name, help_text in (("set-password", "set a new password"), ("deactivate", "disable a login")):
        command = commands.add_parser(name, help=help_text)
        command.add_argument("--email", required=True)
    return parser.parse_args()


if __name__ == "__main__":
    sys.exit(asyncio.run(main(parse_args())))
