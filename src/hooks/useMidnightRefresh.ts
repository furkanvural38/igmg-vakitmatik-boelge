// src/hooks/useMidnightRefresh.ts
import { useEffect, useRef } from "react";
import { useClock } from "./useClock";

/**
 * Führt `callback` aus, wenn sich das Datum (Tag) ändert.
 * Nutzt den globalen useClock-Hook für präzises Ticken.
 */
export function useMidnightRefresh(callback: () => void) {
    const clock = useClock(1000); // jede Sekunde
    const prevDayRef = useRef<number>(clock.getDate());

    useEffect(() => {
        const currentDay = clock.getDate();

        // Prüfen, ob sich der Tag geändert hat
        if (currentDay !== prevDayRef.current) {
            prevDayRef.current = currentDay;
            console.log("🌙 Tageswechsel erkannt → Daten neu laden");
            callback();
        }
    }, [clock, callback]);
}
