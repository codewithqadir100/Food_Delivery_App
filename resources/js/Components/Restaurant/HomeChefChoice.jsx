import { ChefHat, Store } from "lucide-react";
import FormLabel from "@/Components/Forms/FormLabel";
import FormError from "@/Components/Forms/FormError";
import Toggle from "@/Components/Common/Toggle";

export default function HomeChefChoice({ value, onChange, error }) {
    return (
        <div>
            <FormLabel required>Are you a home chef?</FormLabel>
            <p className="mb-3 text-sm text-[color:var(--color-text-secondary)]">
                Home chefs stay on the same restaurant account. This choice is
                saved so customers can filter for home chefs later.
            </p>
            <Toggle
                value={Boolean(value)}
                onChange={onChange}
                activeLabel="Yes"
                inactiveLabel="No"
                activeIcon={ChefHat}
                inactiveIcon={Store}
                fullWidth
            />
            <FormError message={error} />
        </div>
    );
}
