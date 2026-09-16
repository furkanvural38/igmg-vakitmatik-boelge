// src/features/prayer/StaleNotice.tsx

/**
 * Hinweis, dass die Gebetszeiten aus dem lokalen Cache stammen.
 *
 * Der CityProvider weiß längst, ob die API geantwortet hat (`source`), hat es
 * aber nie angezeigt. Für ein unbeaufsichtigtes Display ist genau das die
 * wichtigste Information: die Zeiten stimmen (sie sind von heute), aber der
 * Server ist nicht erreichbar und jemand sollte nachsehen.
 */
export function StaleNotice() {
    return (
        <div
            role="status"
            className="glass-text absolute -bottom-28 left-0 flex items-center gap-4 rounded-2xl bg-[rgba(120,80,0,0.55)] px-6 py-3 text-[2.5rem] leading-none text-yellow-200"
        >
            <span aria-hidden="true">●</span>
            <span>Offline – Zeiten aus dem Zwischenspeicher</span>
        </div>
    );
}
