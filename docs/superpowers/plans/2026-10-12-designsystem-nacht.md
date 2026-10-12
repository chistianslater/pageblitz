# Designsystem „Nacht“ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Sechstes und letztes Designsystem „Nacht“ (Anker Restaurant Zimmerl, Systemblatt `docs/designsysteme/nacht/systemblatt.html` vom Betreiber abgenommen) bauen, abnehmen lassen, freischalten und deployen. Dazu die vier offenen Kleinigkeiten aus der Klar-Endprüfung.

**Architecture:** Wie Klar/Plakat: Modul `client/src/components/site/systems/nacht/`, Tokens `shared/designSystems/nacht.ts`, gemeinsame Helfer aus `client/src/components/site/systems/shared/`. Klar (`systems/klar/`) ist das jüngste Muster für Struktur, Tests und Regeln (Öffnungszeiten-Parser, Termin-Ziel-Reihenfolge, Link-Ziele, Fakten nur aus Daten, dockAutoHide, Bewegung); die Gestaltung kommt ausschließlich aus dem Nacht-Systemblatt.

**Spec:** `docs/superpowers/specs/2026-10-10-designsysteme-design.md` · Muster: `docs/superpowers/plans/2026-10-12-designsystem-klar.md`
**Endwerte:** `.superpowers/sdd/nacht/nacht-final-values.md` + TS-Objekt `NACHT` im Systemblatt (letzter Abschnitt) · Bilder `docs/designsysteme/nacht/systemblatt-*.jpg` (9 = erstes Handy-Bild ×3, 10–13 = ganze Handy-Seiten, 14–16 = Desktop, 17 = Tokens)

## Global Constraints

- Alle bisherigen Regeln (nur `--sys-*`-Tokens oder Vielfache; WCAG AA, Ziel ≥ 7:1 für Fließtext auf dunklem Grund; Fokus 2px sichtbar auf dunkel; ≥ 44/48px; reduzierte Bewegung; kein Überlauf 320–1440; keine erfundenen Daten; Vorschau-Platzhalter nur Vorschau; lückenlose Kapitel; `SECTION_ANCHORS`; deutsche Texte; jedes Foto einmal; Kundenfoto nie weglassen; keine Lookbehind-Regex; die fünf Live-Systeme byte-gleich außer gewollten Änderungen; `data-sys-dock`/`data-sys-actions` + dockAutoHide).
- **Keine neuen Datenfelder** (Betreiber 2026-10-12, Variante A): Küchenzeit nur, wenn sie im Öffnungszeiten-Text steht („Küche bis 21:30“); Reservieren über echten Buchungslink, sonst Telefon (Klar-Reihenfolge); **große Kupferziffer nur aus echten Werten** (z. B. Schließzeit/letzter Termin aus Öffnungszeiten, Google-Note) — sonst entfällt sie; Zimmer/Angebote als Leistungsliste; Speisekarte nur aus `menu`/`pricelist`.
- **Dunkle Fotos** per CSS-Filter/Overlay mit garantiertem Textkontrast (Worst-Case-Test wie Raster-Bleed).
- Shape optional: `scheme: "dark"` (Shell setzt `color-scheme`/`theme-color`, Studio-Rahmen dunkel) und `glow` je Palette — nur ausgegeben, wenn gesetzt.
- Schriften: Gilda Display + Jost (latin vorgeladen, latin-ext per unicode-range).
- Commits deutsch, Conventional, Abschluss `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Branch `feat/designsystem-nacht`.

## Review Focus

1. Trübe/helle Handyfotos → Text bleibt lesbar (Overlay-Worst-Case).
2. Keine Ziffer ohne echten Wert; keine Küchenzeit ohne Daten.
3. Speisekarte mit vielen Kategorien/Gängen, fehlende Preise, lange Gerichtnamen bei 320.
4. Unterseiten/Rechtsseiten im dunklen Rahmen (Lesbarkeit langer Texte).
5. Abgrenzung zu den fünf Live-Systemen.

---

### Task N0: Kleinigkeiten aus der Klar-Endprüfung (wirken live)
- [ ] `praxis`-Bildsatz: nacktes Schlagwort „praxis“ entfernen (Fußpflege/Podologie/Logopädie/Hebamme/„Kosmetikpraxis“/„Tattoo Praxis“ nicht mehr auf Arztpraxis-Fotos), Regressionstests.
- [ ] Bauplan Beratung: `usp` nach `hero`, `pricelist` nach `services` einordnen (wie Gesundheit), Tests.
- [ ] Maps-Links in allen Systemen einheitlich in neuem Tab (`target="_blank" rel="noopener noreferrer"`), Tests.
- [ ] Klar: Hauptknopf mit `tel:`-Ziel bekommt „Anrufen“/„Termin vereinbaren“, außer die Beschriftung sagt das schon; Test.

### Task N1: Token-Shape, Nacht-Tokens, Schriften, Bildsätze
- [ ] `scheme?`, `glow?` (optional, nur wenn gesetzt), `nacht.ts` aus Systemblatt, registriert, NICHT freigeschaltet; 4 woff2 + OFL; 2 Preloads; Byte-Gleichheit der fünf Live-Systeme (60 Seiten).
- [ ] Bildsätze: dunkle Restaurant-/Bar-Stimmung (Gastraum abends, angerichteter Teller, Weinregal), gehobener Salon abends, Boutique-Zimmer — geprüft (HTTP 200, Motiv), ohne fremde Kategorien zu kapern (Tests).

### Task N2+N3: Gerüst, Kopf/Menü/Fuß, Einstieg, Ziffer, Heute/Küche, Dock
- [ ] Nach Systemblatt 9/14; Entscheidungstabelle (Foto dunkel / schwaches Foto + Ziffer / ohne Foto + Ziffer oder Name); Ziffer als reine Funktion nur aus Daten; Reservieren-Ziel nach Klar-Reihenfolge; ein h1; Dock; `scheme: dark` in Shell/Studio-Rahmen.

### Task N4–N6: Alle Inhaltsabschnitte, Unterseiten, Rechtsseiten
- [ ] Speisekarte (Gänge/Kategorien, Preise nur aus Daten), Angebote/Zimmer als Liste, Über uns/Küche, Galerie (dunkel), Gästestimme, Gut zu wissen, Öffnungszeiten (+ Küche aus Text), Anfahrt (Kartenfläche ohne Einbettung), Kontakt-Insel, Rechtsseiten, exhaustiver Switch, claimPhotos.

### Task N7+N8: Bewegung, Anbindung, Tests, Audits
- [ ] Ruhige Abend-Bewegung (Muster Klar), `nacht` in SYSTEMS_WITH_MOTION/SYSTEM_MOTION/Islands; Showcases Restaurant/Salon/Unterkunft (fiktiv, 555, `.example`); `systems.spec.ts`, `a11y.spec.ts` (0 Befunde), Lighthouse, `impeccable` + `apple-design` → `docs/designsysteme/nacht/audit.md`, Abnahme-Vorschaubilder.

### Task N9: Abnahme, Freischaltung, Deploy
- [ ] Echte Prod-Seiten (nur lesen) mit Nacht im Triple (Friseure als Alternative, Barbiere) + Muster → Betreiber. **STOP bis Abnahme.** Danach `RELEASED_SYSTEMS` = alle sechs, Gesamtprüfung, Merge, Sicherung, Deploy, Prod-Prüfung, Memory/Doku (Rollback `--system nacht`).
