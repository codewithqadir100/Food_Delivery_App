import { useMemo, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    Store,
    Eye,
    Check,
    X,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Search,
    ExternalLink,
    AlertCircle,
    Building2,
    Compass,
    FileText,
} from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import Button from "@/Components/Common/Button";
import Modal from "@/Components/Common/Modal";
import Avatar from "@/Components/Common/Avatar";
import { EmptyState } from "@/Components/Restaurant/Dashboard";

export default function VerifyRestaurants({ restaurants }) {
    const items = restaurants?.data ?? [];
    const links = Array.isArray(restaurants?.links)
        ? restaurants.links
        : restaurants?.meta?.links ?? [];

    const [searchQuery, setSearchQuery] = useState("");
    const [inspectRestaurant, setInspectRestaurant] = useState(null);
    const [action, setAction] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Filter restaurants locally by search query
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;
        const q = searchQuery.toLowerCase().trim();
        return items.filter((r) => {
            const name = r.name?.toLowerCase() || "";
            const ownerName = r.user?.name?.toLowerCase() || "";
            const ownerEmail = r.user?.email?.toLowerCase() || "";
            const city = (r.city || r.city_name || "").toLowerCase();
            const category = (
                r.restaurant_category?.name ||
                r.restaurantCategory?.name ||
                ""
            ).toLowerCase();
            return (
                name.includes(q) ||
                ownerName.includes(q) ||
                ownerEmail.includes(q) ||
                city.includes(q) ||
                category.includes(q)
            );
        });
    }, [items, searchQuery]);

    const selected = action
        ? items.find((r) => r.id === action.id)
        : null;

    const closeModal = () => {
        if (!processing) {
            setAction(null);
        }
    };

    const submitAction = () => {
        if (!action) return;

        setProcessing(true);
        const routeName =
            action.type === "approve"
                ? "super-admin.restaurants.approve"
                : "super-admin.restaurants.reject";

        router.post(
            route(routeName, action.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setAction(null);
                    setInspectRestaurant(null);
                },
            },
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Recently";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return "Recently";
        }
    };

    return (
        <>
            <Head title="Pending Restaurants" />
            <AdminLayout
                title="Restaurant Verifications"
                subtitle="Review, inspect, and approve pending restaurant applications."
            >
                {/* Top Action & Search Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--color-primary-100)] text-[color:var(--color-primary-700)] shadow-xs">
                            <Store size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[color:var(--color-text-primary)]">
                                Applications Awaiting Approval
                            </h2>
                            <p className="text-xs text-[color:var(--color-text-secondary)]">
                                {items.length} restaurant{items.length === 1 ? "" : "s"} currently pending review
                            </p>
                        </div>
                    </div>

                    {items.length > 0 && (
                        <div className="relative w-full sm:w-72">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)]"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, owner, city..."
                                className="w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] py-2 pl-9 pr-4 text-xs sm:text-sm text-[color:var(--color-text-primary)] placeholder-[color:var(--color-text-muted)] focus:border-[color:var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-primary-500)] shadow-xs"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Empty State */}
                {items.length === 0 ? (
                    <div className="rounded-xl border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] p-8 shadow-xs">
                        <EmptyState
                            title="No pending restaurants"
                            description="All restaurant registration applications have been reviewed. New submissions will appear here automatically."
                            icon={Store}
                        />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="rounded-xl border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-primary)] p-12 text-center shadow-xs">
                        <Store size={36} className="mx-auto text-[color:var(--color-text-muted)] opacity-60 mb-3" />
                        <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                            No restaurants found
                        </h3>
                        <p className="mt-1 text-xs text-[color:var(--color-text-secondary)]">
                            No applications matched your search query "{searchQuery}".
                        </p>
                        <button
                            onClick={() => setSearchQuery("")}
                            className="mt-3 text-xs font-semibold text-[color:var(--color-primary-600)] hover:underline"
                        >
                            Reset filter
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-[color:var(--color-border-light)] bg-[color:var(--color-bg-secondary)] text-xs font-semibold text-[color:var(--color-text-secondary)] uppercase tracking-wider">
                                        <tr>
                                            <th className="px-5 py-3.5">Restaurant</th>
                                            <th className="px-5 py-3.5">Owner / Contact</th>
                                            <th className="px-5 py-3.5">Category</th>
                                            <th className="px-5 py-3.5">Location</th>
                                            <th className="px-5 py-3.5">Submitted</th>
                                            <th className="px-5 py-3.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[color:var(--color-border-light)]">
                                        {filteredItems.map((restaurant) => {
                                            const categoryName =
                                                restaurant.restaurant_category?.name ??
                                                restaurant.restaurantCategory?.name ??
                                                "General";
                                            const city =
                                                restaurant.city ||
                                                restaurant.city_name ||
                                                restaurant.area_name ||
                                                "Not specified";

                                            return (
                                                <tr
                                                    key={restaurant.id}
                                                    className="hover:bg-[color:var(--color-bg-tertiary)]/40 transition-colors"
                                                >
                                                    {/* Restaurant Name & Avatar */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar
                                                                name={restaurant.name}
                                                                src={restaurant.logo_url}
                                                                size="md"
                                                                shape="rounded"
                                                            />
                                                            <div className="min-w-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setInspectRestaurant(restaurant)}
                                                                    className="font-bold text-[color:var(--color-text-primary)] hover:text-[color:var(--color-primary-600)] text-left truncate block transition-colors max-w-[200px]"
                                                                    title={restaurant.name}
                                                                >
                                                                    {restaurant.name}
                                                                </button>
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-warning-50)] text-[color:var(--color-warning-700)] border border-[color:var(--color-warning-200)] px-2 py-0.5 text-[10px] font-semibold mt-0.5">
                                                                    Pending Review
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Owner */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <Avatar
                                                                name={restaurant.user?.name || "Owner"}
                                                                size="sm"
                                                            />
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-semibold text-[color:var(--color-text-primary)] truncate max-w-[160px]">
                                                                    {restaurant.user?.name || "—"}
                                                                </p>
                                                                <p className="text-[11px] text-[color:var(--color-text-secondary)] truncate max-w-[160px]">
                                                                    {restaurant.user?.email || "—"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Category */}
                                                    <td className="px-5 py-4">
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-[color:var(--color-gray-100)] px-2.5 py-1 text-xs font-medium text-[color:var(--color-text-primary)]">
                                                            <Building2 size={13} className="text-[color:var(--color-text-muted)]" />
                                                            {categoryName}
                                                        </span>
                                                    </td>

                                                    {/* Location */}
                                                    <td className="px-5 py-4 text-xs text-[color:var(--color-text-secondary)]">
                                                        <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                                                            <MapPin size={13} className="shrink-0 text-[color:var(--color-primary-600)]" />
                                                            <span className="truncate">{city}</span>
                                                        </div>
                                                    </td>

                                                    {/* Submitted Date */}
                                                    <td className="px-5 py-4 text-xs text-[color:var(--color-text-muted)] whitespace-nowrap">
                                                        {formatDate(restaurant.created_at)}
                                                    </td>

                                                    {/* Action Buttons */}
                                                    <td className="px-5 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setInspectRestaurant(restaurant)}
                                                                className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] px-2.5 py-1.5 text-xs font-semibold text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-tertiary)] transition-colors shadow-2xs"
                                                                title="Inspect full restaurant profile"
                                                            >
                                                                <Eye size={14} />
                                                                <span>Inspect</span>
                                                            </button>

                                                            <Button
                                                                size="sm"
                                                                variant="success"
                                                                onClick={() =>
                                                                    setAction({
                                                                        type: "approve",
                                                                        id: restaurant.id,
                                                                    })
                                                                }
                                                                className="!py-1.5 !px-2.5 text-xs gap-1"
                                                            >
                                                                <Check size={14} />
                                                                Approve
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                variant="danger"
                                                                onClick={() =>
                                                                    setAction({
                                                                        type: "reject",
                                                                        id: restaurant.id,
                                                                    })
                                                                }
                                                                className="!py-1.5 !px-2.5 text-xs gap-1"
                                                            >
                                                                <X size={14} />
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile & Tablet Card View */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
                            {filteredItems.map((restaurant) => {
                                const categoryName =
                                    restaurant.restaurant_category?.name ??
                                    restaurant.restaurantCategory?.name ??
                                    "General";
                                const city =
                                    restaurant.city ||
                                    restaurant.city_name ||
                                    restaurant.area_name ||
                                    "Not specified";

                                return (
                                    <div
                                        key={restaurant.id}
                                        className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] p-4 shadow-xs flex flex-col justify-between gap-4"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar
                                                name={restaurant.name}
                                                src={restaurant.logo_url}
                                                size="lg"
                                                shape="rounded"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-1">
                                                    <h3 className="font-bold text-[color:var(--color-text-primary)] text-sm truncate">
                                                        {restaurant.name}
                                                    </h3>
                                                    <span className="shrink-0 rounded-full bg-[color:var(--color-warning-50)] text-[color:var(--color-warning-700)] border border-[color:var(--color-warning-200)] px-2 py-0.5 text-[9px] font-semibold">
                                                        Pending
                                                    </span>
                                                </div>

                                                <span className="inline-block mt-1 text-[11px] font-medium text-[color:var(--color-primary-700)] bg-[color:var(--color-primary-50)] px-2 py-0.5 rounded">
                                                    {categoryName}
                                                </span>

                                                <div className="mt-2.5 space-y-1 text-xs text-[color:var(--color-text-secondary)]">
                                                    <div className="flex items-center gap-1.5 truncate">
                                                        <Avatar
                                                            name={restaurant.user?.name || "O"}
                                                            size="xs"
                                                        />
                                                        <span className="truncate font-medium text-[color:var(--color-text-primary)]">
                                                            {restaurant.user?.name}
                                                        </span>
                                                        <span className="text-[11px] text-[color:var(--color-text-muted)] truncate">
                                                            ({restaurant.user?.email})
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1 text-[11px] text-[color:var(--color-text-muted)]">
                                                        <MapPin size={12} className="shrink-0 text-[color:var(--color-primary-600)]" />
                                                        <span className="truncate">{city}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-[color:var(--color-border-light)] pt-3 flex items-center justify-between gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setInspectRestaurant(restaurant)}
                                                className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-tertiary)] transition-colors"
                                            >
                                                <Eye size={14} />
                                                Inspect
                                            </button>

                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    size="sm"
                                                    variant="success"
                                                    onClick={() =>
                                                        setAction({
                                                            type: "approve",
                                                            id: restaurant.id,
                                                        })
                                                    }
                                                    className="!py-1.5 !px-2.5 text-xs"
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() =>
                                                        setAction({
                                                            type: "reject",
                                                            id: restaurant.id,
                                                        })
                                                    }
                                                    className="!py-1.5 !px-2.5 text-xs"
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination Links */}
                        {links.length > 3 && (
                            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                                {links.map((link, index) => (
                                    <Link
                                        key={`${link.label}-${index}`}
                                        href={link.url || ""}
                                        preserveScroll
                                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                            link.active
                                                ? "bg-[color:var(--color-primary-600)] text-white font-bold shadow-xs"
                                                : "bg-[color:var(--color-bg-primary)] text-[color:var(--color-text-secondary)] border border-[color:var(--color-border-light)] hover:bg-[color:var(--color-bg-tertiary)]"
                                        } ${!link.url ? "pointer-events-none opacity-40" : ""}`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </AdminLayout>

            {/* SUPER ADMIN DETAILED INSPECTION MODAL */}
            {inspectRestaurant && (
                <Modal
                    isOpen={Boolean(inspectRestaurant)}
                    onClose={() => setInspectRestaurant(null)}
                    size="xl"
                    title={null}
                    closeButton={true}
                    footer={
                        <div className="flex w-full items-center justify-between gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => setInspectRestaurant(null)}
                            >
                                Close Preview
                            </Button>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        setAction({
                                            type: "reject",
                                            id: inspectRestaurant.id,
                                        });
                                    }}
                                >
                                    Reject Restaurant
                                </Button>
                                <Button
                                    variant="success"
                                    onClick={() => {
                                        setAction({
                                            type: "approve",
                                            id: inspectRestaurant.id,
                                        });
                                    }}
                                >
                                    Approve Restaurant
                                </Button>
                            </div>
                        </div>
                    }
                >
                    <div className="-mx-6 -mt-4 space-y-5">
                        {/* Banner / Cover Image */}
                        <div className="relative h-44 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 overflow-hidden">
                            {inspectRestaurant.cover_image_url ? (
                                <img
                                    src={inspectRestaurant.cover_image_url}
                                    alt="Restaurant Cover"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center opacity-30 text-white">
                                    <Store size={64} />
                                </div>
                            )}

                            <div className="absolute top-3 right-3">
                                <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[color:var(--color-warning-700)] shadow-md">
                                    <AlertCircle size={14} />
                                    Pending Review
                                </span>
                            </div>
                        </div>

                        {/* Header Details with Floating Avatar */}
                        <div className="px-6 relative">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16">
                                <div className="flex items-end gap-3.5">
                                    <Avatar
                                        name={inspectRestaurant.name}
                                        src={inspectRestaurant.logo_url}
                                        size="xl"
                                        shape="rounded"
                                        className="ring-4 ring-white shadow-lg bg-white"
                                    />
                                    <div className="pb-1">
                                        <h2 className="text-xl font-bold text-[color:var(--color-text-primary)]">
                                            {inspectRestaurant.name}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <span className="inline-flex items-center gap-1 rounded-md bg-[color:var(--color-primary-100)] px-2.5 py-0.5 text-xs font-semibold text-[color:var(--color-primary-800)]">
                                                <Building2 size={12} />
                                                {inspectRestaurant.restaurant_category?.name ??
                                                    inspectRestaurant.restaurantCategory?.name ??
                                                    "General"}
                                            </span>
                                            <span className="text-xs text-[color:var(--color-text-muted)] flex items-center gap-1">
                                                <Calendar size={12} />
                                                Applied {formatDate(inspectRestaurant.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Inspection Grid */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Owner Information */}
                                <div className="rounded-xl border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-secondary)] p-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-text-secondary)] mb-3 flex items-center gap-1.5">
                                        <Avatar name={inspectRestaurant.user?.name || "O"} size="xs" />
                                        Owner Information
                                    </h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between py-1 border-b border-[color:var(--color-border-light)]">
                                            <span className="text-[color:var(--color-text-muted)]">Full Name:</span>
                                            <span className="font-semibold text-[color:var(--color-text-primary)]">
                                                {inspectRestaurant.user?.name || "—"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-[color:var(--color-border-light)]">
                                            <span className="text-[color:var(--color-text-muted)]">Email Address:</span>
                                            <span className="font-semibold text-[color:var(--color-text-primary)] flex items-center gap-1">
                                                <Mail size={12} />
                                                {inspectRestaurant.user?.email || "—"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-[color:var(--color-border-light)]">
                                            <span className="text-[color:var(--color-text-muted)]">Restaurant Phone:</span>
                                            <span className="font-semibold text-[color:var(--color-text-primary)] flex items-center gap-1">
                                                <Phone size={12} />
                                                {inspectRestaurant.phone || "Not provided"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-1">
                                            <span className="text-[color:var(--color-text-muted)]">Account Status:</span>
                                            <span className="font-bold text-[color:var(--color-warning-700)] capitalize">
                                                {inspectRestaurant.user?.status || "pending"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Location & Delivery */}
                                <div className="rounded-xl border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-secondary)] p-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-text-secondary)] mb-3 flex items-center gap-1.5">
                                        <Compass size={14} className="text-[color:var(--color-primary-600)]" />
                                        Location & Delivery
                                    </h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between py-1 border-b border-[color:var(--color-border-light)]">
                                            <span className="text-[color:var(--color-text-muted)]">City:</span>
                                            <span className="font-semibold text-[color:var(--color-text-primary)]">
                                                {inspectRestaurant.city || inspectRestaurant.city_name || "—"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-[color:var(--color-border-light)]">
                                            <span className="text-[color:var(--color-text-muted)]">Area / Street:</span>
                                            <span className="font-semibold text-[color:var(--color-text-primary)] truncate max-w-[170px]" title={inspectRestaurant.street_address || inspectRestaurant.area_name || inspectRestaurant.address}>
                                                {inspectRestaurant.street_address || inspectRestaurant.area_name || inspectRestaurant.address || "—"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-[color:var(--color-border-light)]">
                                            <span className="text-[color:var(--color-text-muted)]">Delivery Radius:</span>
                                            <span className="font-semibold text-[color:var(--color-text-primary)]">
                                                {inspectRestaurant.service_radius_km
                                                    ? `${inspectRestaurant.service_radius_km} km`
                                                    : "5 km (Standard)"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-1">
                                            <span className="text-[color:var(--color-text-muted)]">Map Location:</span>
                                            {inspectRestaurant.latitude && inspectRestaurant.longitude ? (
                                                <a
                                                    href={`https://maps.google.com/?q=${inspectRestaurant.latitude},${inspectRestaurant.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-semibold text-[color:var(--color-primary-600)] hover:underline flex items-center gap-1"
                                                >
                                                    View Coordinates <ExternalLink size={12} />
                                                </a>
                                            ) : (
                                                <span className="text-[color:var(--color-text-muted)]">Not mapped</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description / Bio */}
                            <div className="mt-4 rounded-xl border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-secondary)] p-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-text-secondary)] mb-1.5 flex items-center gap-1.5">
                                    <FileText size={14} className="text-[color:var(--color-text-muted)]" />
                                    About / Description
                                </h4>
                                <p className="text-xs leading-relaxed text-[color:var(--color-text-primary)] whitespace-pre-wrap">
                                    {inspectRestaurant.description || "No description provided by the restaurant owner."}
                                </p>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ACTION CONFIRMATION MODAL */}
            <Modal
                isOpen={Boolean(action)}
                onClose={closeModal}
                title={
                    action?.type === "approve"
                        ? "Approve Restaurant Application?"
                        : "Reject Restaurant Application?"
                }
                closeButton={!processing}
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={closeModal}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={action?.type === "approve" ? "success" : "danger"}
                            loading={processing}
                            onClick={submitAction}
                        >
                            {action?.type === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                        </Button>
                    </>
                }
            >
                <div className="flex items-start gap-3">
                    <div
                        className={`rounded-full p-2.5 ${
                            action?.type === "approve"
                                ? "bg-[color:var(--color-success-50)] text-[color:var(--color-success-600)]"
                                : "bg-[color:var(--color-danger-50)] text-[color:var(--color-danger-600)]"
                        }`}
                    >
                        {action?.type === "approve" ? <Check size={20} /> : <X size={20} />}
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                            {action?.type === "approve"
                                ? `Approve ${selected?.name ?? "this restaurant"}?`
                                : `Reject ${selected?.name ?? "this restaurant"}?`}
                        </p>
                        <p className="text-xs leading-5 text-[color:var(--color-text-secondary)]">
                            {action?.type === "approve"
                                ? "The restaurant and its owner account will be activated immediately. The restaurant will be able to manage their menu, configure opening hours, and take customer orders."
                                : "The restaurant registration will be rejected and the owner account will not be permitted to open the restaurant or manage food delivery."}
                        </p>
                    </div>
                </div>
            </Modal>
        </>
    );
}
