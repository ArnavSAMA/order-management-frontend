import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import i18n from "@/i18n";

type Language = "ja" | "en";
type Theme = "light" | "dark";

type SettingsState = {
  theme: Theme;
  language: Language;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setLanguage: (l: Language) => void;
  ready: boolean;
};

const SettingsContext = createContext<SettingsState | undefined>(undefined);

const STORAGE_THEME = "om_theme";
const STORAGE_LANG = "om_lang";

function applyThemeToHtml(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [language, setLanguageState] = useState<Language>("ja");
  const [ready, setReady] = useState(false);

  // Load persisted settings once
  useEffect(() => {
    const savedTheme = (localStorage.getItem(STORAGE_THEME) as Theme | null) ?? "light";
    const savedLang = (localStorage.getItem(STORAGE_LANG) as Language | null) ?? "ja";

    setThemeState(savedTheme);
    setLanguageState(savedLang);

    // apply immediately
    applyThemeToHtml(savedTheme);
    i18n.changeLanguage(savedLang);

    setReady(true);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_THEME, t);
    applyThemeToHtml(t);
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    localStorage.setItem(STORAGE_LANG, l);
    i18n.changeLanguage(l);
  };

  const value = useMemo(
    () => ({ theme, language, setTheme, toggleTheme, setLanguage, ready }),
    [theme, language, ready]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
