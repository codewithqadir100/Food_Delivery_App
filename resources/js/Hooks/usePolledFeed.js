import { useEffect, useRef } from "react";
import axios from "axios";

const POLL_INTERVAL_MS = 8000;

export default function usePolledFeed(enabled, url, getParams, onData) {
    const since = useRef(null);
    const onDataRef = useRef(onData);
    const getParamsRef = useRef(getParams);
    onDataRef.current = onData;
    getParamsRef.current = getParams;

    useEffect(() => {
        if (!enabled || !url) return undefined;

        let stopped = false;

        const tick = async () => {
            if (stopped || document.hidden) return;

            try {
                const params = {
                    ...getParamsRef.current(),
                    ...(since.current ? { since: since.current } : {}),
                };
                const { data } = await axios.get(url, { params });

                if (data?.server_time) {
                    since.current = data.server_time;
                }

                onDataRef.current(data);
            } catch {
                // A missed poll should leave the current list in place.
            }
        };

        tick();
        const id = window.setInterval(tick, POLL_INTERVAL_MS);
        const onVisible = () => {
            if (!document.hidden) {
                tick();
            }
        };
        document.addEventListener("visibilitychange", onVisible);

        return () => {
            stopped = true;
            window.clearInterval(id);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [enabled, url]);
}
