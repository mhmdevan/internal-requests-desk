from datetime import UTC, datetime
from enum import StrEnum

from pydantic import computed_field, field_serializer
from sqlmodel import Field, SQLModel

from app.tickets.models import TicketPriority, TicketStatus


class SortBy(StrEnum):
    created_at = "created_at"
    priority = "priority"


class SortOrder(StrEnum):
    asc = "asc"
    desc = "desc"


class TicketCreate(SQLModel):
    title: str = Field(min_length=3, max_length=120)
    description: str | None = Field(default=None, max_length=1000)
    status: TicketStatus = TicketStatus.new
    priority: TicketPriority = TicketPriority.normal


class TicketStatusUpdate(SQLModel):
    status: TicketStatus


class TicketRead(SQLModel):
    id: int
    title: str
    description: str | None
    status: TicketStatus
    priority: TicketPriority
    created_at: datetime
    updated_at: datetime

    @field_serializer("created_at", "updated_at")
    def serialize_datetime(self, value: datetime) -> str:
        if value.tzinfo is None:
            value = value.replace(tzinfo=UTC)
        return value.isoformat()


class TicketListResponse(SQLModel):
    items: list[TicketRead]
    total: int
    page: int
    page_size: int

    @computed_field
    @property
    def pages(self) -> int:
        if self.total == 0:
            return 0
        return (self.total + self.page_size - 1) // self.page_size
