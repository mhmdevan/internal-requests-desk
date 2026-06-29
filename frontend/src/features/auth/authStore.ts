import { useState } from "react";

import { TOKEN_STORAGE_KEY } from "../../shared/api/http";

export function getStoredToken(): string | null {
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function saveToken(token: string): void {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function useAuthStore() {
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  return {
    token,
    login(nextToken: string) {
      saveToken(nextToken);
      setToken(nextToken);
    },
    logout() {
      clearToken();
      setToken(null);
    },
  };
}
