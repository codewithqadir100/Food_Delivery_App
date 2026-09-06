import { useState, useEffect, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { MapPin, ChevronDown, User, ShoppingCart, Heart, Search,
    Menu, X, LogOut, Store, UtensilsCrossed, Home, Package, ClipboardList,
    ChevronRight, } from 'lucide-react';
import Logo from '@/assets/logo.png';
import Button from './Button';
import TextInput from '../Forms/TextInput';

export default function Navbar({ categories = [] }) {
  const { auth } = usePage().props;
  const user = auth?.user;

  const [menuAnimating, setMenuAnimating] = useState(false);
  const [searchAnimating, setSearchAnimating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [restaurantDropdown, setRestaurantDropdown] = useState(false);
  const [categoryDropdown, setCategoryDropdown] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [addressDropdown, setAddressDropdown] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const restaurantRef = useRef(null);
  const categoryRef = useRef(null);
  const profileRef = useRef(null);
  const addressRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (restaurantRef.current && !restaurantRef.current.contains(e.target)) {
        setRestaurantDropdown(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setCategoryDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdown(false);
      }
      if (addressRef.current && !addressRef.current.contains(e.target)) {
        setAddressDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      setMenuAnimating(true);
    } else {
      const timer = setTimeout(() => setMenuAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileSearchOpen) {
      setSearchAnimating(true);
    } else {
      const timer = setTimeout(() => setSearchAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [mobileSearchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.get('/restaurants', { q: searchQuery.trim() });
      setMobileSearchOpen(false);
    }
  };

  const navLinkClass = (active = false) =>
    `text-sm font-medium transition-colors duration-200 ${
      active
        ? 'text-[color:var(--color-primary-600)]'
        : 'text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-primary-600)]'
    }`;

  const dropdownItemClass =
    'block w-full text-left px-4 py-2.5 text-sm text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors';

  return (
    <>
      <header className="bg-[color:var(--color-bg-primary)] border-b border-[color:var(--color-border-light)] sticky top-0 z-[var(--z-fixed)] shadow-sm">
        {/* ===== TOP BAR ===== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Left - Logo + Mobile Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
              >
                <Menu size={22} className="text-[color:var(--color-text-primary)]" />
              </button>

              <Link href="/" className="flex-shrink-0">
                <img src={Logo} alt="FoodHub" className="h-9 w-auto" />
              </Link>
            </div>

            {/* Center - Desktop Only */}
            <div className="hidden md:flex items-center gap-4">
              {/* Address Selector */}
              <div className="relative" ref={addressRef}>
                <button
                  onClick={() => setAddressDropdown(!addressDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                >
                  <MapPin size={18} className="text-[color:var(--color-primary-600)]" />
                  <span className="text-sm text-[color:var(--color-text-primary)] font-medium max-w-[140px] truncate">
                    Select Address
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-[color:var(--color-text-muted)] transition-transform ${
                      addressDropdown ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {addressDropdown && (
                  <div className="absolute left-0 mt-2 w-64 bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border-light)] rounded-xl shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[color:var(--color-border-light)]">
                      <p className="text-xs font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider">
                        Delivery Location
                      </p>
                    </div>
                    <div className="py-1">
                      <button className={dropdownItemClass}>
                        <span className="flex items-center gap-2">
                          <MapPin size={14} className="text-[color:var(--color-primary-600)]" />
                          Add New Address
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* For Restaurants - Only when NOT logged in */}
              {!user && (
                <div className="relative" ref={restaurantRef}>
                  <button
                    onClick={() => setRestaurantDropdown(!restaurantDropdown)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                  >
                    <Store size={18} className="text-[color:var(--color-primary-600)]" />
                    <span className="text-sm font-medium text-[color:var(--color-text-primary)]">
                      For Restaurants
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-[color:var(--color-text-muted)] transition-transform ${
                        restaurantDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {restaurantDropdown && (
                    <div className="absolute left-0 mt-2 w-56 bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border-light)] rounded-xl shadow-lg overflow-hidden z-50">
                      <Link
                        href={route('restaurant.register')}
                        className={dropdownItemClass}
                        onClick={() => setRestaurantDropdown(false)}
                      >
                        <span className="flex items-center gap-2">
                          <Store size={16} />
                          Become Our Partner
                        </span>
                      </Link>
                      <Link
                        href={route('restaurant.login')}
                        className={dropdownItemClass}
                        onClick={() => setRestaurantDropdown(false)}
                      >
                        <span className="flex items-center gap-2">
                          <LogOut size={16} />
                          Restaurant Login
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Spacer Desktop */}
            <div className="hidden md:flex flex-1" />

            {/* Right Side */}
            <div className="flex items-center gap-1">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
              >
                <Search size={20} className="text-[color:var(--color-text-secondary)]" />
              </button>

              {/* Desktop Auth */}
              <div className="hidden md:flex items-center gap-2">
                {user ? (
                  <>
                    <Link
                      href="/cart"
                      className="relative p-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                    >
                      <ShoppingCart size={20} className="text-[color:var(--color-text-secondary)]" />
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[color:var(--color-danger-600)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        0
                      </span>
                    </Link>

                    <Link
                      href={route('customer.wishlist')}
                      className="p-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                    >
                      <Heart size={20} className="text-[color:var(--color-text-secondary)]" />
                    </Link>

                    <div className="relative" ref={profileRef}>
                      <button
                        onClick={() => setProfileDropdown(!profileDropdown)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-[color:var(--color-primary-600)] flex items-center justify-center text-white text-sm font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <ChevronDown
                          size={14}
                          className={`text-[color:var(--color-text-muted)] transition-transform ${
                            profileDropdown ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {profileDropdown && (
                        <div className="absolute right-0 mt-2 w-56 bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border-light)] rounded-xl shadow-lg overflow-hidden z-50">
                          <div className="px-4 py-3 border-b border-[color:var(--color-border-light)]">
                            <p className="text-sm font-semibold text-[color:var(--color-text-primary)] truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-[color:var(--color-text-muted)] truncate">
                              {user.email}
                            </p>
                          </div>
                          <div className="py-1">
                            <Link
                              href={route('customer.profile.index')}
                              className={dropdownItemClass}
                              onClick={() => setProfileDropdown(false)}
                            >
                              <span className="flex items-center gap-2">
                                <User size={16} />
                                My Profile
                              </span>
                            </Link>
                            <Link
                              href={route('customer.history')}
                              className={dropdownItemClass}
                              onClick={() => setProfileDropdown(false)}
                            >
                              <span className="flex items-center gap-2">
                                <ClipboardList size={16} />
                                My Orders
                              </span>
                            </Link>
                            <Link
                              href={route('customer.wishlist')}
                              className={dropdownItemClass}
                              onClick={() => setProfileDropdown(false)}
                            >
                              <span className="flex items-center gap-2">
                                <Heart size={16} />
                                My Wishlist
                              </span>
                            </Link>
                            <Link
                              href={route('customer.addresses')}
                              className={dropdownItemClass}
                              onClick={() => setProfileDropdown(false)}
                            >
                              <span className="flex items-center gap-2">
                                <MapPin size={16} />
                                My Addresses
                              </span>
                            </Link>
                          </div>
                          <div className="border-t border-[color:var(--color-border-light)] py-1">
                            <Link
                              href={route('logout')}
                              method="post"
                              as="button"
                              className={`${dropdownItemClass} text-[color:var(--color-danger-600)]`}
                              onClick={() => setProfileDropdown(false)}
                            >
                              <span className="flex items-center gap-2">
                                <LogOut size={16} />
                                Logout
                              </span>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Link href={route('login')}>
                      <Button variant="secondary" size="sm">
                        Login
                      </Button>
                    </Link>
                    <Link href={route('register')}>
                      <Button variant="primary" size="sm">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile - Profile or Cart */}
              {user ? (
                <Link
                  href="/cart"
                  className="md:hidden relative p-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                >
                  <ShoppingCart size={20} className="text-[color:var(--color-text-secondary)]" />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[color:var(--color-danger-600)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    0
                  </span>
                </Link>
              ) : (
                <Link
                  href={route('login')}
                  className="md:hidden p-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                >
                  <User size={20} className="text-[color:var(--color-text-secondary)]" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ===== BOTTOM BAR - Desktop Only ===== */}
        <div className="hidden md:block border-t border-[color:var(--color-border-light)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center gap-6">
                <Link href="/" className={navLinkClass(route().current('home'))}>
                  <span className="flex items-center gap-1.5">
                    <Home size={16} />
                    Home
                  </span>
                </Link>

                <Link
                  href="/restaurants"
                  className={navLinkClass(route().current('restaurants.*'))}
                >
                  <span className="flex items-center gap-1.5">
                    <UtensilsCrossed size={16} />
                    Restaurants
                  </span>
                </Link>

                <div className="relative" ref={categoryRef}>
                  <button
                    onClick={() => setCategoryDropdown(!categoryDropdown)}
                    className={navLinkClass()}
                  >
                    <span className="flex items-center gap-1.5">
                      <Package size={16} />
                      Order by Categories
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${categoryDropdown ? 'rotate-180' : ''}`}
                      />
                    </span>
                  </button>

                  {categoryDropdown && categories.length > 0 && (
                    <div className="absolute left-0 mt-2 w-56 bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border-light)] rounded-xl shadow-lg overflow-hidden z-50">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/restaurants?category=${cat.slug}`}
                          className={dropdownItemClass}
                          onClick={() => setCategoryDropdown(false)}
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                  {categoryDropdown && categories.length === 0 && (
                    <div className="absolute left-0 mt-2 w-56 bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border-light)] rounded-xl shadow-lg overflow-hidden z-50">
                      <p className="px-4 py-3 text-sm text-[color:var(--color-text-muted)]">
                        No categories available
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSearch} className="relative">
                <TextInput
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search size={16} className="text-[color:var(--color-text-muted)]" />}
                  className="w-64 lg:w-80 [&_input]:rounded-full [&_input]:bg-[color:var(--color-bg-secondary)] [&_input]:border-[color:var(--color-border-light)] [&_input]:py-2 [&_input]:text-sm"
                />
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MOBILE SEARCH OVERLAY ===== */}
      {(mobileSearchOpen || searchAnimating) && (
          <div
            className={`fixed inset-0 z-[var(--z-modal)] transition-opacity duration-200 ${
              mobileSearchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="bg-black/50 backdrop-blur-sm absolute inset-0" onClick={() => setMobileSearchOpen(false)} />
            <div
              className={`relative bg-[color:var(--color-bg-primary)] px-4 py-4 shadow-lg transform transition-transform duration-200 ${
                mobileSearchOpen ? 'translate-y-0' : '-translate-y-4'
              }`}
            >
            <div className="flex items-center gap-3">
              <form onSubmit={handleSearch} className="flex-1">
                <TextInput
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search size={16} className="text-[color:var(--color-text-muted)]" />}
                  className="[&_input]:bg-[color:var(--color-bg-secondary)] [&_input]:rounded-lg [&_input]:py-2.5"
                  autoFocus
                />
              </form>
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="p-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
              >
                <X size={20} className="text-[color:var(--color-text-primary)]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MOBILE MENU OVERLAY ===== */}
      {(mobileMenuOpen || menuAnimating) && (
          <>
            <div
              className={`fixed inset-0 z-[var(--z-modal-backdrop)] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
                mobileMenuOpen ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            />
            <div
              className={`fixed inset-y-0 left-0 z-[var(--z-modal)] w-full max-w-sm bg-[color:var(--color-bg-primary)] shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto ${
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
            {/* Menu Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[color:var(--color-border-light)]">
              <img src={Logo} alt="FoodHub" className="h-8 w-auto" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
              >
                <X size={22} className="text-[color:var(--color-text-primary)]" />
              </button>
            </div>

            <div className="px-4 py-4 space-y-1">
              {/* Main Nav */}
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={20} className="text-[color:var(--color-primary-600)]" />
                <span className="text-sm font-medium">Home</span>
              </Link>
              <Link
                href="/restaurants"
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UtensilsCrossed size={20} className="text-[color:var(--color-primary-600)]" />
                <span className="text-sm font-medium">Restaurants</span>
              </Link>

              {/* Order by Categories - Expandable */}
              <button
                onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                className="flex items-center justify-between w-full px-3 py-3 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
              >
                <span className="flex items-center gap-3">
                  <Package size={20} className="text-[color:var(--color-primary-600)]" />
                  <span className="text-sm font-medium">Order by Categories</span>
                </span>
                <ChevronRight
                  size={16}
                  className={`text-[color:var(--color-text-muted)] transition-transform ${
                    mobileCategoriesOpen ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {mobileCategoriesOpen && (
                <div className="ml-10 space-y-1">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/restaurants?category=${cat.slug}`}
                        className="block px-3 py-2 rounded-lg text-sm text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-[color:var(--color-text-muted)]">
                      No categories available
                    </p>
                  )}
                </div>
              )}

              {/* For Restaurants - Only when NOT logged in */}
              {!user && (
                <>
                  <div className="border-t border-[color:var(--color-border-light)] pt-3 mt-3">
                    <p className="px-3 text-xs font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider mb-2">
                      For Restaurants
                    </p>
                    <Link
                      href={route('restaurant.register')}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Store size={20} className="text-[color:var(--color-primary-600)]" />
                      <span className="text-sm font-medium">Become Our Partner</span>
                    </Link>
                    <Link
                      href={route('restaurant.login')}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogOut size={20} className="text-[color:var(--color-primary-600)]" />
                      <span className="text-sm font-medium">Restaurant Login</span>
                    </Link>
                  </div>
                </>
              )}

              {/* User Section */}
              <div className="border-t border-[color:var(--color-border-light)] pt-3 mt-3">
                {user ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="w-9 h-9 rounded-full bg-[color:var(--color-primary-600)] flex items-center justify-center text-white text-sm font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
                          {user.name}
                        </p>
                        <p className="text-xs text-[color:var(--color-text-muted)]">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href={route('customer.profile.index')}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={18} className="text-[color:var(--color-text-muted)]" />
                      <span className="text-sm font-medium">My Profile</span>
                    </Link>
                    <Link
                      href="/cart"
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShoppingCart size={18} className="text-[color:var(--color-text-muted)]" />
                      <span className="text-sm font-medium">My Cart</span>
                    </Link>
                    <Link
                      href={route('customer.wishlist')}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Heart size={18} className="text-[color:var(--color-text-muted)]" />
                      <span className="text-sm font-medium">My Wishlist</span>
                    </Link>
                    <Link
                      href={route('customer.addresses')}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <MapPin size={18} className="text-[color:var(--color-text-muted)]" />
                      <span className="text-sm font-medium">My Addresses</span>
                    </Link>
                    <Link
                      href={route('logout')}
                      method="post"
                      as="button"
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-[color:var(--color-danger-600)] hover:bg-[color:var(--color-bg-secondary)] transition-colors w-full text-left"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogOut size={18} />
                      <span className="text-sm font-medium">Logout</span>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-3 pt-2">
                    <Link href={route('login')} className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="secondary" size="sm" fullWidth>
                        Login
                      </Button>
                    </Link>
                    <Link href={route('register')} className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" size="sm" fullWidth>
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}