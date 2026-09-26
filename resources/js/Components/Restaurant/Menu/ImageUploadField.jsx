import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";

export default function ImageUploadField({
    value,
    onChange,
    error,
    label = "Image",
    required = false,
    preview = null,
    maxSize = 2048,
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(preview);
    const fileInputRef = useRef(null);

    const handleFileSelect = (file) => {
        if (!file) return;

        if (file.size > maxSize * 1024) {
            return;
        }

        if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target.result);
            onChange(file);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const clearImage = () => {
        setPreviewUrl(null);
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-[color:var(--color-text-primary)]">
                    {label}
                    {required && (
                        <span className="text-[color:var(--color-danger-600)] ml-1">
                            *
                        </span>
                    )}
                </label>
            )}

            {previewUrl ? (
                <div className="relative group">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-[var(--radius-md)] border border-[color:var(--color-border)]"
                    />
                    <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-2 rounded-[var(--radius-md)] bg-[color:var(--color-danger-600)] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--transition-normal)]"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 rounded-[var(--radius-md)] bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--transition-normal)] flex items-center justify-center"
                    >
                        <Upload className="w-6 h-6 text-white" />
                    </button>
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        border-2 border-dashed rounded-[var(--radius-md)] p-8 text-center cursor-pointer
                        transition-all duration-[var(--transition-normal)]
                        ${
                            isDragging
                                ? "border-[color:var(--color-primary-600)] bg-[color:var(--color-primary-50)]"
                                : "border-[color:var(--color-border)] hover:border-[color:var(--color-primary-500)]"
                        }
                        ${error ? "border-[color:var(--color-danger-600)]" : ""}
                    `}
                >
                    <Upload
                        className={`w-8 h-8 mx-auto mb-2 ${isDragging ? "text-[color:var(--color-primary-600)]" : "text-[color:var(--color-text-muted)]"}`}
                    />
                    <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
                        Drop your image here or click to select
                    </p>
                    <p className="text-xs text-[color:var(--color-text-muted)] mt-1">
                        Supported: JPG, PNG (Max {maxSize}MB)
                    </p>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
                className="hidden"
            />

            {error && (
                <p className="text-xs text-[color:var(--color-danger-600)]">
                    {error}
                </p>
            )}
        </div>
    );
}
