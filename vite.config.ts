// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig(({ mode }) => {
    const repoBase = "/igmg-vakitmatik-boelge/"; // <- exakt dein Repo-Name
    const isPages = mode === "pages";

    return {
        base: isPages ? repoBase : "/",
        plugins: [
            react(),
            legacy({
                targets: ["defaults", "Chrome >= 49", "Safari >= 10", "Android >= 5"],
                modernPolyfills: true,
                additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
            }),
        ],
        build: {
            target: ["es2018", "chrome64"],
            outDir: "dist",
            emptyOutDir: true,
        },
    };
});
