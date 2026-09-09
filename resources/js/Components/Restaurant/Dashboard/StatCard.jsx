export default function StatCard({
  title,
  value,
  icon: Icon,
  trend = null,
  trendLabel = '',
  loading = false,
}) {
  const trendColor = trend > 0 ? 'text-[color:var(--color-success-600)]' : 'text-[color:var(--color-danger-600)]';
  const trendBg = trend > 0 ? 'bg-[color:var(--color-success-100)]' : 'bg-[color:var(--color-danger-100)]';

  return (
    <div className="bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[color:var(--color-text-secondary)] mb-2">{title}</p>

          {loading ? (
            <div className="h-8 bg-[color:var(--color-gray-200)] rounded animate-pulse w-24" />
          ) : (
            <p className="text-2xl font-bold text-[color:var(--color-text-primary)]">{value}</p>
          )}

          {trend !== null && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendColor}`}>
              <span>{trend > 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}% {trendLabel}</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className={`${trendBg} p-3 rounded-lg text-[color:var(--color-primary-600)]`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
}