// src/lib/cities.ts
export interface CityConfig {
    mosqueName: string;
    weatherCityName: string;
    prayerApiUrl: string;
    excelFallbackSheet?: string;
}

const API_BASE = "https://igmg-namaz.synology.me:3838/";

// Single Source of Truth: object -> type
export const cityConfigs = {
    hannover: {
        mosqueName: "HANNOVER ŞUBESİ AYASOFYA CÂMİ-İ",
        weatherCityName: "Hannover",
        prayerApiUrl: `${API_BASE}hannover`,
        excelFallbackSheet: "hannover",
    },
    braunschweig: {
        mosqueName: "BRAUNSCHWEIG CAMİ",
        weatherCityName: "Braunschweig",
        prayerApiUrl: `${API_BASE}braunschweig`,
        excelFallbackSheet: "braunschweig",
    },
    garbsen: {
        mosqueName: "GARBSEN ŞUBESİ EYÜP SULTAN CÂMİ-İ",
        weatherCityName: "Garbsen",
        prayerApiUrl: `${API_BASE}garbsen`,
        excelFallbackSheet: "garbsen",
    },
    laatzen: {
        mosqueName: "LAATZEN ŞUBESİ AKSA CÂMİ-İ",
        weatherCityName: "Laatzen",
        prayerApiUrl: `${API_BASE}laatzen`,
        excelFallbackSheet: "laatzen",
    },
    neustadt: {
        mosqueName: "NEUSTADT CAMİ",
        weatherCityName: "Neustadt am Rübenberge",
        prayerApiUrl: `${API_BASE}neustadt`,
        excelFallbackSheet: "neustadt",
    },
    peine: {
        mosqueName: "PEINE CAMİ",
        weatherCityName: "Peine",
        prayerApiUrl: `${API_BASE}peine`,
        excelFallbackSheet: "peine",
    },
    salzgitterBad: {
        mosqueName: "SALZGITTER-BAD CAMİ",
        weatherCityName: "Salzgitter",
        prayerApiUrl: `${API_BASE}salzgitterBad`,
        excelFallbackSheet: "salzgitterBad",
    },
    salzgitter: {
        mosqueName: "SALZGITTER CAMİ",
        weatherCityName: "Salzgitter",
        prayerApiUrl: `${API_BASE}salzgitter`,
        excelFallbackSheet: "salzgitter",
    },
    watenstedt: {
        mosqueName: "WATENSTEDT CAMİ",
        weatherCityName: "Salzgitter-Watenstedt",
        prayerApiUrl: `${API_BASE}watenstedt`,
        excelFallbackSheet: "watenstedt",
    },
    hildesheim: {
        mosqueName: "HILDESHEIM CAMİ",
        weatherCityName: "Hildesheim",
        prayerApiUrl: `${API_BASE}hildesheim`,
        excelFallbackSheet: "hildesheim",
    },
    goslar: {
        mosqueName: "GOSLAR CAMİ",
        weatherCityName: "Goslar",
        prayerApiUrl: `${API_BASE}goslar`,
        excelFallbackSheet: "goslar",
    },
    hameln: {
        mosqueName: "HAMELN CAMİ",
        weatherCityName: "Hameln",
        prayerApiUrl: `${API_BASE}hameln`,
        excelFallbackSheet: "hameln",
    },
    stadthagen: {
        mosqueName: "STADTHAGEN CAMİ",
        weatherCityName: "Stadthagen",
        prayerApiUrl: `${API_BASE}stadthagen`,
        excelFallbackSheet: "stadthagen",
    },
    osterode: {
        mosqueName: "OSTERODE CAMİ",
        weatherCityName: "Osterode am Harz",
        prayerApiUrl: `${API_BASE}osterode`,
        excelFallbackSheet: "osterode",
    },
    herzberg: {
        mosqueName: "HERZBERG CAMİ",
        weatherCityName: "Herzberg am Harz",
        prayerApiUrl: `${API_BASE}herzberg`,
        excelFallbackSheet: "herzberg",
    },
    magdeburg: {
        mosqueName: "MAGDEBURG CAMİ",
        weatherCityName: "Magdeburg",
        prayerApiUrl: `${API_BASE}magdeburg`,
        excelFallbackSheet: "magdeburg",
    },
    wolfsburg: {
        mosqueName: "WOLFSBURG CAMİ",
        weatherCityName: "Wolfsburg",
        prayerApiUrl: `${API_BASE}wolfsburg`,
        excelFallbackSheet: "wolfsburg",
    },
} as const satisfies Record<string, CityConfig>;

export type CityKey = keyof typeof cityConfigs;
export const cityList = Object.keys(cityConfigs) as CityKey[];

// URL-freundliche Slugs -> Keys (alles lowercase)
export const citySlugs: Record<string, CityKey> = {
    hannover: "hannover",
    braunschweig: "braunschweig",
    garbsen: "garbsen",
    laatzen: "laatzen",
    neustadt: "neustadt",
    peine: "peine",
    "salzgitter-bad": "salzgitterBad",
    salzgitter: "salzgitter",
    watenstedt: "watenstedt",
    hildesheim: "hildesheim",
    goslar: "goslar",
    hameln: "hameln",
    stadthagen: "stadthagen",
    osterode: "osterode",
    herzberg: "herzberg",
    magdeburg: "magdeburg",
    wolfsburg: "wolfsburg",
};

// Helper für Router: slug/Key → normalisierter CityKey
export function resolveCity(input: string | null | undefined): CityKey | undefined {
    if (!input) return undefined;
    const slug = input.trim().toLowerCase();
    // direkter Treffer (nur wenn du ALLE Keys lowercase hältst – außer camelCase!)
    if (Object.prototype.hasOwnProperty.call(cityConfigs, slug)) {
        return slug as CityKey;
    }
    return citySlugs[slug];
}

// Type Guard (nützlich in Tests)
export function isCityKey(x: string): x is CityKey {
    return Object.prototype.hasOwnProperty.call(cityConfigs, x);
}
