import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const TextInput = forwardRef(function TextInput(
  {
    label,
    type = 'text',
    placeholder = '',
    error = null,
    required = false,
    disabled = false,
    helpText = null,
    icon = null,
    className = '',
    ...props
  },
  ref
) {
  const hasError = !!error;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-1.5">
          {label}
          {required && (
            <span className="text-[color:var(--color-danger-600)] ml-0.5">*</span>
          )}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[color:var(--color-text-muted)]">
            {icon}
          </div>
        )}

        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
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
            ${
              hasError
                ? 'border-[color:var(--color-danger-500)] focus:ring-[color:var(--color-danger-300)]'
                : 'border-[color:var(--color-border)] focus:ring-[color:var(--color-primary-300)]'
            }
            ${icon ? 'pl-10' : ''}
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

export default TextInput;