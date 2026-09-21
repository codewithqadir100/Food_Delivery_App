import { useState, useEffect, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import Button from "@/Components/Common/Button";
import Card from "@/Components/Common/Card";
import Spinner from "@/Components/Common/Spinner";
import TextInput from "@/Components/Forms/TextInput";
import SelectInput from "@/Components/Forms/SelectInput";
import { Search, MapPin } from "lucide-react";
import axios from "axios";

export default function Restaurants({ categories = [] }) {
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
            });

            if (debouncedSearch) {
                const response = await axios.get(
                    `/api/restaurants/search?q=${encodeURIComponent(debouncedSearch)}`,
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
        router.visit(`/restaurants/${restaurantId}`);
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
                        <h1 className="text-[var(--font-size-3xl)] font-bold text-[color:var(--color-text-primary)]">
                            Browse Restaurants
                        </h1>
                        <p className="text-[var(--font-size-lg)] text-[color:var(--color-text-muted)]">
                            Order food from your favorite restaurants
                        </p>
                    </div>

                    {/* Filters Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-4)]">
                        <TextInput
                            icon={Search}
                            placeholder="Search restaurants..."
                            value={filters.search}
                            onChange={(e) =>
                                handleFilterChange("search", e.target.value)
                            }
                        />

                        <SelectInput
                            value={filters.category_id}
                            onChange={(e) =>
                                handleFilterChange(
                                    "category_id",
                                    e.target.value,
                                )
                            }
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </SelectInput>
                    </div>

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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-6)]">
                                {restaurants.map((restaurant) => (
                                    <Card
                                        key={restaurant.id}
                                        shadow={true}
                                        padding="none"
                                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                        onClick={() =>
                                            handleRestaurantClick(restaurant.id)
                                        }
                                    >
                                        {/* Cover Image */}
                                        <div className="w-full h-[200px] overflow-hidden bg-[color:var(--color-bg-tertiary)]">
                                            {restaurant.cover_image_url ? (
                                                <img
                                                    src={
                                                        restaurant.cover_image_url
                                                    }
                                                    alt={restaurant.name}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <MapPin
                                                        size={48}
                                                        className="text-[color:var(--color-text-muted)]"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-[var(--spacing-4)] space-y-[var(--spacing-3)]">
                                            {/* Name */}
                                            <h3 className="text-[var(--font-size-lg)] font-semibold text-[color:var(--color-text-primary)] line-clamp-2">
                                                {restaurant.name}
                                            </h3>

                                            {/* Rating & Reviews */}
                                            <div className="flex items-center gap-[var(--spacing-2)]">
                                                <span className="text-[var(--font-size-sm)] font-medium text-[color:var(--color-text-primary)]">
                                                    ★ {restaurant.rating}
                                                </span>
                                                <span className="text-[var(--font-size-sm)] text-[color:var(--color-text-muted)]">
                                                    ({restaurant.review_count})
                                                </span>
                                            </div>

                                            {/* Category */}
                                            <p className="text-[var(--font-size-sm)] text-[color:var(--color-text-muted)]">
                                                {restaurant.category?.name ||
                                                    "Restaurant"}
                                            </p>

                                            {restaurant.distance_km !==
                                                null && (
                                                <div className="flex justify-between items-center text-[var(--font-size-sm)]">
                                                    <span className="text-[color:var(--color-text-muted)]">
                                                        {restaurant.distance_km}{" "}
                                                        km
                                                    </span>
                                                    <span className="font-semibold text-[color:var(--color-primary-600)]">
                                                        $
                                                        {
                                                            restaurant.delivery_charge
                                                        }
                                                    </span>
                                                </div>
                                            )}

                                            {user ? (
                                                // Authenticated customer - can order
                                                <Button
                                                    variant="primary"
                                                    size="md"
                                                    fullWidth
                                                    onClick={() =>
                                                        handleRestaurantClick(
                                                            restaurant.id,
                                                        )
                                                    }
                                                >
                                                    View Menu
                                                </Button>
                                            ) : (
                                                // Guest - show login button
                                                <Button
                                                    variant="secondary"
                                                    size="md"
                                                    fullWidth
                                                    onClick={() =>
                                                        router.visit(
                                                            route("login"),
                                                        )
                                                    }
                                                >
                                                    Login to Order
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.last_page > 1 && (
                                <div className="flex items-center justify-center gap-[var(--spacing-3)] pt-[var(--spacing-8)]">
                                    <Button
                                        variant="secondary"
                                        size="md"
                                        disabled={pagination.current_page === 1}
                                        onClick={() =>
                                            handlePaginationChange(
                                                pagination.current_page - 1,
                                            )
                                        }
                                    >
                                        Previous
                                    </Button>

                                    {Array.from(
                                        { length: pagination.last_page },
                                        (_, i) => i + 1,
                                    ).map((page) => (
                                        <Button
                                            key={page}
                                            variant={
                                                page === pagination.current_page
                                                    ? "primary"
                                                    : "secondary"
                                            }
                                            size="md"
                                            onClick={() =>
                                                handlePaginationChange(page)
                                            }
                                        >
                                            {page}
                                        </Button>
                                    ))}

                                    <Button
                                        variant="secondary"
                                        size="md"
                                        disabled={
                                            pagination.current_page ===
                                            pagination.last_page
                                        }
                                        onClick={() =>
                                            handlePaginationChange(
                                                pagination.current_page + 1,
                                            )
                                        }
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-[var(--spacing-20)]">
                            <p className="text-[var(--font-size-lg)] text-[color:var(--color-text-muted)]">
                                No restaurants found in your delivery area
                            </p>
                            <p className="text-[var(--font-size-sm)] text-[color:var(--color-text-muted)] mt-[var(--spacing-2)]">
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
