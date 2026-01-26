import React,{ createContext, useContext, useMemo, useState } from "react";
import type { Order, OrderStatus } from "../types"
import { mockOrders } from "../mockOrders";

type OrderContextValue = {
    orders: Order[];
    addOrder: (order: Order) => void;
    updateOrder: (id: string, patch: Partial<Order>) => void;
    updateStatus: (id: string, status: OrderStatus) => void;
    deleteOrder: (id: string) => void;
}

const OrdersContext = createContext<OrderContextValue | undefined>(undefined);

export function OrdersProvider({children}: {children: React.ReactNode}) {
    const [orders, setOrders] = useState<Order[]>(mockOrders);

    const addOrder = (order: Order) => {
        setOrders((prev) => [order, ...prev]);
    };

    const updateOrder = (id: string, patch: Partial<Order>) => {
        setOrders((prev) => 
            prev.map((o) => (o.id === id ? { ...o, ...patch } : o))
        );
    };

    const updateStatus = (id: string, status: OrderStatus) => {
        updateOrder(id, {status});
    };

    const deleteOrder = (id: string) => {
        setOrders((prev) => prev.filter((o) => o.id !== id));
    };

    const value = useMemo(
        () => ({orders,addOrder,updateOrder,updateStatus,deleteOrder}),
        [orders]
    )

    return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

export function useOrders(){
    const ctx = useContext(OrdersContext);
    if(!ctx) throw new Error("useOrders must be used inside OrdersProvider")
        return ctx
}