# Internal Requests Desk Backend

FastAPI backend for the Internal Requests Desk test assignment.

## Commands

```bash
python -m pip install -e ".[dev]"
uvicorn app.main:app --reload
pytest
ruff check .
ruff format .
```

The API runs at `http://127.0.0.1:8000` by default.

Default admin credentials:

- Username: `admin`
- Password: `admin`
