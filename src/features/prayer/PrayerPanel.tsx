import { type JSX, useMemo } from "react";
import { useCity } from "../../app/CityProvider";
import { usePrayerTimeLogic } from "./usePrayerTimeLogic";

import { FaMoon } from "react-icons/fa6";
import { HiOutlineSun } from "react-icons/hi";
import { AiFillSun } from "react-icons/ai";
import { PiSunHorizonFill, PiSunHorizonLight } from "react-icons/pi";
import { LuCloudSun } from "react-icons/lu";

import { useChangeTitle } from "./useChangeTitle";
import { WeatherCard } from "../weather/WeatherCard";

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

export function PrayerPanel(): JSX.Element {
    const { clock, prayerTimes, weather } = useCity();

    const { currentPrayer, diffLabelShort, progressPercentage } =
        usePrayerTimeLogic(clock, prayerTimes);

    const titles = useChangeTitle();

    // Uhrzeit HH:MM:SS
    const timeParts = useMemo(() => {
        const hh = clock.getHours().toString().padStart(2, "0");
        const mm = clock.getMinutes().toString().padStart(2, "0");
        const ss = clock.getSeconds().toString().padStart(2, "0");
        return { hh, mm, ss };
    }, [clock]);

    // Datum (gregorianisch)
    const gregorianDate = useMemo(() => {
        const d = clock;
        const dd = d.getDate().toString().padStart(2, "0");
        const mo = (d.getMonth() + 1).toString().padStart(2, "0");
        const yyyy = d.getFullYear().toString();
        return `${dd}.${mo}.${yyyy}`;
    }, [clock]);

    // Hijri-Datum
    const hijriDate = prayerTimes?.hijriDateLong ?? "--";

    // aktive Farbe
    const activeBgColor = progressPercentage > 90 ? DANGER : GREEN;

    // Türkische Labels
    const PRAYER_LABELS: Record<PrayerKey, string> = {
        fajr: "İmsak",
        sunrise: "Güneş",
        dhuhr: "Öğle",
        asr: "İkindi",
        maghrib: "Akşam",
        isha: "Yatsı",
    };

    //
    // Styling-Helfer für die Kacheln
    //
    function tileClasses(isActive: boolean): string {
        const base = [
            "relative flex flex-col items-center",
            "w-[34rem] h-[34rem]",
            "mt-30",
            "glass-card",
        ];

        if (isActive) {
            base.push("glass-animate-in");
        }

        return base.join(" ");
    }

    function tileInnerStyles(isActive: boolean): React.CSSProperties {
        if (isActive) {
            return {
                background:
                    activeBgColor === DANGER
                        ? "radial-gradient(circle at 50% 50%, rgba(255,59,48,0.15) 0%, rgba(0,0,0,0) 70%)"
                        : "radial-gradient(circle at 50% 50%, rgba(0,153,114,0.15) 0%, rgba(0,0,0,0) 70%)",
                transition: "background 0.4s ease",
            };
        }
        return {};
    }

    return (
        <div className="w-full flex flex-col items-stretch text-white select-none relative z-[1]">
            {/* 1. OBERER BLOCK: Datum / Uhr / Wetter */}
            <div className="flex flex-row items-center justify-between w-full px-10">
                {/* Datum links */}
                <div className="flex flex-col min-w-[400px]">
                    {/* Gregorianisches Datum */}
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
                        <div className="glass-card-content">
                            {gregorianDate}
                        </div>
                    </div>

                    {/* Hijri-Datum */}
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
                        <div className="glass-card-content">
                            {hijriDate}
                        </div>
                    </div>
                </div>

                {/* Uhrzeit in der Mitte */}
                <div className="flex flex-row font-bebas text-clock items-end justify-center text-white leading-none font-extrabold tracking-tight text-center">
                    <div className="text-clock leading-[0.8]">
                        {timeParts.hh}:{timeParts.mm}
                    </div>
                    <div className="text-seconds leading-[0.9] ml-2">
                        {timeParts.ss}
                    </div>
                </div>

                {/* Wetter rechts */}
                <WeatherCard
                    cityName={weather?.name}
                    icon={weather?.weather?.[0]?.icon}
                    description={weather?.weather?.[0]?.description}
                    temperatureC={weather?.main?.temp}
                    currentPrayer={currentPrayer}
                />
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
                {!prayerTimes ? (
                    <div className="text-2xl text-neutral-400">
                        Lade Gebetszeiten…
                    </div>
                ) : (
                    (Object.keys(PRAYER_LABELS) as PrayerKey[]).map((key) => {
                        const isActive = currentPrayer === key;
                        const timeVal =
                            prayerTimes[
                                key as keyof typeof PRAYER_LABELS
                                ] ?? "00:00";

                        return (
                            <div
                                key={key}
                                className={tileClasses(isActive)}
                                style={tileInnerStyles(isActive)}
                            >
                                {/* Ring-Overlay (nimmt keinen Layout-Platz weg) */}
                                {isActive && (
                                    <div
                                        className={
                                            progressPercentage > 90
                                                ? "glass-deactive-ring"
                                                : "glass-active-ring"
                                        }
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            pointerEvents: "none",
                                            borderRadius: "inherit",
                                        }}
                                    />
                                )}

                                {/* Countdown + Fortschritt */}
                                {isActive && (
                                    <div className="absolute -top-44 left-1/2 -translate-x-1/2 w-full px-4 text-white z-[5]">
                                        <div className="text-center text-white mb-4 text-6xl">
                                            {diffLabelShort}
                                        </div>

                                        <div
                                            className={`
                                                h-8 relative w-full rounded-3xl overflow-hidden glass-text 
                                                ${
                                                progressPercentage > 90
                                                    ? "bg-red-500"
                                                    : "bg-[#009972]"
                                            }
                                            `}
                                        >
                                            <div
                                                className="bg-[#4b4b4b] rounded-3xl h-full"
                                                style={{
                                                    width: `${progressPercentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Inhalt der Kachel */}
                                <div className="flex flex-col items-center justify-start text-center z-[4] pt-8 relative">
                                    {/* Icon */}
                                    <div
                                        className={`${
                                            isActive
                                                ? "text-white"
                                                : "text-[#a7a7a7]"
                                        } text-8xl mb-4`}
                                    >
                                        {ICONS[key]}
                                    </div>

                                    {/* rotiert (arabisch/latein) */}
                                    <span
                                        className={`${
                                            isActive
                                                ? "text-white"
                                                : "text-[#a7a7a7]"
                                        } text-6xl mb-6`}
                                    >
                                        {titles[key] ?? "-"}
                                    </span>

                                    {/* statischer türkischer Name */}
                                    <span
                                        className={`${
                                            isActive
                                                ? "text-white"
                                                : "text-[#a7a7a7]"
                                        } text-8xl font-semibold`}
                                    >
                                        {PRAYER_LABELS[key]}
                                    </span>

                                    {/* Uhrzeit */}
                                    <span
                                        className={`${
                                            isActive
                                                ? "text-white"
                                                : "text-[#a7a7a7]"
                                        } font-semibold mt-4 text-[7rem] leading-none`}
                                    >
                                        {timeVal}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
