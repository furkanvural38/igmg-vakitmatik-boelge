// src/lib/cities.ts

/**
 * Die 17 kuratierten Slugs der API v1. Nur diese funktionieren unter
 * /api/v1/cities/{slug}; alles andere müsste über /api/v1/locations/search laufen.
 * `salzgitterBad` ist der einzige Slug, der nicht durchgehend klein geschrieben ist.
 */
export const curatedCitySlugs = [
    "hannover",
    "braunschweig",
    "garbsen",
    "laatzen",
    "neustadt",
    "peine",
    "salzgitterBad",
    "salzgitter",
    "watenstedt",
    "hildesheim",
    "goslar",
    "hameln",
    "stadthagen",
    "osterode",
    "herzberg",
    "magdeburg",
    "wolfsburg",
] as const;

export type CuratedCitySlug = (typeof curatedCitySlugs)[number];

export type LogoKey = "default" | "igmg" | "ahlem";

export interface CityConfig {
    mosqueName: string;
    weatherCityName: string;
    /** Slug für /api/v1/cities/{slug} */
    citySlug: CuratedCitySlug;
    logoKey?: LogoKey;
}

// Single Source of Truth: object -> type
export const cityConfigs = {
    hannover: {
        mosqueName: "HANNOVER ŞUBESİ AYASOFYA CÂMİ-İ",
        weatherCityName: "Hannover",
        citySlug: "hannover",
        logoKey: "igmg",
    },
    braunschweig: {
        mosqueName: "BRAUNSCHWEIG CAMİ",
        weatherCityName: "Braunschweig",
        citySlug: "braunschweig",
        logoKey: "igmg",
    },
    garbsen: {
        mosqueName: "GARBSEN ŞUBESİ EYÜP SULTAN CÂMİ-İ",
        weatherCityName: "Garbsen",
        citySlug: "garbsen",
        logoKey: "igmg",
    },
    laatzen: {
        mosqueName: "LAATZEN ŞUBESİ AKSA CÂMİ-İ",
        weatherCityName: "Laatzen",
        citySlug: "laatzen",
        logoKey: "igmg",
    },
    ahlem: {
        mosqueName: "AHLEMER KULTUR-UND BILDUNG E.V",
        weatherCityName: "Hannover",
        citySlug: "hannover",
        logoKey: "ahlem",
    },
    neustadt: {
        mosqueName: "NEUSTADT CAMİ",
        weatherCityName: "Neustadt am Rübenberge",
        citySlug: "neustadt",
        logoKey: "igmg",
    },
    peine: {
        mosqueName: "PEINE ŞUBESİ TAKVA CÂMİ-İ",
        weatherCityName: "Peine",
        citySlug: "peine",
        logoKey: "igmg",
    },
    salzgitterBad: {
        mosqueName: "SALZGITTER-BAD CAMİ",
        weatherCityName: "Salzgitter",
        citySlug: "salzgitterBad",
        logoKey: "igmg",
    },
    salzgitter: {
        mosqueName: "LEBENSTEDT ŞUBESİ SELİMİYE CÂMİ-İ",
        weatherCityName: "Salzgitter",
        citySlug: "salzgitter",
        logoKey: "igmg",
    },
    watenstedt: {
        mosqueName: "WATENSTEDT CAMİ",
        weatherCityName: "Salzgitter-Watenstedt",
        citySlug: "watenstedt",
        logoKey: "igmg",
    },
    hildesheim: {
        mosqueName: "HILDESHEIM CAMİ",
        weatherCityName: "Hildesheim",
        citySlug: "hildesheim",
        logoKey: "igmg",
    },
    goslar: {
        mosqueName: "GOSLAR CAMİ",
        weatherCityName: "Goslar",
        citySlug: "goslar",
        logoKey: "igmg",
    },
    hameln: {
        mosqueName: "HAMELN CAMİ",
        weatherCityName: "Hameln",
        citySlug: "hameln",
        logoKey: "igmg",
    },
    stadthagen: {
        mosqueName: "STADTHAGEN CAMİ",
        weatherCityName: "Stadthagen",
        citySlug: "stadthagen",
        logoKey: "igmg",
    },
    osterode: {
        mosqueName: "OSTERODE ŞUBESİ FATİH CÂMİ-İ",
        weatherCityName: "Osterode am Harz",
        citySlug: "osterode",
        logoKey: "igmg",
    },
    herzberg: {
        mosqueName: "HERZBERG CAMİ",
        weatherCityName: "Herzberg am Harz",
        citySlug: "herzberg",
        logoKey: "igmg",
    },
    magdeburg: {
        mosqueName: "MAGDEBURG CAMİ",
        weatherCityName: "Magdeburg",
        citySlug: "magdeburg",
        logoKey: "igmg",
    },
    wolfsburg: {
        mosqueName: "WOLFSBURG ŞUBESİ HASENE CÂMİ-İ",
        weatherCityName: "Wolfsburg",
        citySlug: "wolfsburg",
        logoKey: "igmg",
    },
} as const satisfies Record<string, CityConfig>;

export type CityKey = keyof typeof cityConfigs;

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
    salzgitterbad: "salzgitterBad",
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

const has = (obj: object, key: string) => Object.prototype.hasOwnProperty.call(obj, key);

export function resolveCity(input: string | null | undefined): CityKey | undefined {
    if (!input) return undefined;
    const raw = input.trim();
    if (!raw) return undefined;

    // Erst exakt prüfen – sonst würde der Key "salzgitterBad" am Kleinschreiben scheitern.
    if (has(cityConfigs, raw)) return raw as CityKey;

    const slug = raw.toLowerCase();
    if (has(cityConfigs, slug)) return slug as CityKey;

    // hasOwnProperty auch hier: ein Aufruf von /__proto__ oder /constructor
    // hätte sonst Object.prototype zurückgegeben – typisiert als CityKey.
    return has(citySlugs, slug) ? citySlugs[slug] : undefined;
}
