import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import RestaurantLayout from "@/Layouts/RestaurantLayout";
import Card from "@/Components/Common/Card";
import Button from "@/Components/Common/Button";
import Alert from "@/Components/Common/Alert";
import Badge from "@/Components/Common/Badge";

const PLAN_COPY = {
    free: "One month on the standard listing. After it ends, a paid plan is required.",
    normal: "Standard position in customer listings for your delivery area.",
    featured: "Higher position in customer listings around your restaurant location.",
};

export default function Subscription({
    plans = [],
    subscription = null,
    pendingPayment = null,
    freeUsed = false,
}) {
    const { flash = {}, auth = {}, errors = {} } = usePage().props;
    const onboardingComplete = Boolean(auth?.onboarding?.complete);
    const [processingCode, setProcessingCode] = useState(null);

    const submit = (code) => {
        setProcessingCode(code);
        router.post(
            route("restaurant.subscription.store"),
            { plan: code },
            { onFinish: () => setProcessingCode(null) },
        );
    };

    return (
        <>
            <Head title="Subscription" />
            <RestaurantLayout
                pageTitle="Subscription"
                pageSubtitle="Choose how your restaurant appears to customers"
            >
                <div className="space-y-6">
                    {flash.success && (
                        <Alert type="success" message={flash.success} />
                    )}
                    {flash.error && <Alert type="error" message={flash.error} />}
                    {errors.plan && <Alert type="error" message={errors.plan} />}

                    {!onboardingComplete && (
                        <Alert
                            type="warning"
                            title="Onboarding incomplete"
                            message="Finish your profile, location, menu category, and menu item before choosing a plan."
                            closeable={false}
                        />
                    )}

                    {pendingPayment && (
                        <Alert
                            type="warning"
                            title="Payment pending"
                            message={`${pendingPayment.plan?.name ?? "This"} plan is waiting for payment verification. Your restaurant stays hidden until that payment is verified.`}
                            closeable={false}
                        />
                    )}

                    {subscription?.status === "active" && (
                        <Alert
                            type="success"
                            title="Subscription active"
                            message={`${subscription.plan?.name ?? "Your"} plan is active${subscription.ends_at ? ` until ${new Date(subscription.ends_at).toLocaleDateString()}` : ""}.`}
                            closeable={false}
                        />
                    )}

                    {subscription?.status === "expired" && (
                        <Alert
                            type="warning"
                            title="Subscription expired"
                            message="Customers can see your restaurant as unavailable until a renewal payment is verified."
                            closeable={false}
                        />
                    )}

                    <div className="grid gap-4 md:grid-cols-3">
                        {plans.map((plan) => {
                            const isCurrent = subscription?.plan?.code === plan.code
                                && subscription?.status === "active";
                            const freeBlocked = plan.code === "free" && freeUsed;

                            return (
                                <Card key={plan.code} padding="lg">
                                    <div className="flex h-full flex-col gap-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                                                {plan.name}
                                            </h3>
                                            {plan.listing_tier === "featured" && (
                                                <Badge variant="primary" size="sm">
                                                    Top listing
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-[color:var(--color-text-secondary)]">
                                            {PLAN_COPY[plan.code]}
                                        </p>
                                        <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
                                            {plan.code === "free"
                                                ? "1 month free"
                                                : "Pricing to be announced"}
                                        </p>
                                        <div className="mt-auto">
                                            <Button
                                                fullWidth
                                                variant={isCurrent ? "secondary" : "primary"}
                                                disabled={
                                                    !onboardingComplete
                                                    || processingCode !== null
                                                    || isCurrent
                                                    || freeBlocked
                                                }
                                                loading={processingCode === plan.code}
                                                onClick={() => submit(plan.code)}
                                            >
                                                {isCurrent
                                                    ? "Current plan"
                                                    : freeBlocked
                                                      ? "Already used"
                                                      : plan.code === "free"
                                                        ? "Start free month"
                                                        : "Request this plan"}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </RestaurantLayout>
        </>
    );
}
