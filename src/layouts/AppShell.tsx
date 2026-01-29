import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";

function Tab({
  to,
  label,
}: {
  to: string;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/orders"}
      className={({ isActive }) =>
        [
          "flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition",
          isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const role = user?.role ?? "unknown";
  const isClerk = user?.role === "clerk";  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-gray-900">Order Management</h1>
              <p className="text-xs text-gray-500">
                Role: <span className="font-medium text-gray-900">{role}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-red-700 bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-7xl px-4 py-4 pb-24">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <Outlet />
        </div>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white">
        <div
          className={[
            "mx-auto flex max-w-7xl items-center gap-2 px-3 py-2",
            isClerk ? "justify-around" : "justify-center",
          ].join(" ")}
        >
          <Tab to="/orders" label="Orders" />

          {/* Clerk only */}
          {isClerk && <Tab to="/orders/new" label="New" />}
        </div>
      </nav>

    </div>
  );
}
