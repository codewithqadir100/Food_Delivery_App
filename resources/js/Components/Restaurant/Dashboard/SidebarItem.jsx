import { Link } from '@inertiajs/react';

export default function SidebarItem({
  href,
  label,
  icon: Icon,
  isActive = false,
  badge = null,
  disabled = false,
}) {
  if (disabled) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 text-[color:var(--color-text-muted)] opacity-50 cursor-not-allowed">
        {Icon && <Icon size={20} />}
        <span className="text-sm font-medium">{label}</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative
        ${
          isActive
            ? 'bg-[color:var(--color-primary-100)] text-[color:var(--color-primary-600)] font-semibold'
            : 'text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-gray-100)]'
        }
      `}
    >
      {Icon && <Icon size={20} />}
      <span className="text-sm font-medium flex-1">{label}</span>

      {badge && (
        <span className="bg-[color:var(--color-danger-500)] text-white text-xs rounded-full px-2 py-1">
          {badge}
        </span>
      )}
    </Link>
  );
}