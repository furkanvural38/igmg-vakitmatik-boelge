# Vakitmatik – IGMG Region Hannover

Gebetszeiten-Anzeige für Moschee-Displays. Eine React-/Vite-Anwendung, die auf
einer festen Bühne von 3840 × 2160 rendert und proportional auf den jeweiligen
Bildschirm skaliert wird. Läuft im Dauerbetrieb auf Raspberry Pi unter
QtWebEngine / Anthias.

## Eine Stadt pro URL

Die anzuzeigende Moschee steht im Hash der URL:

```
https://<host>/#/hannover
https://<host>/#/salzgitter-bad
```

Ohne Stadt leitet die Anwendung auf `/#/hannover` um. Alle Städte und ihre
Moscheenamen stehen in [`src/lib/cities.ts`](src/lib/cities.ts).

| Slug | Moschee |
|---|---|
| `hannover` | Ayasofya Câmi-i |
| `ahlem` | Ahlemer Kultur- und Bildung e.V. (eigenes Logo, Wetter aus Hannover) |
| `braunschweig`, `garbsen`, `laatzen`, `neustadt`, `peine` | … |
| `salzgitter` (Lebenstedt), `salzgitter-bad`, `watenstedt` | … |
| `hildesheim`, `goslar`, `hameln`, `stadthagen` | … |
| `osterode`, `herzberg`, `magdeburg`, `wolfsburg` | … |

`HashRouter` ist Absicht: die Anzeige läuft ohne History-fähigen Server.

### Neue Stadt aufnehmen

1. Slug in `curatedCitySlugs` ergänzen – er muss unter `/api/v1/cities/{slug}`
   existieren.
2. Eintrag in `cityConfigs` anlegen (Moscheename, Wetterstadt, Logo).
3. Falls die URL anders heißen soll als der Key: Alias in `citySlugs` eintragen.
4. `npm test` – die Konfigurationstests prüfen Slug, Alias und Erreichbarkeit.

## Entwicklung

```bash
npm ci
cp .env.example .env.local   # Werte eintragen
npm run dev                  # http://localhost:5173/#/hannover
```

| Befehl | Zweck |
|---|---|
| `npm run dev` | Dev-Server mit HMR |
| `npm test` | Unit-Tests (Vitest) |
| `npm run lint` | ESLint |
| `npm run build` | Typecheck + Produktionsbuild |
| `npm run build:web` | Build für GitHub Pages (Base-Pfad `/igmg-vakitmatik-boelge/`) |
| `npm run preview` | Build lokal ausliefern |

## Konfiguration

Alle Werte kommen aus Umgebungsvariablen, siehe [`.env.example`](.env.example).

| Variable | Pflicht | Bedeutung |
|---|---|---|
| `VITE_API_BASE` | nein | Basis der Gebetszeiten-API. Fallback: Produktionsserver |
| `VITE_OPENWEATHER_API_KEY` | für Wetter | Ohne Key bleibt die Wetterkarte leer, alles andere läuft |
| `VITE_DAILY_CONTENT_URL` | nein | Abweichender Endpunkt für den Tagesinhalt |

> **Der OpenWeather-Key ist im Browser-Bundle immer lesbar.** Er stand bis
> September 2026 fest im Quelltext und liegt damit in der Git-Historie: er muss
> rotiert und im OpenWeather-Dashboard auf die Anzeige-Domain eingeschränkt
> werden. In CI kommt er aus dem Secret `VITE_OPENWEATHER_API_KEY`.

## Deployment

Push auf `main` baut und veröffentlicht über
[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) nach
GitHub Pages. Der Workflow bricht ab, wenn Lint, Typecheck oder Tests fehlschlagen.

In den Repository-Einstellungen hinterlegen:

- Secret `VITE_OPENWEATHER_API_KEY`
- Variable `VITE_API_BASE` (optional)

## Architektur

```
src/
  app/          Bühne, Routing, Provider, ErrorBoundary
  features/
    prayer/     Kacheln, Uhr, Datum, Phasenlogik
    weather/    Wetterkarte + Provider
    header/     Kopfzeile mit Logo und Moscheename
    footerTicker/  Âyet / Hadis / Dua mit vertikalem Marquee
  hooks/        Uhr-Store, Mitternachts-Refresh, Bühnenskalierung
  lib/          API-Client, Fehlertypen, Stadt-Konfiguration
  styles/       Tailwind-Basis + Glas-Optik
```

### Eine Zeitquelle

`src/hooks/useClock.ts` hält **einen** auf die Sekundengrenze ausgerichteten
Timer für die gesamte Anwendung. Komponenten abonnieren über
`useSyncExternalStore` genau die Auflösung, die sie brauchen:

| Hook | Taktet | Verbraucher |
|---|---|---|
| `useSecondTick()` | 1×/s | nur `ClockDisplay` |
| `useTitleVariant()` | 1×/3 s | nur `PrayerTitle` (arabisch ↔ lateinisch) |
| `useMinuteOfDay()` | 1×/min | `PrayerPanel` → Gebetsphase |
| `useDayStamp()` | 1×/Tag | `DateCards` |

Weil die Selektoren Primitive zurückgeben, rendert React nur, wenn sich der
abonnierte Wert tatsächlich ändert. Die Gebetsphase wird einmal pro Minute in
`PrayerPanel` berechnet und als Primitive an die Kacheln gereicht – dadurch
greift `memo()` und die fünf inaktiven Kacheln rendern gar nicht.

### Gebetslogik

`src/features/prayer/prayerPhase.ts` ist reine Funktion ohne React: Sie teilt
den Tag in sechs zyklische Fenster und trägt auch dann, wenn Yatsı im
Hochsommer erst nach Mitternacht beginnt. Getestet in `prayerPhase.test.ts`,
inklusive einer Prüfung über alle 1440 Minuten des Tages.

Die aktive Kachel warnt in den letzten **15 Minuten** des laufenden Fensters
(`WARN_BEFORE_NEXT_MINUTES`). Früher war die Schwelle prozentual, wodurch dieselbe
Farbe je nach Fensterlänge 9 bis 30 Minuten bedeutete.

### Fußzeilen-Ticker

Âyet, Hadis und Dua wechseln sich ab; passt ein Text nicht in die Karte, wird er
vertikal durchgescrollt. Der Takt hängt an der Lesezeit, nicht an einem festen
Intervall: jeder Inhalt läuft **genau einen** Durchlauf (10 % Pause oben,
Fahrt, 10 % Pause unten) und schaltet erst am `animationend` weiter. Ein
Sicherheitstimer greift, falls das Ereignis ausbleibt.

Drei Fehler, die das vorher unmöglich machten:

| Symptom | Ursache |
|---|---|
| Text abgeschnitten | `.marquee-content` wurde als Flex-Item auf Viewport-Höhe gestaucht → gemessener Überlauf 0 px → es wurde nie gescrollt |
| Text abgeschnitten | Gemessen wurde mit `getBoundingClientRect()`, also **nach** der Bühnen-Skalierung – die Strecke fiel um den Skalierungsfaktor zu klein aus |
| Scrollt mitten im Satz los | Der Viewport war `justify-content: center`; bei Überlauf schneidet das oben **und** unten ab, der Anfang lag schon außerhalb |
| Sprung zurück an den Anfang | Fester 20-s-Timer und `animation-iteration-count: infinite` liefen unabhängig voneinander |

Gemessen wird deshalb mit `scrollHeight`/`clientHeight` (Layout-Pixel,
unabhängig von der Skalierung), der Inhalt hat `flex-shrink: 0`, und zentriert
wird nur, wenn er ohnehin passt (`[data-overflow="false"]`). Wiederholte
Messungen mit gleichem Ergebnis starten die Animation nicht neu.

### Ausfallverhalten

Für ein unbeaufsichtigtes Display gilt: lieber ein sichtbarer Hinweis als eine
falsche Zahl.

- Antwortet die API nicht, greift der `localStorage`-Cache – **nur für den
  heutigen Tag**. Gestrige Zeiten wären schlimmer als ein Fehler.
- In dem Fall erscheint der Hinweis „Offline – Zeiten aus dem Zwischenspeicher"
  und im Hintergrund läuft ein Backoff (1 → 2 → 5 → 15 Minuten).
- 4xx-Fehler werden laut API nicht wiederholt, 5xx und Netzfehler schon.
- Ein Renderfehler landet im `ErrorBoundary`: Meldung auf dem Schirm, danach
  automatischer Neustart nach 15 s. Nach drei Abstürzen in fünf Minuten bleibt
  die Meldung stehen, statt in einer Reload-Schleife zu enden.
- Um Mitternacht lädt die Anzeige neu, ohne dabei auf „Lädt…" zu springen.

## Schriften

Die Anwendung benutzt bewusst einen System-Schriftstapel (siehe
`tailwind.config.js`). Zuvor war `ClashDisplay` als Hausschrift deklariert, die
Datei im Repository war aber 0 Byte groß – Vite bettete sie als leeren
`data:`-URI ein, der Browser verwarf sie und fiel still auf `system-ui` zurück.
Dasselbe galt für `Bebas Neue`, das nie geladen wurde. Auf den Displays lief
damit nie die vorgesehene Typografie.

### Warum Zahlen einen eigenen Stack haben

`fontFamily.tabular` (Arial → Liberation Sans → DejaVu Sans) liegt über die
Klasse `.tabular` auf Uhr, Gebetszeiten, Countdown und Datum.

`font-variant-numeric: tabular-nums` allein reicht nicht: bei `ui-sans-serif`
bzw. `system-ui` wendet der Browser das `tnum`-Feature nicht an. Nachgemessen
am laufenden Build unterschieden sich die Ziffernpaare `11` und `44` um 23 px –
auf der 3840-px-Bühne rund 128 px. Die Uhr wanderte dadurch bei jedem
Sekundenwechsel sichtbar hin und her. Arial, Liberation Sans und DejaVu Sans
haben schon im Schriftschnitt gleich breite Ziffern (Spanne 0). Genau diese
Schriften lagen vorher hinter dem generischen `sans-serif` der Uhr.

**Wer den Stack ändert, muss das nachmessen** – nicht jede Schrift hat
Tabellenziffern.

Echte Hausschrift wieder einsetzen:

1. Schriftdatei nach `src/assets/font/` legen.
2. In `src/styles/index.css` ergänzen:
   ```css
   @font-face {
       font-family: "ClashDisplay";
       src: url("../assets/font/ClashDisplay-Variable.ttf") format("truetype");
       font-weight: 100 900;
       font-display: swap;
   }
   ```
3. In `tailwind.config.js` `"ClashDisplay"` an den Anfang von `fontFamily.sans`
   setzen.
4. `npm run build` und im `dist/assets/*.css` prüfen, dass die `src`-URL auf eine
   echte Datei zeigt und nicht auf `data:font/ttf;base64,` ohne Inhalt.

## Bekannte Punkte

- Alle Städte liegen in `Europe/Berlin`, und das Gerät steht in Deutschland.
  Die Anzeige rechnet deshalb mit der lokalen Gerätezeit. Für eine Stadt in
  einer anderen Zeitzone müsste `PrayerTimes.timezone` ausgewertet werden.
- `ahlem-logo.png` ist ~1,3 MB groß und wird an alle Städte ausgeliefert.
  Kompression oder ein Laden je Stadt steht noch aus.
