import { Link } from '@inertiajs/react';
import { LayoutDashboard, Menu, ShoppingCart, BarChart3, Settings, User, LogOut, ChevronDown } from 'lucide-react';
import SidebarItem from './SidebarItem';
import { useState } from 'react';
import Logo from '@/assets/logo.png';

const MENU_ITEMS = [
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
    disabled: false,
  },
  {
    label: 'Orders',
    icon: ShoppingCart,
    href: '/restaurant/orders',
    key: 'orders',
    badge: null,
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    href: '/restaurant/analytics',
    key: 'analytics',
  },
];

const FOOTER_ITEMS = [
  {
    label: 'Profile',
    icon: User,
    href: '/restaurant/profile',
    key: 'profile',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/restaurant/settings',
    key: 'settings',
  },
];

export default function Sidebar({ currentRoute = 'dashboard', isPending = false, onLogout = null }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (routeKey) => currentRoute.includes(routeKey);

  return (
    <aside
      className={`
        hidden md:fixed md:left-0 md:top-0 md:h-screen md:bg-[color:var(--color-bg-primary)] md:border-r md:border-[color:var(--color-border)]
        md:transition-all md:duration-300 md:z-40 md:flex md:flex-col
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[color:var(--color-border)]">
        {!isCollapsed && (
          <Link href="/restaurant/dashboard" className="flex items-center">
            <img src={Logo} alt="FoodHub" className="h-8 w-auto" />
          </Link>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-[color:var(--color-gray-100)] rounded-lg transition-colors flex-shrink-0"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          <ChevronDown size={20} className={`transition-transform ${isCollapsed ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {MENU_ITEMS.map((item) => (
          <div key={item.key} title={isCollapsed ? item.label : ''}>
            <SidebarItem
              href={item.href}
              label={isCollapsed ? '' : item.label}
              icon={item.icon}
              isActive={isActive(item.key)}
              badge={item.badge}
              disabled={isPending && item.key !== 'dashboard'}
            />
          </div>
        ))}
      </nav>

      {/* Footer Items */}
      <div className="border-t border-[color:var(--color-border)] px-2 py-4 space-y-2">
        {FOOTER_ITEMS.map((item) => (
          <div key={item.key} title={isCollapsed ? item.label : ''}>
            <SidebarItem
              href={item.href}
              label={isCollapsed ? '' : item.label}
              icon={item.icon}
              isActive={isActive(item.key)}
            />
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={onLogout}
          className={`
            w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
            text-[color:var(--color-danger-600)] hover:bg-[color:var(--color-danger-50)]
          `}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}