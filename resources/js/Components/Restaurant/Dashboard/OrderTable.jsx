import { router } from '@inertiajs/react';
import EmptyState from '@/Components/Common/EmptyState';
import OrderStatusBadge from '@/Components/Common/OrderStatusBadge';
import OrderStatusSelect from '@/Components/Restaurant/Orders/OrderStatusSelect';
import { fulfillmentLabel } from '@/Utils/fulfillment';
import { CANCELLED_BY_CUSTOMER } from '@/Utils/orderUpdates';
import { formatCurrency } from '@/Utils/formatCurrency';

function CancelledByCustomer({ order }) {
  if (order.status !== 'cancelled' || order.cancelled_by !== CANCELLED_BY_CUSTOMER) {
    return null;
  }

  return (
    <p className="mt-1 text-xs font-medium text-[color:var(--color-danger-700)]">
      Cancelled by customer
    </p>
  );
}

export default function OrderTable({ orders = [], loading = false, onStatusUpdated }) {
  const openOrder = (orderId) => {
    router.visit(route('restaurant.orders.show', orderId));
  };

  if (!loading && orders.length === 0) {
    return <EmptyState title="No orders yet" description="Your orders will appear here" />;
  }

  return (
    <>
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
                <tr
                  key={order.id}
                  tabIndex={0}
                  onClick={() => openOrder(order.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') openOrder(order.id);
                  }}
                  className="cursor-pointer border-b border-[color:var(--color-border-light)] transition-colors hover:bg-[color:var(--color-gray-100)]"
                >
                  <td className="px-4 py-4 font-medium text-[color:var(--color-text-primary)]">{order.order_number ?? `#${order.id}`}</td>
                  <td className="px-4 py-4 text-[color:var(--color-text-secondary)]">
                    <p>{order.customer_name ?? order.customer?.name ?? '—'}</p>
                    <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)]">
                      {fulfillmentLabel(order.fulfillment_type)}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-[color:var(--color-text-secondary)]">{order.items_count} items</td>
                  <td className="px-4 py-4 font-semibold text-[color:var(--color-text-primary)]">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-4 py-4">
                    <OrderStatusBadge status={order.status} fulfillment={order.fulfillment_type} size="sm" />
                    <CancelledByCustomer order={order} />
                  </td>
                  <td className="px-4 py-4 text-xs text-[color:var(--color-text-secondary)]">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-4 min-w-44">
                    <OrderStatusSelect
                      orderId={order.id}
                      status={order.status}
                      fulfillment={order.fulfillment_type}
                      onUpdated={onStatusUpdated}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
            <div
              key={order.id}
              role="link"
              tabIndex={0}
              onClick={() => openOrder(order.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') openOrder(order.id);
              }}
              className="cursor-pointer rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] p-4 transition-colors hover:bg-[color:var(--color-gray-100)]"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[color:var(--color-text-primary)]">{order.order_number ?? `Order #${order.id}`}</p>
                  <p className="mt-1 text-xs text-[color:var(--color-text-secondary)]">{order.customer_name ?? order.customer?.name ?? '—'}</p>
                  <p className="text-xs text-[color:var(--color-text-muted)]">{fulfillmentLabel(order.fulfillment_type)}</p>
                </div>
                <p className="text-xs text-[color:var(--color-text-muted)]">
                  {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="flex items-end justify-between gap-3 text-sm">
                <div>
                  <p className="text-[color:var(--color-text-secondary)]">{order.items_count} items</p>
                  <p className="mt-1 font-semibold text-[color:var(--color-text-primary)]">
                    {formatCurrency(order.total)}
                  </p>
                </div>
                <div className="w-40">
                  <OrderStatusSelect
                    orderId={order.id}
                    status={order.status}
                    fulfillment={order.fulfillment_type}
                    onUpdated={onStatusUpdated}
                    className="w-40"
                  />
                  <CancelledByCustomer order={order} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
