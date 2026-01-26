import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useOrders } from "../context/OrdersProvider";
import type { Order, OrderStatus } from "../types";
import { useAuth } from "@/app/providers/AuthProvider";

const STAFF_OPTIONS = ["Taro Tanaka", "Declan", "Hanako Yamada"];

function todayYYYYMMDD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function NewOrderPage() {
  const navigate = useNavigate();
  const { addOrder, orders } = useOrders();
  const { user } = useAuth();

  // Clerk-only route guard already blocks others, but keep code safe:
  const createdBy = user?.name ?? "Unknown";

  const [customer, setCustomer] = useState("");
  const [orderDate, setOrderDate] = useState(todayYYYYMMDD());
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [amount, setAmount] = useState<number>(0);
  const [status, setStatus] = useState<OrderStatus>("unchecked");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string>("");

  const nextId = useMemo(() => {
    // simple local id generation: max numeric id + 1 (works for mock)
    const nums = orders
      .map((o) => Number(o.id))
      .filter((n) => Number.isFinite(n));
    const max = nums.length ? Math.max(...nums) : 0;
    return String(max + 1);
  }, [orders]);

  const [error, setError] = useState<string>("");

  const validate = () => {
    if (!customer.trim()) return "Customer is required.";
    if (!orderDate.trim()) return "Date is required.";
    if (!productName.trim()) return "Product name is required.";
    if (!Number.isFinite(quantity) || quantity <= 0) return "Quantity must be > 0.";
    if (!Number.isFinite(amount) || amount < 0) return "Amount must be ≥ 0.";
    return "";
  };

  const handleCreate = () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setError("");

    const now = new Date();
    const createdAt = now.toISOString().replace("T", " ").slice(0, 19);

    const newOrder: Order = {
      id: nextId,
      customer: customer.trim(),
      orderDate,
      productName: productName.trim(),
      quantity,
      amount,
      status,
      assignedTo: assignedTo || undefined,
      pdfUrl: pdfUrl.trim() ? pdfUrl.trim() : undefined,
      createdAt,
      createdBy,
      updatedAt: createdAt,
      updatedBy: createdBy,
    };

    addOrder(newOrder);
    navigate("/orders");
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">New Order</h1>
          <p className="mt-1 text-sm text-gray-500">Clerk only</p>
        </div>

        <Link to="/orders" className="text-sm text-blue-600 hover:underline">
          ← Back
        </Link>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Customer" required>
          <input
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            placeholder="Customer name"
          />
        </Field>

        <Field label="Date" required>
          <input
            type="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Product Name" required>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            placeholder="Product"
          />
        </Field>

        <Field label="Quantity" required>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Amount (¥)" required>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Status" required>
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
        </Field>

        <Field label="Assigned Staff">
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
        </Field>

        <Field label="FAX PDF URL">
          <input
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            placeholder="https://..."
          />
        </Field>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleCreate}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          Create Order
        </button>

        <button
          onClick={() => navigate("/orders")}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

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
    <div className="rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
