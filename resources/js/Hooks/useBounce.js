import { useState } from "react";

export function useBounce() {
    const [tick, setTick] = useState(0);

    return {
        bounce: () => setTick((current) => current + 1),
        bounceTick: tick,
        bounceClassName: tick > 0 ? "animate-bounce-in" : "",
    };
}
