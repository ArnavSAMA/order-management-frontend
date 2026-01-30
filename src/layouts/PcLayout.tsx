// src/layouts/PcLayout.tsx
import { useAuth } from "@/app/providers/AuthProvider";
import { useNavigate, Outlet, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "block rounded-lg px-3 py-2 text-sm font-medium transition",
          isActive
            ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-100",
        ].join(" ")
      }
      end
    >
      {label}
    </NavLink>
  );
}

export default function PcLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t("app.title")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("app.role")}:{" "}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {user ? user.role : "unknown"}
              </span>
            </p>
          </div>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-6 py-6">
        <aside className="col-span-12 md:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Menu
            </p>

            <nav className="space-y-2">
              <NavItem to="/orders" label={t("app.orders")} />

              {user?.role === "clerk" && (
                <NavItem to="/orders/new" label={t("app.newOrder")} />
              )}

              <NavItem to="/settings" label={t("app.settings")} />

              <button
                onClick={handleLogout}
                className="mt-4 w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
              >
                {t("app.logout")}
              </button>
            </nav>
          </div>
        </aside>

        {/* Page Content */}
        <main className="col-span-12 md:col-span-9">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
