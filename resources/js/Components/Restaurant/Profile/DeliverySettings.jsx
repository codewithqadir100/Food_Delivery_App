import { useState } from "react";
import TextInput from "@/Components/Forms/TextInput";
import FormLabel from "@/Components/Forms/FormLabel";
import MapLocationPicker from "@/Components/Common/MapLocationPicker";

export default function DeliverySettings({ data, errors = {}, onChange }) {
    const handleLocationSelect = (location) => {
        onChange("latitude", location.latitude);
        onChange("longitude", location.longitude);
        onChange("city_name", location.city);
        onChange("area_name", location.area);
    };

    const initialLocation =
        data.latitude && data.longitude
            ? {
                  latitude: data.latitude,
                  longitude: data.longitude,
                  city: data.city_name,
                  area: data.area_name,
                  fullAddress: data.address,
              }
            : null;

    return (
        <section className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                    Delivery & Service Area
                </h2>
                <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                    Set your restaurant location on the map and define your
                    delivery radius.
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <FormLabel label="Restaurant Location" required />
                    <p className="text-xs text-[color:var(--color-text-muted)] mb-3">
                        Click on the map or search to select your restaurant
                        location
                    </p>
                    <MapLocationPicker
                        onLocationSelect={handleLocationSelect}
                        initialLocation={initialLocation}
                    />
                    {errors.latitude && (
                        <p className="text-xs text-[color:var(--color-danger-500)] mt-1">
                            {errors.latitude}
                        </p>
                    )}
                    {errors.longitude && (
                        <p className="text-xs text-[color:var(--color-danger-500)] mt-1">
                            {errors.longitude}
                        </p>
                    )}
                </div>

                <div>
                    <TextInput
                        label="Service Radius (KM)"
                        type="number"
                        min="1"
                        max="100"
                        step="0.5"
                        value={data.service_radius_km}
                        onChange={(event) =>
                            onChange(
                                "service_radius_km",
                                parseFloat(event.target.value),
                            )
                        }
                        error={errors.service_radius_km}
                        required
                        placeholder="e.g., 5"
                    />
                    <p className="text-xs text-[color:var(--color-text-muted)] mt-2">
                        Customers within this radius can place orders from your
                        restaurant
                    </p>
                </div>
            </div>
        </section>
    );
}
