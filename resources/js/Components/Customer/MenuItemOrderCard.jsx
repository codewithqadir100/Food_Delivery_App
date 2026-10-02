import { Plus } from "lucide-react";
import ItemThumb from "@/Components/Common/ItemThumb";
import QuantityStepper from "@/Components/Customer/QuantityStepper";
import { formatCurrency } from "@/Utils/formatCurrency";

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
                <h3 className="text-base font-semibold text-[color:var(--color-text-primary)]">
                    {item.name}
                </h3>
                <p className="text-base font-semibold text-[color:var(--color-primary-600)]">
                    {formatCurrency(item.price)}
                </p>
                {item.description ? (
                    <p className="line-clamp-2 truncate text-xs leading-5 text-[color:var(--color-text-muted)]">
                        {item.description}
                    </p>
                ) : null}
            </div>

            <div className="relative shrink-0">
                <ItemThumb src={item.image} alt={item.name} className="w-24" />
                <div className="absolute bottom-2 right-2 z-10">
                    {inCart ? (
                        <>
                            <div className="md:hidden">
                                <QuantityStepper
                                    quantity={quantity}
                                    disabled={disabled}
                                    onDecrease={() =>
                                        onChangeQuantity?.(quantity - 1)
                                    }
                                    onIncrease={() =>
                                        onChangeQuantity?.(quantity + 1)
                                    }
                                    onRemove={onRemove}
                                />
                            </div>
                            <span
                                className="hidden h-8 min-w-8 items-center justify-center rounded-full bg-[color:var(--color-gray-800)] px-2 text-sm font-semibold text-[color:var(--color-gray-0)] shadow-[var(--shadow-md)] md:flex"
                                aria-label={`${quantity} in cart`}
                            >
                                {quantity}
                            </span>
                        </>
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
