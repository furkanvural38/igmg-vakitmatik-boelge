// src/hooks/useWeather.ts
import { useMemo } from "react";
import { useWeatherContext } from "../features/weather/WeatherProvider";

export function useWeather() {
    const ctx = useWeatherContext();
    return useMemo(
        () => ctx,
        [ctx.weather, ctx.loading, ctx.error, ctx.lastUpdated]
    );
}
