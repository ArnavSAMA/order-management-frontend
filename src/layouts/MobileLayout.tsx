// src/layouts/MobileLayout.tsx
import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";

function MobileNavItem({
  to,
  label,
  onClick,
  end,
}: {
  to: string;
  label: string;
  onClick: () => void;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "block rounded-xl px-4 py-3 text-base font-medium transition-all duration-300",
          isActive
            ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export default function MobileLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const role = user?.role ?? "unknown";
  const isClerk = role === "clerk";

  // Using translation keys correctly as defined in your ja.json/en.json
  const roleLabel = useMemo(() => {
    return t(`roles.${role}`, { defaultValue: t("roles.unknown") });
  }, [role, t]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMenu = () => setIsMenuOpen(false);

  // Close menu when route changes (e.g., clicking a link or back button)
  useEffect(() => {
    closeMenu();
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-500 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white transition-colors duration-500 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMenuOpen((v) => !v)}
                className="cursor-pointer rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                aria-expanded={isMenuOpen}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              <div>
                <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {t("app.title")}
                </h1>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {t("app.role")}:{" "}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {roleLabel}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer rounded-lg border border-red-600 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-500 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
            >
              {t("app.logout")}
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        <div 
          className={`absolute left-0 top-full z-50 w-full border-b border-gray-200 bg-white shadow-xl transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 ${
            isMenuOpen ? "translate-y-0 opacity-100 visible" : "-translate-y-2 opacity-0 invisible"
          }`}
        >
          <nav className="space-y-2 p-4">
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {t("app.menu")}
            </p>

            {/* end={false} allows parent /orders to stay active when viewing details */}
            <MobileNavItem to="/orders" label={t("app.orders")} onClick={closeMenu} end />

            {isClerk && (
              <MobileNavItem to="/orders/new" label={t("app.newOrder")} onClick={closeMenu} end />
            )}

            <MobileNavItem to="/settings" label={t("app.settings")} onClick={closeMenu} end />
          </nav>
        </div>
      </header>

      {/* Overlay Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Page Content */}
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 transition-colors duration-500 dark:border-gray-800 dark:bg-gray-900">
          <Outlet />
        </div>
      </main>
    </div>
  );
}