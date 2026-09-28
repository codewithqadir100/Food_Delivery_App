import { useEffect, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import AppLayout from "@/Layouts/AppLayout";
import Alert from "@/Components/Common/Alert";
import Button from "@/Components/Common/Button";
import Spinner from "@/Components/Common/Spinner";
import EmptyState from "@/Components/Common/EmptyState";
import Toggle from "@/Components/Common/Toggle";
import {
    FULFILLMENT_DELIVERY,
    FULFILLMENT_PICKUP,
} from "@/Utils/fulfillment";
import { formatCurrency } from "@/Utils/formatCurrency";

function applyCarts(data) {
    if (Array.isArray(data?.carts)) {
        return data.carts.filter((cart) => (cart.items ?? []).length > 0);
    }

    return data?.restaurant ? [data] : [];
}

export default function Cart() {
    const [carts, setCarts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyItemId, setBusyItemId] = useState(null);
    const [updatingRestaurantId, setUpdatingRestaurantId] = useState(null);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const res = await axios.get(route("customer.cart.data"));
            setCarts(applyCarts(res.data.data));
        } catch {
            setAlert({
                type: "error",
                title: "Error",
                message: "Failed to load your cart",
            });
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (menuItemId, quantity) => {
        try {
            setBusyItemId(menuItemId);
            const res = await axios.patch(
                route("customer.cart.update", menuItemId),
                { quantity },
            );
            setCarts(applyCarts(res.data.data));
            router.reload({ only: ["auth"] });
        } catch {
            setAlert({
                type: "error",
                title: "Error",
                message: "Failed to update item quantity",
            });
        } finally {
            setBusyItemId(null);
        }
    };

    const removeItem = async (menuItemId) => {
        try {
            setBusyItemId(menuItemId);
            const res = await axios.delete(
                route("customer.cart.destroy", menuItemId),
            );
            setCarts(applyCarts(res.data.data));
            router.reload({ only: ["auth"] });
        } catch {
            setAlert({
                type: "error",
                title: "Error",
                message: "Failed to remove item",
            });
        } finally {
            setBusyItemId(null);
        }
    };

    const changeFulfillment = async (restaurantId, next) => {
        try {
            setUpdatingRestaurantId(restaurantId);
            const res = await axios.patch(route("customer.cart.fulfillment"), {
                fulfillment: next,
                restaurant_id: restaurantId,
            });
            setCarts(applyCarts(res.data.data));
        } catch {
            setAlert({
                type: "error",
                title: "Error",
                message: "Failed to update pickup or delivery",
            });
        } finally {
            setUpdatingRestaurantId(null);
        }
    };

    const addSuggestion = async (item) => {
        try {
            setBusyItemId(item.id);
            const res = await axios.post(route("customer.cart.store"), {
                menu_item_id: item.id,
                quantity: 1,
            });
            setCarts(applyCarts(res.data.data));
            router.reload({ only: ["auth"] });
        } catch {
            setAlert({
                type: "error",
                title: "Error",
                message: "Failed to add item",
            });
        } finally {
            setBusyItemId(null);
        }
    };

    const singleCart = carts.length === 1;

    return (
        <>
            <Head title="My Cart" />
            <AppLayout>
                {alert && (
                    <div className="mb-4">
                        <Alert
                            type={alert.type}
                            title={alert.title}
                            message={alert.message}
                            onClose={() => setAlert(null)}
                        />
                    </div>
                )}

                <div className={`mx-auto max-w-3xl ${singleCart ? "pb-24 md:pb-0" : ""}`}>
                    <h1 className="mb-6 text-2xl font-semibold text-[color:var(--color-text-primary)]">
                        My Cart
                    </h1>

                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <Spinner />
                        </div>
                    ) : carts.length === 0 ? (
                        <EmptyState
                            icon={ShoppingBag}
                            title="Your cart is empty"
                            description="Browse restaurants and add some delicious items to get started."
                            action={
                                <Link href="/restaurants">
                                    <Button variant="primary">
                                        Browse Restaurants
                                    </Button>
                                </Link>
                            }
                        />
                    ) : (
                        <div className="space-y-6">
                            {carts.map((cart) => (
                                <RestaurantCart
                                    key={cart.restaurant?.id}
                                    cart={cart}
                                    busyItemId={busyItemId}
                                    updatingFulfillment={
                                        updatingRestaurantId === cart.restaurant?.id
                                    }
                                    stickyCheckout={singleCart}
                                    onQuantity={updateQuantity}
                                    onRemove={removeItem}
                                    onFulfillment={changeFulfillment}
                                    onAddSuggestion={addSuggestion}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}

function RestaurantCart({
    cart,
    busyItemId,
    updatingFulfillment,
    stickyCheckout,
    onQuantity,
    onRemove,
    onFulfillment,
    onAddSuggestion,
}) {
    const items = cart.items ?? [];
    const suggestions = cart.suggestions ?? [];
    const isPickup = cart.fulfillment === FULFILLMENT_PICKUP;
    const hasUnavailableItems = items.some((item) => !item.is_available);
    const restaurantId = cart.restaurant?.id;

    return (
        <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)]">
            <div className="border-b border-[color:var(--color-border-light)] px-4 py-4">
                <p className="text-sm text-[color:var(--color-text-muted)]">
                    Ordering from
                </p>
                <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                    {cart.restaurant?.name ?? "Restaurant"}
                </h2>
            </div>

            <div className="px-4 pt-4">
                <h3 className="mb-3 text-sm font-semibold text-[color:var(--color-text-primary)]">
                    Your items
                </h3>
                <ul className="space-y-4">
                    {items.map((item) => (
                        <li
                            key={item.menu_item_id}
                            className="flex items-start gap-3"
                        >
                            <div className="aspect-square w-16 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-[color:var(--color-bg-secondary)]">
                                {item.image_url && (
                                    <img
                                        src={item.image_url}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-medium text-[color:var(--color-text-primary)]">
                                    {item.name}
                                </p>
                                {item.description && (
                                    <p className="line-clamp-2 text-xs text-[color:var(--color-text-muted)]">
                                        {item.description}
                                    </p>
                                )}
                                <p className="mt-1 text-sm font-semibold text-[color:var(--color-text-primary)]">
                                    {formatCurrency(item.subtotal)}
                                </p>
                                {!item.is_available && (
                                    <p className="mt-1 text-xs text-[color:var(--color-danger-600)]">
                                        No longer available
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                disabled={busyItemId === item.menu_item_id}
                                onClick={() => onRemove(item.menu_item_id)}
                                className="p-2 text-[color:var(--color-danger-600)] disabled:opacity-50"
                                aria-label="Remove item"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div className="flex items-center rounded-[var(--radius-md)] border border-[color:var(--color-border-light)]">
                                <button
                                    type="button"
                                    disabled={busyItemId === item.menu_item_id}
                                    onClick={() =>
                                        onQuantity(item.menu_item_id, item.quantity - 1)
                                    }
                                    className="p-2 text-[color:var(--color-text-secondary)] disabled:opacity-50"
                                    aria-label="Decrease quantity"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="w-6 text-center text-sm font-medium">
                                    {item.quantity}
                                </span>
                                <button
                                    type="button"
                                    disabled={busyItemId === item.menu_item_id}
                                    onClick={() =>
                                        onQuantity(item.menu_item_id, item.quantity + 1)
                                    }
                                    className="p-2 text-[color:var(--color-text-secondary)] disabled:opacity-50"
                                    aria-label="Increase quantity"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>

                {restaurantId && (
                    <Link
                        href={route("customer.restaurant.menu", restaurantId)}
                        className="mt-4 inline-block text-sm font-medium text-[var(--color-primary-500)]"
                    >
                        Add more items
                    </Link>
                )}
            </div>

            {suggestions.length > 0 && (
                <div className="px-4 pt-6">
                    <h3 className="mb-3 text-sm font-semibold text-[color:var(--color-text-primary)]">
                        Popular with your order
                    </h3>
                    <ul className="flex gap-3 overflow-x-auto pb-1">
                        {suggestions.map((item) => (
                            <li key={item.id} className="w-32 shrink-0">
                                <div className="aspect-square overflow-hidden rounded-[var(--radius-md)] bg-[color:var(--color-bg-secondary)]">
                                    {item.image_url && (
                                        <img
                                            src={item.image_url}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                </div>
                                <p className="mt-2 truncate text-sm font-medium text-[color:var(--color-text-primary)]">
                                    {item.name}
                                </p>
                                <div className="mt-1 flex items-center justify-between">
                                    <span className="text-sm text-[color:var(--color-text-secondary)]">
                                        {formatCurrency(item.price)}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={busyItemId === item.id}
                                        onClick={() => onAddSuggestion(item)}
                                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-white disabled:opacity-50"
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

            <div className="space-y-3 px-4 py-4">
                <Toggle
                    value={!isPickup}
                    onChange={(isDelivery) =>
                        onFulfillment(
                            restaurantId,
                            isDelivery ? FULFILLMENT_DELIVERY : FULFILLMENT_PICKUP,
                        )
                    }
                    activeLabel="Delivery"
                    inactiveLabel="Pickup"
                    disabled={updatingFulfillment}
                />
                <div className="flex items-center justify-between text-sm">
                    <span className="text-[color:var(--color-text-secondary)]">
                        Subtotal
                    </span>
                    <span className="font-medium text-[color:var(--color-text-primary)]">
                        {formatCurrency(cart.subtotal)}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-[color:var(--color-text-secondary)]">
                        {isPickup ? "Pickup" : "Delivery"}
                    </span>
                    <span className="font-medium text-[color:var(--color-text-primary)]">
                        {isPickup ? "Free" : "At checkout"}
                    </span>
                </div>
                <div className="flex items-center justify-between text-base">
                    <span className="font-semibold text-[color:var(--color-text-primary)]">
                        Total
                    </span>
                    <span className="font-semibold text-[color:var(--color-text-primary)]">
                        {formatCurrency(cart.subtotal)}
                    </span>
                </div>
                {hasUnavailableItems && (
                    <Alert
                        type="warning"
                        title="Unavailable items"
                        message="Remove unavailable items before proceeding to checkout."
                        closeable={false}
                    />
                )}
            </div>

            <div
                className={
                    stickyCheckout
                        ? "fixed inset-x-0 bottom-0 z-[var(--z-fixed)] border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] p-4 md:static md:border-0 md:bg-transparent md:px-4 md:pb-4 md:pt-0"
                        : "px-4 pb-4"
                }
            >
                {restaurantId ? (
                    <Link href={route("customer.checkout.show", restaurantId)}>
                        <Button
                            variant="primary"
                            fullWidth
                            disabled={hasUnavailableItems}
                        >
                            Go to checkout
                        </Button>
                    </Link>
                ) : (
                    <Button variant="primary" fullWidth disabled>
                        Go to checkout
                    </Button>
                )}
            </div>
        </section>
    );
}
