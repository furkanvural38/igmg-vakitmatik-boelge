// src/hooks/useClock.ts
//
// EINE Zeitquelle für die ganze App.
//
// Vorher hielt jede Komponente, die irgendetwas Zeitabhängiges anzeigte, ihren
// eigenen setTimeout(1000) — sechs Kacheln, Uhr, Wetter, Titelwechsel = neun
// Timer und neun Render-Zyklen pro Sekunde. Auf dem Pi ist das spürbar.
//
// Stattdessen: ein einziger, auf die Sekundengrenze ausgerichteter Timer und
// `useSyncExternalStore`. Jede Komponente abonniert über einen Selektor genau
// die Auflösung, die sie braucht (Sekunde, Minute, 3-Sekunden-Takt). Liefert der
// Selektor denselben Wert wie beim letzten Tick, rendert React nicht neu.
//
// Wichtig: Selektoren müssen Primitive zurückgeben (Zahl/String/Boolean),
// sonst greift der Object.is-Vergleich von useSyncExternalStore nicht.

import { useSyncExternalStore } from "react";

type Listener = () => void;

const TICK_MS = 1_000;

const listeners = new Set<Listener>();
let timerId: number | undefined;

/** Vom letzten Tick eingefrorene Zeit. Selektoren lesen ausschließlich hier. */
let nowMs = Date.now();

function notify(): void {
    // Kopie: ein Listener darf sich während der Zustellung abmelden.
    for (const listener of Array.from(listeners)) listener();
}

function schedule(): void {
    // Auf die nächste Sekundengrenze ausrichten statt stur +1000 zu addieren —
    // sonst driftet die Anzeige gegenüber der echten Uhr weg.
    const delay = TICK_MS - (Date.now() % TICK_MS);
    timerId = window.setTimeout(onTick, delay);
}

function onTick(): void {
    nowMs = Date.now();
    schedule();
    notify();
}

function stopTimer(): void {
    if (timerId !== undefined) {
        clearTimeout(timerId);
        timerId = undefined;
    }
}

/**
 * Nach einem Sichtbarkeitswechsel sofort nachziehen: gedrosselte Timer im
 * Hintergrund-Tab lassen die Uhr sonst stehenbleiben.
 */
function onVisibilityChange(): void {
    if (document.visibilityState !== "visible") return;
    stopTimer();
    nowMs = Date.now();
    schedule();
    notify();
}

function subscribe(listener: Listener): () => void {
    listeners.add(listener);

    if (listeners.size === 1) {
        // Erster Abonnent: Uhr anwerfen. React liest den Snapshot direkt nach
        // subscribe() erneut, der aufgefrischte Wert kommt also sicher an.
        nowMs = Date.now();
        schedule();
        document.addEventListener("visibilitychange", onVisibilityChange);
    }

    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
            stopTimer();
            document.removeEventListener("visibilitychange", onVisibilityChange);
        }
    };
}

function useClockSelector<T>(select: (nowMs: number) => T): T {
    const snapshot = () => select(nowMs);
    return useSyncExternalStore(subscribe, snapshot, snapshot);
}

// --- Selektoren ------------------------------------------------------------

const selectSecondBucket = (ms: number) => Math.floor(ms / 1_000);

const selectMinuteOfDay = (ms: number) => {
    const d = new Date(ms);
    return d.getHours() * 60 + d.getMinutes();
};

const selectDayStamp = (ms: number) => {
    const d = new Date(ms);
    // Lokaler Tagesstempel — dient nur als Wechsel-Signal, nicht zur Anzeige.
    return d.getFullYear() * 10_000 + (d.getMonth() + 1) * 100 + d.getDate();
};

/** Arabisch/lateinisch im 3-Sekunden-Takt. */
const TITLE_SWITCH_MS = 3_000;
const selectTitleVariant = (ms: number): "arabic" | "latin" =>
    Math.floor(ms / TITLE_SWITCH_MS) % 2 === 0 ? "arabic" : "latin";

// --- Öffentliche Hooks -----------------------------------------------------

/** Ganze Sekunden seit Epoch. Ändert sich 1×/s — nur für die Uhranzeige. */
export function useSecondTick(): number {
    return useClockSelector(selectSecondBucket);
}

/** Minuten seit lokaler Mitternacht (0–1439). Ändert sich 1×/min. */
export function useMinuteOfDay(): number {
    return useClockSelector(selectMinuteOfDay);
}

/** Wechselt 1×/Tag — für Anzeigen, die nur das Datum brauchen. */
export function useDayStamp(): number {
    return useClockSelector(selectDayStamp);
}

/** Wechselt alle 3 s zwischen arabischem und lateinischem Gebetsnamen. */
export function useTitleVariant(): "arabic" | "latin" {
    return useClockSelector(selectTitleVariant);
}
