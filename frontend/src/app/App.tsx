import { LoginForm } from "../features/auth/LoginForm";
import { useAuthStore } from "../features/auth/authStore";
import { TicketPage } from "../features/tickets/TicketPage";
import { AppProviders } from "./providers";

function Desk() {
  const { token, login, logout } = useAuthStore();

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Internal Requests Desk</h1>
          <p>Track lightweight internal tickets from request to completion.</p>
        </div>
        <LoginForm token={token} onLogin={login} onLogout={logout} />
      </header>
      <TicketPage isAdmin={Boolean(token)} />
    </main>
  );
}

export function App() {
  return (
    <AppProviders>
      <Desk />
    </AppProviders>
  );
}
