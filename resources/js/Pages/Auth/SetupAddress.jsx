import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import LocationMap from "@/Components/Common/LocationMap";
import TextInput from "@/Components/Forms/TextInput";
import Button from "@/Components/Common/Button";
import { AlertCircle, MapPin } from "lucide-react";

export default function SetupAddress() {
    const { auth } = usePage().props;
    const [selectedLocation, setSelectedLocation] = useState({
        latitude: null,
        longitude: null,
        city_name: "",
        area_name: "",
    });
    const [streetAddress, setStreetAddress] = useState("");
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLocationSelect = (lat, lng, city, area) => {
        setSelectedLocation({
            latitude: lat,
            longitude: lng,
            city_name: city,
            area_name: area,
        });
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!selectedLocation.latitude || !selectedLocation.longitude) {
            setErrors({ location: "Please select a location on the map" });
            return;
        }

        if (!streetAddress.trim()) {
            setErrors({ street_address: "Street address is required" });
            return;
        }

        if (streetAddress.trim().length < 5) {
            setErrors({
                street_address: "Street address must be at least 5 characters",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            await router.post("/address", {
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
                city_name: selectedLocation.city_name,
                area_name: selectedLocation.area_name,
                street_address: streetAddress.trim(),
            });
        } catch (error) {
            console.error("Error saving address:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        router.get("/");
    };

    return (
        <AuthenticatedLayout>
            <div
                className="min-h-screen"
                style={{ backgroundColor: "var(--color-bg-secondary)" }}
            >
                <div className="max-w-2xl mx-auto p-4 md:p-6">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <MapPin
                                size={28}
                                style={{ color: "var(--color-primary-600)" }}
                            />
                            <h1
                                className="text-2xl md:text-3xl font-bold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Set Your Delivery Address
                            </h1>
                        </div>
                        <p
                            style={{ color: "var(--color-text-muted)" }}
                            className="text-sm md:text-base"
                        >
                            Help us find you by selecting your location on the
                            map. This is where we'll deliver your food orders.
                        </p>
                    </div>

                    {/* Main Card */}
                    <div
                        className="rounded-lg p-6 md:p-8"
                        style={{
                            backgroundColor: "var(--color-bg-primary)",
                            boxShadow: "var(--shadow-md)",
                        }}
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Map Section */}
                            <div>
                                <label
                                    className="block font-medium mb-3"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Select Location on Map
                                </label>
                                <LocationMap
                                    onLocationSelect={handleLocationSelect}
                                    isLoading={isSubmitting}
                                />
                                {errors.location && (
                                    <div
                                        className="mt-3 flex items-center gap-2 p-3 rounded-lg"
                                        style={{
                                            backgroundColor:
                                                "var(--color-error-50)",
                                            borderLeft:
                                                "4px solid var(--color-error-600)",
                                        }}
                                    >
                                        <AlertCircle
                                            size={18}
                                            style={{
                                                color: "var(--color-error-600)",
                                            }}
                                        />
                                        <span
                                            style={{
                                                color: "var(--color-error-600)",
                                            }}
                                            className="text-sm"
                                        >
                                            {errors.location}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Location Preview */}
                            {selectedLocation.latitude && (
                                <div
                                    className="rounded-lg p-4 border"
                                    style={{
                                        backgroundColor:
                                            "var(--color-bg-secondary)",
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <h3
                                        className="font-semibold mb-3"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        Selected Location
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p
                                                style={{
                                                    color: "var(--color-text-muted)",
                                                }}
                                                className="text-xs uppercase tracking-wide mb-1"
                                            >
                                                City
                                            </p>
                                            <p
                                                className="font-medium text-sm"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {selectedLocation.city_name ||
                                                    "Not available"}
                                            </p>
                                        </div>
                                        <div>
                                            <p
                                                style={{
                                                    color: "var(--color-text-muted)",
                                                }}
                                                className="text-xs uppercase tracking-wide mb-1"
                                            >
                                                Area
                                            </p>
                                            <p
                                                className="font-medium text-sm"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {selectedLocation.area_name ||
                                                    "Not available"}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className="mt-3 pt-3 border-t"
                                        style={{
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <p
                                            style={{
                                                color: "var(--color-text-muted)",
                                            }}
                                            className="text-xs uppercase tracking-wide mb-1"
                                        >
                                            Coordinates
                                        </p>
                                        <p
                                            className="text-sm font-mono"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {selectedLocation.latitude?.toFixed(
                                                4,
                                            )}
                                            ,{" "}
                                            {selectedLocation.longitude?.toFixed(
                                                4,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Street Address */}
                            <div>
                                <label
                                    className="block font-medium mb-2"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Street Address
                                </label>
                                <TextInput
                                    type="text"
                                    placeholder="e.g., House 123, Main Street, Building A"
                                    value={streetAddress}
                                    onChange={(e) => {
                                        setStreetAddress(e.target.value);
                                        if (errors.street_address) {
                                            setErrors({
                                                ...errors,
                                                street_address: "",
                                            });
                                        }
                                    }}
                                    error={errors.street_address}
                                />
                                {errors.street_address && (
                                    <p
                                        style={{
                                            color: "var(--color-error-600)",
                                        }}
                                        className="text-sm mt-2"
                                    >
                                        {errors.street_address}
                                    </p>
                                )}
                                <p
                                    style={{ color: "var(--color-text-muted)" }}
                                    className="text-xs mt-2"
                                >
                                    Provide specific details so delivery
                                    partners can find you easily
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleSkip}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors border"
                                    style={{
                                        backgroundColor:
                                            "var(--color-bg-secondary)",
                                        borderColor: "var(--color-border)",
                                        color: "var(--color-text-primary)",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor =
                                            "var(--color-bg-tertiary)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor =
                                            "var(--color-bg-secondary)";
                                    }}
                                >
                                    Skip for Now
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        isSubmitting ||
                                        !selectedLocation.latitude
                                    }
                                    className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-white"
                                    style={{
                                        backgroundColor:
                                            isSubmitting ||
                                            !selectedLocation.latitude
                                                ? "var(--color-primary-400)"
                                                : "var(--color-primary-600)",
                                        cursor:
                                            isSubmitting ||
                                            !selectedLocation.latitude
                                                ? "not-allowed"
                                                : "pointer",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (
                                            !isSubmitting &&
                                            selectedLocation.latitude
                                        ) {
                                            e.target.style.backgroundColor =
                                                "var(--color-primary-700)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (
                                            !isSubmitting &&
                                            selectedLocation.latitude
                                        ) {
                                            e.target.style.backgroundColor =
                                                "var(--color-primary-600)";
                                        }
                                    }}
                                >
                                    {isSubmitting
                                        ? "Saving..."
                                        : "Confirm Address"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Helper text */}
                    <div
                        className="mt-6 p-4 rounded-lg"
                        style={{ backgroundColor: "var(--color-info-50)" }}
                    >
                        <p
                            style={{ color: "var(--color-info-700)" }}
                            className="text-sm"
                        >
                            💡 <strong>Tip:</strong> You can add more delivery
                            addresses later from your profile settings.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
