import { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { LayoutDashboard, Store, ShieldCheck, LogOut } from "lucide-react";
import Logo from "@/assets/logo.png";
import Button from "@/Components/Common/Button";
import Modal from "@/Components/Common/Modal";
import Alert from "@/Components/Common/Alert";

export default function AdminLayout({ title, subtitle, children }) {
    const { url, auth, flash } = usePage().props;
    const user = auth.user;
    const isSuperAdmin = Boolean(user?.is_super_admin);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [logoutProcessing, setLogoutProcessing] = useState(false);

    const navItems = [
        {
            label: "Dashboard",
            href: route("admin.dashboard"),
            icon: LayoutDashboard,
            active: url.startsWith("/admin/dashboard"),
        },
        ...(isSuperAdmin
            ? [
                  {
                      label: "Restaurants",
                      href: route("super-admin.restaurants.pending"),
                      icon: Store,
                      active: url.startsWith("/super-admin/restaurants"),
                  },
                  {
                      label: "Admins",
                      href: route("super-admin.admins.pending"),
                      icon: ShieldCheck,
                      active: url.startsWith("/super-admin/admins"),
                  },
              ]
            : []),
    ];

    const confirmLogout = () => {
        setLogoutProcessing(true);
        router.post(
            route("admin.logout"),
            {},
            {
                onFinish: () => setLogoutProcessing(false),
            },
        );
    };

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-secondary)]">
            <Modal
                isOpen={logoutModalOpen}
                onClose={() => {
                    if (!logoutProcessing) {
                        setLogoutModalOpen(false);
                    }
                }}
                title="Log out?"
                closeButton={!logoutProcessing}
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setLogoutModalOpen(false)}
                            disabled={logoutProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            loading={logoutProcessing}
                            onClick={confirmLogout}
                        >
                            Logout
                        </Button>
                    </>
                }
            >
                <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
                    Are you sure you want to log out of the admin dashboard?
                </p>
            </Modal>

            <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:z-[var(--z-fixed)] md:w-64 md:flex-col md:border-r md:border-[color:var(--color-border)] md:bg-[color:var(--color-bg-primary)]">
                <div className="flex h-16 items-center border-b border-[color:var(--color-border-light)] px-4">
                    <Link href={route("admin.dashboard")}>
                        <img src={Logo} alt="FoodHub" className="h-8 w-auto" />
                    </Link>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition-colors ${
                                    item.active
                                        ? "bg-[color:var(--color-primary-50)] text-[color:var(--color-primary-700)]"
                                        : "text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-tertiary)]"
                                }`}
                            >
                                <Icon size={18} className="shrink-0" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-[color:var(--color-border-light)] px-3 py-4">
                    <p className="mb-3 truncate px-3 text-sm font-medium text-[color:var(--color-text-primary)]">
                        {user?.name}
                    </p>
                    <button
                        type="button"
                        onClick={() => setLogoutModalOpen(true)}
                        className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-[color:var(--color-danger-600)] hover:bg-[color:var(--color-danger-50)]"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            <main className="md:ml-64">
                <header className="border-b border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] px-4 py-5 sm:px-8">
                    <h1 className="text-xl font-semibold text-[color:var(--color-text-primary)]">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                            {subtitle}
                        </p>
                    )}
                </header>

                <div className="space-y-6 p-4 sm:p-8">
                    {flash?.success && (
                        <Alert type="success" title="Success" message={flash.success} />
                    )}
                    {flash?.error && (
                        <Alert type="error" title="Error" message={flash.error} />
                    )}

                    <div className="flex gap-2 overflow-x-auto md:hidden">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
                                    item.active
                                        ? "bg-[color:var(--color-primary-100)] text-[color:var(--color-primary-800)]"
                                        : "bg-[color:var(--color-gray-100)] text-[color:var(--color-text-secondary)]"
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {children}
                </div>
            </main>
        </div>
    );
}
