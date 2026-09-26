import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { ShieldCheck } from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import Button from "@/Components/Common/Button";
import Modal from "@/Components/Common/Modal";
import { EmptyState } from "@/Components/Restaurant/Dashboard";

export default function VerifyAdmins({ admins }) {
    const items = admins?.data ?? [];
    const links = Array.isArray(admins?.links)
        ? admins.links
        : admins?.meta?.links ?? [];
    const [action, setAction] = useState(null);
    const [processing, setProcessing] = useState(false);

    const selected = action
        ? items.find((admin) => admin.id === action.id)
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

        const routeName =
            action.type === "approve"
                ? "super-admin.admins.approve"
                : "super-admin.admins.reject";

        router.post(
            route(routeName, action.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setAction(null);
                },
            },
        );
    };

    return (
        <>
            <Head title="Pending Admins" />
            <AdminLayout
                title="Pending admins"
                subtitle="Approve sub-admins before they can access the dashboard tools."
            >
                <Modal
                    isOpen={Boolean(action)}
                    onClose={closeModal}
                    title={
                        action?.type === "approve"
                            ? "Approve admin?"
                            : "Reject admin?"
                    }
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
                                    : "Reject"}
                            </Button>
                        </>
                    }
                >
                    <p className="text-sm text-[color:var(--color-text-secondary)]">
                        {action?.type === "approve"
                            ? `Approve ${selected?.name ?? "this admin"} (${selected?.email ?? ""})?`
                            : `Reject ${selected?.name ?? "this admin"}? They will lose admin access.`}
                    </p>
                </Modal>

                {items.length === 0 ? (
                    <EmptyState
                        title="No pending admins"
                        description="New admin registrations will appear here."
                        icon={ShieldCheck}
                    />
                ) : (
                    <div className="overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-[color:var(--color-border)]">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-[color:var(--color-text-primary)]">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-[color:var(--color-text-primary)]">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-right font-semibold text-[color:var(--color-text-primary)]">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((admin) => (
                                        <tr
                                            key={admin.id}
                                            className="border-b border-[color:var(--color-border-light)]"
                                        >
                                            <td className="px-4 py-4 font-medium text-[color:var(--color-text-primary)]">
                                                {admin.name}
                                            </td>
                                            <td className="px-4 py-4 text-[color:var(--color-text-secondary)]">
                                                {admin.email}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="success"
                                                        onClick={() =>
                                                            setAction({
                                                                type: "approve",
                                                                id: admin.id,
                                                            })
                                                        }
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() =>
                                                            setAction({
                                                                type: "reject",
                                                                id: admin.id,
                                                            })
                                                        }
                                                    >
                                                        Reject
                                                    </Button>
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
