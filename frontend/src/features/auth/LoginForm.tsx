import { useMutation } from "@tanstack/react-query";
import { FormEvent, useState } from "react";

import { getErrorMessage } from "../../shared/api/http";
import { Button } from "../../shared/ui/Button";
import { ErrorMessage } from "../../shared/ui/ErrorMessage";
import { Input } from "../../shared/ui/Input";
import { loginAdmin } from "./api";

type LoginFormProps = {
  token: string | null;
  onLogin: (token: string) => void;
  onLogout: () => void;
};

export function LoginForm({ token, onLogin, onLogout }: LoginFormProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const loginMutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: (response) => onLogin(response.access_token),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loginMutation.mutate({ username, password });
  }

  if (token) {
    return (
      <section className="login-box" aria-label="Admin session">
        <span>Logged in as admin</span>
        <Button type="button" onClick={onLogout}>
          Log out
        </Button>
      </section>
    );
  }

  return (
    <form className="login-box" onSubmit={handleSubmit} aria-label="Admin login">
      <Input
        label="Username"
        name="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        autoComplete="username"
      />
      <Input
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
      />
      <Button type="submit" variant="primary" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? "Logging in..." : "Log in"}
      </Button>
      {loginMutation.isError ? (
        <ErrorMessage message={getErrorMessage(loginMutation.error)} />
      ) : null}
    </form>
  );
}
