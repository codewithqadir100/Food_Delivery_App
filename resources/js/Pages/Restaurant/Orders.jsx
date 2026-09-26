import { Head, router } from "@inertiajs/react";
import { Clock, Activity, CheckCircle2, Wallet } from "lucide-react";
import RestaurantLayout from "@/Layouts/RestaurantLayout";
import {
    DashboardCard,
    StatCard,
    OrderTable,
} from "@/Components/Restaurant/Dashboard";
import RestaurantPagination from "@/Components/Customer/RestaurantPagination";
import { formatCurrency } from "@/Utils/formatCurrency";

const STATUS_TABS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "preparing", label: "Preparing" },
    { key: "ready", label: "Ready" },
    { key: "out_for_delivery", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
];

export default function Orders({ orders, filters, stats }) {
    const activeStatus = filters?.status ?? "all";

    const handleStatusChange = (status) => {
        router.get(
            route("restaurant.orders.index"),
            status === "all" ? {} : { status },
            { preserveScroll: true, preserveState: true },
        );
    };

    const handlePageChange = (page) => {
        router.get(
            route("restaurant.orders.index"),
            { status: activeStatus, page },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <>
            <Head title="Orders" />
            <RestaurantLayout
                pageTitle="Orders"
                pageSubtitle="Track and manage incoming orders"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Pending Orders"
                            value={stats.pending}
                            icon={Clock}
                        />
                        <StatCard
                            title="Active Orders"
                            value={stats.active}
                            icon={Activity}
                        />
                        <StatCard
                            title="Delivered Today"
                            value={stats.delivered_today}
                            icon={CheckCircle2}
                        />
                        <StatCard
                            title="Revenue Today"
                            value={formatCurrency(stats.revenue_today)}
                            icon={Wallet}
                        />
                    </div>

                    <DashboardCard title="All Orders">
                        <div className="flex items-center gap-2 overflow-x-auto pb-4 -mt-2">
                            {STATUS_TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => handleStatusChange(tab.key)}
                                    className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                                        activeStatus === tab.key
                                            ? "bg-[color:var(--color-primary-600)] text-white"
                                            : "bg-[color:var(--color-gray-100)] text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-gray-200)]"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <OrderTable
                            orders={orders.data.map((order) => ({
                                ...order,
                                customer_name: order.customer?.name ?? "—",
                            }))}
                        />

                        <RestaurantPagination
                            pagination={orders}
                            onPageChange={handlePageChange}
                        />
                    </DashboardCard>
                </div>
            </RestaurantLayout>
        </>
    );
}
