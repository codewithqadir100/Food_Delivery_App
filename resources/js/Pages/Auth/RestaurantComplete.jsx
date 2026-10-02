import { Head, useForm } from "@inertiajs/react";
import AuthLayout from "@/Layouts/AuthenticatedLayout";
import Card from "@/Components/Common/Card";
import Button from "@/Components/Common/Button";
import TextInput from "@/Components/Forms/TextInput";
import TextArea from "@/Components/Forms/TextArea";
import SelectInput from "@/Components/Forms/SelectInput";
import FormLabel from "@/Components/Forms/FormLabel";
import HomeChefChoice from "@/Components/Restaurant/HomeChefChoice";
import { Building2, Phone, Store } from "lucide-react";

export default function RestaurantComplete({ categories }) {
    const { data, setData, post, processing, errors } = useForm({
        restaurant_name: "",
        restaurant_category_id: "",
        is_home_chef: false,
        phone: "",
        description: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("restaurant.register.complete.store"));
    };

    const categoryOptions = categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
    }));

    return (
        <AuthLayout>
            <Head title="Complete Restaurant Registration" />

            <Card padding="lg" className="w-full max-w-2xl mx-auto">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-3xl font-bold text-[color:var(--color-text-primary)] mb-2">
                            Complete your restaurant
                        </h2>
                        <p className="text-sm text-[color:var(--color-text-secondary)]">
                            Your Google account is verified. Add the restaurant
                            details to start onboarding.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <TextInput
                            type="text"
                            placeholder="Your Restaurant Name"
                            value={data.restaurant_name}
                            onChange={(e) =>
                                setData("restaurant_name", e.target.value)
                            }
                            error={errors.restaurant_name}
                            icon={<Building2 size={16} />}
                            required
                        />

                        <div>
                            <FormLabel required>Restaurant Category</FormLabel>
                            <SelectInput
                                options={categoryOptions}
                                value={data.restaurant_category_id}
                                onChange={(e) =>
                                    setData(
                                        "restaurant_category_id",
                                        e.target.value,
                                    )
                                }
                                error={errors.restaurant_category_id}
                                placeholder="Select a category"
                            />
                        </div>

                        <HomeChefChoice
                            value={data.is_home_chef}
                            onChange={(value) => setData("is_home_chef", value)}
                            error={errors.is_home_chef}
                        />

                        <TextInput
                            type="tel"
                            placeholder="Phone number"
                            value={data.phone}
                            onChange={(e) => setData("phone", e.target.value)}
                            error={errors.phone}
                            icon={<Phone size={16} />}
                        />

                        <div>
                            <FormLabel>Description</FormLabel>
                            <TextArea
                                placeholder="Tell customers about your restaurant"
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                error={errors.description}
                                rows={4}
                            />
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            loading={processing}
                            icon={Store}
                        >
                            Continue
                        </Button>
                    </form>
                </div>
            </Card>
        </AuthLayout>
    );
}
