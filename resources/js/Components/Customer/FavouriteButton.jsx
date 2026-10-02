import { Heart } from "lucide-react";
import { useBounce } from "@/Hooks/useBounce";

export default function FavouriteButton({
    active = false,
    onClick,
    className = "",
}) {
    const { bounce, bounceTick, bounceClassName } = useBounce();

    return (
        <button
            type="button"
            aria-pressed={active}
            aria-label={active ? "Remove from favourites" : "Add to favourites"}
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                bounce();
                onClick?.();
            }}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)] transition-colors duration-[var(--transition-fast)] hover:bg-[color:var(--color-bg-secondary)] ${className}`}
        >
            <Heart
                key={bounceTick}
                size={18}
                className={`${bounceClassName} ${
                    active
                        ? "fill-[color:var(--color-primary-500)] text-[color:var(--color-primary-500)]"
                        : "text-[color:var(--color-text-secondary)]"
                }`}
            />
        </button>
    );
}
