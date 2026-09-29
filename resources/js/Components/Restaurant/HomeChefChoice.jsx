import { ChefHat, Store } from "lucide-react";
import FormError from "@/Components/Forms/FormError";
import Toggle from "@/Components/Common/Toggle";

export default function HomeChefChoice({ value, onChange, error }) {
    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-4 rounded-[var(--radius-md)] border border-[var(--color-border-light)] bg-[var(--color-primary-50)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="min-w-0">
                    <h3 className="font-semibold text-[color:var(--color-text-primary)]">
                        Are you a home chef?
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-[color:var(--color-text-muted)]">
                        Home chefs stay on the same restaurant account. This
                        choice is saved so customers can filter for home chefs
                        later.
                    </p>
                </div>

                <div className="shrink-0 max-sm:mx-auto">
                    <Toggle
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
