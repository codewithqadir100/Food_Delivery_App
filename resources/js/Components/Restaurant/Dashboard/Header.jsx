import { Bell } from "lucide-react";

function RestaurantStatus({ isOpen }) {
    const status = isOpen
        ? {
              label: "Open",
              className:
                  "bg-[color:var(--color-success-100)] text-[color:var(--color-success-700)] border-[color:var(--color-success-200)]",
              dotClassName: "bg-[color:var(--color-success-500)]",
          }
        : {
              label: "Closed",
              className:
                  "bg-[color:var(--color-danger-100)] text-[color:var(--color-danger-700)] border-[color:var(--color-danger-200)]",
              dotClassName: "bg-[color:var(--color-danger-500)]",
          };

    return (
        <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${status.className}`}
        >
            <span className={`h-2 w-2 rounded-full ${status.dotClassName}`} />
            <span>{status.label}</span>
        </div>
    );
}

export default function Header({
    title,
    subtitle,
    isRestaurantOpen = false,
    notificationCount = 0,
    onNotificationsClick,
}) {
    return (
        <header className="border-b border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] px-4 py-5 sm:px-6 sm:py-6 md:px-8">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-xl font-bold text-[color:var(--color-text-primary)] sm:text-2xl">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="truncate mt-1 text-sm text-[color:var(--color-text-secondary)]">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className="hidden shrink-0 items-center gap-3 md:flex">
                    <button
                        type="button"
                        onClick={onNotificationsClick}
                        className="relative rounded-[var(--radius-sm)] p-2.5 text-[color:var(--color-text-secondary)] transition-colors hover:bg-[color:var(--color-bg-tertiary)] hover:text-[color:var(--color-text-primary)]"
                        aria-label="Notifications"
                    >
                        <Bell size={20} />

                        {notificationCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--color-danger-500)] px-1 text-[10px] font-semibold leading-none text-white">
                                {notificationCount > 9
                                    ? "9+"
                                    : notificationCount}
                            </span>
                        )}
                    </button>

                    <RestaurantStatus isOpen={isRestaurantOpen} />
                </div>
            </div>
        </header>
    );
}
