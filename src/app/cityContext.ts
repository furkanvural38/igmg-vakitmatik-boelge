// src/app/cityContext.ts
//
// Context und Hook liegen getrennt von der Provider-Komponente: eine Datei, die
// Komponenten *und* anderes exportiert, bricht React Fast Refresh (und war einer
// der offenen ESLint-Fehler).

import { createContext, useContext } from "react";
import type { CityConfig } from "../lib/cities";
import type { PrayerTimes, PrayerTimesSource } from "../lib/api";
import type { DailyContentResult } from "../features/footerTicker/apiDailyContent";

export interface CityContextValue {
    cityKey: string;
    config?: CityConfig;
    isValidCity: boolean;
    loading: boolean;
    error: string | null;
    prayerTimes: PrayerTimes | null;
    dailyContent: DailyContentResult | null;
    /** z. B. "5 Rebiulahir 1448" */
    hijriDate: string | null;
    /**
     * Woher die angezeigten Zeiten stammen. "cache" heißt: die API war nicht
     * erreichbar, auf dem Display steht der letzte erfolgreiche Abruf von heute.
     * Wird als Hinweis angezeigt — siehe StaleNotice.
     */
    source: PrayerTimesSource | null;
}

export const CityContext = createContext<CityContextValue | undefined>(undefined);

export function useCity(): CityContextValue {
    const ctx = useContext(CityContext);
    if (!ctx) throw new Error("useCity muss innerhalb von <CityProvider> benutzt werden");
    return ctx;
}
