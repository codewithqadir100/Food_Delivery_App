import { Link, usePage } from '@inertiajs/react';
import { 
  Home, Search, Utensils, Heart, Package, BarChart3, Settings,
  ChefHat, Menu as MenuIcon, TrendingUp, Users, AlertCircle
} from 'lucide-react';

export default function Sidebar({ open, onClose }) {
  const { auth } = usePage().props;

  const customerLinks = [
    { href: route('customer.dashboard'), label: 'Home', Icon: Home },
    { href: '/restaurants', label: 'Restaurants', Icon: Utensils },
    { href: '/wishlist', label: 'Wishlist', Icon: Heart },
    { href: '/orders', label: 'My Orders', Icon: Package },
  ];

  const restaurantLinks = [
    { href: route('restaurant.dashboard'), label: 'Dashboard', Icon: BarChart3 },
    { href: route('restaurant.profile.index'), label: 'Restaurant', Icon: ChefHat },
    { href: '/restaurant/menu', label: 'Menu', Icon: MenuIcon },
    { href: '/restaurant/orders', label: 'Orders', Icon: Package },
    { href: '/restaurant/analytics', label: 'Analytics', Icon: TrendingUp },
  ];

  const adminLinks = [
    { href: route('admin.dashboard'), label: 'Dashboard', Icon: BarChart3 },
    { href: '/admin/restaurants', label: 'Restaurants', Icon: ChefHat },
    { href: '/admin/users', label: 'Users', Icon: Users },
    { href: '/admin/analytics', label: 'Analytics', Icon: TrendingUp },
  ];

  let links = [];
  if (auth.user?.is_customer) links = customerLinks;
  else if (auth.user?.is_restaurant_owner) links = restaurantLinks;
  else if (auth.user?.is_admin) links = adminLinks;

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)]
          w-64 bg-[color:var(--color-bg-primary)]
          border-r border-[color:var(--color-border-light)]
          overflow-y-auto
          transition-transform duration-300 ease-in-out
          z-30
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="
                flex items-center gap-3
                px-4 py-2.5
                text-[color:var(--color-text-secondary)]
                hover:text-[color:var(--color-text-primary)]
                hover:bg-[color:var(--color-bg-secondary)]
                rounded-lg
                transition-colors
                text-sm font-medium
              "
            >
              <link.Icon size={20} className="flex-shrink-0" />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Settings Section */}
        <div className="border-t border-[color:var(--color-border-light)] mt-4 pt-4 px-4 space-y-1">
          <Link
            href={route('profile.edit')}
            className="
              flex items-center gap-3
              px-4 py-2.5
              text-[color:var(--color-text-secondary)]
              hover:text-[color:var(--color-text-primary)]
              hover:bg-[color:var(--color-bg-secondary)]
              rounded-lg
              transition-colors
              text-sm font-medium
            "
          >
            <Settings size={20} className="flex-shrink-0" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </>
  );
}