import { Minus, Plus, Trash2 } from "lucide-react";
import ItemThumb from "@/Components/Common/ItemThumb";
import { formatCurrency } from "@/Utils/formatCurrency";

const MAX_QUANTITY = 20;

export default function MenuItemOrderCard({
    item,
    quantity = 0,
    canOrder = true,
    busy = false,
    onAdd,
    onChangeQuantity,
    onRemove,
}) {
    const inCart = quantity > 0;
    const disabled = !canOrder || busy;

    return (
        <article className="flex items-start gap-[var(--spacing-4)] rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-[var(--spacing-3)]">
            <div className="min-w-0 flex-1 space-y-1">
                <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                    {item.name}
                </h3>
                <p className="text-sm font-semibold text-[color:var(--color-primary-600)]">
                    {formatCurrency(item.price)}
                </p>
                {item.description ? (
                    <p className="text-xs leading-5 truncate line-clamp-2 text-[color:var(--color-text-muted)]">
                        {item.description}
                    </p>
                ) : null}
            </div>

            <div className="relative shrink-0">
                <ItemThumb src={item.image} alt={item.name} className="w-24" />
                <div className="absolute bottom-2 right-2 z-10">
                    {inCart ? (
                        <QuantityStepper
                            quantity={quantity}
                            disabled={disabled}
                            onDecrease={() => onChangeQuantity?.(quantity - 1)}
                            onIncrease={() => onChangeQuantity?.(quantity + 1)}
                            onRemove={onRemove}
                        />
                    ) : (
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={onAdd}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] text-[color:var(--color-text-primary)] shadow-[var(--shadow-md)] transition-colors duration-[var(--transition-fast)] hover:bg-[color:var(--color-bg-tertiary)] disabled:opacity-50"
                            aria-label={`Add ${item.name}`}
                        >
                            <Plus size={16} />
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

function QuantityStepper({
    quantity,
    disabled,
    onDecrease,
    onIncrease,
    onRemove,
}) {
    const isLast = quantity <= 1;

    return (
        <div className="inline-flex items-center rounded-full bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-md)]">
            <button
                type="button"
                disabled={disabled}
                onClick={isLast ? onRemove : onDecrease}
                className={`flex h-8 w-8 items-center justify-center disabled:opacity-50 ${
                    isLast
                        ? "text-[color:var(--color-danger-600)]"
                        : "text-[color:var(--color-text-secondary)]"
                }`}
                aria-label={isLast ? "Remove item" : "Decrease quantity"}
            >
                {isLast ? <Trash2 size={14} /> : <Minus size={14} />}
            </button>
            <span className="w-5 text-center text-sm font-semibold text-[color:var(--color-text-primary)]">
                {quantity}
            </span>
            <button
                type="button"
                disabled={disabled || quantity >= MAX_QUANTITY}
                onClick={onIncrease}
                className="flex h-8 w-8 items-center justify-center text-[color:var(--color-primary-600)] disabled:opacity-50"
                aria-label="Increase quantity"
            >
                <Plus size={14} />
            </button>
        </div>
    );
}
