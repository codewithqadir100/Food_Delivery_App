import { useEffect, useState } from "react";
import RestaurantLayout from "@/Layouts/RestaurantLayout";
import { Head, Link, router } from "@inertiajs/react";
import { Clock, Activity, CheckCircle2, Wallet } from "lucide-react";
import Alert from "@/Components/Common/Alert";
import Button from "@/Components/Common/Button";
import {
    DashboardCard,
    StatusBadge,
    StatCard,
    OrderTable,
} from "@/Components/Restaurant/Dashboard";
import useIncomingOrders from "@/Hooks/useIncomingOrders";
import { formatCurrency } from "@/Utils/formatCurrency";

export default function RestaurantDashboard({
    restaurant,
    status,
    stats,
    recentOrders = [],
    latest_order_id = 0,
}) {
    const restaurantName = restaurant?.name ?? "Restaurant";
    const pageTitle = `${restaurantName} Dashboard`;
    const subTitle = "Manage your restaurant operations";
    const isPending =
        status === "pending" || restaurant?.status === "pending";
    const [liveStats, setLiveStats] = useState(stats);
    const [liveOrders, setLiveOrders] = useState(recentOrders);

    useEffect(() => {
        setLiveStats(stats);
    }, [stats]);

    useEffect(() => {
        setLiveOrders(recentOrders);
    }, [recentOrders]);

    useIncomingOrders(!isPending, latest_order_id, (payload) => {
        if (payload.stats) {
            setLiveStats(payload.stats);
        }

        const incoming = payload.orders ?? [];
        if (incoming.length === 0) return;

        setLiveOrders((current) => {
            const ids = new Set(current.map((order) => order.id));
            const fresh = incoming.filter((order) => !ids.has(order.id));
            return fresh.length === 0 ? current : [...fresh, ...current].slice(0, 5);
        });
    });

    const refreshAfterStatusChange = () => {
        router.reload({
            only: ["stats", "recentOrders"],
            preserveScroll: true,
            preserveState: true,
        });
    };

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
                            value={liveStats?.pending ?? 0}
                            icon={Clock}
                        />
                        <StatCard
                            title="Active Orders"
                            value={liveStats?.active ?? 0}
                            icon={Activity}
                        />
                        <StatCard
                            title="Delivered Today"
                            value={liveStats?.delivered_today ?? 0}
                            icon={CheckCircle2}
                        />
                        <StatCard
                            title="Revenue Today"
                            value={formatCurrency(
                                    liveStats?.revenue_today ?? 0,
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
                                orders={liveOrders.map((order) => ({
                                    ...order,
                                    customer_name:
                                        order.customer_name ??
                                        order.customer?.name ??
                                        "—",
                                }))}
                                onStatusUpdated={refreshAfterStatusChange}
                            />
                        </DashboardCard>
                    </div>
                )}
            </RestaurantLayout>
        </>
    );
}
