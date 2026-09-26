import { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import { ArrowLeft, Mail, MapPin, Phone, User } from "lucide-react";
import RestaurantLayout from "@/Layouts/RestaurantLayout";
import Alert from "@/Components/Common/Alert";
import Button from "@/Components/Common/Button";
import OrderStatusBadge, {
    ORDER_STATUS_LABELS,
} from "@/Components/Common/OrderStatusBadge";
import { formatCurrency } from "@/Utils/formatCurrency";

export default function OrderDetail({ order: initialOrder, next_statuses }) {
    const [order, setOrder] = useState(initialOrder);
    const [nextStatuses, setNextStatuses] = useState(next_statuses);
    const [updating, setUpdating] = useState(false);
    const [alert, setAlert] = useState(null);

    const handleStatusChange = async (status) => {
        if (status === "cancelled") {
            const reason = window.prompt(
                "Please provide a reason for cancelling this order:",
            );
            if (!reason) return;

            return updateStatus(status, reason);
        }

        if (
            !confirm(
                `Mark this order as "${ORDER_STATUS_LABELS[status]}"?`,
            )
        ) {
            return;
        }

        updateStatus(status);
    };

    const updateStatus = async (status, cancellationReason = null) => {
        try {
            setUpdating(true);
            const res = await axios.patch(
                route("restaurant.orders.update-status", order.id),
                {
                    status,
                    cancellation_reason: cancellationReason,
                },
            );

            setOrder(res.data.data);
            setNextStatuses(res.data.next_statuses);
            setAlert({
                type: "success",
                title: "Updated",
                message: res.data.message,
            });
        } catch (error) {
            setAlert({
                type: "error",
                title: "Error",
                message:
                    error.response?.data?.message ||
                    "Failed to update order status",
            });
        } finally {
            setUpdating(false);
        }
    };

    const address = order.address;

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
                            <OrderStatusBadge status={order.status} />
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

                    {nextStatuses.length > 0 && (
                        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)] p-5">
                            <h2 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3">
                                Update Status
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {nextStatuses.map((status) => (
                                    <Button
                                        key={status}
                                        variant={
                                            status === "cancelled"
                                                ? "danger"
                                                : "primary"
                                        }
                                        loading={updating}
                                        onClick={() =>
                                            handleStatusChange(status)
                                        }
                                    >
                                        {status === "cancelled"
                                            ? "Cancel Order"
                                            : `Mark as ${ORDER_STATUS_LABELS[status]}`}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </RestaurantLayout>
        </>
    );
}
