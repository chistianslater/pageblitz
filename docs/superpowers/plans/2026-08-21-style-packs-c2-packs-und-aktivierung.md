# Style Packs v2 — Plan C2: Packs 10–14 + Aktivierungs-Vorbereitung

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die letzten fünf Style Packs (klarwerk, verve, zunft, schimmer, fundament), Fallback-Umstellung auf klarwerk, vollständige Branchen-Abdeckung, Variant-Picker auf die Registry, und die dokumentierte Flag-Aktivierungs-Checkliste.

**Voraussetzung:** Plan C1 vollständig (Seam + 9 Packs registriert). Pack-Muster-Referenzen im Repo (`client/src/components/site/packs/*`).
**Spec:** docs/superpowers/specs/2026-08-20-style-packs-design.md · **Referenz:** docs/design/stilkatalog.html (Kacheln 10–14)

## Global Constraints

Identisch zu Plan C1 (Pack-Muster inkl. Page-Signatur {data, basePath, now}, Flat-SVGs ohne Gradienten, Baselines mit Doppel-Lauf + eigener PNG-Sichtprüfung, moduleParity, Port 3005, Fact-Forcing-Gate, chore-Isolation von Prettier-Reformats, Verfassungswerte aus der Katalog-Kachel).

---

### Task 1: Pack „Klarwerk" (Kachel 10) — künftiger Fallback

**Verfassung** (`klarwerk.ts`): essence „Weiß, Geometrie und ein elektrisches Blau — aufgeräumt wie gutes Werkzeug."; industries: it-service, edv, softwareentwicklung, webdesign, agentur, ingenieurbuero, dienstleistung, hausmeisterservice, umzug; theme light; Palette: canvas #FFFFFF, surface #F2F4F7, ink #14171C, muted #5B6472, line #E3E7ED, accent #3B5BFD „Elektroblau" (override-fähig), accent-contrast #FFFFFF; Fonts: Space Grotesk (500,700) / Inter (400,500,600); radius: card 14px, button 8px; density normal.
**Signatur** (`pb-kw-`): unregelmäßiges Bento nach dem Hero (Grid: hohe Terminal-Zelle über 2 Reihen [ink-Grund, Zeilen mit $-Prompt und →-Ergebnissen aus Fixture-Kennzahlen; Mono via CSS-Stack `ui-monospace, SFMono-Regular, monospace` — KEIN zusätzlicher Google-Font], accent-Zelle mit Kennzahl, kleine Zellen, breite Status-Zelle mit grünem Punkt „Alle Systeme betriebsbereit"), Headline mit accent-Akzentwort, Nav mit accent-Button. Kennzahlen aus google/services ableiten; fehlende Zellen weglassen.
**Fixture:** „Nordwind IT", Kiel. full: hero („IT, die einfach läuft."), services (4: Betreuung, Cloud, Sicherheit, Backup — Pauschalen), about, testimonials (2), faq (3), contact, google 4.9/44. minimal: hero, services, contact. SVGs: klarwerk-hero.svg + 1 detail (flache Blau-/Grau-Geometrie).
**Assertions:** decor enthält "irregular-bento" und "terminal-cell"; HTML enthält `pb-kw-bento`, `pb-kw-term`, `pb-kw-status`; genau eine h1.

- [ ] Steps wie C1-Packs (Failing Test → implementieren → `pnpm vitest run client/src/components/site/packs/klarwerk/ shared/` → PACKS+="klarwerk" → Baselines [60] + Sichtprüfung + Doppel-Lauf) → Commit `feat: Style Pack klarwerk (Bento, Terminal-Zelle, Live-Status)`

---

### Task 2: Pack „Verve" (Kachel 11) — drittes dunkles Pack

**Verfassung** (`verve.ts`): essence „Kondensierte Versalien, Volt-Akzent, Schräglauf — Bewegung im Stand."; industries: fitnessstudio, fitness, personal-training, tanzschule, kampfsport, crossfit, boxen; theme dark; Palette: canvas #101114, surface #1C1E24, ink #F5F5F2, muted #9DA0A8, line #2C2E35, accent #D4F542 „Volt" (locked), accent-contrast #101114; Fonts: Bebas Neue (400) / Inter (400,600,700); radius 0/0; density dense.
**Signatur** (`pb-vv-`): Outline-Riesenwort im Hintergrund (businessName wiederholt, Bebas ~150px, color transparent + -webkit-text-stroke 1px line, absolut, pointer-events:none), skewX(-6°)-Panel rechts (Flat-SVG mit 4px-Volt-Border links), Headline zweizeilig — zweite Zeile als Volt-Block skewX(-6°) mit ink-Text, Volt-Tape quer über die Hero-Ecke (rotate(-8°), Bebas letterspaced), Skew-CTA und Skew-Stat-Chips. Nav mit Bebas-Volt-Logo.
**Fixture:** „Studio PULS", Essen, Personal Training. full: hero („Dein Tempo. Deine Regeln."), services (4 Programme mit Preisen), about, testimonials (3), faq (3), contact (Mo–So Kurszeiten), google 5.0/61. minimal: hero, services, contact. SVGs: verve-hero.svg (dunkle Flächen + Volt-Diagonale, flat).
**Assertions:** theme "dark"; decor enthält "ghost-outline-word" und "volt-tape"; HTML enthält `pb-vv-ghost`, `pb-vv-tape`, `pb-vv-panel`; genau eine h1.

- [ ] Steps → Baselines (66) → Commit `feat: Style Pack verve (Outline-Riesenwort, Skew-Panel, Volt-Tape)`

---

### Task 3: Pack „Zunft" (Kachel 12)

**Verfassung** (`zunft.ts`): essence „Tiefes Bordeaux, Siegel-Gold, klassische Serifen — Tradition, die man schmeckt."; industries: baeckerei, konditorei, metzgerei, fleischerei, brauerei, weingut, brennerei, hofkaese; theme light; Palette: canvas #F5EFE2, surface #EDE3CE, ink #2A2118, muted #7A6A52, line #D9C9A8, accent #5E1F22 „Bordeaux" (locked), accent-2 #B98A2F „Siegelgold", accent-contrast #F5EFE2; Fonts: Crimson Pro (500,600 inkl. ital) / Karla (400,500); radius 0/0; density normal.
**Signatur** (`pb-zf-`): Ornament-Bordüre oben (◆-Reihe in Siegelgold, letterspaced, unter 1px-Gold-Linie), runder Jahres-Stempel (2px-Gold-Kreis, „SEIT <Jahr>" — Jahr aus footerNote extrahieren, ohne Jahr keinen Stempel), rotate(12°), KIPPT absolut in die Headline-Ecke (Overlap), Doppel-Linien-Ornament unter der Nav (2 dünne Ink-Linien), Punktlinien-Preistafel für pricelist/menu (dotted leaders zu Gold-Preisen — Muster von gusto, helle Ästhetik), zentrierte Nav mit Serifen-Logo in Bordeaux. Headline mit kursivem Bordeaux-Akzentwort.
**Fixture:** „Bäckerei Steinofen", Augsburg (footerNote „seit 1927"). full: hero („Brot braucht Zeit."), pricelist (2 Kategorien: Brote/Feingebäck, je 3 Positionen im „4,80"-Format), services (3: Steinofenbrote, Festtagsgebäck, Catering), about (Natursauerteig, 4 Generationen), testimonials (2), contact (Di–Sa ab 6 Uhr), google 4.9/212. minimal: hero, pricelist, contact. SVGs: zunft-hero.svg + 1 detail (warme Sand-/Bordeaux-Flächen, Kreis-Motiv).
**Assertions:** decor enthält "ornament-border" und "tilted-stamp"; HTML enthält `pb-zf-borde`, `pb-zf-stamp`, `pb-zf-tafel`; pricelist rendert Kategorien + Preise; genau eine h1.

- [ ] Steps → Baselines (72) → Commit `feat: Style Pack zunft (Ornament-Borduere, Kipp-Stempel, Preistafel)`

---

### Task 4: Pack „Schimmer" (Kachel 13)

**Verfassung** (`schimmer.ts`): essence „Perlmutt-Verläufe auf hellem Grund — leicht, modern, feminin."; industries: kosmetikstudio, kosmetik, nagelstudio, wellness, spa, aesthetik, wimpern, sonnenstudio; theme light; Palette: canvas #FDF7FA, surface #FFFFFF, ink #241E2A, muted #6E6377, line #E5D5DE, accent #D4749C „Rosé" (override-fähig), accent-2 #8B6CE8 „Lilac", accent-contrast #FFFFFF; Fonts: Outfit (300,400,600); radius: card 24px, button 999px; density airy.
**Signatur** (`pb-sc-`): BASELINE-DETERMINISMUS beachten — KEINE CSS-/SVG-Gradienten: „Orbs" als konzentrische FLACHE Kreise (3 ineinandergeschachtelte divs mit soliden Pastelltönen #F6DFE9/#EFD3F2/#E7C8F5, absolut hinter dem Inhalt, zwei Positionen), Glaskarte im Hero (rgba(255,255,255,.55) + backdrop-filter: blur(10px) — Blur über flachen Flächen ist deterministisch; 1px-Weiß-Border, radius 24px, weicher Schatten), dünner Zierring (1px Lilac-Kreis, absolut), rotierter Glas-Chip („Neu: <erste Leistung>"), Headline weight 300 mit weight-600-Akzentwort in SOLIDEM Rosé (kein Gradient-Text — Abweichung von der Kachel zugunsten des Regressionsnetzes, bei der Abnahme ausweisen), Pill-CTA Rosé + Ghost-Pill.
**Fixture:** „Studio Lumière", Wiesbaden. full: hero („Zeit für dich."), services (4 Behandlungen mit Preisen), about, testimonials (3), gallery (3), contact, google 4.9/97. minimal: hero, services, contact. SVGs: schimmer-hero.svg + 2 details (flache Rosé-/Lilac-Kreise auf hellem Grund).
**Assertions:** decor enthält "flat-orbs" und "glass-card"; HTML enthält `pb-sc-orb`, `pb-sc-glass`, `pb-sc-chip`; genau eine h1.

- [ ] Steps → Baselines (78) → Commit `feat: Style Pack schimmer (Flat-Orbs, Glaskarte, Zierringe)`

---

### Task 5: Pack „Fundament" (Kachel 14)

**Verfassung** (`fundament.ts`): essence „Tiefes Marineblau gegen Weiß — Substanz, Seriosität, klare Kante."; industries: immobilien, immobilienmakler, makler, hausverwaltung, versicherung, finanzberatung, vermoegensberatung, notariat; theme light; Palette: canvas #FFFFFF, surface #F0F2F5, ink #14263F „Marine", muted #5A6A80, line #D5DBE3, accent #A8894C „Messing" (locked), accent-contrast #FFFFFF; Fonts: Source Serif 4 (500,600 inkl. ital, googleCss `Source+Serif+4:ital,opsz,wght@0,8..60,500;0,8..60,600;1,8..60,500`) / Inter (400,500,600); radius 0/0; density normal.
**Signatur** (`pb-fd-`): geteilte Bühne — rechtes Marine-Panel (~42% Breite, volle Hero-Höhe) mit Katasterraster (repeating-linear-gradient 1px rgba(255,255,255,.05) horizontal + vertikal — Linienraster, kein Verlaufs-Dithering), Elemente ÜBERSCHREITEN die Panel-Grenze: Objektfoto (Flat-SVG, harter Schatten) sitzt auf der Kante, Serifen-Headline links mit kursivem Messing-Akzentwort, Stats unten rechts IM Panel (weiße Serifen-Zahlen über 1px-Weiß-Linien, aus google/services), Marine-CTA links, Testimonials mit Messing-Zitatstrich. Auf Mobil: Panel als Band unter dem Hero.
**Fixture:** „Falk & Partner Immobilien", Münster. full: hero („Werte, die bleiben."), services (4: Verkauf, Vermietung, Bewertung, Verwaltung), about, testimonials (3), faq (3), contact, google 4.8/58. minimal: hero, services, contact. SVGs: fundament-hero.svg (Stadtsilhouette als flache Marine-/Grau-Blöcke) + 1 detail.
**Assertions:** decor enthält "boundary-crossing" und "cadastral-grid"; HTML enthält `pb-fd-panel`, `pb-fd-photo`, `pb-fd-stats`; genau eine h1.

- [ ] Steps → Baselines (84) → Commit `feat: Style Pack fundament (Marine-Panel, Katasterraster, Grenz-Overlap)`

---

### Task 6: Fallback, Branchen-Vollabdeckung, Variant-Picker-Quelle

**Files:** `shared/stylePacks/index.ts` (FALLBACK_PACK) + `registry.test.ts`; NEU `shared/stylePacks/industryCoverage.test.ts`; die Datei mit `getVariantLayouts`/`VARIANT_FAMILY_RANKINGS` (per Grep finden — heute in `client/src/pages/OnboardingChat.tsx`).

- [ ] **Step 1:** `FALLBACK_PACK` von "werkbank" auf "klarwerk" (Spec §3.1); Registry-Test anpassen (unbekannte Branche → ["klarwerk"]).
- [ ] **Step 2 (TDD):** `industryCoverage.test.ts`: importiert `SEO_INDUSTRIES` aus `server/seo/landingPages.ts`; für JEDEN Branchen-Key: `getPackPool(key)` liefert eine echte Zuordnung (nicht nur Fallback). Branchen, deren korrekter Primär tatsächlich klarwerk ist, stehen als explizite dokumentierte Ausnahmenliste im Test. Lücken durch Ergänzen der `industries`-Arrays der 14 Verfassungen schließen — NICHT durch Aufweichen des Tests.
- [ ] **Step 3:** Variant-Picker: für v2-Websites kommen die Kandidaten aus `getPackPool(businessCategory)` (shared Registry) statt aus `VARIANT_FAMILY_RANKINGS`; v1-Verhalten unverändert. Auswahl-Logik als kleine pure Funktion + Unit-Test.
- [ ] **Step 4:** Gesamtsuite grün (bekannte env-Failures) + `pnpm test:visual` 84/84 → Commit `feat: klarwerk-Fallback, 37-Branchen-Abdeckung, Variant-Picker aus Registry`

---

### Task 7: Aktivierungs-Checkliste + Abnahme

**Files:** NEU `docs/superpowers/specs/2026-08-21-flag-aktivierung.md`

- [ ] **Step 1:** Lokale E2E-Probe: Dev-Server auf 3005, `curl` der Dev-Preview aller 14 Packs (je Pack: Anker + LocalBusiness + fonts.googleapis ≥ 1 Treffer); Gesamtsuite grün; `pnpm test:visual` ZWEIMAL 84/84.
- [ ] **Step 2:** Aktivierungs-Doku: Voraussetzungen (Seam-Fixes ✓, 14 Packs ✓, Abdeckungstest ✓), VPS-Schritte (deploy per bestehendem Verfahren, `PB_LAYOUT_V2=1` in der PM2-Env, Testgenerierung mit echtem GMB-Business, `curl https://<slug>.pageblitz.de` → LocalBusiness-JSON-LD prüfen, Rollback = Flag entfernen + pm2 restart), bekannte Grenzen der Übergangsphase (alter Chat: websiteData-Patches erst beim Complete, Live-Preview im Chat zeigt Generierungsstand; Altsystem-Löschung + axe/Perf-Budget [§8.4/§8.5] folgen mit Teilprojekt B).
- [ ] **Step 3:** Commit `docs: Flag-Aktivierungs-Checkliste PB_LAYOUT_V2` → CHECKPOINT: dem User die Desktop-PNGs der 10 neuen Packs zeigen + Merge-Frage. Abnahme vor Teilprojekt B.

---

## Selbstreview (C2)

- 5 Packs decken die Kacheln 10–14; schimmer ersetzt die Gradient-Signatur bewusst durch deterministische Flat-Orbs (Baseline-Lehre aus Plan B; Fidelity-Abweichung wird bei der Abnahme ausgewiesen).
- Task 6 erfüllt Spec §3.1 (Fallback klarwerk, Branchen-Abdeckung als Test-Invariante) und schließt die letzte Alt-Mapping-Quelle (Variant-Picker) für v2.
- §7-Löschung bewusst nicht hier (C1-Scope-Entscheidung): nach Teilprojekt B; §8.4/§8.5 als dokumentierte Deferred-Posten in der Aktivierungs-Doku.
- Typkonsistenz: keine neuen Engine-Interfaces; alle Packs nutzen {data, basePath, now}; Task-6-Änderungen sind additiv (v1-Pfade unverändert).
