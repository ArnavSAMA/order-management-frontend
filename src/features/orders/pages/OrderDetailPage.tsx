import { useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { mockOrders } from "../mockOrders"
import StatusBadge from "@/components/common/StatusBadge."

export default function OrderDetailPage(){
    const { id } = useParams()

    const order = useMemo(() => {
        return mockOrders.find((o) => o.id === id)
    },[id])

    if (!order){
        return(
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Order Note found</h1>
                <p className="mt-2 text-sm text-gray-600">
                    No order exists for ID: {id}
                </p>
                <Link to="/orders" className="mt-4 inline-block text-sm text-blue-600 hover:underline transition duration-75 ease-in-out">
                    ← Back to Orders
                </Link>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Order #{order.id}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Created: {order.createdAt}
                    </p>
                </div>

                <StatusBadge status={order.status} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className=" rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Customer
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{order.customerName}</p>
                </div>

                <div className=" rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Item
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{order.itemName}</p>
                </div>

                <div className=" rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Quantity
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{order.quantity}</p>
                </div>

                <div className=" rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                    </p>
                    <div className="mt-2">
                        <StatusBadge status={order.status} />
                    </div>
                </div>
            </div>

            <Link to="/orders" className="mt-4 inline-block text-sm text-blue-600 hover:underline transition duration-75 ease-in-out">
                    ← Back to Orders
            </Link>
            
        </div>
    )
}