# AI SaaS

Monorepo with **React + TypeScript** frontend (Feature-Sliced Design) and **FastAPI** backend.

## Structure

```
.
├── frontend/          # React + Vite + TypeScript (yarn)
│   └── src/
│       ├── app/       # App init, providers, router, global styles
│       ├── pages/     # Route pages
│       ├── widgets/   # Composite UI blocks
│       ├── features/  # User actions & business logic
│       ├── entities/  # Business entities
│       └── shared/    # Reusable UI, API, config, lib
└── backend/           # FastAPI
    └── app/
```

## Prerequisites

- Node.js 20+
- Yarn (`npm install -g yarn`)
- Python 3.11+

## Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r Dockerfile/requirements.txt
uvicorn app.main:app --reload --port 8000
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs  
Health: http://localhost:8000/api/health

### Migrations (Alembic)

```bash
# apply all migrations
alembic upgrade head

# create migration after model changes
alembic revision --autogenerate -m "describe change"
alembic upgrade head

# rollback last migration
alembic downgrade -1
```

Models live in `app/models/`. Alembic reads DB credentials from `.env` via `app.core.config`.

### Auth (JWT)

Endpoints under `/api/auth`:

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register user |
| POST | `/login` | Login, returns access + refresh tokens |
| POST | `/refresh` | Rotate refresh token |
| POST | `/logout` | Revoke refresh token |
| GET | `/me` | Current user (`Authorization: Bearer <access_token>`) |

Required `.env` keys: `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`, `JWT_REFRESH_TOKEN_EXPIRE_DAYS`.

Refresh tokens are stored in `auth_tokens` table (hashed). Access tokens are stateless JWT.

## Frontend

```bash
cd frontend
cp .env.example .env   # optional, defaults work with Vite proxy
yarn
yarn dev
```

App: http://localhost:5173

Vite proxies `/api` requests to `http://localhost:8000`.

## Production (Docker Compose)

```bash
docker compose up -d --build
```

- Frontend: http://localhost:3000
- Backend (direct): http://localhost:8000
- API from browser: http://localhost:3000/api/... — nginx in the frontend container proxies to `backend:8000`

**Important:** In production the frontend must not call port 8000 directly unless you configure it explicitly. By default `VITE_API_URL=/api` and nginx forwards `/api` to the backend service.

After changing `nginx.conf` or env vars, rebuild the frontend image:

```bash
docker compose up -d --build frontend
```

### Frontend on port 3000, API on port 8000 (without nginx proxy)

If you serve the frontend build without proxying `/api`, rebuild with:

```bash
docker compose build frontend --build-arg VITE_API_URL=http://YOUR_HOST:8000/api
```

Add your frontend URL to `CORS_ORIGINS` in `backend/.env`, for example:

```env
CORS_ORIGINS=["http://YOUR_HOST:3000"]
```

## FSD layers

| Layer    | Purpose                          |
|----------|----------------------------------|
| `app`    | Entry point, routing, providers  |
| `pages`  | Full pages                       |
| `widgets`| Large UI sections                |
| `features`| Interactive features          |
| `entities`| Domain models & API           |
| `shared` | UI kit, API client, utilities    |

Import rule: upper layers can use lower layers, not vice versa.
