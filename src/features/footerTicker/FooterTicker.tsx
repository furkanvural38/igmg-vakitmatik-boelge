// src/features/footerTicker/FooterTicker.tsx
import { useMemo, useState, useEffect, useRef } from "react";
import { useCity } from "../../app/CityProvider";
import { useVerticalScroll } from "../../hooks/useVerticalScroll";

import AllahImg from "../../assets/ressources/ALLAH-image.png";
import MuhammadImg from "../../assets/ressources/Muhammad-image.png";
import DuaImg from "../../assets/ressources/dua-image.png";

function getImageForKey(key: string | undefined) {
    switch (key) {
        case "allah":
            return AllahImg;
        case "muhammad":
            return MuhammadImg;
        case "dua":
            return DuaImg;
        default:
            return null;
    }
}

export function FooterTicker() {
    const { dailyContent } = useCity();
    const [index, setIndex] = useState(0);

    // alle 20 sekunden zum nächsten item
    useEffect(() => {
        const id = setInterval(() => {
            setIndex((prev) => {
                if (!dailyContent?.items || dailyContent.items.length === 0) return 0;
                return (prev + 1) % dailyContent.items.length;
            });
        }, 20000);

        return () => clearInterval(id);
    }, [dailyContent]);

    // aktives item auswählen
    const activeItem = useMemo(() => {
        if (!dailyContent?.items || dailyContent.items.length === 0) return null;
        const safeIndex = index % dailyContent.items.length;
        return dailyContent.items[safeIndex];
    }, [dailyContent, index]);

    // refs für auto-scroll nach unten
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // hook aktivieren (scrollt vertikal von oben nach unten + loop)
    useVerticalScroll(containerRef, contentRef);

    return (
        <footer
            className="
                glass-card
                glass-card-content
                glass-animate-in
                w-full
                flex
                items-center
                justify-start
                text-white
                mx-auto
                rounded-3xl
                h-[450px]
                px-8
            "
            style={{
                boxShadow:
                    "0 30px 80px rgba(0,0,0,0.9), 0 10px 30px rgba(0,0,0,0.8), 0 0 60px rgba(0,150,255,0.3)",

            }}
        >
            {!activeItem ? (
                <div
                    className="text-white font-light flex items-center"
                    style={{
                        fontSize: "4rem",
                        lineHeight: 1.2,
                        paddingLeft: "2rem",
                    }}
                >
                    Lade islamische Inhalte…
                </div>
            ) : (
                <>
                    {/* LINKER BLOCK: großes Bild */}
                    <div
                        className="flex-shrink-0 flex items-center justify-center"
                        style={{
                            marginLeft: "0.5rem",
                            marginRight: "2rem",
                            height: "22rem", // groß wie gewünscht
                            width: "22rem",
                        }}
                    >
                        {(() => {
                            const img = getImageForKey(activeItem.imageKey);
                            if (img) {
                                return (
                                    <img
                                        src={img}
                                        alt={activeItem.title}
                                        style={{
                                            height: "100%",
                                            width: "100%",
                                            objectFit: "contain",
                                        }}
                                    />
                                );
                            }
                            // fallback falls kein bild-key
                            return (
                                <div
                                    className="text-[#009972] font-bold text-center"
                                    style={{
                                        fontSize: "4rem",
                                        lineHeight: 1.1,
                                    }}
                                >
                                    {activeItem.title}
                                </div>
                            );
                        })()}
                    </div>

                    {/* RECHTER BLOCK: vertikaler scroll-bereich */}
                    <div
                        ref={containerRef}
                        className="
                            flex-grow
                            overflow-hidden
                            flex
                            justify-center
                            items-center
                        "
                        style={{
                            // sichtfenster für den scroll
                            height: "24rem",
                        }}
                    >
                        <div
                            ref={contentRef}
                            className="
                                flex
                                flex-col
                                w-full
                                text-white
                            "
                            style={{
                                rowGap: "2rem", // abstand zwischen text und quelle
                                // KEIN justify-center hier, damit contentRef richtige natürliche Höhe bekommt
                                // Breite begrenzen, damit Text nicht von Rand zu Rand klatscht
                                maxWidth: "100%",
                            }}
                        >
                            {/* Haupttext (zentriert anzeigen) */}
                            <div
                                className="text-white text-center mt-16"
                                style={{
                                    fontSize: "6rem",
                                    lineHeight: 1.2,
                                }}
                            >
                                {activeItem.text}
                            </div>

                            {/* Quelle / Hadith-Quelle: immer letztes Element, rechts ausgerichtet */}
                            {activeItem.source ? (
                                <div
                                    className="text-white self-end text-right"
                                    style={{
                                        fontSize: "5rem",
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {activeItem.source}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </>
            )}
        </footer>
    );
}
