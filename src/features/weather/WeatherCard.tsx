// src/features/weather/WeatherCard.tsx
import { memo, useMemo } from "react";
import type { PrayerKey } from "../../lib/api";

export interface WeatherCardProps {
    cityName?: string;
    icon?: string;
    description?: string;
    temperatureC?: number | null;
    currentPrayer?: PrayerKey | null;
}

/**
 * Himmelsverlauf passend zur Gebetsphase.
 * Als Record statt switch: eine Zeile pro Phase, kein Fall-through-Risiko.
 */
const SKY_GRADIENT: Record<PrayerKey, string> = {
    // Vor Sonnenaufgang: sehr dunkles Blau
    fajr: "linear-gradient(to bottom, #0a1a3d 0%, #10284e 60%, #1b3a6b 100%)",
    // Sonnenaufgang: warm/golden von oben nach unten
    sunrise:
        "radial-gradient(ellipse at top center, rgba(255,220,180,0.25) 0%, transparent 70%), " +
        "linear-gradient(to bottom, #7a3e1d 0%, #b86b2a 45%, #e5b56a 100%)",
    // Mittag
    dhuhr: "linear-gradient(to bottom right, #007CFF 0%, #00C0FF 50%, #00E5A0 100%)",
    // Später Nachmittag
    asr: "linear-gradient(to bottom, #0055cc 0%, #3399ff 70%, #a6d8ff 100%)",
    // Sonnenuntergang: warm nach kühl
    maghrib: "linear-gradient(to bottom, #ff7e5f 0%, #feb47b 40%, #355c7d 100%)",
    // Nacht
    isha: "linear-gradient(to bottom, #000010 0%, #0a0a1a 70%, #1a1a2a 100%)",
};

const DEFAULT_GRADIENT = SKY_GRADIENT.dhuhr;

const NIGHT_PHASES: ReadonlySet<PrayerKey> = new Set<PrayerKey>(["isha", "fajr"]);

/**
 * Sternenfeld – einmalig beim Laden des Moduls erzeugt.
 *
 * Vorher hing die Erzeugung an einem useMemo mit [currentPrayer]: bei jedem
 * Phasenwechsel sprangen alle 60 Sterne an neue Positionen. Ein Sternenhimmel,
 * der sich umsortiert, ist kein Sternenhimmel. Der deterministische Generator
 * macht das Ergebnis außerdem über Reloads hinweg identisch.
 */
const STARS = (() => {
    let seed = 0x5eed;
    const random = () => {
        // xorshift32 – klein, deterministisch, reicht völlig für Dekoration.
        seed ^= seed << 13;
        seed ^= seed >>> 17;
        seed ^= seed << 5;
        return ((seed >>> 0) % 10_000) / 10_000;
    };

    return Array.from({ length: 60 }, () => ({
        top: `${(random() * 100).toFixed(2)}%`,
        left: `${(random() * 100).toFixed(2)}%`,
        size: `${(random() * 2 + 1).toFixed(2)}px`,
    }));
})();

/**
 * Wetterkarte im Glas-Look.
 *
 * Memoisiert und ohne eigene Uhr: rendert nur noch bei Wetter- oder
 * Phasenwechsel (wenige Male am Tag) statt im Sekundentakt.
 */
export const WeatherCard = memo(function WeatherCard({
    cityName,
    icon,
    description,
    temperatureC,
    currentPrayer,
}: WeatherCardProps) {
    const background = currentPrayer ? SKY_GRADIENT[currentPrayer] : DEFAULT_GRADIENT;
    const showStars = !!currentPrayer && NIGHT_PHASES.has(currentPrayer);

    const temperature = useMemo(
        () => (temperatureC == null ? "—" : `${Math.round(temperatureC)}°C`),
        [temperatureC]
    );

    return (
        <div
            className="glass-card glass-animate-in relative mb-20 flex h-card w-card flex-shrink-0 flex-col items-center justify-center transition-all duration-[2000ms] ease-in-out"
            style={{ background }}
        >
            {showStars && (
                <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">
                    {STARS.map((star, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-white opacity-70"
                            style={{
                                width: star.size,
                                height: star.size,
                                top: star.top,
                                left: star.left,
                                boxShadow: "0 0 6px rgba(255,255,255,0.6)",
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="glass-card-content z-[2] flex flex-col items-center justify-center text-center text-white">
                <div className="text-[4.5rem] font-semibold leading-[1.1]">{cityName ?? "—"}</div>

                <div className="mt-4">
                    {icon ? (
                        <img
                            src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                            alt={description ?? ""}
                            className="h-64 w-64 object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]"
                        />
                    ) : (
                        <div className="h-64 w-64" />
                    )}
                </div>

                <div className="text-[7rem] font-semibold leading-[1.1] tabular">{temperature}</div>
            </div>
        </div>
    );
});
