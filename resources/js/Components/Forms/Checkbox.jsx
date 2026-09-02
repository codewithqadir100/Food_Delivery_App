import { forwardRef } from 'react';

const Checkbox = forwardRef(function Checkbox(
  { 
    className = '',
    disabled = false,
    ...props 
  },
  ref
) {
  return (
    <input
      {...props}
      ref={ref}
      type="checkbox"
      disabled={disabled}
      className={`
        w-4 h-4
        rounded-[var(--radius-sm)]
        border border-[color:var(--color-border)]
        bg-[color:var(--color-bg-primary)]
        text-[color:var(--color-primary-600)]
        cursor-pointer
        transition-all duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-[color:var(--color-primary-500)]
        focus:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-50
        accent-[color:var(--color-primary-600)]
        ${className}
      `}
    />
  );
});

export default Checkbox;