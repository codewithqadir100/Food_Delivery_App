import { useEffect, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { Clock, Activity, CheckCircle2, Wallet } from "lucide-react";
import RestaurantLayout from "@/Layouts/RestaurantLayout";
import {
    DashboardCard,
    StatCard,
    OrderTable,
} from "@/Components/Restaurant/Dashboard";
import Pagination from "@/Components/Common/Pagination";
import useIncomingOrders from "@/Hooks/useIncomingOrders";
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

export default function Orders({ orders, filters, stats, latest_order_id = 0 }) {
    const activeStatus = filters?.status ?? "all";
    const [rows, setRows] = useState(orders.data);
    const [liveStats, setLiveStats] = useState(stats);

    useEffect(() => {
        setRows(orders.data);
    }, [orders]);

    useEffect(() => {
        setLiveStats(stats);
    }, [stats]);

    useIncomingOrders(true, latest_order_id, (payload) => {
        if (payload.stats) {
            setLiveStats(payload.stats);
        }

        const incoming = (payload.orders ?? []).filter(
            (order) => activeStatus === "all" || order.status === activeStatus,
        );

        if (incoming.length === 0) return;

        setRows((current) => {
            const ids = new Set(current.map((order) => order.id));
            const fresh = incoming.filter((order) => !ids.has(order.id));
            return fresh.length === 0 ? current : [...fresh, ...current];
        });
    });

    const handleStatusChange = (status) => {
        router.get(
            route("restaurant.orders.index"),
            status === "all" ? {} : { status },
            {
                preserveScroll: true,
                preserveState: true,
                only: ["orders", "filters"],
            },
        );
    };

    const handlePageChange = (page) => {
        router.get(
            route("restaurant.orders.index"),
            { status: activeStatus === "all" ? undefined : activeStatus, page },
            {
                preserveScroll: true,
                preserveState: true,
                only: ["orders"],
            },
        );
    };

    const refreshAfterStatusChange = (updated) => {
        if (updated?.id) {
            setRows((current) =>
                current.map((order) =>
                    order.id === updated.id
                        ? { ...order, status: updated.status }
                        : order,
                ),
            );
        }

        router.reload({
            only: ["orders", "stats"],
            preserveScroll: true,
            preserveState: true,
        });
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
                            value={liveStats.pending}
                            icon={Clock}
                        />
                        <StatCard
                            title="Active Orders"
                            value={liveStats.active}
                            icon={Activity}
                        />
                        <StatCard
                            title="Delivered Today"
                            value={liveStats.delivered_today}
                            icon={CheckCircle2}
                        />
                        <StatCard
                            title="Revenue Today"
                            value={formatCurrency(liveStats.revenue_today)}
                            icon={Wallet}
                        />
                    </div>

                    <DashboardCard title="All Orders">
                        <div className="scrollbar-none-mobile flex items-center gap-2 overflow-x-auto pb-1 -mt-2 md:pb-4">
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
                            orders={rows.map((order) => ({
                                ...order,
                                customer_name:
                                    order.customer_name ??
                                    order.customer?.name ??
                                    "—",
                            }))}
                            onStatusUpdated={refreshAfterStatusChange}
                        />

                        <Pagination
                            pagination={orders}
                            onPageChange={handlePageChange}
                        />
                    </DashboardCard>
                </div>
            </RestaurantLayout>
        </>
    );
}
