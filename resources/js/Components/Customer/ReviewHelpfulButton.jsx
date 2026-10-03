import { ThumbsUp } from "lucide-react";
import { usePage } from "@inertiajs/react";

export default function ReviewHelpfulButton({
    reviewId,
    count = 0,
    marked = false,
    onToggle,
}) {
    const user = usePage().props.auth?.user;

    const press = () => {
        if (!user?.is_customer) {
            window.location.assign(route("customer.reviews.helpful.login", reviewId));
            return;
        }

        onToggle?.(reviewId);
    };

    return (
        <button
            type="button"
            onClick={press}
            aria-pressed={marked}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium transition-colors ${
                marked
                    ? "text-[color:var(--color-primary-600)]"
                    : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-secondary)]"
            }`}
        >
            <ThumbsUp
                size={16}
                className={marked ? "fill-[color:var(--color-primary-600)]" : ""}
            />
            Helpful{count > 0 ? ` ${count}` : ""}
        </button>
    );
}
