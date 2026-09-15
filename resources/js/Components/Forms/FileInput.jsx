import { Upload, X } from "lucide-react";
import { useState, useRef } from "react";

export default function FileInput({
    value,
    onChange,
    accept = "image/*",
    maxSize = 5242880,
    error = null,
    label = null,
    helperText = null,
    disabled = false,
}) {
    const [preview, setPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (file) => {
        if (!file) return;

        if (file.size > maxSize) {
            if (onChange) onChange(null);
            setPreview(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);
            if (onChange) onChange(file);
        };
        reader.readAsDataURL(file);
    };

    const handleChange = (e) => {
        const file = e.target.files?.[0];
        handleFileSelect(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        handleFileSelect(file);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (onChange) onChange(null);
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
                    {label}
                </label>
            )}

            <div
                onClick={() => !disabled && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                    transition-colors duration-200
                    ${
                        isDragging
                            ? "border-[color:var(--color-primary-500)] bg-[color:var(--color-primary-50)]"
                            : "border-[color:var(--color-border-light)] hover:border-[color:var(--color-primary-400)]"
                    }
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                    ${error ? "border-[color:var(--color-danger-300)]" : ""}
                `}
            >
                {preview ? (
                    <div className="relative">
                        <img
                            src={preview}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded-lg object-cover"
                        />
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div>
                        <Upload
                            size={32}
                            className="mx-auto mb-2 text-[color:var(--color-text-muted)]"
                        />
                        <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
                            Drag & drop your image here
                        </p>
                        <p className="text-xs text-[color:var(--color-text-muted)] mt-1">
                            or click to browse
                        </p>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                    disabled={disabled}
                    className="hidden"
                />
            </div>

            {helperText && (
                <p className="text-xs text-[color:var(--color-text-muted)] mt-2">
                    {helperText}
                </p>
            )}

            {error && (
                <p className="text-xs text-[color:var(--color-danger-600)] mt-2">
                    {error}
                </p>
            )}
        </div>
    );
}
