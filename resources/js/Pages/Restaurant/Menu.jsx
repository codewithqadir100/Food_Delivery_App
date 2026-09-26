import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import { Menu as MenuIcon, X } from "lucide-react";
import MenuCategoryList from "@/Components/Restaurant/Menu/MenuCategoryList";
import MenuItemsGrid from "@/Components/Restaurant/Menu/MenuItemsGrid";
import MenuCategoryModal from "@/Components/Restaurant/Menu/MenuCategoryModal";
import Alert from "@/Components/Common/Alert";
import Button from "@/Components/Common/Button";
import axios from "axios";
import RestaurantLayout from "@/Layouts/RestaurantLayout";

export default function Menu() {
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [categoriesRes, itemsRes] = await Promise.all([
                axios.get(route("restaurant.menu.categories.index")),
                axios.get(route("restaurant.menu.items.index")),
            ]);

            setCategories(categoriesRes.data.data);
            setItems(itemsRes.data.data);

            if (categoriesRes.data.data.length > 0) {
                setSelectedCategory(categoriesRes.data.data[0]);
            }
        } catch (error) {
            setAlert({
                type: "error",
                title: "Error",
                message:
                    error.response?.data?.message || "Failed to load menu data",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = () => {
        setEditingCategory(null);
        setShowCategoryModal(true);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setShowCategoryModal(true);
    };

    const handleSaveCategory = async (data) => {
        try {
            setSaving(true);
            if (data.id) {
                const res = await axios.patch(
                    route("restaurant.menu.categories.update", data.id),
                    { name: data.name },
                );
                setCategories(
                    categories.map((c) =>
                        c.id === data.id ? res.data.data : c,
                    ),
                );
            } else {
                const res = await axios.post(
                    route("restaurant.menu.categories.store"),
                    { name: data.name },
                );
                setCategories([...categories, res.data.data]);
                setSelectedCategory(res.data.data);
            }
            setAlert({
                type: "success",
                title: "Success",
                message: data.id ? "Category updated" : "Category created",
            });
        } catch (error) {
            throw new Error(
                error.response?.data?.message || "Failed to save category",
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (
            !confirm(
                "This will delete the category and all its items. Continue?",
            )
        )
            return;

        try {
            setDeleting(categoryId);
            await axios.delete(
                route("restaurant.menu.categories.destroy", categoryId),
            );
            setCategories(categories.filter((c) => c.id !== categoryId));
            if (selectedCategory?.id === categoryId) {
                setSelectedCategory(categories[0] || null);
            }
            setAlert({
                type: "success",
                title: "Success",
                message: "Category deleted",
            });
        } catch (error) {
            setAlert({
                type: "error",
                title: "Error",
                message:
                    error.response?.data?.message ||
                    "Failed to delete category",
            });
        } finally {
            setDeleting(false);
        }
    };

    const handleAddItem = (category) => {
        router.get(
            route("restaurant.menu.items.create", { category_id: category.id }),
        );
    };

    const handleEditItem = (item) => {
        router.get(route("restaurant.menu.items.edit", item.id));
    };

    const handleDeleteItem = async (itemId) => {
        if (!confirm("Delete this item?")) return;

        try {
            setDeleting(itemId);
            await axios.delete(route("restaurant.menu.items.destroy", itemId));
            setItems(items.filter((i) => i.id !== itemId));
            setAlert({
                type: "success",
                title: "Success",
                message: "Item deleted",
            });
        } catch (error) {
            setAlert({
                type: "error",
                title: "Error",
                message:
                    error.response?.data?.message || "Failed to delete item",
            });
        } finally {
            setDeleting(false);
        }
    };

    const handleToggleItem = async (itemId) => {
        try {
            setDeleting(itemId);
            const res = await axios.patch(
                route("restaurant.menu.items.toggle", itemId),
            );
            setItems(items.map((i) => (i.id === itemId ? res.data.data : i)));
        } catch (error) {
            setAlert({
                type: "error",
                title: "Error",
                message: "Failed to update item",
            });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <Head title="Menu Management" />
            <RestaurantLayout>
                <div className="min-h-screen bg-[color:var(--color-bg-secondary)]">
                    {alert && (
                        <div className="fixed top-4 right-4 z-50">
                            <Alert
                                type={alert.type}
                                title={alert.title}
                                message={alert.message}
                                onClose={() => setAlert(null)}
                            />
                        </div>
                    )}

                    <div className="flex h-full">
                        <div
                            className={`
                                fixed lg:static inset-0 z-40 lg:z-0
                                w-full lg:w-64 bg-[color:var(--color-bg-primary)]
                                border-r border-[color:var(--color-border)]
                                transform transition-transform duration-[var(--transition-normal)]
                                ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                                overflow-y-auto
                            `}
                        >
                            <div className="sticky top-0 p-4 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-bold text-[color:var(--color-text-primary)]">
                                        Categories
                                    </h2>
                                    <button
                                        onClick={() => setSidebarOpen(false)}
                                        className="lg:hidden p-1 rounded-[var(--radius-md)] hover:bg-[color:var(--color-bg-secondary)]"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4">
                                <MenuCategoryList
                                    categories={categories}
                                    selectedCategory={selectedCategory}
                                    onSelect={setSelectedCategory}
                                    onAdd={handleAddCategory}
                                    onEdit={handleEditCategory}
                                    onDelete={handleDeleteCategory}
                                    loading={loading}
                                    deleting={deleting}
                                />
                            </div>
                        </div>

                        {sidebarOpen && (
                            <div
                                className="fixed inset-0 z-30 lg:hidden bg-black/20"
                                onClick={() => setSidebarOpen(false)}
                            />
                        )}

                        <div className="flex-1 p-4 lg:p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-bold text-[color:var(--color-text-primary)]">
                                    Menu Management
                                </h1>
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="lg:hidden p-2 rounded-[var(--radius-md)] hover:bg-[color:var(--color-bg-secondary)]"
                                >
                                    <MenuIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <MenuItemsGrid
                                items={items}
                                selectedCategory={selectedCategory}
                                onAddItem={handleAddItem}
                                onEditItem={handleEditItem}
                                onDeleteItem={handleDeleteItem}
                                onToggleItem={handleToggleItem}
                                loading={loading}
                                deleting={deleting}
                            />
                        </div>
                    </div>

                    <MenuCategoryModal
                        isOpen={showCategoryModal}
                        onClose={() => {
                            setShowCategoryModal(false);
                            setEditingCategory(null);
                        }}
                        onSubmit={handleSaveCategory}
                        initialData={editingCategory}
                        loading={saving}
                    />
                </div>
            </RestaurantLayout>
        </>
    );
}
