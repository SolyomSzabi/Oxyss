# Deployment

## API on Fly.io

The app is defined in `backend/fly.toml` (`oxys-barbershop-api`, region `ams`). Non-secret settings are in its
`[env]` section. Secrets are set once with `fly secrets set`:

```bash
cd backend
fly secrets set \
  MONGO_URL="mongodb+srv://<user>:<password>@<cluster>/" \
  SECRET_KEY="$(openssl rand -hex 32)" \
  EMAIL_USERNAME="..." EMAIL_PASSWORD="..." EMAIL_FROM="..." \
  GOOGLE_API_KEY="..." GOOGLE_PLACE_ID="..."
fly deploy
```

| Variable | Required | Notes |
| --- | --- | --- |
| `MONGO_URL` | yes | secret |
| `DB_NAME` | yes | `oxys_barbershop` (fly.toml) |
| `SECRET_KEY` | yes | secret, at least 32 characters. Changing it logs everyone out. |
| `CORS_ORIGINS` | yes | the exact origin(s) the website is served from, comma separated, no `*` |
| `ENVIRONMENT` | — | `production` hides the API docs and enables HSTS |
| `CLIENT_IP_HEADER` | — | `Fly-Client-IP` on Fly.io. Leave empty elsewhere. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | — | default 720 (12 h) |
| `EMAIL_*` | — | booking confirmations are skipped when unset |
| `GOOGLE_API_KEY`, `GOOGLE_PLACE_ID` | — | the reviews widget is hidden when unset |

The API refuses to start if `SECRET_KEY` is missing or too short, or if `CORS_ORIGINS` contains `*`.

Fly health-checks `GET /api/health`.

**MongoDB Atlas:** do not leave the network access list at `0.0.0.0/0`. Give the Fly app a static egress IP
(`fly ips allocate-egress`) and allow only that. Use a database user that has `readWrite` on `oxys_barbershop` only.

## Website

```bash
cd frontend
npm ci
REACT_APP_BACKEND_URL=https://oxys-barbershop-api.fly.dev npm run build
```

Upload `frontend/build/` to the static host and configure it to:

- serve `index.html` for unknown paths (client-side routing);
- send these response headers, which cannot be set from HTML:
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains`
  - `X-Frame-Options: DENY` (or `Content-Security-Policy: frame-ancestors 'none'`)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`

The page's Content-Security-Policy is generated at build time from `REACT_APP_BACKEND_URL`. If you add a new
external script, font, frame or API host, add it in `frontend/craco.config.js`, or the browser will block it.
