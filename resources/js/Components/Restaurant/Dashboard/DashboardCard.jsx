export default function DashboardCard({
  title,
  subtitle = null,
  action = null,
  children,
  className = '',
}) {
  return (
    <div className={`bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      {title && (
        <div className="border-b border-[color:var(--color-border-light)] px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">{title}</h3>
            {subtitle && (
              <p className="text-sm text-[color:var(--color-text-secondary)] mt-1">{subtitle}</p>
            )}
          </div>

          {action && <div>{action}</div>}
        </div>
      )}

      {/* Body */}
      <div className="p-6">{children}</div>
    </div>
  );
}