import RestaurantLayout from "@/Layouts/RestaurantLayout";
import { Head } from "@inertiajs/react";

export default function RestaurantDashboard({ restaurant }) {
    const restaurantName = restaurant?.name ?? "Restaurant";
    const pageTitle = `${restaurantName} Dashboard`;
    const subTitle = "Manage your restaurant operations";

    return (
        <>
            <Head title={`${restaurantName} Dashboard`} />

            <RestaurantLayout
                restaurantName={restaurantName}
                restaurant={restaurant}
                pageTitle={pageTitle}
                pageSubtitle={subTitle}
            >
                {/* Dashboard content */}
            </RestaurantLayout>
        </>
    );
}
