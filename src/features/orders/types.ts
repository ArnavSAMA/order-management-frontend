export type OrderStatus= | 'unchecked' | 'confirmed' | 'processing' | 'completed' | 'cancelled'

export type Order = {
    id: string
    customerName: string
    itemName: string
    quantity: number
    status: OrderStatus
    createdAt: string
}