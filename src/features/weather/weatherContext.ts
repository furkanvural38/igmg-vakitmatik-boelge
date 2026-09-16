// src/features/weather/weatherContext.ts
import { createContext, useContext } from "react";
import type { WeatherData } from "../../lib/api";

export interface WeatherContextValue {
    weather: WeatherData | null;
    loading: boolean;
    error: string | null;
    /** epoch ms des letzten erfolgreichen Abrufs */
    lastUpdated: number | null;
    refresh: () => void;
}

export const WeatherContext = createContext<WeatherContextValue | undefined>(undefined);

export function useWeather(): WeatherContextValue {
    const ctx = useContext(WeatherContext);
    if (!ctx) throw new Error("useWeather muss innerhalb von <WeatherProvider> benutzt werden");
    return ctx;
}
