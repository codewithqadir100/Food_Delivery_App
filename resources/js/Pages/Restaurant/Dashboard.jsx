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
import { formatCurrency } from "@/Utils/formatCurrency";

export default function RestaurantDashboard({
    restaurant,
    status,
    stats,
    recentOrders = [],
}) {
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
                ) : (
                    <div className="space-y-6">
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
                    </div>
                )}
            </RestaurantLayout>
        </>
    );
}
