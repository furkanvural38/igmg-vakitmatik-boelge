// src/app/StatusScreen.tsx
import type { ReactNode } from "react";

type Tone = "info" | "warning" | "error";

const TONE_CLASS: Record<Tone, string> = {
    info: "text-white",
    warning: "text-yellow-400",
    error: "text-danger",
};

/**
 * Bildschirmfüllende Meldung (Laden, Fehler, unbekannte Stadt).
 *
 * Vorher lag jede dieser Meldungen als eigener Inline-Style-Block in App.tsx und
 * routes.tsx — teils mit `<br />` in einem flex-row-Container, wodurch der Text
 * nebeneinander statt untereinander stand.
 */
export function StatusScreen({
    tone = "info",
    title,
    detail,
}: {
    tone?: Tone;
    title: ReactNode;
    detail?: ReactNode;
}) {
    return (
        <div
            role="status"
            aria-live="polite"
            className="flex h-full w-full flex-col items-center justify-center gap-8 bg-black px-20 text-center"
        >
            <div className={`text-8xl font-bold ${TONE_CLASS[tone]}`}>{title}</div>
            {detail ? <div className="max-w-[80%] text-6xl text-muted">{detail}</div> : null}
        </div>
    );
}
