import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useMemo, useRef, useState, useEffect } from "react";
import StatusBadge from "@/components/common/StatusBadge";
import { useOrders } from "../context/OrdersProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import type { OrderStatus } from "../types";
import { canViewOrder } from "../permissions";
import { Filter } from "lucide-react";
import { useTranslation } from "react-i18next";

const STAFF_OPTIONS = ["Taro Tanaka", "Declan", "Hanako Yamada"];

type SortKey =
  | "date_desc"
  | "date_asc"
  | "amount_desc"
  | "amount_asc"
  | "id_asc"
  | "id_desc";

export default function OrderListPage() {
  const { t } = useTranslation();

  const { orders } = useOrders();
  const { user } = useAuth();
  const role = user?.role;
  const isStaff = role === "staff";

  const visibleOrders = orders.filter((o) => canViewOrder(user ?? null, o));

  const [toast, setToast] = useState<null | {
    type: "success" | "error";
    text: string;
  }>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const PAGE_SIZE = 10;

  // init from URL (runs once on mount)
  const [page, setPage] = useState(() => Number(searchParams.get("page") ?? "1"));
  const [q, setQ] = useState(() => searchParams.get("q") ?? "");
  const [statusFilter, setStatusFilter] = useState<"" | OrderStatus>(
    () => (searchParams.get("status") as any) ?? ""
  );
  const [sortKey, setSortKey] = useState<SortKey>(
    () => (searchParams.get("sort") as any) ?? "date_desc"
  );

  const [staffFilter, setStaffFilter] = useState(() => searchParams.get("staff") ?? "");
  const [dateFrom, setDateFrom] = useState(() => searchParams.get("from") ?? "");
  const [dateTo, setDateTo] = useState(() => searchParams.get("to") ?? "");

  // Collapsible filters (mobile)
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Auto-open filters if URL contains filters
  useEffect(() => {
    const hasAny =
      !!(searchParams.get("q") ?? "").trim() ||
      !!(searchParams.get("status") ?? "") ||
      (searchParams.get("sort") ?? "date_desc") !== "date_desc" ||
      !!(searchParams.get("staff") ?? "") ||
      !!(searchParams.get("from") ?? "") ||
      !!(searchParams.get("to") ?? "");
    if (hasAny) setFiltersOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * URL -> State (when back/forward changes querystring)
   */
  useEffect(() => {
    const nextPage = Number(searchParams.get("page") ?? "1");
    const nextQ = searchParams.get("q") ?? "";
    const nextStatus = (searchParams.get("status") as any) ?? "";
    const nextSort = (searchParams.get("sort") as any) ?? "date_desc";
    const nextStaff = searchParams.get("staff") ?? "";
    const nextFrom = searchParams.get("from") ?? "";
    const nextTo = searchParams.get("to") ?? "";

    if (Number.isFinite(nextPage) && nextPage !== page) setPage(nextPage);
    if (nextQ !== q) setQ(nextQ);
    if (nextStatus !== statusFilter) setStatusFilter(nextStatus);
    if (nextSort !== sortKey) setSortKey(nextSort);
    if (nextStaff !== staffFilter) setStaffFilter(nextStaff);
    if (nextFrom !== dateFrom) setDateFrom(nextFrom);
    if (nextTo !== dateTo) setDateTo(nextTo);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  /**
   * State -> URL (keep querystring in sync)
   */
  useEffect(() => {
    const next = new URLSearchParams(searchParams);

    next.set("page", String(page));
    next.set("sort", sortKey);

    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");

    if (statusFilter) next.set("status", statusFilter);
    else next.delete("status");

    if (!isStaff) {
      if (staffFilter) next.set("staff", staffFilter);
      else next.delete("staff");

      if (dateFrom) next.set("from", dateFrom);
      else next.delete("from");

      if (dateTo) next.set("to", dateTo);
      else next.delete("to");
    } else {
      next.delete("staff");
      next.delete("from");
      next.delete("to");
    }

    const nextStr = next.toString();
    const curStr = searchParams.toString();

    if (nextStr !== curStr) {
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q, statusFilter, sortKey, staffFilter, dateFrom, dateTo, isStaff]);

  /**
   * Toast from navigation state
   */
  useEffect(() => {
    const state = location.state as any;
    if (state?.toast) {
      setToast(state.toast);
      const timer = window.setTimeout(() => setToast(null), 2000);
      window.history.replaceState({}, document.title);
      return () => window.clearTimeout(timer);
    }
  }, [location.state]);

  const finalOrders = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = visibleOrders;

    if (!isStaff && staffFilter) {
      list = list.filter((o) => (o.assignedTo ?? "") === staffFilter);
    }

    if (!isStaff) {
      if (dateFrom) list = list.filter((o) => o.orderDate >= dateFrom);
      if (dateTo) list = list.filter((o) => o.orderDate <= dateTo);
    }

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

    if (statusFilter) list = list.filter((o) => o.status === statusFilter);

    const byDate = (a: string, b: string) => a.localeCompare(b);
    const byAmount = (a: number, b: number) => a - b;
    const byId = (a: string, b: string) => Number(a) - Number(b);

    const sorted = [...list].sort((a, b) => {
      if (sortKey === "date_desc") return byDate(b.orderDate, a.orderDate);
      if (sortKey === "date_asc") return byDate(a.orderDate, b.orderDate);

      if (sortKey === "amount_desc") return byAmount(b.amount, a.amount);
      if (sortKey === "amount_asc") return byAmount(a.amount, b.amount);

      if (sortKey === "id_desc") return byId(b.id, a.id);
      if (sortKey === "id_asc") return byId(a.id, b.id);

      return 0;
    });

    return sorted;
  }, [visibleOrders, q, statusFilter, sortKey, staffFilter, dateFrom, dateTo, isStaff]);

  const totalPages = Math.max(1, Math.ceil(finalOrders.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [q, statusFilter, sortKey, staffFilter, dateFrom, dateTo]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return finalOrders.slice(start, start + PAGE_SIZE);
  }, [finalOrders, page]);

  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  rowRefs.current = [];

  const handleClearFilters = () => {
    setQ("");
    setStatusFilter("");
    setSortKey("date_desc");
    setStaffFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const hasAnyFilter =
    !!q.trim() ||
    !!statusFilter ||
    sortKey !== "date_desc" ||
    (!isStaff && (!!staffFilter || !!dateFrom || !!dateTo));

  return (
    <div className="text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("orders.title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {finalOrders.length} {t("orders.total")}
        </p>
      </div>

      {/* Filters header (mobile toggle) */}
      <div className="mt-4 flex items-center justify-between md:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <Filter className="h-4 w-4" />
          <span>{t("filters.title")}</span>
          {hasAnyFilter && (
            <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-bold text-white dark:bg-gray-100 dark:text-gray-900">
              {t("filters.on")}
            </span>
          )}
          <span className={["ml-1 transition-transform", filtersOpen ? "rotate-180" : "rotate-0"].join(" ")}>
            ▼
          </span>
        </button>
      </div>

      {/* Filters panel */}
      <div className={["mt-3", filtersOpen ? "block" : "hidden", "md:block"].join(" ")}>
        <div
          className={[
            "grid gap-3",
            isStaff ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-rows-2 md:grid-cols-3",
          ].join(" ")}
        >
          {/* Search */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t("filters.search")}
            </label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("filters.searchPlaceholder")}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </div>

          {!isStaff && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {t("filters.assigned")}
              </label>
              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">{t("common.all")}</option>
                {STAFF_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t("filters.status")}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="">{t("common.all")}</option>
              <option value="unchecked">{t("status.unchecked")}</option>
              <option value="confirmed">{t("status.confirmed")}</option>
              <option value="processing">{t("status.processing")}</option>
              <option value="completed">{t("status.completed")}</option>
              <option value="cancelled">{t("status.cancelled")}</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t("filters.sort")}
            </label>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="date_desc">{t("sort.date_desc")}</option>
              <option value="date_asc">{t("sort.date_asc")}</option>
              <option value="amount_desc">{t("sort.amount_desc")}</option>
              <option value="amount_asc">{t("sort.amount_asc")}</option>
              <option value="id_asc">{t("sort.id_asc")}</option>
              <option value="id_desc">{t("sort.id_desc")}</option>
            </select>
          </div>

          {!isStaff && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {t("filters.dateFrom")}
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
          )}

          {!isStaff && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {t("filters.dateTo")}
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
          )}
        </div>

        {hasAnyFilter && (
          <div className="mt-4">
            <button
              type="button"
              onClick={handleClearFilters}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              {t("filters.clear")}
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={[
            "mt-4 rounded-xl border p-3 text-sm",
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-200"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200",
          ].join(" ")}
        >
          {toast.text}
        </div>
      )}

      {/* Empty state */}
      {finalOrders.length === 0 ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
          {role === "staff" && visibleOrders.length === 0 ? t("orders.noneAssigned") : t("orders.noneMatch")}
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="mt-4 space-y-3 md:hidden">
            {paginatedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onOpen={() =>
                  navigate(`/orders/${order.id}`, {
                    state: { from: location.pathname + location.search },
                  })
                }
              />
            ))}
          </div>

          {/* Desktop table */}
          <div className="mt-4 hidden overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">{t("orders.table.customer")}</th>
                  <th className="px-4 py-3">{t("orders.table.date")}</th>
                  <th className="px-4 py-3">{t("orders.table.product")}</th>
                  <th className="px-4 py-3">{t("orders.table.qty")}</th>
                  <th className="px-4 py-3">{t("orders.table.amount")}</th>
                  <th className="px-4 py-3">{t("orders.table.status")}</th>
                  <th className="px-4 py-3">{t("orders.table.assigned")}</th>
                  <th className="px-4 py-3">{t("orders.table.fax")}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
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
                        rowRefs.current[Math.min(index + 1, paginatedOrders.length - 1)]?.focus();
                      }
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        rowRefs.current[Math.max(index - 1, 0)]?.focus();
                      }
                    }}
                    className="cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:hover:bg-gray-800 dark:focus:ring-gray-700"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{order.customer}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{order.orderDate}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{order.productName}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{order.quantity}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                      ¥{order.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{order.assignedTo ?? "—"}</td>
                    <td className="px-4 py-3">
                      {order.pdfUrl ? (
                        <a
                          href={order.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          PDF
                        </a>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={[
                "rounded-lg px-3 py-1",
                page === 1
                  ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800",
              ].join(" ")}
            >
              {t("pagination.prev")}
            </button>

            <span className="text-gray-600 dark:text-gray-300">
              {t("pagination.page")}{" "}
              <strong className="text-gray-900 dark:text-gray-100">{page}</strong>{" "}
              {t("pagination.of")}{" "}
              <strong className="text-gray-900 dark:text-gray-100">{totalPages}</strong>
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={[
                "rounded-lg px-3 py-1",
                page === totalPages
                  ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800",
              ].join(" ")}
            >
              {t("pagination.next")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function OrderCard({ order, onOpen }: { order: any; onOpen: () => void }) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{order.customer}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            #{order.id} • {order.orderDate}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-3 text-sm text-gray-700 dark:text-gray-200">
        <p>
          <span className="font-medium">{t("orders.card.product")}:</span> {order.productName}
        </p>
        <p className="mt-1">
          <span className="font-medium">{t("orders.card.qty")}:</span> {order.quantity} •{" "}
          <span className="font-medium">{t("orders.card.amount")}:</span> ¥{order.amount.toLocaleString()}
        </p>
        <p className="mt-1">
          <span className="font-medium">{t("orders.card.assigned")}:</span> {order.assignedTo ?? "—"}
        </p>
      </div>

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        {order.pdfUrl ? t("orders.card.faxAttached") : t("orders.card.faxNone")}
      </div>
    </button>
  );
}
