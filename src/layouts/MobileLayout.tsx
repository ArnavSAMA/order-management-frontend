// src/layouts/MobileLayout.tsx
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";

function Tab({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex-1 rounded-xl px-3 py-2 text-center text-sm font-medium transition",
          isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100",
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
  const role = user?.role ?? "unknown";
  const isClerk = role === "clerk";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-gray-900">
                Order Management
              </h1>
              <p className="text-xs text-gray-500">
                Role: <span className="font-medium text-gray-900">{role}</span>
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg border border-red-600 bg-red-100 px-3 py-2 text-xs font-medium text-red-600 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-4 pb-24">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <Outlet />
        </div>
      </main>

      {/* Bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl gap-2 px-3 py-2">
          <Tab to="/orders" label="Orders" />
          {isClerk && <Tab to="/orders/new" label="New" />}
        </div>
      </nav>
    </div>
  );
}
