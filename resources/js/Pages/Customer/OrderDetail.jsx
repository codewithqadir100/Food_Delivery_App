import { useEffect, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, MapPin, Store } from "lucide-react";
import AppLayout from "@/Layouts/AppLayout";
import CancelOrderButton from "@/Components/Customer/CancelOrderButton";
import ReviewPromptModal from "@/Components/Customer/ReviewPromptModal";
import OrderCancellationNotice from "@/Components/Common/OrderCancellationNotice";
import ItemThumb from "@/Components/Common/ItemThumb";
import OrderStatusBadge from "@/Components/Common/OrderStatusBadge";
import { StarRow } from "@/Components/Common/StarRating";
import Button from "@/Components/Common/Button";
import useCustomerOrderUpdates from "@/Hooks/useCustomerOrderUpdates";
import { fulfillmentLabel } from "@/Utils/fulfillment";
import { formatCurrency } from "@/Utils/formatCurrency";
import {
    CUSTOMER_CANCELLABLE_STATUSES,
    mergeOrderUpdates,
} from "@/Utils/orderUpdates";
import { canWriteReview } from "@/Utils/reviews";

export default function OrderDetail({ order: initialOrder, can_review = false }) {
    const [order, setOrder] = useState(initialOrder);
    const [savedReview, setSavedReview] = useState(initialOrder.review ?? null);
    const [reviewOpen, setReviewOpen] = useState(false);
    const address = order.address;
    const isPickup = order.fulfillment_type === "pickup";
    const canCancel = CUSTOMER_CANCELLABLE_STATUSES.includes(order.status);
    const writable = can_review || canWriteReview(order);

    useEffect(() => {
        setOrder(initialOrder);
        setSavedReview(initialOrder.review ?? null);
    }, [
        initialOrder.id,
        initialOrder.status,
        initialOrder.cancelled_by,
        initialOrder.cancellation_reason,
    ]);

    useCustomerOrderUpdates(true, (payload) => {
        const update = (payload.orders ?? []).find(
            (item) => item.id === initialOrder.id,
        );
        if (!update) return;

        setOrder((current) => mergeOrderUpdates([current], [update])[0]);
    });

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
                            <OrderStatusBadge
                                status={order.status}
                                fulfillment={order.fulfillment_type}
                            />
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
                                                  .join(", ") ||
                                              fulfillmentLabel(order.fulfillment_type)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <OrderCancellationNotice order={order} viewer="customer" />

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

                        {canCancel && (
                            <div className="flex flex-col items-stretch gap-3 border-t border-[color:var(--color-border-light)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-[color:var(--color-text-secondary)]">
                                    You can cancel until the restaurant starts
                                    preparing.
                                </p>
                                <CancelOrderButton
                                    orderId={order.id}
                                    onCancelled={(updated) =>
                                        setOrder((current) => ({
                                            ...current,
                                            ...updated,
                                        }))
                                    }
                                />
                            </div>
                        )}
                    </div>

                    {(writable || savedReview) && (
                        <div className="mt-4 rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] p-5 shadow-[var(--shadow-sm)]">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                                        {savedReview ? "Your review" : "How was your meal?"}
                                    </h2>
                                    {savedReview ? (
                                        <div className="mt-2">
                                            <StarRow value={savedReview.rating} />
                                            {savedReview.comment && (
                                                <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
                                                    {savedReview.comment}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                                            A star helps the next person decide.
                                        </p>
                                    )}
                                </div>
                                {writable && (
                                    <Button
                                        variant="secondary"
                                        className="w-full sm:w-auto"
                                        onClick={() => setReviewOpen(true)}
                                    >
                                        {savedReview ? "Edit review" : "Add review"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    <ReviewPromptModal
                        order={{
                            ...order,
                            restaurant_name: order.restaurant?.name,
                            review: savedReview,
                        }}
                        isOpen={reviewOpen}
                        intent="detail"
                        onClose={() => setReviewOpen(false)}
                        onSubmitted={(data) => setSavedReview(data.review)}
                    />
                </div>
            </AppLayout>
        </>
    );
}
