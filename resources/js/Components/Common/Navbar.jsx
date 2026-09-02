import { useState } from 'react';
import Logo from '@/assets/logo.png';
import { Link, usePage } from '@inertiajs/react';
import Button from './Button';
import { Menu, X, ChevronDown, LogOut } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { auth } = usePage().props;

  return (
    <nav className="bg-[color:var(--color-bg-primary)] border-b border-[color:var(--color-border-light)] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={Logo} className="h-14" alt="" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {auth.user ? (
              <>
                {auth.user.is_customer && (
                  <>
                    <Link
                      href={route('customer.dashboard')}
                      className="text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] transition-colors"
                    >
                      Browse
                    </Link>
                    <Link
                      href="/cart"
                      className="text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] transition-colors"
                    >
                      Cart
                    </Link>
                  </>
                )}
                {auth.user.is_restaurant_owner && (
                  <>
                    <Link
                      href={route('restaurant.dashboard')}
                      className="text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href={route('restaurant.profile.index')}
                      className="text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] transition-colors"
                    >
                      Restaurant
                    </Link>
                  </>
                )}
                {auth.user.is_admin && (
                  <Link
                    href={route('admin.dashboard')}
                    className="text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href={route('login')}
                  className="text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] transition-colors"
                >
                  Browse
                </Link>
              </>
            )}
          </div>

          {/* Right Side - User Menu or Auth Links */}
          <div className="flex items-center gap-4">
            {auth.user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[color:var(--color-primary-600)] flex items-center justify-center text-white text-sm font-semibold">
                    {auth.user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-[color:var(--color-text-primary)]">
                    {auth.user.name}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-[color:var(--color-text-secondary)] transition-transform ${
                      userMenuOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border-light)] rounded-lg shadow-lg overflow-hidden z-50">
                    <Link
                      href={route('profile.edit')}
                      className="block px-4 py-2 text-sm text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      href={route('logout')}
                      method="post"
                      as="button"
                      className="w-full text-left px-4 py-2 text-sm text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors border-t border-[color:var(--color-border-light)] flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href={route('login')}>
                  <Button variant="secondary" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href={route('register')}>
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
            >
              {mobileMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[color:var(--color-bg-secondary)] border-t border-[color:var(--color-border-light)] py-4">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            {auth.user ? (
              <>
                {auth.user.is_customer && (
                  <>
                    <Link
                      href={route('customer.dashboard')}
                      className="block px-3 py-2 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-primary)]"
                    >
                      Browse
                    </Link>
                    <Link
                      href="/cart"
                      className="block px-3 py-2 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-primary)]"
                    >
                      Cart
                    </Link>
                  </>
                )}
                {auth.user.is_restaurant_owner && (
                  <>
                    <Link
                      href={route('restaurant.dashboard')}
                      className="block px-3 py-2 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-primary)]"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href={route('restaurant.profile.index')}
                      className="block px-3 py-2 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-primary)]"
                    >
                      Restaurant
                    </Link>
                  </>
                )}
              </>
            ) : (
              <Link
                href={route('login')}
                className="block px-3 py-2 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-primary)]"
              >
                Browse
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}