# Designsystem „Plakat“ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Viertes Designsystem „Plakat“ (Anker Arcadia Dance Collective, Systemblatt `docs/designsysteme/plakat/systemblatt.html` vom Betreiber abgenommen) bauen, abnehmen lassen, freischalten und deployen.

**Architecture:** Wie Raster/Werkstoff: Modul `client/src/components/site/systems/plakat/`, Tokens `shared/designSystems/plakat.ts`, gemeinsame Helfer aus `client/src/components/site/systems/shared/` (entryFacts, photos/claimPhotos, contact, legal, menu, slots, sections). Werkstoff (`systems/werkstoff/`) ist das jüngste Muster für Struktur, Tests und Regeln; die Gestaltung kommt ausschließlich aus dem Plakat-Systemblatt.

**Spec:** `docs/superpowers/specs/2026-10-10-designsysteme-design.md` · Muster: `docs/superpowers/plans/2026-10-11-designsystem-werkstoff.md`
**Endwerte:** `.superpowers/sdd/plakat/plakat-final-values.md` + TS-Objekt in `systemblatt.html` Abschnitt 17 · Bilder `docs/designsysteme/plakat/systemblatt-*.jpg` (8 = erstes Handy-Bild ×3, 9/10/11 = ganze Handy-Seiten Barbier/Imbiss/Fitness, 12/13 = Desktop)

## Global Constraints

- Alle Raster/Werkstoff-Regeln gelten (nur `--sys-*`-Tokens oder Vielfache; WCAG AA; Fokus 2px; ≥ 44px; reduzierte Bewegung; kein Überlauf 320–1440; keine erfundenen Daten; Vorschau-Platzhalter nur in der Vorschau; lückenlose Kapitel; `SECTION_ANCHORS`; deutsche Texte; jedes Foto einmal je Seite; brauchbares Kundenfoto nie weglassen; keine Lookbehind-Regex; Journal/Raster/Werkstoff byte-gleich außer gewollten Änderungen).
- **Kein Stundenplan** (Betreiber 2026-10-12, Variante A): kein `schedule`-Abschnitt, kein Raten aus Preislisten; Kurse erscheinen als Leistungsliste.
- **Farbflächen** nur aus Palette `fields` (je 3, Kontrast ink/bg und muted/bg ≥ 4,5); Rhythmus laut Systemblatt (nie zweimal dasselbe Feld hintereinander, tief höchstens 3×: Laufband, Stimme, Fuß; Einstieg nie tief).
- **Sticker**: höchstens einer je Bildschirmhöhe, nur aus der Quellen-Allowlist (Google ≥ 4,5 bei ≥ 20 Bewertungen; amenities; Öffnungszeiten nach Mitternacht/sonntags; kleinster echter Preis; kein Gründungsjahr — Feld gibt es nicht).
- **Laufband**: genau eins, Inhalt nur aus Leistungen/Straße/Zeiten; bei reduzierter Bewegung still.
- **ẞ**: Versal-Display setzt ß als ẞ (Helfer + Test), nie „SS“.
- Schriften: League Gothic (wdth-Achse) + Hanken Grotesk, beide vorgeladen; Fotos Duoton (grayscale + multiply auf Feldfarbe) in Formen Bogen/Kreis/Pille, höchstens 2 Formen je Bildschirm.
- Commits deutsch, Conventional, Abschluss `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Branch `feat/designsystem-plakat`.

## Review Focus

1. Kein brauchbares Foto → Typo-Einstieg auf hellem Feld + Sticker trägt.
2. Kein erlaubter Sticker-Fakt → kein Sticker (nie Platzhalter).
3. Sehr lange Namen/Überschriften in League Gothic bei 320 (Fit, Umlautpunkte, ẞ).
4. Duoton auf allen Feldfarben lesbar/erkennbar; Text nie über Foto ohne Schutz.
5. Abgrenzung zu Werkstoff (Aufbau ähnlich) über Felder, Formen, Sticker.

---

### Task P1: Token-Shape, Plakat-Tokens, Schriften, Bildsätze
- [ ] `types.ts`: `SystemPalette.fields?` (3 × `{id,bg,ink,muted}`), `TypeSpec.stretch?`; `toCss` gibt `--sys-field-N-*` und `--sys-<step>-stretch` nur aus, wenn definiert; Werte-Prüfung gegen `;{}`. Journal/Raster/Werkstoff byte-gleich (36-Seiten-Vergleich).
- [ ] `plakat.ts` (PLAKAT aus Systemblatt Abschnitt 17), registriert, NICHT freigeschaltet; Schriften nach `client/public/fonts/systems/` + OFL; 2 Preloads; ẞ-Helfer in `systems/shared/` mit Tests.
- [ ] `shared/industryImages.ts`: geprüfte Unsplash-Sätze **barbier** (Barbershop, Bart, Fade) und **imbiss/doener** (Döner, Dürüm, Grill, Theke) — HTTP 200, Motiv gesichtet, Barbier-Fix aus Werkstoff respektieren (Barbier → eigener Satz statt friseur, Test), keine Übernahme fremder Kategorien (Tests).

### Task P2+P3: Gerüst, Kopf/Menü/Fuß, Feld-Rhythmus, Einstieg, Sticker, Laufband, Dock
- [ ] Modul registriert, Routen 200, Feld-Rhythmus als reine Funktion (Abschnittsliste → Feldzuordnung) mit Tests; Einstieg in Fassungen nach Systemblatt 8 (Bogen-Foto, Kreis-Foto auf Feld, Typo ohne Foto), Status-Zeile aus echten Zeiten, Sticker-Allowlist als reine Funktion mit Tests, Laufband (CSS-Animation, reduce = still, aria-hidden Dopplung), Dock (zwei Knöpfe, sichtbare Abschnitte), ein h1, Überschrift-Regel wie Raster/Werkstoff.

### Task P4–P6: Alle Inhaltsabschnitte, Unterseiten, Rechtsseiten
- [ ] Leistungen/Karte/Preise (Preise nur aus Daten; Tafel für pricelist/menu), Ablauf 01·02·03, Team in Kreisen, Galerie in Pillen/Formen, Stimme auf tiefem Feld, FAQ, Öffnungszeiten mit „Heute“, Kartenfläche ohne Einbettung, Kontakt-Insel nur wenn sie rendert, `legalParts`, exhaustiver Switch, claimPhotos, Platzhalter nur Vorschau.

### Task P7+P8: Bewegung, Anbindung, Tests, Audits
- [ ] Bewegung (Zeilen-Reveal, Form-Reveal, Sticker setzt sich einmal; Muster Werkstoff; `plakat` in SYSTEMS_WITH_MOTION/SYSTEM_MOTION/Islands); Showcases Barbier/Imbiss/Fitness (fiktive Daten, neue Bildsätze); `systems.spec.ts` (3 Paletten × full/minimal × 5 Breiten), `a11y.spec.ts`, Lighthouse Prod-Build, `impeccable` + `apple-design` → `docs/designsysteme/plakat/audit.md`, Abnahme-Vorschaubilder.

### Task P9: Abnahme, Freischaltung, Deploy
- [ ] Echte Prod-Seiten (nur lesen) mit Plakat im Triple (z. B. Postkarten-Barbiere, Friseure als Alternative) + Muster → Betreiber. **STOP bis Abnahme.** Danach `RELEASED_SYSTEMS` + `"plakat"`, Gesamtprüfung, Merge, Sicherung, Deploy, Prod-Prüfung, Memory/Doku (Rollback `--system plakat`, BETRIEB-V2).
