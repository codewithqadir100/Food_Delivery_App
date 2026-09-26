import { useState } from "react";
import { Edit2, Trash2, Plus, ChevronRight } from "lucide-react";
import Button from "@/Components/Common/Button";
import Spinner from "@/Components/Common/Spinner";

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
    const [hoveredId, setHoveredId] = useState(null);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <Button
                size="sm"
                onClick={onAdd}
                className="w-full flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" />
                Add Category
            </Button>

            <div className="space-y-1">
                {categories.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-[color:var(--color-text-muted)]">
                            No categories yet
                        </p>
                    </div>
                ) : (
                    categories.map((category) => (
                        <div
                            key={category.id}
                            onMouseEnter={() => setHoveredId(category.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className={`
                                group relative px-3 py-2.5 rounded-[var(--radius-md)] cursor-pointer
                                transition-all duration-[var(--transition-fast)]
                                ${
                                    selectedCategory?.id === category.id
                                        ? "bg-[color:var(--color-primary-100)] text-[color:var(--color-primary-700)]"
                                        : "hover:bg-[color:var(--color-bg-secondary)] text-[color:var(--color-text-primary)]"
                                }
                            `}
                        >
                            <div
                                onClick={() => onSelect(category)}
                                className="flex items-center justify-between"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">
                                        {category.name}
                                    </p>
                                    {category.menu_items_count > 0 && (
                                        <p className="text-xs text-[color:var(--color-text-muted)] mt-0.5">
                                            {category.menu_items_count} items
                                        </p>
                                    )}
                                </div>
                                {selectedCategory?.id === category.id && (
                                    <ChevronRight className="w-4 h-4 ml-2 flex-shrink-0" />
                                )}
                            </div>

                            {hoveredId === category.id && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(category);
                                        }}
                                        className="p-1.5 rounded-[var(--radius-md)] hover:bg-[color:var(--color-primary-600)] hover:text-white transition-colors duration-[var(--transition-fast)]"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(category.id);
                                        }}
                                        disabled={deleting === category.id}
                                        className="p-1.5 rounded-[var(--radius-md)] hover:bg-[color:var(--color-danger-600)] hover:text-white transition-colors duration-[var(--transition-fast)]"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
