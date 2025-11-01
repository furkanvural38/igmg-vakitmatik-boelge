// src/app/App.tsx
import { AppShell } from "./AppShell";
import { useCity } from "./CityProvider";
import { PrayerPanel } from "../features/prayer/PrayerPanel";
import { FooterTicker } from "../features/footerTicker/FooterTicker";
import { TopHeader } from "../features/header/TopHeader";




export default function App() {
    const {
        isValidCity,
        cityKey,
        loading,
        error,
    } = useCity();


    return (
        <AppShell>
            {!isValidCity ? (
                <div className="w-full h-full flex items-center justify-center bg-transparent text-red-500 text-6xl font-bold">
                    Unbekannte Stadt: {cityKey}
                </div>
            ) : loading ? (
                <div className="w-full h-full flex items-center justify-center bg-transparent text-yellow-400 text-6xl font-bold">
                    Lädt…
                </div>
            ) : error ? (
                <div className="w-full h-full flex items-center justify-center bg-transparent text-red-500 text-6xl font-bold text-center px-20">
                    Fehler beim Laden:
                    <br />
                    {error}
                </div>
            ) : (
                <div className="flex flex-col w-full h-full text-white bg-transparent">

                    {/* HEADER */}
                    <header className="w-full pl-8 pr-0 py-8 flex items-start justify-between">
                        <TopHeader />
                    </header>

                    {/* MITTLERER BEREICH */}
                    <main className="flex-1 flex flex-col items-center justify-center gap-16 text-white mt-64">
                        <PrayerPanel />
                    </main>

                    {/* FOOTER */}
                    <footer className="w-full p-8">
                        <FooterTicker />
                    </footer>
                </div>
            )}
        </AppShell>
    );
}
