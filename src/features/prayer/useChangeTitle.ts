// src/features/prayer/useChangeTitle.ts
import { useMemo } from "react";
import { useClock } from "../../hooks/useClock";

type PrayerKey = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";

const prayerTitles = {
    fajr:     { arabic: "الصلاة الفجر",   latin: "Fajr"     },
    sunrise:  { arabic: "الشروق",         latin: "Shuruq"   },
    dhuhr:    { arabic: "الصلاة الظهر",   latin: "Dhuhr"    },
    asr:      { arabic: "الصلاة العصر",   latin: "Asr"      },
    maghrib:  { arabic: "الصلاة المغرب",  latin: "Maghrib"  },
    isha:     { arabic: "الصلاة العشاء",  latin: "Isha'a"   },
} as const;

export function useChangeTitle(): Record<PrayerKey, string> {
    const now = useClock(1000);
    // wechsle alle 3 Sekunden; keine setState-Toggles nötig
    const isArabic = Math.floor(now.getSeconds() / 3) % 2 === 0;

    return useMemo(() => {
        const out: Record<PrayerKey, string> = {
            fajr:     isArabic ? prayerTitles.fajr.arabic     : prayerTitles.fajr.latin,
            sunrise:  isArabic ? prayerTitles.sunrise.arabic  : prayerTitles.sunrise.latin,
            dhuhr:    isArabic ? prayerTitles.dhuhr.arabic    : prayerTitles.dhuhr.latin,
            asr:      isArabic ? prayerTitles.asr.arabic      : prayerTitles.asr.latin,
            maghrib:  isArabic ? prayerTitles.maghrib.arabic  : prayerTitles.maghrib.latin,
            isha:     isArabic ? prayerTitles.isha.arabic     : prayerTitles.isha.latin,
        };
        return out;
    }, [isArabic]);
}
