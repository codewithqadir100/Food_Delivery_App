import { Head, Link } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import AppLayout from "@/Layouts/AppLayout";
import RestaurantReviewsPanel from "@/Components/Customer/RestaurantReviewsPanel";

export default function RestaurantReviews({
    restaurant,
    summary,
    reviews,
    sort,
    has_more = false,
}) {
    return (
        <>
            <Head title={`${restaurant.name} reviews`} />
            <AppLayout>
                <div className="mx-auto max-w-2xl">
                    <Link
                        href={route("customer.restaurant.menu", restaurant.id)}
                        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-primary-600)]"
                    >
                        <ArrowLeft size={16} />
                        Back to menu
                    </Link>
                    <h1 className="mb-1 text-2xl font-bold text-[color:var(--color-text-primary)]">
                        {restaurant.name}
                    </h1>
                    <RestaurantReviewsPanel
                        restaurantId={restaurant.id}
                        restaurantName={restaurant.name}
                        initialSummary={summary}
                        initialReviews={reviews}
                        initialSort={sort}
                        initialHasMore={has_more}
                        feedRoute="customer.restaurants.reviews.feed"
                        viewer="customer"
                    />
                </div>
            </AppLayout>
        </>
    );
}
