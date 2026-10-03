import { Head, useForm, usePage } from "@inertiajs/react";
import { Check, Mail, Phone, User } from "lucide-react";
import AppLayout from "@/Layouts/AppLayout";
import Alert from "@/Components/Common/Alert";
import Badge from "@/Components/Common/Badge";
import Button from "@/Components/Common/Button";
import Card from "@/Components/Common/Card";
import PasswordInput from "@/Components/Forms/PasswordInput";
import ReadOnlyTextInput from "@/Components/Forms/ReadOnlyTextInput";
import TextInput from "@/Components/Forms/TextInput";

function initials(name) {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return "?";
    }

    if (parts.length === 1) {
        return parts[0].slice(0, 1).toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

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

export default function Profile({ profile }) {
    const { flash = {} } = usePage().props;

    const details = useForm({
        name: profile.name ?? "",
        phone: profile.phone ?? "",
    });

    const passwordForm = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const saveDetails = (event) => {
        event.preventDefault();
        details.patch(route("customer.profile.update"), {
            preserveScroll: true,
        });
    };

    const savePassword = (event) => {
        event.preventDefault();
        passwordForm.put(route("customer.profile.password"), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    const passwordReady =
        passwordForm.data.current_password !== "" &&
        passwordForm.data.password !== "" &&
        passwordForm.data.password_confirmation !== "";

    return (
        <>
            <Head title="My Profile" />
            <AppLayout>
                <div className="mx-auto flex max-w-2xl flex-col gap-[var(--spacing-6)]">
                    <div>
                        <h1 className="restaurant-main-heading">My Profile</h1>
                        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                            Update your name, phone, and password. Your email
                            stays linked to this account.
                        </p>
                    </div>

                    {flash.success && (
                        <Alert type="success" message={flash.success} />
                    )}
                    {flash.error && (
                        <Alert type="error" message={flash.error} />
                    )}

                    <Card padding="lg" shadow>
                        <div className="flex items-center gap-[var(--spacing-4)]">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary-50)] text-xl font-semibold text-[color:var(--color-primary-700)]">
                                {initials(profile.name ?? "")}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-xl font-semibold text-[color:var(--color-text-primary)]">
                                    {profile.name}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <p className="truncate text-sm text-[color:var(--color-text-muted)]">
                                        {profile.email}
                                    </p>
                                    {profile.email_verified && (
                                        <Badge variant="success" size="sm">
                                            <Check size={12} />
                                            Verified
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card
                        padding="lg"
                        header={
                            <SectionHeading
                                title="Personal details"
                                description="This is the name and phone restaurants see on your orders."
                            />
                        }
                    >
                        <form
                            onSubmit={saveDetails}
                            className="space-y-[var(--spacing-5)]"
                        >
                            <TextInput
                                label="Name"
                                value={details.data.name}
                                onChange={(event) =>
                                    details.setData("name", event.target.value)
                                }
                                error={details.errors.name}
                                icon={<User size={16} />}
                                autoComplete="name"
                                required
                            />

                            <TextInput
                                label="Phone"
                                type="tel"
                                value={details.data.phone}
                                onChange={(event) =>
                                    details.setData("phone", event.target.value)
                                }
                                error={details.errors.phone}
                                icon={<Phone size={16} />}
                                autoComplete="tel"
                                required
                            />

                            <ReadOnlyTextInput
                                label="Email"
                                value={profile.email}
                                icon={<Mail size={16} />}
                                helpText="Email cannot be changed."
                            />

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    loading={details.processing}
                                    disabled={!details.isDirty}
                                >
                                    Save details
                                </Button>
                            </div>
                        </form>
                    </Card>

                    <Card
                        padding="lg"
                        header={
                            <SectionHeading
                                title="Password"
                                description="Enter your current password, then choose a new one. If you signed in with Google and have not set a password, use Forgot password on the login page."
                            />
                        }
                    >
                        <form
                            onSubmit={savePassword}
                            className="space-y-[var(--spacing-5)]"
                        >
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

                            <div className="grid grid-cols-1 gap-[var(--spacing-5)] sm:grid-cols-2">
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
                                        passwordForm.data.password_confirmation
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
                                    disabled={!passwordReady}
                                >
                                    Update password
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </AppLayout>
        </>
    );
}
