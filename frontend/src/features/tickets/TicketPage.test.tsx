import { QueryClient } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppProviders } from "../../app/providers";
import { i18next } from "../../shared/i18n";
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

function renderWithProviders(children: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<AppProviders queryClient={queryClient}>{children}</AppProviders>);
}

function renderPage(isAdmin = false) {
  return renderWithProviders(<TicketPage isAdmin={isAdmin} />);
}

beforeEach(async () => {
  vi.clearAllMocks();
  window.localStorage.clear();
  await i18next.changeLanguage("ru");
  fetchTicketsMock.mockResolvedValue(response());
});

describe("TicketPage", () => {
  it("renders the empty state", async () => {
    renderPage();

    expect(await screen.findByText("Заявки не найдены")).toBeInTheDocument();
  });

  it("renders the loading state", async () => {
    let resolveRequest: (value: TicketListResponse) => void = () => undefined;
    fetchTicketsMock.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );

    renderPage();

    expect(screen.getByRole("status", { name: "Загружаем заявки..." })).toBeInTheDocument();
    resolveRequest(response());
    expect(await screen.findByText("Заявки не найдены")).toBeInTheDocument();
  });

  it("renders API errors", async () => {
    fetchTicketsMock.mockRejectedValue(new Error("Backend is unavailable"));

    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent("Backend is unavailable");
  });

  it("validates the create ticket form", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Создать" }));

    expect(
      await screen.findByText("Название должно быть не короче 3 символов."),
    ).toBeInTheDocument();
    expect(createTicketMock).not.toHaveBeenCalled();
  });

  it("updates query state from the search input", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByTestId("ticket-search"), "vpn");

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

    await user.selectOptions(screen.getByTestId("status-filter"), "done");
    await user.selectOptions(screen.getByTestId("priority-filter"), "high");

    await waitFor(() => {
      expect(fetchTicketsMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          status: "done",
          priority: "high",
        }),
      );
    });
  });

  it("calls the backend API with sort query params", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(screen.getByTestId("sort-by"), "priority");
    await user.selectOptions(screen.getByTestId("sort-order"), "asc");

    await waitFor(() => {
      expect(fetchTicketsMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          sort_by: "priority",
          sort_order: "asc",
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
    await user.click(screen.getByTestId("status-menu-Reset VPN"));
    await user.click(await screen.findByTestId("status-option-Reset VPN-in_progress"));

    expect(changeTicketStatusMock.mock.calls[0][0]).toEqual({
      ticketId: 1,
      status: "in_progress",
    });
  });

  it("does not allow delete for non-admin users", async () => {
    const user = userEvent.setup();
    fetchTicketsMock.mockResolvedValue(response([ticket()]));

    renderPage(false);

    await screen.findByText("Reset VPN");
    await user.click(screen.getByTestId("ticket-actions-Reset VPN"));
    expect(await screen.findByTestId("delete-action-Reset VPN")).toHaveAttribute("data-disabled");
  });

  it("shows delete action to admins for non-done tickets", async () => {
    const user = userEvent.setup();
    fetchTicketsMock.mockResolvedValue(response([ticket()]));

    renderPage(true);

    await screen.findByText("Reset VPN");
    await user.click(screen.getByTestId("ticket-actions-Reset VPN"));
    expect(await screen.findByTestId("delete-action-Reset VPN")).not.toHaveAttribute(
      "data-disabled",
    );
  });

  it("disables delete for done tickets", async () => {
    const user = userEvent.setup();
    fetchTicketsMock.mockResolvedValue(response([ticket({ title: "Completed", status: "done" })]));

    renderPage(true);

    await screen.findByText("Completed");
    await user.click(screen.getByTestId("ticket-actions-Completed"));
    expect(await screen.findByTestId("delete-action-Completed")).toHaveAttribute("data-disabled");
  });

  it("disables status changes for done tickets", async () => {
    fetchTicketsMock.mockResolvedValue(response([ticket({ title: "Completed", status: "done" })]));

    renderPage(true);

    expect(await screen.findByTestId("status-menu-Completed")).toBeDisabled();
  });
});
