import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({
    isOpen: openProp,
    show,
    onClose,
    title,
    children,
    footer,
    size = "md",
    closeButton = true,
}) {
    const isOpen = Boolean(openProp ?? show ?? false);

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

    return createPortal(
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            <div
                className={`relative flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-lg bg-[color:var(--color-bg-primary)] shadow-xl ${sizeClasses[size]}`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {title && (
                    <div className="flex shrink-0 items-center justify-between border-b border-[color:var(--color-border-light)] px-6 py-4">
                        <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                            {title}
                        </h3>
                        {closeButton && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-[color:var(--color-text-muted)] transition-colors hover:text-[color:var(--color-text-primary)]"
                            >
                                <X size={24} />
                            </button>
                        )}
                    </div>
                )}

                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                    {children}
                </div>

                {footer && (
                    <div className="flex shrink-0 justify-end gap-3 border-t border-[color:var(--color-border-light)] px-6 py-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body,
    );
}
