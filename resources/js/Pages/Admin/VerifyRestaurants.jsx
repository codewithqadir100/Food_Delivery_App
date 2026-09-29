import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { Store } from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import Button from "@/Components/Common/Button";
import Modal from "@/Components/Common/Modal";
import EmptyState from "@/Components/Common/EmptyState";
import Badge from "@/Components/Common/Badge";

const STATUS_VARIANT = {
    approved: "success",
    pending: "warning",
    rejected: "danger",
};

export default function VerifyRestaurants({ restaurants }) {
    const items = restaurants?.data ?? [];
    const links = Array.isArray(restaurants?.links)
        ? restaurants.links
        : restaurants?.meta?.links ?? [];
    const [action, setAction] = useState(null);
    const [processing, setProcessing] = useState(false);

    const selected = action
        ? items.find((restaurant) => restaurant.id === action.id)
        : null;

    const closeModal = () => {
        if (!processing) {
            setAction(null);
        }
    };

    const submitAction = () => {
        if (!action) {
            return;
        }

        setProcessing(true);

        const visit =
            action.type === "delete"
                ? () =>
                      router.delete(
                          route("super-admin.restaurants.destroy", action.id),
                          options,
                      )
                : () =>
                      router.post(
                          route(
                              action.type === "approve"
                                  ? "super-admin.restaurants.approve"
                                  : "super-admin.restaurants.reject",
                              action.id,
                          ),
                          {},
                          options,
                      );

        const options = {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setAction(null);
            },
        };

        visit();
    };

    const titles = {
        approve: "Approve restaurant?",
        reject: "Reject restaurant?",
        delete: "Delete restaurant?",
    };

    return (
        <>
            <Head title="Restaurants" />
            <AdminLayout
                title="Restaurants"
                subtitle="Approved restaurants are listed here. Approve is a fallback. Reject or delete when you need to take a restaurant down."
            >
                <Modal
                    isOpen={Boolean(action)}
                    onClose={closeModal}
                    title={titles[action?.type] ?? "Confirm"}
                    closeButton={!processing}
                    footer={
                        <>
                            <Button
                                variant="secondary"
                                onClick={closeModal}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={
                                    action?.type === "approve"
                                        ? "success"
                                        : "danger"
                                }
                                loading={processing}
                                onClick={submitAction}
                            >
                                {action?.type === "approve"
                                    ? "Approve"
                                    : action?.type === "delete"
                                      ? "Delete"
                                      : "Reject"}
                            </Button>
                        </>
                    }
                >
                    <p className="text-sm text-[color:var(--color-text-secondary)]">
                        {action?.type === "approve" &&
                            `Approve ${selected?.name ?? "this restaurant"} manually. It still stays hidden from customers until a subscription is active.`}
                        {action?.type === "reject" &&
                            `Reject ${selected?.name ?? "this restaurant"}? It will be hidden from customers.`}
                        {action?.type === "delete" &&
                            `Delete ${selected?.name ?? "this restaurant"}? This cannot be undone. Restaurants with orders cannot be deleted.`}
                    </p>
                </Modal>

                {items.length === 0 ? (
                    <EmptyState
                        title="No restaurants"
                        description="Registered restaurants will appear here."
                        icon={Store}
                    />
                ) : (
                    <div className="overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-[color:var(--color-border)]">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-[color:var(--color-text-primary)]">
                                            Restaurant
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-[color:var(--color-text-primary)]">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-[color:var(--color-text-primary)]">
                                            Subscription
                                        </th>
                                        <th className="px-4 py-3 text-right font-semibold text-[color:var(--color-text-primary)]">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((restaurant) => (
                                        <tr
                                            key={restaurant.id}
                                            className="border-b border-[color:var(--color-border-light)]"
                                        >
                                            <td className="px-4 py-4 font-medium text-[color:var(--color-text-primary)]">
                                                <div>{restaurant.name}</div>
                                                <div className="text-xs font-normal text-[color:var(--color-text-secondary)]">
                                                    {restaurant.user?.email}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge
                                                    variant={
                                                        STATUS_VARIANT[
                                                            restaurant.status
                                                        ] ?? "default"
                                                    }
                                                    size="sm"
                                                >
                                                    {restaurant.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-[color:var(--color-text-secondary)]">
                                                {restaurant.subscription?.plan
                                                    ?.name ?? "None"}
                                                {restaurant.subscription?.status
                                                    ? ` · ${restaurant.subscription.status}`
                                                    : ""}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-2">
                                                    {restaurant.status !==
                                                        "approved" && (
                                                        <Button
                                                            size="sm"
                                                            variant="success"
                                                            onClick={() =>
                                                                setAction({
                                                                    type: "approve",
                                                                    id: restaurant.id,
                                                                })
                                                            }
                                                        >
                                                            Approve
                                                        </Button>
                                                    )}
                                                    {restaurant.status !==
                                                        "rejected" && (
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            onClick={() =>
                                                                setAction({
                                                                    type: "reject",
                                                                    id: restaurant.id,
                                                                })
                                                            }
                                                        >
                                                            Reject
                                                        </Button>
                                                    )}
                                                    {restaurant.orders_count ===
                                                        0 && (
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() =>
                                                                setAction({
                                                                    type: "delete",
                                                                    id: restaurant.id,
                                                                })
                                                            }
                                                        >
                                                            Delete
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {links.length > 3 && (
                            <div className="flex flex-wrap gap-2 border-t border-[color:var(--color-border-light)] p-4">
                                {links.map((link, index) => (
                                    <Link
                                        key={`${link.label}-${index}`}
                                        href={link.url || ""}
                                        preserveScroll
                                        className={`rounded-md px-3 py-1 text-sm ${
                                            link.active
                                                ? "bg-[color:var(--color-primary-100)] text-[color:var(--color-primary-800)]"
                                                : "text-[color:var(--color-text-secondary)]"
                                        } ${!link.url ? "pointer-events-none opacity-50" : ""}`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </AdminLayout>
        </>
    );
}
