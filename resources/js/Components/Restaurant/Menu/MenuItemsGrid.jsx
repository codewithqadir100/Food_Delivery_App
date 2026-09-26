import MenuItemCard from "./MenuItemCard";
import Button from "@/Components/Common/Button";
import { Plus } from "lucide-react";
import Spinner from "@/Components/Common/Spinner";

export default function MenuItemsGrid({
    items,
    selectedCategory,
    onAddItem,
    onEditItem,
    onDeleteItem,
    onToggleItem,
    loading = false,
    deleting = false,
}) {
    const filteredItems = selectedCategory
        ? items.filter((item) => item.menu_category_id === selectedCategory.id)
        : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                    {selectedCategory
                        ? selectedCategory.name
                        : "No Category Selected"}
                </h3>
                {selectedCategory && (
                    <Button
                        size="sm"
                        onClick={() => onAddItem(selectedCategory)}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Item
                    </Button>
                )}
            </div>

            {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-[color:var(--color-text-muted)] mb-4">
                        No items in this category yet
                    </p>
                    {selectedCategory && (
                        <Button
                            onClick={() => onAddItem(selectedCategory)}
                            className="inline-flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create First Item
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
