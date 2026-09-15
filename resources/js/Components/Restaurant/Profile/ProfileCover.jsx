import { useState } from "react";
import { Pencil } from "lucide-react";
import Card from "@/Components/Common/Card";
import ImageUploadModal from "@/Components/Common/ImageUploadModal";

export default function ProfileCover({
    restaurantName,
    approvedDate,
    coverImage,
    logoImage,
    onCoverUpload,
    onLogoUpload,
    loading = false,
}) {
    const [coverModalOpen, setCoverModalOpen] = useState(false);
    const [logoModalOpen, setLogoModalOpen] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);

    const handleCoverUpload = async (file) => {
        setUploadLoading(true);
        try {
            await onCoverUpload?.(file);
        } finally {
            setUploadLoading(false);
        }
    };

    const handleLogoUpload = async (file) => {
        setUploadLoading(true);
        try {
            await onLogoUpload?.(file);
        } finally {
            setUploadLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "N/A";
        if (typeof date === "string") return date;
        return new Date(date).toLocaleDateString("en-GB");
    };

    return (
        <>
            <Card padding="none" shadow>
                <div className="relative">
                    <div className="relative h-40 sm:h-48 bg-[color:var(--color-bg-secondary)]">
                        {coverImage ? (
                            <img
                                src={coverImage}
                                alt="Restaurant cover"
                                className="h-full w-full object-cover object-center"
                            />
                        ) : (
                            <div className="h-full w-full bg-gradient-to-br from-[color:var(--color-primary-100)] to-[color:var(--color-primary-50)] flex items-center justify-center">
                                <span className="text-sm text-[color:var(--color-text-muted)]">
                                    No cover image
                                </span>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setCoverModalOpen(true)}
                            disabled={uploadLoading}
                            aria-label="Edit cover image"
                            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Pencil size={16} strokeWidth={2} />
                        </button>

                        <div className="relative mx-auto -mb-16 h-32 w-32 -translate-y-16">
                            <div className="h-full w-full overflow-hidden rounded-full border-4 border-[color:var(--color-bg-primary)] bg-[color:var(--color-bg-tertiary)] shadow-[var(--shadow-md)]">
                                {logoImage ? (
                                    <img
                                        src={logoImage}
                                        alt="Restaurant logo"
                                        className="h-full w-full object-cover object-center"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-[color:var(--color-primary-200)] to-[color:var(--color-primary-100)] flex items-center justify-center">
                                        <span className="text-xs text-[color:var(--color-text-muted)]">
                                            Logo
                                        </span>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setLogoModalOpen(true)}
                                disabled={uploadLoading}
                                aria-label="Edit restaurant logo"
                                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[color:var(--color-bg-primary)] bg-[color:var(--color-primary-600)] text-white shadow-[var(--shadow-sm)] transition hover:bg-[color:var(--color-primary-700)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Pencil size={15} strokeWidth={2} />
                            </button>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6 pt-20 sm:pt-24">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between max-sm:text-center">
                            <div>
                                <span className="text-xs hidden sm:block font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">
                                    Restaurant Name
                                </span>

                                <p className="mt-1 text-2xl font-bold text-[color:var(--color-text-primary)]">
                                    {restaurantName || "Unnamed Restaurant"}
                                </p>
                            </div>

                            <div className="sm:text-right">
                                <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">
                                    Approved Since
                                </span>

                                <p className="mt-1 text-sm font-semibold text-[color:var(--color-text-primary)]">
                                    {formatDate(approvedDate)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <ImageUploadModal
                isOpen={coverModalOpen}
                onClose={() => setCoverModalOpen(false)}
                onUpload={handleCoverUpload}
                title="Update Cover Image"
                subtitle="Upload a new cover image for your restaurant"
                loading={uploadLoading}
            />

            <ImageUploadModal
                isOpen={logoModalOpen}
                onClose={() => setLogoModalOpen(false)}
                onUpload={handleLogoUpload}
                title="Update Restaurant Logo"
                subtitle="Upload your restaurant logo"
                loading={uploadLoading}
            />
        </>
    );
}
