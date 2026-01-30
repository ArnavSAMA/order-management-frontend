import { useTranslation } from "react-i18next";
import { useSettings } from "@/app/providers/SettingsProvider";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { theme, toggleTheme, language, setLanguage } = useSettings();
  
  // Directly derive darkMode from the theme state
  const darkMode = theme === "dark";

  return (
    <div className="transition-colors duration-500">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {t("settings.title")}
      </h1>

      <div className="mt-6 space-y-4">
        {/* Appearance Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 transition-colors duration-500 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t("settings.appearance")}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {t("settings.darkMode")}
            </span>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 cursor-pointer outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                darkMode ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span className="sr-only">Toggle Dark Mode</span>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                  darkMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Language Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 transition-colors duration-500 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t("settings.language")}
          </p>

          {/* Custom Select Wrapper to prevent out-of-bounds clipping */}
          <div className="relative mt-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-700 outline-none transition-colors focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
            >
              <option value="ja">{t("settings.japanese")}</option>
              <option value="en">{t("settings.english")}</option>
            </select>
            {/* Custom Arrow Icon */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}