import { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, Mail, MapPin, Phone, User, Utensils } from "lucide-react";
import RestaurantLayout from "@/Layouts/RestaurantLayout";
import Alert from "@/Components/Common/Alert";
import OrderStatusBadge from "@/Components/Common/OrderStatusBadge";
import OrderStatusSelect from "@/Components/Restaurant/Orders/OrderStatusSelect";
import ItemThumb from "@/Components/Common/ItemThumb";
import { fulfillmentLabel } from "@/Utils/fulfillment";
import { formatCurrency } from "@/Utils/formatCurrency";

export default function OrderDetail({ order: initialOrder }) {
    const [order, setOrder] = useState(initialOrder);
    const [alert, setAlert] = useState(null);
    const address = order.address;
    const isPickup = order.fulfillment_type === "pickup";

    return (
        <>
            <Head title={`Order ${order.order_number}`} />
            <RestaurantLayout
                pageTitle={`Order ${order.order_number}`}
                pageSubtitle="Review order details and update its status"
            >
                <div className="max-w-3xl mx-auto space-y-4">
                    <Link
                        href={route("restaurant.orders.index")}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-primary-600)]"
                    >
                        <ArrowLeft size={16} />
                        Back to Orders
                    </Link>

                    {alert && (
                        <Alert
                            type={alert.type}
                            title={alert.title}
                            message={alert.message}
                            onClose={() => setAlert(null)}
                        />
                    )}

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
                            <OrderStatusBadge
                                status={order.status}
                                fulfillment={order.fulfillment_type}
                            />
                        </div>

                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-[color:var(--color-border-light)]">
                            <div className="flex items-start gap-2">
                                <User
                                    size={16}
                                    className="text-[color:var(--color-primary-600)] mt-0.5"
                                />
                                <div>
                                    <p className="text-xs text-[color:var(--color-text-muted)]">
                                        Customer
                                    </p>
                                    <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
                                        {order.customer?.name}
                                    </p>
                                    {order.customer?.phone && (
                                        <p className="text-xs text-[color:var(--color-text-secondary)] flex items-center gap-1 mt-0.5">
                                            <Phone size={12} />
                                            {order.customer.phone}
                                        </p>
                                    )}
                                    {order.customer?.email && (
                                        <p className="text-xs text-[color:var(--color-text-secondary)] flex items-center gap-1 mt-0.5">
                                            <Mail size={12} />
                                            {order.customer.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <MapPin
                                    size={16}
                                    className="text-[color:var(--color-primary-600)] mt-0.5"
                                />
                                <div>
                                    <p className="text-xs text-[color:var(--color-text-muted)]">
                                        {isPickup ? "Fulfillment" : "Delivery Address"}
                                    </p>
                                    <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
                                        {isPickup
                                            ? "Pickup"
                                            : order.delivery_address ||
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
                                        className="flex items-center gap-3 py-3"
                                    >
                                        <ItemThumb
                                            src={item.menu_item?.image_url}
                                            alt={item.name}
                                        />
                                        <div className="min-w-0 flex-1">
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

                            {order.wants_cutlery ? (
                                <div className="mt-[var(--spacing-4)] flex items-start gap-[var(--spacing-3)] rounded-[var(--radius-md)] bg-[color:var(--color-primary-50)] p-[var(--spacing-4)]">
                                    <Utensils
                                        size={16}
                                        className="mt-0.5 shrink-0 text-[color:var(--color-primary-600)]"
                                    />
                                    <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
                                        Customer wants cutlery with this order.
                                    </p>
                                </div>
                            ) : null}

                            {order.notes && (
                                <div className="mt-4 p-3 rounded-[var(--radius-md)] bg-[color:var(--color-bg-secondary)]">
                                    <p className="text-xs text-[color:var(--color-text-muted)] mb-1">
                                        Customer notes
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

                    <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)] p-5">
                        <h2 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-1">
                            Update Status
                        </h2>
                        <p className="mb-3 text-xs text-[color:var(--color-text-muted)]">
                            {fulfillmentLabel(order.fulfillment_type)}
                        </p>
                        <div className="max-w-xs">
                            <OrderStatusSelect
                                orderId={order.id}
                                status={order.status}
                                fulfillment={order.fulfillment_type}
                                onUpdated={(updated) => {
                                    setOrder((current) => ({
                                        ...current,
                                        status: updated.status,
                                        cancellation_reason:
                                            updated.cancellation_reason,
                                        confirmed_at: updated.confirmed_at,
                                        delivered_at: updated.delivered_at,
                                        cancelled_at: updated.cancelled_at,
                                    }));
                                    setAlert({
                                        type: "success",
                                        title: "Updated",
                                        message: "Order status updated.",
                                    });
                                }}
                            />
                        </div>
                    </div>
                </div>
            </RestaurantLayout>
        </>
    );
}
