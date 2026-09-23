import { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Button from "@/Components/Common/Button";
import TextInput from "@/Components/Forms/TextInput";
import MapPickerModal from "@/Components/Common/MapPickerModal";
import { MapPin } from "lucide-react";
import { isAddressComplete, formatAddress } from "@/Utils/AddressHelper";

export default function SetupAddress() {
    const { data, setData, processing, errors } = useForm({
        latitude: "",
        longitude: "",
        city_name: "",
        area_name: "",
        street_address: "",
    });

    const [mapOpen, setMapOpen] = useState(false);
    const [addressPreview, setAddressPreview] = useState(null);

    const handleLocationChange = (lat, lon, city, area) => {
        setData({
            ...data,
            latitude: lat.toString(),
            longitude: lon.toString(),
            city_name: city,
            area_name: area,
        });
        setAddressPreview({
            latitude: lat,
            longitude: lon,
            city_name: city,
            area_name: area,
        });
        setMapOpen(false);
    };

    const handleStreetAddressChange = (e) => {
        setData("street_address", e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isAddressComplete(data)) {
            alert("Please fill all address details");
            return;
        }

        router.post(route("address.store"), data);
    };

    const handleSkip = () => {
        router.post(route("address.skip"));
    };

    return (
        <>
            <Head title="Set Delivery Address" />
            <AuthenticatedLayout>
                <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-bg-secondary)] px-4 py-8">
                    <div className="w-full max-w-2xl">
                        <div className="mb-8 text-center">
                            <h1
                                className="font-bold text-[color:var(--color-text-primary)] mb-2"
                                style={{ fontSize: "var(--font-size-2xl)" }}
                            >
                                Set Your Delivery Address
                            </h1>
                            <p className="text-[color:var(--color-text-muted)]">
                                We need your location to show restaurants near
                                you
                            </p>
                        </div>

                        <div className="bg-[color:var(--color-bg-primary)] rounded-lg p-8 shadow-md">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-3">
                                        📍 Delivery Location
                                    </label>

                                    {addressPreview ? (
                                        <div className="p-4 bg-[color:var(--color-success-50)] border border-[color:var(--color-success-200)] rounded-lg mb-4">
                                            <div className="flex items-start gap-3">
                                                <MapPin
                                                    size={20}
                                                    className="text-[color:var(--color-success-600)] flex-shrink-0 mt-1"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                                                        {
                                                            addressPreview.area_name
                                                        }
                                                        ,{" "}
                                                        {
                                                            addressPreview.city_name
                                                        }
                                                    </p>
                                                    <p className="text-xs text-[color:var(--color-text-muted)] mt-1">
                                                        Lat:{" "}
                                                        {addressPreview.latitude.toFixed(
                                                            4,
                                                        )}
                                                        , Lon:{" "}
                                                        {addressPreview.longitude.toFixed(
                                                            4,
                                                        )}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setMapOpen(true)
                                                    }
                                                    className="text-sm text-[color:var(--color-primary-600)] hover:underline whitespace-nowrap"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setMapOpen(true)}
                                            className="w-full p-4 border-2 border-dashed border-[color:var(--color-border-light)] rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors text-[color:var(--color-text-muted)] hover:text-[color:var(--color-primary-600)]"
                                        >
                                            + Open Map to Select Location
                                        </button>
                                    )}

                                    <MapPickerModal
                                        isOpen={mapOpen}
                                        onLocationSelect={handleLocationChange}
                                        onClose={() => setMapOpen(false)}
                                        initialLat={
                                            data.latitude
                                                ? parseFloat(data.latitude)
                                                : null
                                        }
                                        initialLon={
                                            data.longitude
                                                ? parseFloat(data.longitude)
                                                : null
                                        }
                                    />

                                    {errors.latitude && (
                                        <p className="text-sm text-[color:var(--color-danger-600)] mt-2">
                                            {errors.latitude}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
                                        House/Building Number & Street Name *
                                    </label>
                                    <TextInput
                                        placeholder="e.g., Flat 123, ABC Heights, Main Road"
                                        value={data.street_address}
                                        onChange={handleStreetAddressChange}
                                    />
                                    {errors.street_address && (
                                        <p className="text-sm text-[color:var(--color-danger-600)] mt-2">
                                            {errors.street_address}
                                        </p>
                                    )}
                                </div>

                                {isAddressComplete(data) && (
                                    <div className="p-4 bg-[color:var(--color-bg-secondary)] rounded-lg">
                                        <p className="text-sm text-[color:var(--color-text-muted)] mb-1">
                                            Complete Address:
                                        </p>
                                        <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                                            {formatAddress(data)}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleSkip}
                                        className="flex-1 px-4 py-2 border border-[color:var(--color-border-light)] rounded-lg text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors font-medium"
                                    >
                                        Skip for Later
                                    </button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="md"
                                        disabled={
                                            !isAddressComplete(data) ||
                                            processing
                                        }
                                        className="flex-1"
                                    >
                                        {processing
                                            ? "Saving..."
                                            : "Save Address"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
}
