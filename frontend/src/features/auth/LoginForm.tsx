import { useMutation } from "@tanstack/react-query";
import { Button, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import { getErrorMessage } from "../../shared/api/http";
import { loginAdmin } from "./api";

type LoginFormProps = {
  onLogin: (token: string) => void;
  onSuccess?: () => void;
};

export function LoginForm({ onLogin, onSuccess }: LoginFormProps) {
  const { t } = useTranslation();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const loginMutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: (response) => {
      onLogin(response.access_token);
      notifications.show({
        color: "green",
        title: t("auth.success"),
        message: t("auth.loggedIn"),
      });
      onSuccess?.();
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: t("auth.error"),
        message: getErrorMessage(error),
      });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loginMutation.mutate({ username, password });
  }

  return (
    <form onSubmit={handleSubmit} aria-label={t("auth.adminLogin")}>
      <Stack gap="md">
        <TextInput
          label={t("auth.username")}
          name="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          placeholder={t("auth.usernamePlaceholder")}
          data-testid="admin-username"
        />
        <TextInput
          label={t("auth.password")}
          name="password"
          type="password"
          aria-label={t("auth.password")}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          placeholder={t("auth.passwordPlaceholder")}
          data-testid="admin-password"
        />
        <Button type="submit" loading={loginMutation.isPending} fullWidth>
          {t("auth.login")}
        </Button>
      </Stack>
    </form>
  );
}
