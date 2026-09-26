import { forwardRef, useEffect, useRef } from "react";

const TextInput = forwardRef(function TextInput(
    { type = "text", className = "", isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useEffect(() => {
        if (isFocused) {
            if (ref && typeof ref === "object" && ref.current) {
                ref.current.focus();
            } else if (localRef.current) {
                localRef.current.focus();
            }
        }
    }, [isFocused, ref]);

    return (
        <input
            {...props}
            type={type}
            className={`rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] shadow-sm focus:border-[color:var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-primary-500)] ${className}`}
            ref={ref || localRef}
        />
    );
});

export default TextInput;
