// src/features/footerTicker/FooterTicker.tsx
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useCity } from "../../app/cityContext";
import { planTicker } from "./tickerTiming";

import AllahImg from "../../assets/ressources/ALLAH-image.png";
import MuhammadImg from "../../assets/ressources/Muhammad-image.png";
import DuaImg from "../../assets/ressources/dua-image.png";

const IMAGES: Record<string, string> = {
    allah: AllahImg,
    muhammad: MuhammadImg,
    dua: DuaImg,
};

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
        let timing: ReturnType<typeof planTicker> | null = null;

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
            content.style.removeProperty("animation-delay");
            content.style.removeProperty("animation-duration");
        };

        const apply = () => {
            if (disposed) return;

            // scrollHeight/clientHeight sind Layout-Werte in CSS-Pixeln.
            // getBoundingClientRect() waere hier falsch: die Buehne ist per
            // transform: scale() verkleinert, die Rechteckmasse kaemen also um
            // den Skalierungsfaktor zu klein zurueck (bei 4K auf Full-HD ein
            // Drittel) - die Animation wuerde nur einen Bruchteil der noetigen
            // Strecke fahren und den Text abgeschnitten stehen lassen.
            //
            // Gemessen wird ausschliesslich der Textblock: der Atemraum sitzt am
            // Viewport und wird hier abgezogen. Sonst zaehlt Leerraum als Inhalt,
            // der aufgedeckt werden muss - genau daran ist ein sichtbar
            // passendes Ayet in eine Scroll-Animation gerutscht.
            const cs = getComputedStyle(viewport);
            const padding = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
            const usable = Math.max(0, viewport.clientHeight - padding);
            const hidden = Math.max(0, content.scrollHeight - usable);

            // Ohne diese Schranke startet jeder ResizeObserver-Aufschlag die
            // Animation neu und der Text ruckt zurueck an den Anfang.
            if (hidden === appliedDistance) return;
            appliedDistance = hidden;
            clearAdvanceTimer();

            const plan = planTicker(hidden);
            timing = plan;

            if (!plan.scrolls) {
                viewport.dataset.overflow = "false";
                stopScrolling();
                advanceTimer = window.setTimeout(advanceOnce, plan.totalMs);
                return;
            }

            viewport.dataset.overflow = "true";

            content.style.setProperty("--scroll-distance", plan.distancePx + "px");
            content.style.animationDelay = Math.round(plan.holdTopMs) + "ms";
            content.style.animationDuration = Math.round(plan.travelMs) + "ms";

            // Deterministischer Neustart: Klasse ab, Reflow erzwingen, Klasse dran.
            content.classList.remove("marquee-running");
            void content.offsetHeight;
            content.classList.add("marquee-running");

            // Sicherheitsnetz, falls animationend nicht kommt (unterdrueckte
            // Animationen, Tab im Hintergrund) - sonst bliebe der Ticker stehen.
            advanceTimer = window.setTimeout(advanceOnce, plan.totalMs + ANIMATION_END_GRACE_MS);
        };

        const onAnimationEnd = (event: AnimationEvent) => {
            // Nur der Durchlauf des Inhalts zaehlt, nicht die Einblend-Animation
            // der Fusskarte, die nach oben durchblubbert.
            if (event.target !== content) return;

            // Nicht sofort weiterschalten: der Text steht jetzt vollstaendig
            // aufgedeckt da und will zu Ende gelesen werden.
            clearAdvanceTimer();
            advanceTimer = window.setTimeout(advanceOnce, timing?.holdBottomMs ?? 0);
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
                            {/* Kein dekorativer Aussenabstand: der Atemraum sitzt
                                als padding am Viewport, sonst zaehlt er als Inhalt,
                                der aufgedeckt werden muss. */}
                            <div className="text-center text-[6rem] leading-[1.2] text-white">
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
