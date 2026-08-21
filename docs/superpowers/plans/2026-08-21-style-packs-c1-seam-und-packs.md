# Style Packs v2 — Plan C1: Flag-Seam + Packs 5–9

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die drei blockierenden Vorbedingungen für die `PB_LAYOUT_V2`-Aktivierung schließen (Onboarding-v2-Sicherheit, Branchen-Matching, Fakten-Merge) und fünf weitere Style Packs (patina, salon-noir, marktplatz, landgut, atelier) im bewährten Muster bauen.

**Architecture:** Baut auf Plan A+B auf (gemerged in main, Stand 92ed146). Das Pack-Muster ist im Repo etabliert — Referenz-Implementierungen: `client/src/components/site/packs/{werkbank,kanzlei,morgenlicht,gusto}/`. Jedes neue Pack folgt exakt diesem Muster (Verfassung als Datenobjekt, css.ts mit Präfix, index.tsx mit 11-Typen-switch + never-Guard, Page-Signatur `{data, basePath, now}`, Registrierung, Fixtures, 6 Baselines).

**Scope-Entscheidung (Abweichung von Spec §7, im Ledger zu ruling-en):** Der alte Onboarding-Chat SCHREIBT v1-Strukturen (saveStep-Sideeffects, complete-Patches). Plan C löscht das Altsystem deshalb NICHT — es macht den alten Flow v2-sicher (Übergangsphase), die Löschung (§7.3) erfolgt am Ende von Teilprojekt B, wenn der neue Flow den Chat ersetzt.

**Spec:** docs/superpowers/specs/2026-08-20-style-packs-design.md · **Visuelle Referenz:** docs/design/stilkatalog.html (Kacheln 02, 04, 06, 08, 09)

## Global Constraints

- Wie Plan A/B: pnpm; TypeScript strict, kein `any`; Commits `<type>: <beschreibung>` ohne Footer; Dateien < 800 Zeilen; deutsche UI-Texte und Anker.
- Pack-Muster verbindlich (an den 4 bestehenden Packs ablesen): eigener Ordner `packs/<id>/`, CSS-Präfix `pb-<kürzel>-`, Root-Klasse `pb-<id>`, alle 11 Sektionstypen im switch mit `const exhaustive: never`, genau eine h1, `Page: React.FC<{data; basePath: string; now: Date}>`, Footer-Links `${basePath}/impressum|datenschutz`, Footer-Jahr `now.getFullYear()`, Anti-Baukasten: eigene Hero-Komposition + eigenwillige Nav + ≥2 grenzbrechende Dekor-Elemente.
- Demo-Bilder: NUR lokal erzeugte, gradienten-/filter-/opacity-FREIE Flat-SVGs unter `client/public/demo/<id>-*.svg` (1200x900). Fixture-URLs SafeUrlSchema-konform (`https?://|/|#`).
- Baselines: `tests/visual/packs.spec.ts` PACKS-Liste erweitern; `pnpm test:visual:update`; eigene PNG-Sichtprüfung ALLER 6 neuen PNGs gegen die Katalog-Kachel (Signatur-Elemente, keine Default-Links, kein 320px-Overflow); `pnpm test:visual` ZWEIMAL grün. Playwright läuft auf PORT=3005; Orphans vorher per `lsof -nP -iTCP:3005 -sTCP:LISTEN -t | xargs kill`.
- Nach jedem Pack: `pnpm vitest run client/src/components/site/packs/<id>/ shared/` grün (moduleParity erzwingt Modul+Fixtures je Registry-Eintrag).
- Fact-Forcing-Gate-Hook: geforderte Fakten im Text präsentieren, identischen Call wiederholen. Prettier-Hook-Reformats fremder Dateien als separaten chore-Commit VOR dem feat-Commit isolieren.
- Verfassungswerte stammen aus der Katalog-Kachel — Farben/Fonts NICHT frei erfinden. `essence` = Tagline der Kachel. `llmHints` im Ton des Packs (do: 3 Punkte, dont: 3 Punkte).

---

### Task 0: Flag-Aktivierungs-Seam (drei Blocker aus dem Plan-B-Finalreview)

**Files:**
- Create: `server/onboardingV2Patch.ts` + Test `server/onboardingV2Patch.test.ts`
- Modify: `server/routers.ts` (onboarding.complete ~:3256ff und saveStep ~:3115ff — chirurgisch)
- Modify: `shared/stylePacks/index.ts` (getPackPool) + Test `shared/stylePacks/registry.test.ts` (erweitern)
- Modify: `server/generationV2/generateSiteContent.ts` + `contentPrompt.ts` + v2-Jobpfad in `server/routers.ts`; Tests in `server/generationV2/generateSiteContent.test.ts` erweitern

**Interfaces:**
- Produces: `applyOnboardingToV2(doc: WebsiteDataV2, answers: { impressumHtml?: string; datenschutzHtml?: string; legalPhone?: string; legalEmail?: string; legalStreet?: string; legalZip?: string; legalCity?: string; openingHours?: { day: string; hours: string }[]; hiddenSections?: SectionType[]; sectionOrder?: SectionType[]; tagline?: string }): WebsiteDataV2` — pure Funktion, wirft bei Schema-Verstoß.
- Produces: `generateSiteContent`-Signatur erweitert um optionales `facts`-Objekt (slug, businessCategory, google, contact-Felder).

- [ ] **Step 1 (a) — Completion/saveStep v2-sicher (TDD):**
  Tests zuerst für `applyOnboardingToV2`: (1) setzt legal.impressumHtml/datenschutzHtml; (2) ersetzt vorhandene contact-Sektion durch Antwort-Daten (phone/email/street/zip/city/openingHours), hängt an, wenn keine existiert; (3) übernimmt hiddenSections/sectionOrder/tagline; (4) Ergebnis validiert (parse), kaputte Eingabe wirft. Implementieren (immutable, `WebsiteDataV2Schema.parse` am Ende).
  In `onboarding.complete`: wenn `websiteData?.version === 2` → `applyOnboardingToV2` statt des v1-Patch-Pfades (legalGenerator-HTML wird wie bisher erzeugt und übergeben); v1-Pfad byte-identisch. In `saveStep`: wenn v2-Dokument → SÄMTLICHE websiteData-Sideeffects überspringen (Antworten landen weiter in onboarding_responses; Kommentar: „v2: Patches nur beim Complete — alter Chat ist Übergangsphase bis Teilprojekt B").
- [ ] **Step 2 (b) — getPackPool-Matching (TDD):** Tests zuerst: „Logopädie"→morgenlicht, „Wirtschaftsprüfer"→kanzlei, „Barbershop"→FALLBACK (nicht gusto!), „Sanitärinstallateur"→werkbank, bestehende Tests bleiben grün. Fix: Transliteration (ä→ae, ö→oe, ü→ue, ß→ss, lowercase) auf Key UND industries-Einträge; Wortgrenzen-Matching (Key via /[^a-zäöüß]+/i in Tokens splitten, Token beginnt-mit-Industry ODER Industry beginnt-mit-Token ab Länge ≥ 4 — keine reinen Substring-Treffer mitten im Wort).
- [ ] **Step 3 (c) — Fakten-Merge (TDD):** Tests zuerst: facts.contact ersetzt LLM-contact-Felder; google/slug/businessCategory landen im Dokument; Prompt enthält „Erfinde niemals Telefonnummern, E-Mail-Adressen oder Straßen — die contact-Sektion enthält höchstens city." Implementieren: Merge NACH der Validierung, Ergebnis erneut safeParse-geprüft; v2-Jobpfad in routers.ts befüllt facts aus dem business-Datensatz (vorhandene Felder: phone/email/address/rating/reviewCount — beim Implementieren im Schema/db nachsehen und im Report benennen).
- [ ] **Step 4:** `pnpm vitest run server/ shared/` grün (bekannte env-Failures ausgenommen); `pnpm test:visual` 24/24 unverändert.
- [ ] **Step 5:** Commit `fix: Flag-Seam — v2-sichere Onboarding-Patches, Branchen-Matching, deterministischer Fakten-Merge`

---

### Task 1: Pack „Patina" (Kachel 02)

**Verfassung** (`shared/stylePacks/patina.ts`): essence „Pergament, Terrakotta und Serifenkursive — wie ein gut gealtertes Journal."; industries: heilpraktiker, naturheilkunde, osteopathie, yoga, massage, hofladen, naturkosmetik; theme light; Palette: canvas #FBF4E7 „Pergament", surface #EFE5D2 „Aged Paper", ink #2B2620, muted #6B5F4E, line #E0D3B8, accent #B05A36 „Terrakotta" (locked), accent-contrast #FBF4E7; Fonts: Fraunces (400+600 inkl. ital, googleCss `Fraunces:ital,wght@0,400;0,600;1,400;1,600`) / Karla (400,500); radius: card 14px, button 999px; density airy.
**Signatur** (Pflicht-Dekor, Klassen `pb-pa-`): riesiges kursives Initial-Wasserzeichen (erster Buchstabe des businessName, ~300px, accent bei 8% Opazität via color-mix, absolut hinter dem Hero), ZWEI überlappende Bogen-Bilder (border-radius 200px 200px 14px 14px, versetzt, das kleinere mit Pergament-Schattenkante box-shadow -10px -10px 0 canvas), handschriftlich anmutende rotierte Randnotiz (Fraunces italic, −4°, muted), Leistungs-Titel als Punkt-getrennte Inline-Zeile mit Terrakotta-·-Separatoren im Hero. Eyebrow letterspaced uppercase Terrakotta. Headline mit kursivem Akzentwort (letztes Wort) in Terrakotta.
**Fixture:** „Naturheilpraxis Annelie Voss", Freiburg. full: hero („Heilung beginnt mit Zuhören.", subheadline, CTA „Erstgespräch vereinbaren"), services (4: Akupunktur, Phytotherapie, Ernährungsberatung, Ordnungstherapie — je 1 Satz), about (~80 W., warm, Sie-Form, keine Heilversprechen), testimonials (3), faq (3), contact (Mo–Fr), google 4.9/54. minimal: hero, services, contact. Demo-SVGs: patina-hero.svg + patina-detail-1.svg (warme Terrakotta-/Sand-Flächen, Bogenformen, flat).
**Test-Assertions** (`patina.test.tsx` nach kanzlei-Muster): Verfassung registriert, decor enthält "initial-watermark" und "arch-images"; HTML enthält `pb-pa-init`, `pb-pa-arch`, `pb-pa-note`; genau eine h1; Anker leistungen/kontakt; versteckte Sektion fehlt.

- [ ] Steps: Failing Test → Verfassung+Registry+Fixtures+SVGs+Modul → Tests grün → PACKS+="patina" → Baselines (30) + Sichtprüfung + Doppel-Lauf → Commit `feat: Style Pack patina (Initial-Wasserzeichen, Bogen-Bilder, Randnotiz)`

---

### Task 2: Pack „Salon Noir" (Kachel 04) — zweites dunkles Pack

**Verfassung** (`salon-noir.ts`, Export `SALON_NOIR`): essence „Fast-Schwarz, Champagner und kursive Serifen — Understatement mit Glanz."; industries: friseur, barbershop, barbier, tattoo, piercing, makeup; theme dark; Palette: canvas #121110, surface #211F1C, ink #F4EDE3 „Ivory", muted #B5AC9E, line #3A362F, accent #C8A96A „Champagner" (locked), accent-contrast #121110; Fonts: Cormorant Garamond (500,600 inkl. ital) / Jost (300,400,500); radius 0/0; density normal.
**Signatur** (`pb-sn-`): Passepartout-Goldrahmen (1px Champagner via color-mix 45%, position:fixed-frei — als umlaufender Rahmen mit margin 12px um die ganze Seite), zentrierte Nav mit gesperrtem Serifen-Logo (letter-spacing .3em) zwischen zwei Link-Gruppen, Hero: kursive Serifen-Headline ÜBERLAPPT das Bild-Panel rechts (z-index; Bild als Flat-SVG in 1px-Champagner-Rahmen), vertikales Seitenlabel (writing-mode vertical-rl, letterspaced, muted, rechts), Ghost-CTA (Champagner-Border, transparent, letterspaced uppercase). Kein border-radius.
**Fixture:** „NOIR Haarstudio", München-Maxvorstadt. full: hero („Handwerk für Haar."), services (4: Schnitt, Farbe & Balayage, Pflege, Styling — Preise „ab 45"), about, testimonials (3), pricelist (2 Kategorien: Damen/Herren, je 3 Positionen), contact (Di–Sa), google 4.8/167. minimal: hero, services, contact. SVGs: salon-noir-hero.svg (dunkle Flächen + ein Champagner-Lichtstreifen, flat).
**Assertions:** theme "dark"; decor enthält "passepartout-frame" und "vertical-label"; HTML enthält `pb-sn-frame`, `pb-sn-vert`; pricelist rendert Kategorienamen + Preise; genau eine h1.

- [ ] Steps wie Task 1 → Baselines (36) → Commit `feat: Style Pack salon-noir (Passepartout, Bild-Overlap, Vertikal-Label)`

---

### Task 3: Pack „Marktplatz" (Kachel 06)

**Verfassung** (`marktplatz.ts`): essence „Bonbonfarben, runde fette Buchstaben, Sticker — Freude ab der ersten Sekunde."; industries: kita, kindergarten, musikschule, hundeschule, eisdiele, spielwaren, nachhilfe; theme light; Palette: canvas #FFF8EC, surface #FFFFFF, ink #262133, muted #5D5570, line #F0E4CC, accent #FF6B57 „Koralle" (locked), accent-2 #FFC838 „Sonne", accent-contrast #FFFFFF; Fonts: Baloo 2 (600,800) / Nunito (400,600,700); radius: card 22px, button 14px; density normal.
**Signatur** (`pb-mp-`): Konfetti-Grund (zwei radial-gradient-DOT-Muster als background-image — Punkte in Sonne/Koralle-Pastell, deterministisch, KEINE Verläufe: `radial-gradient(<farbe> 2px, transparent 2.5px)` mit background-size), Inhaltskarte im Hero um −1.2° gekippt mit hartem Farbschatten (box-shadow 0 6px 0 line), DREI rotierte Sticker (Sonne-Pille „1. Stunde gratis" o. ä. aus tagline/faq abgeleitet, ink-Karte mit Altersangabe/USP, gestrichelte Outline-Karte), Kritzel-Unterstreichung unter dem Akzentwort (inline-SVG path, accent-2, stroke-linecap round), Scallop-Kante am Hero-Ende (radial-gradient-Reihe wie Katalog-Kachel). CTA mit hartem Schatten (0 4px 0 #D94A37).
**Fixture:** „Musikschule Tonleiter", Nürnberg. full: hero („Lernen, das Spaß macht!"), services (4 Kurse mit Preisen „ab 32 €/Monat"), about, testimonials (3, Eltern-Stimmen), faq (3), gallery (3), contact, google 4.9/89. minimal: hero, services, contact. SVGs: marktplatz-hero.svg + 2 details (flache Bonbon-Formen: Kreise/Dreiecke in Koralle/Sonne/Minze #3E8E7E).
**Assertions:** decor enthält "stickers" und "squiggle-underline"; HTML enthält `pb-mp-card`, `pb-mp-sticker`, `pb-mp-squiggle`, `pb-mp-scallop`; genau eine h1.

- [ ] Steps wie Task 1 → Baselines (42) → Commit `feat: Style Pack marktplatz (Sticker, Kritzel-Linie, Scallop-Kante)`

---

### Task 4: Pack „Landgut" (Kachel 08)

**Verfassung** (`landgut.ts`): essence „Leinen, Blattgrün und organische Formen — geerdet und lebendig."; industries: gaertnerei, gartenbau, landschaftsbau, florist, blumen, ferienhof, imkerei, baumschule; theme light; Palette: canvas #F6F3EA „Leinen", surface #EDE8D9, ink #2E2A20, muted #6D6656, line #DCD3BC, accent #4A6741 „Blattgrün" (override-fähig, NICHT locked), accent-contrast #F6F3EA; Fonts: Lora (500 inkl. ital) / Karla (400,500); radius: card 16px, button 999px; density normal.
**Signatur** (`pb-lg-`): DREI „Pflanzreihen"-Bögen unterschiedlicher Höhe im Hero rechts (Flex-Spalten als DIVs mit border-radius 120px 120px 0 0, flache Grün-/Sandtöne #8FA872/#C9BC8F/#41593A — kein Bild nötig; der höchste trägt unten ein Versal-Label z. B. Saison-Hinweis), Saison-Ticker volle Breite (Grün-Grund, Leinen-Text, ◦-Separatoren, Inhalte = Service-Titel 3× wiederholt), Serifen-Headline mit kursivem Grün-Akzentwort, Eyebrow uppercase Grün. Bilder (about/gallery) in Bogen-Maske (border-radius 120px 120px 16px 16px).
**Fixture:** „Gärtnerei Grünholz", Ravensburg. full: hero („Vom Beet auf den Balkon."), services (4: Stauden & Kräuter, Gartenplanung, Pflanzservice, Baumschnitt), about (drei Generationen, ~80 W.), testimonials (3), gallery (3), contact (Saisonzeiten Mo–Sa), google 4.8/73. minimal: hero, services, contact. SVGs: landgut-hero.svg + 2 details (flache Blattgrün-/Sand-Bänder).
**Assertions:** decor enthält "plant-row-arches" und "season-ticker"; HTML enthält `pb-lg-rows`, `pb-lg-ticker`; genau eine h1.

- [ ] Steps wie Task 1 → Baselines (48) → Commit `feat: Style Pack landgut (Pflanzreihen-Boegen, Saison-Ticker)`

---

### Task 5: Pack „Atelier" (Kachel 09)

**Verfassung** (`atelier.ts`): essence „Riesige Serifen, harte Kanten, ein Signalrot — Magazin statt Website."; industries: fotograf, fotografie, fotostudio, grafikdesign, architekt, architekturbuero, kunsthandwerk, werbeagentur; theme light; Palette: canvas #FFFFFF, surface #EDEDEA, ink #0F0F0F, muted #555550, line #0F0F0F (harte 1–3px-Linien!), accent #E0301E „Signalrot" (locked), accent-contrast #FFFFFF; Fonts: Instrument Serif (400 inkl. ital) / Inter (400,500) + utility Space Mono (400,700); radius 0/0; density dense.
**Signatur** (`pb-at-`): Zeitungs-Masthead — businessName in Instrument Serif volle Breite (clamp bis ~76px) mit rotem Schlusspunkt, darunter 3px-Ink-Linie und Mono-Meta-Zeile (businessCategory — Stadt · Leistungs-Stichworte · footerNote-Jahr falls vorhanden), Cover-Komposition: großes Bild links (Flat-SVG, 1px-Ink-Rahmen rechts) mit kursiver Serifen-Bildzeile unten links in Weiß, Caption-Spalte rechts mit rotem Mono-Index (`N° 01 — …`), Mono-Link mit 2px-Ink-Unterstreichung. Sektionsüberschriften Instrument Serif mit 3px-Top-Border. Nav Space Mono uppercase.
**Fixture:** „Studio Lenz", Leipzig, Fotografie. full: hero („Bilder, die bleiben."), services (3: Porträt, Reportage, Marken — Mono-nummeriert), about, gallery (3), testimonials (2), contact, google 5.0/31. minimal: hero, services, contact. SVGs: atelier-hero.svg + 2 details (Graustufen-Flächen + eine rote Kante).
**Assertions:** decor enthält "newspaper-masthead" und "red-index"; HTML enthält `pb-at-masthead`, `pb-at-meta`, `pb-at-idx`; genau eine h1 (Masthead ist als div/p ausgezeichnet, die Hero-Headline ist die h1).

- [ ] Steps wie Task 1 → Baselines (54) → Commit `feat: Style Pack atelier (Masthead, Meta-Zeile, Cover-Caption, Rot-Index)`

---

## Selbstreview (C1)

- Task 0 deckt exakt die drei im Plan-B-Finalreview geparkten Blocker; `applyOnboardingToV2` als pure Funktion hält den routers.ts-Eingriff chirurgisch und testbar ohne DB.
- Pack-Tasks: Verfassungswerte aus den Katalog-Kacheln; jedes Pack ≥2 grenzbrechende Dekor-Elemente + eigene Hero-Struktur (Anti-Baukasten §4.2); salon-noir validiert als zweites dunkles Pack den Body-Reset.
- Typkonsistenz: alle Packs nutzen die etablierte Page-Signatur {data, basePath, now}; Task 0 erweitert nur generateSiteContent (optionales facts) und fügt eine neue pure Server-Funktion hinzu — keine Interface-Brüche.
