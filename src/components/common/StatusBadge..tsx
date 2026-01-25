import type { OrderStatus } from '@/features/orders/types'

function getStatusStyles(status: OrderStatus) {
  switch (status) {
    case 'unchecked':
      return 'bg-red-100 text-red-700 ring-red-200'

    case 'confirmed':
      return 'bg-yellow-100 text-yellow-800 ring-yellow-200'

    case 'processing':
  // Green = active / in progress
        return 'bg-emerald-100 text-emerald-700 ring-emerald-200'

    case 'completed':
    // Bluish = finished / stable
        return 'bg-sky-100 text-sky-700 ring-sky-200'

    case 'cancelled':
      return 'bg-gray-100 text-gray-700 ring-gray-200'

    default:
      return 'bg-gray-100 text-gray-700 ring-gray-200'
  }
}

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={[
        'inline-flex min-w-[5.5rem] items-center justify-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset',
        getStatusStyles(status),
      ].join(' ')}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
