import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useMemo,
    useCallback,
} from "react";
import { useParams } from "react-router-dom";
import {
    cityConfigs,
    type CityKey,
    type CityConfig,
} from "../lib/cities";
import {
    fetchPrayerTimesWithFallback,
    type PrayerTimes,
} from "../lib/api";
import { fetchDailyIslamContent } from "../features/footerTicker/apiDailyContent";
import { useMidnightRefresh } from "../hooks/useMidnightRefresh";

interface CityContextValue {
    cityKey: string;
    config?: CityConfig;
    isValidCity: boolean;
    loading: boolean;
    error: string | null;
    prayerTimes: PrayerTimes | null;
    dailyContent: any | null;
    hijriDateLong: string | null;
    gregorianDateShort: string | null;
}

const CityContext = createContext<CityContextValue | undefined>(undefined);

export function CityProvider({ children }: { children: React.ReactNode }) {
    const { cityKey = "" } = useParams();
    const config = useMemo(() => cityConfigs[cityKey as CityKey], [cityKey]);
    const isValidCity = !!config;

    const [state, setState] = useState<Omit<
        CityContextValue,
        "cityKey" | "config" | "isValidCity"
    >>({
        loading: true,
        error: null,
        prayerTimes: null,
        dailyContent: null,
        hijriDateLong: null,
        gregorianDateShort: null,
    });

    const loadData = useCallback(async () => {
        if (!config) {
            setState((s) => ({ ...s, error: "Ungültige Stadt", loading: false }));
            return;
        }

        setState((s) => ({ ...s, loading: true, error: null }));

        try {
            const [prayerResp, daily] = await Promise.allSettled([
                fetchPrayerTimesWithFallback(
                    config.prayerApiUrl,
                    config.excelFallbackSheet
                ),
                fetchDailyIslamContent(),
            ]);

            const prayerData =
                prayerResp.status === "fulfilled" ? prayerResp.value : null;
            const dailyData = daily.status === "fulfilled" ? daily.value : null;

            setState({
                loading: false,
                error: null,
                prayerTimes: prayerData,
                dailyContent: dailyData,
                hijriDateLong: prayerData?.hijriDateLong ?? null,
                gregorianDateShort: prayerData?.gregorianDateShort ?? null,
            });
        } catch (err: any) {
            setState((s) => ({
                ...s,
                loading: false,
                error: err?.message ?? "Fehler beim Laden",
            }));
        }
    }, [config]);

    // Initial + bei City-Wechsel
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Täglich um Mitternacht neu laden – ohne Sekundentick
    useMidnightRefresh(loadData);

    const value = useMemo<CityContextValue>(() => {
        return {
            cityKey,
            config,
            isValidCity,
            loading: state.loading,
            error: state.error,
            prayerTimes: state.prayerTimes,
            dailyContent: state.dailyContent,
            hijriDateLong: state.hijriDateLong,
            gregorianDateShort: state.gregorianDateShort,
        };
    }, [
        cityKey,
        config,
        isValidCity,
        state.loading,
        state.error,
        state.prayerTimes,
        state.dailyContent,
        state.hijriDateLong,
        state.gregorianDateShort,
    ]);

    return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity() {
    const ctx = useContext(CityContext);
    if (!ctx) throw new Error("useCity must be used within CityProvider");
    return ctx;
}
