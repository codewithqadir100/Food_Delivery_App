import { useEffect, useRef } from "react";
import usePolledFeed from "@/Hooks/usePolledFeed";

export default function useIncomingOrders(enabled, latestOrderId, onIncoming) {
    const afterId = useRef(latestOrderId ?? 0);
    const onIncomingRef = useRef(onIncoming);
    onIncomingRef.current = onIncoming;
    const trackNew = latestOrderId != null;

    useEffect(() => {
        if (latestOrderId != null && latestOrderId > afterId.current) {
            afterId.current = latestOrderId;
        }
    }, [latestOrderId]);

    usePolledFeed(
        enabled,
        route("restaurant.orders.feed"),
        () => (trackNew ? { after_id: afterId.current } : {}),
        (data) => {
            if (trackNew) {
                for (const order of data.orders ?? []) {
                    if (order.id > afterId.current) {
                        afterId.current = order.id;
                    }
                }
            }

            onIncomingRef.current(data);
        },
    );
}
