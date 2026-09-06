import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import FormLabel from './FormLabel';
import FormError from './FormError';

const PasswordInput = forwardRef(function PasswordInput(
  {
    label,
    error = null,
    required = false,
    disabled = false,
    placeholder = '••••••••',
    className = '',
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const hasError = !!error;

  return (
    <div className="w-full">
      {label && <FormLabel required={required}>{label}</FormLabel>}

      <div className="relative">
        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full
            px-3 py-2 pl-10 pr-10
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
            ${className}
          `}
          autoComplete="off"
          {...props}
        />

        <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[color:var(--color-text-muted)]" />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] transition-colors"
          tabIndex="-1"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {error && (
        <p className="text-sm text-[color:var(--color-danger-600)] mt-1.5 flex items-center gap-1">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
});

export default PasswordInput;