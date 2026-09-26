import Badge from "./Badge";

export const ORDER_STATUS_LABELS = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    ready: "Ready",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

const ORDER_STATUS_VARIANTS = {
    pending: "warning",
    confirmed: "primary",
    preparing: "primary",
    ready: "success",
    out_for_delivery: "success",
    delivered: "success",
    cancelled: "danger",
};

export default function OrderStatusBadge({ status, size = "md", className = "" }) {
    return (
        <Badge
            variant={ORDER_STATUS_VARIANTS[status] ?? "default"}
            size={size}
            className={className}
        >
            {ORDER_STATUS_LABELS[status] ?? status}
        </Badge>
    );
}
