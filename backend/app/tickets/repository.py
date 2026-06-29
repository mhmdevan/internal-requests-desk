from sqlalchemy import case, func, or_
from sqlmodel import Session, col, select

from app.tickets.models import Ticket, TicketPriority, TicketStatus
from app.tickets.schemas import SortBy, SortOrder


def create_ticket(session: Session, ticket: Ticket) -> Ticket:
    session.add(ticket)
    session.commit()
    session.refresh(ticket)
    return ticket


def get_ticket(session: Session, ticket_id: int) -> Ticket | None:
    return session.get(Ticket, ticket_id)


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
) -> tuple[list[Ticket], int]:
    conditions = []

    if q:
        search = f"%{q.strip()}%"
        conditions.append(
            or_(col(Ticket.title).ilike(search), col(Ticket.description).ilike(search))
        )

    if status is not None:
        conditions.append(Ticket.status == status)

    if priority is not None:
        conditions.append(Ticket.priority == priority)

    count_statement = select(func.count()).select_from(Ticket)
    statement = select(Ticket)

    for condition in conditions:
        count_statement = count_statement.where(condition)
        statement = statement.where(condition)

    if sort_by == SortBy.priority:
        sort_expression = case(
            (Ticket.priority == TicketPriority.high, 3),
            (Ticket.priority == TicketPriority.normal, 2),
            (Ticket.priority == TicketPriority.low, 1),
            else_=0,
        )
    else:
        sort_expression = Ticket.created_at

    if sort_order == SortOrder.asc:
        statement = statement.order_by(sort_expression.asc(), Ticket.id.asc())
    else:
        statement = statement.order_by(sort_expression.desc(), Ticket.id.desc())

    offset = (page - 1) * page_size
    statement = statement.offset(offset).limit(page_size)

    total = session.exec(count_statement).one()
    items = list(session.exec(statement).all())
    return items, total


def save_ticket(session: Session, ticket: Ticket) -> Ticket:
    session.add(ticket)
    session.commit()
    session.refresh(ticket)
    return ticket


def delete_ticket(session: Session, ticket: Ticket) -> None:
    session.delete(ticket)
    session.commit()
