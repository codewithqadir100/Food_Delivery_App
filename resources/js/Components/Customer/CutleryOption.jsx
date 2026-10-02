import { Utensils } from "lucide-react";
import Switch from "@/Components/Common/Switch";

export default function CutleryOption({
    value = false,
    onChange,
    disabled = false,
}) {
    const included = Boolean(value);

    return (
        <div className="flex items-center gap-[var(--spacing-3)]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-bg-tertiary)] text-[color:var(--color-text-secondary)]">
                <Utensils size={18} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                    Cutlery
                </p>
                <p className="mt-0.5 text-xs leading-5 text-[color:var(--color-text-secondary)]">
                    {included
                        ? "Cutlery will be included with this order. If available"
                        : "No cutlery provided. Thanks for reducing waste!"}
                </p>
            </div>
            <Switch
                checked={included}
                onChange={onChange}
                disabled={disabled}
                label="Cutlery"
            />
        </div>
    );
}
