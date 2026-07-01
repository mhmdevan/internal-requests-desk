import { ReactNode, useEffect, useMemo, useState } from "react";

import { AppColorScheme, ThemePreferenceContext } from "./themeContext";

const THEME_STORAGE_KEY = "internal_requests_theme";

function getInitialColorScheme(): AppColorScheme {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return "light";
}

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorScheme] = useState<AppColorScheme>(getInitialColorScheme);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, colorScheme);
    document.documentElement.dataset.colorScheme = colorScheme;
  }, [colorScheme]);

  const value = useMemo(
    () => ({
      colorScheme,
      toggleColorScheme: () =>
        setColorScheme((current) => (current === "light" ? "dark" : "light")),
    }),
    [colorScheme],
  );

  return (
    <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>
  );
}
