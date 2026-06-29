from datetime import UTC, datetime

from sqlmodel import Session

from app.core.errors import ConflictError, NotFoundError
from app.tickets import repository
from app.tickets.models import Ticket, TicketPriority, TicketStatus
from app.tickets.schemas import (
    SortBy,
    SortOrder,
    TicketCreate,
    TicketListResponse,
    TicketRead,
    TicketStatusUpdate,
)


def create_ticket(session: Session, data: TicketCreate) -> Ticket:
    ticket = Ticket(**data.model_dump())
    return repository.create_ticket(session, ticket)


def list_tickets(
    session: Session,
    *,
    q: str | None,
    status: TicketStatus | None,
    priority: TicketPriority | None,
    sort_by: SortBy,
    sort_order: SortOrder,
    page: int,
    page_size: int,
) -> TicketListResponse:
    items, total = repository.list_tickets(
        session,
        q=q,
        status=status,
        priority=priority,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )
    return TicketListResponse(
        items=[TicketRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


def change_ticket_status(
    session: Session,
    *,
    ticket_id: int,
    data: TicketStatusUpdate,
) -> Ticket:
    ticket = repository.get_ticket(session, ticket_id)
    if ticket is None:
        raise NotFoundError("Ticket was not found.")

    if ticket.status == TicketStatus.done:
        raise ConflictError("Done tickets cannot be edited or moved back to another status.")

    ticket.status = data.status
    ticket.updated_at = datetime.now(UTC)
    return repository.save_ticket(session, ticket)


def delete_ticket(session: Session, *, ticket_id: int) -> None:
    ticket = repository.get_ticket(session, ticket_id)
    if ticket is None:
        raise NotFoundError("Ticket was not found.")

    if ticket.status == TicketStatus.done:
        raise ConflictError("Done tickets cannot be deleted.")

    repository.delete_ticket(session, ticket)
