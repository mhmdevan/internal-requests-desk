import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

import { ThemePreferenceProvider } from "./theme";
import { useThemePreference } from "./themeContext";

type AppProvidersProps = {
  children: ReactNode;
  queryClient?: QueryClient;
};

const theme = createTheme({
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  primaryColor: "indigo",
  defaultRadius: "md",
});

function ProviderStack({ children, queryClient }: AppProvidersProps) {
  const [client] = useState(
    () =>
      queryClient ??
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  const { colorScheme } = useThemePreference();

  return (
    <MantineProvider theme={theme} forceColorScheme={colorScheme}>
      <Notifications position="top-right" />
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </MantineProvider>
  );
}

export function AppProviders({ children, queryClient }: AppProvidersProps) {
  return (
    <ThemePreferenceProvider>
      <ProviderStack queryClient={queryClient}>{children}</ProviderStack>
    </ThemePreferenceProvider>
  );
}
