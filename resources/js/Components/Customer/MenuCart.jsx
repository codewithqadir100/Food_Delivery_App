import { Link } from "@inertiajs/react";
import { Plus, ShoppingBag } from "lucide-react";
import Button from "@/Components/Common/Button";
import Card from "@/Components/Common/Card";
import HorizontalCarousel from "@/Components/Common/HorizontalCarousel";
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
            <aside className="sticky top-[var(--customer-nav-height)] z-[var(--z-sticky)] hidden h-[var(--menu-cart-height)] w-80 shrink-0 self-start md:block">
                <Card
                    padding="none"
                    className="flex h-full flex-col overflow-hidden"
                    bodyClassName="cart-scroll min-h-0 flex-1"
                    header={
                        <div className="p-3">
                            <Toggle
                                fullWidth
                                value={
                                    (cart?.fulfillment ??
                                        FULFILLMENT_DELIVERY) !==
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
                    }
                    footer={
                        <div className="space-y-3 p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[color:var(--color-text-secondary)]">
                                    Total
                                </span>
                                <span className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                                    {formatCurrency(cart?.subtotal ?? 0)}
                                </span>
                            </div>
                            {hasItems && restaurantId ? (
                                <Link
                                    href={route(
                                        "customer.checkout.show",
                                        restaurantId,
                                    )}
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
                            )}
                        </div>
                    }
                >
                    <div className="p-3">
                        <h2 className="mb-3 text-sm font-semibold text-[color:var(--color-text-primary)]">
                            Your items
                        </h2>
                        {hasItems ? (
                            <ul className="space-y-3">
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
                            <div className="flex flex-col items-center px-2 py-4 text-center">
                                <div className="mb-3 rounded-full bg-[color:var(--color-gray-100)] p-3">
                                    <ShoppingBag
                                        size={22}
                                        className="text-[color:var(--color-text-muted)]"
                                    />
                                </div>
                                <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                                    Your cart is empty
                                </p>
                                <p className="mt-1 text-xs text-[color:var(--color-text-secondary)]">
                                    Add something from the menu
                                </p>
                            </div>
                        )}

                        {suggestions.length > 0 && (
                            <div className="mt-4">
                                <p className="mb-4 text-sm font-bold text-[color:var(--color-text-secondary)]">
                                    Popular with your order
                                </p>
                                <HorizontalCarousel>
                                    {suggestions.map((item) => (
                                        <div
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
                                                    disabled={
                                                        addingItemId === item.id
                                                    }
                                                    onClick={() =>
                                                        onAddSuggestion?.(item)
                                                    }
                                                    className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--color-primary-600)] text-white disabled:opacity-50"
                                                    aria-label={`Add ${item.name}`}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </HorizontalCarousel>
                            </div>
                        )}
                    </div>
                </Card>
            </aside>

            {hasItems && (
                <div className="fixed inset-x-0 bottom-0 z-[var(--z-fixed)] px-[var(--spacing-4)] pb-[max(var(--spacing-4),env(safe-area-inset-bottom))] md:hidden bg-[var(--color-bg-primary)] p-2">
                    <Link
                        href={route("customer.cart.index")}
                        className="grid grid-cols-[1fr_auto_1fr] items-center rounded-[var(--radius-md)] bg-[color:var(--color-primary-600)] px-[var(--spacing-4)] py-3 text-white shadow-[var(--shadow-lg)] active:bg-[color:var(--color-primary-700)]"
                    >
                        <span className="inline-flex items-center gap-2">
                            <ShoppingBag size={20} />
                            <span className="text-sm font-semibold">
                                {itemCount}
                            </span>
                        </span>
                        <span className="text-sm font-semibold">View cart</span>
                        <span className="text-right text-sm font-semibold">
                            {formatCurrency(cart.subtotal)}
                        </span>
                    </Link>
                </div>
            )}
        </>
    );
}
