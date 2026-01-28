import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import StatusBadge from "@/components/common/StatusBadge";
import { useOrders } from "../context/OrdersProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import { useMemo, useRef, useState, useEffect } from "react";
import type { OrderStatus } from "../types";
import { canViewOrder } from "../permissions";

export default function OrderListPage() {
  const { orders } = useOrders();
  const { user } = useAuth();
  const role = user?.role;

  const visibleOrders = orders.filter((o) => canViewOrder(user ?? null, o));

  const [toast, setToast] = useState<null | {
    type: "success" | "error";
    text: string;
  }>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const PAGE_SIZE = 10;

  // init from URL
  const [page, setPage] = useState(() => Number(searchParams.get("page") ?? "1"));
  const [q, setQ] = useState(() => searchParams.get("q") ?? "");
  const [statusFilter, setStatusFilter] = useState<"" | OrderStatus>(
    () => (searchParams.get("status") as any) ?? ""
  );
  const [sortKey, setSortKey] = useState<
    "date_desc" | "date_asc" | "amount_desc" | "amount_asc"
  >(() => (searchParams.get("sort") as any) ?? "date_desc");

    useEffect(() => {
        const nextPage = Number(searchParams.get("page") ?? "1");
        const nextQ = searchParams.get("q") ?? "";
        const nextStatus = (searchParams.get("status") as any) ?? "";
        const nextSort = (searchParams.get("sort") as any) ?? "date_desc";

        if (Number.isFinite(nextPage) && nextPage !== page) setPage(nextPage);
        if (nextQ !== q) setQ(nextQ);
        if (nextStatus !== statusFilter) setStatusFilter(nextStatus);
        if (nextSort !== sortKey) setSortKey(nextSort);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);


  // keep URL synced with list state (page + filters + sort)
  useEffect(() => {
    const next = new URLSearchParams(searchParams);

    next.set("page", String(page));
    next.set("sort", sortKey);

    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");

    if (statusFilter) next.set("status", statusFilter);
    else next.delete("status");

    const nextStr = next.toString();
    const curStr = searchParams.toString();

    // only write if different (prevents loops)
    if (nextStr !== curStr) {
        setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q, statusFilter, sortKey]);


  // toast from navigation state
  useEffect(() => {
    const state = location.state as any;

    if (state?.toast) {
      setToast(state.toast);
      const t = window.setTimeout(() => setToast(null), 2000);

      // clear router state so it doesn't reappear on back
      window.history.replaceState({}, document.title);

      return () => window.clearTimeout(t);
    }
  }, [location.state]);

  const finalOrders = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = visibleOrders;

    if (query) {
      list = list.filter((o) => {
        return (
          o.id.toLowerCase().includes(query) ||
          o.customer.toLowerCase().includes(query) ||
          o.productName.toLowerCase().includes(query) ||
          (o.assignedTo ?? "").toLowerCase().includes(query)
        );
      });
    }

    if (statusFilter) {
      list = list.filter((o) => o.status === statusFilter);
    }

    const byDate = (a: string, b: string) => a.localeCompare(b); // YYYY-MM-DD
    const byAmount = (a: number, b: number) => a - b;

    const sorted = [...list].sort((a, b) => {
      if (sortKey === "date_desc") return byDate(b.orderDate, a.orderDate);
      if (sortKey === "date_asc") return byDate(a.orderDate, b.orderDate);
      if (sortKey === "amount_desc") return byAmount(b.amount, a.amount);
      return byAmount(a.amount, b.amount);
    });

    return sorted;
  }, [visibleOrders, q, statusFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(finalOrders.length / PAGE_SIZE));

  // reset to first page when filters/sort change
  useEffect(() => {
    setPage(1);
  }, [q, statusFilter, sortKey]);

  // clamp page if list shrinks (e.g., delete last item on last page)
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return finalOrders.slice(start, end);
  }, [finalOrders, page]);

  const navigate = useNavigate();
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  rowRefs.current = [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500">{finalOrders.length} total</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Search
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Customer, product, id, staff..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="unchecked">Unchecked</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Sort
          </label>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="date_desc">Date (newest)</option>
            <option value="date_asc">Date (oldest)</option>
            <option value="amount_desc">Amount (high → low)</option>
            <option value="amount_asc">Amount (low → high)</option>
          </select>
        </div>
      </div>

      {toast && (
        <div
          className={[
            "mt-4 rounded-xl border p-3 text-sm",
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700",
          ].join(" ")}
        >
          {toast.text}
        </div>
      )}

      {finalOrders.length === 0 ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          {role === "staff" && visibleOrders.length === 0
            ? "No assigned orders."
            : "No orders match your filters."}
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned</th>
                <th className="px-4 py-3">FAX</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {paginatedOrders.map((order, index) => (
                <tr
                  key={order.id}
                  ref={(el) => {
                    rowRefs.current[index] = el;
                  }}
                  tabIndex={0}
                  onClick={() =>
                    navigate(`/orders/${order.id}`, {
                      state: { from: location.pathname + location.search },
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        navigate(`/orders/${order.id}`, {
                        state: { from: location.pathname + location.search },
                        });
                        return;
                    }

                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      rowRefs.current[
                        Math.min(index + 1, paginatedOrders.length - 1)
                      ]?.focus();
                    }

                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      rowRefs.current[Math.max(index - 1, 0)]?.focus();
                    }
                  }}
                  className="cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {order.customer}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.orderDate}</td>
                  <td className="px-4 py-3 text-gray-700">{order.productName}</td>
                  <td className="px-4 py-3 text-gray-700">{order.quantity}</td>
                  <td className="px-4 py-3 text-gray-700">
                    ¥{order.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {order.assignedTo ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {order.pdfUrl ? (
                      <a
                        href={order.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:underline"
                      >
                        PDF
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={[
                "rounded-lg px-3 py-1",
                page === 1
                  ? "cursor-not-allowed bg-gray-100 text-gray-400"
                  : "bg-white border border-gray-300 hover:bg-gray-50",
              ].join(" ")}
            >
              ← Prev
            </button>

            <span className="text-gray-600">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={[
                "rounded-lg px-3 py-1",
                page === totalPages
                  ? "cursor-not-allowed bg-gray-100 text-gray-400"
                  : "bg-white border border-gray-300 hover:bg-gray-50",
              ].join(" ")}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
