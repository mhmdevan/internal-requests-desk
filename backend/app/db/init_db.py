from sqlmodel import SQLModel

from app.db.session import engine
from app.tickets.models import Ticket  # noqa: F401


def init_db() -> None:
    SQLModel.metadata.create_all(engine)
