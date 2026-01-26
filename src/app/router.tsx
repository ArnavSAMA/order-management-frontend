import { createBrowserRouter } from "react-router-dom";

import LoginPage from "../features/auth/LoginPage";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import PcLayout from "../layouts/PcLayout"

import OrderDetailPage from "../features/orders/pages/OrderDetailPage";
import OrderListPage from "../features/orders/pages/OrderListPage";
import NewOrderPage from "../features/orders/pages/NewOrderPage";
import { OrdersProvider } from "@/features/orders/context/OrdersProvider";

export const router = createBrowserRouter([
    {path:'/login', element: <LoginPage />},
    {
        element: <ProtectedRoute />,
        children:[
            {
                path:'/',
                element: (
                    <OrdersProvider>
                        <PcLayout />
                    </OrdersProvider>
                ),
                children:[
                    { path:'orders', element: <OrderListPage />},
                    { path:'orders/:id', element: <OrderDetailPage />},
                    {
                        element: <ProtectedRoute allow={['clerk']} />,
                        children: [{ path:'orders/new', element: <NewOrderPage />}],
                    },
                ],
            },
        ],
    },
    
])

