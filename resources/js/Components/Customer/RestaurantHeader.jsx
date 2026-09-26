import { ArrowLeft, MapPin, DollarSign, Star } from "lucide-react";

export default function RestaurantHeader({
    restaurant,
    deliveryCharge = null,
    distance = null,
    onBack,
}) {
    const hasDistance = distance !== null && distance !== undefined;
    const hasDeliveryCharge =
        deliveryCharge !== null && deliveryCharge !== undefined;

    return (
        <div className="bg-[color:var(--color-bg-primary)] border-b border-[color:var(--color-border)]">
            <div className="max-w-6xl mx-auto">
                {onBack && (
                    <div className="px-4 pt-4 pb-2 flex items-center">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-[var(--radius-md)] hover:bg-[color:var(--color-bg-secondary)] transition-colors duration-[var(--transition-fast)]"
                        >
                            <ArrowLeft className="w-5 h-5 text-[color:var(--color-text-primary)]" />
                        </button>
                    </div>
                )}

                <div className="px-4 pb-6 pt-2 space-y-4">
                    <div className="flex items-start gap-4">
                        {restaurant.logo && (
                            <img
                                src={restaurant.logo}
                                alt={restaurant.name}
                                className="w-16 h-16 rounded-[var(--radius-md)] object-cover"
                            />
                        )}
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-[color:var(--color-text-primary)]">
                                {restaurant.name}
                            </h1>

                            {restaurant.category && (
                                <p className="text-sm text-[color:var(--color-text-muted)] mt-1">
                                    {restaurant.category}
                                </p>
                            )}

                            <div className="flex items-center gap-3 mt-2">
                                {restaurant.rating && (
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-[color:var(--color-warning-500)] text-[color:var(--color-warning-500)]" />
                                        <span className="text-sm font-medium text-[color:var(--color-text-primary)]">
                                            {restaurant.rating}
                                        </span>
                                        {restaurant.review_count > 0 && (
                                            <span className="text-xs text-[color:var(--color-text-muted)]">
                                                ({restaurant.review_count})
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {restaurant.description && (
                        <p className="text-sm text-[color:var(--color-text-secondary)]">
                            {restaurant.description}
                        </p>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 p-2 rounded-[var(--radius-md)] bg-[color:var(--color-bg-secondary)]">
                            <MapPin className="w-4 h-4 text-[color:var(--color-primary-600)]" />
                            <div className="text-xs">
                                <p className="text-[color:var(--color-text-muted)]">
                                    Distance
                                </p>
                                <p className="font-medium text-[color:var(--color-text-primary)]">
                                    {hasDistance
                                        ? `${Number(distance).toFixed(2)} km`
                                        : "--"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 rounded-[var(--radius-md)] bg-[color:var(--color-bg-secondary)]">
                            <DollarSign className="w-4 h-4 text-[color:var(--color-primary-600)]" />
                            <div className="text-xs">
                                <p className="text-[color:var(--color-text-muted)]">
                                    Delivery
                                </p>
                                <p className="font-medium text-[color:var(--color-text-primary)]">
                                    {hasDeliveryCharge
                                        ? `Rs. ${deliveryCharge}`
                                        : "--"}
                                </p>
                            </div>
                        </div>

                        {restaurant.street_address && (
                            <div className="col-span-2 sm:col-span-1 flex items-center gap-2 p-2 rounded-[var(--radius-md)] bg-[color:var(--color-bg-secondary)]">
                                <MapPin className="w-4 h-4 text-[color:var(--color-primary-600)] flex-shrink-0" />
                                <div className="text-xs min-w-0">
                                    <p className="text-[color:var(--color-text-muted)]">
                                        Location
                                    </p>
                                    <p className="font-medium text-[color:var(--color-text-primary)] truncate">
                                        {restaurant.street_address}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
