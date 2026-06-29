import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as ticketApi from "./api";
import { TicketPage } from "./TicketPage";
import { Ticket, TicketListResponse } from "./types";

vi.mock("./api", () => ({
  fetchTickets: vi.fn(),
  createTicket: vi.fn(),
  changeTicketStatus: vi.fn(),
  deleteTicket: vi.fn(),
}));

const fetchTicketsMock = vi.mocked(ticketApi.fetchTickets);
const createTicketMock = vi.mocked(ticketApi.createTicket);
const changeTicketStatusMock = vi.mocked(ticketApi.changeTicketStatus);

function ticket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 1,
    title: "Reset VPN",
    description: "VPN access stopped working.",
    status: "new",
    priority: "normal",
    created_at: "2026-06-29T10:00:00Z",
    updated_at: "2026-06-29T10:00:00Z",
    ...overrides,
  };
}

function response(items: Ticket[] = []): TicketListResponse {
  return {
    items,
    total: items.length,
    page: 1,
    page_size: 10,
    pages: items.length > 0 ? 1 : 0,
  };
}

function renderWithClient(children: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
}

function renderPage(isAdmin = false) {
  return renderWithClient(<TicketPage isAdmin={isAdmin} />);
}

beforeEach(() => {
  vi.clearAllMocks();
  fetchTicketsMock.mockResolvedValue(response());
});

describe("TicketPage", () => {
  it("renders the empty state", async () => {
    renderPage();

    expect(await screen.findByText("No tickets found.")).toBeInTheDocument();
  });

  it("renders the loading state", async () => {
    let resolveRequest: (value: TicketListResponse) => void = () => undefined;
    fetchTicketsMock.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );

    renderPage();

    expect(screen.getByRole("status")).toHaveTextContent("Loading tickets...");
    resolveRequest(response());
    expect(await screen.findByText("No tickets found.")).toBeInTheDocument();
  });

  it("renders API errors", async () => {
    fetchTicketsMock.mockRejectedValue(new Error("Backend is unavailable"));

    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent("Backend is unavailable");
  });

  it("validates the create ticket form", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Create ticket" }));

    expect(await screen.findByText("Title must be at least 3 characters.")).toBeInTheDocument();
    expect(createTicketMock).not.toHaveBeenCalled();
  });

  it("updates query state from the search input", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("Search tickets"), "vpn");

    await waitFor(() => {
      expect(fetchTicketsMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          q: "vpn",
          page: 1,
          page_size: 10,
        }),
      );
    });
  });

  it("calls the backend API with filter query params", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(screen.getByLabelText("Status"), "done");
    await user.selectOptions(screen.getByLabelText("Priority"), "high");

    await waitFor(() => {
      expect(fetchTicketsMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          status: "done",
          priority: "high",
        }),
      );
    });
  });

  it("triggers a status change mutation", async () => {
    const user = userEvent.setup();
    fetchTicketsMock.mockResolvedValue(response([ticket()]));
    changeTicketStatusMock.mockResolvedValue(ticket({ status: "in_progress" }));

    renderPage();

    await screen.findByText("Reset VPN");
    await user.selectOptions(screen.getByLabelText("Status for Reset VPN"), "in_progress");

    expect(changeTicketStatusMock.mock.calls[0][0]).toEqual({
      ticketId: 1,
      status: "in_progress",
    });
  });

  it("does not show delete controls to non-admin users", async () => {
    fetchTicketsMock.mockResolvedValue(response([ticket()]));

    renderPage(false);

    await screen.findByText("Reset VPN");
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });

  it("disables delete for done tickets", async () => {
    fetchTicketsMock.mockResolvedValue(response([ticket({ title: "Completed", status: "done" })]));

    renderPage(true);

    expect(await screen.findByRole("button", { name: "Delete Completed" })).toBeDisabled();
  });

  it("disables status changes for done tickets", async () => {
    fetchTicketsMock.mockResolvedValue(response([ticket({ title: "Completed", status: "done" })]));

    renderPage(true);

    expect(await screen.findByLabelText("Status for Completed")).toBeDisabled();
  });
});
