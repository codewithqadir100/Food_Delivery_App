import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import Alert from "@/Components/Common/Alert";
import MapLocationPicker from "@/Components/Common/MapLocationPicker";
import TextInput from "@/Components/Forms/TextInput";
import ReadOnlyTextInput from "@/Components/Forms/ReadOnlyTextInput";
import Button from "@/Components/Common/Button";

export default function Addresses({ address }) {
    const initialData = {
        latitude: address?.latitude ?? null,
        longitude: address?.longitude ?? null,
        city_name: address?.city_name ?? "",
        area_name: address?.area_name ?? "",
        street_address: address?.street_address ?? "",
    };

    const { data, setData, post, processing, errors } = useForm(initialData);
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

        post(route("customer.addresses.store"), {
            preserveScroll: true,
            onSuccess: () => {
                setLastSavedData({
                    latitude: data.latitude,
                    longitude: data.longitude,
                    city_name: data.city_name,
                    area_name: data.area_name,
                    street_address: data.street_address,
                });

                setAlert({
                    type: "success",
                    title: address ? "Address Updated" : "Address Saved",
                    message: address
                        ? "Your delivery address has been updated successfully."
                        : "Your delivery address has been saved successfully.",
                });
            },
            onError: (errors) => {
                if (Object.keys(errors).length === 0) {
                    setAlert({
                        type: "error",
                        title: "Something Went Wrong",
                        message:
                            "Unable to save your address. Please try again.",
                    });
                }
            },
        });
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
            <Head
                title={address ? "Delivery Address" : "Add Delivery Address"}
            />

            <AppLayout>
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-[color:var(--color-text-primary)]">
                            {address
                                ? "Delivery Address"
                                : "Add Delivery Address"}
                        </h1>

                        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                            Select your delivery location and add your complete
                            address.
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
                                        locationMode="customer"
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
                                        onClick={() => {
                                            setSkipping(true);
                                            post(
                                                route(
                                                    "customer.addresses.skip",
                                                ),
                                            );
                                        }}
                                        fullWidth
                                    >
                                        {address ? "Cancel" : "Skip for Now"}
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
