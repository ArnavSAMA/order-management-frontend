import { useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { mockOrders } from "../mockOrders"

export default function OrderDetailPage(){
    const { id } = useParams()

    const order = useMemo(() => {
        return mockOrders.find((o) => o.id === id)
    },[id])

    if (!order){
        return(
            <div>
                <h1>Order Note found</h1>
                <p>
                    No order exists for ID: {id}
                </p>
                <Link  to="/orders" >
                    ← Back to Orders
                </Link>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-xl font-semibold text-gray-900">Order Detail</h1>
            <p className="mt-2 text-sm text-gray-600">Order ID: {id}</p>
        </div>
    )
}