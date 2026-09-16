// src/app/ErrorBoundary.tsx
import React from "react";
import { StatusScreen } from "./StatusScreen";

/** Wartezeit bis zum automatischen Neuladen nach einem Absturz. */
const RELOAD_DELAY_MS = 15_000;
/** Mehr Abstürze als das in RELOAD_WINDOW_MS -> nicht weiter neu laden. */
const MAX_RELOADS = 3;
const RELOAD_WINDOW_MS = 5 * 60_000;
const STORAGE_KEY = "crash:reloads";

/**
 * Zählt Neuladungen in einem gleitenden Fenster.
 *
 * Ohne diese Bremse würde ein reproduzierbarer Absturz (z. B. nach einer
 * API-Änderung) zu einer Endlos-Reload-Schleife, die vor Ort nicht zu
 * diagnostizieren ist. Nach MAX_RELOADS bleibt die Fehlermeldung stehen.
 */
function registerCrashAndShouldReload(): boolean {
    try {
        const now = Date.now();
        const raw = sessionStorage.getItem(STORAGE_KEY);
        const previous: number[] = raw ? JSON.parse(raw) : [];
        const recent = previous.filter((t) => now - t < RELOAD_WINDOW_MS);
        recent.push(now);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
        return recent.length <= MAX_RELOADS;
    } catch {
        // Kein sessionStorage (Privatmodus o. Ä.): einmal neu laden ist besser
        // als ein weißer Bildschirm, der bis zum nächsten Besuch stehen bleibt.
        return true;
    }
}

interface State {
    error: Error | null;
    willReload: boolean;
}

/**
 * Letzte Verteidigungslinie für ein unbeaufsichtigtes Display.
 *
 * Ohne Boundary nimmt ein einzelner Renderfehler den ganzen Baum mit und in der
 * Moschee steht bis zum nächsten Hausbesuch ein weißer Bildschirm.
 */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
    state: State = { error: null, willReload: false };

    private reloadTimer: number | undefined;

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("Unbehandelter Renderfehler:", error, info.componentStack);

        const shouldReload = registerCrashAndShouldReload();
        this.setState({ willReload: shouldReload });

        if (shouldReload) {
            this.reloadTimer = window.setTimeout(() => window.location.reload(), RELOAD_DELAY_MS);
        }
    }

    componentWillUnmount() {
        if (this.reloadTimer !== undefined) clearTimeout(this.reloadTimer);
    }

    render() {
        const { error, willReload } = this.state;
        if (!error) return this.props.children;

        return (
            <StatusScreen
                tone="error"
                title="Anzeige vorübergehend gestört"
                detail={
                    willReload
                        ? `Die Anzeige startet in ${RELOAD_DELAY_MS / 1000} Sekunden automatisch neu.`
                        : "Mehrere Neustarts hintereinander fehlgeschlagen. Bitte Technik informieren."
                }
            />
        );
    }
}
