import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import RestaurantHeader from "@/Components/Customer/RestaurantHeader";
import CategoryFilterTabs from "@/Components/Customer/CategoryFilterTabs";
import MenuItemOrderCard from "@/Components/Customer/MenuItemOrderCard";
import Alert from "@/Components/Common/Alert";
import Spinner from "@/Components/Common/Spinner";
import axios from "axios";

export default function RestaurantMenu({
    restaurant,
    distance_km,
    delivery_charge,
    can_order,
}) {
    const [menuData, setMenuData] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [addingItemId, setAddingItemId] = useState(null);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchMenu();
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

    const handleAddToCart = async (item, quantity) => {
        if (!can_order) {
            setAlert({
                type: "warning",
                title: "Address Required",
                message:
                    "Please add a delivery address before placing an order.",
            });
            return;
        }

        try {
            setAddingItemId(item.id);

            const res = await axios.post(route("customer.cart.store"), {
                menu_item_id: item.id,
                quantity,
            });

            setAlert({
                type: res.data.switched_restaurant ? "warning" : "success",
                title: res.data.switched_restaurant
                    ? "Cart Replaced"
                    : "Added to Cart",
                message: res.data.message,
            });

            // Refresh only the shared "auth" prop so the navbar cart badge
            // updates without reloading the whole page/menu.
            router.reload({ only: ["auth"] });
        } catch (error) {
            setAlert({
                type: "error",
                title: "Error",
                message:
                    error.response?.data?.message ||
                    "Failed to add item to cart",
            });
        } finally {
            setAddingItemId(null);
        }
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
                        deliveryCharge={delivery_charge}
                        distance={distance_km}
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
                                    <MenuItemOrderCard
                                        key={item.id}
                                        item={item}
                                        canOrder={can_order}
                                        adding={addingItemId === item.id}
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
