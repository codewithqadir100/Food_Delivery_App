import { useRef } from "react";
import usePolledFeed from "@/Hooks/usePolledFeed";

export default function useCustomerOrderUpdates(enabled, onUpdate) {
    const onUpdateRef = useRef(onUpdate);
    onUpdateRef.current = onUpdate;

    usePolledFeed(
        enabled,
        route("customer.orders.feed"),
        () => ({}),
        (data) => onUpdateRef.current(data),
    );
}
