import { Minus, Plus, Trash2 } from "lucide-react";

export const MAX_QUANTITY = 20;

export default function QuantityStepper({
    quantity,
    disabled = false,
    onDecrease,
    onIncrease,
    onRemove,
}) {
    const isLast = quantity <= 1;

    return (
        <div className="inline-flex shrink-0 items-center rounded-full border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)]">
            <button
                type="button"
                disabled={disabled}
                onClick={isLast ? onRemove : onDecrease}
                className={`flex h-9 w-9 items-center justify-center disabled:opacity-50 ${
                    isLast
                        ? "text-[color:var(--color-danger-600)]"
                        : "text-[color:var(--color-text-secondary)]"
                }`}
                aria-label={isLast ? "Remove item" : "Decrease quantity"}
            >
                {isLast ? <Trash2 size={15} /> : <Minus size={15} />}
            </button>
            <span className="w-6 text-center text-sm font-semibold text-[color:var(--color-text-primary)]">
                {quantity}
            </span>
            <button
                type="button"
                disabled={disabled || quantity >= MAX_QUANTITY}
                onClick={onIncrease}
                className="flex h-9 w-9 items-center justify-center text-[color:var(--color-primary-600)] disabled:opacity-50"
                aria-label="Increase quantity"
            >
                <Plus size={15} />
            </button>
        </div>
    );
}
