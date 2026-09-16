// src/features/prayer/prayerIcons.tsx
import type { JSX } from "react";
import { FaMoon } from "react-icons/fa6";
import { HiOutlineSun } from "react-icons/hi";
import { AiFillSun } from "react-icons/ai";
import { PiSunHorizonFill, PiSunHorizonLight } from "react-icons/pi";
import { LuCloudSun } from "react-icons/lu";
import type { PrayerKey } from "../../lib/api";

export const PRAYER_ICONS: Record<PrayerKey, JSX.Element> = {
    fajr: <PiSunHorizonLight className="text-9xl" />,
    sunrise: <HiOutlineSun className="text-9xl" />,
    dhuhr: <AiFillSun className="text-9xl" />,
    asr: <LuCloudSun className="text-9xl" />,
    maghrib: <PiSunHorizonFill className="text-9xl" />,
    isha: <FaMoon className="text-9xl" />,
};
