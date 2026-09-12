import { usePage } from '@inertiajs/react';
import { Sidebar, MobileNav, Header } from '@/Components/Restaurant/Dashboard';

export default function RestaurantLayout({
  children,
  restaurantName = '',
  status = 'pending',
  isPending = false,
  onLogout = null,
}) {
  const { url } = usePage();
  const currentRoute = url;

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-secondary)]">
      {/* Desktop Sidebar */}
      <Sidebar currentRoute={currentRoute} isPending={isPending} onLogout={onLogout} />

      <MobileNav currentRoute={currentRoute} isPending={isPending} />

      {/* Main Content */}
      <main className="transition-all duration-300">

        <div className="md:hidden" />

        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <Header restaurantName={restaurantName} status={status} />

          {/* Page Content */}
          <div className="flex-1 p-4 sm:p-6 md:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}