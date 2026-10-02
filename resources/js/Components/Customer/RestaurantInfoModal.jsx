import { Clock, MapPin, Phone } from "lucide-react";
import Modal from "@/Components/Common/Modal";
import LocationSnapshot from "@/Components/Customer/LocationSnapshot";
import { formatCurrency } from "@/Utils/formatCurrency";

export default function RestaurantInfoModal({
    restaurant,
    deliveryCharge = null,
    distance = null,
    isOpen,
    onClose,
}) {
    const address = [
        restaurant.street_address,
        restaurant.area_name,
        restaurant.city_name,
    ]
        .filter(Boolean)
        .join(", ");
    const hasCoordinates =
        restaurant.latitude != null && restaurant.longitude != null;
    const hasCharge = deliveryCharge !== null && deliveryCharge !== undefined;
    const hasDistance = distance !== null && distance !== undefined;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={restaurant.name}
            size="lg"
        >
            <div className="space-y-[var(--spacing-5)]">
                <div className="flex items-start gap-[var(--spacing-3)]">
                    <Clock
                        size={18}
                        className="mt-0.5 shrink-0 text-[color:var(--color-text-secondary)]"
                    />
                    <div>
                        <p className="font-semibold text-[color:var(--color-text-primary)]">
                            {restaurant.is_open ? "Open now" : "Closed"}
                        </p>
                        {restaurant.is_home_chef ? (
                            <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                                Home chef
                            </p>
                        ) : null}
                    </div>
                </div>

                {address ? (
                    <div className="flex items-start gap-[var(--spacing-3)]">
                        <MapPin
                            size={18}
                            className="mt-0.5 shrink-0 text-[color:var(--color-text-secondary)]"
                        />
                        <p className="font-semibold leading-6 text-[color:var(--color-text-primary)]">
                            {address}
                        </p>
                    </div>
                ) : null}

                {hasCoordinates ? (
                    <LocationSnapshot
                        latitude={restaurant.latitude}
                        longitude={restaurant.longitude}
                        label={restaurant.name}
                    />
                ) : null}

                <section className="space-y-[var(--spacing-2)]">
                    <h3 className="text-base font-semibold text-[color:var(--color-text-primary)]">
                        Delivery fee
                    </h3>
                    <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
                        {deliveryCopy({
                            hasCharge,
                            deliveryCharge,
                            hasDistance,
                            distance,
                            baseFee: restaurant.delivery_fee_base,
                            perKmFee: restaurant.delivery_fee_per_km,
                            radiusKm: restaurant.service_radius_km,
                        })}
                    </p>
                </section>

                {restaurant.description ? (
                    <section className="space-y-[var(--spacing-2)]">
                        <h3 className="text-base font-semibold text-[color:var(--color-text-primary)]">
                            About
                        </h3>
                        <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
                            {restaurant.description}
                        </p>
                    </section>
                ) : null}

                {restaurant.phone ? (
                    <section className="space-y-[var(--spacing-2)]">
                        <h3 className="text-base font-semibold text-[color:var(--color-text-primary)]">
                            Phone
                        </h3>
                        <a
                            href={`tel:${restaurant.phone}`}
                            className="inline-flex items-center gap-[var(--spacing-2)] text-sm text-[color:var(--color-primary-600)]"
                        >
                            <Phone size={16} />
                            {restaurant.phone}
                        </a>
                    </section>
                ) : null}
            </div>
        </Modal>
    );
}

function deliveryCopy({
    hasCharge,
    deliveryCharge,
    hasDistance,
    distance,
    baseFee,
    perKmFee,
    radiusKm,
}) {
    const parts = [];

    if (hasCharge) {
        const distanceText = hasDistance
            ? ` for about ${Number(distance).toFixed(1)} km from your address`
            : "";
        parts.push(
            `Your delivery fee is ${formatCurrency(deliveryCharge)}${distanceText}.`,
        );
    } else {
        parts.push(
            "Your delivery fee is calculated from the address saved on your account.",
        );
    }

    if (baseFee != null && perKmFee != null) {
        parts.push(
            `The fee is ${formatCurrency(baseFee)} plus ${formatCurrency(perKmFee)} per kilometre.`,
        );
    }

    if (radiusKm != null && radiusKm !== "") {
        parts.push(`This restaurant delivers within ${radiusKm} km.`);
    }

    return parts.join(" ");
}
