import { useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { ChevronLeft } from "lucide-react";
import Card from "@/Components/Common/Card";
import TextInput from "@/Components/Forms/TextInput";
import TextArea from "@/Components/Forms/TextArea";
import SelectInput from "@/Components/Forms/SelectInput";
import Button from "@/Components/Common/Button";
import Alert from "@/Components/Common/Alert";
import ImageUploadField from "@/Components/Restaurant/Menu/ImageUploadField";
import RestaurantLayout from "@/Layouts/RestaurantLayout";

export default function MenuItemFormPage({
    categories,
    item = null,
    selectedCategoryId,
}) {
    const isEditing = !!item;
    const [imagePreview, setImagePreview] = useState(item?.image_url || null);
    const [imageError, setImageError] = useState("");
    const [submitError, setSubmitError] = useState("");

    const { data, setData, post, processing, errors } = useForm({
        menu_category_id: item?.menu_category_id || selectedCategoryId || "",
        name: item?.name || "",
        description: item?.description || "",
        price: item?.price || "",
        image: null,
        _method: item ? "PATCH" : "POST",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitError("");

        if (!data.menu_category_id) {
            setSubmitError("Please select a category");
            return;
        }

        if (!data.name.trim()) {
            setSubmitError("Item name is required");
            return;
        }

        if (!data.price) {
            setSubmitError("Price is required");
            return;
        }

        if (!isEditing && !data.image) {
            setSubmitError("Image is required");
            return;
        }

        post(
            isEditing
                ? route("restaurant.menu.items.update", item.id)
                : route("restaurant.menu.items.store"),
            {
                forceFormData: true,
                preserveScroll: true,
                onError: (errors) => {
                    if (errors.message) {
                        setSubmitError(errors.message);
                    }
                },
            },
        );
    };

    const handleImageChange = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
            setData("image", file);
            setImageError("");
        } else {
            setImagePreview(null);
            setData("image", null);
        }
    };

    const backToMenu = () => {
        router.visit(route("restaurant.menu"));
    };

    return (
        <>
            <Head title={isEditing ? "Edit Menu Item" : "Add Menu Item"} />
            <RestaurantLayout
                pageTitle={isEditing ? "Edit Menu Item" : "Add Menu Item"}
                pageSubtitle={
                    isEditing
                        ? "Update this dish"
                        : "Add a dish to your menu"
                }
            >
                <div className="mx-auto max-w-2xl space-y-[var(--spacing-6)]">
                    <Link
                        href={route("restaurant.menu")}
                        className="inline-flex items-center gap-[var(--spacing-1)] text-sm font-medium text-[color:var(--color-text-secondary)] transition-colors duration-[var(--transition-fast)] hover:text-[color:var(--color-text-primary)]"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to menu
                    </Link>

                    {submitError && (
                        <Alert
                            type="error"
                            title="Error"
                            message={submitError}
                            onClose={() => setSubmitError("")}
                        />
                    )}

                    <Card>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SelectInput
                                    label="Category"
                                    value={data.menu_category_id}
                                    onChange={(e) =>
                                        setData(
                                            "menu_category_id",
                                            e.target.value,
                                        )
                                    }
                                    error={errors.menu_category_id}
                                    required
                                >
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </SelectInput>

                                <TextInput
                                    label="Item Name"
                                    placeholder="e.g., Mutton Biryani"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    error={errors.name}
                                    required
                                />
                            </div>

                            <TextArea
                                label="Description"
                                placeholder="Describe your item briefly and appealingly..."
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                error={errors.description}
                                rows={3}
                                maxLength={500}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <TextInput
                                    type="number"
                                    label="Price (Rs)"
                                    placeholder="350"
                                    value={data.price}
                                    onChange={(e) =>
                                        setData("price", e.target.value)
                                    }
                                    error={errors.price}
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>

                            <ImageUploadField
                                label="Item Image"
                                onChange={handleImageChange}
                                error={errors.image || imageError}
                                preview={imagePreview}
                                maxSize={2048}
                                required={!isEditing}
                            />

                            <div className="flex flex-col-reverse gap-[var(--spacing-3)] border-t border-[color:var(--color-border)] pt-[var(--spacing-4)] sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={backToMenu}
                                    disabled={processing}
                                    className="w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    loading={processing}
                                    className="w-full sm:w-auto"
                                >
                                    {isEditing ? "Update" : "Add"} Item
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </RestaurantLayout>
        </>
    );
}
