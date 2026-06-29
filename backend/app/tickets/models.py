from datetime import UTC, datetime
from enum import StrEnum

from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(UTC)


class TicketStatus(StrEnum):
    new = "new"
    in_progress = "in_progress"
    done = "done"


class TicketPriority(StrEnum):
    low = "low"
    normal = "normal"
    high = "high"


class Ticket(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(min_length=3, max_length=120, index=True)
    description: str | None = Field(default=None, max_length=1000)
    status: TicketStatus = Field(default=TicketStatus.new, index=True)
    priority: TicketPriority = Field(default=TicketPriority.normal, index=True)
    created_at: datetime = Field(default_factory=utc_now, index=True)
    updated_at: datetime = Field(default_factory=utc_now, index=True)
