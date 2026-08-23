# Plan B7: GMB-Wahrheit, vollständige Erstgenerierung, Warte-UX, Pack-Feintuning — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Erstgenerierung faktentreu (Branche/Stadt/Leistungen aus GMB + echter Betriebs-Website, nie geraten) und vollständig (6–8 Sektionen mit echten Reviews, GMB-Fotos via R2, Öffnungszeiten), Warte-UX „Zeitmaschine" (Website baut sich sichtbar auf, Balken läuft immer), Kategorie-Rückfrage als letzter Fallback, Pack-Feintuning-Runde. Kein API-Key mehr in öffentlichen Bild-URLs.

**Architecture:** GMB-Zugriffe werden aus `server/routers.ts` in ein Modul `server/gmb/` gebündelt (`details.ts` Tiefenabruf + Persistenz, `category.ts` Kategorie-Kette, `address.ts` Parser; bestehendes `server/gmbPhotos.ts` bleibt kompatibel). Der Generierungs-Job (`server/generationV2/runJob.ts`) bekommt zwei neue Faktenquellen (`server/gmb/details.ts`-Refresh, `server/gmb/siteCrawl.ts`) und schreibt **Zwischenstände** ins Dokument (Phase „Bilder" → Doc mit Bildern/Platzhaltern, Phase „Texte" → final), die die Studio-Vorschau progressiv rendert. GMB-Fotos werden beim Job in R2 gespiegelt (`server/r2Upload.ts`), die Google-URL (mit Key) verlässt den Server nie. Post-LLM-Guard (`server/generationV2/factGuard.ts`) validiert Stadt/Branche gegen Fakten.

**Tech Stack:** wie B6 (React 19, TS strict, Vite 7, Express 4, tRPC 11, zod v4, Drizzle/MySQL 8, Vitest, Playwright dev 3005 / prod 3012). Google: Legacy Places (`makeRequest`) + Places API v1 (`https://places.googleapis.com/v1/places/{placeId}` mit `X-Goog-FieldMask`, gleicher Key — vorher mit `curl` verifizieren, ob der Key v1 darf; sonst nur Legacy + Mapping).

**Spec:** `docs/superpowers/specs/2026-08-23-b7-gmb-generierung-design.md` (verbindlich, §5 alle wie empfohlen). Diagnose-Referenzfall: Prod-Website 491 „SCHAU & HORCH" (Place `ChIJ255gMPZ9uEcRX0-LHl2mTl8`, Bocholt, Werbe-/Medienagentur, 13×5,0).

## Global Constraints

- Branch `onboarding-v2` (= main 4ddd7bc + B7-Docs). Commit je Task NUR mit Pathspec, nie `git add -A`/`-a`, kein `git stash`; fremde Prettier-Reformatierungen nicht mitcommitten.
- Gates je Task: `npx tsc --noEmit -p tsconfig.json` → 0; `npx vitest run` grün bis auf bekannte Env-Fails (2× `server/resend.test.ts`, Suiten `server/auth.logout.test.ts`/`server/pageblitz.test.ts`); Playwright-Baselines unverändert außer wo der Task es sagt (packs 112, studio 10, landing 4, a11y 31, islands 4, startpage 1; prod 9); `--project=prod` bei Berührung von `vite.config.ts`/`App.tsx`/`main.tsx`/`index.html` und in Task 7 für alle.
- **Keine echten Google-/LLM-Calls in Tests** (Clients dep-injizieren/mocken; `PB_LLM_MOCK=1` wie gehabt). Neue Dateien < 400 Zeilen. Texte deutsch. `assertV2SafeWrite` vor jedem Dokument-Write; Patches bleiben die einzigen Studio-Schreibpfade.
- Ports: 3000 fremd — nie anfassen; dev 3005, prod 3012, Lighthouse 3011; vor Playwright `lsof -ti :3005` prüfen, wenn belegt `until`-Schleife, niemals fremde Prozesse killen; eigene Server (Prozessgruppe) sauber beenden.
- Prod-Deploy/-Migration nur durch den Koordinator nach Merge mit Freigabe.

---

### Task 1: GMB-Tiefenabruf, Kategorie-Kette, Adress-Parser (+ Migration 0030)

**Files:**
- Create: `server/gmb/details.ts` (`fetchGmbDetails(placeId)`: Legacy-Details mit Feldern `name,formatted_address,address_components,formatted_phone_number,website,rating,user_ratings_total,types,opening_hours,editorial_summary,reviews,photos`; optional v1-Zusatzabruf `primaryTypeDisplayName` — Laufzeit-Feature-Detection: erster v1-Call schlägt fehl → merken, nur Legacy; Rückgabe normalisiert; `persistGmbDetails(businessId, details)` schreibt `website`, `openingHours` (JSON wie `mapGmbOpeningHoursToV2` es erwartet), `googleReviews` (JSON, max 8), `editorialSummary`, `category`), `server/gmb/category.ts` (`resolveGmbCategory({primaryTypeDisplayName, types, editorialSummary}): string | null` — Kette: primaryTypeDisplayName → DE-Mapping spezifischer `types` (Tabelle ~60 gängige Typen; `GENERIC_GMB_TYPES` aus `routers.ts` hierher umziehen) → `null`; **nie** Name/Query), `server/gmb/address.ts` (`parseGmbAddress(address_components?, formatted_address?): {street?, zip?, city?}` — components bevorzugt, sonst Regex `(.+?),?\s*(\d{5})\s+([^,]+)`), `drizzle/0030_business_editorial_summary.sql` (`ALTER TABLE businesses ADD COLUMN editorialSummary text;` additiv) + `drizzle/schema.ts`
- Modify: `server/routers.ts` (alle 4 `extractGmbCategory(...) || input.query`-Stellen → `resolveGmbCategory(...) ?? null`; Details-Abrufe auf `fetchGmbDetails` umstellen, Persistenz beim Auswählen/Anlegen eines Business; `category`-Spalte darf `null`/leer bleiben — Konsumenten prüfen), `server/db.ts` (Helper für neue Spalte)
- Test: `server/gmb/details.test.ts` (gemockter HTTP-Client: Felder, Persistenz, v1-Fallback), `category.test.ts` (Kette; SCHAU-&-HORCH-Fall: nur generische Types + kein v1 → `null`, niemals Name), `address.test.ts` („Zum Waldschlösschen 19, 46395 Bocholt, Deutschland" → street/zip/city)
- [ ] **Steps:** Vorab einmalig mit `curl` (echter Key aus `.env`, nur lokal, Ergebnis ins Task-Report) prüfen, ob v1 `places/{id}?fields=primaryTypeDisplayName` mit dem Key antwortet → Ergebnis dokumentieren. Tests → FAIL → implementieren → vitest grün, tsc 0 → Commit `git commit -m "feat: GMB-Tiefenabruf (Details, Kategorie-Kette, Adress-Parser, Migration 0030) — Kategorie nie mehr aus dem Firmennamen" -- <pfade>`

### Task 2: Website-Crawl als Faktenquelle

**Files:**
- Create: `server/gmb/siteCrawl.ts` (`crawlExistingSite(url): Promise<{title?, description?, text?} | null>` — robots.txt (einfacher Parser: `User-agent: *` + `Disallow`-Präfixe) respektieren, nur die eine URL, Timeout 10 s, max 200 kB, Redirects ≤ 3 nur same-origin-Host oder www-Variante, kein Cookie/Auth; HTML → Title/Meta-Description/sichtbarer Text (Script/Style/Nav/Footer raus, Whitespace normalisiert, ~2.000 Zeichen); private/interne Ziel-IPs (localhost, 10.x, 172.16–31.x, 192.168.x, 169.254.x) ablehnen — SSRF-Schutz; Fehler → `null`)
- Modify: `server/generationV2/facts.ts` + `generateSiteContent.ts` (`facts.existingSite` → Prompt-Abschnitt „Bestehende Website des Betriebs (Faktenquelle, kein Stil-Vorbild)"), `server/generationV2/runJob.ts` (Crawl parallel zur Bild-Phase, non-blocking)
- Test: `siteCrawl.test.ts` (gemockter fetch: robots-Disallow, Timeout, Größenlimit, SSRF-Ablehnung, Text-Extraktion), Prompt-Test (existingSite landet im Prompt, fehlend → Abschnitt fehlt)
- [ ] **Steps:** Tests → FAIL → implementieren → vitest grün, tsc 0 → Commit `git commit -m "feat: Betriebs-Website als Faktenquelle der Generierung (robots-konformer Einzelseiten-Crawl, SSRF-sicher)" -- <pfade>`

### Task 3: Vollständige, faktentreue Generierung + Foto-Spiegelung (Key-Leak schließen)

**Files:**
- Modify: `server/generationV2/facts.ts` (Stadt/Straße/PLZ aus `parseGmbAddress`; `facts.reviews` (max 3, ≥ 4 Sterne, Vorname + Initial), `facts.openingHours` aus persistierten Daten, `facts.editorialSummary`), `server/generationV2/generateSiteContent.ts` (Sektions-Soll: hero, services 4–6, about, testimonials aus `facts.reviews` **deterministisch** (nicht vom LLM formuliert — Originaltext gekürzt ≤ 240 Zeichen), gallery aus GMB-Fotos (≥ 3), faq 4–6 vom LLM, contact mit Öffnungszeiten; Ziel 6–8 Sektionen; `prefersMenu`-Packs wie gehabt), `server/generationV2/runJob.ts`/`resolveV2Images` + `server/gmbPhotos.ts` (GMB-Fotos beim Job nach R2 spiegeln via `server/r2Upload.ts` → nur R2-URLs im Dokument; Google-Photo-URL mit Key bleibt serverseitig; bestehende Docs mit `maps.googleapis.com/...key=`-URLs: Admin-Prozedur/Skript zum Nachspiegeln — mindestens Neu-Generierungen sauber, Bestand dokumentieren)
- Create: `server/generationV2/factGuard.ts` (`guardGeneratedContent(doc, facts)`: (a) deutsche Großstadt-Liste (~80) + Fakten-Stadt — fremde Stadt im Text → durch Fakten-Stadt ersetzen bzw. Ortsteil-Phrase entfernen; (b) Branchen-Check: Kategorie-Kernwörter vs. Text — bei hartem Widerspruch ein LLM-Retry mit explizitem Hinweis, danach akzeptieren; Log) — im Job nach der LLM-Phase
- Test: facts (Adresse Bocholt-Fall), generateSiteContent (Sektions-Soll, Testimonials deterministisch, Galerie-Schwelle), factGuard (München→Bocholt; Optik-Text vs. Werbeagentur → Retry), runJob (R2-Spiegelung gemockt; kein `key=` im Dokument — Regressionstest), Fixture „schau-horch" (gemockte GMB-Daten des echten Falls) Ende-zu-Ende mit `PB_LLM_MOCK`
- [ ] **Steps:** Tests → FAIL → implementieren → vitest grün, tsc 0, Playwright packs/islands unverändert → Commit `git commit -m "feat: Erstgenerierung vollständig und faktentreu — echte Reviews, GMB-Fotos via R2 (kein API-Key im Markup), Öffnungszeiten, Fakten-Guard gegen halluzinierte Stadt/Branche" -- <pfade>`

### Task 4: Warte-UX „Zeitmaschine"

**Files:**
- Modify: `server/generationV2/runJob.ts` (nach Bild-Phase Zwischenstand persistieren: valides V2-Doc mit Bildern + kurzen Platzhaltertexten; Phasen-Marker im Job-Status wie heute `progress`, NICHT im Doc-Schema; nach Texte-Phase final), `client/src/pages/onboarding-v2/GenerationScreen.tsx` (+CSS): Vorschau-iframe ab Jobstart mit Pack-Skeleton (Canvas/Platzhalterblöcke in `--pb-*`-Farben des gewählten Packs, reine CSS-Animation, `prefers-reduced-motion` = statisch), bei Zwischenstand → iframe lädt `/preview-ssr/<token>` und neue Sektionen faden ein (iframe-Reload mit Cache-Bust genügt; Einblendung über CSS im SSR-HTML nur im Preview-Modus), Fortschrittsbalken kontinuierlich (requestAnimationFrame-Easing zwischen `PHASE_BOUNDS`, steht nie, springt bei Phasenwechsel weich), Phasentexte bleiben; `tests/visual/studio.spec.ts` Generierungs-Test anpassen (+ ggf. 1 Baseline)
- Test: runJob (Zwischenstand ist schema-valide, `assertV2SafeWrite`-konform, Reihenfolge), GenerationScreen-Logik (Easing-Helfer pure + getestet; Komponententest statisch), Playwright studio (Generierung mit Mock zeigt Skeleton → fertig)
- [ ] **Steps:** Tests → FAIL → implementieren → vitest grün, tsc 0, studio.spec grün (2× bei Baseline-Änderung) → Commit `git commit -m "feat: Zeitmaschinen-Warte-UX — Vorschau baut sich sichtbar auf (Zwischenstand nach Bild-Phase), Fortschrittsbalken läuft kontinuierlich" -- <pfade>`

### Task 5: Kategorie-Rückfrage im Studio

**Files:**
- Modify: `server/onboardingV2/router*.ts`/`state.ts` (Zustand `needsCategory`, wenn Business-Kategorie leer/null: Generierung startet erst nach `setCategory`-Mutation; Ownership wie üblich), `client/src/pages/onboarding-v2/` (vor `GenerationScreen` ein schlanker Schritt „Was macht dein Betrieb?": Suchfeld + Vorschlagsliste aus `shared/gmbCategories`/Branchenliste + Freitext; Studio-Look), Tests (Router, Komponente statisch, Playwright studio +1 Szenario mit Seed ohne Kategorie)
- [ ] **Steps:** Tests → FAIL → implementieren → vitest grün, tsc 0, studio.spec grün → Commit `git commit -m "feat: Kategorie-Rückfrage vor der Generierung, wenn GMB keine belastbare Branche liefert" -- <pfade>`

### Task 6: Pack-Feintuning — Katalog + Fixliste (Vorbereitung der Wellen)

- Koordinator-Task (kein Implementierer): Screenshot-Katalog aller 14 Packs (Desktop 1440 + Mobil 390, „full"-Fixture, Start + Unterseite) als **Artifact** zum Durchblättern für den User; parallel je Pack strukturierte Detail-Kritik (Positionierung, Aufteilung/Raster, Bildformate/-zuschnitt, Abstände, Typo) → priorisierte Fixliste in `.superpowers/sdd/2026-08-23-b7/pack-fixliste.md`. Umsetzungswellen (2–3 × 4–5 Packs) starten erst nach User-Markierungen — eigene Tasks 6a/6b/6c mit Baselines/Vorschauen neu.
- [ ] **Steps:** Katalog erzeugen → Artifact veröffentlichen → Fixliste erstellen → an User zur Markierung

### Task 7: Abschluss B7

- [ ] Volle Gates (vitest, tsc 0, build, Playwright dev alle + prod 2×); Erfolgskriterien Spec §4 mit Status (inkl. Schau-&-Horch-Regenerierung lokal gegen echte GMB-Daten — einmaliger echter API-Call ok, dokumentieren).
- [ ] Doku: `docs/BETRIEB-V2.md` (GMB-Module, Migration 0030, Foto-Spiegelung/Key, Kategorie-Rückfrage, Zeitmaschine), `docs/superpowers/specs/2026-08-23-b7-ergebnis.md`, Spec-Stand-Block.
- [ ] Nach Merge (Koordinator, mit Freigabe): Deploy, Migration 0030, Prod-E2E mit „Schau und Horch" neu generieren + Google-Key-Restriktionen in der Cloud-Konsole prüfen (User-Aufgabe, erinnern).

## Self-Review
- Spec-Abdeckung: §2.1 → Tasks 1–2; §2.2 → Task 3; §2.3 → Task 4; §2.1-Fallback → Task 5; §2.4 → Task 6(+Wellen); §2.5 → Task 7. Key-Leak → Task 3.
- Reihenfolge/Parallelität: Task 1 zuerst (2, 3, 5 hängen dran); Task 4 unabhängig (parallel zu 1); Task 6 unabhängig (Koordinator, sofort); Task 2 und 3 nacheinander (3 nutzt 1+2), Task 5 nach 1.
- Risiken benannt: v1-API-Verfügbarkeit (Feature-Detection), SSRF beim Crawl (Denylist), Schema-valider Zwischenstand (Task 4 testet `assertV2SafeWrite`).
