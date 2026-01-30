import { createBrowserRouter } from "react-router-dom";

import LoginPage from "../features/auth/LoginPage";
import ProtectedRoute from "@/features/auth/ProtectedRoute";

import OrderDetailPage from "../features/orders/pages/OrderDetailPage";
import OrderListPage from "../features/orders/pages/OrderListPage";
import NewOrderPage from "../features/orders/pages/NewOrderPage";

import { OrdersProvider } from "@/features/orders/context/OrdersProvider";
import ResponsiveLayout from "@/layouts/ResponsiveLayout";
import SettingsPage from "@/pages/SettingsPage";
import ErrorPage from "@/pages/ErrorPage";


export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },

  {
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: (
          <OrdersProvider>
            <ResponsiveLayout />
          </OrdersProvider>
        ),
        children: [
          { path: "orders", element: <OrderListPage /> },
          { path: "orders/:id", element: <OrderDetailPage /> },
          { path: "settings", element: <SettingsPage /> },
          {
            element: <ProtectedRoute allow={["clerk"]} />,
            children: [{ path: "orders/new", element: <NewOrderPage /> }],
          },
        ],
      },
    ],
  },
]);
