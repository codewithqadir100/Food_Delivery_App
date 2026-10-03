import { Head, usePage } from "@inertiajs/react";
import RestaurantLayout from "@/Layouts/RestaurantLayout";
import RestaurantReviewsPanel from "@/Components/Customer/RestaurantReviewsPanel";

export default function Reviews({ summary, reviews, sort, has_more = false }) {
    const record = usePage().props.auth?.restaurant;

    return (
        <>
            <Head title="Reviews" />
            <RestaurantLayout
                pageTitle="Reviews"
                pageSubtitle="What customers said after their orders"
            >
                <div className="mx-auto max-w-3xl">
                    <RestaurantReviewsPanel
                        restaurantId={record?.id}
                        restaurantName={record?.name}
                        restaurantLogo={record?.logo_url}
                        initialSummary={summary}
                        initialReviews={reviews}
                        initialSort={sort || "newest"}
                        initialHasMore={has_more}
                        feedRoute="restaurant.reviews.feed"
                        viewer="restaurant"
                    />
                </div>
            </RestaurantLayout>
        </>
    );
}
