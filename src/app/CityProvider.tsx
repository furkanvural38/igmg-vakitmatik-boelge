// src/app/CityProvider.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { cityConfigs, resolveCity, type CityKey } from "../lib/cities";
import {
    ApiError,
    describeApiError,
    loadPrayerTimes,
    type PrayerTimes,
    type PrayerTimesSource,
} from "../lib/api";
import {
    fetchDailyIslamContent,
    type DailyContentResult,
} from "../features/footerTicker/apiDailyContent";
import { useMidnightRefresh } from "../hooks/useMidnightRefresh";
import { CityContext, type CityContextValue } from "./cityContext";

/** Wartezeiten für erneute Versuche, wenn der Server gerade nicht liefert (502/503/Netz). */
const RETRY_DELAYS_MS = [60_000, 120_000, 300_000, 900_000];

type CityState = {
    loading: boolean;
    error: string | null;
    prayerTimes: PrayerTimes | null;
    dailyContent: DailyContentResult | null;
    hijriDate: string | null;
    source: PrayerTimesSource | null;
};

const INITIAL_STATE: CityState = {
    loading: true,
    error: null,
    prayerTimes: null,
    dailyContent: null,
    hijriDate: null,
    source: null,
};

export function CityProvider({ children }: { children: React.ReactNode }) {
    const { cityKey = "" } = useParams();
    const resolvedKey = useMemo(() => resolveCity(cityKey), [cityKey]);
    const config = useMemo(
        () => (resolvedKey ? cityConfigs[resolvedKey as CityKey] : undefined),
        [resolvedKey]
    );
    const isValidCity = !!config;

    const [state, setState] = useState<CityState>(INITIAL_STATE);

    // Läuft ein Aufruf noch für die inzwischen verlassene Stadt? -> Ergebnis verwerfen
    const runIdRef = useRef(0);
    const retryTimerRef = useRef<number | null>(null);
    const retryAttemptRef = useRef(0);

    const clearRetry = useCallback(() => {
        if (retryTimerRef.current != null) {
            clearTimeout(retryTimerRef.current);
            retryTimerRef.current = null;
        }
    }, []);

    // Indirektion, damit scheduleRetry stabil bleibt und trotzdem das aktuelle loadData trifft
    const loadRef = useRef<() => void>(() => {});

    const scheduleRetry = useCallback(
        (cause: ApiError | null) => {
            const attempt = retryAttemptRef.current;
            retryAttemptRef.current = Math.min(attempt + 1, RETRY_DELAYS_MS.length - 1);

            const delay =
                cause?.retryAfterMs != null
                    ? Math.max(cause.retryAfterMs, 1_000)
                    : RETRY_DELAYS_MS[attempt];

            clearRetry();
            retryTimerRef.current = window.setTimeout(() => {
                retryTimerRef.current = null;
                loadRef.current();
            }, delay);
        },
        [clearRetry]
    );

    const loadData = useCallback(async () => {
        clearRetry();

        if (!config) {
            setState({ ...INITIAL_STATE, loading: false, error: "Ungültige Stadt" });
            return;
        }

        const runId = ++runIdRef.current;
        const citySlug = config.citySlug;

        // Steht bereits eine Anzeige für diese Stadt, im Hintergrund aktualisieren –
        // sonst blitzt bei jedem Retry und um Mitternacht "Lädt…" auf.
        setState((s) =>
            s.prayerTimes && s.prayerTimes.city === citySlug
                ? { ...s, error: null }
                : { ...INITIAL_STATE, dailyContent: s.dailyContent }
        );

        const [prayerResp, dailyResp] = await Promise.allSettled([
            loadPrayerTimes(citySlug),
            fetchDailyIslamContent(),
        ]);

        if (runId !== runIdRef.current) return; // Stadt wurde inzwischen gewechselt

        const dailyData = dailyResp.status === "fulfilled" ? dailyResp.value : null;

        if (prayerResp.status === "fulfilled") {
            const { times, source, error } = prayerResp.value;
            setState({
                loading: false,
                error: null,
                prayerTimes: times,
                dailyContent: dailyData,
                hijriDate: times.hijriDate,
                source,
            });
            // Aus dem Cache bedient -> im Hintergrund weiter probieren
            if (source === "cache" && error?.retryable) scheduleRetry(error);
            else retryAttemptRef.current = 0;
            return;
        }

        const err = prayerResp.reason;
        const apiError = err instanceof ApiError ? err : null;

        setState((s) => ({
            ...s,
            loading: false,
            error: apiError ? describeApiError(apiError) : err?.message ?? "Fehler beim Laden",
            dailyContent: dailyData ?? s.dailyContent,
        }));

        // 4xx (unbekannter Slug, ungültiges Datum) laut API nicht wiederholen
        if (!apiError || apiError.retryable) scheduleRetry(apiError);
    }, [config, clearRetry, scheduleRetry]);

    useEffect(() => {
        loadRef.current = () => void loadData();
    }, [loadData]);

    // Initial + bei City-Wechsel
    useEffect(() => {
        void loadData();
        return clearRetry;
    }, [loadData, clearRetry]);

    // Täglich um Mitternacht neu laden – ohne Sekundentick
    useMidnightRefresh(loadData);

    const value = useMemo<CityContextValue>(
        () => ({
            cityKey,
            config,
            isValidCity,
            loading: state.loading,
            error: state.error,
            prayerTimes: state.prayerTimes,
            dailyContent: state.dailyContent,
            hijriDate: state.hijriDate,
            source: state.source,
        }),
        [cityKey, config, isValidCity, state]
    );

    return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}
