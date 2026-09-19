import { useState } from "react";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import axios from "axios";
import RestaurantLayout from "@/Layouts/RestaurantLayout";
import ProfileCover from "@/Components/Restaurant/Profile/ProfileCover";
import RestaurantInformation from "@/Components/Restaurant/Profile/RestaurantInformation";
import DeliverySettings from "@/Components/Restaurant/Profile/DeliverySettings";
import Modal from "@/Components/Common/Modal";
import Button from "@/Components/Common/Button";
import Alert from "@/Components/Common/Alert";
import { AlertTriangle } from "lucide-react";

const axiosInstance = axios.create({
    headers: {
        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')
            ?.content,
        Accept: "application/json",
    },
});

export default function RestaurantProfile() {
    const { restaurant, categories } = usePage().props;

    const initialFormData = {
        name: restaurant.name ?? "",
        restaurant_category_id: restaurant.restaurant_category_id ?? "",
        phone: restaurant.phone ?? "",
        city: restaurant.city ?? "",
        address: restaurant.address ?? "",
        description: restaurant.description ?? "",
        latitude: restaurant.latitude ?? null,
        longitude: restaurant.longitude ?? null,
        service_radius_km: restaurant.service_radius_km ?? 5,
        city_name: restaurant.city_name ?? "",
        area_name: restaurant.area_name ?? "",
    };

    const { data, setData, put, processing, errors, clearErrors } =
        useForm(initialFormData);

    const [images, setImages] = useState({
        coverImage: restaurant.cover_image_url,
        logoImage: restaurant.logo_url,
    });

    const [isOpen, setIsOpen] = useState(Boolean(restaurant.is_open));
    const [imageLoading, setImageLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);

    const isDirty = JSON.stringify(data) !== JSON.stringify(initialFormData);

    const handleChange = (field, value) => {
        setData(field, value);
        setFeedback("");
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        clearErrors();

        put(route("restaurant.profile.update"), {
            preserveScroll: true,
            onSuccess: () => {
                setFeedback("Restaurant information updated successfully.");
            },
        });
    };

    const uploadImage = async (url, fieldName, file) => {
        const formData = new FormData();
        formData.append(fieldName, file);

        const { data: response } = await axiosInstance.post(url, formData);
        return response;
    };

    const handleCoverUpload = async (file) => {
        setImageLoading(true);
        setFeedback("");

        try {
            const response = await uploadImage(
                route("restaurant.profile.update-cover"),
                "cover_image",
                file,
            );

            setImages((prev) => ({
                ...prev,
                coverImage: response.cover_image_url,
            }));

            setFeedback("Cover image updated successfully.");
            router.reload({ only: ["restaurant"] });
        } catch (error) {
            setFeedback("Failed to upload cover image.");
            console.error("Cover upload error:", error);
        } finally {
            setImageLoading(false);
        }
    };

    const handleLogoUpload = async (file) => {
        setImageLoading(true);
        setFeedback("");

        try {
            const response = await uploadImage(
                route("restaurant.profile.update-logo"),
                "logo",
                file,
            );

            setImages((prev) => ({
                ...prev,
                logoImage: response.logo_url,
            }));

            setFeedback("Restaurant logo updated successfully.");
            router.reload({ only: ["restaurant"] });
        } catch (error) {
            setFeedback("Failed to upload logo.");
            console.error("Logo upload error:", error);
        } finally {
            setImageLoading(false);
        }
    };

    const handleStatusChange = (value) => {
        if (value === isOpen) {
            return;
        }

        setPendingStatus(value);
        setStatusModalOpen(true);
    };

    const confirmStatusChange = async () => {
        if (pendingStatus === null) {
            return;
        }

        setStatusLoading(true);

        try {
            const { data: response } = await axiosInstance.patch(
                route("restaurant.profile.update-status"),
                {
                    is_open: pendingStatus,
                },
            );

            setIsOpen(Boolean(response.is_open));
            setFeedback(response.message);
            setStatusModalOpen(false);
            setPendingStatus(null);
            router.reload({ only: ["restaurant"] });
        } catch (error) {
            setFeedback("Failed to update restaurant status.");
            console.error("Status update error:", error);
            setStatusModalOpen(false);
            setPendingStatus(null);
        } finally {
            setStatusLoading(false);
        }
    };

    const statusAction = pendingStatus ? "open" : "close";

    return (
        <RestaurantLayout
            pageTitle="Profile"
            pageSubtitle="Manage your restaurant profile."
        >
            <Head title="Restaurant Profile" />

            <div className="space-y-6">
                {feedback && (
                    <Alert
                        type="success"
                        title="Success"
                        message={feedback}
                        onClose={() => setFeedback("")}
                    />
                )}

                <ProfileCover
                    restaurantName={restaurant.name}
                    approvedDate={restaurant.approved_since}
                    coverImage={images.coverImage}
                    logoImage={images.logoImage}
                    onCoverUpload={handleCoverUpload}
                    onLogoUpload={handleLogoUpload}
                    loading={imageLoading}
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <RestaurantInformation
                        data={{
                            ...data,
                            is_open: isOpen,
                        }}
                        categories={categories}
                        errors={errors}
                        onChange={(field, value) => {
                            if (field === "is_open") {
                                handleStatusChange(value);
                                return;
                            }

                            handleChange(field, value);
                        }}
                    />

                    <DeliverySettings
                        data={data}
                        errors={errors}
                        onChange={handleChange}
                    />

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            loading={processing}
                            disabled={!isDirty || imageLoading || statusLoading}
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>

            <Modal
                isOpen={statusModalOpen}
                onClose={() => {
                    if (!statusLoading) {
                        setStatusModalOpen(false);
                        setPendingStatus(null);
                    }
                }}
                title={pendingStatus ? "Open Restaurant" : "Close Restaurant"}
                closeButton={!statusLoading}
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setStatusModalOpen(false);
                                setPendingStatus(null);
                            }}
                            disabled={statusLoading}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant={pendingStatus ? "primary" : "danger"}
                            loading={statusLoading}
                            onClick={confirmStatusChange}
                        >
                            {pendingStatus
                                ? "Open Restaurant"
                                : "Close Restaurant"}
                        </Button>
                    </>
                }
            >
                <div className="flex gap-3">
                    <AlertTriangle
                        size={22}
                        className="mt-0.5 shrink-0 text-[color:var(--color-primary-600)]"
                    />

                    <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
                        Are you sure you want to {statusAction} your restaurant?{" "}
                        {pendingStatus
                            ? "Customers will be able to place new orders."
                            : "Customers will no longer be able to place new orders."}
                    </p>
                </div>
            </Modal>
        </RestaurantLayout>
    );
}
