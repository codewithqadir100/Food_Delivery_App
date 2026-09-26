import { Head, usePage, Link } from "@inertiajs/react";
import { Store, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import Card from "@/Components/Common/Card";
import Avatar from "@/Components/Common/Avatar";
import { QuickActionCard } from "@/Components/Restaurant/Dashboard";

export default function AdminDashboard({
    pendingRestaurantsCount = 0,
    pendingAdminsCount = 0,
}) {
    const { auth = {} } = usePage().props || {};
    const user = auth?.user;
    const isSuperAdmin = Boolean(user?.is_super_admin);

    return (
        <>
            <Head title="Admin Dashboard" />
            <AdminLayout
                title="Admin Overview"
                subtitle={
                    isSuperAdmin
                        ? "Platform management, pending verifications, and administration."
                        : "Your sub-admin account is active and verified."
                }
            >
                {/* Welcome Card with Avatar */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 sm:p-8 text-white shadow-md">
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <Avatar
                                name={user?.name || "Admin"}
                                size="xl"
                                className="ring-4 ring-white/30 shadow-md"
                            />
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                                        Welcome, {user?.name}!
                                    </h2>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-xs">
                                        <Sparkles size={12} />
                                        {isSuperAdmin ? "Super Admin" : "Admin"}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-amber-50">
                                    {isSuperAdmin
                                        ? "You have full control over restaurant approvals and sub-admin privileges."
                                        : "You have verified sub-admin privileges on FoodHub."}
                                </p>
                            </div>
                        </div>

                        {isSuperAdmin && (
                            <div className="flex items-center gap-3">
                                <Link
                                    href={route("super-admin.restaurants.pending")}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[color:var(--color-primary-700)] shadow-sm hover:bg-amber-50 transition-colors"
                                >
                                    Review Requests
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {isSuperAdmin ? (
                    <>
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Card className="hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-secondary)]">
                                            Pending Restaurants
                                        </p>
                                        <p className="mt-2 text-3xl font-extrabold text-[color:var(--color-text-primary)]">
                                            {pendingRestaurantsCount}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-[color:var(--color-primary-100)] p-3 text-[color:var(--color-primary-700)] shadow-xs">
                                        <Store size={24} />
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-[color:var(--color-border-light)] flex items-center justify-between text-xs">
                                    <span className="text-[color:var(--color-text-secondary)]">
                                        {pendingRestaurantsCount === 0
                                            ? "All caught up"
                                            : "Awaiting your review"}
                                    </span>
                                    <Link
                                        href={route("super-admin.restaurants.pending")}
                                        className="font-semibold text-[color:var(--color-primary-600)] hover:underline flex items-center gap-1"
                                    >
                                        View all <ArrowRight size={12} />
                                    </Link>
                                </div>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-secondary)]">
                                            Pending Sub-Admins
                                        </p>
                                        <p className="mt-2 text-3xl font-extrabold text-[color:var(--color-text-primary)]">
                                            {pendingAdminsCount}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-[color:var(--color-success-100)] p-3 text-[color:var(--color-success-700)] shadow-xs">
                                        <ShieldCheck size={24} />
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-[color:var(--color-border-light)] flex items-center justify-between text-xs">
                                    <span className="text-[color:var(--color-text-secondary)]">
                                        {pendingAdminsCount === 0
                                            ? "No requests pending"
                                            : "Awaiting authorization"}
                                    </span>
                                    <Link
                                        href={route("super-admin.admins.pending")}
                                        className="font-semibold text-[color:var(--color-primary-600)] hover:underline flex items-center gap-1"
                                    >
                                        View all <ArrowRight size={12} />
                                    </Link>
                                </div>
                            </Card>
                        </div>

                        {/* Quick Action Navigation */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[color:var(--color-text-secondary)] mb-3">
                                Quick Management
                            </h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <QuickActionCard
                                    title="Verify Restaurants"
                                    description="Inspect partner registration details, contact info, and approve or reject submissions."
                                    icon={Store}
                                    href={route("super-admin.restaurants.pending")}
                                    variant="primary"
                                />
                                <QuickActionCard
                                    title="Verify Admins"
                                    description="Authorize new team members to access administrative tools and moderate accounts."
                                    icon={ShieldCheck}
                                    href={route("super-admin.admins.pending")}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <Card>
                        <div className="flex items-start gap-4">
                            <div className="rounded-xl bg-[color:var(--color-success-100)] p-3 text-[color:var(--color-success-600)]">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-[color:var(--color-text-primary)]">
                                    Active Sub-Admin Privileges
                                </h3>
                                <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                                    Your sub-admin account is approved and verified. Full restaurant and admin verification controls are restricted to the super-admin. As additional operational tools are enabled for sub-admins, they will be listed here.
                                </p>
                            </div>
                        </div>
                    </Card>
                )}
            </AdminLayout>
        </>
    );
}
