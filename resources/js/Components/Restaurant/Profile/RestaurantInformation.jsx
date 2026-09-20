import FormLabel from "@/Components/Forms/FormLabel";
import SelectInput from "@/Components/Forms/SelectInput";
import TextArea from "@/Components/Forms/TextArea";
import TextInput from "@/Components/Forms/TextInput";
import Toggle from "@/Components/Common/Toggle";
import ReadOnlyTextInput from "@/Components/Forms/ReadOnlyTextInput";
import { Check, X } from "lucide-react";

export default function RestaurantInformation({
    data,
    categories,
    errors = {},
    onChange,
}) {
    const categoryOptions = categories.map((category) => ({
        value: category.id,
        label: category.name,
    }));

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-4 rounded-[var(--radius-md)] border border-[var(--color-border-light)] bg-[var(--color-primary-50)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="min-w-0">
                    <h3 className="font-semibold">Restaurant Status</h3>

                    <p className="text-sm leading-5 text-[color:var(--color-text-muted)]">
                        Control whether customers can place new orders from your
                        restaurant.
                    </p>
                </div>

                <div className="shrink-0 max-sm:mx-auto">
                    <Toggle
                        value={data.is_open}
                        onChange={(value) => onChange("is_open", value)}
                        activeLabel="Open"
                        inactiveLabel="Closed"
                        activeIcon={Check}
                        inactiveIcon={X}
                    />
                </div>
            </div>
            <div>
                <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                    Your Restaurant Information
                </h2>
                <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                    Manage your restaurant details and contact information.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <TextInput
                    label="Restaurant Name"
                    placeholder="Restuarant Name"
                    value={data.name}
                    onChange={(event) => onChange("name", event.target.value)}
                    error={errors.name}
                    required
                />

                <SelectInput
                    label="Category"
                    value={data.restaurant_category_id}
                    onChange={(event) =>
                        onChange("restaurant_category_id", event.target.value)
                    }
                    options={categoryOptions}
                    error={errors.restaurant_category_id}
                    required
                />

                <TextInput
                    label="Phone Number"
                    placeholder="Phone No."
                    type="tel"
                    value={data.phone}
                    onChange={(event) => onChange("phone", event.target.value)}
                    error={errors.phone}
                />

                <ReadOnlyTextInput
                    label="City"
                    placeHolder="Select City from Map"
                    value={data.city_name || "-"}
                    required={true}
                />

                <ReadOnlyTextInput
                    label="Address"
                    placeHolder="Select Address from Map"
                    value={data.address || "-"}
                    required={true}
                />

                <TextInput
                    label="Street Address"
                    placeHolder="House 123, Green Gate, Beside Parks"
                    value={data.street_address || ""}
                    onChange={(e) => onChange("street_address", e.target.value)}
                />

                <div className="sm:col-span-2">
                    <TextArea
                        label="Description"
                        placeholder="Tell Customers about your restaurant..."
                        value={data.description}
                        onChange={(event) =>
                            onChange("description", event.target.value)
                        }
                        error={errors.description}
                        rows={5}
                    />
                </div>
            </div>
        </section>
    );
}
