# Oxyss Style — barbershop website

Public website and online booking for the Oxyss Style barbershop, plus a staff area where barbers manage
their calendar.

| Part | Stack | Hosted on |
| --- | --- | --- |
| `frontend/` | React 18 (Create React App + CRACO), Tailwind, shadcn/ui, i18next (EN / RO / HU) | static hosting |
| `backend/` | FastAPI, PyMongo (async), Pydantic v2 | Fly.io (`oxys-barbershop-api`) |
| database | MongoDB (Atlas) | — |

## Repository layout

```
backend/
  app/
    main.py              application factory: middleware, routers, error handling
    core/                config, database, security (bcrypt + JWT), rate limiting, business rules
    schemas/             request/response models (Pydantic)
    services/            business logic: scheduling, booking, breaks, e-mail, Google reviews
    api/deps.py          shared dependencies (database, current barber)
    api/routes/          HTTP endpoints, one module per resource
  scripts/manage_accounts.py   create / reset / deactivate barber logins
  tests/                 pytest suite (runs against an in-memory fake database)
frontend/
  src/
    lib/api.js           the single HTTP client (adds the staff token, handles expired sessions)
    lib/session.js       staff session storage
    contexts/            AuthContext
    components/          layout and shared components (ui/ = shadcn primitives)
    pages/               one component per route
    locales/             translations (en, ro, hu)
docs/deployment.md       deploying the API and the website
```

## Local development

**Backend** (Python 3.11+):

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
cp .env.example .env        # then fill in MONGO_URL and SECRET_KEY
uvicorn app.main:app --reload --port 8001
```

API docs are at http://localhost:8001/api/docs (disabled when `ENVIRONMENT=production`).

**Frontend** (Node 20):

```bash
cd frontend
npm ci
cp .env.example .env.local  # REACT_APP_BACKEND_URL=http://localhost:8001
npm start
```

## Tests and linting

```bash
cd backend
pytest
ruff check . && ruff format --check .
```

CI (`.github/workflows/ci.yml`) runs the backend checks and a production build of the frontend on every push.

## Staff accounts

There is deliberately no HTTP endpoint for creating logins. Use the script, which prompts for the password:

```bash
cd backend
python -m scripts.manage_accounts list
python -m scripts.manage_accounts create --barber-id <id> --email <email>
python -m scripts.manage_accounts set-password --email <email>
python -m scripts.manage_accounts deactivate --email <email>
```

In production, run it on the Fly machine: `fly ssh console -C "python -m scripts.manage_accounts list"`.
Passwords must be at least 12 characters.

## API overview

All routes are under `/api`.

| Access | Endpoints |
| --- | --- |
| Public | `GET /barbers`, `GET /barbers/{id}`, `GET /services`, `GET /barbers/{id}/services`, `GET /barbers/{id}/available-slots`, `GET /barbers/{id}/available-dates`, `POST /appointments` (rate limited), `GET /reviews`, `GET /health` |
| Login | `POST /auth/login` (rate limited) |
| Staff (Bearer token) | `GET /barbers/{id}/appointments[/today]`, `PATCH /appointments/{id}`, `PATCH /appointments/{id}/duration`, `DELETE /appointments/{id}`, `GET /barbers/{id}/breaks`, `POST /breaks`, `DELETE /breaks/{id}` |

Booking rules (opening hours, the after-hours window and its prices) live in `backend/app/core/business.py`.
The server computes names, prices and durations itself. It never trusts these values from the browser.

## Security model

- Staff authenticate with e-mail and password (bcrypt) and get a JWT that is valid for 12 hours. Every request
  re-checks that the login is still active, so deactivating a login locks it out immediately.
- Every logged-in barber can see the whole shop's calendar. Barbers can only change durations and breaks on
  their own calendar.
- Login and public booking are rate limited per client IP. CORS only allows the origins in `CORS_ORIGINS`.
- The website ships a strict Content-Security-Policy (see `frontend/craco.config.js`) and loads no third-party
  scripts. Google Maps and Google reviews load only after cookie consent.
- Secrets live only in environment variables / `fly secrets`. Database exports must never be committed.
