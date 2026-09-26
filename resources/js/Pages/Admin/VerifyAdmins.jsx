import { useMemo, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    ShieldCheck,
    Check,
    X,
    Search,
    Mail,
    Calendar,
    Shield,
    AlertCircle,
    UserCheck,
} from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import Button from "@/Components/Common/Button";
import Modal from "@/Components/Common/Modal";
import Avatar from "@/Components/Common/Avatar";
import { EmptyState } from "@/Components/Restaurant/Dashboard";

export default function VerifyAdmins({ admins }) {
    const items = admins?.data ?? [];
    const links = Array.isArray(admins?.links)
        ? admins.links
        : admins?.meta?.links ?? [];

    const [searchQuery, setSearchQuery] = useState("");
    const [action, setAction] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Search filter
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;
        const q = searchQuery.toLowerCase().trim();
        return items.filter((admin) => {
            const name = admin.name?.toLowerCase() || "";
            const email = admin.email?.toLowerCase() || "";
            return name.includes(q) || email.includes(q);
        });
    }, [items, searchQuery]);

    const selected = action
        ? items.find((admin) => admin.id === action.id)
        : null;

    const closeModal = () => {
        if (!processing) {
            setAction(null);
        }
    };

    const submitAction = () => {
        if (!action) return;

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

    const formatDate = (dateString) => {
        if (!dateString) return "Recently";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return "Recently";
        }
    };

    return (
        <>
            <Head title="Pending Admins" />
            <AdminLayout
                title="Admin Verifications"
                subtitle="Review and authorize sub-admin accounts before granting administrative panel access."
            >
                {/* Header & Search Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--color-primary-100)] text-[color:var(--color-primary-700)] shadow-xs">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[color:var(--color-text-primary)]">
                                Sub-Admin Requests
                            </h2>
                            <p className="text-xs text-[color:var(--color-text-secondary)]">
                                {items.length} account{items.length === 1 ? "" : "s"} waiting for super-admin approval
                            </p>
                        </div>
                    </div>

                    {items.length > 0 && (
                        <div className="relative w-full sm:w-72">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)]"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] py-2 pl-9 pr-4 text-xs sm:text-sm text-[color:var(--color-text-primary)] placeholder-[color:var(--color-text-muted)] focus:border-[color:var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-primary-500)] shadow-xs"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Empty State */}
                {items.length === 0 ? (
                    <div className="rounded-xl border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] p-8 shadow-xs">
                        <EmptyState
                            title="No pending admins"
                            description="All administrative registration requests have been approved or rejected. New registrations will appear here."
                            icon={ShieldCheck}
                        />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="rounded-xl border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] p-12 text-center shadow-xs">
                        <ShieldCheck size={36} className="mx-auto text-[color:var(--color-text-muted)] opacity-60 mb-3" />
                        <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                            No admins found
                        </h3>
                        <p className="mt-1 text-xs text-[color:var(--color-text-secondary)]">
                            No requests matched your search query "{searchQuery}".
                        </p>
                        <button
                            onClick={() => setSearchQuery("")}
                            className="mt-3 text-xs font-semibold text-[color:var(--color-primary-600)] hover:underline"
                        >
                            Reset filter
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Desktop Table View */}
                        <div className="hidden sm:block overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-[color:var(--color-border-light)] bg-[color:var(--color-bg-secondary)] text-xs font-semibold text-[color:var(--color-text-secondary)] uppercase tracking-wider">
                                        <tr>
                                            <th className="px-5 py-3.5">Admin Profile</th>
                                            <th className="px-5 py-3.5">Assigned Role</th>
                                            <th className="px-5 py-3.5">Status</th>
                                            <th className="px-5 py-3.5">Requested On</th>
                                            <th className="px-5 py-3.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[color:var(--color-border-light)]">
                                        {filteredItems.map((admin) => (
                                            <tr
                                                key={admin.id}
                                                className="hover:bg-[color:var(--color-bg-tertiary)]/40 transition-colors"
                                            >
                                                {/* Admin Avatar & Contact */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar
                                                            name={admin.name}
                                                            size="md"
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-[color:var(--color-text-primary)] truncate max-w-[200px]">
                                                                {admin.name}
                                                            </p>
                                                            <p className="text-xs text-[color:var(--color-text-secondary)] flex items-center gap-1 mt-0.5 truncate max-w-[200px]">
                                                                <Mail size={12} className="shrink-0 text-[color:var(--color-text-muted)]" />
                                                                {admin.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Role */}
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-[color:var(--color-primary-50)] text-[color:var(--color-primary-700)] px-2.5 py-1 text-xs font-semibold">
                                                        <Shield size={12} />
                                                        Sub-Admin
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-warning-50)] text-[color:var(--color-warning-700)] border border-[color:var(--color-warning-200)] px-2.5 py-0.5 text-xs font-semibold">
                                                        <AlertCircle size={12} />
                                                        Pending Approval
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="px-5 py-4 text-xs text-[color:var(--color-text-muted)]">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {formatDate(admin.created_at)}
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="success"
                                                            onClick={() =>
                                                                setAction({
                                                                    type: "approve",
                                                                    id: admin.id,
                                                                })
                                                            }
                                                            className="!py-1.5 !px-3 text-xs gap-1"
                                                        >
                                                            <Check size={14} />
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
                                                            className="!py-1.5 !px-3 text-xs gap-1"
                                                        >
                                                            <X size={14} />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="space-y-3 sm:hidden">
                            {filteredItems.map((admin) => (
                                <div
                                    key={admin.id}
                                    className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] p-4 shadow-xs space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar
                                                name={admin.name}
                                                size="md"
                                            />
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-sm text-[color:var(--color-text-primary)] truncate">
                                                    {admin.name}
                                                </h3>
                                                <p className="text-xs text-[color:var(--color-text-secondary)] truncate">
                                                    {admin.email}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="shrink-0 rounded-full bg-[color:var(--color-warning-50)] text-[color:var(--color-warning-700)] border border-[color:var(--color-warning-200)] px-2 py-0.5 text-[10px] font-semibold">
                                            Pending
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-[color:var(--color-text-muted)] pt-1 border-t border-[color:var(--color-border-light)]">
                                        <span className="inline-flex items-center gap-1 font-medium text-[color:var(--color-primary-700)]">
                                            <Shield size={12} /> Sub-Admin
                                        </span>
                                        <span>Applied {formatDate(admin.created_at)}</span>
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <Button
                                            size="sm"
                                            variant="success"
                                            onClick={() =>
                                                setAction({
                                                    type: "approve",
                                                    id: admin.id,
                                                })
                                            }
                                            fullWidth={true}
                                            className="!py-1.5 text-xs gap-1"
                                        >
                                            <Check size={14} />
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
                                            fullWidth={true}
                                            className="!py-1.5 text-xs gap-1"
                                        >
                                            <X size={14} />
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Links */}
                        {links.length > 3 && (
                            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                                {links.map((link, index) => (
                                    <Link
                                        key={`${link.label}-${index}`}
                                        href={link.url || ""}
                                        preserveScroll
                                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                            link.active
                                                ? "bg-[color:var(--color-primary-600)] text-white font-bold shadow-xs"
                                                : "bg-[color:var(--color-bg-primary)] text-[color:var(--color-text-secondary)] border border-[color:var(--color-border-light)] hover:bg-[color:var(--color-bg-tertiary)]"
                                        } ${!link.url ? "pointer-events-none opacity-40" : ""}`}
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

            {/* ACTION CONFIRMATION MODAL */}
            <Modal
                isOpen={Boolean(action)}
                onClose={closeModal}
                title={
                    action?.type === "approve"
                        ? "Approve Sub-Admin Account?"
                        : "Reject Sub-Admin Account?"
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
                            variant={action?.type === "approve" ? "success" : "danger"}
                            loading={processing}
                            onClick={submitAction}
                        >
                            {action?.type === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                        </Button>
                    </>
                }
            >
                <div className="flex items-start gap-3">
                    <div
                        className={`rounded-full p-2.5 ${
                            action?.type === "approve"
                                ? "bg-[color:var(--color-success-50)] text-[color:var(--color-success-600)]"
                                : "bg-[color:var(--color-danger-50)] text-[color:var(--color-danger-600)]"
                        }`}
                    >
                        {action?.type === "approve" ? <UserCheck size={20} /> : <X size={20} />}
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                            {action?.type === "approve"
                                ? `Grant admin access to ${selected?.name ?? "this user"}?`
                                : `Reject admin request for ${selected?.name ?? "this user"}?`}
                        </p>
                        <p className="text-xs leading-5 text-[color:var(--color-text-secondary)]">
                            {action?.type === "approve"
                                ? `The user (${selected?.email ?? ""}) will now be marked as approved and can sign into the FoodHub Admin Dashboard.`
                                : `The user (${selected?.email ?? ""}) will be marked as rejected and forbidden from accessing any administrative dashboards.`}
                        </p>
                    </div>
                </div>
            </Modal>
        </>
    );
}
