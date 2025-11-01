// src/app/CityProvider.tsx
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { cityConfigs, type CityKey, type CityConfig } from "../lib/cities";
import { fetchPrayerTimesWithFallback, fetchWeather, type PrayerTimes, type WeatherData } from "../lib/api";
import { fetchDailyIslamContent } from "../features/footerTicker/apiDailyContent";
import { useClock } from "../hooks/useClock";
import { useMidnightRefresh } from "../hooks/useMidnightRefresh";

interface CityContextValue {
    cityKey: string;
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
    const config = useMemo(() => cityConfigs[cityKey as CityKey], [cityKey]);
    const isValidCity = !!config;

    const clock = useClock(1000);
    const [state, setState] = useState<Omit<CityContextValue, "cityKey" | "config" | "isValidCity" | "clock">>({
        loading: true,
        error: null,
        prayerTimes: null,
        weather: null,
        dailyContent: null,
        hijriDateLong: null,
        gregorianDateShort: null,
    });

    const loadData = useCallback(async () => {
        if (!config) {
            setState(s => ({ ...s, error: "Ungültige Stadt", loading: false }));
            return;
        }

        setState(s => ({ ...s, loading: true, error: null }));

        try {
            const [prayerResp, weatherResp, daily] = await Promise.allSettled([
                fetchPrayerTimesWithFallback(config.prayerApiUrl, config.excelFallbackSheet),
                fetchWeather(config.weatherCityName),
                fetchDailyIslamContent(),
            ]);

            const prayerData = prayerResp.status === "fulfilled" ? prayerResp.value : null;
            const weatherData = weatherResp.status === "fulfilled" ? weatherResp.value : null;
            const dailyData = daily.status === "fulfilled" ? daily.value : null;

            const hijriLong = prayerData?.hijriDateLong ?? null;
            const gregShort = prayerData?.gregorianDateShort ?? null;

            setState({
                loading: false,
                error: null,
                prayerTimes: prayerData,
                weather: weatherData,
                dailyContent: dailyData,
                hijriDateLong: hijriLong,
                gregorianDateShort: gregShort,
            });
        } catch (err: any) {
            setState(s => ({ ...s, loading: false, error: err?.message ?? "Fehler beim Laden" }));
        }
    }, [config]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useMidnightRefresh(() => loadData());

    const value: CityContextValue = {
        cityKey,
        config,
        isValidCity,
        clock,
        ...state,
    };

    return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity() {
    const ctx = useContext(CityContext);
    if (!ctx) throw new Error("useCity must be used within CityProvider");
    return ctx;
}
