# Nacht — Design-Audit (N7+N8)

Stand 2026-10-12, Branch `feat/designsystem-nacht`. Geprüft mit den Skills
**impeccable** (Audit: Barrierefreiheit, Leistung, Responsiv, Theming,
Umsetzungstreue) und **apple-design** (Rückmeldung, Bewegung, Materialien,
Typografie, reduzierte Bewegung/Transparenz). Schwerpunkt: dunkles Papier —
Kontrast überall geprüft, Fokus sichtbar auf Dunkel, Fotos lesbar.

**Prüfstand:** 320/375/390/768/1024/1440 px × Paletten Petrol, Pflaume, Nachtblau.
- Geprüfte Seiten:
  - Fixture `full`/`minimal` über `/dev/site-preview?system=nacht&palette=…`
  - die drei Beispielbetriebe Restaurant Weinberg (Petrol, großes Abendfoto),
    Salon Noir (Pflaume, kleines Hochformat neben der Ziffer 21) und Pension
    Haus am See (Nachtblau, ohne Foto) über `/demo/system/nacht/<id>?live=1`
  - Chat- und Termin-Insel über `fixture=features` (Knöpfe, offene Panels, Fokus)
- Werkzeuge:
  - axe-core (alle Schweregrade, nach Durchscrollen, reduzierte Bewegung)
  - Messskript: Tippflächen unter 44 px, Schrift unter 16 px, waagrechter Überlauf,
    Wörter des Namens, die mitten im Wort umbrechen
  - impeccable-Detektor (`detect.mjs`)
  - Lighthouse mobil auf dem Prod-Build (je drei Läufe)
  - Sichtprüfung ganzer Seiten und der Bewegung im Browser (ohne reduce),
    Handy-Leiste bei 390 px mit gebautem Bundle

## Ergebnis

| # | Bereich | Note | Kernbefund |
|---|---|---|---|
| 1 | Barrierefreiheit | 4/4 | axe: 0 Befunde jeder Schwere auf allen 12 Prüfseiten (nach Behebung H2). Fließtext ≥ 7:1 auf Papier/Fläche/Band, Kupfer ≥ 4,5, Insel-Panels ≥ 7 (Token-Tests). Fokusring 2 px in Tinte, im Band/Fuß hell; jetzt auch in Chat/Termin. |
| 2 | Leistung | 4/4 | Lighthouse mobil: Weinberg LCP 2,1–2,4 s, Noir 2,2–2,5 s, Haus am See 1,4–1,5 s; CLS 0, TBT 0 ms, Leistung 0,98–1,0, A11y 1,0. Einstiegsfoto (LCP) nie versteckt. |
| 3 | Responsiv | 4/4 | Kein Überlauf 320–1440 px. Alle Tippflächen ≥ 44 px (nach M2), Knöpfe 56 px, Leiste 52 px. Name bricht nie mitten im Wort (nach H1). |
| 4 | Theming | 4/4 | Nur `--sys-*`-Tokens bzw. Vielfache; freie em/vw in `contentCss` ersetzt. Einzige `--pb-*`-Nutzung bleibt im geteilten Insel-Grund-CSS. |
| 5 | Umsetzungstreue | 4/4 | Entspricht dem Systemblatt (Abendfoto mit Verlauf, Kupferziffer, Küchenspalte nur aus dem Text, tiefes Reservierungs-Band, Kartenkachel ohne Einbettung). Detektor: drei Fehlalarme (Test-Regex `<img[^>` in `content.test.tsx`). |
| **Summe** | | **20/20** | Sehr gut. Hoch und mittel sind behoben. |

**Umsetzungstreue: bestanden.**
- Eigene Handschrift: dunkles warmes Papier, Gilda-Versalien in Kupfer, eine
  große Kupferziffer nur aus echten Werten, Fotos gedunkelt mit Schleier.
- Abgrenzung: keine Riesen-Plakatschrift und kein Laufband (Plakat), keine
  hellen Flächen mit Pille (Klar), keine Rasterlinien (Raster), kein Zettel
  (Werkstoff), keine Magazin-Spalten auf Papierweiß (Journal).

## Befunde nach Schwere

### Hoch (behoben)

- **H1 Name brach bei 320 px mitten im Wort** („NOIR HAARSTUDI / O") in den
  Fassungen ohne großes Foto — `overflow-wrap:anywhere` bei Display-Stufe
  44 px. Behebung (`Entry.tsx`, `entryCss.ts`): das längste Wort des Namens
  steht als `--nc-word` am Titel, die Schrift ist höchstens
  Titelbreite (`100cqi`) / Zeichen / 0,8 em. Messskript: kein Wort bricht,
  320–1440, alle Beispiele und Fixtures.
- **H2 Geisterwort der Kupferziffer als Kontrastfehler** (axe serious auf
  Weinberg „Gerichte" und Haus am See „Angebote"). Das Wort ist Zierde mit
  9 % Deckkraft und `aria-hidden`. Behebung: als `::before`-Inhalt aus
  `data-word` — kein Text im Dokument mehr, Gestalt unverändert.
- **H3 Insel-Knöpfe lagen auf der Handy-Leiste** (Chat-Knopf verdeckte den
  Termin-Knopf der Leiste bei 390 px) und Fehlermeldungen standen in Rot auf
  Dunkel (unlesbar). Behebung (`islandCss.ts`): Knöpfe unter 48 rem über der
  Leiste, Meldungen in Tinte mit Kupferstrich, Panel-Fokus 2 px in Tinte
  statt Browser-Blau, Schließen ≥ 44 px.

### Mittel (behoben)

- **M1 LCP Salon Noir bis 2,9 s.** Das 180 px breite Hochformat lud 640 px
  (130 kB). Behebung: kleine Fotos mit eigenen Breiten (360–1280) und
  `sizes`, Einstiegsfoto zusätzlich 828 px; Galerie, Bildpaar und Porträts
  ebenso. Danach 2,2–2,5 s.
- **M2 Navigationspunkt „FAQ" 38 px breit** (Haus am See, Desktop).
  Behebung: Mindestbreite der Tippfläche (44 px) für Navigationslinks.
- **M3 Zählwort passte nicht zur Branche / doppelt zum Titel** (aus der
  N4–N6-Prüfung): „4 LEISTUNGEN" über „LEISTUNGEN", Getränkekarte als
  „Leistungen". Behebung: Geisterwort entfällt, wenn der Titel so heißt;
  `openerWord` nach Abschnitt und Branche.

### Niedrig (behoben)

- **N1 Leere Listen** (Leistungen, Ablauf, Zahlen, Team, Gut zu wissen,
  Partner) erzeugten ein Kapitel nur aus Überschrift samt Anker — jetzt
  entfallen Kapitel und Anker.
- **N2 Bildpaar ohne Alt-Text** — übernimmt jetzt den Alt-Text der Galerie.
- **N3 Leiste bei „weniger Transparenz"** (apple-design, Materialien):
  `prefers-reduced-transparency` macht sie zur vollen tiefen Fläche.
- **N4 Fokus vor dem Hereinscrollen:** ein Kapitel mit Tastaturfokus ist
  sofort sichtbar, auch wenn es noch im unteren Rand (-15 %) liegt.

### Niedrig (offen, bewusst)

- **O1 Kicker-Stufe 15 px** (Versalien, Laufweite 0,16 em) liegt unter
  16 px. Systemblatt-Wert; Versalien mit Sperrung lesen sich größer. Alle
  übrigen Texte ≥ 16 px.
- **O2 Reduzierte Bewegung schaltet alles ab** (keine Startzustände), wie
  Klar. Ohne Bewegung ist die Seite vollständig.
- **O3 Hauptknopf „Termin anfragen" ruft an** (Salon Noir ohne
  Buchungslink): Reihenfolge wie Klar (Buchungslink, sonst Telefon). Die
  Beschriftung kommt aus dem geteilten `callLabel` (shared/actions.ts), den
  Nacht genauso nutzt wie Klar: eine eigene Beschriftung bleibt, wenn sie
  den Anruf schon trägt — „Termin anfragen" passt auf /termin/ und bleibt
  darum stehen; das Telefon-Symbol zeigt den Weg.
- **O4 Kapitel steigen 900 ms** (Systemblatt). Länger als Klar (360 ms),
  gewollt ruhig; blockiert nichts, Fokus und Links sind sofort bedienbar.

## Dunkles Papier: Einzelprüfung

- **Kontrast:** Tinte/Papier 12,7–14,8, Gedämpft/Papier 9,1–9,9, Kupfer ≥ 7,2;
  Insel-Panel (Papier 92 % + Tinte): Text ≥ 7, Gedämpft ≥ 4,5, Schrift auf
  Kupfer ≥ 4,5 (`island.test.ts`).
- **Fotos:** Filter + Schleier 22 % + Verlauf; Text nur über dem Verlauf
  (Worst-Case weißes Pixel, `contrast.test.ts`).
- **Fokus:** 2 px in Tinte, im Band und Fuß in `onDeep`, in Chat/Termin-Panels
  in Tinte; Formularfelder mit Rand in Gedämpft (≥ 3:1).
- **Leiste:** Anrufen + Hauptweg; blendet aus, solange Einstiegs-, Anfahrts-
  oder Fuß-Knöpfe sichtbar sind (dockAutoHide, bei 390 px im Browser geprüft).

## apple-design: Bewegung und Rückmeldung

- **Rückmeldung sofort:** Knöpfe `scale(.97)` beim Drücken (160 ms), Pfeil
  3 px bei Hover nur mit `(hover: hover)`.
- **Zurückhaltung:** nur einmalige Bewegung — Foto setzt sich von 106 % auf
  100 % (1,6 s), Name deckt sich per clip-path von unten auf (1,1 s, 150 ms
  später), Kapitel 24 px / 900 ms einmal. Eine Kurve
  `cubic-bezier(.23,1,.32,1)`, kein Überschwingen, kein Ken-Burns, kein
  Karussell, keine Dauerschleife; Leiste fest ohne Animation.
- **LCP geschützt:** Das Einstiegsfoto wird nur skaliert, nie per Deckkraft
  oder Ausschnitt versteckt; Startzustände erst nach dem ersten Frame
  (`data-nc-ready`), nur am Bildschirm, nur ohne reduzierte Bewegung.
- **Materialien:** Leiste als dunkles Glas (86 % Tiefe + Unschärfe), bei
  `prefers-reduced-transparency` solide.
- **Typografie:** Gilda Display für Namen/Titel in Versalien mit leichter
  Sperrung, Jost für Text mit Laufweite nahe 0; Tabellenziffern für Preise
  und Zeiten.

## Prüfwerte

| Seite | 375/390 | 1440 |
|---|---|---|
| Fixture Petrol / Pflaume / Nachtblau | axe 0, Überlauf 0 | axe 0, Überlauf 0 |
| Restaurant Weinberg (Petrol) | axe 0, Überlauf 0 | axe 0, Überlauf 0 |
| Salon Noir (Pflaume) | axe 0, Überlauf 0 | axe 0, Überlauf 0 |
| Pension Haus am See (Nachtblau) | axe 0, Überlauf 0 | axe 0, Überlauf 0 |

Lighthouse (mobil, Prod-Build, `?live=1`, je drei Läufe nach M1):
Weinberg 0,98–0,99 · LCP 2,1–2,4 s · CLS 0 · TBT 0 ms · A11y 1,0;
Salon Noir 0,98–0,99 · LCP 2,2–2,5 s · CLS 0 · TBT 0 ms · A11y 1,0;
Haus am See 1,0 · LCP 1,4–1,5 s · CLS 0 · TBT 0 ms · A11y 1,0.
(SEO 0,66–0,69 und Best Practices 0,96 nur wegen `noindex` der Demo-Seiten
und fehlendem `favicon.ico` auf localhost.)

Abnahme-Vorschaubilder: `docs/designsysteme/nacht/abnahme-*.jpg`
(je Beispiel Handy erster Bildschirm 2×, Handy ganz, Desktop erster
Bildschirm, Desktop ganz).
