import RestaurantLayout from "@/Layouts/RestaurantLayout";
import { Head } from "@inertiajs/react";

export default function RestaurantDashboard({ restaurant, status = null }) {
    const restaurantName = restaurant?.name ?? "Restaurant";
    const restaurantStatus = status ?? restaurant?.status ?? "pending";

    return (
        <>
            <Head title={`${restaurantName} Dashboard`} />

            <RestaurantLayout restaurant={restaurant} status={restaurantStatus}>
                {/* Dashboard content */}
            </RestaurantLayout>
        </>
    );
}
