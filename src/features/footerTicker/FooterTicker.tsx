// src/features/footerTicker/FooterTicker.tsx
import { useMemo, useState, useEffect, useRef } from "react";
import { useCity } from "../../app/CityProvider";

import AllahImg from "../../assets/ressources/ALLAH-image.png";
import MuhammadImg from "../../assets/ressources/Muhammad-image.png";
import DuaImg from "../../assets/ressources/dua-image.png";

function getImageForKey(key: string | undefined) {
    switch (key) {
        case "allah": return AllahImg;
        case "muhammad": return MuhammadImg;
        case "dua": return DuaImg;
        default: return null;
    }
}

export function FooterTicker() {
    const { dailyContent } = useCity();
    const [index, setIndex] = useState(0);

    // alle 20s zum nächsten Item
    useEffect(() => {
        const id = setInterval(() => {
            setIndex(prev => {
                if (!dailyContent?.items?.length) return 0;
                return (prev + 1) % dailyContent.items.length;
            });
        }, 20000);
        return () => clearInterval(id);
    }, [dailyContent]);

    const activeItem = useMemo(() => {
        if (!dailyContent?.items?.length) return null;
        const safe = index % dailyContent.items.length;
        return dailyContent.items[safe];
    }, [dailyContent, index]);

    // CSS-Marquee: wir messen Distanz und setzen CSS-Variablen am Content
    const viewportRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

// im FooterTicker, ersetze den useEffect-Block
    useEffect(() => {
        const viewport = viewportRef.current;
        const content = contentRef.current;
        if (!viewport || !content) return;

        const SPEED_PX_PER_SEC = 40;
        const TOP_BOTTOM_PAUSE_FRAC = 0.1;
        const MIN_DURATION_SEC = 8;
        const DIST_THRESHOLD_PX = 30; // unterhalb: nicht scrollen

        const enableAnimation = (distance: number) => {
            // Dauer berechnen – inkl. Pausenanteil
            const baseDuration = distance / SPEED_PX_PER_SEC; // reine Fahrtzeit
            const durationSec = Math.max(
                MIN_DURATION_SEC,
                baseDuration / (1 - 2 * TOP_BOTTOM_PAUSE_FRAC)
            );

            content.style.setProperty("--scroll-distance", `${distance}px`);
            content.style.setProperty("--marquee-duration", `${durationSec}s`);

            // Animation sauber neu starten
            content.classList.remove("marquee-running");
            // reflow
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            content.offsetHeight;
            content.classList.add("marquee-running");
        };

        const disableAnimation = () => {
            content.classList.remove("marquee-running");
            content.style.removeProperty("--scroll-distance");
            content.style.removeProperty("--marquee-duration");
            content.style.animationName = "none";
            content.style.transform = "translate3d(0,0,0)";
        };

        const measureAndApply = () => {
            // getBoundingClientRect ist robuster als scrollHeight/clientHeight
            const viewportH = viewport.getBoundingClientRect().height;
            const contentH = content.getBoundingClientRect().height;
            const distance = Math.max(0, Math.round(contentH - viewportH));

            if (distance <= DIST_THRESHOLD_PX) {
                disableAnimation();
            } else {
                enableAnimation(distance);
            }
        };

        const ro = new ResizeObserver(measureAndApply);
        ro.observe(viewport);
        ro.observe(content);

        // initial und bei Item-Wechsel
        measureAndApply();

        return () => ro.disconnect();
    }, [activeItem]);


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
                    style={{ fontSize: "4rem", lineHeight: 1.2, paddingLeft: "2rem" }}
                >
                    Lade islamische Inhalte…
                </div>
            ) : (
                <>
                    {/* LINKER BLOCK: großes Bild */}
                    <div
                        className="flex-shrink-0 flex items-center justify-center"
                        style={{ marginLeft: "0.5rem", marginRight: "2rem", height: "22rem", width: "22rem" }}
                    >
                        {(() => {
                            const img = getImageForKey(activeItem.imageKey);
                            if (img) {
                                return (
                                    <img
                                        src={img}
                                        alt={activeItem.title}
                                        style={{ height: "100%", width: "100%", objectFit: "contain" }}
                                    />
                                );
                            }
                            return (
                                <div className="text-[#009972] font-bold text-center" style={{ fontSize: "4rem", lineHeight: 1.1 }}>
                                    {activeItem.title}
                                </div>
                            );
                        })()}
                    </div>

                    {/* RECHTER BLOCK: reines CSS-Marquee */}
                    <div
                        ref={viewportRef}
                        className="marquee-viewport flex-grow flex justify-center items-center overflow-hidden"
                        style={{ height: "25rem" }}
                    >
                        <div
                            key={activeItem.title} // bei Item-Wechsel Animation neu starten
                            ref={contentRef}
                            className="marquee-content flex flex-col w-full text-white"
                            style={{
                                rowGap: "2rem",
                                maxWidth: "100%",
                            }}
                        >
                            <div className="text-white text-center mt-8" style={{ fontSize: "6rem", lineHeight: 1.2 }}>
                                {activeItem.text}
                            </div>

                            {activeItem.source ? (
                                <div className="text-white self-end text-right" style={{ fontSize: "5rem", lineHeight: 1.2 }}>
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
