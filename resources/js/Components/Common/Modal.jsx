import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = "md",
    closeButton = true,
}) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className={`
            bg-[color:var(--color-bg-primary)]
            rounded-lg
            shadow-xl
            transform
            transition-all
            w-full
            ${sizeClasses[size]}
            animate-in
          `}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    {title && (
                        <div className="flex items-center justify-between border-b border-[color:var(--color-border-light)] px-6 py-4">
                            <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                                {title}
                            </h3>
                            {closeButton && (
                                <button
                                    onClick={onClose}
                                    className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className="px-6 py-4">{children}</div>

                    {/* Footer */}
                    {footer && (
                        <div className="border-t border-[color:var(--color-border-light)] px-6 py-4 flex justify-end gap-3">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
