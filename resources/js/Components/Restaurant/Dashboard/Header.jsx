import StatusBadge from './StatusBadge';

export default function Header({
  restaurantName,
  status = 'pending',
  greeting = "Welcome back",
  subtitle = null,
}) {
  return (
    <div className="bg-[color:var(--color-bg-primary)] border-b border-[color:var(--color-border)] px-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[color:var(--color-text-primary)]">
            {greeting}
          </h1>
          <p className="text-[color:var(--color-text-secondary)] mt-1">
            {subtitle || `Manage your restaurant operations`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <p className="text-sm text-[color:var(--color-text-secondary)]">Restaurant</p>
            <p className="text-lg font-semibold text-[color:var(--color-text-primary)]">{restaurantName}</p>
          </div>

          <StatusBadge status={status} />
        </div>
      </div>
    </div>
  );
}