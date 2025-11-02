// src/features/footerTicker/FooterTicker.tsx
import { useState, useEffect, useRef } from "react";
import { useCity } from "../../app/CityProvider";
import { useVerticalScroll } from "../../hooks/useVerticalScroll";

import AllahImg from "../../assets/ressources/ALLAH-image.png";
import MuhammadImg from "../../assets/ressources/Muhammad-image.png";
import DuaImg from "../../assets/ressources/dua-image.png";

const IMG_MAP: Record<string, string> = {
    allah: AllahImg,
    muhammad: MuhammadImg,
    dua: DuaImg,
};

export function FooterTicker() {
    // Datenquelle
    const { dailyContent } = useCity();
    const items = dailyContent?.items ?? [];
    const itemsLen = items.length;

    // Aktueller Index
    const [index, setIndex] = useState(0);

    // Index normalisieren, wenn Items sich verändern (kommen neu / Länge schrumpft)
    useEffect(() => {
        if (itemsLen === 0) {
            setIndex(0);
            return;
        }
        setIndex(prev => prev % itemsLen);
    }, [itemsLen]);

    // Rotation stabil: alle 20s weiterschalten
    useEffect(() => {
        if (itemsLen === 0) return;
        const id = setInterval(() => {
            setIndex(prev => (prev + 1) % itemsLen);
        }, 10000);
        return () => clearInterval(id);
    }, [itemsLen]);

    // Aktives Item (safe)
    const activeItem = itemsLen ? items[index % itemsLen] : null;

    // Scroll-Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Auto-Scroll (langsam nach unten, loop)
    useVerticalScroll(containerRef, contentRef);

    // Scroll nach oben resetten bei Itemwechsel
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    }, [index]);

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
                h-[460px]
                px-4
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
                            height: "22rem",
                            width: "22rem",
                        }}
                    >
                        {IMG_MAP[activeItem.imageKey ?? ""] ? (
                            <img
                                src={IMG_MAP[activeItem.imageKey ?? ""]}
                                alt={activeItem.title}
                                style={{
                                    height: "100%",
                                    width: "100%",
                                    objectFit: "contain",
                                }}
                            />
                        ) : (
                            // Fallback falls kein imageKey
                            <div
                                className="text-[#009972] font-bold text-center"
                                style={{
                                    fontSize: "4rem",
                                    lineHeight: 1.1,
                                }}
                            >
                                {activeItem.title}
                            </div>
                        )}
                    </div>

                    {/* RECHTER BLOCK: vertikaler Scroll-Bereich */}
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
                            height: "25rem",
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
                                rowGap: "2rem",
                                maxWidth: "100%",
                            }}
                            // Remount bei jedem Index -> sauberer Scroll-Reset + frischer Content-Flow
                            key={index}
                        >
                            {/* Haupttext */}
                            <div
                                className="text-white text-center mt-16"
                                style={{
                                    fontSize: "6rem",
                                    lineHeight: 1.2,
                                }}
                            >
                                {activeItem.text}
                            </div>

                            {/* Quelle / Hadith-Quelle */}
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
