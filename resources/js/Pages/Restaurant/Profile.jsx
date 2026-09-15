import { useState } from "react";
import RestaurantLayout from "@/Layouts/RestaurantLayout";
import { Head, usePage } from "@inertiajs/react";
import ProfileCover from "@/Components/Restaurant/Profile/ProfileCover";

export default function RestaurantProfile() {
    const { auth } = usePage().props;
    const restaurant = auth?.user?.restaurant || {};

    const [loading, setLoading] = useState(false);
    const [uploadedData, setUploadedData] = useState({
        coverImage: restaurant.cover_image_url,
        logoImage: restaurant.logo_url,
    });

    const getCsrfToken = () => {
        const token = document.querySelector(
            'meta[name="csrf-token"]',
        )?.content;
        if (!token) {
            const cookieValue = document.cookie
                .split("; ")
                .find((row) => row.startsWith("XSRF-TOKEN="))
                ?.split("=")[1];
            return cookieValue || "";
        }
        return token;
    };

    const handleCoverUpload = async (file) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("cover_image", file);

            const response = await fetch(
                route("restaurant.profile.update-cover"),
                {
                    method: "POST",
                    headers: {
                        "X-CSRF-TOKEN": getCsrfToken(),
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    body: formData,
                },
            );

            const data = await response.json();

            if (data.success) {
                setUploadedData((prev) => ({
                    ...prev,
                    coverImage: data.cover_image_url,
                }));
            } else {
                throw new Error(data.message || "Failed to upload cover image");
            }
        } catch (error) {
            console.error("Cover upload error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (file) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("logo", file);

            const response = await fetch(
                route("restaurant.profile.update-logo"),
                {
                    method: "POST",
                    headers: {
                        "X-CSRF-TOKEN": getCsrfToken(),
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    body: formData,
                },
            );

            const data = await response.json();

            if (data.success) {
                setUploadedData((prev) => ({
                    ...prev,
                    logoImage: data.logo_url,
                }));
            } else {
                throw new Error(data.message || "Failed to upload logo");
            }
        } catch (error) {
            console.error("Logo upload error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <RestaurantLayout
            pageTitle="Profile"
            pageSubtitle="Manage your restaurant profile."
        >
            <Head title="Restaurant Profile" />

            <div className="space-y-6">
                <ProfileCover
                    restaurantName={restaurant.name}
                    approvedDate={restaurant.approved_at}
                    coverImage={uploadedData.coverImage}
                    logoImage={uploadedData.logoImage}
                    onCoverUpload={handleCoverUpload}
                    onLogoUpload={handleLogoUpload}
                    loading={loading}
                />
            </div>
        </RestaurantLayout>
    );
}
