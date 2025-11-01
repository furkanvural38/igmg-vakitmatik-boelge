import { useMemo } from "react";
import type {PrayerTimes} from "../../lib/api";

type PrayerKey = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";

function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

// Diff in Minuten (wrap um Mitternacht)
function diffMinutes(currentMin: number, nextMin: number): number {
    // z.B. current=1380 (23:00), next=320 (05:20)
    // => (320 - 1380 + 1440) % 1440 = 380min = 6h20
    return (nextMin - currentMin + 1440) % 1440;
}

// Für die kleine Anzeige wie bei dir rechts unter Wetter: "8h 24min"
function formatHoursMinutesFromDiffMin(diffMin: number): string {
    const hours = Math.floor(diffMin / 60);
    const minutes = diffMin % 60;
    return `${hours}h ${minutes}min`;
}

// Für die große zentrale Countdown-Anzeige ("HH:MM:SS")
function formatHMSFromDiffMin(diffMin: number, currentSeconds: number): string {
    // diffMin ist Minuten bis nächstes Gebet (gerundet auf Minute)
    // wir wollen sekundengenau -> nehmen aktuellen Sekundenanteil mit rein
    const totalSeconds =
        diffMin * 60 -
        currentSeconds; // z. B. 8h24m -> 30240s minus currentSeconds

    const safe = totalSeconds < 0 ? 0 : totalSeconds;
    const h = Math.floor(safe / 3600);
    const m = Math.floor((safe % 3600) / 60);
    const s = safe % 60;

    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// Fortschritt von aktuellem Slot in %
function calculateProgress(current: number, start: number, end: number): number {
    const total = (end - start + 1440) % 1440;
    const passed = (current - start + 1440) % 1440;
    if (total === 0) return 100;
    return Math.min(100, Math.max(0, Math.round((passed / total) * 100)));
}

export interface PrayerPhaseInfo {
    currentPrayer: PrayerKey | null;
    nextPrayer: PrayerKey | null;
    // Für die Riesen-Zahl in der Mitte (20:49:14 Bereich):
    mainCountdownHMS: string;
    // Für die kleine Zeile rechts unter Wetter: "8h 24min"
    diffLabelShort: string;
    // Fortschrittsbalken % für aktuelle Phase
    progressPercentage: number;
}

export function usePrayerTimeLogic(clock: Date, prayerTimes: PrayerTimes | null): PrayerPhaseInfo {
    return useMemo(() => {
        if (!prayerTimes) {
            return {
                currentPrayer: null,
                nextPrayer: null,
                mainCountdownHMS: "--:--:--",
                diffLabelShort: "--",
                progressPercentage: 0,
            };
        }

        const order: PrayerKey[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];

        const times = order.map((key) => ({
            key,
            minutes: timeToMinutes(prayerTimes[key]),
        }));

        // aktuelle Zeit in Minuten & Sekunden seit Mitternacht
        const currentMinutes = clock.getHours() * 60 + clock.getMinutes();
        const currentSeconds = clock.getSeconds();

        // finde Index vom aktuellen Slot:
        // Bedingung: current >= slot[i] && current < slot[i+1] (zyklisch)
        let currentIndex = times.findIndex((entry, i) => {
            const thisStart = entry.minutes;
            const nextStart = times[(i + 1) % times.length].minutes;
            // Vergleich im Kreis wie in deiner alten Lösung
            const inRange =
                (currentMinutes >= thisStart && currentMinutes < nextStart) ||
                // spezieller Fall über Mitternacht, z.B. isha -> fajr:
                (thisStart > nextStart &&
                    (currentMinutes >= thisStart || currentMinutes < nextStart));
            return inRange;
        });

        if (currentIndex === -1) {
            // falls nichts gefunden (sollte nicht passieren), fallback letzte
            currentIndex = times.length - 1;
        }

        const nextIndex = (currentIndex + 1) % times.length;

        const currentSlot = times[currentIndex];
        const nextSlot = times[nextIndex];

        // Minuten-Differenz zu nächstem Gebet
        const minutesUntilNext = diffMinutes(currentMinutes, nextSlot.minutes);

        // Fortschritt berechnen
        const progressPercentage = calculateProgress(
            currentMinutes,
            currentSlot.minutes,
            nextSlot.minutes
        );

        return {
            currentPrayer: currentSlot.key,
            nextPrayer: nextSlot.key,
            mainCountdownHMS: formatHMSFromDiffMin(minutesUntilNext, currentSeconds),
            diffLabelShort: formatHoursMinutesFromDiffMin(minutesUntilNext),
            progressPercentage,
        };
    }, [clock, prayerTimes]);
}
