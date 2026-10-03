import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Dropdown({
    label,
    value,
    options = [],
    onChange,
    placeholder = "Select",
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const listId = useId();
    const selected = options.find((option) => String(option.value) === String(value));

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const onPointer = (event) => {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };
        const onKey = (event) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };

        document.addEventListener("pointerdown", onPointer);
        document.addEventListener("keydown", onKey);

        return () => {
            document.removeEventListener("pointerdown", onPointer);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <div ref={rootRef} className="relative">
            {label && (
                <p className="mb-[var(--spacing-2)] text-sm font-medium text-[color:var(--color-text-secondary)]">
                    {label}
                </p>
            )}
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                onClick={() => setOpen((current) => !current)}
                className="flex w-full items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] px-3 py-2 text-left text-sm text-[color:var(--color-text-primary)] transition-colors duration-[var(--transition-fast)] hover:border-[color:var(--color-primary-300)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary-500)]"
            >
                <span className="truncate">{selected?.label || placeholder}</span>
                <ChevronDown
                    size={16}
                    className={`shrink-0 text-[color:var(--color-text-muted)] transition-transform duration-[var(--transition-fast)] ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>
            {open && (
                <ul
                    id={listId}
                    role="listbox"
                    className="absolute z-[var(--z-dropdown)] mt-1 max-h-60 w-full overflow-auto rounded-[var(--radius-md)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] py-1 shadow-[var(--shadow-md)]"
                >
                    {options.map((option) => {
                        const active = String(option.value) === String(value);

                        return (
                            <li key={String(option.value)}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={active}
                                    onClick={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full px-3 py-2 text-left text-sm transition-colors duration-[var(--transition-fast)] ${
                                        active
                                            ? "bg-[color:var(--color-primary-50)] font-medium text-[color:var(--color-primary-700)]"
                                            : "text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)]"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
