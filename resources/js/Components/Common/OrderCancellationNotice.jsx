import {
    CANCELLED_BY_CUSTOMER,
    CANCELLED_BY_RESTAURANT,
} from "@/Utils/orderUpdates";

function noticeTitle(viewer, cancelledBy) {
    if (viewer === "customer" && cancelledBy === CANCELLED_BY_CUSTOMER) {
        return "You cancelled this order";
    }

    if (viewer === "customer" && cancelledBy === CANCELLED_BY_RESTAURANT) {
        return "The restaurant cancelled this order";
    }

    if (viewer === "restaurant" && cancelledBy === CANCELLED_BY_CUSTOMER) {
        return "Cancelled by customer";
    }

    if (viewer === "restaurant" && cancelledBy === CANCELLED_BY_RESTAURANT) {
        return "You cancelled this order";
    }

    return "This order was cancelled";
}

export default function OrderCancellationNotice({ order, viewer }) {
    if (order?.status !== "cancelled") return null;

    return (
        <div className="p-5 border-b border-[color:var(--color-border-light)] bg-[color:var(--color-danger-50)]">
            <p className="text-sm font-semibold text-[color:var(--color-danger-700)]">
                {noticeTitle(viewer, order.cancelled_by)}
            </p>
            {order.cancellation_reason && (
                <p className="mt-1 text-sm text-[color:var(--color-danger-700)]">
                    <span className="font-semibold">Reason:</span>{" "}
                    {order.cancellation_reason}
                </p>
            )}
        </div>
    );
}
