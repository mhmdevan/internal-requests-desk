from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.tickets.models import Ticket, TicketPriority, TicketStatus


def insert_ticket(
    session: Session,
    *,
    title: str,
    description: str | None = None,
    status: TicketStatus = TicketStatus.new,
    priority: TicketPriority = TicketPriority.normal,
    created_at: datetime | None = None,
) -> Ticket:
    timestamp = created_at or datetime.now(UTC)
    ticket = Ticket(
        title=title,
        description=description,
        status=status,
        priority=priority,
        created_at=timestamp,
        updated_at=timestamp,
    )
    session.add(ticket)
    session.commit()
    session.refresh(ticket)
    return ticket


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_create_valid_ticket(client: TestClient) -> None:
    response = client.post(
        "/api/tickets",
        json={"title": "Replace keyboard", "description": "Space key is unreliable."},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["id"]
    assert body["title"] == "Replace keyboard"
    assert body["description"] == "Space key is unreliable."
    assert body["status"] == "new"
    assert body["priority"] == "normal"
    assert body["created_at"].endswith("+00:00")
    assert body["updated_at"].endswith("+00:00")


def test_create_always_starts_as_new(client: TestClient) -> None:
    response = client.post(
        "/api/tickets",
        json={"title": "Close this later", "status": "done", "priority": "high"},
    )

    assert response.status_code == 201
    assert response.json()["status"] == "new"


def test_create_rejects_short_title(client: TestClient) -> None:
    response = client.post("/api/tickets", json={"title": "No"})

    assert response.status_code == 422


def test_create_rejects_long_title(client: TestClient) -> None:
    response = client.post("/api/tickets", json={"title": "x" * 121})

    assert response.status_code == 422


def test_create_rejects_long_description(client: TestClient) -> None:
    response = client.post("/api/tickets", json={"title": "Valid title", "description": "x" * 1001})

    assert response.status_code == 422


def test_list_tickets(client: TestClient, db_session: Session) -> None:
    insert_ticket(db_session, title="First request")
    insert_ticket(db_session, title="Second request")

    response = client.get("/api/tickets")

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 2
    assert len(body["items"]) == 2


def test_filter_by_status(client: TestClient, db_session: Session) -> None:
    insert_ticket(db_session, title="Open request", status=TicketStatus.new)
    insert_ticket(db_session, title="Closed request", status=TicketStatus.done)

    response = client.get("/api/tickets", params={"status": "done"})

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["title"] == "Closed request"


def test_filter_by_priority(client: TestClient, db_session: Session) -> None:
    insert_ticket(db_session, title="Normal request", priority=TicketPriority.normal)
    insert_ticket(db_session, title="High request", priority=TicketPriority.high)

    response = client.get("/api/tickets", params={"priority": "high"})

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["title"] == "High request"


def test_search_by_title(client: TestClient, db_session: Session) -> None:
    insert_ticket(db_session, title="Payroll export is broken")
    insert_ticket(db_session, title="VPN credentials")

    response = client.get("/api/tickets", params={"q": "payroll"})

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["title"] == "Payroll export is broken"


def test_search_by_description(client: TestClient, db_session: Session) -> None:
    insert_ticket(db_session, title="Printer", description="Toner needed on floor five.")
    insert_ticket(db_session, title="Laptop", description="Battery replacement.")

    response = client.get("/api/tickets", params={"q": "toner"})

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["title"] == "Printer"


def test_sort_by_created_at(client: TestClient, db_session: Session) -> None:
    older = datetime.now(UTC) - timedelta(days=1)
    newer = datetime.now(UTC)
    insert_ticket(db_session, title="Older request", created_at=older)
    insert_ticket(db_session, title="Newer request", created_at=newer)

    response = client.get(
        "/api/tickets",
        params={"sort_by": "created_at", "sort_order": "asc"},
    )

    assert response.status_code == 200
    assert [item["title"] for item in response.json()["items"]] == [
        "Older request",
        "Newer request",
    ]


def test_sort_by_priority(client: TestClient, db_session: Session) -> None:
    insert_ticket(db_session, title="Low request", priority=TicketPriority.low)
    insert_ticket(db_session, title="High request", priority=TicketPriority.high)
    insert_ticket(db_session, title="Normal request", priority=TicketPriority.normal)

    response = client.get(
        "/api/tickets",
        params={"sort_by": "priority", "sort_order": "desc"},
    )

    assert response.status_code == 200
    assert [item["priority"] for item in response.json()["items"]] == ["high", "normal", "low"]


def test_pagination_metadata(client: TestClient, db_session: Session) -> None:
    for index in range(12):
        insert_ticket(db_session, title=f"Request {index:02d}")

    response = client.get("/api/tickets", params={"page": 2, "page_size": 5})

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 12
    assert body["page"] == 2
    assert body["page_size"] == 5
    assert body["pages"] == 3
    assert len(body["items"]) == 5


def test_change_status_from_new_to_in_progress(client: TestClient, db_session: Session) -> None:
    ticket = insert_ticket(db_session, title="Access request", status=TicketStatus.new)

    response = client.patch(f"/api/tickets/{ticket.id}/status", json={"status": "in_progress"})

    assert response.status_code == 200
    assert response.json()["status"] == "in_progress"


def test_change_status_from_in_progress_to_done(client: TestClient, db_session: Session) -> None:
    ticket = insert_ticket(db_session, title="Access request", status=TicketStatus.in_progress)

    response = client.patch(f"/api/tickets/{ticket.id}/status", json={"status": "done"})

    assert response.status_code == 200
    assert response.json()["status"] == "done"


def test_rejects_changes_from_done_back_to_another_status(
    client: TestClient,
    db_session: Session,
) -> None:
    ticket = insert_ticket(db_session, title="Completed request", status=TicketStatus.done)

    response = client.patch(f"/api/tickets/{ticket.id}/status", json={"status": "new"})

    assert response.status_code == 409
    assert (
        response.json()["detail"]
        == "Done tickets cannot be edited or moved back to another status."
    )


def test_rejects_delete_without_auth(client: TestClient, db_session: Session) -> None:
    ticket = insert_ticket(db_session, title="Delete me")

    response = client.delete(f"/api/tickets/{ticket.id}")

    assert response.status_code == 401


def test_allows_delete_with_admin_token(
    client: TestClient,
    db_session: Session,
    admin_token: str,
) -> None:
    ticket = insert_ticket(db_session, title="Delete me")

    response = client.delete(f"/api/tickets/{ticket.id}", headers=auth_headers(admin_token))

    assert response.status_code == 204
    assert db_session.get(Ticket, ticket.id) is None


def test_rejects_delete_for_done_ticket(
    client: TestClient,
    db_session: Session,
    admin_token: str,
) -> None:
    ticket = insert_ticket(db_session, title="Completed request", status=TicketStatus.done)

    response = client.delete(f"/api/tickets/{ticket.id}", headers=auth_headers(admin_token))

    assert response.status_code == 409
    assert response.json()["detail"] == "Done tickets cannot be deleted."


def test_returns_404_for_unknown_ticket_id(client: TestClient) -> None:
    response = client.patch("/api/tickets/999/status", json={"status": "in_progress"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Ticket was not found."


def test_updates_updated_at_when_status_changes(client: TestClient, db_session: Session) -> None:
    timestamp = datetime.now(UTC) - timedelta(days=1)
    ticket = insert_ticket(
        db_session,
        title="Needs a fresh timestamp",
        status=TicketStatus.new,
        created_at=timestamp,
    )
    old_updated_at = ticket.updated_at.isoformat()

    response = client.patch(f"/api/tickets/{ticket.id}/status", json={"status": "in_progress"})

    assert response.status_code == 200
    assert response.json()["updated_at"] > old_updated_at
