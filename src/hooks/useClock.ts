// src/hooks/useClock.ts
import { useEffect, useState } from "react";

/**
 * Präziser, drift-korrigierter Uhr-Hook.
 * - tickt auf die nächste Taktgrenze (z. B. exakt jede Sekunde)
 * - robust gegen Mainthread-Blockaden (reschedult)
 * - resynchronisiert bei Sichtbarkeitswechsel
 *
 * API bleibt kompatibel: gibt ein Date-Objekt zurück.
 */
export function useClock(updateMs: number = 1000) {
    const [now, setNow] = useState<Date>(() => new Date());

    useEffect(() => {
        let cancelled = false;
        let timerId: number | undefined;

        const scheduleNextTick = () => {
            const t = Date.now();
            const next = t - (t % updateMs) + updateMs; // nächste Taktgrenze
            const delay = Math.max(0, next - t);
            timerId = window.setTimeout(onTick, delay);
        };

        const onTick = () => {
            if (cancelled) return;
            setNow(new Date());
            scheduleNextTick();
        };

        const onVisibilityChange = () => {
            if (cancelled) return;
            // Bei Sichtbarkeitswechsel sofort aktualisieren und neu ausrichten
            if (typeof timerId === "number") clearTimeout(timerId);
            setNow(new Date());
            scheduleNextTick();
        };

        // initial ausrichten
        scheduleNextTick();
        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            cancelled = true;
            if (typeof timerId === "number") clearTimeout(timerId);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, [updateMs]);

    return now;
}
