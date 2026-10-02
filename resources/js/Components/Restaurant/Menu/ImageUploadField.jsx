import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

const SQUARE_FRAME =
    "aspect-square w-full max-w-full overflow-hidden rounded-[var(--radius-lg)] sm:max-w-xs";

export default function ImageUploadField({
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
    const maxLabel =
        maxSize >= 1024 ? `${Math.round(maxSize / 1024)}MB` : `${maxSize}KB`;

    const handleFileSelect = (file) => {
        if (!file) return;

        if (file.size > maxSize * 1024) {
            return;
        }

        if (
            !["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
                file.type,
            )
        ) {
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

    const clearImage = () => {
        setPreviewUrl(null);
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-[var(--spacing-2)]">
            {label && (
                <label className="block text-sm font-medium text-[color:var(--color-text-primary)]">
                    {label}
                    {required && (
                        <span className="ml-1 text-[color:var(--color-danger-600)]">
                            *
                        </span>
                    )}
                </label>
            )}

            {previewUrl ? (
                <div className={`relative ${SQUARE_FRAME}`}>
                    <img
                        src={previewUrl}
                        alt="Item preview"
                        className="h-full w-full object-cover"
                    />
                    <button
                        type="button"
                        onClick={clearImage}
                        aria-label="Remove image"
                        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-danger-600)] text-white shadow-[var(--shadow-sm)]"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 left-2 inline-flex h-9 items-center gap-1 rounded-[var(--radius-md)] bg-[color:var(--color-bg-primary)] px-2 text-xs font-medium text-[color:var(--color-text-primary)] shadow-[var(--shadow-sm)]"
                    >
                        <Upload className="h-3.5 w-3.5" />
                        Change
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`${SQUARE_FRAME} flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-[var(--spacing-4)] text-center transition-colors duration-[var(--transition-normal)] ${
                        error
                            ? "border-[color:var(--color-danger-600)]"
                            : isDragging
                              ? "border-[color:var(--color-primary-600)] bg-[color:var(--color-primary-50)]"
                              : "border-[color:var(--color-border)] hover:border-[color:var(--color-primary-500)]"
                    }`}
                >
                    <Upload
                        className={`mb-2 h-8 w-8 ${
                            isDragging
                                ? "text-[color:var(--color-primary-600)]"
                                : "text-[color:var(--color-text-muted)]"
                        }`}
                    />
                    <span className="text-sm font-medium text-[color:var(--color-text-primary)]">
                        Drop a square image, or tap to choose
                    </span>
                    <span className="mt-1 text-xs text-[color:var(--color-text-muted)]">
                        JPG, PNG, WEBP. Max {maxLabel}.
                    </span>
                </button>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
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
