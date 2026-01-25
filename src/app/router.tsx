import { createBrowserRouter } from "react-router-dom";

import LoginPage from "../features/auth/LoginPage";
import OrderDetailPage from "../features/orders/pages/OrderDetailPage";
import OrderListPage from "../features/orders/pages/OrderListPage";
import NewOrderPage from "../features/orders/pages/NewOrderPage";
import PcLayout from "../layouts/PcLayout"

export const router = createBrowserRouter([
    {path:'/login', element: <LoginPage />},
    {
        path:'/',
        element: <PcLayout />,
        children:[
            { path:'orders', element: <OrderListPage />},
            { path:'orders/new', element: <NewOrderPage />},
            { path:'orders/:id', element: <OrderDetailPage />},
        ],
    },
])

