import { useEffect, useRef, useState } from "react";
import { usePage } from "@inertiajs/react";
import ReviewPromptModal from "@/Components/Customer/ReviewPromptModal";
import usePolledFeed from "@/Hooks/usePolledFeed";

const SNOOZE_KEY = "review_prompt_snoozed";
const RETURN_DELAY_MS = 5000;

if (typeof window !== "undefined" && !window.__reviewPromptBooted) {
    window.__reviewPromptBooted = true;
    window.__reviewPromptOpenedAt = Date.now();
    sessionStorage.removeItem(SNOOZE_KEY);
}

function snoozed() {
    return sessionStorage.getItem(SNOOZE_KEY) === "1";
}

export default function ReviewPrompt() {
    const { url, props } = usePage();
    const isCustomer = Boolean(props.auth?.user?.is_customer);
    const onCheckout = String(url || "").includes("/checkout");
    const [order, setOrder] = useState(null);
    const shown = useRef(false);
    const scheduled = useRef(false);
    const delayTimer = useRef(null);

    useEffect(() => () => window.clearTimeout(delayTimer.current), []);

    usePolledFeed(
        isCustomer && !onCheckout,
        route("customer.reviews.prompt"),
        () => ({}),
        (data) => {
            if (shown.current || scheduled.current || snoozed() || !data?.order) {
                return;
            }

            const reveal = () => {
                if (shown.current || snoozed()) {
                    return;
                }

                shown.current = true;
                sessionStorage.setItem(SNOOZE_KEY, "1");
                setOrder(data.order);
            };

            if ((data.order.dismissals ?? 0) >= 1) {
                scheduled.current = true;
                const openedAt = window.__reviewPromptOpenedAt ?? Date.now();
                const wait = Math.max(0, RETURN_DELAY_MS - (Date.now() - openedAt));
                delayTimer.current = window.setTimeout(reveal, wait);
                return;
            }

            reveal();
        },
    );

    return (
        <ReviewPromptModal
            order={order}
            isOpen={Boolean(order)}
            intent="prompt"
            onClose={() => setOrder(null)}
            onSubmitted={(data) => {
                window.dispatchEvent(
                    new CustomEvent("review-submitted", {
                        detail: {
                            restaurantId: order?.restaurant_id,
                            summary: data.summary,
                        },
                    }),
                );
            }}
        />
    );
}
