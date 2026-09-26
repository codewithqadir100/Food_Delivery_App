import { Head, Link, router } from "@inertiajs/react";
import { ClipboardList, ChevronRight } from "lucide-react";
import AppLayout from "@/Layouts/AppLayout";
import Button from "@/Components/Common/Button";
import OrderStatusBadge from "@/Components/Common/OrderStatusBadge";
import EmptyState from "@/Components/Restaurant/Dashboard/EmptyState";
import RestaurantPagination from "@/Components/Customer/RestaurantPagination";
import { formatCurrency } from "@/Utils/formatCurrency";

export default function History({ orders }) {
    const handlePageChange = (page) => {
        router.get(
            route("customer.orders.index"),
            { page },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <>
            <Head title="My Orders" />
            <AppLayout>
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-semibold text-[color:var(--color-text-primary)] mb-6">
                        My Orders
                    </h1>

                    {orders.data.length === 0 ? (
                        <EmptyState
                            icon={ClipboardList}
                            title="No orders yet"
                            description="Your placed orders will show up here."
                            action={
                                <Link href="/restaurants">
                                    <Button variant="primary">
                                        Browse Restaurants
                                    </Button>
                                </Link>
                            }
                        />
                    ) : (
                        <>
                            <div className="space-y-3">
                                {orders.data.map((order) => (
                                    <Link
                                        key={order.id}
                                        href={route(
                                            "customer.orders.show",
                                            order.id,
                                        )}
                                        className="flex items-center gap-4 p-4 rounded-[var(--radius-lg)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-semibold text-[color:var(--color-text-primary)]">
                                                    {order.order_number}
                                                </p>
                                                <OrderStatusBadge
                                                    status={order.status}
                                                    size="sm"
                                                />
                                            </div>
                                            <p className="text-sm text-[color:var(--color-text-secondary)] mt-1 truncate">
                                                {order.restaurant?.name} &middot;{" "}
                                                {order.items_count} item
                                                {order.items_count !== 1
                                                    ? "s"
                                                    : ""}
                                            </p>
                                            <p className="text-xs text-[color:var(--color-text-muted)] mt-1">
                                                {new Date(
                                                    order.created_at,
                                                ).toLocaleString([], {
                                                    dateStyle: "medium",
                                                    timeStyle: "short",
                                                })}
                                            </p>
                                        </div>

                                        <p className="font-semibold text-[color:var(--color-text-primary)]">
                                            {formatCurrency(order.total)}
                                        </p>

                                        <ChevronRight
                                            size={18}
                                            className="text-[color:var(--color-text-muted)] flex-shrink-0"
                                        />
                                    </Link>
                                ))}
                            </div>

                            <RestaurantPagination
                                pagination={orders}
                                onPageChange={handlePageChange}
                            />
                        </>
                    )}
                </div>
            </AppLayout>
        </>
    );
}
