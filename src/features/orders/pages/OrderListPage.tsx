import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "@/components/common/StatusBadge";
import { useOrders } from "../context/OrdersProvider";
import { useAuth } from "@/app/providers/AuthProvider";


export default function OrderListPage() {
  const { orders } = useOrders();
  const { user } = useAuth();
  const role = user?.role;
  const visibleOrders =
  role === "staff"
    ? orders.filter((o) => o.assignedTo === user?.name)
    : orders;



  const navigate = useNavigate();
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  return (
    <div>
        <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500">{visibleOrders.length} total</p>
        </div>
        {visibleOrders.length === 0 ? (
            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
                No assigned orders.
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
                    {visibleOrders.map((order, index) => (
                    <tr
                        key={order.id}
                        ref={(el) => {
                        rowRefs.current[index] = el;
                        }}
                        tabIndex={0}
                        onClick={() => navigate(`/orders/${order.id}`)}
                        onKeyDown={(e) => {
                        if (e.key === "Enter") navigate(`/orders/${order.id}`);

                        if (e.key === "ArrowDown") {
                            e.preventDefault();
                            rowRefs.current[index + 1]?.focus();
                        }

                        if (e.key === "ArrowUp") {
                            e.preventDefault();
                            rowRefs.current[index - 1]?.focus();
                        }
                        }}
                        className="cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        <td className="px-4 py-3 font-medium text-gray-900">
                        {order.customer}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{order.orderDate}</td>
                        <td className="px-4 py-3 text-gray-700">
                        {order.productName}
                        </td>
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
        </div>
      )}

      
    </div>
  );
}
