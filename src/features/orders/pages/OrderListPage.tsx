import StatusBadge from "@/components/common/StatusBadge."
import { mockOrders } from "../mockOrders"
import { useNavigate } from "react-router-dom"
import { useRef } from "react"


export default function OrderListPage(){
    const navigate = useNavigate()
    const rowRefs = useRef<(HTMLTableRowElement | null)[]>([])
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
                    {mockOrders.map((order, index) =>(
                        <tr key={order.id} 
                        ref={(el) => {rowRefs.current[index]=el}}
                        tabIndex={0}
                        onClick={() => navigate(`/orders/${order.id}`)}
                        onKeyDown={(e) =>{
                            if (e.key === 'Enter') {
                                navigate(`/orders/${order.id}`)
                            }
                            if (e.key === 'ArrowDown') {
                                e.preventDefault()
                                rowRefs.current[index+1]?.focus()
                            }
                            if (e.key === 'ArrowUp') {
                                e.preventDefault()
                                rowRefs.current[index-1]?.focus()
                            }
                        }}
                        className="cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 duration-100 ease-in-out">
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