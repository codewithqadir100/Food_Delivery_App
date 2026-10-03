import { useEffect, useState } from "react";
import axios from "axios";
import Button from "@/Components/Common/Button";
import Modal from "@/Components/Common/Modal";
import StarRating from "@/Components/Common/StarRating";
import TextArea from "@/Components/Forms/TextArea";
import { fulfillmentLabel } from "@/Utils/fulfillment";

export default function ReviewPromptModal({
    order,
    isOpen,
    onClose,
    onSubmitted,
    intent = "prompt",
}) {
    const existing = order?.review;
    const [rating, setRating] = useState(existing?.rating ?? 0);
    const [comment, setComment] = useState(existing?.comment ?? "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setRating(existing?.rating ?? 0);
        setComment(existing?.comment ?? "");
        setError("");
    }, [isOpen, order?.id, existing?.rating, existing?.comment]);

    const dismiss = async (countAsSkip) => {
        if (saving) {
            return;
        }

        if (countAsSkip && order?.id) {
            try {
                await axios.post(route("customer.orders.review.skip", order.id));
            } catch {
                // The session snooze from opening the prompt still hides it for now.
            }
        }

        onClose?.();
    };

    const submit = async () => {
        if (!rating || !order?.id) {
            return;
        }

        try {
            setSaving(true);
            setError("");
            const { data } = await axios.post(route("customer.orders.review.store", order.id), {
                rating,
                comment: comment.trim() || null,
            });
            onSubmitted?.(data);
            onClose?.();
        } catch (requestError) {
            setError(
                requestError.response?.data?.errors?.rating?.[0] ||
                    requestError.response?.data?.errors?.comment?.[0] ||
                    requestError.response?.data?.message ||
                    "Could not save your review. Please try again.",
            );
        } finally {
            setSaving(false);
        }
    };

    const meal = fulfillmentLabel(order?.fulfillment_type) === "Pickup" ? "pickup" : "order";

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => dismiss(intent === "prompt")}
            title="How was your meal?"
            closeButton={!saving}
            footer={
                <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                        variant="secondary"
                        className="w-full sm:w-auto"
                        disabled={saving}
                        onClick={() => dismiss(intent === "prompt")}
                    >
                        {intent === "prompt" ? "Maybe later" : "Not now"}
                    </Button>
                    <Button
                        variant="primary"
                        className="w-full sm:w-auto"
                        loading={saving}
                        disabled={!rating}
                        onClick={submit}
                    >
                        {existing ? "Update review" : "Share review"}
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
                    <span className="font-semibold text-[color:var(--color-text-primary)]">
                        {order?.restaurant_name || order?.restaurant?.name}
                    </span>{" "}
                    would love to know. One tap helps the next person order.
                </p>
                <p className="text-xs text-[color:var(--color-text-muted)]">
                    {order?.order_number}
                    {meal === "pickup" ? " · Picked up" : " · Delivered"}
                </p>
                <StarRating value={rating} onChange={setRating} />
                {!rating && (
                    <p className="text-center text-xs text-[color:var(--color-text-muted)]">
                        Tap a star to rate
                    </p>
                )}
                <TextArea
                    label="Comment"
                    rows={3}
                    maxLength={500}
                    value={comment}
                    error={error || null}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="The bite you are still thinking about."
                />
            </div>
        </Modal>
    );
}
