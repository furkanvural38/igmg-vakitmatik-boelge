// src/features/prayer/ClockDisplay.tsx
import { memo } from "react";
import { useSecondTick } from "../../hooks/useClock";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Die einzige Komponente der App, die im Sekundentakt rendert.
 *
 * Sie nimmt keine Props und abonniert die Uhr selbst — dadurch bleibt der
 * 1-Hz-Takt auf diese drei Textknoten beschränkt, statt den Panel-Baum
 * mitzuziehen.
 */
export const ClockDisplay = memo(function ClockDisplay() {
    const secondTick = useSecondTick();
    const now = new Date(secondTick * 1000);

    const hhmm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const ss = pad(now.getSeconds());

    return (
        <div
            className="flex flex-row items-end justify-center text-center font-extrabold leading-none tracking-tight text-white tabular"
            role="timer"
            aria-label={`Uhrzeit ${hhmm}`}
        >
            <div className="pb-16 text-clock">{hhmm}</div>
            <div className="ml-2 pb-16 text-seconds">{ss}</div>
        </div>
    );
});
