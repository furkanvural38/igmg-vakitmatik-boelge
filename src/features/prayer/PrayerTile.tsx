// src/features/prayer/PrayerTile.tsx
import { memo } from "react";
import type { PrayerKey } from "../../lib/api";
import { useTitleVariant } from "../../hooks/useClock";
import { PRAYER_LABELS, PRAYER_TITLES } from "./prayerLabels";
import { PRAYER_ICONS } from "./prayerIcons";

/**
 * Der arabisch/lateinisch wechselnde Titel ist das einzige, was sich alle drei
 * Sekunden ändert. Als eigenes memoisiertes Blatt bleibt der Takt auf diesen
 * einen Textknoten beschränkt, statt die ganze Kachel neu zu rendern.
 */
const PrayerTitle = memo(function PrayerTitle({
    prayerKey,
    active,
}: {
    prayerKey: PrayerKey;
    active: boolean;
}) {
    const variant = useTitleVariant();
    const isArabic = variant === "arabic";

    return (
        <span
            // Ohne lang/dir überlässt man die arabische Schrift dem Bidi-Zufall.
            lang={isArabic ? "ar" : "en"}
            dir={isArabic ? "rtl" : "ltr"}
            className={`mb-6 text-6xl ${active ? "text-white" : "text-muted"}`}
        >
            {PRAYER_TITLES[prayerKey][variant]}
        </span>
    );
});

export interface PrayerTileProps {
    prayerKey: PrayerKey;
    /** "HH:mm" */
    time: string;
    active: boolean;
    /** true in den letzten Minuten des laufenden Fensters (siehe WARN_BEFORE_NEXT_MINUTES) */
    endingSoon: boolean;
    /** nur für die aktive Kachel gesetzt */
    remainingLabel?: string;
    progressPercentage?: number;
}

/**
 * Eine Gebetskachel.
 *
 * Nimmt ausschließlich Primitive entgegen. Dadurch greift memo() wirklich:
 * die fünf inaktiven Kacheln bekommen minutenübergreifend identische Props und
 * rendern gar nicht neu. Vorher hielt jede Kachel ihre eigene Uhr und rechnete
 * die komplette Gebetslogik im Sekundentakt selbst — memo lief dabei ins Leere.
 */
export const PrayerTile = memo(function PrayerTile({
    prayerKey,
    time,
    active,
    endingSoon,
    remainingLabel,
    progressPercentage = 0,
}: PrayerTileProps) {
    const textClass = active ? "text-white" : "text-muted";
    // Der Balken stellt die Restzeit dar, nicht den Fortschritt.
    const remainingPercentage = Math.min(100, Math.max(0, 100 - progressPercentage));

    return (
        <div
            className={[
                "relative flex h-card w-card flex-col items-center",
                "glass-card",
                active ? "glass-animate-in" : "",
                active ? (endingSoon ? "tile-warning" : "tile-active") : "",
            ].join(" ")}
        >
            {active && (
                <div className={`tile-ring ${endingSoon ? "tile-ring--warning" : "tile-ring--active"}`} />
            )}

            {active && (
                <div className="absolute -top-44 left-1/2 z-[5] w-full -translate-x-1/2 px-2 text-white">
                    <div className="mb-4 w-full text-center text-8xl tabular">{remainingLabel}</div>

                    {/* Der Balken zeigt die VERBLEIBENDE Zeit.
                        Vorher war Grau das geformte Element (eigene runde Kappe)
                        und wuchs nach rechts – es las sich als "Grau wächst".
                        Jetzt ist Grau nur noch die ruhende Bahn, und der farbige
                        Balken ist die Pille, die von links her aufgezehrt wird und
                        an beiden Enden rund bleibt. */}
                    <div
                        className="glass-text relative h-8 w-full overflow-hidden rounded-full bg-[#4b4b4b]"
                        role="progressbar"
                        aria-valuenow={remainingPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Verbleibende Zeit ${PRAYER_LABELS[prayerKey]}`}
                    >
                        <div
                            className={`absolute inset-y-0 right-0 rounded-full transition-[width] duration-700 ease-linear ${
                                endingSoon ? "bg-danger" : "bg-brand"
                            }`}
                            style={{ width: `${remainingPercentage}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="relative z-[4] flex flex-col items-center justify-start pt-8 text-center">
                <div className={`mb-4 text-8xl ${textClass}`} aria-hidden="true">
                    {PRAYER_ICONS[prayerKey]}
                </div>

                <PrayerTitle prayerKey={prayerKey} active={active} />

                <span className={`text-8xl font-semibold ${textClass}`}>
                    {PRAYER_LABELS[prayerKey]}
                </span>

                <span className={`mt-4 text-[7rem] font-semibold leading-none tabular ${textClass}`}>
                    {time}
                </span>
            </div>
        </div>
    );
});
