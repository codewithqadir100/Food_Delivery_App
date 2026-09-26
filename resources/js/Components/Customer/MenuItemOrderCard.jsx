import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import Button from "@/Components/Common/Button";
import { formatCurrency } from "@/Utils/formatCurrency";

export default function MenuItemOrderCard({
    item,
    canOrder = true,
    adding = false,
    onAddToCart,
}) {
    const [quantity, setQuantity] = useState(1);

    const decrease = () => setQuantity((qty) => Math.max(1, qty - 1));
    const increase = () => setQuantity((qty) => Math.min(20, qty + 1));

    return (
        <div className="rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-shadow duration-[var(--transition-normal)] bg-[color:var(--color-bg-primary)] flex flex-col">
            <div className="relative h-40 overflow-hidden bg-[color:var(--color-bg-secondary)]">
                {item.image ? (
                    <img
                        src={item.image}
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
            </div>

            <div className="p-3 space-y-2 flex-1 flex flex-col">
                <h3 className="font-semibold text-sm text-[color:var(--color-text-primary)] line-clamp-1">
                    {item.name}
                </h3>

                <p className="text-xs text-[color:var(--color-text-muted)] line-clamp-2 flex-1">
                    {item.description}
                </p>

                <p className="font-bold text-[color:var(--color-primary-600)]">
                    {formatCurrency(item.price)}
                </p>

                <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center rounded-[var(--radius-md)] border border-[color:var(--color-border-light)]">
                        <button
                            type="button"
                            onClick={decrease}
                            disabled={!canOrder || adding}
                            className="p-2 text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-secondary)] disabled:opacity-50 transition-colors"
                            aria-label="Decrease quantity"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-[color:var(--color-text-primary)]">
                            {quantity}
                        </span>
                        <button
                            type="button"
                            onClick={increase}
                            disabled={!canOrder || adding}
                            className="p-2 text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-secondary)] disabled:opacity-50 transition-colors"
                            aria-label="Increase quantity"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <Button
                        size="sm"
                        variant="primary"
                        className="flex-1 flex items-center justify-center gap-1.5"
                        disabled={!canOrder}
                        loading={adding}
                        onClick={() => onAddToCart?.(item, quantity)}
                    >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
