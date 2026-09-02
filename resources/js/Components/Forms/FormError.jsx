import { AlertCircle } from 'lucide-react';

export default function FormError({
  message,
  className = '',
  ...props
}) {
  if (!message) return null;

  return (
    <p
      className={`
        text-sm
        text-[color:var(--color-danger-600)]
        mt-1
        flex items-center gap-1
        ${className}
      `}
      {...props}
    >
      <AlertCircle size={16} className="flex-shrink-0" />
      {message}
    </p>
  );
}