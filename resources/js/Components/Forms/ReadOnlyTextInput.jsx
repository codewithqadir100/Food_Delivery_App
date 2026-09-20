import { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

const ReadOnlyTextInput = forwardRef(function ReadOnlyTextInput(
    {
        label,
        value = "",
        error = null,
        required = false,
        helpText = null,
        icon = null,
        placeHolder = "",
        className = "",
        ...props
    },
    ref,
) {
    const hasError = !!error;

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-1.5">
                    {label}
                    {required && (
                        <span className="text-[color:var(--color-danger-600)] ml-0.5">
                            *
                        </span>
                    )}
                </label>
            )}

            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)] pointer-events-none">
                        {icon}
                    </div>
                )}

                <input
                    ref={ref}
                    type="text"
                    placeholder={placeHolder}
                    value={value ?? ""}
                    readOnly
                    aria-readonly="true"
                    aria-invalid={hasError}
                    className={`
            w-full
            px-3 py-2
            text-base
            border rounded-lg
            bg-[color:var(--color-gray-100)]
            text-[color:var(--color-text-primary)]
            placeholder-[color:var(--color-text-muted)]
            transition-all duration-200
            focus:outline-none
            focus:ring-2
            focus:ring-offset-2
            cursor-default
            ${
                hasError
                    ? "border-[color:var(--color-danger-500)] focus:ring-[color:var(--color-danger-300)]"
                    : "border-[color:var(--color-border)] focus:ring-[color:var(--color-primary-300)]"
            }
            ${icon ? "pl-10" : ""}
            ${className}
          `}
                    {...props}
                />
            </div>

            {error && (
                <p className="text-sm text-[color:var(--color-danger-600)] mt-1.5 flex items-center gap-1">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    {error}
                </p>
            )}

            {helpText && !error && (
                <p className="text-sm text-[color:var(--color-text-muted)] mt-1.5">
                    {helpText}
                </p>
            )}
        </div>
    );
});

export default ReadOnlyTextInput;
