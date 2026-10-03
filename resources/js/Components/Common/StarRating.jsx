import { Star } from "lucide-react";

export function StarRow({ value = 0, size = 14, className = "" }) {
    const rounded = Math.round(Number(value) || 0);

    return (
        <span className={`inline-flex items-center gap-0.5 ${className}`} aria-hidden="true">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={
                        star <= rounded
                            ? "fill-[color:var(--color-warning-500)] text-[color:var(--color-warning-500)]"
                            : "fill-transparent text-[color:var(--color-gray-300)]"
                    }
                />
            ))}
        </span>
    );
}

export default function StarRating({ value = 0, onChange, size = 36 }) {
    return (
        <div
            className="flex items-center justify-center gap-1 sm:gap-2"
            role="radiogroup"
            aria-label="Rating"
        >
            {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= value;

                return (
                    <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={value === star}
                        aria-label={`${star} star${star === 1 ? "" : "s"}`}
                        onClick={() => onChange?.(star)}
                        className="rounded-full p-1 transition-transform duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary-500)]"
                    >
                        <Star
                            size={size}
                            className={
                                active
                                    ? "fill-[color:var(--color-warning-500)] text-[color:var(--color-warning-500)]"
                                    : "fill-transparent text-[color:var(--color-gray-300)]"
                            }
                        />
                    </button>
                );
            })}
        </div>
    );
}
