# Backend Storage and APIs

This project backend is implemented in `/Users/zhuojian/Library/CloudStorage/Dropbox/GitHub Repos/Webtools/CellCulturePlanningWebsite/server.js`.

## Storage modes

1. PostgreSQL mode (default when `DATABASE_URL` is set)
2. File mode fallback (`backend/data/db.json`) when PostgreSQL is not configured

`DB_PROVIDER` can force mode:
- `postgres`
- `file`

Optional file-mode path overrides:
- `DATA_DIR` (folder used when `DB_FILE_PATH` is unset)
- `DB_FILE_PATH` (exact JSON path; useful for isolated automated tests)

## Stripe billing

Set these environment variables to enable checkout + portal:
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET` (for webhook signature verification)
- optional: `APP_BASE_URL`, `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL`

Install dependency:

```bash
npm install stripe
```

Webhook route:
- `POST /api/billing/webhook` (expects Stripe signature + raw JSON body)

## Run locally

```bash
npm install
npm run dev
```

Open:
- App: `http://localhost:8787`
- API health: `http://localhost:8787/api/health`

## Security configuration

Recommended variables:

- `SESSION_TOKEN_SECRET` (required in production)
- `PASSWORD_HASH_PEPPER` (optional extra hardening for local passwords)
- `TRUST_PROXY=true` when behind reverse proxy (Coolify/Traefik)
- `CORS_ALLOWED_ORIGINS=https://your-domain.example` (comma-separated)

Notes:
- Bearer session tokens are HMAC-hashed at rest in storage.
- Local auth passwords are verified with legacy fallback and upgraded to `scrypt` hashes on successful login.
- State-changing API requests with an `Origin` header are rejected when origin is not allow-listed/same-origin.

## PostgreSQL setup

1. Set `DATABASE_URL` (for example `postgresql://user:pass@host:5432/dbname`).
2. Optional:
   - `DB_PROVIDER=postgres`
   - `PGSSL=true`
   - `PGSSL_REJECT_UNAUTHORIZED=false`
3. Initialize schema:

```bash
npm run db:init:postgres
```

4. Optional migration from file DB:

```bash
npm run db:migrate:file-to-postgres
```

5. Optional PostgREST roles/grants:

```bash
npm run db:init:postgrest-roles
```

Schema SQL:
- `/Users/zhuojian/Library/CloudStorage/Dropbox/GitHub Repos/Webtools/CellCulturePlanningWebsite/backend/sql/postgres-schema.sql`
- `/Users/zhuojian/Library/CloudStorage/Dropbox/GitHub Repos/Webtools/CellCulturePlanningWebsite/backend/sql/postgrest-roles.sql`

PostgREST config scaffold:
- `/Users/zhuojian/Library/CloudStorage/Dropbox/GitHub Repos/Webtools/CellCulturePlanningWebsite/backend/postgrest/postgrest.conf`

## Core API routes

- `POST /api/auth/google-placeholder`
  - Body: `{ "email": "user@example.com", "name": "User Name", "googleSub": "optional-sub" }`
  - Returns: `{ token, expiresAt, user }`
- `POST /api/auth/local`
  - Body: `{ "email": "user@example.com", "password": "secret" }`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET /api/billing/status`
- `POST /api/billing/create-checkout-session`
- `POST /api/billing/create-portal-session`
- `GET /api/projects/:projectId/state`
- `PATCH /api/projects/:projectId/state`
- `GET /api/projects/:projectId/inventory`
- `PUT /api/projects/:projectId/inventory`
- `GET /api/projects/:projectId/storage`
- `PUT /api/projects/:projectId/storage`
- `GET /api/projects/:projectId/storage-boxes`
- `PUT /api/projects/:projectId/storage-boxes`
- `GET /api/projects/:projectId/media-formulations`
- `PUT /api/projects/:projectId/media-formulations`
- `GET /api/canvases`
- `POST /api/canvases`
- `GET /api/canvases/:canvasId`
- `PUT /api/canvases/:canvasId`
- `DELETE /api/canvases/:canvasId`
- `GET /api/canvases/:canvasId/export`
- `GET /api/canvases/:canvasId/shares`
- `POST /api/canvases/:canvasId/shares`
- `DELETE /api/canvases/:canvasId/shares/:shareId`
- `GET /api/canvases/:canvasId/tasks`
- `POST /api/canvases/:canvasId/tasks`
- `PATCH /api/tasks/:taskId`
- `POST /api/tasks/:taskId/sync-calendar`
- `POST /api/canvases/:canvasId/sync-drive`
- `GET /api/sync-jobs`

## Auth header

For protected routes:

```http
Authorization: Bearer <token>
```

## Notes

- Cell-culture inventory/storage/storage-box/media-formulation interactions now sync to backend project state when signed in.
- Google Calendar and Google Drive sync endpoints are queue placeholders.
- They create `syncJobs` records but do not call Google APIs yet.
- Export endpoint returns workspace-level analytics summary and raw canvas payload for downstream BI pipelines.
- Security middleware adds baseline hardening headers and auth-route rate limiting.
- Schema layout is relational and PostgREST-friendly (`users`, `canvases`, `shares`, `tasks`, `sync_jobs`, `sessions`).
