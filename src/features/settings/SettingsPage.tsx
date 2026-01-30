import { useTranslation } from "react-i18next";
import { useAppSettings } from "@/app/providers/AppSettingsProvider";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { language, setLanguage, darkMode, setDarkMode } = useAppSettings();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
        {t("settings.title")}
      </h1>

      <div className="mt-8 grid gap-6">
        {/* Language Selection */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-all">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {t("settings.language")}
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="mt-3 w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          >
            <option value="ja">日本語 (Japanese)</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Appearance / Dark Mode */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-all">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {t("settings.theme")}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t("settings.darkMode")}
            </span>

            {/* Custom Animated Toggle Switch */}
            <button
              onClick={() => setDarkMode(!darkMode)}
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
      </div>
    </div>
  );
}