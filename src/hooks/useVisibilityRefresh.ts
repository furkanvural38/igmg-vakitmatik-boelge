// src/hooks/useVisibilityRefresh.ts

import { useEffect, useRef } from "react";

/**
 * Ruft `callback`, wenn die Seite wieder sichtbar wird *und* `isOutdated()` sagt,
 * dass die angezeigten Daten veraltet sind.
 *
 * Der Timer aus `useMidnightRefresh` allein reicht für den Tageswechsel nicht:
 * liegt das Gerät nachts im Standby, drosselt oder verschluckt der Browser den
 * setTimeout — um 00:00 feuert dann niemand. Beim Aufwecken meldet sich die
 * Seite dagegen verlässlich, und genau dort prüfen wir nach.
 *
 * `isOutdated` entscheidet, ob wirklich neu geladen wird: ohne diese Prüfung
 * würde jeder Tab-Wechsel einen Serveraufruf auslösen.
 */
export function useVisibilityRefresh(isOutdated: () => boolean, callback: () => void) {
    const isOutdatedRef = useRef(isOutdated);
    const callbackRef = useRef(callback);

    // Bewusst ohne Abhängigkeitsliste: beide Refs zeigen nach jedem Render auf
    // die aktuellen Closures. Sonst prüfte der Handler gegen die Gebetszeiten
    // vom ersten Render und käme nie zu einem anderen Ergebnis.
    useEffect(() => {
        isOutdatedRef.current = isOutdated;
        callbackRef.current = callback;
    });

    useEffect(() => {
        const check = () => {
            if (document.visibilityState !== "visible") return;
            if (isOutdatedRef.current()) callbackRef.current();
        };

        // Drei Wege zurück auf den Schirm, je nach Gerät und Browser:
        // visibilitychange — Tab wieder im Vordergrund, Display wieder an;
        // focus           — Fensterwechsel, ohne dass visibilityState sich ändert;
        // pageshow        — Rückkehr aus dem bfcache (iOS/Safari).
        document.addEventListener("visibilitychange", check);
        window.addEventListener("focus", check);
        window.addEventListener("pageshow", check);

        return () => {
            document.removeEventListener("visibilitychange", check);
            window.removeEventListener("focus", check);
            window.removeEventListener("pageshow", check);
        };
    }, []);
}
