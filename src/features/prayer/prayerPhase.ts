// src/features/prayer/prayerPhase.ts
//
// Reine Gebetszeiten-Logik — kein React, keine Uhr, keine Seiteneffekte.
// Genau deshalb ist sie testbar: siehe prayerPhase.test.ts.

import { PRAYER_ORDER, type PrayerKey, type PrayerTimes } from "../../lib/api";

export const MINUTES_PER_DAY = 1440;

/**
 * Ab wann die aktive Kachel in den Warnzustand geht.
 *
 * Vorher war das ein Prozentwert (">90 % des Fensters"). Das bedeutete beim
 * langen Nachmittagsfenster ~30 Minuten und beim kurzen İmsak–Güneş-Fenster
 * ~9 Minuten: dieselbe Farbe mit jedes Mal anderer Aussage. Minuten sind eine
 * Aussage, Prozent sind es nicht.
 */
export const WARN_BEFORE_NEXT_MINUTES = 15;

export interface PrayerPhase {
    /** Gebet, dessen Fenster gerade läuft. */
    currentPrayer: PrayerKey | null;
    /** Minuten bis zum Beginn des nächsten Fensters. */
    minutesUntilNext: number;
    /** Anzeigetext, z. B. "6h 5min" bzw. "12min" in der letzten Stunde. */
    remainingLabel: string;
    /** 0–100: Fortschritt im laufenden Fenster. */
    progressPercentage: number;
    /** true in den letzten WARN_BEFORE_NEXT_MINUTES des Fensters. */
    endingSoon: boolean;
}

export const EMPTY_PHASE: PrayerPhase = {
    currentPrayer: null,
    minutesUntilNext: 0,
    remainingLabel: "--",
    progressPercentage: 0,
    endingSoon: false,
};

/** "05:20" -> 320. Gibt null zurück, wenn das Format nicht stimmt. */
export function parseTimeToMinutes(value: string): number | null {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value);
    if (!match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return null;

    return hours * 60 + minutes;
}

export function formatRemaining(diffMinutes: number): string {
    const safe = Math.max(0, diffMinutes);
    const hours = Math.floor(safe / 60);
    const minutes = safe % 60;
    // "0h 5min" liest sich schlecht — gerade dann, wenn es am meisten zählt.
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
}

/**
 * Bestimmt das laufende Gebetsfenster für eine Minute des Tages.
 *
 * Die sechs Zeiten teilen den 1440-Minuten-Kreis lückenlos in sechs Fenster:
 * [fajr, sunrise), [sunrise, dhuhr), … , [isha, fajr). Weil PRAYER_ORDER
 * zyklisch sortiert ist, summieren sich die Fensterlängen exakt zu 1440 — die
 * Rechnung trägt damit auch, wenn Yatsı im Hochsommer erst nach Mitternacht
 * beginnt und die Zeiten nicht mehr aufsteigend sind.
 */
export function computePrayerPhase(
    minuteOfDay: number,
    prayerTimes: PrayerTimes | null
): PrayerPhase {
    if (!prayerTimes) return EMPTY_PHASE;

    const slots: Array<{ key: PrayerKey; minutes: number }> = [];
    for (const key of PRAYER_ORDER) {
        const minutes = parseTimeToMinutes(prayerTimes.times[key]);
        // Defensiv: api.ts validiert bereits, aber lieber "--" als NaN auf dem Display.
        if (minutes === null) return EMPTY_PHASE;
        slots.push({ key, minutes });
    }

    const current = ((minuteOfDay % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

    for (let i = 0; i < slots.length; i++) {
        const start = slots[i].minutes;
        const end = slots[(i + 1) % slots.length].minutes;

        const span = (end - start + MINUTES_PER_DAY) % MINUTES_PER_DAY;
        const elapsed = (current - start + MINUTES_PER_DAY) % MINUTES_PER_DAY;

        // span === 0 (zwei identische Zeiten) -> leeres Fenster, überspringen.
        if (span === 0 || elapsed >= span) continue;

        const minutesUntilNext = span - elapsed;

        return {
            currentPrayer: slots[i].key,
            minutesUntilNext,
            remainingLabel: formatRemaining(minutesUntilNext),
            progressPercentage: Math.min(100, Math.max(0, Math.round((elapsed / span) * 100))),
            endingSoon: minutesUntilNext <= WARN_BEFORE_NEXT_MINUTES,
        };
    }

    // Erreichbar nur bei kaputten Daten (alle sechs Zeiten identisch).
    return EMPTY_PHASE;
}
