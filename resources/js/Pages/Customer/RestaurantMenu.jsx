import { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import RestaurantHeader from "@/Components/Customer/RestaurantHeader";
import CategoryFilterTabs from "@/Components/Customer/CategoryFilterTabs";
import MenuItemCard from "@/Components/Customer/MenuItemCard";
import Alert from "@/Components/Common/Alert";
import Spinner from "@/Components/Common/Spinner";
import axios from "axios";

export default function RestaurantMenu({ restaurant, address }) {
    const [menuData, setMenuData] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [deliveryCharge, setDeliveryCharge] = useState(null);
    const [distance, setDistance] = useState(null);

    useEffect(() => {
        fetchMenu();
        calculateDeliveryCharges();
    }, []);

    const fetchMenu = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                route("api.restaurant.menu", restaurant.id),
            );
            setMenuData(res.data.data);

            if (res.data.data.categories.length > 0) {
                setSelectedCategoryId(res.data.data.categories[0].id);
            }
        } catch (error) {
            setAlert({
                type: "error",
                title: "Error",
                message: error.response?.data?.message || "Failed to load menu",
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateDeliveryCharges = () => {
        if (!address || !restaurant) return;

        const R = 6371;
        const lat1 = (address.latitude * Math.PI) / 180;
        const lat2 = (restaurant.latitude * Math.PI) / 180;
        const dLat = ((restaurant.latitude - address.latitude) * Math.PI) / 180;
        const dLng =
            ((restaurant.longitude - address.longitude) * Math.PI) / 180;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) *
                Math.cos(lat2) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;

        setDistance(dist);

        const charge = dist < 2 ? 50 : dist < 5 ? 100 : 150;
        setDeliveryCharge(charge);
    };

    const handleAddToCart = (item) => {
        setAlert({
            type: "info",
            title: "Add to Cart",
            message: `${item.name} added to cart (Coming soon)`,
        });
    };

    if (loading) {
        return (
            <>
                <Head title={`${restaurant.name} - Menu`} />
                <AppLayout>
                    <div className="flex items-center justify-center h-96">
                        <Spinner />
                    </div>
                </AppLayout>
            </>
        );
    }

    if (!menuData) {
        return (
            <>
                <Head title={`${restaurant.name} - Menu`} />
                <AppLayout>
                    <div className="text-center py-12">
                        <p className="text-[color:var(--color-text-muted)]">
                            Menu not available
                        </p>
                    </div>
                </AppLayout>
            </>
        );
    }

    const filteredItems = selectedCategoryId
        ? menuData.items.filter(
              (item) => item.category_id === selectedCategoryId,
          )
        : menuData.items;

    return (
        <>
            <Head title={`${restaurant.name} - Menu`} />
            <AppLayout>
                {alert && (
                    <div className="fixed top-4 right-4 z-50">
                        <Alert
                            type={alert.type}
                            title={alert.title}
                            message={alert.message}
                            onClose={() => setAlert(null)}
                        />
                    </div>
                )}

                <div className="min-h-screen bg-[color:var(--color-bg-secondary)]">
                    <RestaurantHeader
                        restaurant={menuData.restaurant}
                        deliveryCharge={deliveryCharge}
                        distance={distance}
                        onBack={() => window.history.back()}
                    />

                    <CategoryFilterTabs
                        categories={menuData.categories}
                        selectedCategoryId={selectedCategoryId}
                        onSelect={setSelectedCategoryId}
                    />

                    <div className="max-w-6xl mx-auto px-4 py-8">
                        {filteredItems.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-[color:var(--color-text-muted)]">
                                    No items available in this category
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredItems.map((item) => (
                                    <MenuItemCard
                                        key={item.id}
                                        item={item}
                                        onAddToCart={handleAddToCart}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
