# Internal Requests Desk

A small internal ticket/request tracker built as a production-quality test assignment. It keeps the architecture explicit and easy to review without turning the project into an enterprise framework demo.

## Tech stack

- Backend: Python 3.12+, FastAPI, SQLModel, SQLite, Pydantic, PyJWT
- Backend tests/tooling: pytest, httpx, Ruff
- Frontend: React, TypeScript, Vite
- Frontend state/forms/tests: TanStack Query, React Hook Form, Zod, Vitest, React Testing Library
- Styling: plain CSS
- Optional local orchestration: Docker Compose

## Architecture overview

```text
backend/
  app/
    core/       config, JWT helpers, app errors
    db/         SQLModel engine/session and table creation
    auth/       login schemas, service, router
    tickets/    table model, API schemas, repository, service, router
  tests/        isolated SQLite API tests

frontend/
  src/
    app/        root app and React Query provider
    shared/     API helper and small reusable UI controls
    features/
      auth/     admin login and token storage
      tickets/  ticket API, hooks, forms, filters, table, pagination
```

Backend route handlers stay thin. Ticket business rules live in the service layer, and database querying lives in the repository layer. The frontend sends search, filters, sorting, and pagination to the backend instead of doing list operations locally.

## Business rules

- Default admin credentials are `admin` / `admin`.
- Admin authentication is required only for deleting tickets.
- Done tickets cannot be edited or deleted.
- A ticket cannot move from `done` back to another status.
- Business-rule violations return clear `409 Conflict` responses.
- Missing or invalid authentication returns `401`; non-admin tokens return `403`.

## Backend setup

```bash
cd backend
python -m pip install -e ".[dev]"
uvicorn app.main:app --reload
```

Backend API: `http://127.0.0.1:8000`

Backend quality gates:

```bash
cd backend
pytest
ruff check .
ruff format .
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend app: `http://127.0.0.1:5173`

Frontend quality gates:

```bash
cd frontend
npm test
npm run build
npm run lint
```

The frontend defaults to `http://127.0.0.1:8000/api`. Override it with `VITE_API_BASE_URL` if needed.

## Docker Compose

```bash
docker compose up --build
```

Then open `http://127.0.0.1:5173`.

## API summary

- `POST /api/auth/login` - returns a JWT for `admin` / `admin`
- `GET /api/auth/me` - returns the current admin user for a valid token
- `POST /api/tickets` - creates a ticket
- `GET /api/tickets` - paginated list with `q`, `status`, `priority`, `sort_by`, `sort_order`, `page`, and `page_size`
- `PATCH /api/tickets/{ticket_id}/status` - changes ticket status
- `DELETE /api/tickets/{ticket_id}` - deletes a non-done ticket with admin auth

## Intentional simplifications

- No registration or roles beyond the default admin.
- JWT secret and SQLite are simple local defaults suitable for a test assignment.
- Admin token is stored in `localStorage` to keep the review flow straightforward.
- Styling is plain CSS with a compact, work-focused UI.
- No WebSockets, Redux, background workers, or microservices.
