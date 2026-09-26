import { useEffect, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import AppLayout from "@/Layouts/AppLayout";
import Alert from "@/Components/Common/Alert";
import Button from "@/Components/Common/Button";
import Spinner from "@/Components/Common/Spinner";
import EmptyState from "@/Components/Restaurant/Dashboard/EmptyState";
import { formatCurrency } from "@/Utils/formatCurrency";

export default function Cart({ restaurant }) {
    const [items, setItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [busyItemId, setBusyItemId] = useState(null);
    const [clearing, setClearing] = useState(false);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const res = await axios.get(route("customer.cart.data"));
            setItems(res.data.data.items);
            setSubtotal(res.data.data.subtotal);
        } catch (error) {
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
            setItems(res.data.data.items);
            setSubtotal(res.data.data.subtotal);
            router.reload({ only: ["auth"] });
        } catch (error) {
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
            setItems(res.data.data.items);
            setSubtotal(res.data.data.subtotal);
            router.reload({ only: ["auth"] });
        } catch (error) {
            setAlert({
                type: "error",
                title: "Error",
                message: "Failed to remove item",
            });
        } finally {
            setBusyItemId(null);
        }
    };

    const clearCart = async () => {
        if (!confirm("Remove all items from your cart?")) return;

        try {
            setClearing(true);
            await axios.delete(route("customer.cart.clear"));
            setItems([]);
            setSubtotal(0);
            router.reload({ only: ["auth"] });
        } catch (error) {
            setAlert({
                type: "error",
                title: "Error",
                message: "Failed to clear cart",
            });
        } finally {
            setClearing(false);
        }
    };

    const hasUnavailableItems = items.some((item) => !item.is_available);

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

                <div className="max-w-3xl mx-auto">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-[color:var(--color-text-primary)]">
                                My Cart
                            </h1>
                            {restaurant && (
                                <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                                    Ordering from{" "}
                                    <span className="font-medium text-[color:var(--color-text-primary)]">
                                        {restaurant.name}
                                    </span>
                                </p>
                            )}
                        </div>

                        {items.length > 0 && (
                            <Button
                                variant="secondary"
                                size="sm"
                                loading={clearing}
                                onClick={clearCart}
                            >
                                Clear Cart
                            </Button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <Spinner />
                        </div>
                    ) : items.length === 0 ? (
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
                        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)] overflow-hidden">
                            <ul className="divide-y divide-[color:var(--color-border-light)]">
                                {items.map((item) => (
                                    <li
                                        key={item.menu_item_id}
                                        className="flex items-center gap-4 p-4"
                                    >
                                        <div className="h-16 w-16 rounded-[var(--radius-md)] overflow-hidden bg-[color:var(--color-bg-secondary)] flex-shrink-0">
                                            {item.image_url && (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-[color:var(--color-text-primary)] truncate">
                                                {item.name}
                                            </p>
                                            <p className="text-sm text-[color:var(--color-text-muted)]">
                                                {formatCurrency(item.price)}{" "}
                                                each
                                            </p>
                                            {!item.is_available && (
                                                <p className="text-xs text-[color:var(--color-danger-600)] mt-1">
                                                    No longer available
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center rounded-[var(--radius-md)] border border-[color:var(--color-border-light)]">
                                            <button
                                                type="button"
                                                disabled={
                                                    busyItemId ===
                                                    item.menu_item_id
                                                }
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.menu_item_id,
                                                        item.quantity - 1,
                                                    )
                                                }
                                                className="p-2 text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-secondary)] disabled:opacity-50 transition-colors"
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center text-sm font-medium">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                disabled={
                                                    busyItemId ===
                                                    item.menu_item_id
                                                }
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.menu_item_id,
                                                        item.quantity + 1,
                                                    )
                                                }
                                                className="p-2 text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-secondary)] disabled:opacity-50 transition-colors"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <p className="w-20 text-right font-semibold text-[color:var(--color-text-primary)]">
                                            {formatCurrency(item.subtotal)}
                                        </p>

                                        <button
                                            type="button"
                                            disabled={
                                                busyItemId === item.menu_item_id
                                            }
                                            onClick={() =>
                                                removeItem(item.menu_item_id)
                                            }
                                            className="p-2 text-[color:var(--color-danger-600)] hover:bg-[color:var(--color-danger-50)] rounded-[var(--radius-md)] disabled:opacity-50 transition-colors"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <div className="p-4 border-t border-[color:var(--color-border-light)] bg-[color:var(--color-bg-secondary)] space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[color:var(--color-text-secondary)]">
                                        Subtotal
                                    </span>
                                    <span className="font-semibold text-[color:var(--color-text-primary)]">
                                        {formatCurrency(subtotal)}
                                    </span>
                                </div>
                                <p className="text-xs text-[color:var(--color-text-muted)]">
                                    Delivery fee is calculated at checkout
                                    based on your address.
                                </p>

                                {hasUnavailableItems && (
                                    <Alert
                                        type="warning"
                                        title="Unavailable items"
                                        message="Remove unavailable items before proceeding to checkout."
                                        closeable={false}
                                    />
                                )}

                                <Link href={route("customer.checkout.show")}>
                                    <Button
                                        variant="primary"
                                        fullWidth
                                        disabled={hasUnavailableItems}
                                    >
                                        Proceed to Checkout
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}
