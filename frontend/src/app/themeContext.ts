import { createContext, useContext } from "react";

export type AppColorScheme = "light" | "dark";

export type ThemePreferenceContextValue = {
  colorScheme: AppColorScheme;
  toggleColorScheme: () => void;
};

export const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

export function useThemePreference() {
  const value = useContext(ThemePreferenceContext);
  if (!value) {
    throw new Error("useThemePreference must be used inside ThemePreferenceProvider");
  }
  return value;
}
