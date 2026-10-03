import { useState } from "react";
import axios from "axios";
import Button from "@/Components/Common/Button";
import Modal from "@/Components/Common/Modal";
import TextArea from "@/Components/Forms/TextArea";

export default function CancelOrderButton({ orderId, onCancelled }) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");

    const closeModal = () => {
        if (updating) return;
        setOpen(false);
        setReason("");
        setError("");
    };

    const confirm = async () => {
        if (reason.trim() === "") return;

        try {
            setUpdating(true);
            setError("");
            const res = await axios.patch(route("customer.orders.cancel", orderId), {
                cancellation_reason: reason.trim(),
            });
            setOpen(false);
            setReason("");
            onCancelled?.(res.data.data);
        } catch (requestError) {
            const validationMessage =
                requestError.response?.data?.errors?.cancellation_reason?.[0];
            setError(
                validationMessage ||
                    requestError.response?.data?.message ||
                    "Could not cancel this order. Please try again.",
            );
        } finally {
            setUpdating(false);
        }
    };

    return (
        <>
            <Button
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setOpen(true)}
            >
                Cancel order
            </Button>

            <Modal
                isOpen={open}
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
                        Are you sure you want to cancel this order? This cannot
                        be undone. You can cancel until the restaurant starts
                        preparing.
                    </p>
                    <TextArea
                        label="Reason"
                        required
                        rows={3}
                        maxLength={255}
                        value={reason}
                        error={error || null}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Tell the restaurant why you are cancelling"
                    />
                </div>
            </Modal>
        </>
    );
}
