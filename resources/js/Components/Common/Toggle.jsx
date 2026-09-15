export default function Toggle({
    value,
    onChange,
    activeLabel,
    inactiveLabel,
    activeIcon: ActiveIcon,
    inactiveIcon: InactiveIcon,
    disabled = false,
    className = "",
}) {
    const isActive = Boolean(value);

    return (
        <div
            className={`relative inline-flex w-fit items-center rounded-full bg-[var(--color-gray-100)] p-1 ${className}`}
            role="group"
        >
            <span
                aria-hidden="true"
                className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-[var(--color-gray-0)] shadow-[var(--shadow-sm)] toggle-indicator ${
                    isActive ? "translate-x-0" : "translate-x-full"
                }`}
            />

            <button
                type="button"
                disabled={disabled}
                aria-pressed={isActive}
                onClick={() => onChange(true)}
                className={`relative z-10 flex min-w-24 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium toggle-option ${
                    isActive
                        ? "text-[var(--color-primary-500)]"
                        : "text-[var(--color-gray-700)]"
                } disabled:cursor-not-allowed disabled:opacity-50`}
            >
                {ActiveIcon && (
                    <ActiveIcon size={16} strokeWidth={2} aria-hidden="true" />
                )}

                <span>{activeLabel}</span>
            </button>

            <button
                type="button"
                disabled={disabled}
                aria-pressed={!isActive}
                onClick={() => onChange(false)}
                className={`relative z-10 flex min-w-24 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium toggle-option ${
                    !isActive
                        ? "text-[var(--color-primary-500)]"
                        : "text-[var(--color-gray-700)]"
                } disabled:cursor-not-allowed disabled:opacity-50`}
            >
                {InactiveIcon && (
                    <InactiveIcon
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                    />
                )}

                <span>{inactiveLabel}</span>
            </button>
        </div>
    );
}
