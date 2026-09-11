import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export default function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  variant = 'default',
}) {
  const variantStyles = {
    default: 'bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] hover:border-[color:var(--color-primary-300)]',
    primary: 'bg-[color:var(--color-primary-50)] border border-[color:var(--color-primary-200)]',
    success: 'bg-[color:var(--color-success-50)] border border-[color:var(--color-success-200)]',
  };

  const iconBgStyles = {
    default: 'bg-[color:var(--color-gray-100)] text-[color:var(--color-text-secondary)]',
    primary: 'bg-[color:var(--color-primary-100)] text-[color:var(--color-primary-600)]',
    success: 'bg-[color:var(--color-success-100)] text-[color:var(--color-success-600)]',
  };

  return (
    <Link
      href={href}
      className={`
        block p-4 sm:p-5 rounded-lg transition-all duration-200 group
        ${variantStyles[variant]}
        hover:shadow-md active:scale-95
      `}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${iconBgStyles[variant]}`}>
          <Icon size={20} className="sm:w-6 sm:h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-[color:var(--color-text-primary)] mb-1 text-sm sm:text-base truncate">
            {title}
          </h4>
          <p className="text-xs sm:text-sm text-[color:var(--color-text-secondary)] line-clamp-2">
            {description}
          </p>
        </div>

        <ArrowRight
          size={18}
          className="text-[color:var(--color-text-muted)] flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform sm:w-5 sm:h-5"
        />
      </div>
    </Link>
  );
}