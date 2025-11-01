// src/hooks/useClock.ts
import { useEffect, useState } from "react";

export function useClock(updateMs: number = 1000) {
    const [now, setNow] = useState<Date>(() => new Date());

    useEffect(() => {
        const id = setInterval(() => {
            setNow(new Date());
        }, updateMs);

        return () => clearInterval(id);
    }, [updateMs]);

    return now;
}
