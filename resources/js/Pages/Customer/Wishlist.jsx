import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import RestaurantCard from "@/Components/Customer/RestaurantCard";
import EmptyState from "@/Components/Common/EmptyState";
import Button from "@/Components/Common/Button";
import { Heart } from "lucide-react";
import { removeFavourite, saveFavourite } from "@/Utils/favourites";

export default function Wishlist({ restaurants = [] }) {
    const user = usePage().props.auth?.user ?? null;
    const [items, setItems] = useState(restaurants);
    const [pendingId, setPendingId] = useState(null);

    const toggle = async (restaurant) => {
        if (pendingId !== null) {
            return;
        }

        setPendingId(restaurant.id);

        try {
            const data = restaurant.is_wishlisted
                ? await removeFavourite(restaurant.id)
                : await saveFavourite(restaurant.id);

            setItems((current) =>
                current.map((item) =>
                    item.id === restaurant.id
                        ? { ...item, is_wishlisted: data.wishlisted }
                        : item,
                ),
            );
        } finally {
            setPendingId(null);
        }
    };

    return (
        <>
            <Head title="My Favourites" />
            <AppLayout>
                <div className="space-y-[var(--spacing-8)]">
                    <h1 className="restaurant-main-heading">My Favourites</h1>

                    {items.length > 0 ? (
                        <div className="restaurant-grid">
                            {items.map((restaurant) => (
                                <RestaurantCard
                                    key={restaurant.id}
                                    restaurant={restaurant}
                                    user={user}
                                    onCardClick={() =>
                                        router.visit(
                                            route(
                                                "customer.restaurant.menu",
                                                restaurant.id,
                                            ),
                                        )
                                    }
                                    onFavourite={() => toggle(restaurant)}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={Heart}
                            iconSize={36}
                            iconWrapClassName="h-24 w-24 bg-[color:var(--color-primary-50)]"
                            iconClassName="text-[color:var(--color-primary-500)]"
                            title="No Favourites Saved"
                            description="Restaurants you save will show up here, so you can order from them again faster."
                            action={
                                <Button
                                    variant="secondary"
                                    onClick={() =>
                                        router.visit(route("restaurants.index"))
                                    }
                                >
                                    Let's find some favourites
                                </Button>
                            }
                        />
                    )}
                </div>
            </AppLayout>
        </>
    );
}
