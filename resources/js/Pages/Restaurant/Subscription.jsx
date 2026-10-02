import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import RestaurantLayout from "@/Layouts/RestaurantLayout";
import Card from "@/Components/Common/Card";
import Button from "@/Components/Common/Button";
import Alert from "@/Components/Common/Alert";
import Badge from "@/Components/Common/Badge";
import { formatCurrency } from "@/Utils/formatCurrency";

const PLAN_COPY = {
    free: {
        summary: "Try the standard listing before a paid plan.",
        points: ["Standard position in your area", "One time only"],
    },
    normal: {
        summary: "Stay in the standard customer listing.",
        points: [
            "Standard position in your area",
            "Renews after payment is verified",
        ],
    },
    featured: {
        summary: "Appear above standard restaurants nearby.",
        points: ["Listed above standard restaurants", "Same delivery area"],
    },
};

function planPrice(plan) {
    if (plan.price_amount === null || plan.price_amount === undefined) {
        return "Price to be announced";
    }

    if (Number(plan.price_amount) === 0) {
        return "Free";
    }

    return formatCurrency(plan.price_amount);
}

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
                <div className="space-y-[var(--spacing-6)]">
                    {flash.success && (
                        <Alert type="success" message={flash.success} />
                    )}
                    {flash.error && (
                        <Alert type="error" message={flash.error} />
                    )}
                    {errors.plan && (
                        <Alert type="error" message={errors.plan} />
                    )}

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

                    <div className="grid grid-cols-1 sm:grid-cols-2 items-stretch gap-[var(--spacing-4)] xl:grid-cols-3">
                        {plans.map((plan) => {
                            const copy = PLAN_COPY[plan.code];
                            const isCurrent =
                                subscription?.plan?.code === plan.code &&
                                subscription?.status === "active";
                            const freeBlocked =
                                plan.code === "free" && freeUsed;

                            return (
                                <Card
                                    key={plan.code}
                                    padding="lg"
                                    className={`flex h-full flex-col ${
                                        isCurrent
                                            ? "ring-2 ring-[color:var(--color-primary-500)]"
                                            : ""
                                    }`}
                                    bodyClassName="flex flex-1 flex-col"
                                >
                                    <div className="flex h-full flex-1 flex-col gap-[var(--spacing-4)]">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                                                {plan.name}
                                            </h3>
                                            {plan.listing_tier ===
                                                "featured" && (
                                                <Badge
                                                    variant="primary"
                                                    size="sm"
                                                >
                                                    Top listing
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-[color:var(--color-text-secondary)]">
                                            {copy?.summary}
                                        </p>
                                        {copy?.points?.length > 0 && (
                                            <ul className="space-y-[var(--spacing-2)] text-sm text-[color:var(--color-text-secondary)]">
                                                {copy.points.map((point) => (
                                                    <li
                                                        key={point}
                                                        className="flex gap-[var(--spacing-2)]"
                                                    >
                                                        <span
                                                            aria-hidden
                                                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-primary-500)]"
                                                        />
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <div className="space-y-1">
                                            <p className="text-sm text-[color:var(--color-text-muted)]">
                                                {plan.duration_days} days
                                            </p>
                                            <p className="text-base font-semibold text-[color:var(--color-text-primary)]">
                                                {planPrice(plan)}
                                            </p>
                                        </div>
                                        <div className="mt-auto">
                                            <Button
                                                fullWidth
                                                variant={
                                                    isCurrent
                                                        ? "secondary"
                                                        : "primary"
                                                }
                                                disabled={
                                                    !onboardingComplete ||
                                                    processingCode !== null ||
                                                    isCurrent ||
                                                    freeBlocked
                                                }
                                                loading={
                                                    processingCode === plan.code
                                                }
                                                onClick={() =>
                                                    submit(plan.code)
                                                }
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
