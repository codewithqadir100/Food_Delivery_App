import { router } from "@inertiajs/react";
import Button from "@/Components/Common/Button";
import Card from "@/Components/Common/Card";
import { MapPin, Star, Motorbike } from "lucide-react";

export default function RestaurantCard({ restaurant, user, onCardClick }) {
    const handleLoginClick = (e) => {
        e.stopPropagation();
        router.visit(route("login"));
    };

    return (
        <Card
            key={restaurant.id}
            shadow={true}
            padding="none"
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={onCardClick}
        >
            {/* Cover Image */}
            <div className="aspect-video overflow-hidden bg-[color:var(--color-bg-tertiary)]">
                {restaurant.cover_image_url ? (
                    <img
                        src={restaurant.cover_image_url}
                        alt={restaurant.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <MapPin
                            size={48}
                            className="text-[color:var(--color-text-muted)]"
                        />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-[var(--spacing-4)] space-y-[var(--spacing-3)]">
                {/* Name */}
                <div className=" flex items-center justify-between">
                    <h3 className="restaurant-card-title line-clamp-2">
                        {restaurant.name}
                    </h3>

                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-[var(--spacing-2)]">
                        <span className="restaurant-card-rating flex items-center gap-[var(--spacing-1)]">
                            <Star
                                size={14}
                                fill="var(--color-primary-300)"
                                stroke="var(--color-primary-500)"
                            />
                            {restaurant.rating}
                        </span>
                        <span className="restaurant-card-review-count">
                            ({restaurant.review_count})
                        </span>
                    </div>
                </div>

                <div className="flex !mt-[var(--spacing-1)] gap-[var(--spacing-2)] items-center">
                    {/* Category */}
                    <span className="restaurant-card-category">
                        {restaurant.category?.name || "Restaurant"}
                    </span>

                    {/* Distance with Bike Icon */}
                    <div className="flex items-center gap-1">
                        <Motorbike
                            size={14}
                            className="text-[color:var(--color-text-muted)]"
                        />
                        <span className="restaurant-card-distance">
                            {restaurant.distance_km
                                ? `${restaurant.distance_km} km`
                                : "—"}
                        </span>
                    </div>

                    {/* Delivery Charges */}
                    <p className="font-semibold restaurant-card-delivery-charges">
                        Rs. {restaurant.delivery_charge || "—"}
                    </p>
                </div>

                {/* View Menu / Login Button */}
                {user ? (
                    <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        onClick={onCardClick}
                    >
                        View Menu
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        onClick={handleLoginClick}
                    >
                        Login to Browse Menu
                    </Button>
                )}
            </div>
        </Card>
    );
}
