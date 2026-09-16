// src/features/header/TopHeader.tsx
import { useCity } from "../../app/cityContext";
import type { LogoKey } from "../../lib/cities";

import IGMGLogo from "../../assets/ressources/igmg-logo.png";
import AhlemLogo from "../../assets/ressources/ahlem-logo.png";

const LOGOS: Record<LogoKey, string> = {
    default: IGMGLogo,
    igmg: IGMGLogo,
    ahlem: AhlemLogo,
};

/**
 * Kopfzeile mit Logo und Moscheename.
 *
 * Liegt fixed über der Bühne (siehe App.tsx). Das Logo ist bewusst höher als
 * die Kopfleiste: die Logo-PNGs haben transparente Ränder, die sichtbare Marke
 * sitzt dadurch optisch mittig. Früher stand hier ein Ternary mit zwei
 * identischen Zweigen — die Absicht war nicht erkennbar, jetzt steht sie da.
 */
const HEADER_HEIGHT = 200;
const LOGO_HEIGHT = 250;

export function TopHeader() {
    const { config } = useCity();
    const logoSrc = LOGOS[config?.logoKey ?? "default"];

    return (
        <header
            className="glass-text fixed left-8 right-8 top-4 z-50 flex items-center justify-between gap-8 border-b border-[rgba(255,255,255,0.12)] bg-surface-strong px-10 py-6"
            style={{
                height: HEADER_HEIGHT,
                boxShadow: "inset 0 0 40px rgba(255,255,255,0.12), 0 30px 80px rgba(0,0,0,0.9)",
                borderRadius: "1.5rem",
            }}
        >
            <div
                className="flex flex-shrink-0 items-center justify-center"
                style={{
                    flexBasis: 550,
                    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.9))",
                }}
            >
                <img
                    src={logoSrc}
                    alt={config?.mosqueName ?? "IGMG"}
                    className="object-contain"
                    style={{ height: LOGO_HEIGHT }}
                />
            </div>

            <h1
                className="flex w-full flex-1 items-center justify-center text-center uppercase text-white"
                style={{
                    fontSize: "7rem",
                    fontWeight: 700,
                    letterSpacing: ".08em",
                    lineHeight: 1.1,
                    textShadow: "0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.8)",
                    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.9))",
                }}
            >
                {config?.mosqueName ?? "—"}
            </h1>
        </header>
    );
}
