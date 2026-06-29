# Internal Requests Desk

[![CI](https://github.com/mhmdevan/internal-requests-desk/actions/workflows/ci.yml/badge.svg)](https://github.com/mhmdevan/internal-requests-desk/actions/workflows/ci.yml)
![Python](https://img.shields.io/badge/Python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688)
![React](https://img.shields.io/badge/React-18-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tests](https://img.shields.io/badge/tests-pytest%20%2B%20vitest-brightgreen)

A small full-stack internal request tracking app built as a test assignment with FastAPI, React, TypeScript, SQLite, and clean backend-side filtering, sorting, and pagination.

## ✨ Overview

Internal Requests Desk lets a team track lightweight internal requests from creation to completion. Users can:

- Create internal requests/tickets.
- List requests in a paginated table.
- Search by title and description.
- Filter by status and priority.
- Sort by created date or priority.
- Change request status.
- Log in as the default admin.
- Delete non-completed tickets as admin.
- Rely on backend-enforced business rules and clear HTTP errors.

## 🧰 Tech Stack

| Area                     | Technologies                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| Backend                  | Python 3.12, FastAPI, SQLModel, SQLite, PyJWT, pytest, httpx, Ruff                           |
| Frontend                 | React, TypeScript, Vite, TanStack Query, React Hook Form, Zod, Vitest, React Testing Library |
| Infrastructure / tooling | Docker Compose, GitHub Actions, ESLint, Prettier                                             |

## 🏗️ Architecture

```text
internal-requests-desk/
├── backend/
│   ├── app/
│   └── tests/
├── frontend/
│   └── src/
├── docker-compose.yml
└── .github/workflows/ci.yml
```

### Backend

- Routers are intentionally thin.
- The service layer owns business rules.
- The repository layer owns database querying.
- API schemas are separated from persistence models.
- FastAPI dependency injection is used for DB sessions and admin auth.
- Search, filtering, sorting, and pagination are performed by the backend.

### Frontend

- Feature-based structure keeps auth and tickets isolated.
- TanStack Query owns server state and cache invalidation.
- React Hook Form + Zod handle ticket form validation.
- API and business-rule errors are surfaced clearly to the user.
- Search, filters, sorting, and pagination are sent to the API instead of being applied client-side.

## 📌 Business Rules

- Default admin credentials are `admin` / `admin`.
- Admin authentication is required only for deleting tickets.
- New tickets always start with status `new`.
- Tickets with status `done` cannot be edited.
- Tickets with status `done` cannot be deleted.
- Tickets cannot be moved from `done` back to another status.
- The backend returns meaningful HTTP errors for invalid requests, missing auth, not-found records, and business-rule conflicts.

## 🔌 API Summary

| Method   | Endpoint                   | Description                                      |
| -------- | -------------------------- | ------------------------------------------------ |
| `POST`   | `/api/auth/login`          | Login as admin                                   |
| `GET`    | `/api/auth/me`             | Get current admin                                |
| `POST`   | `/api/tickets`             | Create ticket                                    |
| `GET`    | `/api/tickets`             | List, search, filter, sort, and paginate tickets |
| `PATCH`  | `/api/tickets/{id}/status` | Change ticket status                             |
| `DELETE` | `/api/tickets/{id}`        | Delete ticket as admin                           |

## 🚀 Getting Started

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

Backend URL: [http://localhost:8000](http://localhost:8000)

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

Frontend URL: [http://localhost:5173](http://localhost:5173)

## 🐳 Docker Compose

```bash
docker compose up --build
```

Docker Compose is provided as a local review environment for the assignment, not as a production deployment setup. The frontend container runs the Vite dev server so reviewers can quickly open the app at [http://localhost:5173](http://localhost:5173).

## ✅ Running Tests

### Backend

```bash
cd backend
pytest
ruff check .
ruff format --check .
```

### Frontend

```bash
cd frontend
npm run lint
npm test -- --run
npm run build
```

## 🔐 Admin Credentials

```text
Username: admin
Password: admin
```

Authentication is intentionally simple for the assignment. There is no registration and no role model beyond the default admin.

## 📝 Implementation Notes

- Authentication is intentionally minimal and based on a simple JWT issued to the default admin.
- SQLite is used because it matches the assignment requirements and keeps local setup fast.
- Backend-side filtering, search, sorting, and pagination are implemented to avoid frontend-only data manipulation.
- The UI is intentionally simple and readable because visual design is not the evaluation focus.
- The project avoids unnecessary enterprise complexity such as microservices, Redux, WebSockets, registration, or role management.

## 🎯 What Was Prioritized

- Correctness.
- Readable architecture.
- Meaningful tests.
- Backend-enforced business rules.
- Reviewer-friendly setup.
- Simple local execution.
