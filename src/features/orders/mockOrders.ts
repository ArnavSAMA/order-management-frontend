import type { Order } from './types'

export const mockOrders: Order[] = [
  {
    id: '1',
    customerName: 'Alice',
    itemName: 'Laptop',
    quantity: 1,
    status: 'unchecked',
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    customerName: 'Bob',
    itemName: 'Phone',
    quantity: 2,
    status: 'confirmed',
    createdAt: '2024-01-12',
  },
  {
    id: '3',
    customerName: 'Charlie',
    itemName: 'Headphones',
    quantity: 1,
    status: 'completed',
    createdAt: '2024-01-15',
  },
  {
    id: '4',
    customerName: 'Declan',
    itemName: 'Ipad',
    quantity: 1,
    status: 'processing',
    createdAt: '2024-01-18',
  },
  {
    id: '5',
    customerName: 'Ether',
    itemName: 'OTG',
    quantity: 4,
    status: 'cancelled',
    createdAt: '2024-01-19',
  },
]
