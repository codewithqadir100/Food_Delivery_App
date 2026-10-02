export default function Switch({
    checked = false,
    onChange,
    disabled = false,
    label = "Toggle",
}) {
    const isOn = Boolean(checked);

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isOn}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange?.(!isOn)}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-[var(--transition-fast)] disabled:cursor-not-allowed disabled:opacity-50 ${
                isOn
                    ? "bg-[color:var(--color-primary-600)]"
                    : "bg-[color:var(--color-gray-300)]"
            }`}
        >
            <span
                aria-hidden="true"
                className={`inline-block h-5 w-5 rounded-full bg-[color:var(--color-gray-0)] shadow-[var(--shadow-sm)] transition-transform duration-[var(--transition-fast)] ${
                    isOn ? "translate-x-6" : "translate-x-1"
                }`}
            />
        </button>
    );
}
