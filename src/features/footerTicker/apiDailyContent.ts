// src/features/footerTicker/apiDailyContent.ts

export interface DailyContentItem {
    title: string;     // z.B. "Âyet-i Kerîme", "Hadis-i Şerif", "Dua"
    text: string;      // eigentlicher Inhalt
    source?: string;   // Quelle (z.B. Nisa 4/82)
    imageKey: "allah" | "muhammad" | "dua"; // damit wir wissen, welches Bild wir zeigen
}

export interface DailyContentResult {
    items: DailyContentItem[];
}

// Dein echter Endpoint:
const DAILY_CONTENT_URL = "https://igmg-namaz.synology.me:3838/getIslamContent";

export async function fetchDailyIslamContent(): Promise<DailyContentResult | null> {
    try {
        const res = await fetch(DAILY_CONTENT_URL);
        if (!res.ok) {
            console.error("Daily content API not ok", res.status);
            return null;
        }

        const json = await res.json();

        // wir erwarten jetzt GENAU das Format, das du mir geschickt hast:
        // { success: true, data: { verse, verseSource, hadith, hadithSource, pray, praySource } }

        if (!json.success || !json.data) {
            console.error("Daily content format unexpected:", json);
            return null;
        }

        const data = json.data;

        // Wir bauen ein Array von Items in der Reihenfolge,
        // in der du sie rotieren willst (Allah -> Hadith -> Dua)
        const items: DailyContentItem[] = [
            {
                title: "Âyet-i Kerîme",
                text: data.verse?.trim() ?? "",
                source: data.verseSource?.trim() ?? "",
                imageKey: "allah",
            },
            {
                title: "Hadis-i Şerif",
                text: data.hadith?.trim() ?? "",
                source: data.hadithSource?.trim() ?? "",
                imageKey: "muhammad",
            },
            {
                title: "Dua",
                text: data.pray?.trim() ?? "",
                source: data.praySource?.trim() ?? "",
                imageKey: "dua",
            },
        ];

        return { items };
    } catch (err) {
        console.error("Error fetching daily content:", err);
        return null;
    }
}
