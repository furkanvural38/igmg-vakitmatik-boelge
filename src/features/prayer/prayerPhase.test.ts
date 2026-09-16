import { describe, expect, it } from "vitest";
import type { PrayerTimes } from "../../lib/api";
import {
    WARN_BEFORE_NEXT_MINUTES,
    computePrayerPhase,
    formatRemaining,
    parseTimeToMinutes,
} from "./prayerPhase";

/** Realistischer Septembertag in Hannover. */
const TIMES: PrayerTimes = {
    city: "hannover",
    date: "2026-09-16",
    hijriDate: "5 Rebiulahir 1448",
    timezone: "Europe/Berlin",
    times: {
        fajr: "04:58",     // 298
        sunrise: "06:50",  // 410
        dhuhr: "13:21",    // 801
        asr: "16:46",      // 1006
        maghrib: "19:43",  // 1183
        isha: "21:20",     // 1280
    },
};

/** Hochsommer: Yatsı beginnt erst nach Mitternacht, Zeiten sind nicht aufsteigend. */
const SUMMER_TIMES: PrayerTimes = {
    ...TIMES,
    date: "2026-06-21",
    times: {
        fajr: "02:15",     // 135
        sunrise: "04:58",  // 298
        dhuhr: "13:26",    // 806
        asr: "17:44",      // 1064
        maghrib: "21:47",  // 1307
        isha: "00:30",     // 30  -> wrappt über Mitternacht
    },
};

const at = (hh: number, mm: number) => hh * 60 + mm;

describe("parseTimeToMinutes", () => {
    it("parst HH:mm und H:mm", () => {
        expect(parseTimeToMinutes("05:20")).toBe(320);
        expect(parseTimeToMinutes("5:20")).toBe(320);
        expect(parseTimeToMinutes("00:00")).toBe(0);
        expect(parseTimeToMinutes("23:59")).toBe(1439);
    });

    it("weist Unsinn zurück, statt NaN weiterzureichen", () => {
        expect(parseTimeToMinutes("24:00")).toBeNull();
        expect(parseTimeToMinutes("12:60")).toBeNull();
        expect(parseTimeToMinutes("12:5")).toBeNull();
        expect(parseTimeToMinutes("abc")).toBeNull();
        expect(parseTimeToMinutes("")).toBeNull();
    });
});

describe("formatRemaining", () => {
    it("zeigt Stunden nur, wenn es welche gibt", () => {
        expect(formatRemaining(384)).toBe("6h 24min");
        expect(formatRemaining(60)).toBe("1h 0min");
        expect(formatRemaining(5)).toBe("5min");
        expect(formatRemaining(0)).toBe("0min");
    });

    it("fängt negative Werte ab", () => {
        expect(formatRemaining(-10)).toBe("0min");
    });
});

describe("computePrayerPhase – laufendes Fenster", () => {
    it("ordnet eine Zeit mitten am Tag dem richtigen Gebet zu", () => {
        const phase = computePrayerPhase(at(14, 0), TIMES);
        expect(phase.currentPrayer).toBe("dhuhr");
        expect(phase.minutesUntilNext).toBe(at(16, 46) - at(14, 0)); // 166
        expect(phase.remainingLabel).toBe("2h 46min");
    });

    it("schaltet exakt auf der Gebetsminute um", () => {
        expect(computePrayerPhase(at(13, 20), TIMES).currentPrayer).toBe("sunrise");
        expect(computePrayerPhase(at(13, 21), TIMES).currentPrayer).toBe("dhuhr");
    });

    it("liefert am Fensterbeginn die volle Restzeit, nicht 0", () => {
        const phase = computePrayerPhase(at(13, 21), TIMES);
        expect(phase.minutesUntilNext).toBe(at(16, 46) - at(13, 21)); // 205
        expect(phase.progressPercentage).toBe(0);
    });
});

describe("computePrayerPhase – Mitternachts-Wrap", () => {
    it("bleibt vor Mitternacht bei Yatsı", () => {
        const phase = computePrayerPhase(at(23, 0), TIMES);
        expect(phase.currentPrayer).toBe("isha");
        // 23:00 -> 04:58 am Folgetag = 358 min
        expect(phase.minutesUntilNext).toBe(358);
        expect(phase.remainingLabel).toBe("5h 58min");
    });

    it("bleibt nach Mitternacht bei Yatsı, bis İmsak beginnt", () => {
        const phase = computePrayerPhase(at(3, 0), TIMES);
        expect(phase.currentPrayer).toBe("isha");
        expect(phase.minutesUntilNext).toBe(at(4, 58) - at(3, 0)); // 118
    });

    it("rechnet den Fortschritt über den Tageswechsel hinweg korrekt", () => {
        // Yatsı-Fenster: 21:20 -> 04:58 = 458 min. Mitte liegt bei 05:09 nach Start.
        const halfway = (at(21, 20) + 229) % 1440; // 01:09
        expect(computePrayerPhase(halfway, TIMES).progressPercentage).toBe(50);
    });

    it("kommt mit einem Yatsı nach Mitternacht zurecht (Hochsommer)", () => {
        // 23:00 liegt noch im Akşam-Fenster, weil Yatsı erst um 00:30 beginnt.
        const evening = computePrayerPhase(at(23, 0), SUMMER_TIMES);
        expect(evening.currentPrayer).toBe("maghrib");
        expect(evening.minutesUntilNext).toBe(90);

        // 01:00 liegt im Yatsı-Fenster, das bis 02:15 läuft.
        const night = computePrayerPhase(at(1, 0), SUMMER_TIMES);
        expect(night.currentPrayer).toBe("isha");
        expect(night.minutesUntilNext).toBe(75);
    });

    it("deckt jede Minute des Tages lückenlos ab", () => {
        for (const times of [TIMES, SUMMER_TIMES]) {
            for (let minute = 0; minute < 1440; minute++) {
                const phase = computePrayerPhase(minute, times);
                expect(phase.currentPrayer, `Minute ${minute}`).not.toBeNull();
                expect(phase.minutesUntilNext).toBeGreaterThan(0);
                expect(phase.progressPercentage).toBeGreaterThanOrEqual(0);
                expect(phase.progressPercentage).toBeLessThanOrEqual(100);
            }
        }
    });
});

describe("computePrayerPhase – Warnschwelle", () => {
    it("warnt in den letzten 15 Minuten des Fensters – unabhängig von dessen Länge", () => {
        // Langes Fenster (Öğle -> İkindi, 205 min)
        expect(computePrayerPhase(at(16, 31), TIMES).endingSoon).toBe(true);  // 15 min
        expect(computePrayerPhase(at(16, 30), TIMES).endingSoon).toBe(false); // 16 min

        // Kurzes Fenster (İmsak -> Güneş, 112 min) – gleiche Schwelle in Minuten
        expect(computePrayerPhase(at(6, 35), TIMES).endingSoon).toBe(true);   // 15 min
        expect(computePrayerPhase(at(6, 34), TIMES).endingSoon).toBe(false);  // 16 min
    });

    it("warnt nicht am Fensteranfang", () => {
        expect(computePrayerPhase(at(13, 21), TIMES).endingSoon).toBe(false);
    });

    it("bleibt konsistent zur exportierten Schwelle", () => {
        const next = at(16, 46);
        expect(computePrayerPhase(next - WARN_BEFORE_NEXT_MINUTES, TIMES).endingSoon).toBe(true);
        expect(computePrayerPhase(next - WARN_BEFORE_NEXT_MINUTES - 1, TIMES).endingSoon).toBe(false);
    });
});

describe("computePrayerPhase – Grenzfälle", () => {
    it("liefert eine leere Phase ohne Daten", () => {
        expect(computePrayerPhase(at(12, 0), null).currentPrayer).toBeNull();
        expect(computePrayerPhase(at(12, 0), null).remainingLabel).toBe("--");
    });

    it("liefert eine leere Phase statt NaN bei kaputten Zeiten", () => {
        const broken: PrayerTimes = { ...TIMES, times: { ...TIMES.times, asr: "25:99" } };
        expect(computePrayerPhase(at(12, 0), broken).currentPrayer).toBeNull();
    });

    it("stürzt nicht ab, wenn alle Zeiten identisch sind", () => {
        const degenerate: PrayerTimes = {
            ...TIMES,
            times: { fajr: "05:00", sunrise: "05:00", dhuhr: "05:00", asr: "05:00", maghrib: "05:00", isha: "05:00" },
        };
        expect(computePrayerPhase(at(12, 0), degenerate)).toEqual(
            expect.objectContaining({ currentPrayer: null })
        );
    });

    it("normalisiert Minutenwerte außerhalb von 0–1439", () => {
        expect(computePrayerPhase(at(14, 0) + 1440, TIMES).currentPrayer).toBe("dhuhr");
        expect(computePrayerPhase(at(14, 0) - 1440, TIMES).currentPrayer).toBe("dhuhr");
    });
});
