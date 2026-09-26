import { Head, usePage } from "@inertiajs/react";
import { Store, ShieldCheck } from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import Card from "@/Components/Common/Card";
import { QuickActionCard } from "@/Components/Restaurant/Dashboard";

export default function AdminDashboard({
    pendingRestaurantsCount = 0,
    pendingAdminsCount = 0,
}) {
    const { auth = {} } = usePage().props || {};
    const isSuperAdmin = Boolean(auth?.user?.is_super_admin);

    return (
        <>
            <Head title="Admin Dashboard" />
            <AdminLayout
                title="Admin Dashboard"
                subtitle={
                    isSuperAdmin
                        ? "Review pending restaurants and sub-admins."
                        : "Your admin account is approved."
                }
            >
                {isSuperAdmin ? (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Card>
                                <p className="text-sm text-[color:var(--color-text-secondary)]">
                                    Pending restaurants
                                </p>
                                <p className="mt-2 text-2xl font-bold text-[color:var(--color-text-primary)]">
                                    {pendingRestaurantsCount}
                                </p>
                            </Card>
                            <Card>
                                <p className="text-sm text-[color:var(--color-text-secondary)]">
                                    Pending admins
                                </p>
                                <p className="mt-2 text-2xl font-bold text-[color:var(--color-text-primary)]">
                                    {pendingAdminsCount}
                                </p>
                            </Card>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <QuickActionCard
                                title="Verify restaurants"
                                description="Approve or reject restaurant registrations."
                                icon={Store}
                                href={route("super-admin.restaurants.pending")}
                                variant="primary"
                            />
                            <QuickActionCard
                                title="Verify admins"
                                description="Approve or reject sub-admin registrations."
                                icon={ShieldCheck}
                                href={route("super-admin.admins.pending")}
                            />
                        </div>
                    </>
                ) : (
                    <Card>
                        <p className="text-sm text-[color:var(--color-text-secondary)]">
                            Restaurant and admin verification is limited to the
                            super admin. Additional admin tools will appear here
                            as they are added.
                        </p>
                    </Card>
                )}
            </AdminLayout>
        </>
    );
}
