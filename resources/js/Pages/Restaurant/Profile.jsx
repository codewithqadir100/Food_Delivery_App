import RestaurantLayout from "@/Layouts/RestaurantLayout";
import { Head } from "@inertiajs/react";

export default function RestaurantProfile() {
    const pageTitle = "Profile";
    const subTitle = "Restaurant information and profile details.";

    return (
        <RestaurantLayout pageTitle={pageTitle} pageSubtitle={subTitle}>
            <Head title="Your Restaurant Profile" />
        </RestaurantLayout>
    );
}
