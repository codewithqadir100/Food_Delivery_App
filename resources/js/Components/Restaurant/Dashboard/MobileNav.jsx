import { Link, router } from "@inertiajs/react";
import {
    Bell,
    LayoutDashboard,
    Menu,
    HelpCircle,
    MessageSquare,
    ShoppingCart,
    BarChart3,
    MoreHorizontal,
    Settings,
    User,
    LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import Logo from "@/assets/logo.png";

const NAV_ITEMS = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/restaurant/dashboard",
        key: "dashboard",
    },
    { label: "Menu", icon: Menu, href: "/restaurant/menu", key: "menu" },
    {
        label: "Orders",
        icon: ShoppingCart,
        href: "/restaurant/orders",
        key: "orders",
    },
    {
        label: "Analytics",
        icon: BarChart3,
        href: "/restaurant/analytics",
        key: "analytics",
    },
];

const MORE_OPTIONS = [
    { label: "Help & Support", icon: HelpCircle, href: "#", key: "help" },
    { label: "Feedback", icon: MessageSquare, href: "#", key: "feedback" },
    {
        label: "Settings",
        icon: Settings,
        href: "/restaurant/settings",
        key: "settings",
    },
];

export default function MobileNav({
    currentRoute = "dashboard",
    isPending = false,
    onLogout = null,
    notificationCount = 0,
    onNotificationsClick,
    Restaurantlogo,
}) {
    const [showMore, setShowMore] = useState(false);
    const [hideLabels, setHideLabels] = useState(false);

    const isActive = (routeKey) => currentRoute.includes(routeKey);

    const handleLogout = () => {
        setShowMore(false);

        if (onLogout) {
            onLogout();
        } else {
            router.post("/restaurant/logout");
        }
    };

    useEffect(() => {
        const checkScreenSize = () => {
            setHideLabels(window.innerWidth < 360);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);

        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    return (
        <>
            {/* Top Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[color:var(--color-bg-primary)] border-b border-[color:var(--color-border-light)] flex items-center justify-between px-4 z-[var(--z-fixed)]">
                <Link
                    href="/restaurant/dashboard"
                    className="flex items-center"
                >
                    <img src={Logo} alt="FoodHub" className="h-8 w-auto" />
                </Link>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={onNotificationsClick}
                        className="relative rounded-[var(--radius-sm)] p-2 text-[color:var(--color-text-secondary)] transition-colors hover:bg-[color:var(--color-bg-tertiary)] hover:text-[color:var(--color-text-primary)]"
                        aria-label="Notifications"
                    >
                        <Bell size={20} />

                        {notificationCount > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--color-danger-500)] px-1 text-[10px] font-semibold text-white">
                                {notificationCount > 9
                                    ? "9+"
                                    : notificationCount}
                            </span>
                        )}
                    </button>

                    <Link
                        href="/restaurant/settings"
                        className="rounded-[var(--radius-sm)] p-2 transition-colors hover:bg-[color:var(--color-bg-tertiary)]"
                        title="Settings"
                    >
                        <Settings
                            size={20}
                            className="text-[color:var(--color-text-secondary)]"
                        />
                    </Link>

                    <Link
                        href="/restaurant/profile"
                        className="rounded-[var(--radius-sm)] p-2 transition-colors hover:bg-[color:var(--color-bg-tertiary)]"
                        title="Profile"
                    >
                        <img
                            src={Restaurantlogo}
                            className="h-10 rounded-[var(--radius-full)]"
                            alt="Profile Pic"
                        />
                    </Link>
                </div>
            </div>

            {/* More Options Popover */}
            {showMore && (
                <>
                    {/* Light Backdrop */}
                    <div
                        className="md:hidden fixed inset-0 z-[var(--z-modal-backdrop)] bg-[color:var(--color-gray-900)]/5"
                        onClick={() => setShowMore(false)}
                    />

                    {/* Popover Menu Floating Right Above Bottom Nav */}
                    <div className="md:hidden fixed bottom-20 right-4 z-[var(--z-popover)] w-52 bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border-light)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] p-1.5 flex flex-col gap-0.5">
                        {MORE_OPTIONS.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.key);

                            return (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    onClick={() => setShowMore(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-colors ${
                                        active
                                            ? "text-[color:var(--color-primary-600)] bg-[color:var(--color-primary-100)]"
                                            : "text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-tertiary)]"
                                    }`}
                                >
                                    <Icon size={18} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}

                        <div className="my-1 border-t border-[color:var(--color-border-light)]" />

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[color:var(--color-danger-600)] hover:bg-[color:var(--color-danger-50)] rounded-[var(--radius-sm)] transition-colors"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </>
            )}

            {/* Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[color:var(--color-bg-primary)] border-t border-[color:var(--color-border-light)] flex items-center justify-around z-[var(--z-fixed)] px-2">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.key);
                    const disabled = isPending && item.key !== "dashboard";

                    return (
                        <Link
                            key={item.key}
                            href={item.href}
                            className={`
                flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-[var(--radius-sm)] flex-1
                transition-all duration-200
                ${
                    disabled
                        ? "opacity-50 cursor-not-allowed"
                        : active
                          ? "text-[color:var(--color-primary-600)] bg-[color:var(--color-primary-100)]"
                          : "text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-tertiary)]"
                }
              `}
                            title={item.label}
                            onClick={(e) => disabled && e.preventDefault()}
                        >
                            <Icon
                                size={hideLabels ? 20 : 24}
                                className="shrink-0"
                            />
                            {!hideLabels && (
                                <span className="text-xs font-medium truncate max-w-[60px]">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}

                <button
                    onClick={() => setShowMore(!showMore)}
                    className={`
            flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-[var(--radius-sm)] flex-1
            transition-all duration-200
            ${
                showMore
                    ? "text-[color:var(--color-primary-600)] bg-[color:var(--color-primary-100)]"
                    : "text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-tertiary)]"
            }
          `}
                    title="More options"
                >
                    <MoreHorizontal
                        size={hideLabels ? 20 : 24}
                        className="shrink-0"
                    />
                    {!hideLabels && (
                        <span className="text-xs font-medium">More</span>
                    )}
                </button>
            </nav>
        </>
    );
}
