export default function Badge({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  ...props
}) {
  const variants = {
    default: 'bg-[color:var(--color-gray-200)] text-[color:var(--color-text-primary)]',
    primary: 'bg-[color:var(--color-primary-100)] text-[color:var(--color-primary-800)]',
    success: 'bg-[color:var(--color-success-100)] text-[color:var(--color-success-800)]',
    danger: 'bg-[color:var(--color-danger-100)] text-[color:var(--color-danger-800)]',
    warning: 'bg-[color:var(--color-warning-100)] text-[color:var(--color-warning-800)]',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1
        font-medium
        rounded-full
        ${variants[variant] || variants.default}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}
