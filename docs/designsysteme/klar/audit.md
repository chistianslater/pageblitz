# Klar — Design-Audit (K8)

Stand 2026-10-12, Branch `feat/designsystem-klar`. Geprüft mit den Skills
**impeccable** (Audit: Barrierefreiheit, Leistung, Responsiv, Theming,
Umsetzungstreue) und **apple-design** (Rückmeldung, Bewegung, Typografie,
Zurückhaltung, reduzierte Bewegung). Schwerpunkt: ältere Besucherinnen und
Besucher (Schriftgrößen, Tippflächen, Kontrast, Fokus-Reihenfolge).

**Prüfstand:** 375 und 1440 px × Paletten Lind, Wasser, Sand.
- Geprüfte Seiten:
  - Fixture `full` über `/dev/site-preview?system=klar&palette=…`
  - die drei Beispielbetriebe Zahnarztpraxis Dr. Sommer (Lind, großes Foto),
    Physiotherapie Lindner (Sand, schwaches Foto = kleiner Rahmen) und
    Steuerkanzlei Brandt (Wasser, ohne Foto) über `/demo/system/klar/<id>?live=1`
- Werkzeuge:
  - axe-core (alle Schweregrade, nach Durchscrollen, reduzierte Bewegung)
  - Messskript: Tippflächen unter 44 px, Schrift unter 16 px, waagrechter Überlauf
  - impeccable-Detektor (`detect.mjs`)
  - Lighthouse mobil auf dem Prod-Build
  - Sichtprüfung ganzer Seiten (375/768/1024/1440) und der Bewegung im Browser (ohne reduce)

## Ergebnis

| # | Bereich | Note | Kernbefund |
|---|---|---|---|
| 1 | Barrierefreiheit | 4/4 | axe: 0 Befunde jeder Schwere auf allen 12 Prüfseiten. Text ≥ 7:1 in allen drei Paletten (Token-Tests), Fokusring 2 px, `heute` als Wort, Telefon als echter `tel:`-Knopf. |
| 2 | Leistung | 4/4 | Lighthouse mobil: Zahnarzt LCP 2,0 s, Kanzlei LCP 1,8 s, CLS 0, TBT 0 ms, Score 0,99. Einstiegsfoto wird nie per Deckkraft versteckt. |
| 3 | Responsiv | 4/4 | Kein Überlauf 320–1440 px. Nach H1 alle Tippflächen ≥ 44 px, Knöpfe 56 px (Mindesthöhe 48). |
| 4 | Theming | 4/4 | Nur `--sys-*`-Tokens bzw. Vielfache (Linien 1/2 px, Fokus 2 px). Lind/Felder nur als Fläche. |
| 5 | Umsetzungstreue | 4/4 | Entspricht dem Systemblatt (helle Fläche mit Kicker-Pille, Doppelrahmen + Heute-Karte, Zeiten-Karte als Bild ohne Foto, Leistungs-Bento, Schritte, Monogramme, FAQ-Plus, Kartenkachel, tiefer Fuß). Detektor: ein Fehlalarm (Test-Regex `<img[^>` in `content.test.tsx`). |
| **Summe** | | **20/20** | Sehr gut. Hoch und mittel sind behoben. |

**Umsetzungstreue: bestanden.**
- Eigene Handschrift: ruhige Flächen statt Fotos hinter Text, weicher
  Doppelrahmen, Sprechzeiten als Hauptinformation, Fakten nur aus Daten.
- Abgrenzung: keine Riesenschrift und kein Laufband (Plakat), kein Zettel
  und keine Tafel (Werkstoff), keine Rasterlinien (Raster), keine
  Magazin-Serifen (Journal).

## Befunde nach Schwere

### Hoch (behoben)

- **H1 Marke im Kopf am Handy nur 40 px breit.**
  Auf der Startseite steht am Handy nur die Monogramm-Kachel (Name als h1
  darunter); die Tippfläche war 40 × 44 px — unter dem Klar-Ziel 44 px,
  für ältere Hände zu knapp. Behebung (`css.ts`): `.kl-brand`
  `min-width` = Tippmaß (44 px). Messskript danach: keine Fläche unter 44 px.

### Mittel (behoben)

- **M1 Galerie mit fünf Fotos ließ am Desktop ein Waisenbild stehen.**
  `auto-fit` mit 17 rem setzte bei 1440 vier Fotos in eine Zeile und das
  fünfte allein darunter (Zahnarzt, Physio). Behebung (`contentCss.ts`):
  Desktop 6er-Raster — drei je Zeile, 2 und 4 als Paare, 5 = 2 + 3;
  Tablet zwei Spalten, bei ungerader Zahl steht das erste Foto über beide.
  Handy unverändert einspaltig (große Bilder für ältere Augen).
- **M2 Kontakt ohne Zeiten-Karte ließ am Desktop die rechte Hälfte leer.**
  Steht die Zeiten-Tabelle schon im Einstieg (Kanzlei ohne Foto), blieb im
  Kontakt nur die Ortskarte in halber Breite. Behebung (`contentCss.ts`):
  dann Kartenkachel links (7) und Anschrift/Wege rechts (5) über die volle
  Breite. Handy unverändert.

### Vor-Abnahme-Feinschliff (behoben, nach Probe mit echter Seite 593)

- **V1 Kicker-Pille begann eine Folgezeile mit „·“** („Steuerkanzlei Brandt /
  · Steuerberater …“). Behebung: Pille als Fließtext statt Flex-Zeilen,
  geschütztes Leerzeichen vor „·“ (`pillTail`) — der Trenner bleibt am Namen.
- **V2 Kartenkachel mit leerer hellgrüner Fläche oben links.** Behebung:
  Park füllt den Block rechts oben zwischen Allee und Querstraße (mit
  Baumpunkten), die Querstraße liegt unter der Nadelspitze.
- **V3 Zeiten-Karte neben dem kleinen Foto am Desktop zu leer.** Behebung:
  ab 900 px so hoch wie ihr Inhalt, unten bündig zum Foto.
- **V4 Handy-Leiste mit gebautem Bundle geprüft:** im ersten Bildschirm
  ausgeblendet (Einstiegsknöpfe sichtbar), nach dem Scrollen sichtbar —
  mit und ohne reduzierte Bewegung.

### Niedrig (offen, bewusst)

- **N2 Galerie am Handy einspaltig** — fünf Fotos ergeben eine lange
  Strecke. Bewusst: große Bilder statt kleiner Kacheln für ältere Augen.
- **N3 Über uns ohne Foto** lässt am Desktop rechts Luft (Kanzlei). Hält
  die Zeilenlänge lesbar (`measure`), keine Änderung.
- **N4 Reduzierte Bewegung schaltet alles ab.** Das Systemblatt nennt
  „150 ms Einblenden“ — Einblenden bräuchte Startzustände, die es dort
  nicht geben darf (Wächter-Test). Ohne Bewegung ist die Seite ebenso
  vollständig.
- **N5 Ziffer Null mit Schrägstrich** (Atkinson Hyperlegible Next) wirkt in
  Verkleinerungen wie durchgestrichen; in Originalgröße eindeutig und für
  Sehschwache gewollt (0/O-Unterscheidung).
- **N6 „Bitte mitbringen“ und „Mehr dazu“** aus dem Systemblatt fehlen
  (keine Datenfelder) — bräuchte ein Schema-Feld (aus K4–K6).

## Ältere Besucher: Einzelprüfung

- **Schriftgrößen:** Fließtext 1,125–1,25 rem, kleinste Stufe 1 rem (Messskript:
  keine Schrift unter 16 px auf allen Prüfseiten). Zeilenhöhe 1,6.
- **Tippflächen:** Knöpfe 56 px, Kopf-Knöpfe/Pillen 48 px, Links in Fuß,
  Kontakt, Navigation ≥ 44 px; Handy-Leiste mit Anrufen + Termin.
- **Kontrast:** Text ≥ 7:1 in allen Paletten, auch Grau auf Feldern
  (Token-Tests, axe 0).
- **Fokus-Reihenfolge:** Kopf → Einstieg (Hauptknopf, Nebenknopf) →
  Abschnitte in Lesereihenfolge → Fuß → Handy-Leiste. Fokusring 2 px in
  Tinte, im Fuß hell. FAQ als `details`/`summary` (Tastatur ohne Script).
- **Zeiten:** „heute“ als Wort in einer Pille, nicht nur Farbe; Mittagspause
  in zwei Zeilen; geschlossene Tage gesammelt.

## apple-design: Bewegung und Rückmeldung

- **Rückmeldung sofort:** Knöpfe `scale(.97)` beim Drücken (160 ms), Hover nur bei `(hover: hover)`.
- **Zurückhaltung:** nur einmalige, kurze Bewegungen — Einstieg 12 px / 320 ms / 60 ms Abstand, Abschnitte 16 px / 360 ms einmal, FAQ-Antwort blendet ein (keine Höhe), Plus dreht 45°. Eine Kurve `cubic-bezier(.23,1,.32,1)`, keine Federn mit Überschwingen, kein Karussell, kein Parallax, keine Dauerschleife.
- **LCP geschützt:** Das Foto im Rahmen öffnet sich per `clip-path` von 8 % auf voll (520 ms) und ist nie unsichtbar; Startzustände erst nach dem ersten Frame (`data-kl-ready`).
- **Räumlich stimmig:** Heute-Karte kommt 160 ms nach dem Foto von unten (8 px) — sie „setzt sich“ auf den Rahmen, aus dem sie kommt.
- **Ohne Script / reduce / Druck:** alles sichtbar; Startzustände nur unter `@media screen and (prefers-reduced-motion: no-preference)`.
- **Typografie:** DM Sans für Überschriften mit negativer Laufweite nach Größe (−0,028 em Display, −0,012 em h3), Atkinson Hyperlegible Next für Text mit 0 Laufweite und `text-wrap: pretty`.

## Prüfwerte

| Seite | 375 | 1440 |
|---|---|---|
| Fixture Lind / Wasser / Sand | axe 0, Überlauf 0 | axe 0, Überlauf 0 |
| Zahnarztpraxis Dr. Sommer (Lind) | axe 0, Überlauf 0 | axe 0, Überlauf 0 |
| Physiotherapie Lindner (Sand) | axe 0, Überlauf 0 | axe 0, Überlauf 0 |
| Steuerkanzlei Brandt (Wasser) | axe 0, Überlauf 0 | axe 0, Überlauf 0 |

Lighthouse (mobil, Prod-Build, `?live=1`): Zahnarzt 0,99 · LCP 2,0 s · CLS 0 · TBT 0 ms;
Kanzlei 0,99 · LCP 1,8 s · CLS 0 · TBT 0 ms.

Abnahme-Vorschaubilder: `docs/designsysteme/klar/abnahme-vorschau/`.
