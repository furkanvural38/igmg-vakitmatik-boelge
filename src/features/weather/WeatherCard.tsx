import { type JSX, useMemo } from "react";
import clsx from "clsx";
import type { PrayerKey } from "../prayer/PrayerPanel";

export interface WeatherCardProps {
    cityName?: string;
    icon?: string;
    description?: string;
    temperatureC?: number | null;
    currentPrayer?: PrayerKey | null;
}

type Star = {
    top: string;
    left: string;
    size: string; // in px
};

/**
 * Dynamische WeatherCard:
 * - Hintergrundfarbe je nach Gebetszeit (fajr/sunrise/dhuhr/...)
 * - statischer Sternenhimmel bei Nacht (fajr & isha)
 * - Apple / visionOS style Glass Panel Look
 */
export function WeatherCard({
                                cityName,
                                icon,
                                description,
                                temperatureC,
                                currentPrayer,
                            }: WeatherCardProps): JSX.Element {
    //
    // 1. Hintergrundverlauf abhängig von der aktuellen Gebetszeit
    //
    const backgroundStyle = useMemo(() => {
        switch (currentPrayer) {
            case "fajr":
                // Vor Sonnenaufgang: sehr dunkles Blau
                return "linear-gradient(to bottom, #0a1a3d 0%, #10284e 60%, #1b3a6b 100%)";

            case "sunrise":
                // Sonnenaufgang: dunkler, dezenter, warm/golden von oben nach unten
                return `
                    radial-gradient(
                        ellipse at top center,
                        rgba(255,220,180,0.25) 0%,
                        transparent 70%
                    ),
                    linear-gradient(
                        to bottom,
                        #7a3e1d 0%,
                        #b86b2a 45%,
                        #e5b56a 100%
                    )
                `;

            case "dhuhr":
                // Mittag: dein Standard-Design (türkis/blau/grün)
                return "linear-gradient(to bottom right, #007CFF 0%, #00C0FF 50%, #00E5A0 100%)";

            case "asr":
                // Später Nachmittag: kräftiges Blau oben → helleres unten
                return "linear-gradient(to bottom, #0055cc 0%, #3399ff 70%, #a6d8ff 100%)";

            case "maghrib":
                // Sonnenuntergang: warm → kühl (Orange nach Blau/Violett)
                return "linear-gradient(to bottom, #ff7e5f 0%, #feb47b 40%, #355c7d 100%)";

            case "isha":
                // Nacht: fast schwarz
                return "linear-gradient(to bottom, #000010 0%, #0a0a1a 70%, #1a1a2a 100%)";

            default:
                // Fallback (Mittag)
                return "linear-gradient(to bottom right, #007CFF 0%, #00C0FF 50%, #00E5A0 100%)";
        }
    }, [currentPrayer]);

    //
    // 2. Sterne nur für "isha" (Yatsı) und "fajr" (İmsak)
    //    useMemo => neue zufällige Stern-Positionen erst, wenn die Gebetsphase wechselt,
    //    NICHT jede Sekunde beim Clock-Update.
    //
    const stars: Star[] = useMemo(() => {
        const STAR_COUNT = 60;
        const arr: Star[] = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            const sizePx = (Math.random() * 2 + 1).toFixed(2); // 1px - 3px
            arr.push({
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                size: `${sizePx}px`,
            });
        }
        return arr;
    }, [currentPrayer]);

    const showStars = currentPrayer === "isha" || currentPrayer === "fajr";

    return (
        <div
            className={clsx(
                // layout
                "relative flex flex-col items-center justify-center",
                "w-[34rem] h-[34rem] flex-shrink-0",
                // glass panel look (kommt aus deiner globalen CSS, die wir definiert haben)
                "glass-card glass-animate-in",
                // smoother Farb/Farbwechsel bei Gebetswechsel
                "transition-all duration-[2000ms] ease-in-out",
                "mb-16"
            )}
            style={{
                // wir benutzen unser dynamisches Himmels-Gradient
                background: backgroundStyle,
            }}
        >
            {/* Stern-Layer (statisch), sitzt UNTER dem Content aber ÜBER dem Verlauf */}
            {showStars && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
                    {stars.map((star, i) => (
                        <div
                            key={i}
                            className="absolute bg-white rounded-full opacity-70"
                            style={{
                                width: star.size,
                                height: star.size,
                                top: star.top,
                                left: star.left,
                                // absolut keine Bewegung
                                animation: "none",
                                boxShadow: "0 0 6px rgba(255,255,255,0.6)",
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Inhalt der Karte */}
            <div className="glass-card-content flex flex-col items-center justify-center text-white text-center z-[2]">
                {/* Stadtname */}
                <div
                    className="font-semibold leading-none"
                    style={{
                        fontSize: "4.5rem",
                        lineHeight: 1.1,
                    }}
                >
                    {cityName ?? "—"}
                </div>

                {/* Wetter-Icon */}
                <div className="mt-4">
                    {icon ? (
                        <img
                            src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                            alt={description ?? ""}
                            className="w-64 h-64 object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]"
                        />
                    ) : (
                        <div className="w-64 h-64" />
                    )}
                </div>

                {/* Temperatur */}
                <div
                    className="font-semibold leading-none"
                    style={{
                        fontSize: "7rem",
                        lineHeight: 1.1,
                    }}
                >
                    {temperatureC !== null && temperatureC !== undefined
                        ? Math.round(temperatureC) + "°C"
                        : "—"}
                </div>
            </div>
        </div>
    );
}
