import { useEffect, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    Store,
    ShieldCheck,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Shield,
    Sparkles,
} from "lucide-react";
import Logo from "@/assets/logo.png";
import Button from "@/Components/Common/Button";
import Modal from "@/Components/Common/Modal";
import Alert from "@/Components/Common/Alert";
import Avatar from "@/Components/Common/Avatar";

export default function AdminLayout({ title, subtitle, children }) {
    const { url = "" } = usePage();
    const { auth = {}, flash = {} } = usePage().props || {};
    const user = auth?.user;
    const isSuperAdmin = Boolean(user?.is_super_admin);

    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("foodhub_admin_sidebar_collapsed") === "true";
        }
        return false;
    });

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [logoutProcessing, setLogoutProcessing] = useState(false);

    const toggleSidebarCollapse = () => {
        setIsCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== "undefined") {
                localStorage.setItem("foodhub_admin_sidebar_collapsed", String(next));
            }
            return next;
        });
    };

    // Close mobile menu on route change or Esc key
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [url]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const navItems = [
        {
            label: "Dashboard",
            href: route("admin.dashboard"),
            icon: LayoutDashboard,
            active: Boolean(url?.startsWith("/admin/dashboard")),
        },
        ...(isSuperAdmin
            ? [
                  {
                      label: "Restaurants",
                      href: route("super-admin.restaurants.pending"),
                      icon: Store,
                      active: Boolean(url?.startsWith("/super-admin/restaurants")),
                  },
                  {
                      label: "Admins",
                      href: route("super-admin.admins.pending"),
                      icon: ShieldCheck,
                      active: Boolean(url?.startsWith("/super-admin/admins")),
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
        <div className="min-h-screen bg-[color:var(--color-bg-secondary)] flex flex-col">
            {/* Logout Confirmation Modal */}
            <Modal
                isOpen={logoutModalOpen}
                onClose={() => {
                    if (!logoutProcessing) {
                        setLogoutModalOpen(false);
                    }
                }}
                title="Log out from Admin?"
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
                <div className="flex items-start gap-3">
                    <div className="rounded-full bg-[color:var(--color-danger-50)] p-2 text-[color:var(--color-danger-600)]">
                        <LogOut size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
                            Are you sure you want to log out?
                        </p>
                        <p className="mt-1 text-xs text-[color:var(--color-text-secondary)]">
                            You will need to sign back in with your admin credentials to access the panel.
                        </p>
                    </div>
                </div>
            </Modal>

            {/* Mobile Header / Top Bar */}
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] px-4 md:hidden shadow-xs">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(true)}
                        className="rounded-lg p-2 text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-tertiary)] hover:text-[color:var(--color-text-primary)] transition-colors focus:outline-none"
                        aria-label="Open sidebar"
                    >
                        <Menu size={22} />
                    </button>
                    <Link href={route("admin.dashboard")} className="flex items-center">
                        <img src={Logo} alt="FoodHub" className="h-7 w-auto" />
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Avatar name={user?.name || "Admin"} size="sm" />
                        <span className="text-xs font-semibold text-[color:var(--color-text-primary)] max-w-[100px] truncate">
                            {user?.name?.split(" ")[0]}
                        </span>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer Backdrop */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Mobile Drawer Slide-over */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[color:var(--color-bg-primary)] border-r border-[color:var(--color-border)] shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-16 items-center justify-between border-b border-[color:var(--color-border-light)] px-4">
                    <Link href={route("admin.dashboard")} onClick={() => setMobileMenuOpen(false)}>
                        <img src={Logo} alt="FoodHub" className="h-8 w-auto" />
                    </Link>
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-lg p-2 text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-bg-tertiary)] hover:text-[color:var(--color-text-primary)] transition-colors"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Mobile Admin Profile Banner */}
                <div className="border-b border-[color:var(--color-border-light)] p-4 bg-[color:var(--color-bg-secondary)]">
                    <div className="flex items-center gap-3">
                        <Avatar name={user?.name || "Admin"} size="lg" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[color:var(--color-text-primary)]">
                                {user?.name}
                            </p>
                            <p className="truncate text-xs text-[color:var(--color-text-secondary)]">
                                {user?.email}
                            </p>
                            <div className="mt-1 flex items-center gap-1.5">
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                        isSuperAdmin
                                            ? "bg-[color:var(--color-primary-100)] text-[color:var(--color-primary-800)]"
                                            : "bg-[color:var(--color-gray-200)] text-[color:var(--color-gray-800)]"
                                    }`}
                                >
                                    {isSuperAdmin ? (
                                        <>
                                            <Sparkles size={10} />
                                            Super Admin
                                        </>
                                    ) : (
                                        <>
                                            <Shield size={10} />
                                            Admin
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                                    item.active
                                        ? "bg-[color:var(--color-primary-50)] text-[color:var(--color-primary-700)] font-semibold border-l-4 border-[color:var(--color-primary-500)]"
                                        : "text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-tertiary)] hover:text-[color:var(--color-text-primary)]"
                                }`}
                            >
                                <Icon size={20} className="shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-[color:var(--color-border-light)] p-3">
                    <button
                        type="button"
                        onClick={() => {
                            setMobileMenuOpen(false);
                            setLogoutModalOpen(true);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[color:var(--color-danger-600)] hover:bg-[color:var(--color-danger-50)] transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Desktop Collapsible Sidebar */}
            <aside
                className={`hidden md:flex md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex-col md:border-r md:border-[color:var(--color-border)] md:bg-[color:var(--color-bg-primary)] transition-[width] duration-300 ease-in-out ${
                    isCollapsed ? "md:w-20" : "md:w-64"
                }`}
            >
                {/* Desktop Sidebar Top Logo & Collapse Toggle */}
                <div className="flex h-16 shrink-0 items-center justify-between border-b border-[color:var(--color-border-light)] px-4">
                    <Link
                        href={route("admin.dashboard")}
                        className={`flex items-center overflow-hidden transition-all duration-300 ${
                            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                        }`}
                    >
                        <img src={Logo} alt="FoodHub" className="h-8 w-auto max-w-none" />
                    </Link>

                    {isCollapsed && (
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--color-primary-500)] text-white font-bold text-lg shadow-sm">
                            F
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={toggleSidebarCollapse}
                        className={`hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-tertiary)] hover:text-[color:var(--color-text-primary)] transition-colors ${
                            isCollapsed ? "mx-auto mt-2" : ""
                        }`}
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                title={isCollapsed ? item.label : undefined}
                                className={`flex items-center rounded-lg text-sm font-medium transition-all ${
                                    isCollapsed
                                        ? "justify-center px-2 py-3"
                                        : "gap-3 px-3.5 py-2.5"
                                } ${
                                    item.active
                                        ? "bg-[color:var(--color-primary-50)] text-[color:var(--color-primary-700)] font-semibold shadow-xs"
                                        : "text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-tertiary)] hover:text-[color:var(--color-text-primary)]"
                                }`}
                            >
                                <Icon size={isCollapsed ? 22 : 18} className="shrink-0" />
                                {!isCollapsed && <span className="truncate">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Desktop Sidebar Bottom User Card & Avatar */}
                <div className="border-t border-[color:var(--color-border-light)] p-3 bg-[color:var(--color-bg-secondary)]">
                    {!isCollapsed ? (
                        <div className="flex items-center gap-3">
                            <Avatar name={user?.name || "Admin"} size="md" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-[color:var(--color-text-primary)]">
                                    {user?.name}
                                </p>
                                <p className="truncate text-xs text-[color:var(--color-text-secondary)]">
                                    {isSuperAdmin ? "Super Admin" : "Admin"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setLogoutModalOpen(true)}
                                className="rounded-lg p-1.5 text-[color:var(--color-danger-600)] hover:bg-[color:var(--color-danger-50)] transition-colors"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <Avatar name={user?.name || "Admin"} size="sm" />
                            <button
                                type="button"
                                onClick={() => setLogoutModalOpen(true)}
                                className="rounded-lg p-2 text-[color:var(--color-danger-600)] hover:bg-[color:var(--color-danger-50)] transition-colors"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <main
                className={`flex-1 transition-[margin] duration-300 ease-in-out ${
                    isCollapsed ? "md:ml-20" : "md:ml-64"
                }`}
            >
                {/* Desktop Sticky Header */}
                <header className="hidden md:flex h-16 sticky top-0 z-20 items-center justify-between border-b border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] px-6 lg:px-8 shadow-xs">
                    <div>
                        <h1 className="text-lg font-bold text-[color:var(--color-text-primary)]">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-xs text-[color:var(--color-text-secondary)]">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 rounded-full border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-secondary)] px-3 py-1.5 shadow-2xs">
                            <Avatar name={user?.name || "Admin"} size="xs" />
                            <span className="text-xs font-semibold text-[color:var(--color-text-primary)]">
                                {user?.name}
                            </span>
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                    isSuperAdmin
                                        ? "bg-[color:var(--color-primary-100)] text-[color:var(--color-primary-800)]"
                                        : "bg-[color:var(--color-gray-200)] text-[color:var(--color-gray-800)]"
                                }`}
                            >
                                {isSuperAdmin ? "Super Admin" : "Admin"}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setLogoutModalOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--color-border-light)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-danger-600)] hover:bg-[color:var(--color-danger-50)] transition-colors"
                        >
                            <LogOut size={14} />
                            <span>Logout</span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
                    {/* Mobile Header Title */}
                    <div className="md:hidden">
                        <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="mt-1 text-xs text-[color:var(--color-text-secondary)]">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {flash?.success && (
                        <Alert type="success" title="Success" message={flash.success} />
                    )}
                    {flash?.error && (
                        <Alert type="error" title="Error" message={flash.error} />
                    )}

                    {children}
                </div>
            </main>
        </div>
    );
}
