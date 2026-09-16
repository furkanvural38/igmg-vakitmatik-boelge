// vitest.config.ts
//
// Bewusst getrennt von vite.config.ts: die Tests prüfen reine Logik und
// brauchen weder das React- noch das Legacy-Plugin.
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        include: ["src/**/*.test.ts"],
    },
});
