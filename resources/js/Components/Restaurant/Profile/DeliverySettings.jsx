import { useState } from "react";
import FormLabel from "@/Components/Forms/FormLabel";
import MapLocationPicker from "@/Components/Common/MapLocationPicker";
import { Radius } from "lucide-react";

export default function DeliverySettings({ data, errors = {}, onChange }) {
    const handleLocationSelect = (location) => {
        onChange("latitude", location.latitude);
        onChange("longitude", location.longitude);
        onChange("city_name", location.city);
        onChange("area_name", location.area);
        onChange("address", location.address);
    };

    const initialLocation =
        data.latitude && data.longitude
            ? {
                  latitude: data.latitude,
                  longitude: data.longitude,
                  city: data.city_name,
                  area: data.area_name,
                  name: data.address,
                  address: data.address,
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

            <div className="space-y-6">
                <div>
                    <FormLabel label="Restaurant Location" required />
                    <p className="text-xs text-[color:var(--color-text-muted)] mb-4">
                        Click on the map or search to select your restaurant
                        location
                    </p>
                    <MapLocationPicker
                        onLocationSelect={handleLocationSelect}
                        initialLocation={initialLocation}
                    />
                    {errors.latitude && (
                        <p className="text-xs text-[color:var(--color-danger-500)] mt-2">
                            {errors.latitude}
                        </p>
                    )}
                    {errors.longitude && (
                        <p className="text-xs text-[color:var(--color-danger-500)] mt-2">
                            {errors.longitude}
                        </p>
                    )}
                </div>

                <div className="bg-gradient-to-br from-[color:var(--color-primary-50)] to-[color:var(--color-bg-secondary)] p-6 rounded-[var(--radius-md)] border border-[color:var(--color-primary-200)]">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-[color:var(--color-primary-100)] rounded-[var(--radius-md)] flex-shrink-0">
                            <Radius
                                size={24}
                                className="text-[color:var(--color-primary-600)]"
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <FormLabel label="Service Radius" required />
                            <p className="text-xs text-[color:var(--color-text-muted)] mt-1 mb-4">
                                How far do you deliver? Set the maximum distance
                                in kilometers
                            </p>

                            <div className="relative">
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    step="0.5"
                                    value={data.service_radius_km || ""}
                                    onChange={(e) =>
                                        onChange(
                                            "service_radius_km",
                                            parseFloat(e.target.value),
                                        )
                                    }
                                    className="w-full px-4 py-3 border border-[color:var(--color-border)] rounded-[var(--radius-md)] bg-[color:var(--color-bg-primary)] text-[color:var(--color-text-primary)] focus:outline-none focus:border-[color:var(--color-primary-500)] focus:ring-1 focus:ring-[color:var(--color-primary-100)] transition-all"
                                    placeholder="e.g., 5"
                                    required
                                />
                                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[color:var(--color-text-muted)] font-semibold pointer-events-none">
                                    km
                                </span>
                            </div>

                            {errors.service_radius_km && (
                                <p className="text-xs text-[color:var(--color-danger-500)] mt-2">
                                    {errors.service_radius_km}
                                </p>
                            )}

                            <div className="mt-3 pt-3 border-t border-[color:var(--color-primary-200)]">
                                <p className="text-xs font-medium text-[color:var(--color-text-muted)]">
                                    📍 Service Area:{" "}
                                    <span className="font-bold text-[color:var(--color-primary-600)]">
                                        {data.service_radius_km || 0} km radius
                                    </span>
                                </p>
                                <p className="text-xs text-[color:var(--color-text-muted)] mt-1">
                                    Customers within this distance can place
                                    orders
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
