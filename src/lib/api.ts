// src/lib/api.ts
// Hier liegen Hilfsfunktionen für Datenabrufe

// ---- Typen Gebetszeiten ----
// ---- Typen Gebetszeiten ----
export interface PrayerTimes {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;

    // zusätzliche Felder aus der API
    hijriDateLong?: string;          // "6 Cemaziyelevvel 1447"
    hijriDateShort?: string;         // "6.5.1447"
    gregorianDateShort?: string;     // "28.10.2025"
    gregorianDateLong?: string;      // "28 Ekim 2025 Salı"
    shapeMoonUrl?: string;           // Mond-Icon URL
    qiblaTime?: string;              // "08:51"
    astronomicalSunrise?: string;
    astronomicalSunset?: string;
}


export interface PrayerTimesApiResponse {
    success: boolean;
    data?: PrayerTimes;
    error?: string;
}

// ---- Typen Wetter ----
export interface WeatherData {
    name: string; // Stadtname laut API
    main: {
        temp: number;
        humidity: number;
        temp_min?: number;
        temp_max?: number;
    };
    weather: Array<{
        description: string;
        icon: string; // z.B. "10d"
    }>;
}

// ---- Gebetszeiten holen ----
export async function fetchPrayerTimesFromApi(prayerApiUrl: string): Promise<PrayerTimes | null> {
    try {
        const res = await fetch(prayerApiUrl);
        if (!res.ok) {
            console.error("Prayer API response not ok", res.status);
            return null;
        }

        const json = await res.json();

        // Erwartetes Format:
        // {
        //   "success": true,
        //   "data": [
        //      { fajr: "...", hijriDateLong: "...", ... }
        //   ]
        // }
        if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
            const first = json.data[0];

            const mapped: PrayerTimes = {
                fajr: first.fajr,
                sunrise: first.sunrise,
                dhuhr: first.dhuhr,
                asr: first.asr,
                maghrib: first.maghrib,
                isha: first.isha,

                // neue Felder:
                hijriDateLong: first.hijriDateLong,
                hijriDateShort: first.hijriDateShort,
                gregorianDateShort: first.gregorianDateShort,
                gregorianDateLong: first.gregorianDateLong,
                shapeMoonUrl: first.shapeMoonUrl,
                qiblaTime: first.qiblaTime,
                astronomicalSunrise: first.astronomicalSunrise,
                astronomicalSunset: first.astronomicalSunset,
            };

            return mapped;
        }

        console.error("Prayer API format not recognized:", json);
        return null;
    } catch (err) {
        console.error("Error fetching prayer times:", err);
        return null;
    }
}



// TODO: Excel-Fallback implementieren (kommt gleich aus deinem alten Code)
async function fetchPrayerTimesFromExcelFallback(sheetName?: string): Promise<PrayerTimes | null> {
    console.warn("Excel fallback not yet implemented, returning null", sheetName);
    return null;
}

// Diese Funktion nutzt erst API, dann Fallback
export async function fetchPrayerTimesWithFallback(prayerApiUrl: string, excelSheet?: string) {
    const apiData = await fetchPrayerTimesFromApi(prayerApiUrl);
    if (apiData) return apiData;

    const excelData = await fetchPrayerTimesFromExcelFallback(excelSheet);
    if (excelData) return excelData;

    return null;
}

export async function fetchWeather(cityName: string): Promise<WeatherData | null> {
    // ⚠️ Stell sicher, dass du hier deinen echten OpenWeatherMap-API-Key einträgst
    const OPENWEATHER_API_KEY = "6847fff1ba1440395c9624c98a44f3f0";


    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
            cityName
        )}&units=metric&lang=de&appid=${OPENWEATHER_API_KEY}`;

        const res = await fetch(url);

        if (!res.ok) {
            console.error("Weather API not ok", res.status);
            return null;
        }

        const json = (await res.json()) as WeatherData;

        // sanity check: hat json.main.temp?
        if (!json?.main || typeof json.main.temp !== "number") {
            console.error("Weather API format unerwartet:", json);
            return null;
        }

        return json;
    } catch (err) {
        console.error("Error fetching weather:", err);
        return null;
    }
}
