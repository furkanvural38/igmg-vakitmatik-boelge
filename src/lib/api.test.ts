import { afterEach, describe, expect, it, vi } from "vitest";
import {
    DEFAULT_API_BASE,
    classifyApiProblem,
    isPrayerTimesOutdated,
    resolveConfiguredUrl,
    todayIso,
    type PrayerTimes,
} from "./api";

describe("resolveConfiguredUrl", () => {
    it("nimmt den Fallback bei undefined, leer und Whitespace", () => {
        expect(resolveConfiguredUrl(undefined, DEFAULT_API_BASE)).toBe(DEFAULT_API_BASE);
        expect(resolveConfiguredUrl("", DEFAULT_API_BASE)).toBe(DEFAULT_API_BASE);
        expect(resolveConfiguredUrl("   ", DEFAULT_API_BASE)).toBe(DEFAULT_API_BASE);
    });

    it("behält eine gesetzte URL und streicht Slash am Ende", () => {
        expect(resolveConfiguredUrl("https://example.test/api/", DEFAULT_API_BASE)).toBe(
            "https://example.test/api"
        );
    });
});

describe("classifyApiProblem", () => {
    it("wertet 404 ohne Problem-Dokument nicht als unbekannte Stadt", () => {
        // HTML-404 von GitHub Pages darf nicht „Stadt unbekannt“ heißen.
        expect(classifyApiProblem(null, 404)).toBe("malformed-response");
    });

    it("wertet 404 mit Problem-Dokument als unbekannte Stadt", () => {
        expect(
            classifyApiProblem(
                { type: "https://igmg.example/problems/unknown-location", status: 404 },
                404
            )
        ).toBe("unknown-location");
        expect(classifyApiProblem({ title: "Not Found" }, 404)).toBe("unknown-location");
    });
});


/** Gebetszeiten-Gerüst; für die Veraltet-Prüfung zählen nur date und timezone. */
function timesFor(date: string, timezone: string | null): PrayerTimes {
    return {
        city: "hannover",
        date,
        hijriDate: null,
        timezone,
        times: {
            fajr: "05:12",
            sunrise: "07:03",
            dhuhr: "13:10",
            asr: "16:31",
            maghrib: "19:05",
            isha: "20:47",
        },
    };
}

describe("isPrayerTimesOutdated", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("hält die Zeiten von heute für aktuell", () => {
        expect(isPrayerTimesOutdated(timesFor(todayIso(), "Europe/Berlin"))).toBe(false);
    });

    it("erkennt die Zeiten von gestern als veraltet", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-09-18T10:00:00Z"));
        expect(isPrayerTimesOutdated(timesFor("2026-09-17", "Europe/Berlin"))).toBe(true);
    });

    it("rechnet in der Zeitzone der Stadt, nicht in der des Geräts", () => {
        vi.useFakeTimers();
        // 22:30 UTC = in Berlin bereits der 18., in London/UTC noch der 17.
        vi.setSystemTime(new Date("2026-09-17T22:30:00Z"));
        expect(isPrayerTimesOutdated(timesFor("2026-09-17", "Europe/Berlin"))).toBe(true);
        expect(isPrayerTimesOutdated(timesFor("2026-09-17", "UTC"))).toBe(false);
    });

    it("nimmt ohne Zeitzone Europe/Berlin an", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-09-17T22:30:00Z"));
        expect(isPrayerTimesOutdated(timesFor("2026-09-17", null))).toBe(true);
    });

    it("meldet ohne geladene Zeiten nichts zum Auffrischen", () => {
        // Während des ersten Ladens darf ein Sichtbarkeitswechsel keinen
        // zweiten Serveraufruf auslösen.
        expect(isPrayerTimesOutdated(null)).toBe(false);
    });
});
