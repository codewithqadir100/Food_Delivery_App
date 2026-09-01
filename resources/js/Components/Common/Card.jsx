export default function Card({
  children,
  header,
  footer,
  padding = 'md',
  shadow = true,
  className = '',
  ...props
}) {
  const paddingSizes = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    none: 'p-0',
  };

  return (
    <div
      className={`
        rounded-lg
        bg-[color:var(--color-bg-primary)]
        border border-[color:var(--color-border-light)]
        transition-all duration-200
        ${shadow ? 'shadow-md hover:shadow-lg' : ''}
        ${className}
      `}
      {...props}
    >
      {header && (
        <div
          className={`
            border-b border-[color:var(--color-border-light)]
            ${paddingSizes[padding]}
          `}
        >
          {header}
        </div>
      )}

      <div className={paddingSizes[padding]}>
        {children}
      </div>

      {footer && (
        <div
          className={`
            border-t border-[color:var(--color-border-light)]
            ${paddingSizes[padding]}
          `}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
