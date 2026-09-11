import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useState } from 'react';

export default function Alert({
  type = 'info',
  title,
  message,
  closeable = true,
  onClose,
  className = '',
  ...props
}) {
  const [isVisible, setIsVisible] = useState(true);

  const styles = {
    success: {
      bg: 'bg-[color:var(--color-success-50)]',
      border: 'border-[color:var(--color-success-300)]',
      text: 'text-[color:var(--color-success-800)]',
      Icon: CheckCircle2,
    },
    error: {
      bg: 'bg-[color:var(--color-danger-50)]',
      border: 'border-[color:var(--color-danger-300)]',
      text: 'text-[color:var(--color-danger-800)]',
      Icon: AlertCircle,
    },
    warning: {
      bg: 'bg-[color:var(--color-warning-50)]',
      border: 'border-[color:var(--color-warning-300)]',
      text: 'text-[color:var(--color-warning-800)]',
      Icon: AlertTriangle,
    },
    info: {
      bg: 'bg-[color:var(--color-primary-50)]',
      border: 'border-[color:var(--color-primary-300)]',
      text: 'text-[color:var(--color-primary-800)]',
      Icon: Info,
    },
  };

  const style = styles[type] || styles.info;

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        rounded-lg border p-4 animate-fadeIn
        ${style.bg}
        ${style.border}
        ${style.text}
        ${className}
      `}
      {...props}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <style.Icon size={20} />
        </div>
        
        <div className="flex-1 min-w-0">
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          {message && <p className="text-sm line-clamp-2">{message}</p>}
        </div>
        
        {closeable && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 opacity-75 hover:opacity-100 transition-opacity p-1 -mr-1"
            aria-label="Close alert"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}