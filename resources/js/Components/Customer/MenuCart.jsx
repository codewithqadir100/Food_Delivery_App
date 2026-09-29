import { Link } from "@inertiajs/react";
import { Plus } from "lucide-react";
import Button from "@/Components/Common/Button";
import Card from "@/Components/Common/Card";
import ItemThumb from "@/Components/Common/ItemThumb";
import Toggle from "@/Components/Common/Toggle";
import { FULFILLMENT_DELIVERY, FULFILLMENT_PICKUP } from "@/Utils/fulfillment";
import { formatCurrency } from "@/Utils/formatCurrency";

export default function MenuCart({
    cart,
    onFulfillmentChange,
    onAddSuggestion,
    updatingFulfillment = false,
    addingItemId = null,
}) {
    const items = cart?.items ?? [];
    const suggestions = cart?.suggestions ?? [];
    const hasItems = items.length > 0;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const restaurantId = cart?.restaurant?.id;

    return (
        <>
            <div className="hidden md:block fixed bottom-[var(--spacing-6)] right-[var(--spacing-6)] z-[var(--z-sticky)] w-80 max-w-[calc(100vw-var(--spacing-12))]">
                <Card
                    padding="sm"
                    header={
                        <h2 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                            Your cart
                        </h2>
                    }
                    footer={
                        hasItems && restaurantId ? (
                            <Link
                                href={route("customer.checkout.show", restaurantId)}
                                className="block"
                            >
                                <Button variant="primary" fullWidth>
                                    Proceed to checkout
                                </Button>
                            </Link>
                        ) : (
                            <Button variant="primary" fullWidth disabled>
                                Proceed to checkout
                            </Button>
                        )
                    }
                >
                    <div className="mb-4 w-full">
                        <Toggle
                            fullWidth
                            value={
                                (cart?.fulfillment ?? FULFILLMENT_DELIVERY) !==
                                FULFILLMENT_PICKUP
                            }
                            onChange={(isDelivery) =>
                                onFulfillmentChange(
                                    isDelivery
                                        ? FULFILLMENT_DELIVERY
                                        : FULFILLMENT_PICKUP,
                                )
                            }
                            activeLabel="Delivery"
                            inactiveLabel="Pickup"
                            disabled={updatingFulfillment}
                        />
                    </div>
                    {hasItems ? (
                        <ul className="max-h-48 space-y-3 overflow-y-auto">
                            {items.map((item) => (
                                <li
                                    key={item.menu_item_id}
                                    className="flex items-center gap-3"
                                >
                                    <ItemThumb
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-12"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-[color:var(--color-text-primary)]">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-[color:var(--color-text-muted)]">
                                            Qty {item.quantity}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                                        {formatCurrency(item.subtotal)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-[color:var(--color-text-muted)]">
                            Your cart is empty
                        </p>
                    )}

                    {hasItems && (
                        <div className="mt-4 flex items-center justify-between border-t border-[color:var(--color-border-light)] pt-3">
                            <span className="text-sm text-[color:var(--color-text-secondary)]">
                                Subtotal
                            </span>
                            <span className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                                {formatCurrency(cart.subtotal)}
                            </span>
                        </div>
                    )}

                    {suggestions.length > 0 && (
                        <div className="mt-4">
                            <p className="mb-2 text-xs font-medium text-[color:var(--color-text-secondary)]">
                                Popular with your order
                            </p>
                            <ul className="flex gap-3 overflow-x-auto pb-1">
                                {suggestions.map((item) => (
                                    <li
                                        key={item.id}
                                        className="w-28 shrink-0"
                                    >
                                        <ItemThumb
                                            src={item.image_url}
                                            alt={item.name}
                                            className="w-full"
                                        />
                                        <p className="mt-1 truncate text-xs font-medium text-[color:var(--color-text-primary)]">
                                            {item.name}
                                        </p>
                                        <div className="mt-1 flex items-center justify-between gap-1">
                                            <span className="text-xs text-[color:var(--color-text-secondary)]">
                                                {formatCurrency(item.price)}
                                            </span>
                                            <button
                                                type="button"
                                                disabled={addingItemId === item.id}
                                                onClick={() => onAddSuggestion?.(item)}
                                                className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-white disabled:opacity-50"
                                                aria-label={`Add ${item.name}`}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Card>
            </div>

            {hasItems && (
                <div className="md:hidden fixed inset-x-0 bottom-0 z-[var(--z-fixed)] border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-lg)]">
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                        <div>
                            <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                                {formatCurrency(cart.subtotal)}
                            </p>
                            <p className="text-xs text-[color:var(--color-text-muted)]">
                                {itemCount} {itemCount === 1 ? "item" : "items"}
                            </p>
                        </div>
                        <Link href={route("customer.cart.index")}>
                            <Button variant="primary" size="sm">
                                View your cart
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}
