import { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import axios from "axios";
import { MapPin, Plus } from "lucide-react";
import AppLayout from "@/Layouts/AppLayout";
import Alert from "@/Components/Common/Alert";
import ItemThumb from "@/Components/Common/ItemThumb";
import Button from "@/Components/Common/Button";
import TextArea from "@/Components/Forms/TextArea";
import { fulfillmentLabel } from "@/Utils/fulfillment";
import { formatCurrency } from "@/Utils/formatCurrency";

export default function Checkout({
    restaurant,
    items,
    subtotal,
    addresses,
    delivery_fee,
    delivery_error,
    fulfillment = "delivery",
    has_unavailable_items,
    restaurant_unavailable,
    requires_login = false,
}) {
    const primaryAddress =
        addresses.find((address) => address.is_primary) ?? addresses[0] ?? null;

    const { data, setData, post, processing, errors } = useForm({
        customer_address_id: primaryAddress?.id ?? "",
        notes: "",
    });

    const [alert, setAlert] = useState(null);
    const [deliveryEstimate, setDeliveryEstimate] = useState({
        fee: delivery_fee,
        error: delivery_error,
    });
    const [fetchingFee, setFetchingFee] = useState(false);

    const isPickup = fulfillment === "pickup";
    const deliveryFeeLater = requires_login && !isPickup;
    const deliveryFeeUnavailable =
        !requires_login && !isPickup && deliveryEstimate.fee === null;
    const deliveryFee =
        isPickup || deliveryFeeLater ? 0 : (deliveryEstimate.fee ?? 0);
    const total = Number(subtotal) + Number(deliveryFee);
    const canPlaceOrder =
        !deliveryFeeUnavailable &&
        !restaurant_unavailable &&
        !has_unavailable_items;

    const selectAddress = async (addressId) => {
        setData("customer_address_id", addressId);

        try {
            setFetchingFee(true);
            const res = await axios.get(
                route("customer.checkout.delivery-fee"),
                {
                    params: {
                        customer_address_id: addressId,
                        restaurant_id: restaurant.id,
                    },
                },
            );
            setDeliveryEstimate({
                fee: res.data.valid ? res.data.fee : null,
                error: res.data.valid ? null : res.data.error,
            });
        } catch (error) {
            setDeliveryEstimate({
                fee: null,
                error:
                    error.response?.data?.error ||
                    "Unable to calculate delivery fee for this address.",
            });
        } finally {
            setFetchingFee(false);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setAlert(null);

        post(route("customer.checkout.store", restaurant.id), {
            onError: (errs) => {
                if (Object.keys(errs).length === 0) {
                    setAlert({
                        type: "error",
                        title: "Something Went Wrong",
                        message:
                            "Unable to place your order. Please try again.",
                    });
                }
            },
        });
    };

    const formatAddress = (address) =>
        [address.street_address, address.area_name, address.city_name]
            .filter(Boolean)
            .join(", ");

    return (
        <>
            <Head title="Checkout" />
            <AppLayout>
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-semibold text-[color:var(--color-text-primary)] mb-1">
                        Checkout
                    </h1>
                    <p className="mb-4 text-sm text-[color:var(--color-text-muted)]">
                        {requires_login ? (
                            <>
                                Log in to place your order from{" "}
                                <span className="font-medium text-[color:var(--color-text-primary)]">
                                    {restaurant.name}
                                </span>
                                {". Your cart stays as it is."}
                            </>
                        ) : (
                            <>
                                Review your order from{" "}
                                <span className="font-medium text-[color:var(--color-text-primary)]">
                                    {restaurant.name}
                                </span>{" "}
                                before placing it.
                            </>
                        )}
                    </p>

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

                    {has_unavailable_items && (
                        <div className="mb-4">
                            <Alert
                                type="warning"
                                title="Unavailable items"
                                message="Some items in your cart are unavailable. Please go back to your cart and remove them."
                                closeable={false}
                            />
                        </div>
                    )}

                    {restaurant_unavailable && (
                        <div className="mb-4">
                            <Alert
                                type="warning"
                                title="Restaurant unavailable"
                                message="This restaurant is not currently accepting orders. Please try again later."
                                closeable={false}
                            />
                        </div>
                    )}

                    {!isPickup &&
                        !restaurant_unavailable &&
                        deliveryFeeUnavailable &&
                        !fetchingFee && (
                            <div className="mb-4">
                                <Alert
                                    type="warning"
                                    title="Delivery unavailable"
                                    message={
                                        deliveryEstimate.error ||
                                        "We couldn't calculate delivery for the selected address. Please choose a different address."
                                    }
                                    closeable={false}
                                />
                            </div>
                        )}

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 gap-[var(--spacing-4)] lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]"
                    >
                        <div className="space-y-4">
                            {isPickup ? (
                                <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)] p-4 sm:p-5">
                                    <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                                        Pickup from {restaurant.name}
                                    </h2>
                                    <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
                                        Collect this order from the restaurant.
                                    </p>
                                    <p className="mt-3 flex items-start gap-2 text-sm font-medium text-[color:var(--color-text-primary)]">
                                        <MapPin
                                            size={16}
                                            className="mt-0.5 shrink-0 text-[color:var(--color-primary-600)]"
                                        />
                                        <span>
                                            {[
                                                restaurant.street_address,
                                                restaurant.area_name,
                                                restaurant.city_name,
                                            ]
                                                .filter(Boolean)
                                                .join(", ") ||
                                                "Address not available"}
                                        </span>
                                    </p>
                                    {restaurant.latitude &&
                                        restaurant.longitude && (
                                            <a
                                                href={`https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-3 inline-flex text-sm font-medium text-[color:var(--color-primary-600)] hover:underline"
                                            >
                                                Open map
                                            </a>
                                        )}
                                </div>
                            ) : requires_login ? (
                                <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)] p-4 sm:p-5">
                                    <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                                        Delivery Address
                                    </h2>
                                    <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
                                        Log in to choose where this order should
                                        be delivered.
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)] p-4 sm:p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                                            Delivery Address
                                        </h2>
                                        <Link
                                            href={route(
                                                "customer.addresses.create",
                                            )}
                                            className="text-sm font-medium text-[color:var(--color-primary-600)] flex items-center gap-1 hover:underline"
                                        >
                                            <Plus size={14} />
                                            Add New
                                        </Link>
                                    </div>

                                    {addresses.length === 0 ? (
                                        <p className="text-sm text-[color:var(--color-text-muted)]">
                                            You have no saved addresses.{" "}
                                            <Link
                                                href={route(
                                                    "customer.addresses.create",
                                                )}
                                                className="text-[color:var(--color-primary-600)] hover:underline"
                                            >
                                                Add one now
                                            </Link>
                                            .
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {addresses.map((address) => (
                                                <label
                                                    key={address.id}
                                                    className={`flex items-start gap-3 p-3 rounded-[var(--radius-md)] border cursor-pointer transition-colors ${
                                                        Number(
                                                            data.customer_address_id,
                                                        ) === address.id
                                                            ? "border-[color:var(--color-primary-500)] bg-[color:var(--color-primary-50)]"
                                                            : "border-[color:var(--color-border-light)] hover:bg-[color:var(--color-bg-secondary)]"
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="customer_address_id"
                                                        value={address.id}
                                                        checked={
                                                            Number(
                                                                data.customer_address_id,
                                                            ) === address.id
                                                        }
                                                        onChange={() =>
                                                            selectAddress(
                                                                address.id,
                                                            )
                                                        }
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin
                                                                size={14}
                                                                className="text-[color:var(--color-primary-600)]"
                                                            />
                                                            <span className="text-sm font-medium text-[color:var(--color-text-primary)]">
                                                                {address.is_primary
                                                                    ? "Primary Address"
                                                                    : "Address"}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-[color:var(--color-text-secondary)] mt-1">
                                                            {formatAddress(
                                                                address,
                                                            )}
                                                        </p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {errors.customer_address_id && (
                                        <p className="mt-2 text-sm text-[color:var(--color-danger-600)]">
                                            {errors.customer_address_id}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Order Items */}
                            <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)] p-4 sm:p-5">
                                <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)] mb-4">
                                    Order Items
                                </h2>

                                <ul className="divide-y divide-[color:var(--color-border-light)]">
                                    {items.map((item) => (
                                        <li
                                            key={item.menu_item_id}
                                            className="flex items-center justify-between gap-3 py-3"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <ItemThumb
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-12"
                                                />
                                                <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
                                                    {item.name}{" "}
                                                    <span className="text-[color:var(--color-text-muted)]">
                                                        x{item.quantity}
                                                    </span>
                                                </p>
                                            </div>
                                            <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                                                {formatCurrency(item.subtotal)}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {!requires_login && (
                                <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)] p-4 sm:p-5">
                                    <TextArea
                                        label="Notes for the restaurant (optional)"
                                        value={data.notes}
                                        onChange={(e) =>
                                            setData("notes", e.target.value)
                                        }
                                        placeholder="e.g. No onions, ring the doorbell twice..."
                                        rows={3}
                                        error={errors.notes}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Summary */}
                        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)] p-4 sm:p-5 h-fit space-y-4">
                            <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                                Order Summary
                            </h2>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-[color:var(--color-text-secondary)]">
                                        Subtotal
                                    </span>
                                    <span className="font-medium text-[color:var(--color-text-primary)]">
                                        {formatCurrency(subtotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[color:var(--color-text-secondary)]">
                                        {isPickup ? "Pickup" : "Delivery Fee"}
                                    </span>
                                    <span className="font-medium text-[color:var(--color-text-primary)]">
                                        {isPickup
                                            ? "Free"
                                            : deliveryFeeLater
                                              ? "At login"
                                              : fetchingFee
                                                ? "..."
                                                : deliveryFeeUnavailable
                                                  ? "—"
                                                  : formatCurrency(deliveryFee)}
                                    </span>
                                </div>
                                <p className="text-xs text-[color:var(--color-text-muted)]">
                                    {fulfillmentLabel(fulfillment)}
                                </p>
                                <div className="flex justify-between pt-2 border-t border-[color:var(--color-border-light)] text-base">
                                    <span className="font-semibold text-[color:var(--color-text-primary)]">
                                        Total
                                    </span>
                                    <span className="font-bold text-[color:var(--color-primary-600)]">
                                        {formatCurrency(total)}
                                    </span>
                                </div>
                            </div>

                            {requires_login ? (
                                <div className="space-y-3">
                                    <Link
                                        href={route(
                                            "customer.checkout.login",
                                            restaurant.id,
                                        )}
                                    >
                                        <Button
                                            variant="primary"
                                            fullWidth
                                            type="button"
                                        >
                                            Login
                                        </Button>
                                    </Link>
                                    <p className="text-center text-sm text-[color:var(--color-text-secondary)]">
                                        New here?{" "}
                                        <Link
                                            href={route("register")}
                                            className="font-medium text-[color:var(--color-primary-600)] hover:underline"
                                        >
                                            Create an account
                                        </Link>
                                    </p>
                                </div>
                            ) : (
                                <Button
                                    type="submit"
                                    variant="primary"
                                    fullWidth
                                    loading={processing}
                                    disabled={
                                        processing ||
                                        (!isPickup &&
                                            (fetchingFee ||
                                                addresses.length === 0)) ||
                                        !canPlaceOrder
                                    }
                                >
                                    Place Order
                                </Button>
                            )}

                            <Link
                                href={route("customer.cart.index")}
                                className="block"
                            >
                                <Button
                                    variant="secondary"
                                    fullWidth
                                    type="button"
                                >
                                    Back to Cart
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </AppLayout>
        </>
    );
}
