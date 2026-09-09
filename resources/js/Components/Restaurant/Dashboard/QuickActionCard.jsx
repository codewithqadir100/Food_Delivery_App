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
        block p-5 rounded-lg transition-all duration-200
        ${variantStyles[variant]}
        hover:shadow-md
      `}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg flex-shrink-0 ${iconBgStyles[variant]}`}>
          <Icon size={24} />
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-[color:var(--color-text-primary)] mb-1">{title}</h4>
          <p className="text-sm text-[color:var(--color-text-secondary)]">{description}</p>
        </div>

        <ArrowRight
          size={20}
          className="text-[color:var(--color-text-muted)] flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform"
        />
      </div>
    </Link>
  );
}