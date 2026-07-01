import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import { LANGUAGE_STORAGE_KEY, resources } from "./resources";

export { LANGUAGE_STORAGE_KEY };

export type SupportedLanguage = keyof typeof resources;

export const supportedLanguages: SupportedLanguage[] = ["ru", "en"];

function getInitialLanguage(): SupportedLanguage {
  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (storedLanguage === "ru" || storedLanguage === "en") {
    return storedLanguage;
  }

  return "ru";
}

export function persistLanguage(language: SupportedLanguage) {
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}

void i18next.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: "ru",
  interpolation: {
    escapeValue: false,
  },
});

export { i18next };
