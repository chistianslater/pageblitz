# Designsystem „Freundlich" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Siebtes Designsystem „Freundlich" (Anker Bright Path, Systemblatt `docs/designsysteme/freundlich/systemblatt.html` vom Betreiber am 2026-10-13 abgenommen, inkl. aller sechs Vorschläge) bauen, abnehmen lassen, freischalten und deployen. Es übernimmt die „zu kühlen" Fälle von Raster/Klar: Kita, Tagesmutter, Nachhilfe, Musikschule, Hundesalon/-schule, Tierarzt, Tierbedarf, Eisdiele, Hebamme, Kinderfotografie, Familienpraxis.

**Architecture:** Wie Nacht/Klar: Modul `client/src/components/site/systems/freundlich/`, Tokens `shared/designSystems/freundlich.ts`, gemeinsame Helfer aus `client/src/components/site/systems/shared/`. Baut auf main NACH dem Pack-Rückbau (`chore/packs-entfernen`) auf: Baupläne in `shared/blueprints/`, Showcases in `shared/showcases/`, Textstimmen in `shared/textVoices/`, nur rev 3. Nacht (`systems/nacht/`) ist das jüngste Muster für Struktur, Tests und Regeln; die Gestaltung kommt ausschließlich aus dem Freundlich-Systemblatt.

**Spec:** `docs/superpowers/specs/2026-10-10-designsysteme-design.md` · Muster: `docs/superpowers/plans/2026-10-12-designsystem-nacht.md`
**Endwerte:** `docs/designsysteme/freundlich/freundlich-final-values.md` (Entscheidungen, Shape-Erweiterungen, TS-Objekt `FREUNDLICH`) · Bilder `docs/designsysteme/freundlich/systemblatt-*.jpg` (6 = Einstieg nach Fotolage, 10 = erster Handy-Blick ×3, 11–15 ganze Handy-Seiten, 16–18 Desktop, 19 Tokens) · Schriften `docs/designsysteme/freundlich/fonts/`

## Global Constraints

- Alle bisherigen Regeln (nur `--sys-*`-Tokens oder Vielfache; WCAG AA, Fließtext Ziel ≥ 7:1, Text auf Pastell immer Tinte; Fokus 3px Akzent; ≥ 44/48px; reduzierte Bewegung; kein Überlauf 320–1440; keine erfundenen Daten; Vorschau-Platzhalter nur Vorschau; `SECTION_ANCHORS`; deutsche Texte; jedes Foto einmal je Seite; freie Galerie zählt nach gezeigten Fotos; Kundenfoto nie weglassen; keine Lookbehind-Regex; jeder `tel:`-Knopf heißt „Anrufen"; die sechs Live-Systeme byte-gleich (Fingerabdruck `scripts/seiten-fingerabdruck.ts`); `data-sys-dock`/`data-sys-actions` + dockAutoHide).
- **Betreiber-Entscheidungen 2026-10-13:** Wald-Signal abgedunkelt mit Weiß (#be5219); Himmel-Signal „Sonne" mit Tintenrand/-kante; **kein** Block „Wo steht ihr gerade?" (keine neuen Datenfelder); Pille über dem Titel nur, wenn Ort oder Zielgruppe in den Daten stehen; schwaches Foto klein im Einstieg; Fotos in Angebotskarten nur, wenn jedes Angebot eins hat.
- Shape-Erweiterungen optional und nur ausgegeben, wenn gesetzt: `shape` (Radien s/m/l/pill, Druckkante, Kachelkante, Kippwinkel, Kante `straight|cloud`), je Palette `band`, `edge`, `tints` (4 Pastelle mit Kante).
- Schriften: Bricolage Grotesque (gekürzt, opsz 72) + Instrument Sans, latin vorgeladen, latin-ext per unicode-range.
- Zuordnung: neue Familie(n) bzw. Branchen-Erkennung (ganze Wörter) für die Zielbranchen; Freundlich als Hauptsystem dort, Alternative wo sinnvoll; keine Kaperung fremder Branchen (Tierarzt ≠ Arzt, Hundepension ≠ Pension) — Regressionstests.
- Bildsätze für Zielbranchen ohne eigenen Satz (Kita/Nachhilfe/Musikschule/Hundesalon/Eisdiele/Hebamme), geprüft (HTTP 200, Motiv gesichtet), keine Kinder-Gesichter in Nahaufnahme.
- Commits deutsch, Conventional, Abschluss `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Branch `feat/designsystem-freundlich`.

## Review Focus

1. Ohne Foto → Pastellfläche und Fakten tragen den Einstieg, nichts wirkt leer.
2. Pastell-Kontrast in allen drei Paletten, auch Knöpfe auf Pastell und Fokus auf Pastell.
3. Wolkenkante/Kippen am Handy: kein Überlauf, keine überdeckten Inhalte.
4. Branchen-Erkennung: Zielbranchen landen in Freundlich, Nachbarn (Arzt, Hotel, Pension, Café) nicht.
5. Abgrenzung zu den sechs Live-Systemen.

---

### Task F1: Token-Shape, Freundlich-Tokens, Schriften, Zuordnung, Bildsätze
- [ ] Shape-Erweiterungen (optional), `freundlich.ts` aus Endwerten, registriert, NICHT freigeschaltet; 4 woff2 + OFL; 2 Preloads; Fingerabdruck der sechs Systeme 0 Abweichungen.
- [ ] Branchen-Familie(n) und Zuordnung (Haupt/Alt1/Alt2) für die Zielbranchen; Bildsätze; Regressionstests.

### Task F2: Gerüst, Kopf/Menü/Fuß, Einstieg, Fakten-Pillen, Dock
- [ ] Nach Systemblatt 6/10/16; Entscheidungstabelle (gutes / schwaches / kein Foto); Pille über dem Titel nur aus Daten; ein h1; Dock; Wolkenkante.

### Task F3: Alle Inhaltsabschnitte, Unterseiten, Rechtsseiten
- [ ] Angebote (Pastell je Angebot, Fotos nur wenn alle), Über uns, Team mit Initialen, Galerie, Stimmen, FAQ, Zeiten + „Besuch uns", Anfahrt (Kartenfläche ohne Einbettung), Kontakt-Insel, Preise nur aus Daten, Rechtsseiten, exhaustiver Switch, claimPhotos.

### Task F4: Bewegung, Anbindung, Tests, Audits
- [ ] Ein Federmoment am Einstiegsfoto, sonst sanftes Einblenden (Muster Nacht), `freundlich` in SYSTEMS_WITH_MOTION/SYSTEM_MOTION/Islands; Showcases Kita Pusteblume / Fellfreunde / Gelato Mio (fiktiv, 555, `.example`); `systems.spec.ts`, `a11y.spec.ts` (0 Befunde), Lighthouse, Audits → `docs/designsysteme/freundlich/audit.md`, Abnahme-Vorschaubilder.

### Task F5: Abnahme, Freischaltung, Deploy
- [ ] Musterseiten + (falls vorhanden) echte Prod-Betriebe der Zielbranchen (nur lesen) → Betreiber. **STOP bis Abnahme.** Danach `RELEASED_SYSTEMS` + `"freundlich"`, Gesamtprüfung, Merge, Sicherung, Deploy, Prod-Prüfung, Memory/Doku.
