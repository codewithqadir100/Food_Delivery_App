import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HorizontalCarousel({
    children,
    className = "",
    gapClassName = "gap-3",
    snap = false,
}) {
    const scrollerRef = useRef(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);

    const update = useCallback(() => {
        const el = scrollerRef.current;
        if (!el) return;

        const maxScroll = el.scrollWidth - el.clientWidth;
        setCanPrev(el.scrollLeft > 4);
        setCanNext(maxScroll > 4 && el.scrollLeft < maxScroll - 4);
    }, []);

    useLayoutEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        update();
        el.addEventListener("scroll", update, { passive: true });

        const observer = new ResizeObserver(update);
        observer.observe(el);

        return () => {
            el.removeEventListener("scroll", update);
            observer.disconnect();
        };
    }, [update, children]);

    const scrollByDirection = (direction) => {
        const el = scrollerRef.current;
        if (!el) return;

        const card = snap ? el.firstElementChild : null;
        const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 0;
        const distance = card
            ? card.getBoundingClientRect().width + gap
            : Math.max(el.clientWidth * 0.85, 140);

        el.scrollBy({
            left: direction * distance,
            behavior: "smooth",
        });
    };

    const canScroll = canPrev || canNext;
    const buttonClass = (enabled) =>
        `absolute top-1/2 z-[var(--z-dropdown)] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] text-[color:var(--color-text-primary)] shadow-[var(--shadow-sm)] transition-opacity duration-[var(--transition-fast)] ${
            enabled
                ? "hover:bg-[color:var(--color-bg-secondary)]"
                : "pointer-events-none opacity-40"
        }`;

    return (
        <div className={`relative ${className}`}>
            <div
                ref={scrollerRef}
                className={`scrollbar-none flex overflow-x-auto scroll-smooth ${gapClassName} ${
                    canScroll ? "px-9" : ""
                } ${
                    snap
                        ? `snap-x snap-mandatory [&>*]:snap-start ${canScroll ? "scroll-px-9" : ""}`
                        : ""
                }`}
            >
                {children}
            </div>

            {canScroll && (
                <>
                    <button
                        type="button"
                        onClick={() => scrollByDirection(-1)}
                        disabled={!canPrev}
                        className={`${buttonClass(canPrev)} left-0`}
                        aria-label="Previous"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollByDirection(1)}
                        disabled={!canNext}
                        className={`${buttonClass(canNext)} right-0`}
                        aria-label="Next"
                    >
                        <ChevronRight size={16} />
                    </button>
                </>
            )}
        </div>
    );
}
