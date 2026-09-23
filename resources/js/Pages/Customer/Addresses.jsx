import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import MapLocationPicker from "@/Components/Common/MapLocationPicker";
import TextInput from "@/Components/Forms/TextInput";
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
    const [skipping, setSkipping] = useState(false);

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

        post(route("customer.addresses.store"), {
            preserveScroll: true,
        });
    };

    const hasLocation =
        data.latitude !== null &&
        data.longitude !== null &&
        data.city_name.trim() !== "" &&
        data.area_name.trim() !== "";

    const hasStreetAddress = data.street_address.trim().length >= 5;

    const hasChanges =
        data.latitude !== initialData.latitude ||
        data.longitude !== initialData.longitude ||
        data.city_name !== initialData.city_name ||
        data.area_name !== initialData.area_name ||
        data.street_address !== initialData.street_address;

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
                <div className="max-w-4xl mx-auto">
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

                    <form
                        onSubmit={handleSubmit}
                        className="bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] overflow-hidden"
                    >
                        <div className="p-5 sm:p-6">
                            <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                                Choose Location
                            </h2>

                            <p className="mt-1 mb-4 text-sm text-[color:var(--color-text-muted)]">
                                Search for your location or select it directly
                                on the map.
                            </p>

                            <MapLocationPicker
                                initialLocation={initialLocation}
                                onLocationSelect={handleLocationSelect}
                            />

                            {(errors.latitude ||
                                errors.longitude ||
                                errors.city_name ||
                                errors.area_name) && (
                                <p className="mt-3 text-sm text-[color:var(--color-danger-600)]">
                                    Please select a valid delivery location.
                                </p>
                            )}
                        </div>

                        <div className="border-t border-[color:var(--color-border-light)] p-5 sm:p-6">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                                    Delivery Details
                                </h2>

                                <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                                    Add your house, building, street or other
                                    useful delivery details.
                                </p>
                            </div>

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

                            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={processing || skipping}
                                    loading={skipping}
                                    onClick={() => {
                                        setSkipping(true);
                                        post(route("customer.addresses.skip"));
                                    }}
                                >
                                    {address ? "Cancel" : "Skip for Now"}
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={!canSubmit || skipping}
                                    loading={processing && !skipping}
                                >
                                    {address
                                        ? "Update Address"
                                        : "Save Address"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </AppLayout>
        </>
    );
}
