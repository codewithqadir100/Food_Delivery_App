import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import Modal from "@/Components/Common/Modal";
import Button from "@/Components/Common/Button";
import { Sidebar, MobileNav, Header } from "@/Components/Restaurant/Dashboard";

export default function RestaurantLayout({
    children,
    pageTitle,
    pageSubtitle,
    notificationCount = 8,
    onNotificationsClick,
    isPending = false,
    onLogout = null,
}) {
    const { url } = usePage();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { restaurant } = usePage().props;
    const currentRoute = url;

    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [logoutProcessing, setLogoutProcessing] = useState(false);

    const handleLogout = () => {
        setLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        setLogoutProcessing(true);

        router.post(
            route("restaurant.logout"),
            {},
            {
                onSuccess: () => {
                    setLogoutModalOpen(false);
                    setLogoutProcessing(false);
                },
                onError: () => {
                    setLogoutProcessing(false);
                },
            },
        );
    };

    return (
        <>
            <div className="relative z-[var(--z-modal)]">
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
                        Are you sure you want to log out of your restaurant
                        account?
                    </p>
                </Modal>
            </div>
            <div className="min-h-screen bg-[color:var(--color-bg-secondary)]">
                <Sidebar
                    Restaurantlogo={restaurant?.logo_url}
                    restaurantName={restaurant?.name}
                    currentRoute={currentRoute}
                    isPending={isPending}
                    isCollapsed={isSidebarCollapsed}
                    onCollapsedChange={setIsSidebarCollapsed}
                    onLogout={handleLogout}
                />

                <MobileNav
                    Restaurantlogo={restaurant?.logo_url}
                    currentRoute={currentRoute}
                    isPending={isPending}
                    onLogout={handleLogout}
                    notificationCount={notificationCount}
                    onNotificationsClick={onNotificationsClick}
                />

                <main
                    className={`min-h-screen transition-[margin] duration-300 ease-in-out ${
                        isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
                    }`}
                >
                    <div className="flex min-h-screen flex-col pt-[var(--restaurant-mobile-top-nav)] pb-[var(--restaurant-mobile-bottom-nav)] md:pt-0 md:pb-0">
                        <Header
                            title={pageTitle}
                            subtitle={pageSubtitle}
                            isRestaurantOpen={restaurant?.is_open ?? false}
                            notificationCount={notificationCount}
                            onNotificationsClick={onNotificationsClick}
                        />

                        <div className="flex-1 p-4 sm:p-6 md:p-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
