// src/features/weather/WeatherProvider.tsx
import React, {
    createContext, useCallback, useContext, useEffect,
    useMemo, useRef, useState
} from "react";
import { useCity } from "../../app/CityProvider";
import { fetchWeather, type WeatherData } from "../../lib/api";

type WeatherContextValue = {
    weather: WeatherData | null;
    loading: boolean;
    error: string | null;
    lastUpdated: number | null; // epoch ms
    refresh: () => void;
};

const WeatherContext = createContext<WeatherContextValue | undefined>(undefined);

type Props = {
    children: React.ReactNode;
    refreshMs?: number; // Default 15min
    ttlMs?: number;     // Default 10min
};

export function WeatherProvider({
                                    children,
                                    refreshMs = 15 * 60 * 1000,
                                    ttlMs = 10 * 60 * 1000,
                                }: Props) {
    const { config } = useCity();
    const cityName = config?.weatherCityName;

    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);

    const abortRef = useRef<AbortController | null>(null);

    const doFetch = useCallback(async () => {
        if (!cityName) {
            setError("Keine Stadt für Wetter konfiguriert");
            setWeather(null);
            setLastUpdated(null);
            return;
        }
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;

        setLoading(true);
        setError(null);
        try {
            const data = await fetchWeather(cityName);
            if (!data) throw new Error("Weather payload invalid");
            setWeather(data);
            setLastUpdated(Date.now());
        } catch (err: any) {
            if (err?.name !== "AbortError") {
                setError(err?.message ?? "Wetter laden fehlgeschlagen");
            }
        } finally {
            setLoading(false);
        }
    }, [cityName]);

    // Initial + City-Wechsel (SWR: zeige evtl. alten Wert, revalidiere)
    useEffect(() => {
        if (!cityName) return;
        const fresh = lastUpdated && Date.now() - lastUpdated < ttlMs;
        // zeige vorhandene Werte, revalidiere immer „leise“
        void doFetch();
        return () => abortRef.current?.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cityName]);

    // Sichtbarkeit: revalidiere, wenn wieder sichtbar und stale
    useEffect(() => {
        const onVis = () => {
            if (document.visibilityState !== "visible") return;
            const fresh = lastUpdated && Date.now() - lastUpdated < ttlMs;
            if (!fresh) void doFetch();
        };
        document.addEventListener("visibilitychange", onVis);
        return () => document.removeEventListener("visibilitychange", onVis);
    }, [doFetch, lastUpdated, ttlMs]);

    // Regelmäßiger Refresh (nur wenn sichtbar)
    useEffect(() => {
        const id = window.setInterval(() => {
            if (document.visibilityState !== "visible") return;
            void doFetch();
        }, refreshMs);
        return () => clearInterval(id);
    }, [doFetch, refreshMs]);

    const value = useMemo<WeatherContextValue>(() => ({
        weather, loading, error, lastUpdated, refresh: () => { void doFetch(); },
    }), [weather, loading, error, lastUpdated, doFetch]);

    return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}

export function useWeatherContext() {
    const ctx = useContext(WeatherContext);
    if (!ctx) throw new Error("useWeather must be used within WeatherProvider");
    return ctx;
}
