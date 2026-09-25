import { Link } from "@inertiajs/react";
import {
    LayoutDashboard,
    Menu,
    ShoppingCart,
    BarChart3,
    Settings,
    User,
    LogOut,
    ChevronDown,
} from "lucide-react";
import { useMemo } from "react";
import SidebarItem from "./SidebarItem";
import Logo from "@/assets/logo.png";

const MENU_ITEMS = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/restaurant/dashboard",
        key: "dashboard",
    },
    {
        label: "Menu",
        icon: Menu,
        href: "/restaurant/menu",
        key: "menu",
    },
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

export default function Sidebar({
    restaurantName,
    currentRoute = "",
    isPending = false,
    isCollapsed = false,
    onCollapsedChange,
    onLogout = null,
    Restaurantlogo,
}) {
    const isActive = useMemo(
        () => (routeKey) => currentRoute.includes(routeKey),
        [currentRoute],
    );

    const FOOTER_ITEMS = [
        {
            label: restaurantName,
            image: Restaurantlogo,
            href: "/restaurant/profile",
            key: "profile",
        },
        {
            label: "Settings",
            icon: Settings,
            href: "/restaurant/settings",
            key: "settings",
        },
    ];

    const renderItems = (items) =>
        items.map((item) => (
            <div key={item.key} title={isCollapsed ? item.label : undefined}>
                <SidebarItem
                    href={item.href}
                    label={isCollapsed ? "" : item.label}
                    icon={item.icon}
                    image={item.image}
                    isActive={isActive(item.key)}
                    badge={item.badge}
                    disabled={isPending && item.key !== "dashboard"}
                />
            </div>
        ));

    return (
        <aside
            className={`hidden md:flex md:fixed md:inset-y-0 md:left-0 md:z-[var(--z-fixed)] md:flex-col md:bg-[color:var(--color-bg-primary)] md:border-r md:border-[color:var(--color-border)] md:transition-[width] md:duration-300 md:ease-in-out ${
                isCollapsed ? "md:w-20" : "md:w-64"
            }`}
        >
            {/* Header / Logo */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-[color:var(--color-border-light)] px-4">
                <Link
                    href={route("home")}
                    className={`flex items-center overflow-hidden transition-all duration-[var(--transition-normal)] ${
                        isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                    }`}
                >
                    <img
                        src={Logo}
                        alt="FoodHub"
                        className="h-8 w-auto shrink-0"
                    />
                </Link>

                <button
                    type="button"
                    onClick={() => onCollapsedChange?.(!isCollapsed)}
                    className="shrink-0 rounded-[var(--radius-sm)] p-2 transition-colors hover:bg-[color:var(--color-bg-tertiary)]"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    aria-label={
                        isCollapsed ? "Expand sidebar" : "Collapse sidebar"
                    }
                >
                    <ChevronDown
                        size={20}
                        className={`transition-transform duration-[var(--transition-normal)] ${
                            isCollapsed ? "rotate-90" : "-rotate-90"
                        }`}
                    />
                </button>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 space-y-2 overflow-y-auto px-2 py-4">
                {renderItems(MENU_ITEMS)}
            </nav>

            {/* Footer Items & Logout */}
            <div className="space-y-2 border-t border-[color:var(--color-border-light)] px-2 py-4">
                {renderItems(FOOTER_ITEMS)}

                <button
                    type="button"
                    onClick={onLogout}
                    className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-4 py-2 text-[color:var(--color-danger-600)] transition-colors hover:bg-[color:var(--color-danger-50)]"
                    title={isCollapsed ? "Logout" : undefined}
                >
                    <LogOut size={20} className="shrink-0" />
                    <span
                        className={`overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-[var(--transition-normal)] ${
                            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                        }`}
                    >
                        Logout
                    </span>
                </button>
            </div>
        </aside>
    );
}
