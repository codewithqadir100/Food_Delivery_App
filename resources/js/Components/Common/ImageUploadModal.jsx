import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import FileInput from "@/Components/Forms/FileInput";

export default function ImageUploadModal({
    isOpen,
    onClose,
    onUpload,
    title = "Upload Image",
    subtitle = null,
    previewShape = "rectangular",
    loading = false,
}) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (file) => {
        setSelectedFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target.result);
                setError(null);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Please select an image");
            return;
        }

        try {
            await onUpload(selectedFile);
            handleClose();
        } catch (err) {
            setError(err.message || "Upload failed");
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPreview(null);
        setError(null);
        onClose();
    };

    const isCircular = previewShape === "circular";

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={title} size="md">
            <div className="space-y-4">
                {subtitle && (
                    <p className="text-sm text-[color:var(--color-text-secondary)]">
                        {subtitle}
                    </p>
                )}

                <FileInput
                    accept="image/*"
                    maxSize={5242880}
                    onChange={handleFileChange}
                    label="Select Image"
                    helperText="Max size: 5MB. Supported formats: JPG, PNG, WebP"
                    error={error}
                />

                {preview && (
                    <div className="mt-4">
                        <p className="text-xs font-medium text-[color:var(--color-text-muted)] mb-2">
                            Preview
                        </p>
                        {isCircular ? (
                            <div className="flex justify-center">
                                <div className="h-40 w-40 rounded-full border-4 border-[color:var(--color-border-light)] bg-[color:var(--color-bg-secondary)] flex items-center justify-center overflow-hidden">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-lg overflow-hidden bg-[color:var(--color-bg-secondary)] flex items-center justify-center max-h-48">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-6 flex gap-3 justify-end">
                <Button
                    variant="secondary"
                    onClick={handleClose}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleUpload}
                    loading={loading}
                    disabled={!selectedFile || loading}
                >
                    Upload
                </Button>
            </div>
        </Modal>
    );
}
