import { describe, expect, it } from "vitest";
import { cityConfigs, citySlugs, curatedCitySlugs, resolveCity, type CityKey } from "./cities";

describe("resolveCity", () => {
    it("löst einen exakten Key auf", () => {
        expect(resolveCity("hannover")).toBe("hannover");
        expect(resolveCity("braunschweig")).toBe("braunschweig");
    });

    it("löst den einzigen camelCase-Key exakt auf", () => {
        // salzgitterBad würde an einem reinen toLowerCase-Vergleich scheitern.
        expect(resolveCity("salzgitterBad")).toBe("salzgitterBad");
    });

    it("ist für URL-Eingaben case-insensitiv", () => {
        expect(resolveCity("HANNOVER")).toBe("hannover");
        expect(resolveCity("HaNnOvEr")).toBe("hannover");
    });

    it("kennt die URL-freundlichen Aliasse", () => {
        expect(resolveCity("salzgitter-bad")).toBe("salzgitterBad");
        expect(resolveCity("salzgitterbad")).toBe("salzgitterBad");
        expect(resolveCity("SALZGITTER-BAD")).toBe("salzgitterBad");
    });

    it("trimmt Whitespace", () => {
        expect(resolveCity("  hannover  ")).toBe("hannover");
        expect(resolveCity("   ")).toBeUndefined();
    });

    it("gibt für Unbekanntes undefined zurück", () => {
        expect(resolveCity("gibtesnicht")).toBeUndefined();
        expect(resolveCity("")).toBeUndefined();
        expect(resolveCity(null)).toBeUndefined();
        expect(resolveCity(undefined)).toBeUndefined();
    });

    it("liefert keine Prototype-Keys zurück", () => {
        // Ohne hasOwnProperty-Guard gäbe citySlugs["__proto__"] Object.prototype
        // zurück – typisiert als CityKey und damit eine Lüge im Typsystem.
        expect(resolveCity("__proto__")).toBeUndefined();
        expect(resolveCity("constructor")).toBeUndefined();
        expect(resolveCity("toString")).toBeUndefined();
        expect(resolveCity("hasOwnProperty")).toBeUndefined();
    });
});

describe("Stadt-Konfiguration", () => {
    it("verweist nur auf Slugs, die die API kennt", () => {
        for (const [key, config] of Object.entries(cityConfigs)) {
            expect(curatedCitySlugs, `${key} -> ${config.citySlug}`).toContain(config.citySlug);
        }
    });

    it("bildet jeden Alias auf einen existierenden Key ab", () => {
        for (const [slug, key] of Object.entries(citySlugs)) {
            expect(Object.keys(cityConfigs), `Alias "${slug}"`).toContain(key);
        }
    });

    it("ist für jeden Key über resolveCity erreichbar", () => {
        for (const key of Object.keys(cityConfigs) as CityKey[]) {
            expect(resolveCity(key), `Key "${key}"`).toBe(key);
        }
    });

    it("hat für jede Stadt einen Moschee- und Wetternamen", () => {
        for (const [key, config] of Object.entries(cityConfigs)) {
            expect(config.mosqueName.trim(), key).not.toBe("");
            expect(config.weatherCityName.trim(), key).not.toBe("");
        }
    });
});
