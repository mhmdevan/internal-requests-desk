import {
  ActionIcon,
  Badge,
  Button,
  Container,
  Group,
  Modal,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconLogin2, IconLogout, IconMoon, IconSun } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { LoginForm } from "../features/auth/LoginForm";
import { useAuthStore } from "../features/auth/authStore";
import { TicketPage } from "../features/tickets/TicketPage";
import { persistLanguage, SupportedLanguage } from "../shared/i18n";
import { AppProviders } from "./providers";
import { useThemePreference } from "./themeContext";

function Desk() {
  const { t, i18n } = useTranslation();
  const { colorScheme, toggleColorScheme } = useThemePreference();
  const { token, login, logout } = useAuthStore();
  const [loginOpened, setLoginOpened] = useState(false);
  const isAdmin = Boolean(token);

  function handleLogout() {
    logout();
    notifications.show({
      color: "blue",
      title: t("auth.logout"),
      message: t("auth.logoutSuccess"),
    });
  }

  function handleLanguageChange(language: string) {
    const nextLanguage = language as SupportedLanguage;
    persistLanguage(nextLanguage);
    void i18n.changeLanguage(nextLanguage);
  }

  return (
    <div className="app-root">
      <div className="animated-background" aria-hidden />
      <Container size="xl" py={{ base: "sm", sm: "md" }} className="app-container">
        <Stack gap="md">
          <Paper component="header" withBorder shadow="sm" radius="lg" p="sm" className="topbar">
            <Group justify="space-between" align="center" gap="md">
              <div>
                <Group gap="sm">
                  <Title order={1} size="h3">
                    {t("app.title")}
                  </Title>
                  {isAdmin ? (
                    <Badge color="green" variant="light">
                      {t("auth.loggedIn")}
                    </Badge>
                  ) : null}
                </Group>
                <Text c="dimmed" size="sm">
                  {t("app.subtitle")}
                </Text>
              </div>

              <Group gap="xs" justify="flex-end">
                <SegmentedControl
                  aria-label={t("language.label")}
                  value={i18n.language}
                  onChange={handleLanguageChange}
                  size="xs"
                  data={[
                    { label: t("language.ru"), value: "ru" },
                    { label: t("language.en"), value: "en" },
                  ]}
                  data-testid="language-switcher"
                />
                <ActionIcon
                  variant="light"
                  size="lg"
                  aria-label={t("theme.toggle")}
                  onClick={toggleColorScheme}
                  data-testid="theme-toggle"
                >
                  {colorScheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
                </ActionIcon>
                {isAdmin ? (
                  <Button
                    type="button"
                    variant="light"
                    color="red"
                    leftSection={<IconLogout size={18} />}
                    onClick={handleLogout}
                  >
                    {t("auth.logout")}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    leftSection={<IconLogin2 size={18} />}
                    onClick={() => setLoginOpened(true)}
                  >
                    {t("auth.adminLogin")}
                  </Button>
                )}
              </Group>
            </Group>
          </Paper>

          <TicketPage isAdmin={isAdmin} />
        </Stack>
      </Container>

      <Modal
        opened={loginOpened}
        onClose={() => setLoginOpened(false)}
        title={t("auth.adminLogin")}
        centered
      >
        <LoginForm onLogin={login} onSuccess={() => setLoginOpened(false)} />
      </Modal>
    </div>
  );
}

export function App() {
  return (
    <AppProviders>
      <Desk />
    </AppProviders>
  );
}
