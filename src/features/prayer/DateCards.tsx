// src/features/prayer/DateCards.tsx
import { memo } from "react";
import { useDayStamp } from "../../hooks/useClock";
import { StaleNotice } from "./StaleNotice";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Gregorianisches und hidschretisches Datum.
 *
 * Hängt am Tagesstempel statt an der Sekunde: rendert damit einmal täglich neu
 * statt 86.400-mal.
 */
export const DateCards = memo(function DateCards({
    hijriDate,
    stale,
}: {
    hijriDate: string | null;
    stale: boolean;
}) {
    useDayStamp(); // Abo: erzwingt genau einen Re-Render pro Tageswechsel
    const now = new Date();
    const gregorian = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`;

    return (
        <div className="relative flex min-w-[400px] flex-col">
            <div
                className="glass-card glass-animate-in mb-6 flex items-center justify-center rounded-2xl bg-brand-tint px-8 py-6 text-center text-[6rem] font-semibold leading-[1.1] text-white shadow-lg"
            >
                <div className="glass-card-content tabular">{gregorian}</div>
            </div>

            <div className="glass-card flex items-center justify-center rounded-2xl px-8 py-6 text-center text-[5rem] font-light leading-[1.1] text-white shadow-md">
                <div className="glass-card-content">{hijriDate ?? "--"}</div>
            </div>

            {/* Absolut positioniert: erscheint und verschwindet ohne Layout-Sprung. */}
            {stale && <StaleNotice />}
        </div>
    );
});
