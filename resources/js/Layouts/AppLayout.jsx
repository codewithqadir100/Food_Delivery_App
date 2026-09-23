import { usePage } from "@inertiajs/react";
import Navbar from "@/Components/Common/Navbar";
import Footer from "@/Components/Common/Footer";

export default function AppLayout({ children, categories = [] }) {
    const { auth } = usePage().props;
    return (
        <div className="min-h-screen bg-[color:var(--color-bg-secondary)]">
            <Navbar
                categories={categories}
                RestaurantLogo={auth.restaurant?.logo_url}
            />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            <Footer />
        </div>
    );
}
