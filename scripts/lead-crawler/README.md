# Pageblitz Lead Crawler

Automatisches Crawlen von Branche × Stadt-Kombinationen via Google Places API.
Speichert alle gefundenen Unternehmen in der DB und führt eine Website-Qualitätsanalyse durch.

## Schnellstart

```bash
# Normal-Lauf (echte API-Aufrufe)
DATABASE_URL=mysql://... GOOGLE_PLACES_API_KEY=... npx tsx scripts/lead-crawler/crawler.ts

# Dry-Run (keine API-Aufrufe, kein DB-Schreiben)
DRY_RUN=true npx tsx scripts/lead-crawler/crawler.ts
```

## Umgebungsvariablen

| Variable               | Beschreibung                                              |
|------------------------|-----------------------------------------------------------|
| `DATABASE_URL`         | MySQL-Verbindungsstring (z. B. `mysql://user:pw@host/db`) |
| `GOOGLE_PLACES_API_KEY`| Google Maps / Places API Key                              |
| `DRY_RUN`              | `true` = nur Logs, keine API-Aufrufe, kein DB-Schreiben  |

## Was der Crawler macht

1. Iteriert über **20 Branchen × 20 Städte = 400 Kombinationen**
2. Prüft, ob die Kombination bereits in den letzten 30 Tagen gecrawlt wurde (Skip)
3. Führt einen Google Places Text Search durch (`{Branche} in {Stadt}`)
4. Ruft für jeden Treffer (max. 20) die Place Details ab
5. Speichert alle Unternehmen via `INSERT ... ON DUPLICATE KEY UPDATE` (placeId als Unique-Key)
6. Analysiert vorhandene Websites auf Alter und Qualität (Wayback Machine + HTML-Analyse)
7. Klassifiziert jeden Lead als `no_website` | `outdated_website` | `poor_website` | `unknown`

## Rate Limiting

- 200 ms Pause zwischen einzelnen API-Requests
- 2 s Pause zwischen Kombinationen
- 500 ms Pause zwischen Website-Analysen

## GitHub Actions

Der Crawler läuft automatisch jeden Sonntag um 06:00 UTC via `.github/workflows/lead-crawler.yml`.
Manueller Start: GitHub → Actions → "Lead Crawler" → "Run workflow".

Secrets, die im GitHub-Repo gesetzt sein müssen:
- `DATABASE_URL`
- `GOOGLE_PLACES_API_KEY`

Optional: Variable `CRAWLER_DRY_RUN = true` für einen Test-Lauf ohne echte Daten.
