// src/features/prayer/prayerLabels.ts
import type { PrayerKey } from "../../lib/api";

/** Türkische Bezeichnung – steht dauerhaft auf der Kachel. */
export const PRAYER_LABELS: Record<PrayerKey, string> = {
    fajr: "İmsak",
    sunrise: "Güneş",
    dhuhr: "Öğle",
    asr: "İkindi",
    maghrib: "Akşam",
    isha: "Yatsı",
};

export type TitleVariant = "arabic" | "latin";

/** Wechselt im 3-Sekunden-Takt, siehe useTitleVariant. */
export const PRAYER_TITLES: Record<PrayerKey, Record<TitleVariant, string>> = {
    fajr:    { arabic: "الصلاة الفجر",  latin: "Fajr" },
    sunrise: { arabic: "الشروق",        latin: "Shuruq" },
    dhuhr:   { arabic: "الصلاة الظهر",  latin: "Dhuhr" },
    asr:     { arabic: "الصلاة العصر",  latin: "Asr" },
    maghrib: { arabic: "الصلاة المغرب", latin: "Maghrib" },
    isha:    { arabic: "الصلاة العشاء", latin: "Isha'a" },
};
