import { Head, router, useForm } from "@inertiajs/react";
import { useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import Alert from "@/Components/Common/Alert";
import MapLocationPicker from "@/Components/Common/MapLocationPicker";
import TextInput from "@/Components/Forms/TextInput";
import ReadOnlyTextInput from "@/Components/Forms/ReadOnlyTextInput";
import Button from "@/Components/Common/Button";

export default function Addresses({
    address = null,
    hasAddresses = false,
    returnTo = null,
}) {
    const initialData = {
        latitude: address?.latitude ?? null,
        longitude: address?.longitude ?? null,
        city_name: address?.city_name ?? "",
        area_name: address?.area_name ?? "",
        street_address: address?.street_address ?? "",
        return_to: returnTo?.type ?? "",
        restaurant_id: returnTo?.restaurant_id ?? "",
    };

    const { data, setData, post, patch, processing, errors } =
        useForm(initialData);
    const [lastSavedData, setLastSavedData] = useState(initialData);
    const [skipping, setSkipping] = useState(false);
    const [alert, setAlert] = useState(null);

    const handleLocationSelect = (location) => {
        setData({
            ...data,
            latitude: location.latitude,
            longitude: location.longitude,
            city_name: location.city,
            area_name: location.area,
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        setAlert(null);

        const options = {
            preserveScroll: true,
            onError: (formErrors) => {
                if (Object.keys(formErrors).length === 0) {
                    setAlert({
                        type: "error",
                        title: "Something Went Wrong",
                        message:
                            "Unable to save your address. Please try again.",
                    });
                }
            },
        };

        if (address) {
            patch(route("customer.addresses.update", address.id), options);
            return;
        }

        post(route("customer.addresses.store"), options);
    };

    const leaveForm = () => {
        if (!hasAddresses) {
            setSkipping(true);
            post(route("customer.addresses.skip"));
            return;
        }

        if (returnTo?.type === "checkout" && returnTo.restaurant_id) {
            router.visit(
                route("customer.checkout.show", returnTo.restaurant_id),
            );
            return;
        }

        router.visit(route("customer.addresses.index"));
    };

    const hasLocation =
        data.latitude !== null &&
        data.longitude !== null &&
        data.city_name.trim() !== "" &&
        data.area_name.trim() !== "";

    const hasStreetAddress = data.street_address.trim().length >= 5;

    const hasChanges =
        data.latitude !== lastSavedData.latitude ||
        data.longitude !== lastSavedData.longitude ||
        data.city_name !== lastSavedData.city_name ||
        data.area_name !== lastSavedData.area_name ||
        data.street_address !== lastSavedData.street_address;

    const canSubmit = hasLocation && hasStreetAddress && hasChanges;

    const initialLocation = address
        ? {
              latitude: Number(address.latitude),
              longitude: Number(address.longitude),
              city: address.city_name,
              area: address.area_name,
              name: address.street_address,
              address: address.street_address,
          }
        : null;

    return (
        <>
            <Head title={address ? "Edit Address" : "Add Delivery Address"} />

            <AppLayout>
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-[color:var(--color-text-primary)]">
                            {address
                                ? "Edit Address"
                                : hasAddresses
                                  ? "Add Another Address"
                                  : "Add Delivery Address"}
                        </h1>

                        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                            {address
                                ? "Update the pin or street details for this address."
                                : hasAddresses
                                  ? "This address will be available at checkout. Your first address stays primary."
                                  : "Your first address becomes primary and is used to find nearby restaurants."}
                        </p>
                    </div>

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

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 gap-[var(--spacing-5)] lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]"
                    >
                        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)] overflow-hidden">
                            <div className="p-[var(--spacing-5)] sm:p-[var(--spacing-6)]">
                                <div className="mb-[var(--spacing-4)]">
                                    <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                                        Choose Location
                                    </h2>

                                    <p className="mt-[var(--spacing-1)] text-sm text-[color:var(--color-text-muted)]">
                                        Search for your location or select it
                                        directly on the map.
                                    </p>
                                </div>

                                <div className="overflow-hidden">
                                    <MapLocationPicker
                                        initialLocation={initialLocation}
                                        onLocationSelect={handleLocationSelect}
                                    />
                                </div>

                                {(errors.latitude ||
                                    errors.longitude ||
                                    errors.city_name ||
                                    errors.area_name) && (
                                    <p className="mt-[var(--spacing-3)] text-sm text-[color:var(--color-danger-600)]">
                                        Please select a valid delivery location.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)]">
                            <div className="p-[var(--spacing-5)] sm:p-[var(--spacing-6)]">
                                <div className="mb-[var(--spacing-5)]">
                                    <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                                        Delivery Details
                                    </h2>

                                    <p className="mt-[var(--spacing-1)] text-sm text-[color:var(--color-text-muted)]">
                                        Add your complete delivery address.
                                    </p>
                                </div>

                                <div className="space-y-[var(--spacing-4)]">
                                    <ReadOnlyTextInput
                                        label="City"
                                        value={data.city_name || "--"}
                                        error={errors.city_name}
                                        placeHolder="Select City from Map"
                                        required
                                    />

                                    <ReadOnlyTextInput
                                        label="Address"
                                        value={data.area_name || "--"}
                                        error={errors.area_name}
                                        placeHolder="Select location from map"
                                        required
                                    />

                                    <TextInput
                                        label="Street Address"
                                        type="text"
                                        value={data.street_address}
                                        onChange={(event) =>
                                            setData(
                                                "street_address",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="House 123, Street 5, Block A"
                                        error={errors.street_address}
                                        required
                                        disabled={processing}
                                    />
                                </div>

                                <div className="mt-[var(--spacing-6)] flex flex-col sm:flex-row-reverse lg:flex-col gap-[var(--spacing-3)]">
                                    <Button
                                        type="submit"
                                        disabled={!canSubmit || skipping}
                                        loading={processing && !skipping}
                                        fullWidth
                                    >
                                        {address
                                            ? "Update Address"
                                            : "Save Address"}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="secondary"
                                        disabled={processing || skipping}
                                        loading={skipping}
                                        onClick={leaveForm}
                                        fullWidth
                                    >
                                        {hasAddresses
                                            ? "Cancel"
                                            : "Skip for Now"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </AppLayout>
        </>
    );
}
