export default function FormLabel({
  htmlFor,
  required = false,
  children,
  className = '',
  ...props
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`
        block
        text-sm
        font-medium
        text-[color:var(--color-text-primary)]
        mb-1.5
        ${className}
      `}
      {...props}
    >
      {children}
      {required && (
        <span className="text-[color:var(--color-danger-600)] ml-0.5">*</span>
      )}
    </label>
  );
}
