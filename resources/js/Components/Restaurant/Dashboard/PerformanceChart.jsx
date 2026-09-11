import { useState } from 'react';

export default function PerformanceChart({ data = [], loading = false }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (loading) {
    return (
      <div className="h-48 sm:h-64 flex items-center justify-center">
        <div className="text-center w-full space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-[color:var(--color-gray-200)] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-48 sm:h-64 flex items-center justify-center text-[color:var(--color-text-secondary)]">
        <p className="text-sm sm:text-base">No data available for chart</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = Math.min(...data.map((d) => d.value), 0);
  const range = maxValue - minValue || 1;

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="flex items-end justify-between gap-1 sm:gap-2 h-40 sm:h-56">
        {data.map((item, index) => {
          const percentage = ((item.value - minValue) / range) * 100;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setHoveredIndex(isHovered ? null : index)}
              title={`${item.label}: ${item.value}`}
            >
              <div className="w-full relative flex items-end justify-center h-full">
                <div
                  className={`
                    w-full rounded-t transition-all duration-300
                    ${isHovered ? 'bg-[color:var(--color-primary-600)]' : 'bg-[color:var(--color-primary-500)]'}
                  `}
                  style={{ height: `${Math.max(percentage, 5)}%` }}
                />

                {isHovered && (
                  <div className="absolute -top-8 bg-[color:var(--color-text-primary)] text-white px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                    {item.value}
                  </div>
                )}
              </div>

              <span className="text-xs text-[color:var(--color-text-secondary)] text-center line-clamp-2 mt-1 w-full px-1">
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