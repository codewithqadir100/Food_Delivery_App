import { useEffect, useRef } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import Button from "@/Components/Common/Button";
import EmptyState from "@/Components/Common/EmptyState";
import HorizontalCarousel from "@/Components/Common/HorizontalCarousel";
import Spinner from "@/Components/Common/Spinner";

const chipClass = (selected) =>
    `inline-flex shrink-0 items-center gap-[var(--spacing-2)] whitespace-nowrap rounded-full px-[var(--spacing-4)] py-2 text-sm font-medium transition-colors duration-[var(--transition-fast)] ${
        selected
            ? "bg-[color:var(--color-primary-600)] text-white"
            : "bg-[color:var(--color-bg-secondary)] text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-tertiary)]"
    }`;

export function MenuCategoryCarousel({
    categories,
    selectedCategory,
    onSelect,
}) {
    const selectedRef = useRef(null);

    useEffect(() => {
        selectedRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        });
    }, [selectedCategory?.id]);

    if (categories.length === 0) {
        return null;
    }

    return (
        <HorizontalCarousel>
            {categories.map((category) => {
                const selected = selectedCategory?.id === category.id;

                return (
                    <button
                        key={category.id}
                        ref={selected ? selectedRef : null}
                        type="button"
                        onClick={() => onSelect(category)}
                        className={chipClass(selected)}
                    >
                        {category.name}
                    </button>
                );
            })}
        </HorizontalCarousel>
    );
}

function CategoryActions({ category, onEdit, onDelete, deleting }) {
    const busy = deleting === category.id;

    return (
        <div className="flex shrink-0">
            <button
                type="button"
                aria-label={`Edit ${category.name}`}
                title="Edit"
                disabled={busy}
                onClick={() => onEdit(category)}
                className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--color-text-secondary)] transition-colors duration-[var(--transition-fast)] hover:bg-[color:var(--color-primary-600)] hover:text-white disabled:opacity-50"
            >
                <Edit2 className="h-4 w-4" />
            </button>
            <button
                type="button"
                aria-label={`Delete ${category.name}`}
                title="Delete"
                disabled={busy}
                onClick={() => onDelete(category.id)}
                className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--color-danger-600)] transition-colors duration-[var(--transition-fast)] hover:bg-[color:var(--color-danger-600)] hover:text-white disabled:opacity-50"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
}

export default function MenuCategoryList({
    categories,
    selectedCategory,
    onSelect,
    onAdd,
    onEdit,
    onDelete,
    loading = false,
    deleting = false,
}) {
    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="space-y-[var(--spacing-3)]">
            <Button size="sm" fullWidth onClick={onAdd} icon={Plus}>
                Add Category
            </Button>

            {categories.length === 0 ? (
                <EmptyState
                    title="No categories yet"
                    description="Create a category, then add dishes to it."
                />
            ) : (
                <ul className="space-y-[var(--spacing-1)]">
                    {categories.map((category) => {
                        const selected = selectedCategory?.id === category.id;
                        const count = category.menu_items_count ?? 0;

                        return (
                            <li key={category.id}>
                                <div
                                    className={`flex items-center gap-[var(--spacing-1)] rounded-[var(--radius-md)] pr-1 transition-colors duration-[var(--transition-fast)] ${
                                        selected
                                            ? "bg-[color:var(--color-primary-100)] text-[color:var(--color-primary-700)]"
                                            : "text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)]"
                                    }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => onSelect(category)}
                                        className="min-w-0 flex-1 px-[var(--spacing-3)] py-2.5 text-left"
                                    >
                                        <p className="truncate text-sm font-medium">
                                            {category.name}
                                        </p>
                                        <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)]">
                                            {count} {count === 1 ? "item" : "items"}
                                        </p>
                                    </button>
                                    <CategoryActions
                                        category={category}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        deleting={deleting}
                                    />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
