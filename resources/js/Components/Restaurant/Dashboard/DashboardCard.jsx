export default function DashboardCard({
  title,
  subtitle = null,
  action = null,
  children,
  className = '',
}) {
  return (
    <div className={`bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      {title && (
        <div className="border-b border-[color:var(--color-border-light)] px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-[color:var(--color-text-primary)] truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[color:var(--color-text-secondary)] mt-1 line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>

          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}

      {/* Body */}
      <div className="p-4 sm:p-6 overflow-auto">{children}</div>
    </div>
  );
}