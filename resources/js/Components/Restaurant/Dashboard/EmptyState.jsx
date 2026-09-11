import { AlertCircle } from 'lucide-react';

export default function EmptyState({
  title = 'No data available',
  description = 'There is no data to display right now.',
  icon: Icon = AlertCircle,
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
      <div className="bg-[color:var(--color-gray-100)] p-3 sm:p-4 rounded-full mb-4">
        <Icon size={28} className="sm:w-8 sm:h-8 text-[color:var(--color-text-muted)]" />
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-[color:var(--color-text-primary)] mb-2 text-center">
        {title}
      </h3>
      
      <p className="text-xs sm:text-sm text-[color:var(--color-text-secondary)] text-center max-w-sm mb-6">
        {description}
      </p>

      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  );
}