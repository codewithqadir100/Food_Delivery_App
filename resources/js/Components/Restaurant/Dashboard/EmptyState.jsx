import { AlertCircle } from 'lucide-react';

export default function EmptyState({
  title = 'No data available',
  description = 'There is no data to display right now.',
  icon: Icon = AlertCircle,
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-[color:var(--color-gray-100)] p-4 rounded-full mb-4">
        <Icon size={32} className="text-[color:var(--color-text-muted)]" />
      </div>

      <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] mb-2">{title}</h3>
      <p className="text-sm text-[color:var(--color-text-secondary)] text-center max-w-md mb-6">
        {description}
      </p>

      {action && <div>{action}</div>}
    </div>
  );
}