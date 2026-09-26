import { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { MapPin, Plus } from "lucide-react";
import AppLayout from "@/Layouts/AppLayout";
import Alert from "@/Components/Common/Alert";
import Button from "@/Components/Common/Button";
import TextArea from "@/Components/Forms/TextArea";
import { formatCurrency } from "@/Utils/formatCurrency";

export default function Checkout({
    restaurant,
    items,
    subtotal,
    addresses,
    delivery_fee,
    has_unavailable_items,
}) {
    const primaryAddress =
        addresses.find((address) => address.is_primary) ?? addresses[0] ?? null;

    const { data, setData, post, processing, errors } = useForm({
        customer_address_id: primaryAddress?.id ?? "",
        notes: "",
    });

    const [alert, setAlert] = useState(null);

    const deliveryFee = delivery_fee ?? 0;
    const total = Number(subtotal) + Number(deliveryFee);

    const handleSubmit = (event) => {
        event.preventDefault();
        setAlert(null);

        post(route("customer.checkout.store"), {
            onError: (errs) => {
                if (Object.keys(errs).length === 0) {
                    setAlert({
                        type: "error",
                        title: "Something Went Wrong",
                        message: "Unable to place your order. Please try again.",
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
                    <p className="text-sm text-[color:var(--color-text-muted)] mb-6">
                        Review your order from{" "}
                        <span className="font-medium text-[color:var(--color-text-primary)]">
                            {restaurant.name}
                        </span>{" "}
                        before placing it.
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

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 gap-[var(--spacing-5)] lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]"
                    >
                        <div className="space-y-5">
                            {/* Delivery Address */}
                            <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)] p-5">
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
                                                        setData(
                                                            "customer_address_id",
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

                            {/* Order Items */}
                            <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)] p-5">
                                <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)] mb-4">
                                    Order Items
                                </h2>

                                <ul className="divide-y divide-[color:var(--color-border-light)]">
                                    {items.map((item) => (
                                        <li
                                            key={item.menu_item_id}
                                            className="flex items-center justify-between py-3"
                                        >
                                            <div>
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

                            {/* Notes */}
                            <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)] p-5">
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
                        </div>

                        {/* Summary */}
                        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)] p-5 h-fit space-y-4">
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
                                        Delivery Fee
                                    </span>
                                    <span className="font-medium text-[color:var(--color-text-primary)]">
                                        {formatCurrency(deliveryFee)}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-[color:var(--color-border-light)] text-base">
                                    <span className="font-semibold text-[color:var(--color-text-primary)]">
                                        Total
                                    </span>
                                    <span className="font-bold text-[color:var(--color-primary-600)]">
                                        {formatCurrency(total)}
                                    </span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                loading={processing}
                                disabled={
                                    processing ||
                                    addresses.length === 0 ||
                                    has_unavailable_items
                                }
                            >
                                Place Order
                            </Button>

                            <Link href={route("customer.cart.index")}>
                                <Button variant="secondary" fullWidth type="button">
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
