import { useState, useEffect } from "react";
import Modal from "@/Components/Common/Modal";
import TextInput from "@/Components/Forms/TextInput";
import Button from "@/Components/Common/Button";

export default function MenuCategoryModal({
    isOpen,
    onClose,
    onSubmit,
    initialData = null,
    loading = false,
}) {
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || "");
            setError("");
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Category name is required");
            return;
        }

        if (name.trim().length > 50) {
            setError("Category name must not exceed 50 characters");
            return;
        }

        try {
            await onSubmit({
                name: name.trim(),
                id: initialData?.id,
            });
            onClose();
        } catch (err) {
            setError(err.message || "Failed to save category");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Edit Category" : "Add Category"}
            size="sm"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <TextInput
                    label="Category Name"
                    placeholder="e.g., Biryani, Karahi, Fries"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={error}
                    maxLength={50}
                    autoFocus
                    required
                />

                <div className="flex items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" loading={loading}>
                        {initialData ? "Update" : "Add"} Category
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
