// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig(({ mode }) => {
    const repoBase = "/igmg-vakitmatik-boelge/"; // <- exakt dein Repo-Name

    return {
        base: mode === "pages" ? repoBase : "/",
        plugins: [
            react(),
            legacy({
                targets: ["defaults", "Chrome >= 49", "Safari >= 10", "Android >= 5"],
                additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
            }),
        ],
        build: {
            target: "es2015",
            outDir: "dist",
            emptyOutDir: true,
        },
    };
});
