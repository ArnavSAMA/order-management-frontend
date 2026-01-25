import StatusBadge from "@/components/common/StatusBadge."
import { mockOrders } from "../mockOrders"

export default function OrderListPage(){
    return(
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900">
                    Orders
                </h1>
                <p className="text-sm text-gray-500">
                    {mockOrders.length} total
                </p>
            </div>
            

            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <tr>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Item</th>
                            <th className="px-4 py-3">Quantity</th>
                            <th className="px-4 py-3">Created</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                    {mockOrders.map((order) =>(
                        <tr key={order.id} className="hover:bg-gray-50 duration-100 ease-in-out">
                            <td className="px-4 py-3 font-medium text-gray-900">{order.customerName}</td>
                            <td className="px-4 py-3 text-gray-700">{order.itemName}</td>
                            <td className="px-4 py-3 text-gray-700">{order.quantity}</td>
                            <td className="px-4 py-3 text-gray-500">{order.createdAt}</td>
                            <td className="px-4 py-3">
                                <StatusBadge status={order.status} />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}