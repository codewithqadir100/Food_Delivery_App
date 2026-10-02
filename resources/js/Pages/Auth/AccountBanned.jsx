import { Ban } from "lucide-react";
import { Head } from "@inertiajs/react";
import AuthLayout from "@/Layouts/AuthenticatedLayout";
import Card from "@/Components/Common/Card";

export default function AccountBanned({ signedIn = false }) {
    return (
        <AuthLayout>
            <Head title="Account Banned" />

            <Card padding="lg" className="mx-auto w-full max-w-xl">
                <div className="space-y-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[var(--radius-full)] bg-[color:var(--color-danger-50)] text-[color:var(--color-danger-600)]">
                        <Ban size={32} aria-hidden="true" />
                    </div>

                    <div>
                        <h2 className="mb-2 text-2xl font-bold text-[color:var(--color-text-primary)]">
                            Your account has been banned
                        </h2>
                        <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
                            {signedIn
                                ? "This restaurant account was removed. Refresh the page to sign out. You will not be able to use this account again."
                                : "This restaurant account was removed and can no longer be used to sign in."}
                        </p>
                    </div>
                </div>
            </Card>
        </AuthLayout>
    );
}
