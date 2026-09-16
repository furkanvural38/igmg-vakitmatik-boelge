import { useEffect, useRef } from "react";

/**
 * Führt `callback` beim lokalen Tageswechsel aus und plant sich danach neu.
 *
 * Der Callback liegt in einer Ref: sonst würde jede neue Funktionsidentität den
 * Effekt neu aufsetzen und den Timer zurücksetzen — bei einem Timer, der bis zu
 * 24 Stunden läuft, kann er so beliebig oft verschoben werden.
 */
export function useMidnightRefresh(callback: () => void) {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        let timeoutId: number | undefined;

        const scheduleNextMidnight = () => {
            const now = new Date();
            const next = new Date(now);
            next.setHours(24, 0, 0, 0); // nächste lokale Mitternacht

            // Eine Sekunde Puffer: exakt auf 00:00:00 zu feuern trifft gelegentlich
            // noch den Vortag, wenn der Timer minimal zu früh auslöst.
            const delay = Math.max(1_000, next.getTime() - now.getTime() + 1_000);

            timeoutId = window.setTimeout(() => {
                callbackRef.current();
                scheduleNextMidnight();
            }, delay);
        };

        scheduleNextMidnight();
        return () => {
            if (timeoutId !== undefined) clearTimeout(timeoutId);
        };
    }, []);
}
