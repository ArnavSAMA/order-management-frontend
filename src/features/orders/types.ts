export type OrderStatus =
  | 'unchecked'
  | 'confirmed'
  | 'processing'
  | 'completed'
  | 'cancelled'

export type Order = {
  id: string

  // Core fields (used in list + detail)
  customer: string
  orderDate: string // YYYY-MM-DD
  productName: string
  quantity: number
  amount: number // store as number, show as ¥
  status: OrderStatus
  assignedTo?: string

  // Fax/PDF
  pdfUrl?: string

  // Audit (display-only)
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}
