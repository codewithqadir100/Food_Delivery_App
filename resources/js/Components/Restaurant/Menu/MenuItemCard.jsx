import { Edit2, Eye, EyeOff, ImageOff, Trash2 } from "lucide-react";
import Badge from "@/Components/Common/Badge";
import Button from "@/Components/Common/Button";
import Card from "@/Components/Common/Card";
import { formatCurrency } from "@/Utils/formatCurrency";

export default function MenuItemCard({
    item,
    onEdit,
    onDelete,
    onToggle,
    loading = false,
}) {
    return (
        <Card padding="none" className="min-w-0">
            <div className="relative aspect-square overflow-hidden bg-[color:var(--color-bg-secondary)]">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-[color:var(--color-text-muted)]">
                        <ImageOff size={20} />
                    </div>
                )}
                {!item.is_available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 px-2">
                        <Badge variant="default" size="sm">
                            Unavailable
                        </Badge>
                    </div>
                )}
            </div>

            <div className="space-y-[var(--spacing-1)] p-[var(--spacing-2)] sm:p-[var(--spacing-3)]">
                <h3 className="truncate text-sm font-semibold text-[color:var(--color-text-primary)]">
                    {item.name}
                </h3>
                <p className="truncate text-sm font-semibold text-[color:var(--color-primary-600)]">
                    {formatCurrency(item.price)}
                </p>
                {item.description ? (
                    <p className="truncate text-xs text-[color:var(--color-text-muted)]">
                        {item.description}
                    </p>
                ) : null}

                <div className="grid grid-cols-3 gap-[var(--spacing-1)] pt-[var(--spacing-1)]">
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit2}
                        aria-label={`Edit ${item.name}`}
                        title="Edit"
                        disabled={loading}
                        onClick={() => onEdit(item)}
                        className="!h-9 !w-full !px-0"
                    />
                    <Button
                        variant="secondary"
                        size="sm"
                        aria-label={
                            item.is_available
                                ? `Mark ${item.name} unavailable`
                                : `Mark ${item.name} available`
                        }
                        title={
                            item.is_available
                                ? "Mark unavailable"
                                : "Mark available"
                        }
                        disabled={loading}
                        onClick={() => onToggle(item.id)}
                        className="!h-9 !w-full !px-0"
                    >
                        {item.is_available ? (
                            <Eye
                                size={16}
                                className="text-[color:var(--color-success-600)]"
                            />
                        ) : (
                            <EyeOff
                                size={16}
                                className="text-[color:var(--color-danger-600)]"
                            />
                        )}
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        aria-label={`Delete ${item.name}`}
                        title="Delete"
                        disabled={loading}
                        onClick={() => onDelete(item.id)}
                        className="!h-9 !w-full !px-0"
                    />
                </div>
            </div>
        </Card>
    );
}
