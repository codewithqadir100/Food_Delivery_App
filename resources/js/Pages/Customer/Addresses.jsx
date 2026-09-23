import { useForm } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import MapLocationPicker from "@/Components/Common/MapLocationPicker";
import TextInput from "@/Components/Forms/TextInput";
import Button from "@/Components/Common/Button";

const initialData = {
    latitude: null,
    longitude: null,
    city_name: "",
    area_name: "",
    street_address: "",
};

export default function Addresses() {
    const { data, setData, post, processing, errors } = useForm(initialData);

    const handleLocationSelect = (location) => {
        setData({
            ...data,
            latitude: location.latitude,
            longitude: location.longitude,
            city_name: location.city,
            area_name: location.area,
        });
    };

    const handleStreetAddressChange = (event) => {
        setData("street_address", event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        post(route("customer.addresses.store"), {
            preserveScroll: true,
        });
    };

    const hasLocation = data.latitude !== null && data.longitude !== null;

    const hasChanges =
        data.latitude !== initialData.latitude ||
        data.longitude !== initialData.longitude ||
        data.city_name !== initialData.city_name ||
        data.area_name !== initialData.area_name ||
        data.street_address !== initialData.street_address;

    return (
        <>
            <Head title="Delivery Address" />

            <AppLayout>
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-[color:var(--color-text-primary)]">
                            Add Delivery Address
                        </h1>

                        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                            Select your location and enter your delivery
                            address.
                        </p>
                    </div>

                    <div className="bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]">
                        <div className="p-5 sm:p-6">
                            <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                                Choose Location
                            </h2>

                            <p className="mt-1 mb-4 text-sm text-[color:var(--color-text-muted)]">
                                Search for your location or select it directly
                                on the map.
                            </p>

                            <MapLocationPicker
                                onLocationSelect={handleLocationSelect}
                            />

                            {errors.latitude || errors.longitude ? (
                                <p className="mt-3 text-sm text-[color:var(--color-danger-600)]">
                                    Please select a valid delivery location.
                                </p>
                            ) : null}
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
                                onChange={handleStreetAddressChange}
                                placeholder="House 123, Street 5, Block A"
                                error={errors.street_address}
                            />

                            <div className="mt-6 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={!hasChanges || processing}
                                    onClick={handleSubmit}
                                >
                                    {processing ? "Saving..." : "Save Address"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
