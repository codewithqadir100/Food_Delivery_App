import { Link } from "@inertiajs/react";
import { CheckCircle2, Circle } from "lucide-react";
import DashboardCard from "@/Components/Restaurant/Dashboard/DashboardCard";
import Button from "@/Components/Common/Button";

const STEPS = [
    {
        key: "profile",
        label: "Profile",
        description: "Add a phone number for your restaurant.",
        href: "restaurant.profile.edit",
    },
    {
        key: "location",
        label: "Location",
        description: "Set your map location, city, and delivery radius.",
        href: "restaurant.profile.edit",
    },
    {
        key: "menu_category",
        label: "Menu category",
        description: "Create at least one menu category.",
        href: "restaurant.menu",
    },
    {
        key: "menu_item",
        label: "Menu item",
        description: "Add at least one menu item.",
        href: "restaurant.menu.items.create",
    },
];

export default function OnboardingChecklist({ onboarding }) {
    return (
        <DashboardCard
            title="Finish onboarding"
            subtitle="These steps follow what is saved on your restaurant."
        >
            <div className="space-y-3">
                {STEPS.map((step) => {
                    const complete = Boolean(onboarding?.[step.key]);

                    return (
                        <div
                            key={step.key}
                            className="flex flex-col gap-3 rounded-lg border border-[color:var(--color-border-light)] p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex items-start gap-3">
                                {complete ? (
                                    <CheckCircle2
                                        size={20}
                                        className="mt-0.5 shrink-0 text-[color:var(--color-success-600)]"
                                    />
                                ) : (
                                    <Circle
                                        size={20}
                                        className="mt-0.5 shrink-0 text-[color:var(--color-text-muted)]"
                                    />
                                )}
                                <div>
                                    <p className="font-medium text-[color:var(--color-text-primary)]">
                                        {step.label}
                                    </p>
                                    <p className="text-sm text-[color:var(--color-text-secondary)]">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                            {!complete && (
                                <Link href={route(step.href)}>
                                    <Button variant="secondary" size="sm">
                                        Continue
                                    </Button>
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>
        </DashboardCard>
    );
}
