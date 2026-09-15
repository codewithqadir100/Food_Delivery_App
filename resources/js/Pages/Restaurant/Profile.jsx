import { useState } from "react";
import RestaurantLayout from "@/Layouts/RestaurantLayout";
import { Head, usePage } from "@inertiajs/react";
import ProfileCover from "@/Components/Restaurant/Profile/ProfileCover";

export default function RestaurantProfile() {
    const { restaurant } = usePage().props;

    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState({
        coverImage: restaurant.cover_image_url,
        logoImage: restaurant.logo_url,
    });

    const uploadImage = async (url, fieldName, file) => {
        const formData = new FormData();
        formData.append(fieldName, file);

        const { data } = await axios.post(url, formData, {
            headers: {
                Accept: "application/json",
            },
        });

        return data;
    };

    const handleCoverUpload = async (file) => {
        setLoading(true);

        try {
            const data = await uploadImage(
                route("restaurant.profile.update-cover"),
                "cover_image",
                file,
            );

            setImages((prev) => ({
                ...prev,
                coverImage: data.cover_image_url,
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (file) => {
        setLoading(true);

        try {
            const data = await uploadImage(
                route("restaurant.profile.update-logo"),
                "logo",
                file,
            );

            setImages((prev) => ({
                ...prev,
                logoImage: data.logo_url,
            }));
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
                    coverImage={images.coverImage}
                    logoImage={images.logoImage}
                    onCoverUpload={handleCoverUpload}
                    onLogoUpload={handleLogoUpload}
                    loading={loading}
                />
            </div>
        </RestaurantLayout>
    );
}
