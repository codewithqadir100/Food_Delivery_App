import { usePage } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import { ArrowUpRight, MapPin } from "lucide-react";
import Logo from "@/assets/logo.png";

const SocialIcons = {
    facebook: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    ),
    instagram: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.265-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
            <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 110-2.881 1.44 1.44 0 010 2.881z" />
        </svg>
    ),
    twitter: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
    email: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
    ),
};

const FooterLink = ({ href, children, isExternal = false }) => (
    <Link
        href={href}
        className="text-sm text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-primary-600)]"
    >
        {children}
    </Link>
);

const SocialLink = ({ href, label, icon }) => (
    <a
        href={href}
        aria-label={label}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-primary-600)] hover:text-[color:var(--color-primary-600)]"
    >
        {icon}
    </a>
);

export default function Footer() {
    const { auth } = usePage().props;
    const currentYear = new Date().getFullYear();

    const isRestaurantLoggedIn =
        auth?.user?.role === "restaurant_owner" && auth?.user?.id;

    return (
        <footer className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                    {/* Brand Section */}
                    <div className="lg:pr-8">
                        <Link href="/" className="inline-flex items-center">
                            <img
                                src={Logo}
                                alt="FoodHub"
                                className="h-9 w-auto"
                            />
                        </Link>

                        <p className="mt-4 max-w-xs text-sm leading-6 text-[color:var(--color-text-secondary)]">
                            Your favorite food, delivered fresh and fast.
                            Discover restaurants, explore delicious meals, and
                            order what you love.
                        </p>

                        <div className="mt-6 flex items-center gap-2">
                            <SocialLink
                                href="https://facebook.com"
                                label="Facebook"
                                icon={SocialIcons.facebook}
                            />
                            <SocialLink
                                href="https://instagram.com"
                                label="Instagram"
                                icon={SocialIcons.instagram}
                            />
                            <SocialLink
                                href="https://twitter.com"
                                label="Twitter"
                                icon={SocialIcons.twitter}
                            />
                            <SocialLink
                                href="mailto:support@foodhub.com"
                                label="Email"
                                icon={SocialIcons.email}
                            />
                        </div>
                    </div>

                    {/* Explore Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                            Explore
                        </h3>
                        <ul className="mt-5 space-y-3">
                            <li>
                                <FooterLink href="/">Home</FooterLink>
                            </li>
                            <li>
                                <FooterLink href="/restaurants">
                                    Restaurants
                                </FooterLink>
                            </li>
                            <li>
                                <FooterLink href="/categories">
                                    Categories
                                </FooterLink>
                            </li>
                            <li>
                                <FooterLink href="/blog">Blogs</FooterLink>
                            </li>
                            <li>
                                <FooterLink href="/about">About Us</FooterLink>
                            </li>
                        </ul>
                    </div>

                    {/* For Restaurants Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                            For Restaurants
                        </h3>
                        <ul className="mt-5 space-y-3">
                            <li>
                                <Link
                                    href={route("restaurant.register")}
                                    className="inline-flex items-center gap-1 text-sm text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-primary-600)]"
                                >
                                    Add Your Restaurant
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                            </li>
                            <li>
                                <FooterLink href={route("restaurant.login")}>
                                    Restaurant Login
                                </FooterLink>
                            </li>

                            {isRestaurantLoggedIn && (
                                <li>
                                    <FooterLink href="/restaurant/dashboard">
                                        Restaurant Dashboard
                                    </FooterLink>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Support Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                            Support
                        </h3>
                        <ul className="mt-5 space-y-3">
                            <li>
                                <FooterLink href="/contact">
                                    Contact Us
                                </FooterLink>
                            </li>
                            <li>
                                <FooterLink href="/faq">FAQs</FooterLink>
                            </li>
                            <li>
                                <FooterLink href="/privacy-policy">
                                    Privacy Policy
                                </FooterLink>
                            </li>
                            <li>
                                <FooterLink href="/terms">
                                    Terms & Conditions
                                </FooterLink>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col gap-3 border-t border-[color:var(--color-border)] py-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-[color:var(--color-text-secondary)]">
                        © {currentYear} FoodHub. All rights reserved.
                    </p>

                    <div className="flex items-center gap-2 text-xs text-[color:var(--color-text-secondary)]">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>Delivering happiness, one order at a time.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
