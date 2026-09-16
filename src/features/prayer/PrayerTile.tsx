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

                    <div
                        className={`glass-text relative h-8 w-full overflow-hidden rounded-3xl ${
                            endingSoon ? "bg-danger" : "bg-brand"
                        }`}
                        role="progressbar"
                        aria-valuenow={progressPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Fortschritt ${PRAYER_LABELS[prayerKey]}`}
                    >
                        {/* Graue Füllung wächst, die farbige Restfläche schrumpft:
                            der Balken zeigt die verbleibende Zeit, nicht die verstrichene. */}
                        <div
                            className="h-full rounded-3xl bg-[#4b4b4b]"
                            style={{ width: `${progressPercentage}%` }}
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
