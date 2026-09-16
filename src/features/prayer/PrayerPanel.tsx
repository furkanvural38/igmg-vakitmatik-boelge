// src/features/prayer/PrayerPanel.tsx
import { PRAYER_ORDER } from "../../lib/api";
import { useCity } from "../../app/cityContext";
import { useMinuteOfDay } from "../../hooks/useClock";
import { useWeather } from "../weather/weatherContext";
import { WeatherCard } from "../weather/WeatherCard";
import { usePrayerPhase } from "./usePrayerPhase";
import { ClockDisplay } from "./ClockDisplay";
import { DateCards } from "./DateCards";
import { PrayerTile } from "./PrayerTile";

/**
 * Orchestriert die Mitte der Anzeige.
 *
 * Hier hängt die einzige Minuten-Subscription der App: die Gebetsphase wird
 * genau einmal pro Minute berechnet und als Primitive nach unten gereicht.
 * Vorher rechnete jede der sechs Kacheln plus die Wetterkarte dieselbe Phase
 * jede Sekunde neu — rund 420 identische Berechnungen pro Minute.
 *
 * Die Sekundenanzeige hängt bewusst NICHT hier, sondern in <ClockDisplay />,
 * damit der 1-Hz-Takt diesen Baum nicht mitzieht.
 */
export function PrayerPanel() {
    const { prayerTimes, hijriDate, source } = useCity();
    const { weather } = useWeather();

    const minuteOfDay = useMinuteOfDay();
    const phase = usePrayerPhase(minuteOfDay, prayerTimes);

    return (
        <div className="relative z-[1] flex w-full select-none flex-col items-stretch text-white">
            {/* 1. Datum / Uhr / Wetter */}
            <div className="flex w-full flex-row items-center justify-between px-10">
                <DateCards hijriDate={hijriDate} stale={source === "cache"} />
                <ClockDisplay />
                <WeatherCard
                    cityName={weather?.name}
                    icon={weather?.weather?.[0]?.icon}
                    description={weather?.weather?.[0]?.description}
                    temperatureC={weather?.main?.temp}
                    currentPrayer={phase.currentPrayer}
                />
            </div>

            {/* 2. Gebetszeit-Kacheln */}
            <div className="mt-32 flex w-full flex-row items-start justify-between gap-10 px-10">
                {!prayerTimes ? (
                    <div className="text-2xl text-muted">Lade Gebetszeiten…</div>
                ) : (
                    PRAYER_ORDER.map((key) => {
                        const active = phase.currentPrayer === key;
                        return (
                            <PrayerTile
                                key={key}
                                prayerKey={key}
                                time={prayerTimes.times[key]}
                                active={active}
                                endingSoon={active && phase.endingSoon}
                                remainingLabel={active ? phase.remainingLabel : undefined}
                                progressPercentage={active ? phase.progressPercentage : undefined}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
}
