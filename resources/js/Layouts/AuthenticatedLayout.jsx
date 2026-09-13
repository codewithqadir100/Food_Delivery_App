import { Link } from "@inertiajs/react";
import Logo from "@/assets/logo.png";
import AuthBg from "@/assets/authpages-bg-banner.png";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }) {
    return (
        <>
            <div
                className="hidden lg:flex min-h-screen flex-col justify-center items-center px-4 py-8 bg-cover bg-center bg-no-repeat relative overflow-hidden"
                style={{
                    backgroundImage: `url(${AuthBg})`,
                }}
            >
                <div className="absolute inset-0 bg-black opacity-10 z-0" />

                <Link
                    href="/"
                    className="absolute top-8 left-8 z-20 flex items-center gap-2 text-white hover:text-[color:var(--color-primary-200)] transition-colors font-medium"
                >
                    <ArrowLeft size={18} />
                    Go Back
                </Link>

                <div className="relative z-10 w-full max-w-md">
                    <div className="mb-8">
                        <div className="mb-8 flex justify-center">
                            <Link href="/" className="flex-shrink-0">
                                <img
                                    src={Logo}
                                    alt="FoodHub"
                                    className="h-20 w-auto"
                                />
                            </Link>
                        </div>

                        <div>{children}</div>
                    </div>
                </div>
            </div>

            <div className="flex lg:hidden min-h-screen flex-col justify-center items-center px-4 py-8 bg-[color:var(--color-bg-secondary)]">
                <Link
                    href="/"
                    className="absolute z-20 top-8 left-8 flex items-center gap-2 text-[color:var(--color-primary-600)] hover:text-[color:var(--color-primary-700)] transition-colors font-medium mb-8"
                >
                    <ArrowLeft size={16} />
                    Go Back
                </Link>
                <div className="relative z-10 w-full max-w-md">
                    <div className="mb-8 flex justify-center">
                        <Link href="/" className="flex-shrink-0">
                            <img
                                src={Logo}
                                alt="FoodHub"
                                className="h-14 w-auto"
                            />
                        </Link>
                    </div>

                    <div>{children}</div>
                </div>
            </div>
        </>
    );
}
