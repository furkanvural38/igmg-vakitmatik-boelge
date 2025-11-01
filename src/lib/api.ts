// src/lib/api.ts
export interface PrayerTimes {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    hijriDateLong?: string;
    hijriDateShort?: string;
    gregorianDateShort?: string;
    gregorianDateLong?: string;
    shapeMoonUrl?: string;
    qiblaTime?: string;
    astronomicalSunrise?: string;
    astronomicalSunset?: string;
}

export interface WeatherData {
    name: string;
    main: { temp: number; humidity: number; temp_min?: number; temp_max?: number };
    weather: Array<{ description: string; icon: string }>;
}

// ---- Helper: Timeout für Fetch ----
async function fetchWithTimeout(url: string, ms = 8000): Promise<Response> {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
        return await fetch(url, { signal: ctrl.signal });
    } finally {
        clearTimeout(t);
    }
}

// ---- Gebetszeiten API ----
export async function fetchPrayerTimesFromApi(prayerApiUrl: string): Promise<PrayerTimes | null> {
    try {
        const res = await fetchWithTimeout(prayerApiUrl, 8000);
        if (!res.ok) {
            console.error("Prayer API not ok:", res.status);
            return null;
        }
        const json = await res.json();
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
            const f = json.data[0];
            return {
                fajr: f.fajr,
                sunrise: f.sunrise,
                dhuhr: f.dhuhr,
                asr: f.asr,
                maghrib: f.maghrib,
                isha: f.isha,
                hijriDateLong: f.hijriDateLong,
                gregorianDateShort: f.gregorianDateShort,
            };
        }
        console.warn("Prayer API returned unexpected shape:", json);
        return null;
    } catch (err: any) {
        if (err.name === "AbortError") console.error("Prayer API timeout");
        else console.error("Prayer API failed:", err);
        return null;
    }
}

// ---- Minimal Excel-Fallback ----
async function fetchPrayerTimesFromExcelFallback(sheetName?: string): Promise<PrayerTimes | null> {
    console.warn("Excel fallback not implemented, using static defaults", sheetName);
    return {
        fajr: "06:00",
        sunrise: "07:30",
        dhuhr: "12:30",
        asr: "15:30",
        maghrib: "17:45",
        isha: "19:00",
        gregorianDateShort: new Date().toLocaleDateString("de-DE"),
    };
}

// ---- Combined Loader ----
export async function fetchPrayerTimesWithFallback(prayerApiUrl: string, excelSheet?: string) {
    const api = await fetchPrayerTimesFromApi(prayerApiUrl);
    if (api) return api;
    const fallback = await fetchPrayerTimesFromExcelFallback(excelSheet);
    return fallback;
}

// ---- Wetter API ----
export async function fetchWeather(cityName: string): Promise<WeatherData | null> {
    const OPENWEATHER_API_KEY = "6847fff1ba1440395c9624c98a44f3f0";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        cityName
    )}&units=metric&lang=de&appid=${OPENWEATHER_API_KEY}`;

    try {
        const res = await fetchWithTimeout(url, 8000);
        if (!res.ok) {
            console.error("Weather API not ok:", res.status);
            return null;
        }
        const json = (await res.json()) as WeatherData;
        if (!json?.main?.temp) {
            console.error("Weather API returned invalid payload");
            return null;
        }
        return json;
    } catch (err: any) {
        if (err.name === "AbortError") console.error("Weather API timeout");
        else console.error("Weather fetch failed:", err);
        return null;
    }
}
