# Designsystem „Klar“ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Fünftes Designsystem „Klar“ (Anker Luma Dental, Systemblatt `docs/designsysteme/klar/systemblatt.html` vom Betreiber abgenommen) bauen, abnehmen lassen, freischalten und deployen.

**Architecture:** Wie Werkstoff/Plakat: Modul `client/src/components/site/systems/klar/`, Tokens `shared/designSystems/klar.ts`, gemeinsame Helfer aus `client/src/components/site/systems/shared/` (entryFacts, photos/claimPhotos, contact, legal, menu, slots, sections, days, dockAutoHide, versalEszett). Plakat (`systems/plakat/`) ist das jüngste Muster für Struktur, Tests und Regeln; die Gestaltung kommt ausschließlich aus dem Klar-Systemblatt.

**Spec:** `docs/superpowers/specs/2026-10-10-designsysteme-design.md` · Muster: `docs/superpowers/plans/2026-10-12-designsystem-plakat.md`
**Endwerte:** `.superpowers/sdd/klar/klar-final-values.md` (Entscheidungen, Shape-Abweichungen, TS-Objekt `KLAR`) · Bilder `docs/designsysteme/klar/systemblatt-*.jpg` (8 = erstes Handy-Bild ×3, 9/10/11 = ganze Handy-Seiten Zahnarzt/Physio/Kanzlei, 12/13 = Desktop)

## Global Constraints

- Alle bisherigen Regeln (nur `--sys-*`-Tokens oder Vielfache; WCAG AA, hier Ziel ≥ 7:1 für Text; Fokus 2px; ≥ 44px; reduzierte Bewegung; kein Überlauf 320–1440; keine erfundenen Daten; Vorschau-Platzhalter nur Vorschau; lückenlose Kapitel; `SECTION_ANCHORS`; deutsche Texte; jedes Foto einmal je Seite; Kundenfoto nie weglassen; keine Lookbehind-Regex; Journal/Raster/Werkstoff/Plakat byte-gleich außer gewollten Änderungen; Handy-Leiste über `data-sys-dock`/`data-sys-actions` + geteiltes `dockAutoHide`).
- **Barrierefreiheit zuerst:** Fließtext ≥ 1.125rem auf dem Handy, kleinste Stufe 1rem; Knöpfe ≥ 48px; Telefon immer als echter `tel:`-Knopf; Sprechzeiten-Karte mit „heute“ (Text, nicht nur Farbe) und `blueprint.hoursLabel`.
- **Fakten-Chips** („Alle Kassen“, „Privat“, „Hausbesuche“, „Barrierefrei“, Preise, Bewertung) nur aus Daten (amenities, Abschnitte, google); nie erfunden.
- **Erster Termin / Erstgespräch** aus dem `process`-Abschnitt; keine erfundenen Dauern (Zeitangaben nur, wenn sie in den Schritt-Titeln/Texten stehen).
- **Lindgrün o. ä. nur als Fläche**, nie als Text- oder Knopffarbe (Kontrast).
- **Icons lokal** als Inline-SVG (kein CDN).
- Schriften: DM Sans + Atkinson Hyperlegible Next (latin vorgeladen, latin-ext per unicode-range nachgeladen).
- Shape: optionales `surface` in `SystemPalette` (Rückfall `#ffffff`), nur ausgegeben wenn gesetzt.
- Commits deutsch, Conventional, Abschluss `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Branch `feat/designsystem-klar`.

## Review Focus

1. Ohne Foto → Sprechzeiten/Bürozeiten tragen den Einstieg.
2. Ohne Fakten-Daten → keine Chips, keine leeren Zeilen.
3. Lange Praxisnamen („Gemeinschaftspraxis für Allgemeinmedizin Dr. med. …“) bei 320.
4. Sprechzeiten mit Mittagspause, geschlossenen Tagen, Platzhalterzeiten.
5. Abgrenzung zu den anderen vier Systemen.

---

### Task K1: Token-Shape, Klar-Tokens, Schriften, Bildsätze
- [ ] `surface?` in `SystemPalette` (+ `--sys-surface` nur wenn gesetzt); `klar.ts` aus Endwerten, registriert, NICHT freigeschaltet; 4 woff2 nach `client/public/fonts/systems/` + OFL, 2 Preloads (latin), latin-ext per unicode-range; Byte-Gleichheit der vier Live-Systeme (48 Seiten).
- [ ] `shared/industryImages.ts`: geprüfte Unsplash-Sätze **zahnarzt**, **physio**, **praxis** (allgemein: Wartezimmer/Behandlungsraum/Ärztin im Gespräch, keine Klinik-Stockfotos mit Blutdruck-Klischee) — HTTP 200, Motiv gesichtet, keine Übernahme fremder Kategorien (Tests; z. B. „Tierarzt“, „Heilpraktiker“, „Psychotherapie“, „Apotheke“ prüfen).

### Task K2+K3: Gerüst, Kopf/Menü/Fuß, Einstieg, Sprechzeiten-Karte, Fakten-Chips, Dock
- [ ] Modul registriert, Routen 200; Einstieg nach Systemblatt 8 (Fläche mit Kicker-Chip, Überschrift, Termin-Knopf + Telefon-Knopf; Foto im weichen Rahmen mit Heute-Karte / kleines Foto + Zeiten-Karte / ohne Foto: Zeiten-Tabelle); Entscheidungstabelle; ein h1; Fakten-Chips als reine Funktion (nur Daten); Dock mit Telefon + Termin, `data-sys-*`-Kennzeichnung; Inline-SVG-Icons.

### Task K4–K6: Alle Inhaltsabschnitte, Unterseiten, Rechtsseiten
- [ ] Leistungen (Karten), Erster Termin (aus process), Team mit Porträts bzw. Monogramm, Praxis-Galerie, Stimmen, FAQ, Sprechzeiten + Anfahrt (Kartenfläche ohne Einbettung), Kontakt-Insel, Rechtsseiten (`legalParts`), exhaustiver Switch, claimPhotos, Platzhalter nur Vorschau.

### Task K7+K8: Bewegung, Anbindung, Tests, Audits
- [ ] Dezente Bewegung (Muster Plakat/Werkstoff, `klar` in SYSTEMS_WITH_MOTION/SYSTEM_MOTION/Islands mit `[data-pb-system]`), Showcases Zahnarzt/Physio/Kanzlei (fiktive Daten, neue Bildsätze, „Sie“-Ansprache wie Muster), `systems.spec.ts` (3 Paletten × full/minimal × 5 Breiten), `a11y.spec.ts` (Ziel 0 Befunde), Lighthouse, `impeccable` + `apple-design` → `docs/designsysteme/klar/audit.md`, Abnahme-Vorschaubilder.

### Task K9: Abnahme, Freischaltung, Deploy
- [ ] Echte Prod-Seiten (nur lesen) mit Klar im Triple (z. B. Beratung 593, Gesundheit falls vorhanden) + Muster → Betreiber. **STOP bis Abnahme.** Danach `RELEASED_SYSTEMS` + `"klar"`, Gesamtprüfung, Merge, Sicherung, Deploy, Prod-Prüfung, Memory/Doku (Rollback `--system klar`, BETRIEB-V2).
