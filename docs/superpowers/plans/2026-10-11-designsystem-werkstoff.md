# Designsystem „Werkstoff“ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Drittes Designsystem „Werkstoff“ (Anker Hollis Butcher Co., Systemblatt `docs/designsysteme/werkstoff/systemblatt.html` vom Betreiber abgenommen) bauen, abnehmen lassen, freischalten und deployen.

**Architecture:** Wie Raster: eigenes Modul `client/src/components/site/systems/werkstoff/`, Tokens `shared/designSystems/werkstoff.ts`, gemeinsame Helfer aus `client/src/components/site/systems/shared/`. Raster-Code (`systems/raster/`) ist das jüngste Muster für Struktur, Tests, Regeln (Fit, Fotos-nur-einmal, Dock, Bewegung, Rechtsseiten); die Gestaltung kommt ausschließlich aus dem Werkstoff-Systemblatt.

**Spec:** `docs/superpowers/specs/2026-10-10-designsysteme-design.md` · Muster: `docs/superpowers/plans/2026-10-11-designsystem-raster.md`
**Endwerte:** `.superpowers/sdd/werkstoff/werkstoff-final-values.md` · Systemblatt-Bilder `docs/designsysteme/werkstoff/systemblatt-*.jpg` (8 = erstes Handy-Bild ×3, 9/10/11 = ganze Handy-Seiten Schreinerei/Bäckerei/Laden, 12/13 = Desktop)

## Global Constraints

- Alle Raster-Regeln gelten: nur `--sys-*`-Tokens (oder Vielfache); Haarlinien 1px; WCAG AA; Fokus 2px; Tippflächen ≥ 44px; reduzierte Bewegung; kein horizontales Scrollen 320–1440; keine erfundenen Daten; Vorschau-Platzhalter nur in der Vorschau; lückenlose Kapitel; `SECTION_ANCHORS`; deutsche Texte; jedes Foto nur einmal je Seite; ein brauchbares Kundenfoto wird nie weggelassen; keine Lookbehind-Regex; Journal und Raster bleiben unverändert (ihre Tests + Baselines grün ohne Update).
- **Hell bleiben:** Papier immer hell und warm; `deep` nur für den Fuß und kleine Flächen (Zettel-Leiste, Knöpfe). Ein Test prüft, dass keine Abschnittsfläche `--sys-deep` als Hintergrund nutzt außer Fuß/Dock/Zettel-Leiste.
- **Werkzettel** (Mono): nur echte Daten — Name/Gewerk, Telefon, Adresse, Heute-Zeiten/„Jetzt geöffnet“. Kein „kostenlos“, kein „seit“, keine Versprechen, außer sie stehen im Dokument (z. B. als USP/Leistungsbeschreibung, dann wörtlich).
- **Keine neuen Schemafelder:** Tageszeitleiste = `process`-Abschnitt, als Zeitleiste dargestellt, wenn die Schritt-Titel mit einer Uhrzeit beginnen (z. B. „5:00 …“), sonst Ziffern 1·2·3. Wochentafel = `pricelist`/`menu` mit echten Daten. Gründungsjahr gibt es nicht.
- Schriften: Zilla Slab 700 + Karla (variabel) vorgeladen, DM Mono 500 nachgeladen; `@font-face` je Datei einmal.
- Commits deutsch, Conventional, Abschluss `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Branch `feat/designsystem-werkstoff`.

## Review Focus

1. Schwache Handyfotos / kein Foto → Typo-Einstieg + Zettel trägt.
2. Bäckerei ohne Uhrzeit-Schritte → Ablauf fällt sauber auf Ziffern zurück; „6:00“-Einstieg nur, wenn Öffnungszeiten eine frühe Uhrzeit belegen.
3. Zettel bei fehlendem Telefon/Adresse/Zeiten → schrumpft, nie leere Zeilen.
4. Palette „Leinen“ (Lodengrün) mit Formular-Insel, Banner, Bildnachweis.
5. Abgrenzung: Seite darf nie „dunkel“ wirken (kein Raster-Look).

---

### Task W1: Token-Shape, Werkstoff-Tokens, Schriften, Bildsätze

- [ ] `types.ts`: dritte Schriftrolle `fonts.mono` (optional), `TypeSpec.font` erlaubt `"mono"`; optionale Typstufe `data`; optional `imageFilter` je System (in `toCss` als `--sys-image-filter`). Journal/Raster bleiben gültig und byte-gleich (Vergleich wie R1).
- [ ] `werkstoff.ts` (WERKSTOFF aus Endwerten), registriert, NICHT freigeschaltet; drei woff2 nach `client/public/fonts/systems/` + OFL-Hinweise; `systemFontFaces` deckt mono ab; 2 Preloads.
- [ ] `shared/industryImages.ts`: geprüfte Unsplash-Bildsätze für Bäckerei, Schreinerei/Tischlerei, Laden ergänzen (jede URL per HTTP 200 prüfen, nur Bilder, die das Gewerk zeigen; Muster der bestehenden Einträge). Tests: Kontraste (inkl. signal), Preload ≤ 2, kein `;{}` in Werten.

### Task W2: Gerüst — Modul, CSS-Basis, Kopf, Fuß, Kapitel

- [ ] `systems/werkstoff/{index.tsx,css.ts,Chrome.tsx,sections.tsx,testkit.tsx,werkstoff.test.tsx}` registriert; Kopf (Name Slab + Gewerk Mono), Menü (geteiltes Menü-Script, a11y wie Raster), Fuß dunkel nach Systemblatt, Kapitelköpfe nach Systemblatt; Motion-Gate vorerst aus; Routen `?system=werkstoff` und `/demo/system/werkstoff/<showcase>` liefern 200; „Hell-bleiben“-Test.

### Task W3: Einstieg, Werkzettel, Handy-Leiste

- [ ] Drei Fassungen nach Systemblatt 8: Foto randlos mit Zettel über der Bildkante; Uhrzeit-Einstieg (große Ziffer = frühe Öffnungszeit heute/werktags, nur wenn belegt) + Foto; Typo-Einstieg (kein brauchbares Foto) mit Zettel. Entscheidungstabelle im Code.
- [ ] Zettel-Komponente (Mono): Zeilen nur mit Daten, Status „Jetzt geöffnet/Heute bis …“ aus Öffnungszeiten (keine Platzhalterzeiten), Anruf-Leiste in `signal`.
- [ ] Dock: zwei Knöpfe (Hauptaktion + Route/Anrufen) nach Systemblatt; ein h1; Überschrift-Auswahl wie Raster (nur echte Kicker-Doppel weglassen).

### Task W4: Angebot — Leistungen, Wochentafel/Preise, Ablauf (Ziffern oder Tageszeitleiste), Zahlen

- [ ] Leistungen als Liste/Karten nach Systemblatt; Preise nur aus Daten; `pricelist`/`menu` als Tafel; Ablauf: Zeitleiste wenn Schritt-Titel mit Uhrzeit beginnen, sonst Riesenziffern 1·2·3; Platzhalter wie Raster.

### Task W5: Über uns/Menschen, Galerie „Werkbank-Raster“, Stimmen

- [ ] Nach Systemblatt; Fotos nur einmal (claimPhotos-Muster aus Raster), Abb.-Nummern lückenlos, warme Bildbehandlung über `--sys-image-filter`.

### Task W6: Gut zu wissen, Besuch/Öffnungszeiten, Unterseiten, Rechtsseiten, übrige Abschnitte

- [ ] FAQ, Öffnungszeiten mit „Heute“, Kartenfläche ohne Einbettung, Kontakt-Insel nur wenn sie rendert, `legalParts`, exhaustiver Switch, Leinen-Palette für Insel/Banner/Bildnachweis prüfen.

### Task W7: Bewegung

- [ ] Nach Systemblatt-Regeln, Journal/Raster-Muster (rootMargin-Trigger, Startzustände nur unter ready + no-preference, LCP-Bild nie unsichtbar), `werkstoff` in `SYSTEMS_WITH_MOTION`.

### Task W8: Anbindung, Tests, Audits

- [ ] Showcases für Handwerk/Café-Bäckerei/Handel (fiktive Daten: 555-Nummern, `.example`), Design-Übersicht; `systems.spec.ts` (3 Paletten × full/minimal × 5 Breiten), `a11y.spec.ts`, Lighthouse Prod-Build, `impeccable` + `apple-design` → `docs/designsysteme/werkstoff/audit.md`, Abnahme-Vorschaubilder.

### Task W9: Abnahme, Freischaltung, Deploy

- [ ] Echte Prod-Seiten (nur lesen) mit Werkstoff als Haupt- oder Alternativsystem (z. B. 504 Demo-Werkstatt), ergänzt durch Muster → Betreiber. **STOP bis Abnahme.** Danach `RELEASED_SYSTEMS` + `"werkstoff"`, Gesamtprüfung, Merge, Sicherung, Deploy, Prod-Prüfung, Memory/Doku (Rollback `--system werkstoff`).
