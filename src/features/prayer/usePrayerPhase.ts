// src/features/prayer/usePrayerPhase.ts
import { useMemo } from "react";
import type { PrayerTimes } from "../../lib/api";
import { computePrayerPhase, type PrayerPhase } from "./prayerPhase";

/**
 * Bindet die reine Logik an React.
 *
 * Abhängigkeit ist bewusst `minuteOfDay` und nicht ein Date-Objekt: so ist das
 * Ergebnis innerhalb einer Minute referenziell stabil, memoisierte Kacheln
 * rendern nicht jede Sekunde neu, und die Berechnung läuft 1×/min statt
 * 7×/Sekunde (6 Kacheln + Wetterkarte).
 */
export function usePrayerPhase(minuteOfDay: number, prayerTimes: PrayerTimes | null): PrayerPhase {
    return useMemo(
        () => computePrayerPhase(minuteOfDay, prayerTimes),
        [minuteOfDay, prayerTimes]
    );
}
