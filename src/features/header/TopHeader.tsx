import { useCity } from "../../app/CityProvider";
import IGMGLogo from "../../assets/ressources/igmg-logo.png";

export function TopHeader() {
    const { config } = useCity();

    return (
        <div
            className="
                flex
                w-full
                items-center
                justify-between
                m-6
                gap-6
            "
        >
            {/* 🔸 Logo box mit Glass-Effekt */}
            <div
                className={`
                    relative
                    flex
                    items-center
                    justify-center
                    rounded-2xl
                    px-10
                    py-6
                    glass-text
                `}
                style={{
                    flex: "0 0 550px",
                    height: "200px",
                    borderRadius: "1.5rem", // = rounded-2xl fallback für inline glow layer
                }}
            >
                {/* Glow-Ring hinter der Box */}
                <div
                    style={{
                        borderRadius: "1.5rem",
                        position: "absolute",
                        inset: "-8px",
                        opacity: 0.6,
                        zIndex: 1,
                        pointerEvents: "none",
                    }}
                />

                {/* Inhalt oben drüber */}
                <div
                    className="relative z-[2] flex items-center justify-center"
                    style={{
                        filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.9))",
                    }}
                >
                    <img
                        src={IGMGLogo}
                        alt="IGMG"
                        className="h-[130px] object-contain"
                    />
                </div>
            </div>

            {/* 🔸 Moschee-Name box mit Glass-Effekt */}
            <div
                className={`
                    relative
                    flex
                    items-center
                    justify-center
                    rounded-2xl
                    px-12
                    py-6
                    uppercase
                    text-center
                    leading-snug
                    flex-1
                  
                    glass-text
                `}
                style={{
                    height: "200px",
                    borderRadius: "1.5rem",
                    fontSize: "7rem",
                    fontWeight: 700,
                    letterSpacing: ".08em",
                    color: "white",
                    textShadow:
                        "0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.8)",
                }}
            >
                {/* Glow-Ring hinter der Box */}
                <div
                    style={{
                        borderRadius: "1.5rem",
                        position: "absolute",
                        inset: "-8px",
                        opacity: 0.6,
                        zIndex: 1,
                        pointerEvents: "none",
                    }}
                />

                {/* Text oben drüber */}
                <div
                    className="relative z-[2] text-white font-bold tracking-[.08em]"
                    style={{
                        lineHeight: "1.1",
                        textAlign: "center",
                        width: "100%",
                        filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.9))",
                    }}
                >
                    {config?.mosqueName ?? "—"}
                </div>
            </div>
        </div>
    );
}
