import { Head, Link, useForm } from "@inertiajs/react";
import AuthLayout from "@/Layouts/AuthenticatedLayout";
import Card from "@/Components/Common/Card";
import Button from "@/Components/Common/Button";
import TextInput from "@/Components/Forms/TextInput";
import PasswordInput from "@/Components/Forms/PasswordInput";
import { User, Mail, Shield } from "lucide-react";

export default function AdminRegister() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("admin.register"));
    };

    return (
        <AuthLayout>
            <Head title="Admin Register" />

            <Card padding="lg">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-[color:var(--color-text-primary)] mb-1">
                            Admin Registration
                        </h2>
                        <p className="text-sm text-[color:var(--color-text-secondary)]">
                            Create an admin account for FoodHub
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <TextInput
                            type="text"
                            placeholder="Full Name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            error={errors.name}
                            icon={<User size={16} />}
                            autoComplete="name"
                            required
                        />

                        <TextInput
                            type="email"
                            placeholder="admin@email.com"
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
                            icon={Shield}
                        >
                            Create Admin Account
                        </Button>
                    </form>

                    <div className="text-center text-sm border-t border-[color:var(--color-border-light)] pt-4">
                        <span className="text-[color:var(--color-text-secondary)]">
                            Already have an account?{" "}
                        </span>
                        <Link
                            href={route("admin.login")}
                            className="text-[color:var(--color-primary-600)] hover:text-[color:var(--color-primary-700)] font-medium"
                        >
                            Login here
                        </Link>
                    </div>
                </div>
            </Card>
        </AuthLayout>
    );
}
