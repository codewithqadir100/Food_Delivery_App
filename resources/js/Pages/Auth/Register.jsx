import { Head, Link, useForm } from "@inertiajs/react";
import AuthLayout from "@/Layouts/AuthenticatedLayout";
import Button from "@/Components/Common/Button";
import TextInput from "@/Components/Forms/TextInput";
import PasswordInput from "@/Components/Forms/PasswordInput";
import Card from "@/Components/Common/Card";
import GoogleAuthButton from "@/Components/Auth/GoogleAuthButton";
import { User, Mail, Phone, UserPlus } from "lucide-react";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <AuthLayout>
            <Head title="Register" />

            <Card padding="lg" className="mb-6">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-[color:var(--color-text-primary)] mb-1">
                            Create Account
                        </h2>
                        <p className="text-sm text-[color:var(--color-text-secondary)]">
                            Join FoodHub and order delicious food
                        </p>
                    </div>

                    <GoogleAuthButton intent="customer" />

                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-[color:var(--color-border-light)]" />
                        <span className="text-xs text-[color:var(--color-text-muted)]">
                            or
                        </span>
                        <div className="h-px flex-1 bg-[color:var(--color-border-light)]" />
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <TextInput
                            type="text"
                            placeholder="Hafeez"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            error={errors.name}
                            icon={<User size={16} />}
                            autoComplete="name"
                            required
                        />

                        <TextInput
                            type="tel"
                            placeholder="03XXXXXXXXX"
                            value={data.phone}
                            onChange={(e) => setData("phone", e.target.value)}
                            error={errors.phone}
                            icon={<Phone size={16} />}
                            autoComplete="tel"
                            required
                        />

                        <TextInput
                            type="email"
                            placeholder="your@email.com"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            error={errors.email}
                            icon={<Mail size={16} />}
                            autoComplete="email"
                            required
                        />

                        <PasswordInput
                            label="Password"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            error={errors.password}
                            required
                        />

                        <PasswordInput
                            label="Confirm Password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                            error={errors.password_confirmation}
                            required
                        />

                        <Button
                            type="submit"
                            fullWidth
                            loading={processing}
                            icon={UserPlus}
                        >
                            Create Account
                        </Button>
                    </form>
                </div>
            </Card>

            <div className="text-center text-sm border-t border-[color:var(--color-border-light)] pt-4">
                <span className="text-[color:var(--color-text-secondary)]">
                    Already have an account?{" "}
                </span>
                <Link
                    href={route("login")}
                    className="text-[color:var(--color-primary-600)] hover:text-[color:var(--color-primary-700)] font-medium"
                >
                    Sign in
                </Link>
            </div>
        </AuthLayout>
    );
}
