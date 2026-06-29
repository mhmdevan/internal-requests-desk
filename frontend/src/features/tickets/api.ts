import { apiRequest } from "../../shared/api/http";
import { Ticket, TicketListResponse, TicketQueryParams, TicketStatus } from "./types";
import { TicketCreateInput } from "./schemas";

function buildQuery(params: TicketQueryParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
}

export function fetchTickets(params: TicketQueryParams): Promise<TicketListResponse> {
  const query = buildQuery(params);
  return apiRequest<TicketListResponse>(`/tickets?${query}`);
}

export function createTicket(payload: TicketCreateInput): Promise<Ticket> {
  return apiRequest<Ticket>("/tickets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function changeTicketStatus({
  ticketId,
  status,
}: {
  ticketId: number;
  status: TicketStatus;
}): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${ticketId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteTicket(ticketId: number): Promise<void> {
  return apiRequest<void>(`/tickets/${ticketId}`, {
    method: "DELETE",
  });
}
