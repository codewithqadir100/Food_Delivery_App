import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import Spinner from "@/Components/Common/Spinner";
import RestaurantCard from "@/Components/Customer/RestaurantCard";
import RestaurantFilters from "@/Components/Customer/RestaurantFilters";
import RestaurantPagination from "@/Components/Customer/RestaurantPagination";
import axios from "axios";

export default function Restaurants({ categories = [], user = null }) {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});

    const [filters, setFilters] = useState({
        search: "",
        category_id: "",
        page: 1,
    });

    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
            setFilters((prev) => ({ ...prev, page: 1 }));
        }, 500);

        return () => clearTimeout(timer);
    }, [filters.search]);

    useEffect(() => {
        fetchRestaurants();
    }, [filters.page, debouncedSearch, filters.category_id]);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: filters.page,
                category_id: filters.category_id,
            });

            if (debouncedSearch) {
                const response = await axios.get(
                    `/api/restaurants/search?q=${encodeURIComponent(debouncedSearch)}&category_id=${filters.category_id}`,
                );
                setRestaurants(response.data.data);
                setPagination({
                    current_page: 1,
                    per_page: 12,
                    total: response.data.data.length,
                    last_page: 1,
                });
            } else {
                const response = await axios.get(
                    `/api/restaurants?${params.toString()}`,
                );
                setRestaurants(response.data.data);
                setPagination(response.data.meta);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Failed to load restaurants. Please try again.",
            );
            setRestaurants([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: 1,
        }));
    };

    const handleRestaurantClick = (restaurantId) => {
        router.visit(route("customer.restaurant.menu", restaurantId));
    };

    const handlePaginationChange = (newPage) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

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
                        <p
                            className="-mt-1 text-[color:var(--color-text-muted)]"
                            style={{
                                fontSize: "var(--font-size-md)",
                                marginTop: "var(--spacing-1)",
                            }}
                        >
                            Order food from your favorite restaurants
                        </p>
                    </div>

                    {/* Filters */}
                    <RestaurantFilters
                        filters={filters}
                        categories={categories}
                        onFilterChange={handleFilterChange}
                    />

                    {/* Error State */}
                    {error && (
                        <div className="p-[var(--spacing-4)] bg-[color:var(--color-danger-50)] border border-[color:var(--color-danger-200)] rounded-[var(--radius-md)]">
                            <p className="text-[color:var(--color-danger-600)]">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex justify-center py-[var(--spacing-20)]">
                            <Spinner />
                        </div>
                    ) : restaurants.length > 0 ? (
                        <>
                            {/* Restaurant Grid */}
                            <div className="restaurant-grid">
                                {restaurants.map((restaurant) => (
                                    <RestaurantCard
                                        key={restaurant.id}
                                        restaurant={restaurant}
                                        user={user}
                                        onCardClick={() =>
                                            handleRestaurantClick(restaurant.id)
                                        }
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            <RestaurantPagination
                                pagination={pagination}
                                onPageChange={handlePaginationChange}
                            />
                        </>
                    ) : (
                        <div className="text-center py-[var(--spacing-20)]">
                            <p className="text-[color:var(--color-text-muted)]">
                                No restaurants found in your delivery area
                            </p>
                            <p className="text-[color:var(--color-text-muted)] mt-[var(--spacing-2)]">
                                Please check your location or try adjusting your
                                search
                            </p>
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}
