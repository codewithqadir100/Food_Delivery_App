import { useState } from "react";
import axios from "axios";
import Button from "@/Components/Common/Button";
import TextArea from "@/Components/Forms/TextArea";
import { reviewAge } from "@/Utils/reviews";

export default function ReviewResponse({
    review,
    restaurantName,
    restaurantLogo,
    viewer = "customer",
    onReplied,
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(review.reply ?? "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const canReply = viewer === "restaurant" && Boolean(review.comment);

    const openEditor = () => {
        setDraft(review.reply ?? "");
        setError("");
        setEditing(true);
    };

    const closeEditor = () => {
        setEditing(false);
        setError("");
    };

    const save = async () => {
        const reply = draft.trim();

        if (!reply) {
            setError("Write a short reply before saving.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const { data } = await axios.post(route("restaurant.reviews.reply", review.id), {
                reply,
            });
            onReplied?.(data.review);
            setEditing(false);
        } catch (requestError) {
            setError(
                requestError.response?.data?.errors?.reply?.[0] ||
                    requestError.response?.data?.message ||
                    "Could not save the reply.",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            {review.reply && !editing && (
                <div className="mt-[var(--spacing-3)] border-t border-[color:var(--color-border-light)] pt-[var(--spacing-3)]">
                    <div className="flex items-start gap-[var(--spacing-3)]">
                        <RestaurantMark name={restaurantName} logo={restaurantLogo} />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold leading-5 text-[color:var(--color-text-primary)]">
                                Response from {restaurantName}
                            </p>
                            {review.replied_at && (
                                <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)]">
                                    {reviewAge(review.replied_at)}
                                </p>
                            )}
                            <p className="mt-[var(--spacing-2)] whitespace-pre-wrap break-words text-sm leading-6 text-[color:var(--color-text-secondary)]">
                                {review.reply}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {canReply && !editing && (
                <div className="mt-[var(--spacing-3)]">
                    <Button variant="secondary" size="sm" onClick={openEditor}>
                        {review.reply ? "Edit reply" : "Reply"}
                    </Button>
                </div>
            )}

            {canReply && editing && (
                <div className="mt-[var(--spacing-3)] border-t border-[color:var(--color-border-light)] pt-[var(--spacing-3)]">
                    <TextArea
                        label="Reply"
                        required
                        rows={3}
                        maxLength={500}
                        value={draft}
                        placeholder="Thank them in a sentence or two."
                        error={error}
                        onChange={(event) => setDraft(event.target.value)}
                    />
                    <div className="mt-[var(--spacing-3)] flex justify-end gap-[var(--spacing-2)]">
                        <Button variant="secondary" size="sm" onClick={closeEditor} disabled={saving}>
                            Cancel
                        </Button>
                        <Button size="sm" loading={saving} onClick={save}>
                            Save reply
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}

function RestaurantMark({ name, logo }) {
    const letter = name?.trim()?.charAt(0)?.toUpperCase() || "R";

    if (logo) {
        return (
            <img
                src={logo}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
        );
    }

    return (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary-50)] text-sm font-semibold text-[color:var(--color-primary-700)]">
            {letter}
        </span>
    );
}
