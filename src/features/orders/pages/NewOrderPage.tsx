import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useOrders } from "../context/OrdersProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import type { Order, OrderStatus } from "../types";
import { nowYMDHMS } from "@/lib/datetime";

const STAFF_OPTIONS = ["", "Taro Tanaka", "Declan", "Hanako Yamada"];

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function NewOrderPage() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { user } = useAuth();
  const createdBy = user?.name ?? t("common.unknown");

  const { orders, addOrder } = useOrders();

  const nextId = useMemo(() => {
    const nums = orders
      .map((o) => Number(o.id))
      .filter((n) => Number.isFinite(n));
    const max = nums.length ? Math.max(...nums) : 0;
    return String(max + 1);
  }, [orders]);

  const [customer, setCustomer] = useState("");
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [productName, setProductName] = useState("");

  // keep as string to avoid backspace bug
  const [quantity, setQuantity] = useState("1");
  const [amount, setAmount] = useState("0");

  const [status, setStatus] = useState<OrderStatus>("unchecked");
  const [assignedTo, setAssignedTo] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  const [error, setError] = useState("");

  const validate = () => {
    if (!customer.trim()) return t("validation.customerRequired");
    if (!orderDate) return t("validation.orderDateRequired");
    if (!productName.trim()) return t("validation.productNameRequired");

    const qtyNum = Number(quantity);
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) return t("validation.quantityGtZero");

    const amtNum = Number(amount);
    if (!Number.isFinite(amtNum) || amtNum < 0) return t("validation.amountGteZero");

    return "";
  };

  const handleCreate = () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setError("");

    const qtyNum = Number(quantity);
    const amtNum = Number(amount);

    const createdAt = nowYMDHMS();

    const newOrder: Order = {
      id: nextId,
      customer: customer.trim(),
      orderDate,
      productName: productName.trim(),
      quantity: qtyNum,
      amount: amtNum,
      status,
      assignedTo: assignedTo || undefined,
      pdfUrl: pdfUrl.trim() ? pdfUrl.trim() : undefined,
      createdAt,
      createdBy,
      updatedAt: createdAt,
      updatedBy: createdBy,
    };

    addOrder(newOrder);

    navigate("/orders", {
      state: { toast: { type: "success", text: t("newOrder.toastCreated") } },
    });
  };

  return (
    <div className="text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("newOrder.title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("newOrder.idLabel", { id: nextId })}
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label={t("order.fields.customer")} required>
          <input
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </Field>

        <Field label={t("order.fields.date")} required>
          <input
            type="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </Field>

        <Field label={t("order.fields.productName")} required>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </Field>

        <Field label={t("order.fields.quantity")} required>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </Field>

        <Field label={t("order.fields.amountYen")} required>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </Field>

        <Field label={t("order.fields.status")} required>
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
        </Field>

        <Field label={t("order.fields.assignedStaff")}>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            {STAFF_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s ? s : t("order.unassigned")}
              </option>
            ))}
          </select>
        </Field>

        <div className="md:col-span-2">
          <Field label={t("order.fields.faxPdf")}>
            <input
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder={t("newOrder.pdfPlaceholder")}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/orders")}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          {t("common.cancel")}
        </button>

        <button
          type="button"
          onClick={handleCreate}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-gray-100 dark:text-gray-900"
        >
          {t("newOrder.create")}
        </button>
      </div>
    </div>
  );
}
