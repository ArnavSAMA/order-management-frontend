import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import i18n, { persistLanguage } from "@/i18n";

type Settings = {
  language: "ja" | "en";
  setLanguage: (lang: "ja" | "en") => void;

  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
};

const SettingsContext = createContext<Settings | undefined>(undefined);

const LANG_KEY = "om_lang";
const DARK_KEY = "om_dark";

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<"ja" | "en">(
    () => (localStorage.getItem(LANG_KEY) as any) ?? "ja"
  );

  const [darkMode, setDarkModeState] = useState<boolean>(
    () => localStorage.getItem(DARK_KEY) === "1"
  );

  const setLanguage = (lang: "ja" | "en") => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    persistLanguage(lang);
  };

  const setDarkMode = (v: boolean) => {
    setDarkModeState(v);
    localStorage.setItem(DARK_KEY, v ? "1" : "0");
  };

  // Apply dark mode to <html class="dark">
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (darkMode) {
      root.classList.add("dark");
      // This is vital for v4 to override system preferences
      root.style.setProperty('color-scheme', 'dark');
    } else {
      root.classList.remove("dark");
      root.style.setProperty('color-scheme', 'light');
    }
  }, [darkMode]);
  const value = useMemo(
    () => ({ language, setLanguage, darkMode, setDarkMode }),
    [language, darkMode]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useAppSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useAppSettings must be used inside AppSettingsProvider");
  return ctx;
}
