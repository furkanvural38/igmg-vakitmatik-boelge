import React from "react";
import { useScaleToScreen } from "../hooks/useScaleToScreen";

type AppShellProps = {
    children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
    const { baseWidth, baseHeight, scale, offsetX, offsetY } = useScaleToScreen();

    return (
        <div
            className="fixed inset-0 flex items-center justify-center overflow-hidden text-white"
            style={{
                backgroundColor: "#000", // außen bleibt schwarz
            }}
        >
            {/* Skaliertes App-Fenster */}
            <div
                style={{
                    position: "absolute",
                    width: baseWidth,
                    height: baseHeight,
                    left: `${offsetX}px`,
                    top: `${offsetY}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                }}
                className="select-none relative"
            >
                {/* === Hintergrundbild hinter allem === */}
                <div
                    className="absolute inset-0 -z-10"
                    style={{
                        backgroundSize: "cover",
                        backgroundPosition: "center center",
                        backgroundRepeat: "no-repeat",
                    }}
                />

                {/* === Deine App-Inhalte (Header, Center, Footer) === */}
                <div
                    className="relative w-full h-full"
                    style={{
                        // du kannst das leicht abdunkeln falls Text schwer lesbar ist:
                        // backgroundColor: "rgba(0,0,0,0.35)",
                        backgroundColor: "transparent",
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
