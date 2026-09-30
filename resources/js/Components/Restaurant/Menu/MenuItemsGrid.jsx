import { Edit2, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import MenuItemCard from "./MenuItemCard";
import Button from "@/Components/Common/Button";
import EmptyState from "@/Components/Common/EmptyState";
import Spinner from "@/Components/Common/Spinner";

export default function MenuItemsGrid({
    items,
    selectedCategory,
    onAddItem,
    onEditItem,
    onDeleteItem,
    onToggleItem,
    onEditCategory,
    onDeleteCategory,
    loading = false,
    deleting = false,
}) {
    const filteredItems = selectedCategory
        ? items.filter((item) => item.menu_category_id === selectedCategory.id)
        : [];

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Spinner />
            </div>
        );
    }

    const countLabel = `${filteredItems.length} ${
        filteredItems.length === 1 ? "item" : "items"
    }`;

    return (
        <div className="space-y-[var(--spacing-4)]">
            <div className="flex flex-col gap-[var(--spacing-3)] sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-[var(--spacing-2)]">
                        <h2 className="min-w-0 flex-1 truncate text-lg font-semibold text-[color:var(--color-text-primary)]">
                            {selectedCategory
                                ? selectedCategory.name
                                : "No category selected"}
                        </h2>
                        {selectedCategory && (
                            <div className="flex shrink-0 gap-[var(--spacing-1)] lg:hidden">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    icon={Edit2}
                                    aria-label={`Edit ${selectedCategory.name}`}
                                    title="Edit category"
                                    onClick={() => onEditCategory(selectedCategory)}
                                    className="!h-9 !px-2"
                                />
                                <Button
                                    variant="danger"
                                    size="sm"
                                    icon={Trash2}
                                    aria-label={`Delete ${selectedCategory.name}`}
                                    title="Delete category"
                                    loading={deleting === selectedCategory.id}
                                    onClick={() =>
                                        onDeleteCategory(selectedCategory.id)
                                    }
                                    className="!h-9 !px-2"
                                />
                            </div>
                        )}
                    </div>
                    {selectedCategory && (
                        <p className="mt-0.5 text-sm text-[color:var(--color-text-muted)]">
                            {countLabel}
                        </p>
                    )}
                </div>

                {selectedCategory && (
                    <Button
                        size="sm"
                        icon={Plus}
                        onClick={() => onAddItem(selectedCategory)}
                        className="w-full shrink-0 sm:w-auto"
                    >
                        Add Item
                    </Button>
                )}
            </div>

            {!selectedCategory ? (
                <EmptyState
                    icon={UtensilsCrossed}
                    title="No category selected"
                    description="Add a category, then choose it to see its dishes."
                />
            ) : filteredItems.length === 0 ? (
                <EmptyState
                    icon={UtensilsCrossed}
                    title="No items yet"
                    description={`Add the first dish to ${selectedCategory.name}.`}
                />
            ) : (
                <div className="grid grid-cols-2 gap-[var(--spacing-3)] xl:grid-cols-3 2xl:grid-cols-4">
                    {filteredItems.map((item) => (
                        <MenuItemCard
                            key={item.id}
                            item={item}
                            onEdit={onEditItem}
                            onDelete={onDeleteItem}
                            onToggle={onToggleItem}
                            loading={deleting === item.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
