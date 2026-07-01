import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as authApi from "../features/auth/api";
import * as ticketApi from "../features/tickets/api";
import { TOKEN_STORAGE_KEY } from "../shared/api/http";
import { i18next, LANGUAGE_STORAGE_KEY } from "../shared/i18n";
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

beforeEach(async () => {
  vi.clearAllMocks();
  window.localStorage.clear();
  await i18next.changeLanguage("ru");
  fetchTicketsMock.mockResolvedValue({
    items: [],
    total: 0,
    page: 1,
    page_size: 10,
    pages: 0,
  });
});

describe("App", () => {
  it("renders the ticket dashboard without login", async () => {
    render(<App />);

    expect(await screen.findByText("Панель заявок")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Вход администратора" })).toBeInTheDocument();
  });

  it("opens admin login modal and stores the token after login", async () => {
    const user = userEvent.setup();
    loginAdminMock.mockResolvedValue({ access_token: "test-token", token_type: "bearer" });

    render(<App />);

    await user.click(screen.getByRole("button", { name: "Вход администратора" }));
    await user.type(await screen.findByLabelText("Пароль"), "admin");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    await waitFor(() => {
      expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBe("test-token");
    });
    expect(screen.getByRole("button", { name: "Выйти" })).toBeInTheDocument();
  });

  it("renders the theme toggle", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByTestId("theme-toggle"));

    await waitFor(() => {
      expect(window.localStorage.getItem("internal_requests_theme")).toBe("dark");
    });
  });

  it("renders Russian by default and switches to English", async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(await screen.findByText("Учёт внутренних заявок")).toBeInTheDocument();
    expect(screen.getByTestId("language-switcher")).toBeInTheDocument();

    await user.click(screen.getByText("EN"));

    expect(await screen.findByText("Internal request tracking")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Admin login" })).toBeInTheDocument();
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en");
  });
});
