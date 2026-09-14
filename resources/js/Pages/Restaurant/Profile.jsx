import RestaurantLayout from "@/Layouts/RestaurantLayout";
import { Head } from "@inertiajs/react";
import { Pencil } from "lucide-react";

export default function RestaurantProfile() {
    const pageTitle = "Profile";
    const subTitle = "Manage your restaurant profile.";

    return (
        <RestaurantLayout pageTitle={pageTitle} pageSubtitle={subTitle}>
            <Head title="Your Restaurant Profile" />

            <section className="overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-md)]">
                <div className="relative">
                    <div className="h-40 overflow-hidden sm:h-48">
                        <img
                            src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1200&fit=max"
                            alt="Restaurant cover"
                            className="h-full w-full object-cover object-center"
                        />
                    </div>

                    <button
                        type="button"
                        aria-label="Edit cover image"
                        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                    >
                        <Pencil size={16} strokeWidth={2} />
                    </button>

                    <div className="relative mx-auto -mb-16 h-32 w-32 -translate-y-16">
                        <div className="h-full w-full overflow-hidden rounded-full border-4 border-[color:var(--color-bg-primary)] bg-[color:var(--color-bg-tertiary)] shadow-[var(--shadow-md)]">
                            <img
                                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max"
                                alt="Restaurant logo"
                                className="h-full w-full object-cover object-center"
                            />
                        </div>

                        <button
                            type="button"
                            aria-label="Edit restaurant logo"
                            className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[color:var(--color-bg-primary)] bg-[color:var(--color-primary-600)] text-white shadow-[var(--shadow-sm)] transition hover:bg-[color:var(--color-primary-700)]"
                        >
                            <Pencil size={15} strokeWidth={2} />
                        </button>
                    </div>
                </div>

                <div className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between max-sm:text-center">
                        <div>
                            <span className="text-xs hidden sm:block font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">
                                Restaurant Name
                            </span>

                            <p className="mt-1 text-2xl font-bold text-[color:var(--color-text-primary)]">
                                Kentucy Fried Chickens
                            </p>
                        </div>

                        <div className="sm:text-right">
                            <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">
                                Approved Since
                            </span>

                            <p className="mt-1 text-sm font-semibold text-[color:var(--color-text-primary)]">
                                20 / 3 / 2025
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </RestaurantLayout>
    );
}
