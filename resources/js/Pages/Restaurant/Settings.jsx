import { Head, useForm, usePage } from "@inertiajs/react";
import { Mail } from "lucide-react";
import RestaurantLayout from "@/Layouts/RestaurantLayout";
import Card from "@/Components/Common/Card";
import Button from "@/Components/Common/Button";
import Alert from "@/Components/Common/Alert";
import PasswordInput from "@/Components/Forms/PasswordInput";
import ReadOnlyTextInput from "@/Components/Forms/ReadOnlyTextInput";
import HomeChefChoice from "@/Components/Restaurant/HomeChefChoice";

function SectionHeading({ title, description }) {
    return (
        <div>
            <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                {title}
            </h2>
            <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                {description}
            </p>
        </div>
    );
}

export default function Settings({ isHomeChef = false }) {
    const { flash = {}, auth = {} } = usePage().props;
    const email = auth.user?.email ?? "";

    const kitchen = useForm({
        is_home_chef: Boolean(isHomeChef),
    });

    const passwordForm = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const saveKitchen = (event) => {
        event.preventDefault();
        kitchen.patch(route("restaurant.settings.update"), {
            preserveScroll: true,
        });
    };

    const savePassword = (event) => {
        event.preventDefault();
        passwordForm.put(route("restaurant.settings.password"), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    return (
        <>
            <Head title="Settings" />
            <RestaurantLayout
                pageTitle="Settings"
                pageSubtitle="Manage your restaurant type and account"
            >
                <div className="mx-auto flex max-w-3xl flex-col gap-6">
                    {flash.success && (
                        <Alert type="success" message={flash.success} />
                    )}
                    {flash.error && (
                        <Alert type="error" message={flash.error} />
                    )}

                    <Card
                        padding="lg"
                        header={
                            <SectionHeading
                                title="Restaurant type"
                                description="Choose how customers will be able to find your restaurant."
                            />
                        }
                    >
                        <form onSubmit={saveKitchen} className="space-y-6">
                            <HomeChefChoice
                                value={kitchen.data.is_home_chef}
                                onChange={(value) =>
                                    kitchen.setData("is_home_chef", value)
                                }
                                error={kitchen.errors.is_home_chef}
                            />

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    loading={kitchen.processing}
                                    disabled={!kitchen.isDirty}
                                >
                                    Save restaurant type
                                </Button>
                            </div>
                        </form>
                    </Card>

                    <Card
                        padding="lg"
                        header={
                            <SectionHeading
                                title="Account"
                                description="Your sign-in email and password for this restaurant."
                            />
                        }
                    >
                        <div className="space-y-8">
                            <ReadOnlyTextInput
                                label="Email"
                                value={email}
                                icon={<Mail size={16} />}
                                helpText="This email is tied to your restaurant account and cannot be changed here."
                            />

                            <form
                                onSubmit={savePassword}
                                className="space-y-5 border-t border-[color:var(--color-border-light)] pt-8"
                            >
                                <div>
                                    <h3 className="font-semibold text-[color:var(--color-text-primary)]">
                                        Change password
                                    </h3>
                                    <p className="mt-1 text-sm leading-5 text-[color:var(--color-text-muted)]">
                                        Enter your current password, then choose
                                        a new one. If you signed in with Google
                                        and have not set a password, use Forgot
                                        password on the login page.
                                    </p>
                                </div>

                                <PasswordInput
                                    label="Current password"
                                    value={passwordForm.data.current_password}
                                    onChange={(event) =>
                                        passwordForm.setData(
                                            "current_password",
                                            event.target.value,
                                        )
                                    }
                                    error={passwordForm.errors.current_password}
                                    autoComplete="current-password"
                                    required
                                />

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <PasswordInput
                                        label="New password"
                                        value={passwordForm.data.password}
                                        onChange={(event) =>
                                            passwordForm.setData(
                                                "password",
                                                event.target.value,
                                            )
                                        }
                                        error={passwordForm.errors.password}
                                        autoComplete="new-password"
                                        required
                                    />

                                    <PasswordInput
                                        label="Confirm password"
                                        value={
                                            passwordForm.data
                                                .password_confirmation
                                        }
                                        onChange={(event) =>
                                            passwordForm.setData(
                                                "password_confirmation",
                                                event.target.value,
                                            )
                                        }
                                        error={
                                            passwordForm.errors
                                                .password_confirmation
                                        }
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        loading={passwordForm.processing}
                                        disabled={
                                            !passwordForm.data
                                                .current_password ||
                                            !passwordForm.data.password ||
                                            !passwordForm.data
                                                .password_confirmation
                                        }
                                    >
                                        Update password
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            </RestaurantLayout>
        </>
    );
}
