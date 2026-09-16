// src/features/footerTicker/FooterTicker.tsx
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useCity } from "../../app/cityContext";

import AllahImg from "../../assets/ressources/ALLAH-image.png";
import MuhammadImg from "../../assets/ressources/Muhammad-image.png";
import DuaImg from "../../assets/ressources/dua-image.png";

const IMAGES: Record<string, string> = {
    allah: AllahImg,
    muhammad: MuhammadImg,
    dua: DuaImg,
};

/** Lesegeschwindigkeit des Marquees. */
const SCROLL_SPEED_PX_PER_SEC = 40;
/** Anteil der Laufzeit, der oben bzw. unten als Lesepause stehen bleibt. */
const HOLD_FRACTION = 0.1;
/** Untergrenze, damit knapp ueberlaufender Text nicht vorbeihuscht. */
const MIN_SCROLL_MS = 8_000;
/** Anzeigedauer fuer Inhalte, die ohne Scrollen passen. */
const STATIC_DURATION_MS = 20_000;
/** Darunter ist der Ueberlauf nur Rundungsrauschen. */
const OVERFLOW_THRESHOLD_PX = 4;
/** Reserve, falls animationend ausbleibt. */
const ANIMATION_END_GRACE_MS = 750;

/**
 * Ayet / Hadis / Dua im Wechsel, bei langem Text mit vertikalem Marquee.
 *
 * Der Takt haengt an der Lesezeit, nicht an einem festen Intervall: jeder
 * Inhalt laeuft genau einen Durchlauf und schaltet erst danach weiter. Vorher
 * liefen ein 20-Sekunden-Timer und eine endlos wiederholende Animation
 * unabhaengig nebeneinander - je nach Textlaenge wurde entweder mitten im Satz
 * umgeschaltet oder der Text sprang waehrend der Anzeige zurueck an den Anfang.
 */
export function FooterTicker() {
    const { dailyContent } = useCity();
    const items = useMemo(() => dailyContent?.items ?? [], [dailyContent]);

    // Laeuft frei hoch, der Index wird erst beim Lesen umgebrochen. Dadurch
    // braucht das Weiterschalten die Anzahl der Inhalte nicht zu kennen.
    const [cycle, setCycle] = useState(0);
    const activeItem = items.length > 0 ? items[cycle % items.length] : null;

    const advance = useCallback(() => setCycle((c) => c + 1), []);

    const viewportRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // useLayoutEffect: gemessen und ausgerichtet wird vor dem ersten Paint,
    // sonst blitzt ein falsch positionierter Text auf.
    useLayoutEffect(() => {
        const viewport = viewportRef.current;
        const content = contentRef.current;
        if (!viewport || !content || !activeItem) return;

        let disposed = false;
        let advanced = false;
        let advanceTimer: number | undefined;
        let appliedDistance = -1;

        const clearAdvanceTimer = () => {
            if (advanceTimer !== undefined) {
                clearTimeout(advanceTimer);
                advanceTimer = undefined;
            }
        };

        /** Genau einmal pro Durchlauf weiterschalten - per Event oder per Timer. */
        const advanceOnce = () => {
            if (disposed || advanced) return;
            advanced = true;
            advance();
        };

        const stopScrolling = () => {
            content.classList.remove("marquee-running");
            content.style.removeProperty("--scroll-distance");
            content.style.removeProperty("--marquee-duration");
        };

        const apply = () => {
            if (disposed) return;

            // scrollHeight/clientHeight sind Layout-Werte in CSS-Pixeln.
            // getBoundingClientRect() waere hier falsch: die Buehne ist per
            // transform: scale() verkleinert, die Rechteckmasse kaemen also um
            // den Skalierungsfaktor zu klein zurueck (bei 4K auf Full-HD ein
            // Drittel) - die Animation wuerde nur einen Bruchteil der noetigen
            // Strecke fahren und den Text abgeschnitten stehen lassen.
            const distance = Math.max(0, content.scrollHeight - viewport.clientHeight);

            // Ohne diese Schranke startet jeder ResizeObserver-Aufschlag die
            // Animation neu und der Text ruckt zurueck an den Anfang.
            if (distance === appliedDistance) return;
            appliedDistance = distance;
            clearAdvanceTimer();

            if (distance <= OVERFLOW_THRESHOLD_PX) {
                viewport.dataset.overflow = "false";
                stopScrolling();
                advanceTimer = window.setTimeout(advanceOnce, STATIC_DURATION_MS);
                return;
            }

            viewport.dataset.overflow = "true";

            const travelMs = (distance / SCROLL_SPEED_PX_PER_SEC) * 1_000;
            const durationMs = Math.max(MIN_SCROLL_MS, travelMs / (1 - 2 * HOLD_FRACTION));

            content.style.setProperty("--scroll-distance", distance + "px");
            content.style.setProperty("--marquee-duration", Math.round(durationMs) + "ms");

            // Deterministischer Neustart: Klasse ab, Reflow erzwingen, Klasse dran.
            content.classList.remove("marquee-running");
            void content.offsetHeight;
            content.classList.add("marquee-running");

            // Sicherheitsnetz, falls animationend nicht kommt (unterdrueckte
            // Animationen, Tab im Hintergrund) - sonst bliebe der Ticker stehen.
            advanceTimer = window.setTimeout(advanceOnce, durationMs + ANIMATION_END_GRACE_MS);
        };

        const onAnimationEnd = (event: AnimationEvent) => {
            // Nur der Durchlauf des Inhalts zaehlt, nicht die Einblend-Animation
            // der Fusskarte, die nach oben durchblubbert.
            if (event.target !== content) return;
            advanceOnce();
        };
        content.addEventListener("animationend", onAnimationEnd);

        const observer = new ResizeObserver(apply);
        observer.observe(viewport);
        observer.observe(content);

        apply();
        // Schriften koennen nach dem ersten Layout noch die Zeilenumbrueche und
        // damit die Hoehe veraendern.
        document.fonts?.ready.then(apply).catch(() => {});

        return () => {
            disposed = true;
            clearAdvanceTimer();
            observer.disconnect();
            content.removeEventListener("animationend", onAnimationEnd);
            stopScrolling();
        };
    }, [cycle, activeItem, advance]);

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
                    Lade islamische Inhalte...
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

                    {/* Ausrichtung und Ueberlauf regelt .marquee-viewport in der CSS -
                        bewusst nicht per Tailwind, damit justify-content nicht an
                        zwei Stellen gesetzt wird. */}
                    <div ref={viewportRef} className="marquee-viewport h-[25rem] flex-grow">
                        <div
                            // Neuer Knoten pro Durchlauf: garantiert einen sauberen
                            // Start ohne Rest-Transform der vorigen Animation.
                            key={cycle}
                            ref={contentRef}
                            className="marquee-content flex w-full max-w-full flex-col gap-y-8 text-white"
                        >
                            <div className="mt-10 text-center text-[6rem] leading-[1.2] text-white">
                                {activeItem.text}
                            </div>

                            {activeItem.source ? (
                                <div className="self-end pb-10 text-right text-[5rem] leading-[1.2] text-white">
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
