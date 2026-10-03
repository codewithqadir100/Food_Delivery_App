import Card from "@/Components/Common/Card";
import Badge from "@/Components/Common/Badge";
import FavouriteButton from "@/Components/Customer/FavouriteButton";
import { MapPin, Star, Motorbike } from "lucide-react";
import { formatRating, formatReviewCount } from "@/Utils/reviews";

export default function RestaurantCard({
    restaurant,
    user,
    onCardClick,
    onFavourite,
}) {
    const unavailable = restaurant.listing_availability === "unavailable";
    const showDistance =
        user?.role === "customer" && restaurant.distance_km !== null;
    const showDeliveryCharge =
        user?.role === "customer" && restaurant.delivery_charge !== null;

    return (
        <Card
            shadow={true}
            padding="none"
            className={`overflow-hidden transition-shadow ${
                unavailable
                    ? "cursor-default"
                    : "cursor-pointer hover:shadow-lg"
            }`}
            onClick={unavailable ? undefined : onCardClick}
        >
            <div className="relative aspect-video overflow-hidden bg-[color:var(--color-bg-tertiary)]">
                {restaurant.cover_image_url ? (
                    <img
                        src={restaurant.cover_image_url}
                        alt={restaurant.name}
                        className={`h-full w-full object-cover ${
                            unavailable
                                ? ""
                                : "transition-transform hover:scale-105"
                        }`}
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <MapPin
                            size={48}
                            className="text-[color:var(--color-text-muted)]"
                        />
                    </div>
                )}

                {onFavourite && (
                    <FavouriteButton
                        active={Boolean(restaurant.is_wishlisted)}
                        onClick={onFavourite}
                        className="absolute right-3 top-3"
                    />
                )}

                {(unavailable || restaurant.is_featured) && (
                    <div className="absolute left-3 top-3 flex flex-col items-start gap-1">
                        {unavailable && (
                            <Badge variant="warning" size="sm">
                                Unavailable
                            </Badge>
                        )}
                        {restaurant.is_featured && (
                            <Badge variant="primary" size="sm">
                                Featured
                            </Badge>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-[var(--spacing-3)] p-[var(--spacing-4)]">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="restaurant-card-title truncate min-w-0">
                        {restaurant.name}
                    </h3>

                    {formatRating(restaurant.rating) && formatReviewCount(restaurant.review_count) ? (
                        <div className="flex shrink-0 items-center gap-1">
                            <span className="restaurant-card-rating">
                                <Star
                                    size={12}
                                    aria-hidden="true"
                                    fill="var(--color-warning-500)"
                                    stroke="var(--color-warning-500)"
                                />
                                {formatRating(restaurant.rating)}
                            </span>
                            <span className="restaurant-card-review-count">
                                ({formatReviewCount(restaurant.review_count)})
                            </span>
                        </div>
                    ) : (
                        <span className="restaurant-card-review-count shrink-0">
                            New
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-[var(--spacing-2)]">
                    <span className="restaurant-card-category">
                        {restaurant.category?.name || "Restaurant"}
                    </span>

                    <div className="flex items-center gap-1">
                        <Motorbike
                            size={14}
                            className="text-[color:var(--color-text-muted)]"
                        />
                        <span className="restaurant-card-distance">
                            {showDistance
                                ? `${restaurant.distance_km} km`
                                : "--"}
                        </span>
                    </div>

                    <p className="restaurant-card-delivery-charges font-semibold">
                        Rs.{" "}
                        {showDeliveryCharge ? restaurant.delivery_charge : "--"}
                    </p>
                </div>
            </div>
        </Card>
    );
}
