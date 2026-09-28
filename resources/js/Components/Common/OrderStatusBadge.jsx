import Badge from "./Badge";

export const ORDER_STATUSES = [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "out_for_delivery",
    "delivered",
    "cancelled",
];

export const TERMINAL_ORDER_STATUSES = ["delivered", "cancelled"];

export const ORDER_STATUS_LABELS = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    ready: "Ready",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

export function orderStatusLabel(status, fulfillment) {
    if (status === "delivered" && fulfillment === "pickup") {
        return "Picked up";
    }

    return ORDER_STATUS_LABELS[status] ?? status;
}

const ORDER_STATUS_VARIANTS = {
    pending: "warning",
    confirmed: "primary",
    preparing: "primary",
    ready: "success",
    out_for_delivery: "success",
    delivered: "success",
    cancelled: "danger",
};

export default function OrderStatusBadge({
    status,
    fulfillment,
    size = "md",
    className = "",
}) {
    return (
        <Badge
            variant={ORDER_STATUS_VARIANTS[status] ?? "default"}
            size={size}
            className={className}
        >
            {orderStatusLabel(status, fulfillment)}
        </Badge>
    );
}
