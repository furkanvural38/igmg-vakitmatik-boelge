// src/features/footerTicker/tickerTiming.ts
//
// Reine Zeitplanung des Fusszeilen-Tickers - kein DOM, keine React.

/** Lesegeschwindigkeit des Marquees in Buehnen-Pixeln pro Sekunde. */
export const SCROLL_SPEED_PX_PER_SEC = 40;

/** Anzeigedauer eines Inhalts, der ohne Scrollen vollstaendig sichtbar ist. */
export const STATIC_DURATION_MS = 20_000;

/** Ruhe am Anfang, damit die erste Bildschirmseite gelesen werden kann. */
export const HOLD_TOP_MS = 5_000;

/** Ruhe am Ende, damit die letzten Zeilen zu Ende gelesen werden koennen. */
export const HOLD_BOTTOM_MS = 4_000;

/**
 * Unterhalb dieser Hoehe lohnt kein Scrollen.
 *
 * Die Buehne ist fest 3840x2160, absolute Pixel sind hier also eine belastbare
 * Groesse. Der Wert faengt Rundung und Zeilendurchschuss ab - alles darueber
 * ist echter, verdeckter Text.
 */
export const OVERFLOW_THRESHOLD_PX = 8;

export interface TickerTiming {
    scrolls: boolean;
    /** Strecke, die der Inhalt zurueklegt. */
    distancePx: number;
    /** Verzoegerung vor dem Losfahren. */
    holdTopMs: number;
    /** Reine Fahrtzeit. */
    travelMs: number;
    /** Standzeit am Ende, bevor weitergeschaltet wird. */
    holdBottomMs: number;
    /** Gesamte Anzeigedauer des Inhalts. */
    totalMs: number;
}

/**
 * Plant Strecke und Dauer aus der verdeckten Hoehe.
 *
 * Die entscheidende Zusicherung: **ein scrollender Inhalt bekommt nie weniger
 * Zeit als ein statischer.** Vorher galt `max(MIN_SCROLL_MS, ...)` mit
 * MIN_SCROLL_MS = 8 s gegen STATIC_DURATION_MS = 20 s - ein laengerer Text
 * verschwand also nach 8 Sekunden, waehrend ein kurzer 20 Sekunden stehen
 * blieb. Genau verkehrt herum.
 *
 * Fehlt Zeit zum Mindestwert, wird die Standzeit am Ende verlaengert: dort
 * steht der vollstaendig aufgedeckte Text, das ist die nuetzlichste Sekunde.
 */
export function planTicker(hiddenPx: number): TickerTiming {
    const hidden = Number.isFinite(hiddenPx) ? Math.max(0, hiddenPx) : 0;

    if (hidden <= OVERFLOW_THRESHOLD_PX) {
        return {
            scrolls: false,
            distancePx: 0,
            holdTopMs: 0,
            travelMs: 0,
            holdBottomMs: 0,
            totalMs: STATIC_DURATION_MS,
        };
    }

    const travelMs = (hidden / SCROLL_SPEED_PX_PER_SEC) * 1_000;
    const natural = HOLD_TOP_MS + travelMs + HOLD_BOTTOM_MS;
    const holdBottomMs = HOLD_BOTTOM_MS + Math.max(0, STATIC_DURATION_MS - natural);

    return {
        scrolls: true,
        distancePx: hidden,
        holdTopMs: HOLD_TOP_MS,
        travelMs,
        holdBottomMs,
        totalMs: HOLD_TOP_MS + travelMs + holdBottomMs,
    };
}
