import { useCity } from "../../app/CityProvider";
import type { LogoKey } from "../../lib/cities";

import IGMGLogo from "../../assets/ressources/igmg-logo.png";
import AhlemLogo from "../../assets/ressources/ahlem-logo.png";

const logoMap: Record<LogoKey, string> = {
    default: IGMGLogo,
    igmg: IGMGLogo,
    ahlem: AhlemLogo,
};

export function TopHeader() {
    const { config } = useCity();

    const logoSrc = logoMap[config?.logoKey ?? "default"];
    const isAhlemLogo = config?.logoKey === "ahlem";

    return (
        <header
            className="
                fixed
                top-4
                left-8
                right-8
                z-50
                flex
                items-center
                justify-between
                px-10
                py-6
                gap-8
                glass-text
                backdrop-blur-xl
                bg-[rgba(10,10,15,0.45)]
                border-b
                border-[rgba(255,255,255,0.12)]
                shadow-[0_10px_40px_rgba(0,0,0,0.6)]
            "
            style={{
                height: "200px",
                boxShadow:
                    "inset 0 0 40px rgba(255,255,255,0.12), 0 30px 80px rgba(0,0,0,0.9)",
                borderRadius: "1.5rem",
            }}
        >
            <div
                className="flex items-center justify-center"
                style={{
                    flex: "0 0 550px",
                    height: "100%",
                    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.9))",
                }}
            >
                <img
                    src={logoSrc}
                    alt={config?.mosqueName ?? "IGMG"}
                    className="object-contain"
                    style={{
                        height: isAhlemLogo ? "250px" : "250px",
                    }}
                />
            </div>

            <div
                className="
                    flex
                    items-center
                    justify-center
                    uppercase
                    text-center
                    leading-snug
                    flex-1
                    text-white
                "
                style={{
                    height: "100%",
                    fontSize: "7rem",
                    fontWeight: 700,
                    letterSpacing: ".08em",
                    lineHeight: "1.1",
                    textShadow:
                        "0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.8)",
                    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.9))",
                    textAlign: "center",
                    width: "100%",
                    color: "white",
                }}
            >
                {config?.mosqueName ?? "—"}
            </div>
        </header>
    );
}