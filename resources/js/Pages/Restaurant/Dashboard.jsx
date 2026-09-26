import RestaurantLayout from "@/Layouts/RestaurantLayout";
import { Head } from "@inertiajs/react";
import Alert from "@/Components/Common/Alert";
import { DashboardCard, StatusBadge } from "@/Components/Restaurant/Dashboard";

export default function RestaurantDashboard({ restaurant, status }) {
    const restaurantName = restaurant?.name ?? "Restaurant";
    const pageTitle = `${restaurantName} Dashboard`;
    const subTitle = "Manage your restaurant operations";
    const isPending =
        status === "pending" || restaurant?.status === "pending";

    return (
        <>
            <Head title={`${restaurantName} Dashboard`} />

            <RestaurantLayout
                pageTitle={pageTitle}
                pageSubtitle={subTitle}
                isPending={isPending}
            >
                {isPending ? (
                    <DashboardCard
                        title="Account under review"
                        subtitle="Menu and profile unlock after a super admin approves your restaurant."
                    >
                        <div className="space-y-4">
                            <StatusBadge status="pending" />
                            <Alert
                                type="warning"
                                title="Pending approval"
                                message="You can stay signed in. We will let you manage menu, profile, and orders once your restaurant is approved."
                                closeable={false}
                            />
                        </div>
                    </DashboardCard>
                ) : null}
            </RestaurantLayout>
        </>
    );
}
