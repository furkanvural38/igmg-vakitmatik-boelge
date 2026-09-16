import { describe, expect, it } from "vitest";
import {
    HOLD_BOTTOM_MS,
    HOLD_TOP_MS,
    OVERFLOW_THRESHOLD_PX,
    SCROLL_SPEED_PX_PER_SEC,
    STATIC_DURATION_MS,
    planTicker,
} from "./tickerTiming";

describe("planTicker – wann gescrollt wird", () => {
    it("scrollt nicht, wenn nichts verdeckt ist", () => {
        const t = planTicker(0);
        expect(t.scrolls).toBe(false);
        expect(t.totalMs).toBe(STATIC_DURATION_MS);
    });

    it("scrollt nicht wegen Rundung oder Zeilendurchschuss", () => {
        expect(planTicker(1).scrolls).toBe(false);
        expect(planTicker(OVERFLOW_THRESHOLD_PX).scrolls).toBe(false);
    });

    it("scrollt, sobald echter Text verdeckt ist", () => {
        expect(planTicker(OVERFLOW_THRESHOLD_PX + 1).scrolls).toBe(true);
        expect(planTicker(115).scrolls).toBe(true);
    });

    it("faengt unbrauchbare Eingaben ab", () => {
        expect(planTicker(-50).scrolls).toBe(false);
        expect(planTicker(Number.NaN).scrolls).toBe(false);
        expect(planTicker(Number.POSITIVE_INFINITY).scrolls).toBe(false);
    });
});

describe("planTicker – Anzeigedauer", () => {
    // Das ist der Fehler, der in Produktion sichtbar war: ein Âyet mit 38 px
    // verdecktem Text verschwand nach 8 s, die kurze Dua blieb 20 s stehen.
    it("gibt einem scrollenden Inhalt NIE weniger Zeit als einem statischen", () => {
        for (let hidden = 0; hidden <= 3000; hidden += 7) {
            expect(planTicker(hidden).totalMs, `verdeckt: ${hidden}px`).toBeGreaterThanOrEqual(
                STATIC_DURATION_MS
            );
        }
    });

    it("ist monoton: mehr verdeckter Text bedeutet nie weniger Zeit", () => {
        let previous = 0;
        for (let hidden = 0; hidden <= 3000; hidden += 7) {
            const total = planTicker(hidden).totalMs;
            expect(total, `verdeckt: ${hidden}px`).toBeGreaterThanOrEqual(previous);
            previous = total;
        }
    });

    it("streckt bei kleinem Ueberlauf die Standzeit am Ende statt hinauszuwerfen", () => {
        const t = planTicker(38); // der konkrete Produktionsfall
        expect(t.scrolls).toBe(true);
        expect(t.totalMs).toBe(STATIC_DURATION_MS);
        expect(t.holdTopMs).toBe(HOLD_TOP_MS);
        expect(t.holdBottomMs).toBeGreaterThan(HOLD_BOTTOM_MS);
    });

    it("waechst bei viel Text ueber die Mindestdauer hinaus", () => {
        const t = planTicker(2000);
        const travel = (2000 / SCROLL_SPEED_PX_PER_SEC) * 1_000;
        expect(t.travelMs).toBeCloseTo(travel, 5);
        expect(t.holdBottomMs).toBe(HOLD_BOTTOM_MS);
        expect(t.totalMs).toBeCloseTo(HOLD_TOP_MS + travel + HOLD_BOTTOM_MS, 5);
        expect(t.totalMs).toBeGreaterThan(STATIC_DURATION_MS);
    });

    it("setzt sich aus den drei Abschnitten zusammen", () => {
        for (const hidden of [9, 38, 115, 400, 1200]) {
            const t = planTicker(hidden);
            expect(t.totalMs).toBeCloseTo(t.holdTopMs + t.travelMs + t.holdBottomMs, 5);
            expect(t.distancePx).toBe(hidden);
        }
    });

    it("faehrt mit gleichbleibender Geschwindigkeit", () => {
        const a = planTicker(400);
        const b = planTicker(800);
        expect(b.travelMs).toBeCloseTo(a.travelMs * 2, 5);
    });
});
