import { useState } from "react";
import { Link } from "@inertiajs/react";
import { ChevronRight, Info, Star } from "lucide-react";
import FavouriteButton from "@/Components/Customer/FavouriteButton";
import RestaurantInfoModal from "@/Components/Customer/RestaurantInfoModal";

export default function RestaurantHeader({
    restaurant,
    deliveryCharge = null,
    distance = null,
    wishlisted = false,
    onFavourite,
}) {
    const [infoOpen, setInfoOpen] = useState(false);

    return (
        <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]">
            <div className="mx-auto max-w-6xl px-[var(--spacing-4)] pt-[var(--spacing-4)]">
                <nav
                    aria-label="Breadcrumb"
                    className="mb-[var(--spacing-3)] flex flex-wrap items-center gap-[var(--spacing-2)] text-sm md:mb-[var(--spacing-4)]"
                >
                    <Link
                        href={route("home")}
                        className="text-[color:var(--color-text-muted)] transition-colors duration-[var(--transition-fast)] hover:text-[color:var(--color-primary-600)]"
                    >
                        Home
                    </Link>
                    <ChevronRight
                        size={14}
                        className="text-[color:var(--color-text-muted)]"
                    />
                    <Link
                        href={route("restaurants.index")}
                        className="text-[color:var(--color-text-muted)] transition-colors duration-[var(--transition-fast)] hover:text-[color:var(--color-primary-600)]"
                    >
                        Restaurants
                    </Link>
                    <ChevronRight
                        size={14}
                        className="text-[color:var(--color-text-muted)]"
                    />
                    <span className="font-medium text-[color:var(--color-text-primary)]">
                        {restaurant.name}
                    </span>
                </nav>
            </div>

            <div className="relative z-10 md:hidden">
                <Cover restaurant={restaurant} />
                <HeaderActions
                    onInfo={() => setInfoOpen(true)}
                    wishlisted={wishlisted}
                    onFavourite={onFavourite}
                    className="absolute right-[var(--spacing-3)] top-[var(--spacing-3)] flex"
                />
                <div className="absolute -bottom-12 left-[var(--spacing-4)] z-10">
                    <RestaurantLogo
                        restaurant={restaurant}
                        className="ring-4 ring-[color:var(--color-bg-primary)]"
                    />
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-[var(--spacing-4)] pb-[var(--spacing-6)] pt-[calc(3rem+var(--spacing-4))] md:pt-0">
                <div className="flex items-start gap-[var(--spacing-4)]">
                    <div className="hidden md:block">
                        <RestaurantLogo restaurant={restaurant} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-[var(--spacing-3)]">
                            <h1 className="text-2xl font-bold text-[color:var(--color-text-primary)] md:text-2xl">
                                {restaurant.name}
                            </h1>
                            <HeaderActions
                                onInfo={() => setInfoOpen(true)}
                                wishlisted={wishlisted}
                                onFavourite={onFavourite}
                                className="hidden shrink-0 md:flex"
                            />
                        </div>
                        {restaurant.category && (
                            <p className="text-sm text-[color:var(--color-text-muted)]">
                                {restaurant.category}
                            </p>
                        )}
                        <div className="mt-[var(--spacing-2)]">
                            <Rating restaurant={restaurant} />
                        </div>
                    </div>
                </div>
            </div>

            <RestaurantInfoModal
                restaurant={restaurant}
                deliveryCharge={deliveryCharge}
                distance={distance}
                isOpen={infoOpen}
                onClose={() => setInfoOpen(false)}
            />
        </header>
    );
}

function Cover({ restaurant }) {
    if (restaurant.cover_image_url) {
        return (
            <img
                src={restaurant.cover_image_url}
                alt=""
                className="aspect-[5/2] w-full object-cover"
                loading="lazy"
            />
        );
    }

    return (
        <div className="aspect-[5/2] w-full bg-[color:var(--color-primary-100)]" />
    );
}

function RestaurantLogo({ restaurant, className = "" }) {
    const letter = restaurant.name?.trim()?.charAt(0)?.toUpperCase() || "R";

    if (restaurant.logo) {
        return (
            <img
                src={restaurant.logo}
                alt=""
                className={`h-24 w-24 rounded-[var(--radius-md)] object-cover ${className}`}
                loading="lazy"
            />
        );
    }

    return (
        <div
            className={`flex h-24 w-24 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-primary-100)] text-2xl font-semibold text-[color:var(--color-primary-700)] ${className}`}
            aria-hidden="true"
        >
            {letter}
        </div>
    );
}

function HeaderActions({ onInfo, wishlisted, onFavourite, className = "" }) {
    return (
        <div className={`items-center gap-[var(--spacing-2)] ${className}`}>
            <IconButton label="More info" icon={Info} onClick={onInfo} />
            <FavouriteButton
                active={wishlisted}
                onClick={onFavourite}
                className="h-10 w-10"
            />
        </div>
    );
}

function IconButton({ label, icon: Icon, onClick }) {
    return (
        <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] text-[color:var(--color-text-primary)] shadow-[var(--shadow-sm)] transition-colors duration-[var(--transition-fast)] hover:bg-[color:var(--color-bg-secondary)]"
        >
            <Icon size={18} />
        </button>
    );
}

function Rating({ restaurant }) {
    const hasRating =
        restaurant.rating !== null &&
        restaurant.rating !== undefined &&
        restaurant.rating !== "";

    if (!hasRating) {
        return null;
    }

    return (
        <span className="inline-flex items-center gap-[var(--spacing-1)] text-sm">
            <Star
                size={16}
                className="fill-[color:var(--color-warning-500)] text-[color:var(--color-warning-500)]"
            />
            <span className="font-medium text-[color:var(--color-text-primary)]">
                {restaurant.rating}
            </span>
            {restaurant.review_count > 0 && (
                <span className="text-[color:var(--color-text-muted)]">
                    ({restaurant.review_count})
                </span>
            )}
        </span>
    );
}
