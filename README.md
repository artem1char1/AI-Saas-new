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

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs  
Health: http://localhost:8000/api/health

## Frontend

```bash
cd frontend
cp .env.example .env   # optional, defaults work with Vite proxy
yarn
yarn dev
```

App: http://localhost:5173

Vite proxies `/api` requests to `http://localhost:8000`.

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
