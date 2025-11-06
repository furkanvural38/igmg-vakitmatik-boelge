// src/features/prayer/PrayerPanel.tsx
import React, { type JSX, memo, useMemo } from "react";
import { useCity } from "../../app/CityProvider";
import { usePrayerTimeLogic } from "./usePrayerTimeLogic";
import { useClock } from "../../hooks/useClock";
import { useWeather } from "../../hooks/useWeather";

import { FaMoon } from "react-icons/fa6";
import { HiOutlineSun } from "react-icons/hi";
import { AiFillSun } from "react-icons/ai";
import { PiSunHorizonFill, PiSunHorizonLight } from "react-icons/pi";
import { LuCloudSun } from "react-icons/lu";

import { useChangeTitle } from "./useChangeTitle";
import { WeatherCard } from "../weather/WeatherCard";
import type { PrayerTimes } from "../../lib/api";

const GREEN = "#009972";
const DANGER = "#ff3b30";

export type PrayerKey =
    | "fajr"
    | "sunrise"
    | "dhuhr"
    | "asr"
    | "maghrib"
    | "isha";

const ICONS: Record<PrayerKey, JSX.Element> = {
    fajr: <PiSunHorizonLight className="text-9xl mb-4" />,
    sunrise: <HiOutlineSun className="text-9xl mb-4" />,
    dhuhr: <AiFillSun className="text-9xl mb-4" />,
    asr: <LuCloudSun className="text-9xl mb-4" />,
    maghrib: <PiSunHorizonFill className="text-9xl mb-4" />,
    isha: <FaMoon className="text-9xl mb-4" />,
};

const PRAYER_LABELS: Record<PrayerKey, string> = {
    fajr: "İmsak",
    sunrise: "Güneş",
    dhuhr: "Öğle",
    asr: "İkindi",
    maghrib: "Akşam",
    isha: "Yatsı",
};

/** Zeit-Header; tickt lokal */
const TimeBar = memo(function TimeBar({ hijriDate }: { hijriDate: string | null }) {
    const now = useClock(1000);

    const timeParts = useMemo(() => {
        const hh = now.getHours().toString().padStart(2, "0");
        const mm = now.getMinutes().toString().padStart(2, "0");
        const ss = now.getSeconds().toString().padStart(2, "0");
        return { hh, mm, ss };
    }, [now]);

    const gregorianDate = useMemo(() => {
        const dd = now.getDate().toString().padStart(2, "0");
        const mo = (now.getMonth() + 1).toString().padStart(2, "0");
        const yyyy = now.getFullYear().toString();
        return `${dd}.${mo}.${yyyy}`;
    }, [now]);

    return (
        <>
            {/* Datum links */}
            <div className="flex flex-col min-w-[400px]">
                <div
                    className="
            glass-card glass-animate-in
            flex items-center justify-center text-center
            text-white font-semibold
            rounded-2xl shadow-lg
            px-8 py-6
            mb-6
          "
                    style={{
                        fontSize: "6rem",
                        lineHeight: 1.1,
                        backgroundColor: `${GREEN}40`,
                    }}
                >
                    <div className="glass-card-content">{gregorianDate}</div>
                </div>

                <div
                    className="
            glass-card
            flex items-center justify-center text-center
            text-white font-light
            rounded-2xl shadow-md
            px-8 py-6
          "
                    style={{
                        fontSize: "5rem",
                        lineHeight: 1.1,
                        borderColor: "rgba(255,255,255,0.3)",
                    }}
                >
                    <div className="glass-card-content">{hijriDate ?? "--"}</div>
                </div>
            </div>

            {/* Uhrzeit in der Mitte */}
            <div className="flex flex-row font-bebas text-clock items-end justify-center text-white leading-none font-extrabold tracking-tight text-center">
                <div className="text-clock leading-[0.8]">
                    {timeParts.hh}:{timeParts.mm}
                </div>
                <div className="text-seconds leading-[0.9] ml-2">{timeParts.ss}</div>
            </div>
        </>
    );
});

type PrayerTileProps = {
    prayerKey: PrayerKey;
    timeValue: string;
    titles: Record<PrayerKey, string | undefined>;
    prayerTimes: PrayerTimes;
};

/** Eine Kachel; tickt lokal für Ring/Countdown */
const PrayerTile = memo(function PrayerTile({
                                                prayerKey,
                                                timeValue,
                                                titles,
                                                prayerTimes,
                                            }: PrayerTileProps) {
    const now = useClock(1000);
    const { currentPrayer, diffLabelShort, progressPercentage } =
        usePrayerTimeLogic(now, prayerTimes);

    const isActive = currentPrayer === prayerKey;
    const activeBgColor = progressPercentage > 90 ? DANGER : GREEN;

    const tileInnerStyles = (active: boolean): React.CSSProperties => {
        if (!active) return {};
        return {
            background:
                activeBgColor === DANGER
                    ? "radial-gradient(circle at 50% 50%, rgba(255,59,48,0.15) 0%, rgba(0,0,0,0) 70%)"
                    : "radial-gradient(circle at 50% 50%, rgba(0,153,114,0.15) 0%, rgba(0,0,0,0) 70%)",
            transition: "background 0.4s ease",
        };
    };

    return (
        <div
            className={[
                "relative flex flex-col items-center",
                "w-[34rem] h-[34rem]",
                "mt-30",
                "glass-card",
                isActive ? "glass-animate-in" : "",
            ].join(" ")}
            style={tileInnerStyles(isActive)}
        >
            {isActive && (
                <div
                    className={progressPercentage > 90 ? "glass-deactive-ring" : "glass-active-ring"}
                    style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        borderRadius: "inherit",
                    }}
                />
            )}

            {isActive && (
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-full px-2 text-white z-[5]">
                    <div className="text-center text-white mb-4 text-7xl">{diffLabelShort}</div>

                    <div
                        className={`
              h-8 relative w-full rounded-3xl overflow-hidden glass-text
              ${progressPercentage > 90 ? "bg-red-500" : "bg-[#009972]"}
            `}
                    >
                        <div className="bg-[#4b4b4b] rounded-3xl h-full" style={{ width: `${progressPercentage}%` }} />
                    </div>
                </div>
            )}

            <div className="flex flex-col items-center justify-start text-center z-[4] pt-8 relative">
                <div className={`${isActive ? "text-white" : "text-[#a7a7a7]"} text-8xl mb-4`}>
                    {ICONS[prayerKey]}
                </div>

                <span className={`${isActive ? "text-white" : "text-[#a7a7a7]"} text-6xl mb-6`}>
          {titles[prayerKey] ?? "-"}
        </span>

                <span className={`${isActive ? "text-white" : "text-[#a7a7a7]"} text-8xl font-semibold`}>
          {PRAYER_LABELS[prayerKey]}
        </span>

                <span className={`${isActive ? "text-white" : "text-[#a7a7a7]"} font-semibold mt-4 text-[7rem] leading-none`}>
          {timeValue}
        </span>
            </div>
        </div>
    );
});

/** WeatherCard + lokaler Tick nur für currentPrayer; KEIN Hook in useMemo/useEffect */
const WeatherCardContainer = memo(function WeatherCardContainer({
                                                                    prayerTimes,
                                                                }: {
    prayerTimes: PrayerTimes | null;
}) {
    const { weather } = useWeather();
    const now = useClock(1000);

    // Hook am Top-Level – NICHT in useMemo/useEffect aufrufen
    const phase = usePrayerTimeLogic(now, prayerTimes);
    const currentPrayer = (phase.currentPrayer as PrayerKey | null) ?? null;

    return (
        <WeatherCard
            cityName={weather?.name}
            icon={weather?.weather?.[0]?.icon}
            description={weather?.weather?.[0]?.description}
            temperatureC={weather?.main?.temp}
            currentPrayer={currentPrayer}
        />
    );
});

// ---- Hauptkomponente: kein Sekundentick mehr hier ----
export function PrayerPanel(): JSX.Element {
    const { prayerTimes, hijriDateLong } = useCity();
    const titles = useChangeTitle();

    const orderedKeys: PrayerKey[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];

    const timeMap: Record<PrayerKey, string> | null = useMemo(() => {
        if (!prayerTimes) return null;
        return {
            fajr: prayerTimes.fajr ?? "00:00",
            sunrise: prayerTimes.sunrise ?? "00:00",
            dhuhr: prayerTimes.dhuhr ?? "00:00",
            asr: prayerTimes.asr ?? "00:00",
            maghrib: prayerTimes.maghrib ?? "00:00",
            isha: prayerTimes.isha ?? "00:00",
        };
    }, [prayerTimes]);

    return (
        <div className="w-full flex flex-col items-stretch text-white select-none relative z-[1]">
            {/* 1. OBERER BLOCK: Datum / Uhr / Wetter */}
            <div className="flex flex-row items-center justify-between w-full px-10">
                <TimeBar hijriDate={hijriDateLong} />
                <WeatherCardContainer prayerTimes={prayerTimes} />
            </div>

            {/* 2. GEBETSZEIT-KACHELN */}
            <div
                className="
          w-full
          flex flex-row
          justify-between
          items-start
          px-10
          mt-32
          gap-10
        "
            >
                {!timeMap ? (
                    <div className="text-2xl text-neutral-400">Lade Gebetszeiten…</div>
                ) : (
                    orderedKeys.map((key) => (
                        <PrayerTile
                            key={key}
                            prayerKey={key}
                            timeValue={timeMap[key]}
                            titles={titles as Record<PrayerKey, string | undefined>}
                            prayerTimes={prayerTimes}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
