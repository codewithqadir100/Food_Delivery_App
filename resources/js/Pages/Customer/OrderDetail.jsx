import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, MapPin, Store } from "lucide-react";
import AppLayout from "@/Layouts/AppLayout";
import OrderStatusBadge from "@/Components/Common/OrderStatusBadge";
import { formatCurrency } from "@/Utils/formatCurrency";

export default function OrderDetail({ order }) {
    const address = order.address;

    return (
        <>
            <Head title={`Order ${order.order_number}`} />
            <AppLayout>
                <div className="max-w-3xl mx-auto">
                    <Link
                        href={route("customer.orders.index")}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-primary-600)] mb-4"
                    >
                        <ArrowLeft size={16} />
                        Back to Orders
                    </Link>

                    <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)] overflow-hidden">
                        <div className="p-5 border-b border-[color:var(--color-border-light)] flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h1 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                                    {order.order_number}
                                </h1>
                                <p className="text-sm text-[color:var(--color-text-muted)] mt-1">
                                    Placed on{" "}
                                    {new Date(order.created_at).toLocaleString(
                                        [],
                                        { dateStyle: "medium", timeStyle: "short" },
                                    )}
                                </p>
                            </div>
                            <OrderStatusBadge status={order.status} />
                        </div>

                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-[color:var(--color-border-light)]">
                            <div className="flex items-start gap-2">
                                <Store
                                    size={16}
                                    className="text-[color:var(--color-primary-600)] mt-0.5"
                                />
                                <div>
                                    <p className="text-xs text-[color:var(--color-text-muted)]">
                                        Restaurant
                                    </p>
                                    <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
                                        {order.restaurant?.name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <MapPin
                                    size={16}
                                    className="text-[color:var(--color-primary-600)] mt-0.5"
                                />
                                <div>
                                    <p className="text-xs text-[color:var(--color-text-muted)]">
                                        Delivery Address
                                    </p>
                                    <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
                                        {order.delivery_address ||
                                            [
                                                address?.street_address,
                                                address?.area_name,
                                                address?.city_name,
                                            ]
                                                .filter(Boolean)
                                                .join(", ")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {order.status === "cancelled" &&
                            order.cancellation_reason && (
                                <div className="p-5 border-b border-[color:var(--color-border-light)] bg-[color:var(--color-danger-50)]">
                                    <p className="text-sm text-[color:var(--color-danger-700)]">
                                        <span className="font-semibold">
                                            Cancellation reason:
                                        </span>{" "}
                                        {order.cancellation_reason}
                                    </p>
                                </div>
                            )}

                        <div className="p-5">
                            <h2 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3">
                                Order Items
                            </h2>
                            <ul className="divide-y divide-[color:var(--color-border-light)]">
                                {order.items.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex items-center justify-between py-3"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-[color:var(--color-text-muted)]">
                                                {formatCurrency(item.price)} x{" "}
                                                {item.quantity}
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                                            {formatCurrency(item.subtotal)}
                                        </p>
                                    </li>
                                ))}
                            </ul>

                            {order.notes && (
                                <div className="mt-4 p-3 rounded-[var(--radius-md)] bg-[color:var(--color-bg-secondary)]">
                                    <p className="text-xs text-[color:var(--color-text-muted)] mb-1">
                                        Notes
                                    </p>
                                    <p className="text-sm text-[color:var(--color-text-secondary)]">
                                        {order.notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-5 border-t border-[color:var(--color-border-light)] bg-[color:var(--color-bg-secondary)] space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-[color:var(--color-text-secondary)]">
                                    Subtotal
                                </span>
                                <span className="font-medium text-[color:var(--color-text-primary)]">
                                    {formatCurrency(order.subtotal)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[color:var(--color-text-secondary)]">
                                    Delivery Fee
                                </span>
                                <span className="font-medium text-[color:var(--color-text-primary)]">
                                    {formatCurrency(order.delivery_fee)}
                                </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-[color:var(--color-border-light)] text-base">
                                <span className="font-semibold text-[color:var(--color-text-primary)]">
                                    Total
                                </span>
                                <span className="font-bold text-[color:var(--color-primary-600)]">
                                    {formatCurrency(order.total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
