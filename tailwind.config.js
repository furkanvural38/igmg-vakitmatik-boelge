/** @type {import('tailwindcss').Config} */

// Single Source of Truth für die Markenfarben.
// Vorher lag jeder Ton dreifach im Code: als TS-Konstante, als Tailwind-
// Arbitrary-Value und als rgba() im CSS – mit auseinandergelaufenen Werten
// (#009972 vs. #00DE72, #ff3b30 vs. bg-red-500). Alles unten abgeleitet,
// CSS greift über theme() darauf zu.
const rgba = (r, g, b) => (a) => `rgba(${r}, ${g}, ${b}, ${a})`;

const brand = rgba(0, 153, 114);   // #009972
const danger = rgba(255, 59, 48);  // #ff3b30
const surface = rgba(20, 20, 25);

export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: brand(1),
                    ring: brand(0.4),
                    wash: brand(0.15),
                    tint: brand(0.25),
                },
                danger: {
                    DEFAULT: danger(1),
                    ring: danger(0.55),
                    wash: danger(0.15),
                },
                // Inaktive Kacheln
                muted: "#a7a7a7",
                surface: {
                    DEFAULT: surface(0.45),
                    strong: "rgba(10, 10, 15, 0.45)",
                },
                hairline: "rgba(255, 255, 255, 0.2)",
            },
            fontFamily: {
                // ClashDisplay lag als 0-Byte-Datei im Repo: Vite hat sie als
                // leeren data:-URI eingebettet, der Browser hat sie verworfen und
                // still auf system-ui zurückgefallen. Bis die echte Schriftdatei
                // da ist (siehe README), wird der Fallback ehrlich deklariert.
                sans: [
                    "ui-sans-serif", "system-ui", "Segoe UI", "Roboto",
                    "Noto Sans", "DejaVu Sans", "Liberation Sans", "Arial", "sans-serif",
                ],
                display: [
                    "ui-sans-serif", "system-ui", "Segoe UI", "Roboto",
                    "Noto Sans", "DejaVu Sans", "Liberation Sans", "Arial", "sans-serif",
                ],
                // Stack fuer alles Numerische (Uhr, Gebetszeiten, Countdown, Datum).
                //
                // Nachgemessen: bei "ui-sans-serif"/"system-ui" greift
                // font-variant-numeric: tabular-nums NICHT - die Ziffernpaare
                // "11" und "44" unterscheiden sich dort um 23 px (auf der 4K-Buehne
                // ~128 px), die Uhr wandert also bei jedem Sekundenwechsel.
                // Arial, Liberation Sans und DejaVu Sans haben von Haus aus
                // gleich breite Ziffern - Spanne 0. Genau diese Schriften lagen
                // vorher hinter dem generischen "sans-serif" der Uhr.
                tabular: [
                    "Arial", "Helvetica", "Liberation Sans", "DejaVu Sans", "sans-serif",
                ],
            },
            fontSize: {
                // Feste Bühnengrößen (3840×2160) – die Stage skaliert proportional.
                clock: ["32rem", { lineHeight: "0.8" }],
                seconds: ["16rem", { lineHeight: "0.9" }],
            },
            spacing: {
                // Für die Kachel-/Wetterkarten-Kantenlänge.
                card: "34rem",
            },
        },
    },
    plugins: [],
};
