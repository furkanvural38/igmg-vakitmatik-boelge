// src/lib/cities.ts

export type CityKey =
    | "hannover"
    | "braunschweig"
    | "garbsen"
    | "laatzen"
    | "neustadt"
    | "peine"
    | "salzgitterBad"
    | "salzgitter"
    | "watenstedt"
    | "hildesheim"
    | "goslar"
    | "hameln"
    | "stadthagen"
    | "osterode"
    | "herzberg"
    | "magdeburg"
    | "wolfsburg";

export interface CityConfig {
    mosqueName: string;          // für Header
    weatherCityName: string;     // für Wetter Kachel API (OpenWeatherMap)
    prayerApiUrl: string;        // Endpoint mit Gebetszeiten
    excelFallbackSheet?: string; // optional: Blattname in der Excel-Datei
}

// HINWEIS: Bitte mosqueName anpassen mit realem Namen je Standort
export const cityConfigs: Record<CityKey, CityConfig> = {
    hannover: {
        mosqueName: "HANNOVER ŞUBESİ AYASOFYA CÂMİ-İ",
        weatherCityName: "Hannover",
        prayerApiUrl: "https://igmg-namaz.synology.me:3838/hannover",
        excelFallbackSheet: "hannover",
    },
    braunschweig: {
        mosqueName: "BRAUNSCHWEIG CAMİ", // <- anpassen
        weatherCityName: "Braunschweig",
        prayerApiUrl: "https://igmg-namaz.synology.me:3838/braunschweig",
        excelFallbackSheet: "braunschweig",
    },
    garbsen: {
        mosqueName: "GARBSEN ŞUBESİ EYÜP SULTAN CÂMİ-İ", // <- anpassen
        weatherCityName: "Garbsen",
        prayerApiUrl: "https://igmg-namaz.synology.me:3838/garbsen",
        excelFallbackSheet: "garbsen",
    },
    laatzen: {
        mosqueName: "LAATZEN ŞUBESİ AKSA CÂMİ-İ", // <- anpassen
        weatherCityName: "Laatzen",
        prayerApiUrl: "https://igmg-namaz.synology.me:3838/laatzen",
        excelFallbackSheet: "laatzen",
    },
    neustadt: {
        mosqueName: "NEUSTADT CAMİ", // <- anpassen
        weatherCityName: "Neustadt am Rübenberge",
        prayerApiUrl: "https://igmg-namaz.synology.me:3838/neustadt",
        excelFallbackSheet: "neustadt",
    },
    peine: {
        mosqueName: "PEINE CAMİ",
        weatherCityName: "Peine",
        prayerApiUrl: "https://igmg-namaz.synology.me:3838/peine",
        excelFallbackSheet: "peine",
    },
    salzgitterBad: {
        mosqueName: "SALZGITTER-BAD CAMİ",
        weatherCityName: "Salzgitter",
        prayerApiUrl: "https://igmg-namaz.synology.me:3838/salzgitterBad",
        excelFallbackSheet: "salzgitterBad",
    },
    salzgitter: {
        mosqueName: "SALZGITTER CAMİ",
        weatherCityName: "Salzgitter",
        prayerApiUrl: "https://igmg-namaz.synology.me:3838/salzgitter",
        excelFallbackSheet: "salzgitter",
    },
    watenstedt: {
        mosqueName: "WATENSTEDT CAMİ",
        weatherCityName: "Salzgitter-Watenstedt",
        prayerApiUrl: "https://igmg-namaz.synology.me:3838/watenstedt",
        excelFallbackSheet: "watenstedt",
    },
    hildesheim: {
        mosqueName: "HILDESHEIM CAMİ",
        weatherCityName: "Hildesheim",
        prayerApiUrl: "https://igmg-namaz.synology.me:3838/hildesheim",
        excelFallbackSheet: "hildesheim",
    },
    goslar: {
        mosqueName: "GOSLAR CAMİ",
        weatherCityName: "Goslar",
        prayerApiUrl: "https://igmg-namaz.synology.me:3838/goslar",
        excelFallbackSheet: "goslar",
    },
    hameln: {
        mosqueName: "HAMELN CAMİ",
        weatherCityName: "Hameln",
        prayerApiUrl: "https://igmg-namaz.synology.me:3838/hameln",
        excelFallbackSheet: "hameln",
    },
    stadthagen: {
        mosqueName: "STADTHAGEN CAMİ",
        weatherCityName: "Stadthagen",
        prayerApiUrl: "https://igmg-namaz.synology.me:3838/stadthagen",
        excelFallbackSheet: "stadthagen",
    },
    osterode: {
        mosqueName: "OSTERODE CAMİ",
        weatherCityName: "Osterode am Harz",
        prayerApiUrl: "https://igmg-namaz.synology.me:3838/osterode",
        excelFallbackSheet: "osterode",
    },
    herzberg: {
        mosqueName: "HERZBERG CAMİ",
        weatherCityName: "Herzberg am Harz",
        prayerApiUrl: "https://igmg-namaz.synology.me:3838/herzberg",
        excelFallbackSheet: "herzberg",
    },
    magdeburg: {
        mosqueName: "MAGDEBURG CAMİ",
        weatherCityName: "Magdeburg",
        prayerApiUrl: "https://igmg-namaz.synology.me:3838/magdeburg",
        excelFallbackSheet: "magdeburg",
    },
    wolfsburg: {
        mosqueName: "WOLFSBURG CAMİ",
        weatherCityName: "Wolfsburg",
        prayerApiUrl: "https://igmg-namaz.synology.me:3838/wolfsburg",
        excelFallbackSheet: "wolfsburg",
    },
};
