import { ChefHat, Store } from "lucide-react";
import FormError from "@/Components/Forms/FormError";
import Toggle from "@/Components/Common/Toggle";

export default function HomeChefChoice({ value, onChange, error }) {
    return (
        <div className="space-y-[var(--spacing-2)]">
            <div className="flex flex-col gap-[var(--spacing-3)] rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] p-[var(--spacing-4)] sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-[var(--spacing-3)]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary-50)] text-[color:var(--color-primary-600)]">
                        <ChefHat size={18} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-[color:var(--color-text-primary)]">
                            Are you a home chef?
                        </h3>
                        <p className="mt-1 text-sm leading-5 text-[color:var(--color-text-secondary)]">
                            Same restaurant account. Customers can filter for
                            home chefs.
                        </p>
                    </div>
                </div>

                <div className="w-full sm:w-auto sm:shrink-0">
                    <Toggle
                        fullWidth
                        className="sm:w-fit"
                        value={Boolean(value)}
                        onChange={onChange}
                        activeLabel="Yes"
                        inactiveLabel="No"
                        activeIcon={ChefHat}
                        inactiveIcon={Store}
                    />
                </div>
            </div>

            <FormError message={error} />
        </div>
    );
}
