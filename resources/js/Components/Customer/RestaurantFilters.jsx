import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import Dropdown from "@/Components/Common/Dropdown";
import Button from "@/Components/Common/Button";

const QUICK_FILTERS = [
    { key: "rating", label: "Ratings 4+" },
    { key: "featured", label: "Featured" },
    { key: "home_chef", label: "Home chefs" },
];

const MOBILE_PILLS = [
    ...QUICK_FILTERS,
    { key: "top_rated", label: "Top rated" },
];

const VISIBLE_CUISINES = 6;

const SORTS = [
    { value: "nearest", label: "Nearest" },
    { value: "top_rated", label: "Top rated" },
];

export default function RestaurantFilters({
    filters,
    categories = [],
    onFilterChange,
    layout = "sidebar",
    defaultSort = "",
}) {
    const [cuisineQuery, setCuisineQuery] = useState("");
    const [showAllCuisines, setShowAllCuisines] = useState(false);
    const categoryOptions = [
        { value: "", label: "All cuisines" },
        ...categories.map((category) => ({
            value: String(category.id),
            label: category.name,
        })),
    ];
    const active =
        Boolean(filters.featured) ||
        Boolean(filters.home_chef) ||
        Number(filters.min_rating) >= 4 ||
        Boolean(filters.category_id) ||
        filters.sort !== defaultSort;
    const cuisines = useMemo(() => {
        const term = cuisineQuery.trim().toLowerCase();

        return categories.filter((category) =>
            category.name.toLowerCase().includes(term),
        );
    }, [categories, cuisineQuery]);
    const visibleCuisines = showAllCuisines || cuisineQuery
        ? cuisines
        : cuisines.slice(0, VISIBLE_CUISINES);

    const togglePill = (key) => {
        if (key === "featured") {
            onFilterChange("featured", !filters.featured);
            return;
        }

        if (key === "home_chef") {
            onFilterChange("home_chef", !filters.home_chef);
            return;
        }

        if (key === "rating") {
            onFilterChange("min_rating", Number(filters.min_rating) >= 4 ? "" : 4);
            return;
        }

        onFilterChange("sort", filters.sort === "top_rated" ? "" : "top_rated");
    };

    const pillActive = (key) => {
        if (key === "featured") return Boolean(filters.featured);
        if (key === "home_chef") return Boolean(filters.home_chef);
        if (key === "rating") return Number(filters.min_rating) >= 4;
        return filters.sort === "top_rated";
    };

    const pills = (items, className) => (
        <div className={className}>
            {items.map((pill) => (
                <button
                    key={pill.key}
                    type="button"
                    aria-pressed={pillActive(pill.key)}
                    onClick={() => togglePill(pill.key)}
                    className={
                        layout === "sidebar"
                            ? "restaurant-filter-pill"
                            : `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                                pillActive(pill.key)
                                    ? "bg-[color:var(--color-primary-600)] text-white"
                                    : "bg-[color:var(--color-gray-100)] text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-gray-200)]"
                            }`
                    }
                >
                    {pill.label}
                </button>
            ))}
        </div>
    );

    const clearFilters = () => {
        setCuisineQuery("");
        setShowAllCuisines(false);
        onFilterChange("reset");
    };

    if (layout === "bar") {
        return (
            <div className="space-y-[var(--spacing-3)]">
                <div className="grid grid-cols-2 gap-[var(--spacing-3)]">
                    <Dropdown
                        value={filters.sort}
                        options={SORTS}
                        placeholder="Sort"
                        onChange={(value) => onFilterChange("sort", value)}
                    />
                    <Dropdown
                        value={filters.category_id}
                        options={categoryOptions}
                        onChange={(value) => onFilterChange("category_id", value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    {pills(MOBILE_PILLS, "scrollbar-none-mobile -mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 pb-1")}
                    {active && (
                        <Button variant="ghost" size="sm" className="!px-2 !py-1 shrink-0" onClick={clearFilters}>
                            Clear
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="restaurant-filter-panel">
            <div className="restaurant-filter-head">
                <h2 className="restaurant-filter-heading">Filters</h2>
                {active && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="!px-2 !py-1"
                        onClick={clearFilters}
                    >
                        Clear
                    </Button>
                )}
            </div>

            <div className="restaurant-filter-body">
            <section className="restaurant-filter-section">
                <h3 className="restaurant-filter-label">Sort by</h3>
                {SORTS.map((option) => (
                    <label key={option.value} className="restaurant-filter-radio">
                        <input
                            type="radio"
                            name="restaurant-sort"
                            value={option.value}
                            checked={filters.sort === option.value}
                            onChange={() => onFilterChange("sort", option.value)}
                        />
                        {option.label}
                    </label>
                ))}
            </section>

            <section className="restaurant-filter-section">
                <h3 className="restaurant-filter-label">Quick filters</h3>
                {pills(QUICK_FILTERS, "restaurant-filter-pills")}
            </section>

            <section className="restaurant-filter-section">
                <h3 className="restaurant-filter-label">Cuisines</h3>
                <label className="restaurant-filter-search">
                    <Search size={16} aria-hidden="true" />
                    <input
                        value={cuisineQuery}
                        onChange={(event) => setCuisineQuery(event.target.value)}
                        placeholder="Search for cuisine"
                        aria-label="Search for cuisine"
                    />
                </label>
                {visibleCuisines.length > 0 ? (
                    visibleCuisines.map((category) => {
                        const selected = String(filters.category_id) === String(category.id);

                        return (
                            <label key={category.id} className="restaurant-filter-check">
                                <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() =>
                                        onFilterChange("category_id", selected ? "" : String(category.id))
                                    }
                                />
                                {category.name}
                            </label>
                        );
                    })
                ) : (
                    <p className="text-sm text-[color:var(--color-text-muted)]">
                        No cuisine found
                    </p>
                )}
                {!cuisineQuery && cuisines.length > VISIBLE_CUISINES && (
                    <button
                        type="button"
                        className="restaurant-filter-more inline-flex items-center gap-1"
                        onClick={() => setShowAllCuisines((current) => !current)}
                    >
                        {showAllCuisines ? "Show less" : "Show more"}
                        <ChevronDown
                            size={16}
                            className={showAllCuisines ? "rotate-180" : ""}
                        />
                    </button>
                )}
            </section>
            </div>
        </div>
    );
}
