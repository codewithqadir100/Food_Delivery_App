import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { Sidebar, MobileNav, Header } from "@/Components/Restaurant/Dashboard";

export default function RestaurantLayout({
    children,
    restaurant = null,
    status = null,
    isPending = false,
    onLogout = null,
}) {
    const { url } = usePage();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const currentRoute = url;
    const restaurantStatus = status ?? restaurant?.status ?? "pending";

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-secondary)]">
            <Sidebar
                currentRoute={currentRoute}
                isPending={isPending}
                isCollapsed={isSidebarCollapsed}
                onCollapsedChange={setIsSidebarCollapsed}
                onLogout={onLogout}
            />

            <MobileNav
                currentRoute={currentRoute}
                isPending={isPending}
                onLogout={onLogout}
            />

            <main
                className={`min-h-screen transition-[margin] duration-300 ease-in-out ${
                    isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
                }`}
            >
                <div className="flex min-h-screen flex-col pt-[var(--restaurant-mobile-top-nav)] pb-[var(--restaurant-mobile-bottom-nav)] md:pt-0 md:pb-0">
                    <Header
                        restaurantName={restaurant?.name}
                        status={restaurantStatus}
                    />

                    <div className="flex-1 p-4 sm:p-6 md:p-8">{children}</div>
                </div>
            </main>
        </div>
    );
}
