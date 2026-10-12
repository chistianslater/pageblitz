# Plakat — Design-Audit (P8)

Stand 2026-10-12, Branch `feat/designsystem-plakat`. Geprüft mit den Skills
**impeccable** (Audit: Barrierefreiheit, Leistung, Responsiv, Theming,
Umsetzungstreue) und **apple-design** (Rückmeldung, Bewegung, Typografie,
Zurückhaltung, reduzierte Bewegung).

**Prüfstand:** 375 und 1440 px × Paletten Kante, Senf, Puls.
- Geprüfte Seiten:
  - Fixture `full` über `/dev/site-preview?system=plakat&palette=…`
  - die drei Beispielbetriebe Kante Barbershop (Kante), Döner Ecke (Senf) und Studio Puls ohne Foto (Puls) über `/demo/system/plakat/<id>?live=1`
- Werkzeuge:
  - axe-core (alle Schweregrade, nach Durchscrollen)
  - Messskript für Tippflächen, Schriftgrößen unter 12 px und Überlauf
  - impeccable-Detektor (`detect.mjs`)
  - Lighthouse mobil auf dem Prod-Build
  - Sichtprüfung ganzer Seiten (reduzierte Bewegung = Endzustand) und der Bewegung im Browser (ohne reduce, ohne Script)

## Ergebnis

| # | Bereich | Note | Kernbefund |
|---|---|---|---|
| 1 | Barrierefreiheit | 4/4 | axe: 0 Verstöße auf allen 12 Prüfseiten (auch moderate/minor). Fokus 2 px. Laufband mit Pause-Knopf (WCAG 2.2.2), 44 × 44 px, `aria-pressed`. |
| 2 | Leistung | 4/4 | Lighthouse mobil: Kante LCP 2,2 s, Döner Ecke LCP 2,2 s, CLS 0, TBT 0 ms, Score 0,99. Einstiegsfoto mit `srcset` (seit P2/P3), wird nie versteckt. |
| 3 | Responsiv | 4/4 | Kein Überlauf 320–1440 px. Tippflächen ≥ 44 px, Dock-Knöpfe 48 px. Nach N1 bricht die Dock-Hauptaktion bei 375 nicht mehr um. |
| 4 | Theming | 4/4 | Nur `--sys-*`-Tokens (Linien 1/2 px, Fokus 2 px). Felder je Palette mit Kontrast ≥ 4,5 (P1). |
| 5 | Umsetzungstreue | 4/4 | Entspricht dem Systemblatt (Felder-Rhythmus, Riesenschrift in Staffel, Bogen/Kreis/Pille im Duoton, Sticker, Laufband, Dock). Detektor: nur zwei Fehlalarme in Test-Regex (`content.test.tsx`). |
| **Summe** | | **20/20** | Sehr gut. Hoch und mittel sind behoben. |

**Umsetzungstreue: bestanden.**
- Eigene Handschrift: League Gothic in Plakatzeilen, Farbfelder statt Karten, Fotos nur in Formen und im Duoton, runder Sticker mit echtem Fakt, ein Laufband.
- Abgrenzung zu Werkstoff klar: kein Zettel, keine Tafel, keine Slab; Felder, Formen und Sticker tragen.

## Befunde nach Schwere

### Hoch

Keine.

### Mittel (behoben)

- **M1 Galerie mit genau zwei Fotos nutzte am Desktop nur 7 von 12 Spalten.**
  Rechts blieb ein Drittel leer (offen seit P4–P6).
  Behebung (`contentCss.ts`): Zweiergruppe = Pille 5 + Bogen 7 Spalten,
  Pille 3:4, Bogen 1:1 — beide Formen etwa gleich hoch, volle Breite.
  Sichtbar bei Kante (5 Fotos → 3 + 2) und Fixture `full` (1024/1440).
- **M2 Schrift-Einstieg ohne Foto ließ am Desktop die halbe Fläche leer.**
  Studio Puls 1440: „Kurse ab 6:30“ endete bei 650 px, rechts nur der
  Sticker. Behebung (`entryCss.ts`): ohne Foto ab 900 px eine Stufe größer
  (`display-size × 1,35`), bricht als Plakatzeilen um. Handy unverändert.
- **N1 Dock: „Probetraining vereinbaren“ brach bei 375 px zweizeilig um.**
  Zwei Zeilen in der 48-px-Pille wirken gequetscht. Behebung
  (`entryCss.ts`): Spalten `auto | 1fr` statt `1fr | 1,25fr` — der
  Neben-Weg („Anrufen“, „Route“) nimmt nur seine Breite, die Hauptaktion
  den Rest (232 px bei 375). Bei 320 px darf sie weiter umbrechen.

### Niedrig (offen, bewusst)

- **N2 Fuß-Wortmarke kurzer Namen füllt am Desktop die Breite nicht.**
  „KANTE“ bei 1440 etwa ein Drittel der Breite; die Größe ist bei
  `figure-size × 1,02` gedeckelt (P2/P3). Bleibt, um das Systemblatt nicht
  zu verändern — bei der Abnahme ansprechen.
- **N3 Laufband mit nur zwei Einträgen wiederholt sich schnell.**
  Döner Ecke hat (wie jede frische Gastro-Seite) keine Leistungen; das
  Band zeigt Straße und Zeiten. Daten-Thema, kein Gestaltungsfehler.
- **N4 Fakten-Leiste am Desktop mit drei statt vier Einträgen** lässt die
  vierte Spalte frei. Hält das Raster ruhig; keine Änderung.
- **N5 Reduzierte Bewegung schaltet alles ab** (wie Werkstoff). Das
  Systemblatt nennt für den Einstieg „150 ms Deckkraft“ — ohne Bewegung ist
  die Seite ebenso vollständig; Abweichung bewusst klein gehalten.

## apple-design: Bewegung und Rückmeldung

- **Rückmeldung sofort:** Knöpfe `scale(.97)` beim Drücken (160 ms), innerer Kreis rückt bei Hover 2 px — nur `hover:hover`.
- **Zurückhaltung:** Einmal-Bewegungen (Zeilen 600 ms, 70 ms Versatz; Formen 700 ms; Sticker 420 ms ohne Überschwingen, kein Dauerdrehen). Eine Kurve `cubic-bezier(.23,1,.32,1)`; nur transform, opacity, clip-path.
- **LCP geschützt:** Das Einstiegsfoto wird nicht beschnitten oder ausgeblendet, es setzt sich nur (scale 1,06 → 1). Startzustände erst nach dem ersten Frame (`data-pk-ready`).
- **Unterbrechbar:** Abschnitts-Einblendung als Transition; das Laufband hält bei Hover über dem Band und per Knopf. Der Knopf hält seinen Namen „Laufband anhalten“, `aria-pressed` trägt den Zustand, der Tooltip wechselt auf „Laufband abspielen“ (kein doppelter Zustand für Vorleser).
- **Ohne Script / reduce:** alles sichtbar, Band still (erste Runde), Knopf unsichtbar. Beim Drucken nie versteckt (`@media screen`).
- **Typografie:** League Gothic mit eigener Breite je Stufe (`font-stretch`), Zeilenhöhe ≥ 0,88 für Umlautpunkte, ẞ in Versalien; Fließtext Hanken Grotesk, `text-wrap: pretty`.

## Prüfwerte

| Seite | 375 | 1440 |
|---|---|---|
| Fixture Kante / Senf / Puls | axe 0, Überlauf 0 | axe 0, Überlauf 0 |
| Kante Barbershop | axe 0, Überlauf 0 | axe 0, Überlauf 0 |
| Döner Ecke | axe 0, Überlauf 0 | axe 0, Überlauf 0 |
| Studio Puls | axe 0, Überlauf 0 | axe 0, Überlauf 0 |

Lighthouse (mobil, Prod-Build, `?live=1`): Kante 0,99 · LCP 2,2 s · CLS 0;
Döner Ecke 0,99 · LCP 2,2 s · CLS 0.

Abnahme-Vorschaubilder: `docs/designsysteme/plakat/abnahme-vorschau/`.
