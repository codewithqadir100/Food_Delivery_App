import { Fragment, useEffect, useRef, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import RestaurantHeader from "@/Components/Customer/RestaurantHeader";
import CategoryFilterTabs from "@/Components/Customer/CategoryFilterTabs";
import MenuItemOrderCard from "@/Components/Customer/MenuItemOrderCard";
import MenuReviewSpotlight from "@/Components/Customer/MenuReviewSpotlight";
import MenuCart from "@/Components/Customer/MenuCart";
import Alert from "@/Components/Common/Alert";
import Spinner from "@/Components/Common/Spinner";
import axios from "axios";
import { removeFavourite, saveFavourite } from "@/Utils/favourites";

export default function RestaurantMenu({
    restaurant,
    distance_km,
    delivery_charge,
}) {
    const [menuData, setMenuData] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [query, setQuery] = useState("");
    const ignoreSpy = useRef(false);
    const [pendingScrollId, setPendingScrollId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [addingItemId, setAddingItemId] = useState(null);
    const [alert, setAlert] = useState(null);
    const [cart, setCart] = useState(null);
    const [updatingFulfillment, setUpdatingFulfillment] = useState(false);
    const [updatingCutlery, setUpdatingCutlery] = useState(false);
    const user = usePage().props.auth?.user ?? null;
    const canOrder = user === null || Boolean(user.is_customer);
    const [wishlisted, setWishlisted] = useState(
        Boolean(restaurant.is_wishlisted),
    );
    const [savingFavourite, setSavingFavourite] = useState(false);

    useEffect(() => {
        fetchMenu();
        if (canOrder) {
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

    const handleFavourite = async () => {
        if (!user?.is_customer) {
            router.visit(route("login"));
            return;
        }

        if (!user.email_verified) {
            router.visit(route("verification.notice"));
            return;
        }

        if (savingFavourite) {
            return;
        }

        setSavingFavourite(true);

        try {
            const data = wishlisted
                ? await removeFavourite(restaurant.id)
                : await saveFavourite(restaurant.id);

            setWishlisted(data.wishlisted);
        } catch (error) {
            setAlert({
                type: "error",
                title: "Error",
                message:
                    error.response?.data?.message ||
                    "Could not update favourites.",
            });
        } finally {
            setSavingFavourite(false);
        }
    };

    const handleAddToCart = async (item, quantity) => {
        if (!canOrder) {
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

    const handleSetQuantity = async (item, quantity) => {
        if (!canOrder) {
            return;
        }

        try {
            setAddingItemId(item.id);

            const res =
                quantity <= 0
                    ? await axios.delete(
                          route("customer.cart.destroy", item.id),
                      )
                    : await axios.patch(
                          route("customer.cart.update", item.id),
                          {
                              quantity,
                          },
                      );

            setCart(res.data.data);
            router.reload({ only: ["auth"] });
        } catch (error) {
            setAlert({
                type: "error",
                title: "Error",
                message:
                    error.response?.data?.message || "Failed to update cart",
            });
        } finally {
            setAddingItemId(null);
        }
    };

    const changeCutlery = async (wantsCutlery) => {
        try {
            setUpdatingCutlery(true);
            const res = await axios.patch(route("customer.cart.cutlery"), {
                wants_cutlery: wantsCutlery,
                restaurant_id: restaurant.id,
            });
            setCart(res.data.data);
        } catch {
            setAlert({
                type: "error",
                title: "Error",
                message: "Could not update cutlery.",
            });
        } finally {
            setUpdatingCutlery(false);
        }
    };

    const quantityFor = (itemId) =>
        (cart?.items ?? []).find((line) => line.menu_item_id === itemId)
            ?.quantity ?? 0;

    const selectCategory = (id) => {
        ignoreSpy.current = true;
        setQuery("");
        setSelectedCategoryId(id);
        setPendingScrollId(id);
    };

    useEffect(() => {
        if (pendingScrollId == null) {
            return undefined;
        }

        const frame = requestAnimationFrame(() => {
            document
                .getElementById(`menu-category-${pendingScrollId}`)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        const timer = window.setTimeout(() => {
            ignoreSpy.current = false;
            setPendingScrollId(null);
        }, 800);

        return () => {
            cancelAnimationFrame(frame);
            window.clearTimeout(timer);
        };
    }, [pendingScrollId]);

    useEffect(() => {
        if (!menuData) {
            return undefined;
        }

        const sections = [...document.querySelectorAll("[data-menu-section]")];
        if (sections.length === 0) {
            return undefined;
        }

        let frame = 0;
        const updateActiveSection = () => {
            if (ignoreSpy.current) {
                return;
            }

            const marker =
                document
                    .querySelector("[data-menu-filter]")
                    ?.getBoundingClientRect().bottom ?? 0;
            let active = sections[0];

            sections.forEach((section) => {
                if (section.getBoundingClientRect().top <= marker + 8) {
                    active = section;
                }
            });

            const id = Number(active.dataset.menuSection);
            setSelectedCategoryId((current) => (current === id ? current : id));
        };
        const onScroll = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(updateActiveSection);
        };

        updateActiveSection();
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", onScroll);
        };
    }, [menuData, query]);

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

    const search = query.trim().toLowerCase();
    const sections = menuData.categories
        .map((category) => ({
            ...category,
            items: menuData.items.filter(
                (item) => item.category_id === category.id,
            ),
        }))
        .filter((section) => section.items.length > 0);
    const spotlightAfter = sections.length >= 3 ? 2 : sections.length - 1;
    const results = search
        ? menuData.items.filter((item) =>
              item.name.toLowerCase().includes(search),
          )
        : [];

    const renderMenuItem = (item) => (
        <MenuItemOrderCard
            key={item.id}
            item={item}
            quantity={quantityFor(item.id)}
            canOrder={canOrder}
            busy={addingItemId === item.id}
            onAdd={() => handleAddToCart(item, 1)}
            onChangeQuantity={(next) => handleSetQuantity(item, next)}
            onRemove={() => handleSetQuantity(item, 0)}
        />
    );

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
                        wishlisted={wishlisted}
                        onFavourite={handleFavourite}
                    />

                    <div
                        className={`mx-auto max-w-6xl ${
                            cart?.items?.length ? "pb-24 md:pb-8" : "pb-8"
                        }`}
                    >
                        <CategoryFilterTabs
                            categories={menuData.categories}
                            selectedCategoryId={selectedCategoryId}
                            onSelect={selectCategory}
                            query={query}
                            onQueryChange={setQuery}
                        />

                        <div className="flex items-start gap-6">
                            <div className="min-w-0 flex-1">
                                <div className="space-y-[var(--spacing-8)] py-[var(--spacing-6)]">
                                    {search && (
                                        <SearchResults
                                            query={query.trim()}
                                            items={results}
                                            renderItem={(item) =>
                                                renderMenuItem(item)
                                            }
                                        />
                                    )}
                                    {sections.length === 0 ? (
                                        <p className="py-12 text-center text-sm text-[color:var(--color-text-muted)]">
                                            No items available
                                        </p>
                                    ) : (
                                        sections.map((section, index) => (
                                            <Fragment key={section.id}>
                                                <section
                                                    id={`menu-category-${section.id}`}
                                                    data-menu-section={section.id}
                                                    className="scroll-mt-[calc(var(--customer-nav-height)+var(--menu-filter-height))]"
                                                >
                                                    <h2 className="mb-[var(--spacing-4)] text-lg sm:text-xl font-semibold text-[color:var(--color-text-primary)]">
                                                        {section.name}
                                                    </h2>
                                                    <ItemGrid>
                                                        {section.items.map((item) =>
                                                            renderMenuItem(item),
                                                        )}
                                                    </ItemGrid>
                                                </section>
                                                {index === spotlightAfter && (
                                                    <MenuReviewSpotlight
                                                        restaurantId={menuData.restaurant.id}
                                                        reviews={menuData.review_spotlight}
                                                    />
                                                )}
                                            </Fragment>
                                        ))
                                    )}
                                </div>
                            </div>

                            <MenuCart
                                cart={cart}
                                onFulfillmentChange={changeFulfillment}
                                onAddSuggestion={(item) =>
                                    handleAddToCart(item, 1)
                                }
                                onQuantityChange={(menuItemId, quantity) =>
                                    handleSetQuantity({ id: menuItemId }, quantity)
                                }
                                onCutleryChange={changeCutlery}
                                addingItemId={addingItemId}
                                updatingFulfillment={
                                    updatingFulfillment || !canOrder
                                }
                                updatingCutlery={updatingCutlery || !canOrder}
                            />
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}

function ItemGrid({ children }) {
    return (
        <div className="grid grid-cols-1 gap-[var(--spacing-6)] sm:grid-cols-2 md:grid-cols-1 min-[850px]:grid-cols-2">
            {children}
        </div>
    );
}

function SearchResults({ query, items, renderItem }) {
    return (
        <section
            id="menu-search-results"
            className="scroll-mt-[calc(var(--customer-nav-height)+var(--menu-filter-height))]"
        >
            <h2 className="mb-[var(--spacing-4)] text-lg font-semibold text-[color:var(--color-text-primary)]">
                We found {items.length}{" "}
                {items.length === 1 ? "result" : "results"} for “{query}”
            </h2>
            {items.length === 0 ? (
                <p className="py-12 text-center text-sm text-[color:var(--color-text-muted)]">
                    No items match your search
                </p>
            ) : (
                <ItemGrid>{items.map((item) => renderItem(item))}</ItemGrid>
            )}
        </section>
    );
}
