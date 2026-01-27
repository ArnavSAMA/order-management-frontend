import { useMemo, useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import StatusBadge from "@/components/common/StatusBadge";
import { useOrders } from "../context/OrdersProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import type { OrderStatus } from "../types";

const STAFF_OPTIONS = ["Taro Tanaka", "Declan", "Hanako Yamada"];

export default function OrderDetailPage() {
    
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  

  const role = user?.role;
  const { orders, updateOrder, deleteOrder } = useOrders();
  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);

  if (!order) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Order not found</h1>
        <p className="mt-2 text-sm text-gray-600">No order exists for ID: {id}</p>
        <Link
          to="/orders"
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }
  

  // Permissions
  const canEditAll = role === "clerk";
  const canEditStatus = role === "clerk" || role === "staff";
  const canDelete = role === "clerk";

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

  const isDirty = canEditAll
    ? customer.trim() !== order.customer ||
      orderDate !== order.orderDate ||
      productName.trim() !== order.productName ||
      Number(quantity) !== order.quantity ||
      Number(amount) !== order.amount ||
      (assignedTo || "") !== (order.assignedTo || "") ||
      status !== order.status
    : canEditStatus
    ? status !== order.status
    : false;



  const handleSave = () => {
    // nobody can save anything if they can't edit status at least
    if (!canEditStatus) return;

    const updatedAt = new Date().toISOString().replace("T", " ").slice(0, 19);
    const updatedBy = user?.name ?? "Unknown";

    // staff: status only
    const patch: Partial<typeof order> = {
      status,
      updatedAt,
      updatedBy,
    };

    // clerk: can edit all fields too
    if (canEditAll) {
      const qtyNum = Number(quantity);
      const amtNum = Number(amount);

      if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
        alert("Quantity must be > 0");
        return;
      }
      if (!Number.isFinite(amtNum) || amtNum < 0) {
        alert("Amount must be ≥ 0");
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
    alert("Saved");
  };



  const handleDelete = () => {
    const ok = window.confirm("Delete this order? This cannot be undone.");
    if (!ok) return;

    deleteOrder(order.id);
    navigate("/orders");
  };

  return (
    <div>
      {/* Top section */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Order #{order.id}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Role: <span className="font-medium text-gray-900">{role}</span>
          </p>
        </div>

        <StatusBadge status={status} />
      </div>

      {/* Main fields */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Customer */}
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Customer
          </p>
          <div className="mt-2">
            {canEditAll ? (
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
            {canEditAll ? (
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
            {canEditAll ? (
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
            {canEditAll ? (
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
            {canEditAll ? (
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
            {canEditStatus ? (
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

            {canEditStatus && (
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
            {canEditAll ? (
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
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
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
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link to="/orders" className="text-sm text-blue-600 hover:underline">
          ← Back to Orders
        </Link>

        {canEditStatus && (
          <>
            <p className="text-sm text-gray-500">
              {isDirty ? "Unsaved changes" : "All changes saved"}
            </p>

            <button
              onClick={handleSave}
              disabled={!isDirty}
              className={[
                "rounded-lg px-4 py-2 text-sm font-medium",
                isDirty
                  ? "bg-gray-900 cursor-pointer text-white"
                  : "cursor-not-allowed bg-gray-200 text-gray-500",
              ].join(" ")}
            >
              Save Changes
            </button>
          </>
        )}

        {canDelete && (
          <button
            onClick={handleDelete}
            className="rounded-lg cursor-pointer border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete Order
          </button>
        )}

      </div>
    </div>
  );
}
