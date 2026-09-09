import { Eye, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import EmptyState from './EmptyState';

const ORDER_STATUS_COLORS = {
  pending: 'bg-[color:var(--color-warning-100)] text-[color:var(--color-warning-600)]',
  confirmed: 'bg-[color:var(--color-info-100)] text-[color:var(--color-info-600)]',
  preparing: 'bg-[color:var(--color-primary-100)] text-[color:var(--color-primary-600)]',
  ready: 'bg-[color:var(--color-success-100)] text-[color:var(--color-success-600)]',
  delivered: 'bg-[color:var(--color-success-100)] text-[color:var(--color-success-600)]',
  cancelled: 'bg-[color:var(--color-danger-100)] text-[color:var(--color-danger-600)]',
};

export default function OrderTable({ orders = [], loading = false }) {
  if (!loading && orders.length === 0) {
    return <EmptyState title="No orders yet" description="Your orders will appear here" />;
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-[color:var(--color-border)]">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-[color:var(--color-text-primary)]">Order ID</th>
              <th className="text-left px-4 py-3 font-semibold text-[color:var(--color-text-primary)]">Customer</th>
              <th className="text-left px-4 py-3 font-semibold text-[color:var(--color-text-primary)]">Items</th>
              <th className="text-left px-4 py-3 font-semibold text-[color:var(--color-text-primary)]">Amount</th>
              <th className="text-left px-4 py-3 font-semibold text-[color:var(--color-text-primary)]">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-[color:var(--color-text-primary)]">Time</th>
              <th className="text-left px-4 py-3 font-semibold text-[color:var(--color-text-primary)]">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="border-b border-[color:var(--color-border-light)]">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 bg-[color:var(--color-gray-200)] rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-[color:var(--color-border-light)] hover:bg-[color:var(--color-gray-50)]">
                  <td className="px-4 py-4 font-medium text-[color:var(--color-text-primary)]">#{order.id}</td>
                  <td className="px-4 py-4 text-[color:var(--color-text-secondary)]">{order.customer_name}</td>
                  <td className="px-4 py-4 text-[color:var(--color-text-secondary)]">{order.items_count} items</td>
                  <td className="px-4 py-4 font-semibold text-[color:var(--color-text-primary)]">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.total)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`
                        inline-block px-3 py-1 rounded-full text-xs font-medium
                        ${ORDER_STATUS_COLORS[order.status] || ORDER_STATUS_COLORS.pending}
                      `}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[color:var(--color-text-secondary)] text-xs">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/restaurant/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-[color:var(--color-primary-600)] hover:text-[color:var(--color-primary-700)] transition-colors"
                    >
                      <Eye size={16} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-[color:var(--color-gray-100)] rounded-lg p-4 space-y-3 animate-pulse">
              <div className="h-4 bg-[color:var(--color-gray-200)] rounded w-1/3" />
              <div className="h-4 bg-[color:var(--color-gray-200)] rounded w-2/3" />
              <div className="h-4 bg-[color:var(--color-gray-200)] rounded w-1/2" />
            </div>
          ))
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/restaurant/orders/${order.id}`}
              className="block bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] rounded-lg p-4 active:bg-[color:var(--color-gray-50)]"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-[color:var(--color-text-primary)]">Order #{order.id}</p>
                  <p className="text-xs text-[color:var(--color-text-secondary)] mt-1">{order.customer_name}</p>
                </div>

                <span
                  className={`
                    inline-block px-2 py-1 rounded text-xs font-medium flex-shrink-0
                    ${ORDER_STATUS_COLORS[order.status] || ORDER_STATUS_COLORS.pending}
                  `}
                >
                  {order.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-[color:var(--color-text-secondary)]">{order.items_count} items</p>
                  <p className="font-semibold text-[color:var(--color-text-primary)] mt-1">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.total)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-[color:var(--color-text-muted)]">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <ChevronRight size={18} className="text-[color:var(--color-primary-600)]" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}