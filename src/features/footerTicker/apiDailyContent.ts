// src/features/footerTicker/apiDailyContent.ts
export interface DailyContentItem {
    title: string;
    text: string;
    source?: string;
    imageKey: "allah" | "muhammad" | "dua";
}
export interface DailyContentResult {
    items: DailyContentItem[];
}

type RawDailyContent = {
    success?: boolean;
    data?: {
        verse?: string;
        verseSource?: string;
        hadith?: string;
        hadithSource?: string;
        pray?: string;
        praySource?: string;
    };
};

const DAILY_CONTENT_URL =
    import.meta.env.VITE_DAILY_CONTENT_URL ??
    "https://igmg-namaz.synology.me:3838/getIslamContent";

const CACHE_KEY = "daily:islamContent:v1";
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6h

function now() { return Date.now(); }

function readCache(): DailyContentResult | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const { ts, payload } = JSON.parse(raw);
        if (typeof ts !== "number" || !payload) return null;
        if (now() - ts > CACHE_TTL_MS) return null;
        return payload as DailyContentResult;
    } catch { return null; }
}

function writeCache(payload: DailyContentResult) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: now(), payload }));
    } catch { /* ignore quota */ }
}

function isRawDailyContent(x: any): x is RawDailyContent {
    return !!x && typeof x === "object" && "success" in x && "data" in x;
}

function normalizeItem(
    title: string,
    text?: string,
    source?: string,
    imageKey?: DailyContentItem["imageKey"]
): DailyContentItem | null {
    const t = (text ?? "").trim();
    if (!t) return null;
    return {
        title,
        text: t,
        source: (source ?? "").trim() || undefined,
        imageKey: imageKey ?? "allah",
    };
}

async function fetchWithTimeout(url: string, ms = 8000): Promise<Response> {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), ms);
    try {
        return await fetch(url, {
            signal: ctrl.signal,
            headers: { Accept: "application/json" },
            cache: "no-store",
        });
    } finally {
        clearTimeout(to);
    }
}

const DEFAULT_RESULT: DailyContentResult = {
    items: [
        {
            title: "Âyet-i Kerîme",
            text: "İnşâAllah.",
            imageKey: "allah",
        },
        {
            title: "Hadis-i Şerif",
            text: "Kolaylaştırınız, zorlaştırmayınız.",
            imageKey: "muhammad",
        },
        {
            title: "Dua",
            text: "Rabbimiz! Bize doğruluk ihsan eyle.",
            imageKey: "dua",
        },
    ],
};

export async function fetchDailyIslamContent(): Promise<DailyContentResult | null> {
    // 1) gültigen Cache liefern, wenn vorhanden
    const cached = readCache();
    if (cached) return cached;

    try {
        const res = await fetchWithTimeout(DAILY_CONTENT_URL, 8000);
        if (!res.ok) {
            console.error("Daily content API not ok", res.status);
            // Fallback: kein Netz → Default
            writeCache(DEFAULT_RESULT);
            return DEFAULT_RESULT;
        }

        // Content-Type kann serverseitig falsch sein -> trotzdem json() versuchen
        const json: unknown = await res.json();
        if (!isRawDailyContent(json) || !json.success || !json.data) {
            console.error("Daily content format unexpected:", json);
            writeCache(DEFAULT_RESULT);
            return DEFAULT_RESULT;
        }

        const d = json.data;

        const items = [
            normalizeItem("Âyet-i Kerîme", d.verse, d.verseSource, "allah"),
            normalizeItem("Hadis-i Şerif", d.hadith, d.hadithSource, "muhammad"),
            normalizeItem("Dua", d.pray, d.praySource, "dua"),
        ].filter(Boolean) as DailyContentItem[];

        // Wenn alles leer → Default
        const result: DailyContentResult = { items: items.length ? items : DEFAULT_RESULT.items };

        writeCache(result);
        return result;
    } catch (err: any) {
        if (err?.name === "AbortError") {
            console.error("Daily content timeout");
        } else {
            console.error("Error fetching daily content:", err);
        }
        writeCache(DEFAULT_RESULT);
        return DEFAULT_RESULT;
    }
}
