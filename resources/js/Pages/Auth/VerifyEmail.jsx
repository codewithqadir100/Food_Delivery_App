import { Head, useForm } from "@inertiajs/react";
import AuthLayout from "@/Layouts/AuthenticatedLayout";
import Card from "@/Components/Common/Card";
import Button from "@/Components/Common/Button";
import Alert from "@/Components/Common/Alert";
import { Mail } from "lucide-react";

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const resend = (e) => {
        e.preventDefault();
        post(route("verification.send"));
    };

    return (
        <AuthLayout>
            <Head title="Verify Email" />

            <Card padding="lg" className="w-full max-w-xl mx-auto">
                <div className="space-y-6">
                    {status === "verification-link-sent" && (
                        <Alert
                            type="success"
                            message="A new verification link has been sent to your email address."
                        />
                    )}

                    <div>
                        <h2 className="text-2xl font-bold text-[color:var(--color-text-primary)] mb-2">
                            Verify your email
                        </h2>
                        <p className="text-sm text-[color:var(--color-text-secondary)]">
                            We sent a verification link to your email. Open it
                            to continue restaurant onboarding. Profile, location,
                            and menu stay locked until this is confirmed.
                        </p>
                    </div>

                    <form onSubmit={resend}>
                        <Button
                            type="submit"
                            fullWidth
                            loading={processing}
                            icon={Mail}
                        >
                            Resend verification email
                        </Button>
                    </form>
                </div>
            </Card>
        </AuthLayout>
    );
}
