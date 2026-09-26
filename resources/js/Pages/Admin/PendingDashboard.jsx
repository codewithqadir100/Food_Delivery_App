import { Head, usePage } from "@inertiajs/react";
import { Clock, ShieldAlert } from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import Card from "@/Components/Common/Card";
import Avatar from "@/Components/Common/Avatar";

export default function PendingDashboard() {
    const { auth = {} } = usePage().props || {};
    const user = auth?.user;

    return (
        <>
            <Head title="Pending Approval" />
            <AdminLayout
                title="Account Under Review"
                subtitle="Your sub-admin account is currently waiting for super-admin authorization."
            >
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-2 text-center sm:text-left">
                            <Avatar
                                name={user?.name || "Admin"}
                                size="xl"
                                className="ring-4 ring-amber-100 shadow-sm shrink-0"
                            />
                            <div className="space-y-3 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h2 className="text-lg font-bold text-[color:var(--color-text-primary)]">
                                            {user?.name}
                                        </h2>
                                        <p className="text-xs text-[color:var(--color-text-secondary)]">
                                            {user?.email}
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 self-center sm:self-start rounded-full bg-[color:var(--color-warning-50)] text-[color:var(--color-warning-800)] border border-[color:var(--color-warning-200)] px-3 py-1 text-xs font-semibold">
                                        <Clock size={14} className="text-[color:var(--color-warning-600)]" />
                                        Pending Review
                                    </span>
                                </div>

                                <div className="rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border-light)] p-4 text-xs text-[color:var(--color-text-secondary)] leading-relaxed">
                                    <div className="flex items-start gap-2.5 text-left">
                                        <ShieldAlert size={18} className="text-[color:var(--color-warning-600)] shrink-0 mt-0.5" />
                                        <p>
                                            Thank you for registering. You have signed in successfully, but access to restaurant approval and verification tools is granted only after a Super Admin reviews and verifies your credentials.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </AdminLayout>
        </>
    );
}
