import type { OrderStatus } from '@/features/orders/types'

function getStatusStyles(status: OrderStatus) {
  switch (status) {
    case "unchecked":
      return "bg-[#FF6B6B] text-white ring-[#FF6B6B]";

    case "confirmed":
      return "bg-[#FFD93D] text-black ring-[#FFD93D]";

    case "processing":
      // Blue-green = active / in progress
      return "bg-[#6BCF7F] text-black ring-[#6BCF7F]";

    case "completed":
      // Green-blue = finished / stable
      return "bg-[#00CEC8] text-black ring-[#00CEC8]";

    case "cancelled":
      return "bg-gray-200 text-black ring-gray-200";

    default:
      return "bg-gray-200 text-black ring-gray-200";
  }
}


export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={[
        'inline-flex min-w-22 items-center justify-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset',
        getStatusStyles(status),
      ].join(' ')}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
