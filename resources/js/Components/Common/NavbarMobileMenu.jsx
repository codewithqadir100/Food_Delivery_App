import { Link } from "@inertiajs/react";
import {
    ChevronRight,
    Heart,
    Home,
    LayoutDashboard,
    LogOut,
    MapPin,
    Package,
    ShoppingCart,
    Store,
    User,
    UtensilsCrossed,
    X,
} from "lucide-react";
import Logo from "@/assets/logo.png";
import Button from "./Button";

export default function NavbarMobileMenu({
    open,
    animating,
    onClose,
    user,
    isRestaurant,
    isAdmin,
    categories,
    categoriesOpen,
    onToggleCategories,
    cartCount,
    onLogout,
}) {
    if (!open && !animating) {
        return null;
    }

    return (
        <>
            <div
                className={`fixed inset-0 z-[var(--z-drawer)] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
                    open ? "opacity-100" : "opacity-0"
                }`}
                onClick={onClose}
            />
            <div
                className={`fixed inset-y-0 left-0 z-[var(--z-drawer)] w-full max-w-sm bg-[color:var(--color-bg-primary)] shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between px-4 py-4 border-b border-[color:var(--color-border-light)]">
                    <img
                        src={Logo}
                        alt="FoodHub"
                        className="h-8 w-auto"
                        loading="lazy"
                    />
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                    >
                        <X
                            size={22}
                            className="text-[color:var(--color-text-primary)]"
                        />
                    </button>
                </div>

                <div className="px-4 py-4 space-y-1">
                    <Link
                        href={route("home")}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                        onClick={onClose}
                    >
                        <Home
                            size={20}
                            className="text-[color:var(--color-primary-600)]"
                        />
                        <span className="text-sm font-medium">Home</span>
                    </Link>
                    <Link
                        href="/restaurants"
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                        onClick={onClose}
                    >
                        <UtensilsCrossed
                            size={20}
                            className="text-[color:var(--color-primary-600)]"
                        />
                        <span className="text-sm font-medium">Restaurants</span>
                    </Link>

                    <button
                        onClick={onToggleCategories}
                        className="flex items-center justify-between w-full px-3 py-3 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                    >
                        <span className="flex items-center gap-3">
                            <Package
                                size={20}
                                className="text-[color:var(--color-primary-600)]"
                            />
                            <span className="text-sm font-medium">
                                Order by Categories
                            </span>
                        </span>
                        <ChevronRight
                            size={16}
                            className={`text-[color:var(--color-text-muted)] transition-transform ${
                                categoriesOpen ? "rotate-90" : ""
                            }`}
                        />
                    </button>

                    {categoriesOpen && (
                        <div className="ml-10 space-y-1">
                            {categories.length > 0 ? (
                                categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/restaurants?category=${cat.slug}`}
                                        className="block px-3 py-2 rounded-lg text-sm text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                                        onClick={onClose}
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

                    {!user && (
                        <div className="border-t border-[color:var(--color-border-light)] pt-3 mt-3">
                            <p className="px-3 text-xs font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider mb-2">
                                For Restaurants
                            </p>
                            <Link
                                href={route("restaurant.register")}
                                className="flex items-center gap-3 px-3 py-3 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                                onClick={onClose}
                            >
                                <Store
                                    size={20}
                                    className="text-[color:var(--color-primary-600)]"
                                />
                                <span className="text-sm font-medium">
                                    Become Our Partner
                                </span>
                            </Link>
                            <Link
                                href={route("restaurant.login")}
                                className="flex items-center gap-3 px-3 py-3 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                                onClick={onClose}
                            >
                                <LogOut
                                    size={20}
                                    className="text-[color:var(--color-primary-600)]"
                                />
                                <span className="text-sm font-medium">
                                    Restaurant Login
                                </span>
                            </Link>
                        </div>
                    )}

                    <div className="border-t border-[color:var(--color-border-light)] pt-3 mt-3">
                        {user ? (
                            isRestaurant ? (
                                <Link
                                    href={route("restaurant.dashboard")}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                                >
                                    <Store
                                        size={18}
                                        className="text-[color:var(--color-primary-600)]"
                                    />
                                    <span className="text-sm font-medium text-[color:var(--color-text-primary)]">
                                        Restaurant Dashboard
                                    </span>
                                </Link>
                            ) : isAdmin ? (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3 px-3 py-2">
                                        <div className="w-9 h-9 rounded-full bg-[color:var(--color-primary-600)] flex items-center justify-center text-white text-sm font-semibold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-[color:var(--color-text-muted)]">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={route("admin.dashboard")}
                                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                                        onClick={onClose}
                                    >
                                        <LayoutDashboard
                                            size={18}
                                            className="text-[color:var(--color-text-muted)]"
                                        />
                                        <span className="text-sm font-medium">
                                            Admin Dashboard
                                        </span>
                                    </Link>
                                    <button
                                        type="button"
                                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-[color:var(--color-danger-600)] hover:bg-[color:var(--color-bg-secondary)] transition-colors w-full text-left"
                                        onClick={() => {
                                            onClose();
                                            onLogout();
                                        }}
                                    >
                                        <LogOut size={18} />
                                        <span className="text-sm font-medium">
                                            Logout
                                        </span>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3 px-3 py-2">
                                        <div className="w-9 h-9 rounded-full bg-[color:var(--color-primary-600)] flex items-center justify-center text-white text-sm font-semibold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-[color:var(--color-text-muted)]">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={route("customer.profile.index")}
                                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                                        onClick={onClose}
                                    >
                                        <User
                                            size={18}
                                            className="text-[color:var(--color-text-muted)]"
                                        />
                                        <span className="text-sm font-medium">
                                            My Profile
                                        </span>
                                    </Link>
                                    <Link
                                        href={route("customer.cart.index")}
                                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                                        onClick={onClose}
                                    >
                                        <ShoppingCart
                                            size={18}
                                            className="text-[color:var(--color-text-muted)]"
                                        />
                                        <span className="text-sm font-medium">
                                            My Cart
                                            {cartCount > 0 && ` (${cartCount})`}
                                        </span>
                                    </Link>
                                    <Link
                                        href={route("customer.wishlist")}
                                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                                        onClick={onClose}
                                    >
                                        <Heart
                                            size={18}
                                            className="text-[color:var(--color-text-muted)]"
                                        />
                                        <span className="text-sm font-medium">
                                            My Wishlist
                                        </span>
                                    </Link>
                                    <Link
                                        href={route("customer.addresses.create")}
                                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)] transition-colors"
                                        onClick={onClose}
                                    >
                                        <MapPin
                                            size={18}
                                            className="text-[color:var(--color-text-muted)]"
                                        />
                                        <span className="text-sm font-medium">
                                            My Addresses
                                        </span>
                                    </Link>
                                    <button
                                        type="button"
                                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-[color:var(--color-danger-600)] hover:bg-[color:var(--color-bg-secondary)] transition-colors w-full text-left"
                                        onClick={() => {
                                            onClose();
                                            onLogout();
                                        }}
                                    >
                                        <LogOut size={18} />
                                        <span className="text-sm font-medium">
                                            Logout
                                        </span>
                                    </button>
                                </div>
                            )
                        ) : (
                            <div className="flex items-center gap-3 px-3 pt-2">
                                <Link
                                    href={route("login")}
                                    className="flex-1"
                                    onClick={onClose}
                                >
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        fullWidth
                                    >
                                        Login
                                    </Button>
                                </Link>
                                <Link
                                    href={route("register")}
                                    className="flex-1"
                                    onClick={onClose}
                                >
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
    );
}
