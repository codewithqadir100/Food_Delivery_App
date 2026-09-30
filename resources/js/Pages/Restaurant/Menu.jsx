import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import { Plus } from "lucide-react";
import MenuCategoryList, {
    MenuCategoryCarousel,
} from "@/Components/Restaurant/Menu/MenuCategoryList";
import MenuItemsGrid from "@/Components/Restaurant/Menu/MenuItemsGrid";
import MenuCategoryModal from "@/Components/Restaurant/Menu/MenuCategoryModal";
import Alert from "@/Components/Common/Alert";
import Button from "@/Components/Common/Button";
import Card from "@/Components/Common/Card";
import Modal from "@/Components/Common/Modal";
import axios from "axios";
import RestaurantLayout from "@/Layouts/RestaurantLayout";

export default function Menu() {
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [alert, setAlert] = useState(null);

    const pageTitle = "Restaurant Menu";
    const subTitle = "Manage your Restaurant Menu";

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

    const handleDeleteCategory = (categoryId) => {
        const category = categories.find((c) => c.id === categoryId);
        setPendingDelete({
            type: "category",
            id: categoryId,
            name: category?.name,
        });
    };

    const handleAddItem = (category) => {
        router.get(
            route("restaurant.menu.items.create", { category_id: category.id }),
        );
    };

    const handleEditItem = (item) => {
        router.get(route("restaurant.menu.items.edit", item.id));
    };

    const handleDeleteItem = (itemId) => {
        const item = items.find((i) => i.id === itemId);
        setPendingDelete({
            type: "item",
            id: itemId,
            name: item?.name,
        });
    };

    const closeDeleteModal = () => {
        if (!deleting) {
            setPendingDelete(null);
        }
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;

        const { type, id } = pendingDelete;

        try {
            setDeleting(id);

            if (type === "category") {
                await axios.delete(route("restaurant.menu.categories.destroy", id));
                const remaining = categories.filter((c) => c.id !== id);
                setCategories(remaining);
                if (selectedCategory?.id === id) {
                    setSelectedCategory(remaining[0] || null);
                }
                setAlert({
                    type: "success",
                    title: "Success",
                    message: "Category deleted",
                });
            } else {
                await axios.delete(route("restaurant.menu.items.destroy", id));
                setItems(items.filter((i) => i.id !== id));
                setAlert({
                    type: "success",
                    title: "Success",
                    message: "Item deleted",
                });
            }

            setPendingDelete(null);
        } catch (error) {
            setAlert({
                type: "error",
                title: "Error",
                message:
                    error.response?.data?.message ||
                    (type === "category"
                        ? "Failed to delete category"
                        : "Failed to delete item"),
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
            <RestaurantLayout pageTitle={pageTitle} pageSubtitle={subTitle}>
                <div className="space-y-[var(--spacing-4)]">
                    {alert && (
                        <div className="fixed right-4 top-[calc(var(--restaurant-mobile-top-nav)+1rem)] z-[var(--z-popover)] md:top-6">
                            <Alert
                                type={alert.type}
                                title={alert.title}
                                message={alert.message}
                                onClose={() => setAlert(null)}
                            />
                        </div>
                    )}

                    <div className="space-y-[var(--spacing-3)] lg:hidden">
                        <Button
                            size="sm"
                            fullWidth
                            icon={Plus}
                            onClick={handleAddCategory}
                        >
                            Add Category
                        </Button>
                        <MenuCategoryCarousel
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onSelect={setSelectedCategory}
                        />
                    </div>

                    <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-[var(--spacing-6)]">
                        <aside className="hidden self-start lg:sticky lg:top-4 lg:block">
                            <Card padding="sm">
                                <h2 className="mb-[var(--spacing-3)] text-sm font-semibold text-[color:var(--color-text-primary)]">
                                    Categories
                                </h2>
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
                            </Card>
                        </aside>

                        <MenuItemsGrid
                            items={items}
                            selectedCategory={selectedCategory}
                            onAddItem={handleAddItem}
                            onEditItem={handleEditItem}
                            onDeleteItem={handleDeleteItem}
                            onToggleItem={handleToggleItem}
                            onEditCategory={handleEditCategory}
                            onDeleteCategory={handleDeleteCategory}
                            loading={loading}
                            deleting={deleting}
                        />
                    </div>

                    <Modal
                        isOpen={Boolean(pendingDelete)}
                        onClose={closeDeleteModal}
                        title={
                            pendingDelete?.type === "category"
                                ? "Delete category?"
                                : "Delete item?"
                        }
                        closeButton={!deleting}
                        footer={
                            <>
                                <Button
                                    variant="secondary"
                                    onClick={closeDeleteModal}
                                    disabled={Boolean(deleting)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    loading={Boolean(deleting)}
                                    onClick={confirmDelete}
                                >
                                    Delete
                                </Button>
                            </>
                        }
                    >
                        <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
                            {pendingDelete?.type === "category"
                                ? `Delete ${pendingDelete.name || "this category"}? Every item in it will be removed too.`
                                : `Delete ${pendingDelete?.name || "this item"}? This cannot be undone.`}
                        </p>
                    </Modal>

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
