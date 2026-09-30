import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import HorizontalCarousel from "@/Components/Common/HorizontalCarousel";

export default function CategoryFilterTabs({
    categories,
    selectedCategoryId,
    onSelect,
    query,
    onQueryChange,
}) {
    const barRef = useRef(null);
    const selectedRef = useRef(null);

    useEffect(() => {
        const bar = barRef.current;
        if (!bar) {
            return undefined;
        }

        const publishHeight = () => {
            document.documentElement.style.setProperty(
                "--menu-filter-height",
                `${bar.getBoundingClientRect().height}px`,
            );
        };

        publishHeight();
        const observer = new ResizeObserver(publishHeight);
        observer.observe(bar);

        return () => {
            observer.disconnect();
            document.documentElement.style.removeProperty(
                "--menu-filter-height",
            );
        };
    }, [categories.length]);

    useEffect(() => {
        selectedRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        });
    }, [selectedCategoryId]);

    if (categories.length === 0) {
        return null;
    }

    return (
        <div
            ref={barRef}
            data-menu-filter
            className="sticky top-[var(--customer-nav-height)] z-[var(--z-fixed)] border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] shadow-[0_0_0_100vmax_var(--color-bg-primary)] [clip-path:inset(0_-100vmax)]"
        >
            <div className="flex flex-col gap-[var(--spacing-3)] py-[var(--spacing-3)] md:flex-row md:items-center">
                <label className="relative block shrink-0 md:w-64">
                    <Search
                        size={16}
                        className="pointer-events-none absolute left-[var(--spacing-3)] top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)]"
                    />
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder="Search items"
                        aria-label="Search items"
                        className="w-full rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] py-2 pl-9 pr-9 text-sm text-[color:var(--color-text-primary)] outline-none transition-colors duration-[var(--transition-fast)] placeholder:text-[color:var(--color-text-muted)] focus:border-[color:var(--color-primary-500)]"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => onQueryChange("")}
                            className="absolute right-[var(--spacing-3)] top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-bg-secondary)]"
                            aria-label="Clear search"
                        >
                            <X size={14} />
                        </button>
                    )}
                </label>

                <HorizontalCarousel className="min-w-0 flex-1">
                    {categories.map((category) => {
                        const selected = selectedCategoryId === category.id;

                        return (
                            <button
                                key={category.id}
                                ref={selected ? selectedRef : null}
                                type="button"
                                data-selected={selected}
                                onClick={() => onSelect(category.id)}
                                className={`inline-flex shrink-0 items-center gap-[var(--spacing-2)] whitespace-nowrap rounded-full px-[var(--spacing-4)] py-2 text-sm font-medium transition-colors duration-[var(--transition-fast)] ${
                                    selected
                                        ? "bg-[color:var(--color-primary-600)] text-white"
                                        : "bg-[color:var(--color-bg-secondary)] text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-tertiary)]"
                                }`}
                            >
                                <span>{category.name}</span>
                                {category.item_count > 0 && (
                                    <span
                                        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                                            selected
                                                ? "bg-white/30 text-white"
                                                : "bg-[color:var(--color-primary-100)] text-[color:var(--color-primary-700)]"
                                        }`}
                                    >
                                        {category.item_count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </HorizontalCarousel>
            </div>
        </div>
    );
}
