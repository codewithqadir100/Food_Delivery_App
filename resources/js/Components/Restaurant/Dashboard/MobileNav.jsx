import { Link } from '@inertiajs/react';
import {
  LayoutDashboard,
  Menu,
  ShoppingCart,
  BarChart3,
  MoreHorizontal,
  Settings,
  User,
  LogOut,
  X,
} from 'lucide-react';
import { useState } from 'react';
import Logo from '@/assets/logo.png';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/restaurant/dashboard',
    key: 'dashboard',
  },
  {
    label: 'Menu',
    icon: Menu,
    href: '/restaurant/menu',
    key: 'menu',
  },
  {
    label: 'Orders',
    icon: ShoppingCart,
    href: '/restaurant/orders',
    key: 'orders',
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    href: '/restaurant/analytics',
    key: 'analytics',
  },
];

export default function MobileNav({ currentRoute = 'dashboard', isPending = false, onLogout = null }) {
  const [showMore, setShowMore] = useState(false);

  const isActive = (routeKey) => currentRoute.includes(routeKey);

  const handleLogout = () => {
    setShowMore(false);
    onLogout?.();
  };

  return (
    <>
      {/* Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[color:var(--color-bg-primary)] border-b border-[color:var(--color-border)] flex items-center justify-between px-4 z-40">
        {/* Logo */}
        <Link href="/restaurant/dashboard" className="flex items-center">
          <img src={Logo} alt="FoodHub" className="h-8 w-auto" />
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Settings */}
          <Link
            href="/restaurant/settings"
            className="p-2 hover:bg-[color:var(--color-gray-100)] rounded-lg transition-colors"
            title="Settings"
          >
            <Settings size={20} className="text-[color:var(--color-text-secondary)]" />
          </Link>

          {/* Profile */}
          <Link
            href="/restaurant/profile"
            className="p-2 hover:bg-[color:var(--color-gray-100)] rounded-lg transition-colors"
            title="Profile"
          >
            <User size={20} className="text-[color:var(--color-text-secondary)]" />
          </Link>

          {/* More Options */}
          <button
            onClick={() => setShowMore(!showMore)}
            className="p-2 hover:bg-[color:var(--color-gray-100)] rounded-lg transition-colors relative"
            title="More options"
          >
            <MoreHorizontal size={20} className="text-[color:var(--color-text-secondary)]" />

            {/* More Dropdown */}
            {showMore && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMore(false)} />

                <div className="absolute right-0 top-12 bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] rounded-lg shadow-lg z-40 w-40">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[color:var(--color-danger-600)] hover:bg-[color:var(--color-danger-50)] transition-colors rounded-lg"
                  >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[color:var(--color-bg-primary)] border-t border-[color:var(--color-border)] flex items-center justify-around z-40 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.key);
          const disabled = isPending && item.key !== 'dashboard';

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg flex-1
                transition-all duration-200
                ${
                  disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : active
                      ? 'text-[color:var(--color-primary-600)] bg-[color:var(--color-primary-100)]'
                      : 'text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-gray-100)]'
                }
              `}
              title={item.label}
              onClick={(e) => disabled && e.preventDefault()}
            >
              <Icon size={24} />
              <span className="text-xs font-medium truncate max-w-[60px]">{item.label}</span>
            </Link>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setShowMore(!showMore)}
          className={`
            flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg flex-1
            transition-all duration-200
            ${showMore ? 'text-[color:var(--color-primary-600)] bg-[color:var(--color-primary-100)]' : 'text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-gray-100)]'}
          `}
          title="More options"
        >
          <MoreHorizontal size={24} />
          <span className="text-xs font-medium">More</span>
        </button>
      </nav>

      {/* Spacers for fixed elements */}
      <div className="md:hidden h-14 w-full" /> {/* Top bar spacer */}
      <div className="md:hidden h-16 w-full" /> {/* Bottom nav spacer */}
    </>
  );
}