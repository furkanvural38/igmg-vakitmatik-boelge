// src/app/AppShell.tsx
import type { ReactNode } from "react";
import { useStageScale, STAGE_WIDTH, STAGE_HEIGHT } from "../hooks/useScaleToScreen";

/**
 * Feste Bühne von 3840×2160, proportional auf den tatsächlichen Bildschirm
 * skaliert.
 *
 * Für ein Kiosk-Display ist das die richtige Entscheidung: alle Größen sind
 * absolut und damit vorhersagbar, statt über Breakpoints zu laufen, die
 * niemand auf 18 Geräten durchtesten kann.
 */
export function AppShell({ children }: { children: ReactNode }) {
    const { scale, offsetX, offsetY } = useStageScale();

    return (
        <div className="fixed inset-0 overflow-hidden bg-black text-white">
            <div
                className="absolute select-none"
                style={{
                    width: STAGE_WIDTH,
                    height: STAGE_HEIGHT,
                    left: `${offsetX}px`,
                    top: `${offsetY}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                }}
            >
                {children}
            </div>
        </div>
    );
}
