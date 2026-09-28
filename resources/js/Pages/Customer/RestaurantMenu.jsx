import { useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import RestaurantHeader from "@/Components/Customer/RestaurantHeader";
import CategoryFilterTabs from "@/Components/Customer/CategoryFilterTabs";
import MenuItemOrderCard from "@/Components/Customer/MenuItemOrderCard";
import MenuCart from "@/Components/Customer/MenuCart";
import Alert from "@/Components/Common/Alert";
import Spinner from "@/Components/Common/Spinner";
import axios from "axios";

export default function RestaurantMenu({
    restaurant,
    distance_km,
    delivery_charge,
}) {
    const [menuData, setMenuData] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [addingItemId, setAddingItemId] = useState(null);
    const [alert, setAlert] = useState(null);
    const [cart, setCart] = useState(null);
    const [updatingFulfillment, setUpdatingFulfillment] = useState(false);
    const isCustomer = Boolean(usePage().props.auth?.user?.is_customer);

    useEffect(() => {
        fetchMenu();
        if (isCustomer) {
            fetchCart();
        }
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

    const fetchCart = async () => {
        try {
            const res = await axios.get(route("customer.cart.data"), {
                params: { restaurant_id: restaurant.id },
            });
            setCart(res.data.data);
        } catch {
            setCart(null);
        }
    };

    const changeFulfillment = async (fulfillment) => {
        try {
            setUpdatingFulfillment(true);
            const res = await axios.patch(route("customer.cart.fulfillment"), {
                fulfillment,
                restaurant_id: restaurant.id,
            });
            setCart(res.data.data);
        } catch (error) {
            setAlert({
                type: "error",
                title: "Error",
                message: "Could not update pickup or delivery.",
            });
        } finally {
            setUpdatingFulfillment(false);
        }
    };

    const handleAddToCart = async (item, quantity) => {
        if (!isCustomer) {
            setAlert({
                type: "warning",
                title: "Sign in required",
                message: "Please sign in as a customer to add items.",
            });
            return;
        }

        try {
            setAddingItemId(item.id);

            const res = await axios.post(route("customer.cart.store"), {
                menu_item_id: item.id,
                quantity,
            });

            setCart(res.data.data);
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
                    <div className="fixed top-4 right-4 z-[var(--z-popover)]">
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

                    <div
                        className={`max-w-6xl mx-auto px-4 py-8 ${
                            cart?.items?.length ? "pb-24 md:pb-8" : ""
                        }`}
                    >
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
                                        canOrder={isCustomer}
                                        adding={addingItemId === item.id}
                                        onAddToCart={handleAddToCart}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <MenuCart
                    cart={cart}
                    onFulfillmentChange={changeFulfillment}
                    onAddSuggestion={(item) => handleAddToCart(item, 1)}
                    addingItemId={addingItemId}
                    updatingFulfillment={updatingFulfillment || !isCustomer}
                />
            </AppLayout>
        </>
    );
}
