import { useEffect, useRef } from "react";
import axios from "axios";

const POLL_INTERVAL_MS = 8000;

export default function useIncomingOrders(enabled, latestOrderId, onIncoming) {
    const afterId = useRef(latestOrderId ?? 0);
    const onIncomingRef = useRef(onIncoming);
    onIncomingRef.current = onIncoming;

    useEffect(() => {
        if ((latestOrderId ?? 0) > afterId.current) {
            afterId.current = latestOrderId;
        }
    }, [latestOrderId]);

    useEffect(() => {
        if (!enabled) return undefined;

        let stopped = false;

        const tick = async () => {
            if (stopped || document.hidden) return;

            try {
                const { data } = await axios.get(route("restaurant.orders.feed"), {
                    params: { after_id: afterId.current },
                });

                for (const order of data.orders ?? []) {
                    if (order.id > afterId.current) {
                        afterId.current = order.id;
                    }
                }

                onIncomingRef.current(data);
            } catch {
                // A missed poll should leave the current list in place.
            }
        };

        const id = window.setInterval(tick, POLL_INTERVAL_MS);

        return () => {
            stopped = true;
            window.clearInterval(id);
        };
    }, [enabled]);
}
