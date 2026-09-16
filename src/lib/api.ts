// src/lib/api.ts
//
// Client für die Vakitmatik API v1 (Stand 16.09.2026).
// Gebetszeiten liefern ein flaches Objekt (kein data-Array, kein success-Flag).
// Ob ein Aufruf geklappt hat, steht im HTTP-Status; Fehler kommen als
// application/problem+json.

/**
 * Basis-URL der API. Konfigurierbar über VITE_API_BASE — der Fallback hält
 * bestehende Installationen am Laufen, wenn keine .env gesetzt ist.
 */
export const API_BASE = (
    import.meta.env.VITE_API_BASE ?? "https://igmg-namaz.synology.me:3838"
).replace(/\/+$/, "");

export const API_V1 = `${API_BASE}/api/v1`;

export type PrayerKey = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";

export const PRAYER_ORDER: PrayerKey[] = [
    "fajr",
    "sunrise",
    "dhuhr",
    "asr",
    "maghrib",
    "isha",
];

export interface PrayerTimes {
    city: string;
    /** ISO-Datum, z. B. "2026-09-16" */
    date: string;
    /** z. B. "5 Rebiulahir 1448"; kann fehlen */
    hijriDate: string | null;
    /** IANA-Zone, z. B. "Europe/Berlin"; laut API in seltenen Fällen null */
    timezone: string | null;
    /** Alle sechs Zeiten als "HH:mm" in lokaler Zeit der Stadt */
    times: Record<PrayerKey, string>;
}

export interface WeatherData {
    name: string;
    main: { temp: number; humidity: number; temp_min?: number; temp_max?: number };
    weather: Array<{ description: string; icon: string }>;
}

// ---------------------------------------------------------------------------
// Fehler (application/problem+json)
// ---------------------------------------------------------------------------

export interface ApiProblem {
    type?: string;
    title?: string;
    status?: number;
    detail?: string;
    instance?: string;
    correlationId?: string;
}

export type ProblemKind =
    | "invalid-parameter"
    | "invalid-date"
    | "date-out-of-range"
    | "unknown-location"
    | "location-timezone-unknown"
    | "prayer-times-unavailable"
    | "content-unavailable"
    | "import-busy"
    | "internal-error"
    // clientseitig erzeugt:
    | "network"
    | "timeout"
    | "malformed-response"
    | "unknown";

const KNOWN_PROBLEM_KINDS: ProblemKind[] = [
    "invalid-parameter",
    "invalid-date",
    "date-out-of-range",
    "unknown-location",
    "location-timezone-unknown",
    "prayer-times-unavailable",
    "content-unavailable",
    "import-busy",
    "internal-error",
];

export class ApiError extends Error {
    readonly kind: ProblemKind;
    /** HTTP-Status; 0 bei Netzwerk-/Timeout-Fehlern */
    readonly status: number;
    /** 4xx nicht wiederholen, 5xx und Netzwerkfehler schon */
    readonly retryable: boolean;
    /** aus dem Retry-After-Header (503 import-busy) */
    readonly retryAfterMs: number | null;
    readonly problem: ApiProblem | null;

    constructor(
        message: string,
        kind: ProblemKind,
        status: number,
        opts: { retryAfterMs?: number | null; problem?: ApiProblem | null } = {}
    ) {
        super(message);
        this.name = "ApiError";
        this.kind = kind;
        this.status = status;
        this.retryable = status === 0 || status >= 500;
        this.retryAfterMs = opts.retryAfterMs ?? null;
        this.problem = opts.problem ?? null;
        // Prototype-Kette für das ES5-Transpilat (legacy build) wiederherstellen
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

function kindFromProblem(problem: ApiProblem | null, status: number): ProblemKind {
    const type = problem?.type;
    if (type) {
        const slug = type.substring(type.lastIndexOf("/") + 1) as ProblemKind;
        if (KNOWN_PROBLEM_KINDS.indexOf(slug) !== -1) return slug;
    }
    if (status === 404) return "unknown-location";
    if (status >= 500) return "internal-error";
    return "unknown";
}

function parseRetryAfter(res: Response): number | null {
    const raw = res.headers.get("Retry-After");
    if (!raw) return null;
    const seconds = Number(raw);
    if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
    const at = Date.parse(raw);
    if (!Number.isNaN(at)) return Math.max(0, at - Date.now());
    return null;
}

async function problemFromResponse(res: Response): Promise<ApiError> {
    let problem: ApiProblem | null = null;
    try {
        const body = await res.json();
        if (body && typeof body === "object") problem = body as ApiProblem;
    } catch {
        /* Body war kein JSON – der Status reicht */
    }
    const kind = kindFromProblem(problem, res.status);
    const message = problem?.detail ?? problem?.title ?? `HTTP ${res.status}`;
    return new ApiError(message, kind, res.status, {
        retryAfterMs: parseRetryAfter(res),
        problem,
    });
}

// ---------------------------------------------------------------------------
// Fetch-Helfer
// ---------------------------------------------------------------------------

/**
 * GET mit Timeout. Wirft ApiError, statt null zurückzugeben, damit der Aufrufer
 * zwischen "nicht wiederholen" (4xx) und "später nochmal" (5xx) unterscheiden kann.
 *
 * Bewusst ohne Cache-Buster und ohne `cache: "no-store"`: der Server schickt
 * passende Cache-Control-Header (Gebetszeiten laufen um Mitternacht in der
 * Zeitzone der Stadt ab, der Tagesinhalt um 23:30).
 */
export async function fetchJson<T = unknown>(
    url: string,
    timeoutMs = 8000,
    externalSignal?: AbortSignal
): Promise<T> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);

    // Abbruch von außen (City-Wechsel) auf denselben Controller spiegeln.
    const onExternalAbort = () => ctrl.abort();
    if (externalSignal) {
        if (externalSignal.aborted) ctrl.abort();
        else externalSignal.addEventListener("abort", onExternalAbort);
    }

    let res: Response;
    try {
        res = await fetch(url, {
            signal: ctrl.signal,
            headers: { Accept: "application/json, application/problem+json" },
        });
    } catch (err) {
        const cause = err as { name?: string; message?: string } | null;
        if (cause?.name === "AbortError") {
            throw new ApiError(`Zeitüberschreitung bei ${url}`, "timeout", 0);
        }
        throw new ApiError(cause?.message ?? "Netzwerkfehler", "network", 0);
    } finally {
        clearTimeout(timer);
        externalSignal?.removeEventListener("abort", onExternalAbort);
    }

    if (!res.ok) throw await problemFromResponse(res);

    try {
        return (await res.json()) as T;
    } catch {
        throw new ApiError("Antwort war kein gültiges JSON", "malformed-response", res.status);
    }
}

// ---------------------------------------------------------------------------
// Gebetszeiten
// ---------------------------------------------------------------------------

const TIME_PATTERN = /^\d{1,2}:\d{2}$/;

function parsePrayerTimes(json: unknown, fallbackCity: string): PrayerTimes {
    const raw = (json ?? {}) as Record<string, unknown>;
    const times = raw.times as Record<string, unknown> | undefined;
    if (!times || typeof times !== "object") {
        throw new ApiError("Antwort enthält kein times-Objekt", "malformed-response", 200);
    }

    const parsed = {} as Record<PrayerKey, string>;
    for (const key of PRAYER_ORDER) {
        const value = times[key];
        if (typeof value !== "string" || !TIME_PATTERN.test(value)) {
            throw new ApiError(`Zeit "${key}" fehlt oder ist ungültig`, "malformed-response", 200);
        }
        parsed[key] = value;
    }

    return {
        city: typeof raw.city === "string" ? raw.city : fallbackCity,
        date: typeof raw.date === "string" ? raw.date : todayIso(),
        hijriDate: typeof raw.hijriDate === "string" ? raw.hijriDate : null,
        timezone: typeof raw.timezone === "string" ? raw.timezone : null,
        times: parsed,
    };
}

/** Heutiges Datum als "YYYY-MM-DD" in der Zeitzone der Anzeige. */
export function todayIso(timeZone = "Europe/Berlin"): string {
    try {
        // en-CA formatiert als YYYY-MM-DD
        return new Intl.DateTimeFormat("en-CA", {
            timeZone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(new Date());
    } catch {
        // Ältere Browser ohne IANA-Zonen: lokale Gerätezeit (der Kiosk steht in DE)
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    }
}

function cityUrl(citySlug: string, date?: string): string {
    const base = `${API_V1}/cities/${encodeURIComponent(citySlug)}`;
    return date ? `${base}?date=${encodeURIComponent(date)}` : base;
}

/**
 * Gebetszeiten einer kuratierten Stadt. Ohne `date` liefert der Server den
 * heutigen Tag in der Zeitzone der Stadt. Wirft ApiError.
 */
export async function fetchPrayerTimes(citySlug: string, date?: string): Promise<PrayerTimes> {
    try {
        return parsePrayerTimes(await fetchJson(cityUrl(citySlug, date)), citySlug);
    } catch (err) {
        // 422: Zeitzone der Stadt unbekannt -> laut API date explizit mitgeben
        if (err instanceof ApiError && err.kind === "location-timezone-unknown" && !date) {
            const explicit = todayIso();
            return parsePrayerTimes(await fetchJson(cityUrl(citySlug, explicit)), citySlug);
        }
        throw err;
    }
}

// ---------------------------------------------------------------------------
// Letzte erfolgreiche Antwort (Fallback, wenn die API kurzzeitig nicht kann)
// ---------------------------------------------------------------------------

const PRAYER_CACHE_PREFIX = "prayer:v1:";

function cacheKey(citySlug: string) {
    return `${PRAYER_CACHE_PREFIX}${citySlug}`;
}

export function readPrayerCache(citySlug: string): PrayerTimes | null {
    try {
        const raw = localStorage.getItem(cacheKey(citySlug));
        if (!raw) return null;
        const payload = JSON.parse(raw) as PrayerTimes;
        // Nur der heutige Tag ist brauchbar – gestrige Zeiten wären schlicht falsch.
        if (!payload?.date || payload.date !== todayIso()) return null;
        return parsePrayerTimes(payload, citySlug);
    } catch {
        return null;
    }
}

export function writePrayerCache(citySlug: string, payload: PrayerTimes) {
    try {
        localStorage.setItem(cacheKey(citySlug), JSON.stringify(payload));
    } catch {
        /* Quota o. Ä. ignorieren */
    }
}

export type PrayerTimesSource = "api" | "cache";

export interface PrayerTimesResult {
    times: PrayerTimes;
    source: PrayerTimesSource;
    /** gesetzt, wenn die API nicht lieferte und der Cache eingesprungen ist */
    error: ApiError | null;
}

/**
 * Lädt die Gebetszeiten und fällt bei einem API-Fehler auf die zuletzt
 * erfolgreich geladenen Zeiten *des heutigen Tages* zurück. Gibt es die nicht,
 * wirft die Funktion – erfundene Zeiten wären schlimmer als eine sichtbare
 * Fehlermeldung.
 */
export async function loadPrayerTimes(
    citySlug: string,
    date?: string
): Promise<PrayerTimesResult> {
    try {
        const times = await fetchPrayerTimes(citySlug, date);
        writePrayerCache(citySlug, times);
        return { times, source: "api", error: null };
    } catch (err) {
        const apiError =
            err instanceof ApiError
                ? err
                : new ApiError(
                      (err as { message?: string } | null)?.message ?? "Unbekannter Fehler",
                      "unknown",
                      0
                  );

        const cached = readPrayerCache(citySlug);
        if (cached && (!date || cached.date === date)) {
            console.warn("Gebetszeiten aus Cache (API-Fehler):", apiError.kind, apiError.message);
            return { times: cached, source: "cache", error: apiError };
        }
        throw apiError;
    }
}

/** Menschenlesbare Meldung für die Fehleranzeige. */
export function describeApiError(err: ApiError): string {
    switch (err.kind) {
        case "unknown-location":
            return "Diese Stadt ist dem Server nicht bekannt.";
        case "invalid-parameter":
        case "invalid-date":
            return "Ungültige Anfrage an den Gebetszeiten-Server.";
        case "date-out-of-range":
            return "Für dieses Datum liegen keine Gebetszeiten vor.";
        case "location-timezone-unknown":
            return "Zeitzone der Stadt ist unbekannt.";
        case "prayer-times-unavailable":
            return "Gebetszeiten sind gerade nicht abrufbar. Neuer Versuch läuft…";
        case "content-unavailable":
            return "Tagesinhalt ist gerade nicht abrufbar.";
        case "import-busy":
            return "Server importiert gerade Daten. Neuer Versuch läuft…";
        case "internal-error":
            return err.problem?.correlationId
                ? `Serverfehler (${err.problem.correlationId}).`
                : "Serverfehler.";
        case "timeout":
            return "Zeitüberschreitung beim Server. Neuer Versuch läuft…";
        case "network":
            return "Keine Verbindung zum Server. Neuer Versuch läuft…";
        case "malformed-response":
            return "Unerwartete Antwort vom Server.";
        default:
            return err.message;
    }
}

// ---------------------------------------------------------------------------
// Wetter (unverändert, fremde API)
// ---------------------------------------------------------------------------

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY ?? "";

/**
 * Wetter ist Beiwerk: Fehler werden geschluckt und als `null` gemeldet, damit
 * eine tote Fremd-API nie die Gebetszeiten blockiert.
 *
 * `signal` reicht den AbortController des Aufrufers durch — vorher erzeugte der
 * WeatherProvider einen Controller, den niemand an fetch weitergab; der gesamte
 * Abbruchpfad war toter Code.
 */
export async function fetchWeather(
    cityName: string,
    signal?: AbortSignal
): Promise<WeatherData | null> {
    if (!OPENWEATHER_API_KEY) {
        console.warn("VITE_OPENWEATHER_API_KEY fehlt – Wetterkarte bleibt leer.");
        return null;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        cityName
    )}&units=metric&lang=de&appid=${OPENWEATHER_API_KEY}`;

    try {
        const json = await fetchJson<WeatherData>(url, 8000, signal);
        if (!json?.main?.temp) {
            console.error("Weather API returned invalid payload");
            return null;
        }
        return json;
    } catch (err) {
        console.error("Weather fetch failed:", (err as { message?: string } | null)?.message ?? err);
        return null;
    }
}
