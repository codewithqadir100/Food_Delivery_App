import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending Approval',
    icon: AlertCircle,
    bgColor: 'bg-[color:var(--color-warning-100)]',
    textColor: 'text-[color:var(--color-warning-600)]',
    borderColor: 'border-[color:var(--color-warning-200)]',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    bgColor: 'bg-[color:var(--color-success-100)]',
    textColor: 'text-[color:var(--color-success-600)]',
    borderColor: 'border-[color:var(--color-success-200)]',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    bgColor: 'bg-[color:var(--color-danger-100)]',
    textColor: 'text-[color:var(--color-danger-600)]',
    borderColor: 'border-[color:var(--color-danger-200)]',
  },
};

export default function StatusBadge({ status = 'pending', className = '' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm
        ${config.bgColor}
        ${config.textColor}
        ${config.borderColor}
        ${className}
      `}
    >
      <Icon size={16} className="flex-shrink-0" />
      <span className="font-medium truncate">{config.label}</span>
    </div>
  );
}