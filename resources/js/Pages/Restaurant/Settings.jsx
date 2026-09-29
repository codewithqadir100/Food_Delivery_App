import { Head, useForm, usePage } from "@inertiajs/react";
import RestaurantLayout from "@/Layouts/RestaurantLayout";
import Card from "@/Components/Common/Card";
import Button from "@/Components/Common/Button";
import Alert from "@/Components/Common/Alert";
import HomeChefChoice from "@/Components/Restaurant/HomeChefChoice";

export default function Settings({ isHomeChef = false }) {
    const { flash = {} } = usePage().props;
    const { data, setData, patch, processing, errors, isDirty } = useForm({
        is_home_chef: Boolean(isHomeChef),
    });

    const submit = (event) => {
        event.preventDefault();
        patch(route("restaurant.settings.update"), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Settings" />
            <RestaurantLayout
                pageTitle="Settings"
                pageSubtitle="Update how your kitchen is identified"
            >
                <div className="space-y-6">
                    {flash.success && (
                        <Alert type="success" message={flash.success} />
                    )}
                    {flash.error && (
                        <Alert type="error" message={flash.error} />
                    )}

                    <Card padding="lg">
                        <form onSubmit={submit} className="space-y-6">
                            <HomeChefChoice
                                value={data.is_home_chef}
                                onChange={(value) =>
                                    setData("is_home_chef", value)
                                }
                                error={errors.is_home_chef}
                            />

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    loading={processing}
                                    disabled={!isDirty}
                                >
                                    Save changes
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </RestaurantLayout>
        </>
    );
}
