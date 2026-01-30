// src/layouts/MobileLayout.tsx
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";

function MobileNavItem({
  to,
  label,
  onClick,
}: {
  to: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "block rounded-xl px-4 py-3 text-base font-medium transition",
          isActive
            ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
        ].join(" ")
      }
      end
    >
      {label}
    </NavLink>
  );
}

function BottomTab({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex-1 rounded-xl px-3 py-2 text-center text-sm font-medium transition",
          isActive
            ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
        ].join(" ")
      }
      end
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

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMenu = () => setIsMenuOpen(false);

  // close menu when route changes
  useEffect(() => {
    closeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-950">
      {/* Header */}
      <header className="relative sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMenuOpen((v) => !v)}
                className="cursor-pointer rounded-lg p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
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
                  <span className="font-medium text-gray-900 dark:text-gray-100">{role}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer rounded-lg border border-red-600 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:border-red-500 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
            >
              {t("app.logout")}
            </button>
          </div>
        </div>

        {/* Dropdown + overlay (inside header so z-index is consistent) */}
        {isMenuOpen && (
          <>
            {/* overlay BELOW dropdown */}
            <div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={closeMenu}
            />

            {/* dropdown ABOVE overlay */}
            <div className="absolute left-0 top-full z-50 w-full border-b border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
              <nav className="space-y-2 p-4">
                <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {t("app.menu")}
                </p>

                <MobileNavItem to="/orders" label={t("app.orders")} onClick={closeMenu} />
                {isClerk && (
                  <MobileNavItem to="/orders/new" label={t("app.newOrder")} onClick={closeMenu} />
                )}

                {/* ✅ Settings always visible */}
                <MobileNavItem to="/settings" label={t("app.settings")} onClick={closeMenu} />
              </nav>
            </div>
          </>
        )}
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-6 pb-24">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
