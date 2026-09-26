import { forwardRef } from "react";
import FormLabel from "./FormLabel";
import FormError from "./FormError";

const SelectInput = forwardRef(function SelectInput(
    {
        label,
        options = [],
        error = null,
        required = false,
        disabled = false,
        placeholder = "Select an option",
        className = "",
        children,
        ...props
    },
    ref,
) {
    return (
        <div className="w-full">
            {label && <FormLabel required={required}>{label}</FormLabel>}

            <select
                ref={ref}
                disabled={disabled}
                className={`
                    w-full
                    px-3 py-2
                    text-base
                    border rounded-lg
                    bg-[color:var(--color-bg-primary)]
                    text-[color:var(--color-text-primary)]
                    transition-all duration-200
                    focus:outline-none
                    focus:ring-2
                    focus:ring-offset-2
                    disabled:bg-[color:var(--color-gray-100)]
                    disabled:cursor-not-allowed
                    ${
                        error
                            ? "border-[color:var(--color-danger-500)] focus:ring-[color:var(--color-danger-300)]"
                            : "border-[color:var(--color-border)] focus:ring-[color:var(--color-primary-300)]"
                    }
                    ${className}
                `}
                {...props}
            >
                <option value="">{placeholder}</option>

                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}

                {children}
            </select>

            <FormError message={error} />
        </div>
    );
});

export default SelectInput;
