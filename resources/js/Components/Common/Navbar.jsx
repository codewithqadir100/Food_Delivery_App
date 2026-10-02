import { useState, useEffect, useRef } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
    MapPin,
    ChevronDown,
    User,
    ShoppingCart,
    Heart,
    Search,
    Menu,
    X,
    LogOut,
    Store,
    UtensilsCrossed,
    Home,
    Package,
    ClipboardList,
    LayoutDashboard,
} from "lucide-react";
import Logo from "@/assets/logo.png";
import Button from "./Button";
import Modal from "./Modal";
import NavbarMobileMenu from "./NavbarMobileMenu";
import TextInput from "../Forms/TextInput";

function CartIconLink({ count, className = "" }) {
    return (
        <Link
            href={route("customer.cart.index")}
            aria-label="Cart"
            className={`relative rounded-lg p-2 transition-colors hover:bg-[color:var(--color-bg-secondary)] ${className}`}
        >
            <ShoppingCart
                size={20}
                className="text-[color:var(--color-text-secondary)]"
            />
            {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--color-danger-600)] text-[10px] font-bold text-white">
                    {count > 9 ? "9+" : count}
                </span>
            )}
        </Link>
    );
}

function RestaurantLogoMark({ src, className = "" }) {
    if (src) {
        return (
            <img
                src={src}
                className={`h-8 aspect-square rounded-[var(--radius-full)] object-cover ${className}`}
                alt="Restaurant Logo"
                loading="lazy"
            />
        );
    }

    return (
        <span
            className={`flex h-8 w-8 items-center justify-center rounded-[var(--radius-full)] bg-[color:var(--color-bg-tertiary)] text-[color:var(--color-text-secondary)] ${className}`}
            aria-hidden="true"
        >
            <User size={18} />
        </span>
    );
}

export default function Navbar({ categories = [], RestaurantLogo }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isRestaurant = user?.role === "restaurant_owner";
    const isAdminUser = user?.role === "admin";
    const isCustomer = user?.role === "customer";
    const cartCount = auth?.cart?.count ?? 0;
    const hasFavourites = Boolean(auth?.wishlist?.has_items);
    const restaurant = auth?.restaurant;
    const customer = auth?.customer;

    const restaurantLocation = [
        restaurant?.street_address,
        restaurant?.area_name,
        restaurant?.city_name,
    ]
        .filter(Boolean)
        .join(", ");

    const customerLocation = [
        customer?.street_address,
        customer?.area_name,
        customer?.city_name,
    ]
        .filter(Boolean)
        .join(", ");

    const location = user?.is_restaurant_owner
        ? restaurantLocation
        : user?.is_customer
          ? customerLocation
          : "";

    const [menuAnimating, setMenuAnimating] = useState(false);
    const [searchAnimating, setSearchAnimating] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [restaurantDropdown, setRestaurantDropdown] = useState(false);
    const [categoryDropdown, setCategoryDropdown] = useState(false);
    const [profileDropdown, setProfileDropdown] = useState(false);
    const [addressDropdown, setAddressDropdown] = useState(false);
    const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [logoutProcessing, setLogoutProcessing] = useState(false);

    const restaurantRef = useRef(null);
    const categoryRef = useRef(null);
    const profileRef = useRef(null);
    const addressRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                restaurantRef.current &&
                !restaurantRef.current.contains(e.target)
            ) {
                setRestaurantDropdown(false);
            }
            if (
                categoryRef.current &&
                !categoryRef.current.contains(e.target)
            ) {
                setCategoryDropdown(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileDropdown(false);
            }
            if (addressRef.current && !addressRef.current.contains(e.target)) {
                setAddressDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
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
            router.get("/restaurants", { q: searchQuery.trim() });
            setMobileSearchOpen(false);
        }
    };

    const handleLogout = () => {
        setLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        setLogoutProcessing(true);

        router.post(
            route("logout"),
            {},
            {
                onSuccess: () => {
                    setLogoutModalOpen(false);
                    setLogoutProcessing(false);
                },
                onError: () => {
                    setLogoutProcessing(false);
                },
            },
        );
    };

    const navLinkClass = (active = false) =>
        `text-sm font-medium transition-colors duration-200 ${
            active
                ? "text-[color:var(--color-primary-600)]"
                : "text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-primary-600)]"
        }`;

    const dropdownItemClass =
        "block w-full text-left px-4 py-2.5 text-sm text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors";

    return (
        <>
            <div className="relative z-[var(--z-modal)]">
                <Modal
                    isOpen={logoutModalOpen}
                    onClose={() => {
                        if (!logoutProcessing) {
                            setLogoutModalOpen(false);
                        }
                    }}
                    title="Log out?"
                    closeButton={!logoutProcessing}
                    footer={
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => setLogoutModalOpen(false)}
                                disabled={logoutProcessing}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="danger"
                                loading={logoutProcessing}
                                onClick={confirmLogout}
                            >
                                Logout
                            </Button>
                        </>
                    }
                >
                    <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
                        Are you sure you want to log out of your account?
                    </p>
                </Modal>
            </div>
            <header className="bg-[color:var(--color-bg-primary)] border-b border-[color:var(--color-border-light)] sticky top-0 z-[var(--z-navbar)] shadow-sm">
                {/* ===== TOP BAR ===== */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-3">
                        {/* Left - Logo + Mobile Toggle */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="md:hidden p-2 -ml-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                            >
                                <Menu
                                    size={22}
                                    className="text-[color:var(--color-text-primary)]"
                                />
                            </button>

                            <Link
                                href={route("home")}
                                className="flex-shrink-0"
                            >
                                <img
                                    src={Logo}
                                    alt="FoodHub"
                                    className="h-9 w-auto"
                                    loading="lazy"
                                />
                            </Link>
                        </div>

                        {/* Center - Desktop Only */}
                        <div className="hidden md:flex items-center gap-4">
                            {/* Address Selector */}
                            <div className="hidden md:flex items-center gap-4">
                                {!user ? (
                                    <Link
                                        href={route("login")}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                                    >
                                        <MapPin
                                            size={18}
                                            className="text-[color:var(--color-primary-600)]"
                                        />

                                        <span className="text-sm text-[color:var(--color-text-primary)] font-medium max-w-[180px] truncate">
                                            Add Address
                                        </span>
                                    </Link>
                                ) : isRestaurant && !restaurantLocation ? (
                                    <Link
                                        href={route("restaurant.profile.edit")}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                                    >
                                        <MapPin
                                            size={18}
                                            className="text-[color:var(--color-primary-600)]"
                                        />

                                        <span className="text-sm text-[color:var(--color-text-primary)] font-medium max-w-[180px] truncate">
                                            Add Address
                                        </span>
                                    </Link>
                                ) : isCustomer && !customerLocation ? (
                                    <Link
                                        href={route(
                                            "customer.addresses.create",
                                        )}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                                    >
                                        <MapPin
                                            size={18}
                                            className="text-[color:var(--color-primary-600)]"
                                        />

                                        <span className="text-sm text-[color:var(--color-text-primary)] font-medium max-w-[180px] truncate">
                                            Add Address
                                        </span>
                                    </Link>
                                ) : !isAdminUser && location ? (
                                    <div className="flex items-center gap-2 px-3 py-2">
                                        <MapPin
                                            size={18}
                                            className="text-[color:var(--color-primary-600)]"
                                        />

                                        <span className="text-sm text-[color:var(--color-text-primary)] font-medium max-w-[180px] truncate">
                                            {location}
                                        </span>
                                    </div>
                                ) : null}
                            </div>

                            {!user && (
                                <div className="relative" ref={restaurantRef}>
                                    <button
                                        onClick={() =>
                                            setRestaurantDropdown(
                                                !restaurantDropdown,
                                            )
                                        }
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                                    >
                                        <Store
                                            size={18}
                                            className="text-[color:var(--color-primary-600)]"
                                        />
                                        <span className="text-sm font-medium text-[color:var(--color-text-primary)]">
                                            For Restaurants
                                        </span>
                                        <ChevronDown
                                            size={14}
                                            className={`text-[color:var(--color-text-muted)] transition-transform ${
                                                restaurantDropdown
                                                    ? "rotate-180"
                                                    : ""
                                            }`}
                                        />
                                    </button>

                                    {restaurantDropdown && (
                                        <div className="absolute left-0 mt-2 w-56 bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border-light)] rounded-xl shadow-lg overflow-hidden z-50">
                                            <Link
                                                href={route(
                                                    "restaurant.register",
                                                )}
                                                className={dropdownItemClass}
                                                onClick={() =>
                                                    setRestaurantDropdown(false)
                                                }
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Store size={16} />
                                                    Become Our Partner
                                                </span>
                                            </Link>
                                            <Link
                                                href={route("restaurant.login")}
                                                className={dropdownItemClass}
                                                onClick={() =>
                                                    setRestaurantDropdown(false)
                                                }
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
                                <Search
                                    size={20}
                                    className="text-[color:var(--color-text-secondary)]"
                                />
                            </button>

                            {/* Desktop Auth */}
                            <div className="hidden md:flex items-center gap-2">
                                {user ? (
                                    isRestaurant ? (
                                        <div className="flex gap-[var(--spacing-4)] items-center">
                                            <Link
                                                href={route(
                                                    "restaurant.dashboard",
                                                )}
                                            >
                                                <Button size="sm">
                                                    <LayoutDashboard
                                                        size={16}
                                                    />
                                                    Restaurant Dashboard
                                                </Button>
                                            </Link>
                                            <Link
                                                href={route(
                                                    "restaurant.profile.edit",
                                                )}
                                                title="Restaurant profile"
                                            >
                                                <RestaurantLogoMark
                                                    src={RestaurantLogo}
                                                />
                                            </Link>
                                        </div>
                                    ) : isAdminUser ? (
                                        <div className="flex gap-[var(--spacing-4)] items-center">
                                            <Link
                                                href={route("admin.dashboard")}
                                            >
                                                <Button size="sm">
                                                    <LayoutDashboard
                                                        size={16}
                                                    />
                                                    Admin Dashboard
                                                </Button>
                                            </Link>

                                            <div
                                                className="relative"
                                                ref={profileRef}
                                            >
                                                <button
                                                    onClick={() =>
                                                        setProfileDropdown(
                                                            !profileDropdown,
                                                        )
                                                    }
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-[color:var(--color-primary-600)] flex items-center justify-center text-white text-sm font-semibold">
                                                        {user.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <ChevronDown
                                                        size={14}
                                                        className={`text-[color:var(--color-text-muted)] transition-transform ${
                                                            profileDropdown
                                                                ? "rotate-180"
                                                                : ""
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
                                                            <button
                                                                type="button"
                                                                className={`${dropdownItemClass} text-[color:var(--color-danger-600)]`}
                                                                onClick={() => {
                                                                    setProfileDropdown(
                                                                        false,
                                                                    );
                                                                    handleLogout();
                                                                }}
                                                            >
                                                                <span className="flex items-center gap-2">
                                                                    <LogOut
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                    Logout
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <CartIconLink count={cartCount} />

                                            <Link
                                                href={route(
                                                    "customer.wishlist",
                                                )}
                                                aria-label="Favourites"
                                                className="relative p-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                                            >
                                                <Heart
                                                    size={20}
                                                    className="text-[color:var(--color-text-secondary)]"
                                                />
                                                {hasFavourites && (
                                                    <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[color:var(--color-primary-500)] ring-2 ring-[color:var(--color-bg-primary)]" />
                                                )}
                                            </Link>

                                            <div
                                                className="relative"
                                                ref={profileRef}
                                            >
                                                <button
                                                    onClick={() =>
                                                        setProfileDropdown(
                                                            !profileDropdown,
                                                        )
                                                    }
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-[color:var(--color-primary-600)] flex items-center justify-center text-white text-sm font-semibold">
                                                        {user.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <ChevronDown
                                                        size={14}
                                                        className={`text-[color:var(--color-text-muted)] transition-transform ${
                                                            profileDropdown
                                                                ? "rotate-180"
                                                                : ""
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
                                                                href={route(
                                                                    "customer.profile.index",
                                                                )}
                                                                className={
                                                                    dropdownItemClass
                                                                }
                                                                onClick={() =>
                                                                    setProfileDropdown(
                                                                        false,
                                                                    )
                                                                }
                                                            >
                                                                <span className="flex items-center gap-2">
                                                                    <User
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                    My Profile
                                                                </span>
                                                            </Link>
                                                            <Link
                                                                href={route(
                                                                    "customer.orders.index",
                                                                )}
                                                                className={
                                                                    dropdownItemClass
                                                                }
                                                                onClick={() =>
                                                                    setProfileDropdown(
                                                                        false,
                                                                    )
                                                                }
                                                            >
                                                                <span className="flex items-center gap-2">
                                                                    <ClipboardList
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                    My Orders
                                                                </span>
                                                            </Link>
                                                            <Link
                                                                href={route(
                                                                    "customer.wishlist",
                                                                )}
                                                                className={
                                                                    dropdownItemClass
                                                                }
                                                                onClick={() =>
                                                                    setProfileDropdown(
                                                                        false,
                                                                    )
                                                                }
                                                            >
                                                                <span className="flex items-center gap-2">
                                                                    <Heart
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                    My Wishlist
                                                                </span>
                                                            </Link>
                                                            <Link
                                                                href={route(
                                                                    "customer.addresses.create",
                                                                )}
                                                                className={
                                                                    dropdownItemClass
                                                                }
                                                                onClick={() =>
                                                                    setProfileDropdown(
                                                                        false,
                                                                    )
                                                                }
                                                            >
                                                                <span className="flex items-center gap-2">
                                                                    <MapPin
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                    My Addresses
                                                                </span>
                                                            </Link>
                                                        </div>
                                                        <div className="border-t border-[color:var(--color-border-light)] py-1">
                                                            <button
                                                                type="button"
                                                                className={`${dropdownItemClass} text-[color:var(--color-danger-600)]`}
                                                                onClick={() => {
                                                                    setProfileDropdown(
                                                                        false,
                                                                    );
                                                                    handleLogout();
                                                                }}
                                                            >
                                                                <span className="flex items-center gap-2">
                                                                    <LogOut
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                    Logout
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )
                                ) : (
                                    <>
                                        <CartIconLink count={cartCount} />
                                        <Link href={route("login")}>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                            >
                                                Login
                                            </Button>
                                        </Link>
                                        <Link href={route("register")}>
                                            <Button variant="primary" size="sm">
                                                Sign Up
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Mobile - Profile or Cart */}
                            {user ? (
                                isRestaurant ? (
                                    <>
                                        <Link
                                            href={route(
                                                "restaurant.profile.edit",
                                            )}
                                            className="md:hidden"
                                            title="Restaurant profile"
                                        >
                                            <RestaurantLogoMark
                                                src={RestaurantLogo}
                                            />
                                        </Link>
                                    </>
                                ) : isAdminUser ? (
                                    <Link
                                        href={route("admin.dashboard")}
                                        className="md:hidden p-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                                    >
                                        <LayoutDashboard
                                            size={20}
                                            className="text-[color:var(--color-text-secondary)]"
                                        />
                                    </Link>
                                ) : (
                                    <CartIconLink
                                        count={cartCount}
                                        className="md:hidden"
                                    />
                                )
                            ) : (
                                <>
                                    <CartIconLink
                                        count={cartCount}
                                        className="md:hidden"
                                    />
                                    <Link
                                        href={route("login")}
                                        className="md:hidden p-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                                    >
                                        <User
                                            size={20}
                                            className="text-[color:var(--color-text-secondary)]"
                                        />
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===== BOTTOM BAR - Desktop Only ===== */}
                <div className="hidden md:block border-t border-[color:var(--color-border-light)]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                        <div className="flex items-center justify-between h-12">
                            <div className="flex items-center gap-6">
                                <Link
                                    href={route("home")}
                                    className={navLinkClass(
                                        route().current("home"),
                                    )}
                                >
                                    <span className="flex items-center gap-1.5">
                                        <Home size={16} />
                                        Home
                                    </span>
                                </Link>

                                <Link
                                    href="/restaurants"
                                    className={navLinkClass(
                                        route().current("restaurants.*"),
                                    )}
                                >
                                    <span className="flex items-center gap-1.5">
                                        <UtensilsCrossed size={16} />
                                        Restaurants
                                    </span>
                                </Link>

                                <div className="relative" ref={categoryRef}>
                                    <button
                                        onClick={() =>
                                            setCategoryDropdown(
                                                !categoryDropdown,
                                            )
                                        }
                                        className={navLinkClass()}
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <Package size={16} />
                                            Order by Categories
                                            <ChevronDown
                                                size={14}
                                                className={`transition-transform ${categoryDropdown ? "rotate-180" : ""}`}
                                            />
                                        </span>
                                    </button>

                                    {categoryDropdown &&
                                        categories.length > 0 && (
                                            <div className="absolute left-0 mt-2 w-56 bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border-light)] rounded-xl shadow-lg overflow-hidden z-50">
                                                {categories.map((cat) => (
                                                    <Link
                                                        key={cat.id}
                                                        href={`/restaurants?category=${cat.slug}`}
                                                        className={
                                                            dropdownItemClass
                                                        }
                                                        onClick={() =>
                                                            setCategoryDropdown(
                                                                false,
                                                            )
                                                        }
                                                    >
                                                        {cat.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    {categoryDropdown &&
                                        categories.length === 0 && (
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
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    icon={
                                        <Search
                                            size={16}
                                            className="text-[color:var(--color-text-muted)]"
                                        />
                                    }
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
                    className={`fixed inset-0 z-[var(--z-drawer)] transition-opacity duration-200 ${
                        mobileSearchOpen
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-0 pointer-events-none"
                    }`}
                >
                    <div
                        className="bg-black/50 backdrop-blur-sm absolute inset-0"
                        onClick={() => setMobileSearchOpen(false)}
                    />
                    <div
                        className={`relative bg-[color:var(--color-bg-primary)] px-4 py-4 shadow-lg transform transition-transform duration-200 ${
                            mobileSearchOpen
                                ? "translate-y-0"
                                : "-translate-y-4"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <form onSubmit={handleSearch} className="flex-1">
                                <TextInput
                                    type="text"
                                    placeholder="Search restaurants..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    icon={
                                        <Search
                                            size={16}
                                            className="text-[color:var(--color-text-muted)]"
                                        />
                                    }
                                    className="[&_input]:bg-[color:var(--color-bg-secondary)] [&_input]:rounded-lg [&_input]:py-2.5"
                                    autoFocus
                                />
                            </form>
                            <button
                                onClick={() => setMobileSearchOpen(false)}
                                className="p-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                            >
                                <X
                                    size={20}
                                    className="text-[color:var(--color-text-primary)]"
                                />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <NavbarMobileMenu
                open={mobileMenuOpen}
                animating={menuAnimating}
                onClose={() => setMobileMenuOpen(false)}
                user={user}
                isRestaurant={isRestaurant}
                isAdmin={isAdminUser}
                categories={categories}
                categoriesOpen={mobileCategoriesOpen}
                onToggleCategories={() =>
                    setMobileCategoriesOpen(!mobileCategoriesOpen)
                }
                cartCount={cartCount}
                hasFavourites={hasFavourites}
                onLogout={handleLogout}
            />
        </>
    );
}
