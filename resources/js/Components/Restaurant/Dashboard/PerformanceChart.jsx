export default function PerformanceChart({ data = [], loading = false }) {
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="h-32 bg-[color:var(--color-gray-200)] rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-[color:var(--color-text-secondary)]">
        <p>No data available for chart</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = Math.min(...data.map((d) => d.value), 0);
  const range = maxValue - minValue || 1;

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map((item, index) => {
          const percentage = ((item.value - minValue) / range) * 100;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t bg-[color:var(--color-primary-500)] transition-all duration-300 hover:bg-[color:var(--color-primary-600)]"
                style={{ height: `${Math.max(percentage, 5)}%` }}
                title={`${item.label}: ${item.value}`}
              />
              <span className="text-xs text-[color:var(--color-text-secondary)] text-center whitespace-nowrap">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-[color:var(--color-text-secondary)] border-t border-[color:var(--color-border-light)] pt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[color:var(--color-primary-500)]" />
          <span>Orders</span>
        </div>
      </div>
    </div>
  );
}