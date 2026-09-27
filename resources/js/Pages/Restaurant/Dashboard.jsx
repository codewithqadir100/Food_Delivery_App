import RestaurantLayout from "@/Layouts/RestaurantLayout";
import { Head, Link } from "@inertiajs/react";
import { Clock, Activity, CheckCircle2, Wallet } from "lucide-react";
import Alert from "@/Components/Common/Alert";
import Button from "@/Components/Common/Button";
import {
    DashboardCard,
    StatusBadge,
    StatCard,
    OrderTable,
} from "@/Components/Restaurant/Dashboard";
import OnboardingChecklist from "@/Components/Restaurant/Onboarding/OnboardingChecklist";
import { formatCurrency } from "@/Utils/formatCurrency";

export default function RestaurantDashboard({
    restaurant,
    status,
    stats,
    recentOrders = [],
    onboarding,
    subscription,
}) {
    const restaurantName = restaurant?.name ?? "Restaurant";
    const pageTitle = `${restaurantName} Dashboard`;
    const subTitle = "Manage your restaurant operations";
    const isApproved =
        status === "approved" && restaurant?.status === "approved";

    return (
        <>
            <Head title={`${restaurantName} Dashboard`} />

            <RestaurantLayout
                pageTitle={pageTitle}
                pageSubtitle={subTitle}
                isPending={!isApproved}
            >
                <div className="space-y-6">
                    {!isApproved && (
                        <DashboardCard
                            title="Restaurant not live yet"
                            subtitle="Customers see your restaurant after a subscription becomes active."
                        >
                            <div className="space-y-4">
                                <StatusBadge status={status ?? "pending"} />
                                <Alert
                                    type="warning"
                                    title="Approval follows your subscription"
                                    message="Profile, location, and menu are available now. Choosing Free starts immediately and approves your restaurant. Paid plans approve it after payment verification. Orders unlock once you are approved."
                                    closeable={false}
                                />
                            </div>
                        </DashboardCard>
                    )}

                    {!onboarding?.complete && (
                        <OnboardingChecklist onboarding={onboarding} />
                    )}

                    {onboarding?.complete && !subscription?.activated_at && (
                        <Alert
                            type="warning"
                            title="Choose a subscription"
                            message="Onboarding is complete. Pick a plan so customers can find your restaurant."
                            closeable={false}
                        />
                    )}

                    {subscription?.status === "expired" && (
                        <Alert
                            type="warning"
                            title="Subscription expired"
                            message="Your restaurant stays visible as unavailable until a renewal payment is verified."
                            closeable={false}
                        />
                    )}

                    {isApproved && (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard
                                    title="Pending Orders"
                                    value={stats?.pending ?? 0}
                                    icon={Clock}
                                />
                                <StatCard
                                    title="Active Orders"
                                    value={stats?.active ?? 0}
                                    icon={Activity}
                                />
                                <StatCard
                                    title="Delivered Today"
                                    value={stats?.delivered_today ?? 0}
                                    icon={CheckCircle2}
                                />
                                <StatCard
                                    title="Revenue Today"
                                    value={formatCurrency(
                                        stats?.revenue_today ?? 0,
                                    )}
                                    icon={Wallet}
                                />
                            </div>

                            <DashboardCard
                                title="Recent Orders"
                                action={
                                    <Link href={route("restaurant.orders.index")}>
                                        <Button variant="secondary" size="sm">
                                            View All Orders
                                        </Button>
                                    </Link>
                                }
                            >
                                <OrderTable
                                    orders={recentOrders.map((order) => ({
                                        ...order,
                                        customer_name:
                                            order.customer?.name ?? "—",
                                    }))}
                                />
                            </DashboardCard>
                        </>
                    )}
                </div>
            </RestaurantLayout>
        </>
    );
}
