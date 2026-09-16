// src/app/App.tsx
import { AppShell } from "./AppShell";
import { useCity } from "./cityContext";
import { StatusScreen } from "./StatusScreen";
import { PrayerPanel } from "../features/prayer/PrayerPanel";
import { FooterTicker } from "../features/footerTicker/FooterTicker";
import { TopHeader } from "../features/header/TopHeader";

export default function App() {
    const { isValidCity, cityKey, loading, error } = useCity();

    if (!isValidCity) {
        return (
            <AppShell>
                <StatusScreen
                    tone="error"
                    title="Unbekannte Stadt"
                    detail={cityKey ? `"${cityKey}" ist nicht konfiguriert.` : undefined}
                />
            </AppShell>
        );
    }

    if (loading) {
        return (
            <AppShell>
                <StatusScreen tone="warning" title="Lädt…" />
            </AppShell>
        );
    }

    if (error) {
        return (
            <AppShell>
                <StatusScreen tone="error" title="Fehler beim Laden" detail={error} />
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="flex h-full w-full flex-col bg-transparent text-white">
                {/* TopHeader liegt fixed über der Bühne und beansprucht keinen Platz
                    im Fluss. Der Abstand unten hält den Inhalt darunter frei;
                    ändert sich die Kopfhöhe, muss er mitwandern. */}
                <TopHeader />

                <main className="mt-64 flex flex-1 flex-col items-center justify-center gap-16">
                    <PrayerPanel />
                </main>

                <div className="w-full p-8">
                    <FooterTicker />
                </div>
            </div>
        </AppShell>
    );
}
