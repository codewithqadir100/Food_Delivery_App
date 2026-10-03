import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import Navbar from "@/Components/Common/Navbar";
import Footer from "@/Components/Common/Footer";
import Alert from "@/Components/Common/Alert";
import ReviewPrompt from "@/Components/Customer/ReviewPrompt";

export default function AppLayout({ children, categories = [] }) {
    const { auth } = usePage().props;
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        const showNotice = (event) => {
            setNotice({
                id: Date.now(),
                message: event.detail?.message,
            });
        };

        window.addEventListener("favourite-notice", showNotice);

        return () => window.removeEventListener("favourite-notice", showNotice);
    }, []);

    useEffect(() => {
        if (!notice) {
            return undefined;
        }

        const timer = setTimeout(() => setNotice(null), 2500);

        return () => clearTimeout(timer);
    }, [notice]);

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
            <ReviewPrompt />

            {notice?.message && (
                <div className="fixed bottom-6 left-1/2 z-[var(--z-popover)] w-[min(24rem,calc(100%-2rem))] -translate-x-1/2">
                    <Alert
                        key={notice.id}
                        type="success"
                        message={notice.message}
                        onClose={() => setNotice(null)}
                    />
                </div>
            )}
        </div>
    );
}
