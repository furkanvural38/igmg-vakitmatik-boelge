import { useEffect } from "react";

/**
 * Führt `callback` exakt bei Tageswechsel aus (lokale Zeit).
 * Kein Sekundentick. Plant sich nach Ausführung neu.
 */
export function useMidnightRefresh(callback: () => void) {
    useEffect(() => {
        let timeoutId: number | null = null;

        const scheduleNextMidnight = () => {
            const now = new Date();
            const next = new Date(now);
            // nächste lokale Mitternacht
            next.setHours(24, 0, 0, 0);

            const delay = Math.max(0, next.getTime() - now.getTime());
            timeoutId = window.setTimeout(() => {
                callback();
                scheduleNextMidnight(); // nach dem Refresh erneut planen
            }, delay);
        };

        scheduleNextMidnight();
        return () => {
            if (timeoutId != null) {
                clearTimeout(timeoutId);
            }
        };
    }, [callback]);
}
