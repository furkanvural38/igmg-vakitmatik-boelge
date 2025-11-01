// src/hooks/useScaleToScreen.ts
import { useState, useEffect } from "react";

const BASE_WIDTH = 3840;
const BASE_HEIGHT = 2160;

export function useScaleToScreen() {
    const [scale, setScale] = useState(1);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);

    useEffect(() => {
        function update() {
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            // wir skalieren proportional, aber nicht über die Bildschirmgröße hinaus
            const scaleFactorWidth = vw / BASE_WIDTH;
            const scaleFactorHeight = vh / BASE_HEIGHT;
            const nextScale = Math.min(scaleFactorWidth, scaleFactorHeight);

            // nach Skalierung die echte gerenderte Größe
            const renderedWidth = BASE_WIDTH * nextScale;
            const renderedHeight = BASE_HEIGHT * nextScale;

            // zentrieren
            const nextOffsetX = (vw - renderedWidth) / 2;
            const nextOffsetY = (vh - renderedHeight) / 2;

            setScale(nextScale);
            setOffsetX(nextOffsetX);
            setOffsetY(nextOffsetY);
        }

        // initial berechnen
        update();

        // bei Resize neu
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    return {
        baseWidth: BASE_WIDTH,
        baseHeight: BASE_HEIGHT,
        scale,
        offsetX,
        offsetY,
    };
}
