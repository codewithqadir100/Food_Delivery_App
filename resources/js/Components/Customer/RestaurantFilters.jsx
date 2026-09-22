import TextInput from "@/Components/Forms/TextInput";
import SelectInput from "@/Components/Forms/SelectInput";
import { Search } from "lucide-react";

export default function RestaurantFilters({
    filters,
    categories,
    onFilterChange,
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-4)]">
            <TextInput
                icon={<Search size={18} />}
                placeholder="Search restaurants..."
                value={filters.search}
                onChange={(e) => onFilterChange("search", e.target.value)}
            />

            <SelectInput
                value={filters.category_id}
                onChange={(e) => onFilterChange("category_id", e.target.value)}
                options={[
                    { value: "", label: "All Categories" },
                    ...categories.map((cat) => ({
                        value: cat.id,
                        label: cat.name,
                    })),
                ]}
            />
        </div>
    );
}
