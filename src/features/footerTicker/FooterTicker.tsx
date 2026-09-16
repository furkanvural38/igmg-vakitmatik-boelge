// src/features/footerTicker/FooterTicker.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useCity } from "../../app/cityContext";

import AllahImg from "../../assets/ressources/ALLAH-image.png";
import MuhammadImg from "../../assets/ressources/Muhammad-image.png";
import DuaImg from "../../assets/ressources/dua-image.png";

const IMAGES: Record<string, string> = {
    allah: AllahImg,
    muhammad: MuhammadImg,
    dua: DuaImg,
};

/** Anzeigedauer pro Inhalt (Âyet / Hadis / Dua). */
const ITEM_DURATION_MS = 20_000;

// Marquee-Parameter
const SPEED_PX_PER_SEC = 40;
const TOP_BOTTOM_PAUSE_FRAC = 0.1;
const MIN_DURATION_SEC = 8;
/** Darunter lohnt das Scrollen nicht – der Text passt praktisch schon. */
const DIST_THRESHOLD_PX = 30;

export function FooterTicker() {
    const { dailyContent } = useCity();
    const items = useMemo(() => dailyContent?.items ?? [], [dailyContent]);
    const [index, setIndex] = useState(0);

    // Länge über eine Ref, damit der Intervall-Effekt nicht bei jedem
    // Inhaltswechsel neu aufgesetzt wird (und der Ticker dabei auf 0 springt).
    const itemCountRef = useRef(items.length);
    itemCountRef.current = items.length;

    useEffect(() => {
        const id = window.setInterval(() => {
            const count = itemCountRef.current;
            setIndex((prev) => (count > 0 ? (prev + 1) % count : 0));
        }, ITEM_DURATION_MS);
        return () => clearInterval(id);
    }, []);

    const activeItem = items.length > 0 ? items[index % items.length] : null;

    const viewportRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Reines CSS-Marquee: hier wird nur gemessen und die Distanz als CSS-Variable
    // gesetzt. Das Scrollen selbst läuft im Compositor, nicht im Mainthread.
    useEffect(() => {
        const viewport = viewportRef.current;
        const content = contentRef.current;
        if (!viewport || !content) return;

        const enableAnimation = (distance: number) => {
            const travelSec = distance / SPEED_PX_PER_SEC;
            const durationSec = Math.max(
                MIN_DURATION_SEC,
                travelSec / (1 - 2 * TOP_BOTTOM_PAUSE_FRAC)
            );

            content.style.setProperty("--scroll-distance", `${distance}px`);
            content.style.setProperty("--marquee-duration", `${durationSec}s`);
            content.style.removeProperty("animation-name");
            content.style.removeProperty("transform");

            // Animation sauber neu starten: Klasse ab, Reflow erzwingen, Klasse dran.
            content.classList.remove("marquee-running");
            void content.offsetHeight;
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
            // getBoundingClientRect ist robuster als scrollHeight/clientHeight,
            // weil die Bühne skaliert ist.
            const distance = Math.max(
                0,
                Math.round(
                    content.getBoundingClientRect().height - viewport.getBoundingClientRect().height
                )
            );

            if (distance <= DIST_THRESHOLD_PX) disableAnimation();
            else enableAnimation(distance);
        };

        const observer = new ResizeObserver(measureAndApply);
        observer.observe(viewport);
        observer.observe(content);
        measureAndApply();

        return () => observer.disconnect();
    }, [activeItem]);

    const image = activeItem ? IMAGES[activeItem.imageKey] : undefined;

    return (
        <footer
            className="glass-card glass-card-content glass-animate-in mx-auto flex h-[450px] w-full items-center justify-start rounded-3xl px-8 text-white"
            style={{
                boxShadow:
                    "0 30px 80px rgba(0,0,0,0.9), 0 10px 30px rgba(0,0,0,0.8), 0 0 60px rgba(0,150,255,0.3)",
            }}
        >
            {!activeItem ? (
                <div className="flex items-center pl-8 text-[4rem] font-light leading-[1.2] text-white">
                    Lade islamische Inhalte…
                </div>
            ) : (
                <>
                    <div className="ml-2 mr-8 flex h-[22rem] w-[22rem] flex-shrink-0 items-center justify-center">
                        {image ? (
                            <img src={image} alt={activeItem.title} className="h-full w-full object-contain" />
                        ) : (
                            <div className="text-center text-[4rem] font-bold leading-[1.1] text-brand">
                                {activeItem.title}
                            </div>
                        )}
                    </div>

                    <div
                        ref={viewportRef}
                        className="marquee-viewport flex h-[25rem] flex-grow items-center justify-center overflow-hidden"
                    >
                        <div
                            key={activeItem.title} // Wechsel des Inhalts startet die Animation neu
                            ref={contentRef}
                            className="marquee-content flex w-full max-w-full flex-col gap-y-8 text-white"
                        >
                            <div className="mt-10 text-center text-[6rem] leading-[1.2] text-white">
                                {activeItem.text}
                            </div>

                            {activeItem.source ? (
                                <div className="self-end text-right text-[5rem] leading-[1.2] text-white">
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
