import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import StatusBadge from "@/components/common/StatusBadge";
import { useOrders } from "../context/OrdersProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import type { OrderStatus } from "../types";
import { nowYMDHMS } from "@/lib/datetime";
import {
  canEditAll,
  canEditStatus,
  canDeleteOrder,
  canViewOrder,
} from "../permissions";

const STAFF_OPTIONS = ["Taro Tanaka", "Declan", "Hanako Yamada"];

export default function OrderDetailPage() {
  const { t } = useTranslation();

  const [toast, setToast] = useState<null | {
    type: "success" | "error";
    text: string;
  }>(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const from = (location.state as any)?.from as string | undefined;

  const { orders, updateOrder, deleteOrder } = useOrders();
  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);

  // If user can't view, treat as not found
  const canView = order ? canViewOrder(user ?? null, order) : false;

  if (!order || !canView) {
    return (
      <div className="text-gray-900 dark:text-gray-100">
        <h1 className="text-xl font-semibold">{t("orderDetail.notFoundTitle")}</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {t("orderDetail.notFoundBody", { id })}
        </p>

        <button
          type="button"
          onClick={() => {
            if (from) navigate(from);
            else navigate("/orders");
          }}
          className="mt-4 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          {t("common.backToOrders")}
        </button>
      </div>
    );
  }

  // Permissions
  const canEditAllFlag = canEditAll(user ?? null);
  const canEditStatusFlag = canEditStatus(user ?? null, order);
  const canDeleteFlag = canDeleteOrder(user ?? null);

  // Local editable state
  const [customer, setCustomer] = useState(order.customer);
  const [orderDate, setOrderDate] = useState(order.orderDate);
  const [productName, setProductName] = useState(order.productName);
  const [quantity, setQuantity] = useState(String(order.quantity));
  const [amount, setAmount] = useState(String(order.amount));
  const [assignedTo, setAssignedTo] = useState(order.assignedTo ?? "");
  const [status, setStatus] = useState<OrderStatus>(order.status);

  // Keep local state updated if order changes in store
  useEffect(() => setStatus(order.status), [order.status]);
  useEffect(() => setQuantity(String(order.quantity)), [order.quantity]);
  useEffect(() => setAmount(String(order.amount)), [order.amount]);
  useEffect(() => {
    setCustomer(order.customer);
    setOrderDate(order.orderDate);
    setProductName(order.productName);
    setAssignedTo(order.assignedTo ?? "");
  }, [order.customer, order.orderDate, order.productName, order.assignedTo]);

  const isDirty = canEditAllFlag
    ? customer.trim() !== order.customer ||
      orderDate !== order.orderDate ||
      productName.trim() !== order.productName ||
      Number(quantity) !== order.quantity ||
      Number(amount) !== order.amount ||
      (assignedTo || "") !== (order.assignedTo || "") ||
      status !== order.status
    : canEditStatusFlag
    ? status !== order.status
    : false;

  // Warn on refresh/close
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleSave = () => {
    if (!canEditStatusFlag) return;

    const updatedAt = nowYMDHMS();
    const updatedBy = user?.name ?? "Unknown";

    const patch: Partial<typeof order> = {
      status,
      updatedAt,
      updatedBy,
    };

    if (canEditAllFlag) {
      const qtyNum = Number(quantity);
      const amtNum = Number(amount);

      if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
        setToast({ type: "error", text: t("validation.quantityGtZero") });
        window.setTimeout(() => setToast(null), 2500);
        return;
      }
      if (!Number.isFinite(amtNum) || amtNum < 0) {
        setToast({ type: "error", text: t("validation.amountGteZero") });
        window.setTimeout(() => setToast(null), 2500);
        return;
      }

      Object.assign(patch, {
        customer: customer.trim(),
        orderDate,
        productName: productName.trim(),
        quantity: qtyNum,
        amount: amtNum,
        assignedTo: assignedTo || undefined,
      });
    }

    updateOrder(order.id, patch);
    setToast({ type: "success", text: t("common.savedSuccessfully") });
    window.setTimeout(() => setToast(null), 2000);
  };

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleBack = () => {
    if (isDirty) {
      const ok = window.confirm(t("common.unsavedLeaveConfirm"));
      if (!ok) return;
    }
    if (from) navigate(from);
    else navigate(-1);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (canEditStatusFlag && isDirty) handleSave();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        handleBack();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    canEditStatusFlag,
    isDirty,
    status,
    customer,
    productName,
    quantity,
    amount,
    assignedTo,
    from,
  ]);

  return (
    <div className="text-gray-900 dark:text-gray-100">
      {/* Top */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">
            {t("orderDetail.title", { id: order.id })}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {order.orderDate} • {order.customer}
          </p>
        </div>
        <StatusBadge status={status} />
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

      {/* Main fields */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Box label={t("order.fields.customer")}>
          {canEditAllFlag ? (
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          ) : (
            <p className="text-sm font-medium">{customer}</p>
          )}
        </Box>

        <Box label={t("order.fields.date")}>
          {canEditAllFlag ? (
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          ) : (
            <p className="text-sm font-medium">{orderDate}</p>
          )}
        </Box>

        <Box label={t("order.fields.productName")}>
          {canEditAllFlag ? (
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          ) : (
            <p className="text-sm font-medium">{productName}</p>
          )}
        </Box>

        <Box label={t("order.fields.quantity")}>
          {canEditAllFlag ? (
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          ) : (
            <p className="text-sm font-medium">{quantity}</p>
          )}
        </Box>

        <Box label={t("order.fields.amountYen")}>
          {canEditAllFlag ? (
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          ) : (
            <p className="text-sm font-medium">
              ¥{Number(amount).toLocaleString()}
            </p>
          )}
        </Box>

        <Box label={t("order.fields.status")}>
          {canEditStatusFlag ? (
            <>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="unchecked">{t("order.status.unchecked")}</option>
                <option value="confirmed">{t("order.status.confirmed")}</option>
                <option value="processing">{t("order.status.processing")}</option>
                <option value="completed">{t("order.status.completed")}</option>
                <option value="cancelled">{t("order.status.cancelled")}</option>
              </select>

              <div className="mt-3">
                <StatusBadge status={status} />
              </div>
            </>
          ) : (
            <StatusBadge status={status} />
          )}
        </Box>

        <Box label={t("order.fields.assignedStaff")}>
          {canEditAllFlag ? (
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="">{t("order.unassigned")}</option>
              {STAFF_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm font-medium">{assignedTo || "—"}</p>
          )}
        </Box>

        {/* PDF */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t("order.fields.faxPdf")}
          </p>
          <div className="mt-2">
            {order.pdfUrl ? (
              <a
                href={order.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                {t("orderDetail.openPdf")}
              </a>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("orderDetail.noPdf")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Audit */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {t("orderDetail.auditTitle")}
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="text-sm text-gray-700 dark:text-gray-200">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {t("orderDetail.created")}
            </span>{" "}
            {order.createdAt} {t("orderDetail.by")} {order.createdBy}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-200">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {t("orderDetail.updated")}
            </span>{" "}
            {order.updatedAt} {t("orderDetail.by")} {order.updatedBy}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          {t("common.back")}
        </button>

        {canEditStatusFlag && (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isDirty ? t("common.unsavedChanges") : t("common.allSaved")}
            </p>

            <button
              onClick={handleSave}
              disabled={!isDirty}
              className={[
                "rounded-lg px-4 py-2 text-sm font-medium",
                isDirty
                  ? "bg-gray-900 text-white hover:opacity-90 dark:bg-gray-100 dark:text-gray-900"
                  : "cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
              ].join(" ")}
            >
              {t("common.saveChanges")}
            </button>
          </>
        )}

        {canDeleteFlag && (
          <button
            onClick={() => setConfirmDeleteOpen(true)}
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:bg-gray-900 dark:text-red-300 dark:hover:bg-red-950/30"
          >
            {t("common.delete")}
          </button>
        )}

        {/* Delete modal */}
        {confirmDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t("orderDetail.deleteTitle")}
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {t("orderDetail.deleteBody")}
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDeleteOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  {t("common.cancel")}
                </button>

                <button
                  onClick={() => {
                    deleteOrder(order.id);
                    navigate("/orders", {
                      state: { toast: { type: "success", text: t("orderDetail.deletedToast") } },
                    });
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Box({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
