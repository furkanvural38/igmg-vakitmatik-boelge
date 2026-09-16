import { describe, expect, it } from "vitest";
import {
    DEFAULT_API_BASE,
    classifyApiProblem,
    resolveConfiguredUrl,
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
