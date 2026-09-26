import { useState, useEffect } from "react";
import { useForm, Head } from "@inertiajs/react";
import { ChevronLeft } from "lucide-react";
import Card from "@/Components/Common/Card";
import TextInput from "@/Components/Forms/TextInput";
import TextArea from "@/Components/Forms/TextArea";
import SelectInput from "@/Components/Forms/SelectInput";
import Button from "@/Components/Common/Button";
import Alert from "@/Components/Common/Alert";
import ImageUploadField from "@/Components/Restaurant/Menu/ImageUploadField";
import Spinner from "@/Components/Common/Spinner";
import RestaurantLayout from "@/Layouts/RestaurantLayout";

export default function MenuItemFormPage({
    categories,
    item = null,
    restaurantId,
}) {
    const isEditing = !!item;
    const [imagePreview, setImagePreview] = useState(item?.image || null);
    const [imageError, setImageError] = useState("");
    const [submitError, setSubmitError] = useState("");

    const { data, setData, post, patch, processing, errors } = useForm({
        menu_category_id: item?.menu_category_id || "",
        name: item?.name || "",
        description: item?.description || "",
        price: item?.price || "",
        image: null,
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

        if (isEditing) {
            patch(route("restaurant.menu.items.update", item.id), {
                forceFormData: true,
                preserveScroll: true,
                onError: (errors) => {
                    if (errors.message) {
                        setSubmitError(errors.message);
                    }
                },
            });
        } else {
            post(route("restaurant.menu.items.store"), {
                forceFormData: true,
                preserveScroll: true,
                onError: (errors) => {
                    if (errors.message) {
                        setSubmitError(errors.message);
                    }
                },
            });
        }
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

    return (
        <>
            <Head title={isEditing ? "Edit Menu Item" : "Add Menu Item"} />
            <RestaurantLayout>
                <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 rounded-[var(--radius-md)] hover:bg-[color:var(--color-bg-secondary)] transition-colors duration-[var(--transition-fast)]"
                            title="Go back"
                        >
                            <ChevronLeft className="w-5 h-5 text-[color:var(--color-text-primary)]" />
                        </button>
                        <h1 className="text-2xl font-bold text-[color:var(--color-text-primary)]">
                            {isEditing ? "Edit Menu Item" : "Add Menu Item"}
                        </h1>
                    </div>

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
                                    <option value="">Select a category</option>
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
                                value={data.image}
                                onChange={handleImageChange}
                                error={errors.image || imageError}
                                preview={imagePreview}
                                maxSize={2048}
                                required={!isEditing}
                            />

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[color:var(--color-border)]">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => window.history.back()}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" loading={processing}>
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
