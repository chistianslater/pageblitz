# Designsystem „Raster“ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Zweites Designsystem „Raster“ (Anker Colophon, Systemblatt `docs/designsysteme/raster/systemblatt.html` vom Betreiber abgenommen) bauen, abnehmen lassen, freischalten und deployen.

**Architecture:** Das Grundgerüst rev 3 steht seit Journal (`shared/designSystems/`, `client/src/components/site/systems/`, SiteRenderer-Zweig über `SYSTEM_MODULES`, SSR-Preload aus `def.preload`, Vorschau-/Demo-Routen, Studio-Auswahl). Raster ist ein zweites, in sich geschlossenes Modul `client/src/components/site/systems/raster/`. Daten-Helfer, die Journal und Raster teilen, wandern zuerst nach `client/src/components/site/systems/shared/` (Verhalten unverändert). Journal-Code ist das Muster für Struktur, Tests und Regeln; die Gestaltung kommt ausschließlich aus dem Raster-Systemblatt.

**Tech Stack:** wie Journal (React 19 SSR, TypeScript, Zod, Vitest, Playwright, selbst gehostete WOFF2).

**Spec:** `docs/superpowers/specs/2026-10-10-designsysteme-design.md` · Muster: `docs/superpowers/plans/2026-10-10-designsystem-journal.md`
**Endwerte:** `.superpowers/sdd/raster/raster-final-values.md` (wörtlich übernehmen) · Systemblatt-Bilder `docs/designsysteme/raster/systemblatt-*.jpg` (6 = erstes Handy-Bild, 7/8/9 = ganze Handy-Seiten Kanzlei/Werkstatt/Schlüsseldienst, 10/11 = Desktop, 12 = Endwerte)

## Global Constraints

- Gleiche Regeln wie Journal: nur `--sys-*`-Tokens (oder Vielfache) für Größe/Abstand/Farbe; Haarlinien 1px; WCAG AA; Fokus ≥ 2px sichtbar; Tippflächen ≥ 44px; `prefers-reduced-motion` → keine Bewegung; kein horizontales Scrollen 320–1440; keine erfundenen Daten (Preise, Zitate, Jahre, „24/7“, Zahlen); Platzhalter nur in der Vorschau; Kapitelnummern lückenlos über sichtbare Abschnitte; Anker aus `SECTION_ANCHORS`; deutsche Texte.
- Rev 1/2 und Journal bleiben byte-/pixelgleich (Journal-Tests und `systems.spec.ts`-Journal-Baselines grün ohne Update).
- Eine Schriftdatei `geist-latin-wght.woff2` (100–900), genau 1 Preload; `@font-face` pro Datei nur einmal.
- „24/7“ nur, wenn die Öffnungszeiten rund um die Uhr sind (`shortHours` → „rund um die Uhr“); „Seit JJJJ“ nur mit belegtem Gründungsjahr im Dokument; Google-Zahlen nur mit `data.google`.
- Bänder: `position: sticky`, keine Scroll-Übernahme; ohne JS und bei reduzierter Bewegung normale Abfolge.
- Bilder Schwarzweiß per CSS-Filter (Systemblatt Abschnitt 07); LCP-Bild `eager` + `fetchPriority="high"` + Maße.
- Commits deutsch, Conventional, Abschluss `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Branch `feat/designsystem-raster`.

## Review Focus

1. Sehr lange Namen („Kfz-Meisterbetrieb Yilmaz & Söhne GmbH“) → Wortmarken-Fit + Gewerk in den Kicker, kein Überlauf bei 320.
2. Betrieb ohne Foto und ohne Bewertungen (Schlüsseldienst) → Typo-Einstieg trägt, keine leeren Flächen.
3. Palette „Kohle“ (dunkles Papier) → alle Abschnitte, Formular-Insel, Banner, Bildnachweis lesbar.
4. Bänder bei 1 Leistung bzw. 12 Leistungen → kein Leerlauf, keine endlose Sticky-Strecke.
5. Unterseiten/Rechtsseiten im Raster-Rahmen.

---

### Task R1: Token-Shape, Raster-Tokens, gemeinsame Helfer

**Files:** `shared/designSystems/types.ts` (TypeStep + `figure`; `SystemPalette.signal?`, `onSignal?`), `toCss.ts` (`--sys-signal`, `--sys-on-signal` mit Rückfall accent/onDeep; `figure`-Variablen), `shared/designSystems/raster.ts` (RASTER aus Endwerten), `registry.ts` (raster eingetragen, NICHT freigeschaltet), Tests `tokens.test.ts`; `client/public/fonts/systems/geist-latin-wght.woff2` (aus `docs/designsysteme/raster/fonts/`); `client/src/components/site/systems/shared/` (verschoben aus journal/: `addressLine`, `mapsHref`, `mailHref`, `primaryAction`, `figureNumbers`, `journalShows`→`systemShows`, `shownNavItems`, `chapterIndex`, Vorschau-Slot-Logik, `displayName`-Nutzung) mit Re-Exports, Journal importiert von dort.
- [ ] Tests zuerst: Raster hat 3 Paletten mit Kontrasten (ink/paper ≥7, muted/paper ≥4,5, accent/paper ≥4,5, onDeep/deep ≥7, onSignal/signal ≥4,5, signal/paper ≥3); 1 Preload; `--sys-signal` fällt auf accent zurück, wenn nicht gesetzt (Journal); Journal-`systemCssVars` unverändert bis auf neue Variablen.
- [ ] Journal-Typen: `figure` optional pro System (Journal hat keins) — Typ so gestalten, dass Journal ohne `figure` gültig bleibt.
- [ ] Verschiebung der Helfer ohne Verhaltensänderung; alle Journal-Tests grün.
- [ ] `npx vitest run shared client/src/components/site server/ssr`, `npm run check`, Commit.

### Task R2: Raster-Gerüst — Modul, CSS-Basis, Kopf, Fuß, Kapitel-Raster

**Files:** `systems/raster/{index.tsx,css.ts,Chrome.tsx,sections.tsx,testkit.tsx,raster.test.tsx}`, `systems/registry.ts`, `server/ssr/renderSite.tsx` (Motion-Bundle-Gate allgemein: Systeme mit Motion), ggf. `site-islands/motion.ts`.
- [ ] Kopf: Wortmarke (Schritt `mark`) links, „Menü“ rechts (details-Menü wie Journal, gleiche a11y), Desktop-Navigation laut Systemblatt 10; Kapitelkopf mit linker Label-Spalte (Nummer + Label) und Inhalt rechts (Colophon-Raster, 12 Spalten).
- [ ] Fuß dunkel (`deep`), Aufforderung, vier Spalten Fakten, Rechtslinks.
- [ ] `@font-face` einmal; Root `pb-raster`; Legacy-`--pb-*`-Aliase greifen (aus Journal-Zweig, palettenbasiert, prüfen für dunkles Papier „Kohle“).
- [ ] Tests wie Journal Task 7 (Attribute, Variablen, keine Pack-CSS, Kopf/Fuß, Menü a11y), SSR: 1 Preload, kein Google Fonts.

### Task R3: Einstieg + Handy-Leiste

**Files:** `systems/raster/{Entry.tsx,fit.ts,Dock.tsx}`, `shared/designSystems/tradeWords.ts` (Liste Gewerk-/Branchenwörter: Kfz, Meisterbetrieb, Autowerkstatt, Schlüsseldienst, Steuerberatung, Kanzlei, Rechtsanwalt, Versicherung, Abschleppdienst, Notdienst, Sanitär, Elektro, Malerbetrieb, Tischlerei, Friseur, Physiotherapie, Praxis …).
- [ ] Wortmarken-Fit serverseitig aus einer Advance-Tabelle von Geist (aus der WOFF2 einmal erzeugt und als JSON/TS eingecheckt, Skript unter `scripts/`), Größe = min(26rem, Spalte ÷ längstes Wort), Untergrenze `display`; passt es nicht → Gewerk-Wort in den Kicker. Reine Funktion mit Tests.
- [ ] Drei Fassungen laut Systemblatt 6: hell mit Foto-Tafel unten, Foto vollflächig S/W mit Name darüber (bei Querformat-Foto, heroScore wie Journal), Typo-Einstieg ohne Foto (Status-Zeile „Jetzt erreichbar“ nur bei 24-h-Zeiten; „24/7“-Ziffer nur dann).
- [ ] Faktenzeile: „Heute geöffnet bis …“ (keine Platzhalterzeiten), Google-Zeile nur mit Daten, „Seit …“ nur belegt.
- [ ] Dock: zwei Felder (Signal-Fläche Hauptaktion + zweites Feld) bzw. bei Sofort-Dienst eine Anrufleiste mit Nummer; nur < 48rem; Inhalt nie verdeckt.
- [ ] Tests: genau ein h1 (Anzeigename ohne Rechtsform), Fit-Klassen, kein „24/7“ ohne 24-h-Zeiten, kein „Seit“ ohne Jahr, Typo-Fassung ohne Foto, Dock-Varianten.

### Task R4: Leistungen als Bänder, Zahlenzeile, Ablauf

**Files:** `systems/raster/{Bands.tsx,Figures.tsx,Process.tsx}`.
- [ ] Bänder: je Leistung ein Band (85svh Handy, 100svh ≥ 900px), Name in `figure`/Versal mit eigenem Fit, Beschreibung onDeep 72 %, Foto S/W wenn jede Leistung eins hat, sonst `deep`-Fläche; `position: sticky` stapelnd; ab > 6 Leistungen nur die ersten 6 als Bänder, Rest als Liste; bei 1 Leistung kein Sticky.
- [ ] Zahlenzeile nur mit echten Zahlen (Google-Note, Anzahl Bewertungen, Jahre seit Gründung falls belegt); weniger als 2 Zahlen → entfällt.
- [ ] Ablauf als Ziffernzeilen (`figure`).
- [ ] Preise/Speisekarte/Team-Platzhalter wie Journal (nur Vorschau).

### Task R5: Über uns, Galerie/Referenzen, Stimmen

- [ ] Laut Systemblatt 7–9: Über uns mit S/W-Bild und Text im Raster, Galerie als Raster-Strecke mit Bildzeilen, Stimmen als ein großes Zitat (`lede`), Quelle als Kicker; Abb.-Nummern über `figureNumbers`.

### Task R6: Gut zu wissen, Besuch/Kontakt, Unterseiten, Rechtsseiten, übrige Abschnittstypen

- [ ] FAQ als Zeilen mit +/–; Öffnungszeiten-Tabelle mit „Heute“; Kartenfläche ohne Google-Einbettung; Kontakt-Insel nur wenn sie rendert; alle `SectionV2`-Typen (exhaustiv mit `never`), `jr`-Muster aus Journal Task 12 übertragen; Rechtsseiten im Raster-Rahmen.

### Task R7: Bewegung

- [ ] Einstieg: Wortmarke Clip-Reveal, Satz Fade; Abschnitte wie Journal (rootMargin-Trigger); Bänder: Sticky ohne JS, Skalierung/Abdunkeln des darunterliegenden Bandes nur mit `no-preference`; nur transform/opacity/clip-path; Motion-Bundle für raster.

### Task R8: Anbindung, Tests, Audits

- [ ] Vorschau/Demo/Design-Übersicht zeigen Raster (Showcases deren Hauptsystem raster ist: Beratung, Auto, Sofort-Dienst, Industrie, Standard); Studio bietet Raster als Alternative, sobald freigeschaltet.
- [ ] `tests/visual/systems.spec.ts` um Raster (3 Paletten × full/minimal × 5 Breiten) erweitern; a11y-Spec; Lighthouse (Prod-Build); `impeccable`- und `apple-design`-Audit → `docs/designsysteme/raster/audit.md`, hoch/mittel beheben; Abnahme-Vorschaubilder je Palette.

### Task R9: Abnahme, Freischaltung, Deploy

- [ ] Drei echte Betriebe aus Prod (nur lesen): Werkstatt/Auto, Beratung, Sofort-Dienst oder Industrie (sonst Standard) — vorher/nachher 390 + 1440 → Betreiber. **STOP bis Abnahme.**
- [ ] Nach Abnahme: `RELEASED_SYSTEMS = ["journal", "raster"]`, abschließende Branch-Prüfung, Merge nach `main`, Sicherung `generated_websites`, Deploy, Prod-Prüfung, Memory/Doku.
