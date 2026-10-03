import { useEffect, useRef, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import Spinner from "@/Components/Common/Spinner";
import RestaurantCard from "@/Components/Customer/RestaurantCard";
import RestaurantFilters from "@/Components/Customer/RestaurantFilters";
import Pagination from "@/Components/Common/Pagination";
import axios from "axios";
import { removeFavourite, saveFavourite } from "@/Utils/favourites";

function categoryIdFromSlug(categories, slug) {
    if (!slug) {
        return "";
    }

    const match = categories.find((category) => category.slug === slug);

    return match ? String(match.id) : "";
}

export default function Restaurants({ categories = [], user = null }) {
    const page = usePage();
    const authUser = page.props.auth?.user ?? null;
    const query = new URLSearchParams(page.url.split("?")[1] || "");
    const search = query.get("q") || "";
    const categorySlug = query.get("category") || "";
    const [restaurants, setRestaurants] = useState([]);
    const [favouriteId, setFavouriteId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});
    const requestId = useRef(0);

    const [filters, setFilters] = useState({
        category_id: categoryIdFromSlug(categories, categorySlug),
        featured: false,
        home_chef: false,
        min_rating: "",
        sort: "",
        page: 1,
    });

    useEffect(() => {
        if (!categorySlug) {
            return;
        }

        const nextId = categoryIdFromSlug(categories, categorySlug);
        setFilters((prev) =>
            prev.category_id === nextId ? prev : { ...prev, category_id: nextId, page: 1 },
        );
    }, [categorySlug, categories]);

    useEffect(() => {
        setFilters((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
    }, [search]);

    useEffect(() => {
        const id = ++requestId.current;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams({
                    page: String(filters.page),
                });

                if (filters.sort) {
                    params.set("sort", filters.sort);
                }

                if (filters.category_id) {
                    params.set("category_id", filters.category_id);
                }
                if (filters.featured) {
                    params.set("featured", "1");
                }
                if (filters.home_chef) {
                    params.set("home_chef", "1");
                }
                if (Number(filters.min_rating) >= 4) {
                    params.set("min_rating", "4");
                }
                if (search) {
                    params.set("q", search);
                }

                const response = await axios.get(`/api/restaurants?${params.toString()}`);

                if (id !== requestId.current) {
                    return;
                }

                setRestaurants(response.data.data);
                setPagination(response.data.meta);
            } catch (err) {
                if (id !== requestId.current) {
                    return;
                }

                setError(
                    err.response?.data?.message ||
                        "Failed to load restaurants. Please try again.",
                );
                setRestaurants([]);
            } finally {
                if (id === requestId.current) {
                    setLoading(false);
                }
            }
        };

        load();
    }, [filters.page, filters.category_id, filters.featured, filters.home_chef, filters.min_rating, filters.sort, search]);

    const handleFilterChange = (key, value) => {
        if (key === "reset") {
            setFilters({
                category_id: "",
                featured: false,
                home_chef: false,
                min_rating: "",
                sort: "",
                page: 1,
            });
            return;
        }

        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: 1,
        }));
    };

    const handleRestaurantClick = (restaurantId) => {
        router.visit(route("customer.restaurant.menu", restaurantId));
    };

    const handleFavourite = async (restaurant) => {
        if (!authUser?.is_customer) {
            router.visit(route("login"));
            return;
        }

        if (!authUser.email_verified) {
            router.visit(route("verification.notice"));
            return;
        }

        if (favouriteId !== null) {
            return;
        }

        setFavouriteId(restaurant.id);

        try {
            const data = restaurant.is_wishlisted
                ? await removeFavourite(restaurant.id)
                : await saveFavourite(restaurant.id);

            setRestaurants((current) =>
                current.map((item) =>
                    item.id === restaurant.id
                        ? { ...item, is_wishlisted: data.wishlisted }
                        : item,
                ),
            );
        } finally {
            setFavouriteId(null);
        }
    };

    const handlePaginationChange = (newPage) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const categoryName = categories.find(
        (category) => String(category.id) === String(filters.category_id),
    )?.name;
    const resultParts = [
        search ? `“${search}”` : "",
        categoryName || "",
        filters.featured ? "Featured" : "",
        Number(filters.min_rating) >= 4 ? "Ratings 4+" : "",
        filters.home_chef ? "Home chefs" : "",
        filters.sort === "nearest" ? "Nearest" : "",
        filters.sort === "top_rated" ? "Top rated" : "",
    ].filter(Boolean);
    const resultFor = resultParts.join(" · ");
    const resultCount = Number(pagination.total ?? 0);

    return (
        <>
            <Head title="Browse Restaurants" />
            <AppLayout>
                <div className="space-y-[var(--spacing-8)]">
                    {/* Header */}
                    <div className="space-y-[var(--spacing-4)]">
                        <h1 className="restaurant-main-heading">
                            Browse Restaurants
                        </h1>
                        {resultFor ? (
                            <p className="restaurant-results-line">
                                {loading ? (
                                    <>Finding places for <strong>{resultFor}</strong></>
                                ) : (
                                    <>
                                        <strong>{resultCount}</strong>
                                        {` ${resultCount === 1 ? "result" : "results"} found for `}
                                        <strong>{resultFor}</strong>
                                    </>
                                )}
                            </p>
                        ) : (
                            <p
                                className="-mt-1 text-[color:var(--color-text-muted)]"
                                style={{
                                    fontSize: "var(--font-size-md)",
                                    marginTop: "var(--spacing-1)",
                                }}
                            >
                                Order food from your favorite restaurants
                            </p>
                        )}
                    </div>

                    <div className="restaurant-browse">
                        <aside className="restaurant-browse-filters">
                            <div className="restaurant-filter-side">
                                <RestaurantFilters
                                    filters={filters}
                                    categories={categories}
                                    onFilterChange={handleFilterChange}
                                    layout="sidebar"
                                />
                            </div>
                            <div className="restaurant-filter-top">
                                <RestaurantFilters
                                    filters={filters}
                                    categories={categories}
                                    onFilterChange={handleFilterChange}
                                    layout="bar"
                                />
                            </div>
                        </aside>

                        <div className="min-w-0 flex-1 space-y-[var(--spacing-6)]">

                            {error && (
                                <div className="rounded-[var(--radius-md)] border border-[color:var(--color-danger-200)] bg-[color:var(--color-danger-50)] p-[var(--spacing-4)]">
                                    <p className="text-[color:var(--color-danger-600)]">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {loading ? (
                                <div className="flex justify-center py-[var(--spacing-20)]">
                                    <Spinner />
                                </div>
                            ) : restaurants.length > 0 ? (
                                <>
                                    <div className="restaurant-grid restaurant-browse-grid">
                                        {restaurants.map((restaurant) => (
                                            <RestaurantCard
                                                key={restaurant.id}
                                                restaurant={restaurant}
                                                user={user}
                                                onCardClick={() =>
                                                    handleRestaurantClick(restaurant.id)
                                                }
                                                onFavourite={() =>
                                                    handleFavourite(restaurant)
                                                }
                                            />
                                        ))}
                                    </div>

                                    <Pagination
                                        pagination={pagination}
                                        onPageChange={handlePaginationChange}
                                    />
                                </>
                            ) : (
                                <div className="py-[var(--spacing-20)] text-center">
                                    <p className="text-[color:var(--color-text-muted)]">
                                        No restaurants found
                                    </p>
                                    <p className="mt-[var(--spacing-2)] text-[color:var(--color-text-muted)]">
                                        Try another filter or search from the navbar
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
