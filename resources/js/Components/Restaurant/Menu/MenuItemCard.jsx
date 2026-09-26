import { Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import Button from "@/Components/Common/Button";

export default function MenuItemCard({
    item,
    onEdit,
    onDelete,
    onToggle,
    loading = false,
}) {
    return (
        <div className="rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-shadow duration-[var(--transition-normal)] bg-[color:var(--color-bg-primary)]">
            <div className="relative h-40 overflow-hidden bg-[color:var(--color-bg-secondary)]">
                {item.image ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[color:var(--color-text-muted)] text-sm">
                            No image
                        </span>
                    </div>
                )}
                {!item.is_available && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                            Unavailable
                        </span>
                    </div>
                )}
            </div>

            <div className="p-3 space-y-2">
                <h3 className="font-semibold text-sm text-[color:var(--color-text-primary)] line-clamp-1">
                    {item.name}
                </h3>

                <p className="text-xs text-[color:var(--color-text-muted)] line-clamp-2">
                    {item.description}
                </p>

                <div className="flex items-center justify-between pt-1">
                    <p className="font-bold text-[color:var(--color-primary-600)]">
                        Rs. {parseFloat(item.price).toFixed(0)}
                    </p>
                    <button
                        onClick={() => onToggle(item.id)}
                        disabled={loading}
                        className="p-1.5 rounded-[var(--radius-md)] hover:bg-[color:var(--color-bg-secondary)] transition-colors duration-[var(--transition-fast)]"
                        title={
                            item.is_available
                                ? "Mark unavailable"
                                : "Mark available"
                        }
                    >
                        {item.is_available ? (
                            <Eye className="w-4 h-4 text-[color:var(--color-success-600)]" />
                        ) : (
                            <EyeOff className="w-4 h-4 text-[color:var(--color-danger-600)]" />
                        )}
                    </button>
                </div>

                <div className="flex gap-2 pt-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onEdit(item)}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-1.5"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onDelete(item.id)}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-1.5"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
