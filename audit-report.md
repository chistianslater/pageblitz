# Audit: pageblitz.de · 30 Aug 2026 · 262 Sitemap-URLs · Scope: Site-Level voll + 3 Template-Seiten (/, /website-erstellen/friseur, /website-erstellen/friseur/berlin)

### [x] 1. Search Console für pageblitz.de zugänglich machen
Erledigt 30 Aug: Service-Account cursor-analytics-access@schau-horch-mcp
hinzugefügt, sc-domain:pageblitz.de mit vollen Rechten erreichbar.
Erste ECHTE Zahlen (90 Tage): 4 Querys, 19 Impressionen, 0 Klicks,
Positionen 48–100 („homepage für hebammen", „website maler erstellen
lassen" — die programmatischen Seiten sammeln erste Impressionen, es
fehlt Autorität). Morgen: Indexing-/CWV-Daten in den Fix-Lauf ziehen.

### [ ] 2. Eigene Titles/Metas für SPA-Routen · /start, /impressum, /datenschutz tragen den Homepage-Title

Die Routen liefern das SPA-Fallback-HTML — Google hat /datenschutz und /start
bereits MIT Homepage-Title und -Description indexiert (site:-Check 30.08.).
/start (Funnel) vermutlich besser noindex; Rechtsseiten eigene Titles.

**Wer:** ich, im Code (SSR-Meta je Route oder noindex)
**Zeit:** 45 min
**Änderungen:** Server-Route/Head-Tags. Kein Body-Text.

### [ ] 3. /site/admin-demo-1 aus der Sitemap + Demo-Seiten noindex

Eine Demo-Kundenseite steht in der öffentlichen sitemap.xml und liefert 200.

**Wer:** ich, im Code (Sitemap-Generator + noindex auf /site/* Demos)
**Zeit:** 15 min
**Änderungen:** sitemap.xml-Ausgabe, ein Meta-Tag. Kein Inhalt.

### [ ] 4. Stadt in die Meta-Description der 222 Stadt-Seiten

Branchen- und Stadt-Seite teilen sich dieselbe Description ohne Stadtnamen
(Titles sind korrekt individuell). Template-Fix, wirkt auf alle 222.

**Wer:** ich, im Code (SEO-Template in server/seo/landingPages.ts)
**Zeit:** 20 min
**Änderungen:** Meta-Descriptions (per COPY RULE erlaubt). Kein Body-Text.

### [ ] 5. llms.txt anlegen · 404 heute

robots.txt lässt GPTBot & Co. bereits zu (gut), llms.txt fehlt.

**Wer:** ich, im Code
**Zeit:** 15 min
**Änderungen:** neue Datei. Kein Inhalt angefasst.

### [ ] 6. width/height auf Template-Bildern + Cache-Header

1 Bild ohne width/height im Branchen-/Stadt-Template (CLS-Risiko, von
Lighthouse geflaggt); Home: ~270 KiB Cache-Ersparnis, ~115 KiB unused JS.

**Wer:** ich, im Code
**Zeit:** 30–60 min
**Änderungen:** img-Attribute, Cache-Header, ggf. Code-Splitting. Kein Inhalt.

### [ ] 7. Backlink-Aufbau starten · 11 Referring Domains vs. 178/407 bei Konkurrenten

Spam-Score 54 (die 11 Links sind großteils wertlos, alle .com-Crawler-Quellen,
nur 2 aus DE). Realistisches Keyword-Ceiling damit: nur Long-Tail. ProductHunt
(Memory-Task), OMR/Capterra ausbauen, Branchen-Verzeichnisse, Gastbeiträge.
Gap-Liste (Domains, die auf 2+ Konkurrenten zeigen): morgen per DataForSEO
domain_intersection ziehen.

**Wer:** du (Outreach) + ich (Gap-Liste ziehen)
**Zeit:** laufend
**Änderungen:** keine an der Site.

### [ ] 8. Blog aufbauen · Route zu Content-Arbeit, NICHT Teil des Fix-Loops

0 erfasste Rankings (DataForSEO, Deutschland; GSC fehlt zur Bestätigung).
Die Money-SERPs gehören STRATO/IONOS/Agenturen — aber „Website erstellen
lassen KI" ist eine offene Related Search, und Perplexity zitiert für
„KI-Website-Builder"-Fragen Vergleichs-BLOGS (kopfundstift.de,
website-boost.com, fuer-gruender.de). Genau dort entsteht AI-Sichtbarkeit.
Erste Artikel: „Impressum für Kleinunternehmer" (Memory: 5.400 Suchen/Mo),
„Was kostet eine Website für Friseure", „KI Website erstellen lassen".

**Wer:** Content-Session (eigener Auftrag)
**Zeit:** eigene Sessions
**Änderungen:** neue Inhalte, nichts Bestehendes.

---

## AI-Surface-Baseline · 30 Aug 2026

| Prompt | Surface | Zitiert | Pageblitz? |
|---|---|---|---|
| „Friseurin braucht Website, welche Anbieter?" | ChatGPT (gpt-4o-mini, ohne Web) | Wix, Jimdo, Strato, IONOS, Squarespace, WordPress, Webnode | ✗ |
| „KI-Website-Anbieter für Kleinunternehmen DE + kennst du pageblitz.de?" | Perplexity (sonar, Web) | IONOS, Jimdo, Wix, Hostinger, Hocoos, Durable, 10Web, Webador, Localo, HubSpot — „pageblitz.de taucht nicht auf" | ✗ |
| Google AI Overview „website erstellen lassen" | Google (via SERP-API) | STRATO, IONOS, Graphek, fuer-gruender.de, ucentric-media.de | ✗ |

## Benchmark · 30 Aug 2026 (DataForSEO)

| | pageblitz.de | lisakoch.de | wedeon.de | strato.de |
|---|---|---|---|---|
| Organische Keywords (DE) | 0 erfasst | 238 | 139 | (Konzern, außer Liga) |
| Est. Traffic | ~0 | ~2.900 | ~2.180 | — |
| Referring Domains | 11 (Spam-Score 54) | 178 | 407 | — |
| Sitemap-/Crawl-Seiten | 262 | ~109 | ~65 | — |

## Was dieser Audit NICHT gemessen hat · 30 Aug 2026

- **Search Console (Layer 1): inferred** — Property nicht im verbundenen
  Konto. Schließen: Punkt 1 (2–5 min).
- **Semrush Site Health (Layer 2): not measured** — Semrush nicht verbunden;
  Backlinks/SERP/Rankings via DataForSEO ersetzt. Schließen: Semrush-Projekt
  anlegen (optional, DataForSEO deckt das meiste).
- **On-page (Layer 5): sampled** — 3 von 262 Seiten (je Template Home/
  Branche/Stadt) gegen die Kern-Checks; nicht alle 80 Checks einzeln.
  Template-Fixes wirken auf alle Seiten desselben Templates.
- **Lighthouse (Layer 6): lab data** — PSI-API (Default mobil), je 1 Lauf:
  Home 95, Stadt-Template 100. Branchen-Template nicht separat (baugleich
  Stadt). A11y/Best-Practices/SEO-Teilscores vom API-Wrapper nicht geliefert.
- **Feld-Web-Vitals: not measured** — braucht GSC (Punkt 1).
- **Cannibalization: inferred** — ohne GSC-Querys nicht belegbar; Risiko bei
  ~0 Sichtbarkeit derzeit gering. Identische Metas Branche/Stadt (Punkt 4)
  sind der eine sichtbare Kandidat.
- **Backlink-Gap-Liste: not measured** — domain_intersection morgen ziehen
  (Punkt 7).
- **Local/GBP (Layer 11): skipped** — SaaS ohne lokales Servicegebiet.
- **Doorway (Layer 13): gemessen, sauber** — berlin↔hamburg 49 % Satz-
  Ähnlichkeit mit echten Stadt-Spezifika, ~1.045 Wörter/Seite. Kein Set.
- **HTML-Board (audit-report.html): ausstehend** — wird beim Fix-Lauf
  generiert, wenn es ein echtes Vorher/Nachher gibt.
