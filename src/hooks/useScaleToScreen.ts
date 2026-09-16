// src/hooks/useScaleToScreen.ts
import { useCallback, useEffect, useState } from "react";

export const STAGE_WIDTH = 3840;
export const STAGE_HEIGHT = 2160;

interface StageTransform {
    scale: number;
    offsetX: number;
    offsetY: number;
}

function measure(): StageTransform {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Proportional einpassen (contain), nie verzerren.
    const scale = Math.min(vw / STAGE_WIDTH, vh / STAGE_HEIGHT);

    return {
        scale,
        offsetX: (vw - STAGE_WIDTH * scale) / 2,
        offsetY: (vh - STAGE_HEIGHT * scale) / 2,
    };
}

/**
 * Skalierung und Zentrierung der Bühne.
 *
 * Ein State-Objekt statt drei einzelner States: das waren sonst drei
 * Set-Aufrufe pro Resize. Lazy initialisiert, damit der erste Frame schon
 * korrekt sitzt statt sichtbar von scale=1 zu springen.
 */
export function useStageScale(): StageTransform {
    const [transform, setTransform] = useState<StageTransform>(measure);

    const update = useCallback(() => setTransform(measure()), []);

    useEffect(() => {
        update();
        window.addEventListener("resize", update);
        window.addEventListener("orientationchange", update);
        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("orientationchange", update);
        };
    }, [update]);

    return transform;
}
