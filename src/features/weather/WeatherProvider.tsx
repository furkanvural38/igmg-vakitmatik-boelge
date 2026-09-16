// src/features/weather/WeatherProvider.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCity } from "../../app/cityContext";
import { fetchWeather, type WeatherData } from "../../lib/api";
import { WeatherContext, type WeatherContextValue } from "./weatherContext";

type Props = {
    children: React.ReactNode;
    /** Abstand zwischen den regelmäßigen Abrufen. */
    refreshMs?: number;
    /** Ab wann ein Wert nach Rückkehr in den Vordergrund als veraltet gilt. */
    ttlMs?: number;
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
    // lastUpdated auch als Ref: so muss der Sichtbarkeits-Effekt nicht bei jedem
    // Abruf neu registriert werden.
    const lastUpdatedRef = useRef<number | null>(null);

    const doFetch = useCallback(async () => {
        if (!cityName) {
            setError("Keine Stadt für Wetter konfiguriert");
            setWeather(null);
            setLastUpdated(null);
            lastUpdatedRef.current = null;
            return;
        }

        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;

        setLoading(true);
        setError(null);
        try {
            // Das Signal wird jetzt tatsächlich durchgereicht – vorher wurde der
            // Controller erzeugt, aber nie an fetch übergeben.
            const data = await fetchWeather(cityName, ctrl.signal);
            if (ctrl.signal.aborted) return;

            if (!data) {
                setError("Wetterdaten nicht verfügbar");
                return;
            }

            setWeather(data);
            const now = Date.now();
            setLastUpdated(now);
            lastUpdatedRef.current = now;
        } catch (err) {
            if (ctrl.signal.aborted) return;
            setError(err instanceof Error ? err.message : "Wetter laden fehlgeschlagen");
        } finally {
            if (!ctrl.signal.aborted) setLoading(false);
        }
    }, [cityName]);

    // Initial + bei City-Wechsel
    useEffect(() => {
        if (!cityName) return;
        void doFetch();
        return () => abortRef.current?.abort();
    }, [cityName, doFetch]);

    // Nach Rückkehr in den Vordergrund nachladen, falls der Wert veraltet ist
    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState !== "visible") return;
            const updated = lastUpdatedRef.current;
            const fresh = updated != null && Date.now() - updated < ttlMs;
            if (!fresh) void doFetch();
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, [doFetch, ttlMs]);

    // Regelmäßiger Refresh (nur wenn sichtbar)
    useEffect(() => {
        const id = window.setInterval(() => {
            if (document.visibilityState !== "visible") return;
            void doFetch();
        }, refreshMs);
        return () => clearInterval(id);
    }, [doFetch, refreshMs]);

    const value = useMemo<WeatherContextValue>(
        () => ({ weather, loading, error, lastUpdated, refresh: () => void doFetch() }),
        [weather, loading, error, lastUpdated, doFetch]
    );

    return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}
