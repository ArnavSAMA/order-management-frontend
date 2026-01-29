import { useMemo, useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import StatusBadge from "@/components/common/StatusBadge";
import { useOrders } from "../context/OrdersProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import type { OrderStatus } from "../types";
import { nowYMDHMS } from "@/lib/datetime";
import { canEditAll, canEditStatus, canDeleteOrder, canViewOrder } from "../permissions";


const STAFF_OPTIONS = ["Taro Tanaka", "Declan", "Hanako Yamada"];

export default function OrderDetailPage() {

  const [toast, setToast] = useState<null | { type: "success" | "error"; text: string }>(null);

    
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const from = (location.state as any)?.from as string | undefined;
  
  const role = user?.role;
  const { orders, updateOrder, deleteOrder } = useOrders();
  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);

  if (!order) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Order not found</h1>
        <p className="mt-2 text-sm text-gray-600">No order exists for ID: {id}</p>

        <button
          type="button"
          onClick={() => {
            if (from) navigate(from);
            else navigate(-1);
          }}
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          ← Back to Orders
        </button>
      </div>
    );
  }


  // Permissions
  const canEditAllFlag = canEditAll(user ?? null);
  const canEditStatusFlag = canEditStatus(user ?? null, order);
  const canDeleteFlag = canDeleteOrder(user ?? null);
  // Local editable state (backend later)
  const [customer, setCustomer] = useState(order.customer);
  const [orderDate, setOrderDate] = useState(order.orderDate);
  const [productName, setProductName] = useState(order.productName);
  const [quantity, setQuantity] = useState(String(order.quantity));
  const [amount, setAmount] = useState(String(order.amount));
  const [assignedTo, setAssignedTo] = useState(order.assignedTo ?? "");
  const [status, setStatus] = useState<OrderStatus>(order.status);

  useEffect(() => {
      setStatus(order.status);
    }, [order.status]);
  useEffect(() => {
    setQuantity(String(order.quantity));
  }, [order.quantity]);

  useEffect(() => {
    setAmount(String(order.amount));
    }, [order.amount]);
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

  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // required for Chrome
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);


  const handleSave = () => {
    // nobody can save anything if they can't edit status at least
    if (!canEditStatusFlag) return;

    const updatedAt = nowYMDHMS();
    const updatedBy = user?.name ?? "Unknown";

    // staff: status only
    const patch: Partial<typeof order> = {
      status,
      updatedAt,
      updatedBy,
    };

    // clerk: can edit all fields too
    if (canEditAllFlag) {
      const qtyNum = Number(quantity);
      const amtNum = Number(amount);

      if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
        setToast({ type: "error", text: "Quantity must be > 0" });
        setTimeout(() => setToast(null), 2500);
        return;

      }
      if (!Number.isFinite(amtNum) || amtNum < 0) {
        setToast({ type: "error", text: "Amount must be ≥ 0" });
        setTimeout(() => setToast(null), 2500);
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
    setToast({ type: "success", text: "Saved successfully." });
    setTimeout(() => setToast(null), 2000);

  };
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const goBackToList = () => {
      if (from) navigate(from);
      else navigate("/orders");
    };

  const handleDelete = () => {
    const ok = window.confirm("Delete this order? This cannot be undone.");
    if (!ok) return;

    deleteOrder(order.id);
    goBackToList();

  };

  const handleBack = () => {
    if (isDirty) {
      const ok = window.confirm("You have unsaved changes. Leave without saving?");
      if (!ok) return;
    }

    if (from) navigate(from);
    else navigate(-1); // fallback if user opened detail directly
  };
  

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S → Save
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (canEditStatusFlag && isDirty) handleSave();
        return;
      }

      // Esc → Back (respect unsaved changes logic)
      if (e.key === "Escape") {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canEditStatusFlag, isDirty, handleBack, handleSave]);



  return (
    <div>
      {/* Top section */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Order #{order.id}</h1>
        </div>

        <StatusBadge status={status} />
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


      {/* Main fields */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Customer */}
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Customer
          </p>
          <div className="mt-2">
            {canEditAllFlag ? (
              <input
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              />
            ) : (
              <p className="text-sm font-medium text-gray-900">{customer}</p>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Date
          </p>
          <div className="mt-2">
            {canEditAllFlag ? (
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              />
            ) : (
              <p className="text-sm font-medium text-gray-900">{orderDate}</p>
            )}
          </div>
        </div>

        {/* Product */}
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Product Name
          </p>
          <div className="mt-2">
            {canEditAllFlag ? (
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              />
            ) : (
              <p className="text-sm font-medium text-gray-900">{productName}</p>
            )}
          </div>
        </div>

        {/* Quantity */}
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Quantity
          </p>
          <div className="mt-2">
            {canEditAllFlag ? (
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              />
            ) : (
              <p className="text-sm font-medium text-gray-900">{quantity}</p>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Amount (¥)
          </p>
          <div className="mt-2">
            {canEditAllFlag ? (
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              />
            ) : (
              <p className="text-sm font-medium text-gray-900">
                ¥{amount.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Status
          </p>
          <div className="mt-2">
            {canEditStatusFlag ? (
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="unchecked">Unchecked</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

            ) : (
              <StatusBadge status={status} />
            )}

            {canEditStatusFlag && (
              <div className="mt-3">
                <StatusBadge status={status} />
              </div>
            )}
          </div>
        </div>

        {/* Assigned Staff */}
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Assigned Staff
          </p>
          <div className="mt-2">
            {canEditAllFlag ? (
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Unassigned</option>
                {STAFF_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm font-medium text-gray-900">{assignedTo || "—"}</p>
            )}
          </div>
        </div>

        {/* PDF */}
        <div className="rounded-xl border border-gray-200 p-4 md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            FAX / PDF
          </p>
          <div className="mt-2">
            {order.pdfUrl ? (
              <a
                href={order.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Open PDF
              </a>
            ) : (
              <p className="text-sm text-gray-500">No PDF attached</p>
            )}
          </div>
        </div>
      </div>

      {/* Audit section */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Audit
        </p>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Created:</span>{" "}
            {order.createdAt} by {order.createdBy}
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Updated:</span>{" "}
            {order.updatedAt} by {order.updatedBy}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={handleBack}
          className="text-m cursor-pointer text-blue-600 hover:underline"
        >
          ← Back
        </button>


        {canEditStatusFlag && (
          <>
            <p className="text-m text-gray-500">
              {isDirty ? "Unsaved changes" : "All changes saved"}
            </p>

            <button
              onClick={handleSave}
              disabled={!isDirty}
              className={[
                "w-full sm:w-auto rounded-lg px-4 py-2 text-sm font-medium",
                isDirty
                  ? "bg-gray-900 cursor-pointer text-white"
                  : "cursor-not-allowed bg-gray-200 text-gray-500",
              ].join(" ")}
            >
              Save Changes
            </button>
          </>
        )}

        {canDeleteFlag && (
          <button
            onClick={() => setConfirmDeleteOpen(true)}
            className="w-full sm:w-auto rounded-lg cursor-pointer border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete Order
          </button>
        )}
        {confirmDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-900">Delete order?</h2>
              <p className="mt-2 text-sm text-gray-600">
                This action cannot be undone.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDeleteOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    deleteOrder(order.id);
                    goBackToList();
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
