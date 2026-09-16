// src/features/footerTicker/apiDailyContent.ts
import { API_V1, ApiError, fetchJson, resolveConfiguredUrl, todayIso } from "../../lib/api";

export interface DailyContentItem {
    title: string;
    text: string;
    source?: string;
    imageKey: "allah" | "muhammad" | "dua";
}
export interface DailyContentResult {
    items: DailyContentItem[];
}

/**
 * Dieser Endpunkt behält als einziger den Umschlag mit data/success —
 * die Gebetszeiten tun das nicht.
 */
type RawDailyContent = {
    success?: boolean;
    message?: string | null;
    data?: {
        dayOfYear?: number;
        verse?: string;
        verseSource?: string;
        hadith?: string;
        hadithSource?: string;
        pray?: string;
        praySource?: string;
    };
};

const DAILY_CONTENT_URL = resolveConfiguredUrl(
    import.meta.env.VITE_DAILY_CONTENT_URL,
    `${API_V1}/content/daily`
);

const CACHE_KEY = "daily:islamContent:v2";

function readCache(): DailyContentResult | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const { day, payload } = JSON.parse(raw);
        // Der Inhalt gilt pro Tag – ein TTL in Stunden würde über Mitternacht
        // hinweg den Text von gestern zeigen.
        if (day !== todayIso() || !payload?.items?.length) return null;
        return payload as DailyContentResult;
    } catch {
        return null;
    }
}

function writeCache(payload: DailyContentResult) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ day: todayIso(), payload }));
    } catch {
        /* Quota ignorieren */
    }
}

function isRawDailyContent(x: unknown): x is RawDailyContent {
    return !!x && typeof x === "object" && "data" in x;
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

export async function fetchDailyIslamContent(): Promise<DailyContentResult> {
    // 1) Cache des heutigen Tages liefern, wenn vorhanden
    const cached = readCache();
    if (cached) return cached;

    try {
        const json = await fetchJson<unknown>(DAILY_CONTENT_URL, 8000);

        if (!isRawDailyContent(json) || !json.data) {
            console.error("Daily content format unexpected:", json);
            return DEFAULT_RESULT;
        }

        const d = json.data;

        const items = [
            normalizeItem("Âyet-i Kerîme", d.verse, d.verseSource, "allah"),
            normalizeItem("Hadis-i Şerif", d.hadith, d.hadithSource, "muhammad"),
            normalizeItem("Dua", d.pray, d.praySource, "dua"),
        ].filter(Boolean) as DailyContentItem[];

        if (!items.length) return DEFAULT_RESULT;

        const result: DailyContentResult = { items };
        // Nur echte Inhalte cachen – sonst klebt der Platzhalter am Tag fest.
        writeCache(result);
        return result;
    } catch (err) {
        const reason = err instanceof ApiError ? `${err.kind} (${err.status})` : err;
        console.error("Daily content failed:", reason);
        return DEFAULT_RESULT;
    }
}
