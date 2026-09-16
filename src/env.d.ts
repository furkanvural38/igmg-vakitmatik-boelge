/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** Basis der Vakitmatik-API, ohne Slash am Ende. */
    readonly VITE_API_BASE?: string;
    /** OpenWeather-Key. Fehlt er, bleibt die Wetterkarte leer statt zu crashen. */
    readonly VITE_OPENWEATHER_API_KEY?: string;
    /** Überschreibt den Tagesinhalt-Endpunkt (Test/Staging). */
    readonly VITE_DAILY_CONTENT_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
