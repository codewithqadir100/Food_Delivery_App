import { forwardRef } from 'react';
import FormLabel from './FormLabel';
import FormError from './FormError';

const TextArea = forwardRef(function TextArea(
  {
    label,
    error = null,
    required = false,
    disabled = false,
    rows = 4,
    placeholder = '',
    className = '',
    ...props
  },
  ref
) {
  return (
    <div className="w-full">
      {label && <FormLabel required={required}>{label}</FormLabel>}

      <textarea
        ref={ref}
        disabled={disabled}
        rows={rows}
        placeholder={placeholder}
        className={`
          w-full
          px-3 py-2
          text-base
          border rounded-lg
          bg-[color:var(--color-bg-primary)]
          text-[color:var(--color-text-primary)]
          placeholder-[color:var(--color-text-muted)]
          transition-all duration-200
          focus:outline-none
          focus:ring-2
          focus:ring-offset-2
          disabled:bg-[color:var(--color-gray-100)]
          disabled:cursor-not-allowed
          disabled:text-[color:var(--color-text-muted)]
          resize-none
          ${
            error
              ? 'border-[color:var(--color-danger-500)] focus:ring-[color:var(--color-danger-300)]'
              : 'border-[color:var(--color-border)] focus:ring-[color:var(--color-primary-300)]'
          }
          ${className}
        `}
        {...props}
      />

      <FormError message={error} />
    </div>
  );
});

export default TextArea;
