import StatusBadge from './StatusBadge';

export default function Header({
  restaurantName,
  status = 'pending',
  greeting = "Welcome back",
  subtitle = null,
}) {
  return (
    <div className="bg-[color:var(--color-bg-primary)] border-b border-[color:var(--color-border)] px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col gap-4">
        {/* Top Section */}
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[color:var(--color-text-primary)]">
            {greeting}
          </h1>
          <p className="text-xs sm:text-sm text-[color:var(--color-text-secondary)] mt-1">
            {subtitle || `Manage your restaurant operations`}
          </p>
        </div>

        {/* Bottom Section - Restaurant Info and Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs text-[color:var(--color-text-secondary)]">Restaurant</p>
            <p className="text-sm sm:text-base font-semibold text-[color:var(--color-text-primary)] truncate">
              {restaurantName}
            </p>
          </div>

          <StatusBadge status={status} className="w-fit" />
        </div>
      </div>
    </div>
  );
}