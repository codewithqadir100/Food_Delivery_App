import { useState } from "react";
import MapLocationPicker from "@/Components/Common/MapLocationPicker";

export default function DeliverySettings({ data, errors = {}, onChange }) {
    const handleLocationSelect = (location) => {
        onChange("location_data", {
            latitude: location.latitude,
            longitude: location.longitude,
            city_name: location.city,
            area_name: location.area,
            address: location.address,
        });
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

                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                            Delivery Radius
                        </h2>

                        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                            Set the maximum distance your restaurant delivers.
                        </p>
                    </div>

                    <div className="relative mt-3 sm:min-w-96">
                        <input
                            id="service_radius_km"
                            type="number"
                            min="1"
                            max="100"
                            step="0.5"
                            value={data.service_radius_km ?? ""}
                            onChange={(e) =>
                                onChange(
                                    "service_radius_km",
                                    e.target.value === ""
                                        ? ""
                                        : Number(e.target.value),
                                )
                            }
                            className="w-full rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] px-4 py-3 pr-14 text-sm text-[color:var(--color-text-primary)] outline-none transition-[border-color,box-shadow] duration-[var(--transition-normal)] placeholder:text-[color:var(--color-text-muted)] focus:border-[color:var(--color-primary-500)] focus:ring-2 focus:ring-[color:var(--color-primary-100)]"
                            placeholder="e.g. 5"
                            required
                        />

                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium uppercase text-[color:var(--color-text-muted)]">
                            KM
                        </span>
                    </div>

                    {errors.service_radius_km && (
                        <p className="mt-2 text-xs text-[color:var(--color-danger-500)]">
                            {errors.service_radius_km}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
