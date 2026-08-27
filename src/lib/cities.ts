// src/lib/cities.ts
const API_BASE = "https://igmg-namaz.synology.me:3838/";

export const logoKeys = {
    default: "default",
    igmg: "igmg",
    ahlem: "ahlem",
} as const;

export type LogoKey = keyof typeof logoKeys;

export interface CityConfig {
    mosqueName: string;
    weatherCityName: string;
    prayerApiUrl: string;
    excelFallbackSheet?: string;
    logoKey?: LogoKey;
}

// Single Source of Truth: object -> type
export const cityConfigs = {
    hannover: {
        mosqueName: "HANNOVER ŞUBESİ AYASOFYA CÂMİ-İ",
        weatherCityName: "Hannover",
        prayerApiUrl: `${API_BASE}hannover`,
        excelFallbackSheet: "hannover",
        logoKey: "igmg",
    },
    braunschweig: {
        mosqueName: "BRAUNSCHWEIG CAMİ",
        weatherCityName: "Braunschweig",
        prayerApiUrl: `${API_BASE}braunschweig`,
        excelFallbackSheet: "braunschweig",
        logoKey: "igmg",
    },
    garbsen: {
        mosqueName: "GARBSEN ŞUBESİ EYÜP SULTAN CÂMİ-İ",
        weatherCityName: "Garbsen",
        prayerApiUrl: `${API_BASE}garbsen`,
        excelFallbackSheet: "garbsen",
        logoKey: "igmg",
    },
    laatzen: {
        mosqueName: "LAATZEN ŞUBESİ AKSA CÂMİ-İ",
        weatherCityName: "Laatzen",
        prayerApiUrl: `${API_BASE}laatzen`,
        excelFallbackSheet: "laatzen",
        logoKey: "igmg",
    },
    ahlem: {
        mosqueName: "AHLEMER KULTUR-UND BILDUNG E.V",
        weatherCityName: "Hannover",
        prayerApiUrl: `${API_BASE}hannover`,
        excelFallbackSheet: "hannover",
        logoKey: "ahlem",
    },
    neustadt: {
        mosqueName: "NEUSTADT CAMİ",
        weatherCityName: "Neustadt am Rübenberge",
        prayerApiUrl: `${API_BASE}neustadt`,
        excelFallbackSheet: "neustadt",
        logoKey: "igmg",
    },
    peine: {
        mosqueName: "PEINE ŞUBESİ TAKVA CÂMİ-İ",
        weatherCityName: "Peine",
        prayerApiUrl: `${API_BASE}peine`,
        excelFallbackSheet: "peine",
        logoKey: "igmg",
    },
    salzgitterBad: {
        mosqueName: "SALZGITTER-BAD CAMİ",
        weatherCityName: "Salzgitter",
        prayerApiUrl: `${API_BASE}salzgitterBad`,
        excelFallbackSheet: "salzgitterBad",
        logoKey: "igmg",
    },
    salzgitter: {
        mosqueName: "LEBENSTEDT ŞUBESİ SELİMİYE CÂMİ-İ",
        weatherCityName: "Salzgitter",
        prayerApiUrl: `${API_BASE}salzgitter`,
        excelFallbackSheet: "salzgitter",
        logoKey: "igmg",
    },
    watenstedt: {
        mosqueName: "WATENSTEDT CAMİ",
        weatherCityName: "Salzgitter-Watenstedt",
        prayerApiUrl: `${API_BASE}watenstedt`,
        excelFallbackSheet: "watenstedt",
        logoKey: "igmg",
    },
    hildesheim: {
        mosqueName: "HILDESHEIM CAMİ",
        weatherCityName: "Hildesheim",
        prayerApiUrl: `${API_BASE}hildesheim`,
        excelFallbackSheet: "hildesheim",
        logoKey: "igmg",
    },
    goslar: {
        mosqueName: "GOSLAR CAMİ",
        weatherCityName: "Goslar",
        prayerApiUrl: `${API_BASE}goslar`,
        excelFallbackSheet: "goslar",
        logoKey: "igmg",
    },
    hameln: {
        mosqueName: "HAMELN CAMİ",
        weatherCityName: "Hameln",
        prayerApiUrl: `${API_BASE}hameln`,
        excelFallbackSheet: "hameln",
        logoKey: "igmg",
    },
    stadthagen: {
        mosqueName: "STADTHAGEN CAMİ",
        weatherCityName: "Stadthagen",
        prayerApiUrl: `${API_BASE}stadthagen`,
        excelFallbackSheet: "stadthagen",
        logoKey: "igmg",
    },
    osterode: {
        mosqueName: "OSTERODE ŞUBESİ FATİH CÂMİ-İ",
        weatherCityName: "Osterode am Harz",
        prayerApiUrl: `${API_BASE}osterode`,
        excelFallbackSheet: "osterode",
        logoKey: "igmg",
    },
    herzberg: {
        mosqueName: "HERZBERG CAMİ",
        weatherCityName: "Herzberg am Harz",
        prayerApiUrl: `${API_BASE}herzberg`,
        excelFallbackSheet: "herzberg",
        logoKey: "igmg",
    },
    magdeburg: {
        mosqueName: "MAGDEBURG CAMİ",
        weatherCityName: "Magdeburg",
        prayerApiUrl: `${API_BASE}magdeburg`,
        excelFallbackSheet: "magdeburg",
        logoKey: "igmg",
    },
    wolfsburg: {
        mosqueName: "WOLFSBURG ŞUBESİ HASENE CÂMİ-İ",
        weatherCityName: "Wolfsburg",
        prayerApiUrl: `${API_BASE}wolfsburg`,
        excelFallbackSheet: "wolfsburg",
        logoKey: "igmg",
    },
} as const satisfies Record<string, CityConfig>;

export type CityKey = keyof typeof cityConfigs;
export const cityList = Object.keys(cityConfigs) as CityKey[];

// URL-freundliche Slugs -> Keys
export const citySlugs: Record<string, CityKey> = {
    hannover: "hannover",
    braunschweig: "braunschweig",
    garbsen: "garbsen",
    laatzen: "laatzen",
    ahlem: "ahlem",
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

export function resolveCity(input: string | null | undefined): CityKey | undefined {
    if (!input) return undefined;
    const slug = input.trim().toLowerCase();

    if (Object.prototype.hasOwnProperty.call(cityConfigs, slug)) {
        return slug as CityKey;
    }

    return citySlugs[slug];
}

export function isCityKey(x: string): x is CityKey {
    return Object.prototype.hasOwnProperty.call(cityConfigs, x);
}