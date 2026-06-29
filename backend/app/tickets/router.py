from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status
from sqlmodel import Session

from app.auth.schemas import AdminUser
from app.core.security import require_admin
from app.db.session import get_session
from app.tickets import service
from app.tickets.models import TicketPriority, TicketStatus
from app.tickets.schemas import (
    SortBy,
    SortOrder,
    TicketCreate,
    TicketListResponse,
    TicketRead,
    TicketStatusUpdate,
)

router = APIRouter(prefix="/tickets", tags=["tickets"])

SessionDep = Annotated[Session, Depends(get_session)]
AdminDep = Annotated[AdminUser, Depends(require_admin)]


@router.post("", response_model=TicketRead, status_code=status.HTTP_201_CREATED)
def create_ticket(data: TicketCreate, session: SessionDep) -> TicketRead:
    return TicketRead.model_validate(service.create_ticket(session, data))


@router.get("", response_model=TicketListResponse)
def list_tickets(
    session: SessionDep,
    q: Annotated[str | None, Query(max_length=120)] = None,
    status: TicketStatus | None = None,
    priority: TicketPriority | None = None,
    sort_by: SortBy = SortBy.created_at,
    sort_order: SortOrder = SortOrder.desc,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 10,
) -> TicketListResponse:
    return service.list_tickets(
        session,
        q=q,
        status=status,
        priority=priority,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )


@router.patch("/{ticket_id}/status", response_model=TicketRead)
def change_ticket_status(
    ticket_id: int,
    data: TicketStatusUpdate,
    session: SessionDep,
) -> TicketRead:
    return TicketRead.model_validate(
        service.change_ticket_status(session, ticket_id=ticket_id, data=data)
    )


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(
    ticket_id: int,
    session: SessionDep,
    _: AdminDep,
) -> Response:
    service.delete_ticket(session, ticket_id=ticket_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
