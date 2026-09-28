import { useEffect, useState } from "react";
import axios from "axios";
import Button from "@/Components/Common/Button";
import Modal from "@/Components/Common/Modal";
import OrderStatusBadge, {
    ORDER_STATUSES,
    TERMINAL_ORDER_STATUSES,
    orderStatusLabel,
} from "@/Components/Common/OrderStatusBadge";
import TextArea from "@/Components/Forms/TextArea";
import SelectInput from "@/Components/Forms/SelectInput";

const CONFIRM_STATUSES = ["delivered", "cancelled"];

export default function OrderStatusSelect({
    orderId,
    status,
    fulfillment,
    onUpdated,
    className = "",
}) {
    const [current, setCurrent] = useState(status);
    const [pendingStatus, setPendingStatus] = useState(null);
    const [reason, setReason] = useState("");
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setCurrent(status);
    }, [status]);

    const locked = TERMINAL_ORDER_STATUSES.includes(current);
    const isPickup = fulfillment === "pickup";
    const finishedLabel = orderStatusLabel("delivered", fulfillment);
    const statusOptions = ORDER_STATUSES.map((value) => ({
        value,
        label: orderStatusLabel(value, fulfillment),
    }));

    const closeModal = () => {
        if (updating) return;
        setPendingStatus(null);
        setReason("");
    };

    const applyStatus = async (nextStatus, cancellationReason = null) => {
        try {
            setUpdating(true);
            setError("");
            const res = await axios.patch(
                route("restaurant.orders.update-status", orderId),
                {
                    status: nextStatus,
                    cancellation_reason: cancellationReason,
                },
            );
            setCurrent(res.data.data.status);
            setPendingStatus(null);
            setReason("");
            onUpdated?.(res.data.data);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Could not update this order. Please try again.",
            );
        } finally {
            setUpdating(false);
        }
    };

    const handleChange = (event) => {
        const nextStatus = event.target.value;
        if (!nextStatus || nextStatus === current) return;

        if (CONFIRM_STATUSES.includes(nextStatus)) {
            setPendingStatus(nextStatus);
            setReason("");
            setError("");
            return;
        }

        applyStatus(nextStatus);
    };

    const confirm = () => {
        if (pendingStatus === "cancelled" && reason.trim() === "") return;
        applyStatus(
            pendingStatus,
            pendingStatus === "cancelled" ? reason.trim() : null,
        );
    };

    return (
        <div
            className={className}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
        >
            {locked ? (
                <OrderStatusBadge
                    status={current}
                    fulfillment={fulfillment}
                    size="sm"
                />
            ) : (
                <SelectInput
                    allowEmpty={false}
                    options={statusOptions}
                    value={current}
                    disabled={updating}
                    error={error || null}
                    onChange={handleChange}
                    aria-label="Order status"
                />
            )}

            <Modal
                isOpen={pendingStatus === "delivered"}
                onClose={closeModal}
                title={isPickup ? "Mark as picked up?" : "Mark as delivered?"}
                closeButton={!updating}
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={closeModal}
                            disabled={updating}
                        >
                            Not yet
                        </Button>
                        <Button
                            variant="primary"
                            loading={updating}
                            onClick={confirm}
                        >
                            {isPickup ? "Yes, picked up" : "Yes, delivered"}
                        </Button>
                    </>
                }
            >
                <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
                    Are you sure this order has been {finishedLabel.toLowerCase()}?
                    This status cannot be changed.
                </p>
            </Modal>

            <Modal
                isOpen={pendingStatus === "cancelled"}
                onClose={closeModal}
                title="Cancel this order?"
                closeButton={!updating}
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={closeModal}
                            disabled={updating}
                        >
                            Keep order
                        </Button>
                        <Button
                            variant="danger"
                            loading={updating}
                            disabled={reason.trim() === ""}
                            onClick={confirm}
                        >
                            Cancel order
                        </Button>
                    </>
                }
            >
                <div className="space-y-3">
                    <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
                        Are you sure you want to cancel this order? This status
                        cannot be changed.
                    </p>
                    <TextArea
                        label="Reason"
                        required
                        rows={3}
                        maxLength={255}
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Tell the customer why this order was cancelled"
                    />
                </div>
            </Modal>
        </div>
    );
}
