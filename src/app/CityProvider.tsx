// src/app/CityProvider.tsx
import React, {
    createContext,
    useContext,
    useMemo,
    useEffect,
    useState,
    useCallback,
} from "react";
import { useParams } from "react-router-dom";
import { cityConfigs, type CityKey, type CityConfig } from "../lib/cities";
import {
    fetchPrayerTimesWithFallback,
    fetchWeather,
    type PrayerTimes,
    type WeatherData,
} from "../lib/api";
import { fetchDailyIslamContent } from "../features/footerTicker/apiDailyContent";

import { useClock } from "../hooks/useClock";
import { useMidnightRefresh } from "../hooks/useMidnightRefresh";

interface CityContextValue {
    cityKey: CityKey | string;
    config?: CityConfig;
    isValidCity: boolean;
    loading: boolean;
    error: string | null;
    clock: Date;
    prayerTimes: PrayerTimes | null;
    weather: WeatherData | null;
    dailyContent: any | null;
    hijriDateLong: string | null;
    gregorianDateShort: string | null;
}

const CityContext = createContext<CityContextValue | undefined>(undefined);

export function CityProvider({ children }: { children: React.ReactNode }) {
    const { cityKey = "" } = useParams();

    // zentrale States
    const clock = useClock(1000); // <— ersetzt dein altes setInterval
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [dailyContent, setDailyContent] = useState<any | null>(null);
    const [hijriDateLong, setHijriDateLong] = useState<string | null>(null);
    const [gregorianDateShort, setGregorianDateShort] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // passende CityConfig aus URL holen
    const config = useMemo<CityConfig | undefined>(() => {
        return cityConfigs[cityKey as keyof typeof cityConfigs];
    }, [cityKey]);

    const isValidCity = !!config;

    /**
     * Zentrale Ladefunktion für alle Daten dieser Stadt.
     * Holt:
     *  - Gebetszeiten (inkl. Hijri Datum etc.)
     *  - Wetter
     *  - Daily Islamic Content (Footer)
     *
     * Diese Funktion wird:
     *  - beim ersten Render aufgerufen
     *  - bei Stadtwechsel aufgerufen
     *  - automatisch um Mitternacht aufgerufen (über useMidnightRefresh)
     */
    const loadData = useCallback(async () => {
        if (!config) {
            setError("Ungültige Stadt");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Gebetszeiten + Metadaten (Datum)
            const rawPrayer = await fetchPrayerTimesWithFallback(
                config.prayerApiUrl,
                config.excelFallbackSheet
            );

            // rawPrayer kommt bei dir aktuell als "nur Zeiten" zurück.
            // Wir müssen deshalb fetchPrayerTimesWithFallback so erweitern,
            // dass es auch hijriDateLong, gregorianDateShort etc. liefert.
            //
            // Bis wir das tun, bauen wir einen Minimal-Fallback hier rein:
            //
            // Annahme: fetchPrayerTimesWithFallback() gibt dir derzeit NUR:
            // { fajr, sunrise, dhuhr, asr, maghrib, isha }
            //
            // Wir rufen deshalb die API hier nochmal roh ab, um die Datumsfelder
            // rauszuziehen. Später kannst du das in api.ts zusammenführen.
            let hijriLong: string | null = null;
            let gregShort: string | null = null;

            try {
                const res = await fetch(config.prayerApiUrl);
                const json = await res.json();
                if (
                    json &&
                    json.success &&
                    Array.isArray(json.data) &&
                    json.data.length > 0
                ) {
                    const first = json.data[0];
                    hijriLong = first.hijriDateLong ?? null;
                    gregShort = first.gregorianDateShort ?? null;
                }
            } catch (e) {
                // wenn das schiefgeht, ist nicht kritisch
                console.warn(
                    "[CityProvider] Konnte Datumsfelder aus Prayer API nicht lesen",
                    e
                );
            }

            // Wetter + tägliche Inhalte parallel holen
            const [weatherResp, daily] = await Promise.all([
                fetchWeather(config.weatherCityName),
                fetchDailyIslamContent(),
            ]);

            setPrayerTimes(rawPrayer);
            setHijriDateLong(hijriLong);
            setGregorianDateShort(gregShort);

            setWeather(weatherResp);
            setDailyContent(daily);
        } catch (err: any) {
            setError(err?.message ?? "Fehler beim Laden");
        } finally {
            setLoading(false);
        }
    }, [config]);

    // Initial + bei Stadtwechsel laden
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Automatisch neu laden bei Tageswechsel (Mitternacht)
    useMidnightRefresh(() => {
        console.log("🌙 Neuer Tag → loadData()");
        loadData();
    });

    // Werte für den Context
    const value: CityContextValue = {
        cityKey,
        config,
        isValidCity,
        loading,
        error,
        clock,
        prayerTimes,
        weather,
        dailyContent,
        hijriDateLong,
        gregorianDateShort,
    };

    return (
        <CityContext.Provider value={value}>
            {children}
        </CityContext.Provider>
    );
}

export function useCity() {
    const ctx = useContext(CityContext);
    if (!ctx) {
        throw new Error("useCity must be used within CityProvider");
    }
    return ctx;
}
