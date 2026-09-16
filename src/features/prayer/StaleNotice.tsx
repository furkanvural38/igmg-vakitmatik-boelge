// src/features/prayer/StaleNotice.tsx

/**
 * Hinweis, dass die Gebetszeiten aus dem lokalen Zwischenspeicher stammen.
 *
 * Der CityProvider weiß längst, ob die API geantwortet hat (`source`), hat es
 * aber nie angezeigt. Für ein unbeaufsichtigtes Display ist genau das die
 * wichtigste Information: die Zeiten stimmen (sie sind von heute), aber der
 * Server ist nicht erreichbar und jemand sollte nachsehen.
 *
 * `top-full` statt einer negativen Unterkante: so hängt die Position nicht an
 * der eigenen Höhe des Hinweises und er schiebt sich nie über die Datumskarten.
 * Absolut positioniert bleibt er außerdem ohne Layout-Sprung ein- und ausblendbar.
 */
export function StaleNotice() {
    return (
        <div
            role="status"
            className="glass-text absolute left-0 top-full mt-10 flex items-center gap-5 whitespace-nowrap rounded-2xl bg-[rgba(120,80,0,0.6)] px-8 py-4 text-[3rem] leading-none text-yellow-200"
        >
            <span aria-hidden="true" className="flex-shrink-0 text-[2rem]">●</span>
            <span>Offline – gespeicherte Zeiten</span>
        </div>
    );
}
