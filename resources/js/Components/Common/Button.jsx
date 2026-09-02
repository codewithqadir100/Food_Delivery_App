export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  icon: Icon = null,
  iconPosition = 'left',
  children,
  className = '',
  fullWidth = false,
  ...props
}) {
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-[color:var(--color-primary-600)]
      text-white
      hover:bg-[color:var(--color-primary-700)]
      focus:ring-[color:var(--color-primary-500)]
      disabled:bg-[color:var(--color-primary-600)]
    `,
    secondary: `
      bg-[color:var(--color-gray-100)]
      text-[color:var(--color-text-primary)]
      hover:bg-[color:var(--color-gray-200)]
      focus:ring-[color:var(--color-gray-300)]
      border border-[color:var(--color-border-light)]
    `,
    danger: `
      bg-[color:var(--color-danger-600)]
      text-white
      hover:bg-[color:var(--color-danger-700)]
      focus:ring-[color:var(--color-danger-500)]
      disabled:bg-[color:var(--color-danger-600)]
    `,
    ghost: `
      text-[color:var(--color-primary-600)]
      hover:bg-[color:var(--color-primary-50)]
      focus:ring-[color:var(--color-primary-200)]
    `,
    success: `
      bg-[color:var(--color-success-600)]
      text-white
      hover:bg-[color:var(--color-success-700)]
      focus:ring-[color:var(--color-success-500)]
      disabled:bg-[color:var(--color-success-600)]
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${widthClass}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {Icon && iconPosition === 'left' && (
        <Icon size={16} className="flex-shrink-0" />
      )}
      
      {children}
      
      {Icon && iconPosition === 'right' && (
        <Icon size={16} className="flex-shrink-0" />
      )}
    </button>
  );
}