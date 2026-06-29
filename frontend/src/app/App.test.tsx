import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";

import * as authApi from "../features/auth/api";
import * as ticketApi from "../features/tickets/api";
import { TOKEN_STORAGE_KEY } from "../shared/api/http";
import { App } from "./App";

vi.mock("../features/auth/api", () => ({
  loginAdmin: vi.fn(),
}));

vi.mock("../features/tickets/api", () => ({
  fetchTickets: vi.fn(),
  createTicket: vi.fn(),
  changeTicketStatus: vi.fn(),
  deleteTicket: vi.fn(),
}));

const loginAdminMock = vi.mocked(authApi.loginAdmin);
const fetchTicketsMock = vi.mocked(ticketApi.fetchTickets);

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  fetchTicketsMock.mockResolvedValue({
    items: [],
    total: 0,
    page: 1,
    page_size: 10,
    pages: 0,
  });
});

it("stores the admin token after login", async () => {
  const user = userEvent.setup();
  loginAdminMock.mockResolvedValue({ access_token: "test-token", token_type: "bearer" });

  render(<App />);

  await user.type(screen.getByLabelText("Password"), "admin");
  await user.click(screen.getByRole("button", { name: "Log in" }));

  await waitFor(() => {
    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBe("test-token");
  });
  expect(screen.getByText("Logged in as admin")).toBeInTheDocument();
});
