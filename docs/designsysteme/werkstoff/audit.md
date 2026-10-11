# Werkstoff — Design-Audit (W8)

Stand 2026-10-11, Branch `feat/designsystem-werkstoff`. Geprüft mit den Skills
**impeccable** (Audit: Barrierefreiheit, Leistung, Responsiv, Theming,
Umsetzungstreue) und **apple-design** (Rückmeldung, Bewegung, Typografie,
Zurückhaltung, reduzierte Bewegung).

**Prüfstand:** 375 und 1440 px × Paletten Kiefer, Leinen, Ton.
- Geprüfte Seiten:
  - Fixture `full` über `/dev/site-preview?system=werkstoff`
  - die drei Beispielbetriebe Schreinerei (Kiefer), Bäckerei (Ton) und Laden (Leinen) über `/demo/system/werkstoff/<id>?live=1`
- Werkzeuge:
  - axe-core (alle Schweregrade)
  - Messskript für Tippflächen, Schriftgrößen und Überlauf
  - impeccable-Detektor
  - Lighthouse mobil auf dem Prod-Build
  - Sichtprüfung ganzer Seiten

## Ergebnis

| # | Bereich | Note | Kernbefund |
|---|---|---|---|
| 1 | Barrierefreiheit | 4/4 | axe: 0 Verstöße auf allen 12 Prüfseiten (auch moderate/minor). Fokus 2 px. |
| 2 | Leistung | 4/4 | LCP 2,2 s (Schreinerei) und 2,4 s (Bäckerei), CLS 0, TBT 0 ms. Die Werte gelten erst nach der Behebung von M1. |
| 3 | Responsiv | 4/4 | Kein Überlauf zwischen 320 und 1440 px. Tippflächen ≥ 44 px, nach der Behebung von N1 auch in der Desktop-Navigation. |
| 4 | Theming | 4/4 | Nur `--sys-*`-Tokens. Haarlinien 1 px. Alle drei Paletten bestehen den Kontrasttest (AA). |
| 5 | Umsetzungstreue | 4/4 | Entspricht dem Systemblatt (Zettel, Tafel, Zeitleiste, Werkbank-Raster, Fuß). Keine Vorlagen-Muster. Detektor ohne Fund. |
| **Summe** | | **20/20** | Sehr gut. Hoch und mittel sind behoben. |

**Umsetzungstreue: bestanden.**
- Die Seiten tragen eine eigene, gewerbliche Handschrift:
  - Slab-Überschriften
  - Mono-Zettel mit echten Daten
  - Tafel in Signal
  - warmes Papier
  - dunkel nur im Fuß
- Keine Kartenraster von der Stange, kein Verlauf und kein generischer Einstieg.
- Der impeccable-Detektor lief nur im Rückfallmodus (Parser-Module fehlen) und meldete keinen Fund. Das ist eine Unterzählung, keine Freigabe. Die Prüfung oben ersetzt ihn.

## Befunde nach Schwere

### Hoch

Keine.

### Mittel (behoben)

**M1 · Einstiegsfoto am Handy zu groß (Leistung, LCP).**
- Befund: Am Handy wurde das 1400-px-Bild geladen und vorgeladen. Damit lag die Bäckerei bei LCP 2,53 s, also über dem Ziel von 2,5 s.
- Behebung: Unsplash-Fotos bekommen `srcset` (640/960/1400) und `sizes`. React lädt das passende Bild mit `imagesrcset` vor. Kundenfotos aus anderen Quellen bleiben unverändert.
- Ergebnis: LCP 2,20 s (Schreinerei) und 2,38 s (Bäckerei).
- Datei: `Entry.tsx` (`entrySrcSet`), Test in `entry.test.tsx`.

**M2 · Fragen-Zeichen drehte das ganze Kästchen (Bewegung).**
- Befund: Die erste W7-Fassung drehte das Plus-Kästchen um 45°. Es stand dann auf der Spitze und wirkte wie ein Fehler.
- Behebung: Der senkrechte Strich dreht in 200 ms zum Minus, das Kästchen bleibt gerade. So zeigt es das abgenommene Systemblatt-Bild („−", Signalfläche).
- Datei: `visitCss.ts`.
- Hinweis zur Abnahme: Das Blatt schreibt im Text „Plus dreht 45°", zeigt im Bild aber ein Minus. Umgesetzt ist das Bild.

**M3 · Raster-Rechtsseiten: Generator-Fußzeile zu hell (Barrierefreiheit, gewollte Raster-Änderung).**
- Befund: Der Rechtstext-Generator färbt seinen Fuß inline mit `#9ca3af` und den Link mit `#6b7280`. Auf Papier liegt das unter AA, auf Kohle ist es kaum lesbar. Die Inline-Farbe schlug auch die Linkregel.
- Behebung: Wie bei Werkstoff.
  - `.rs-legal [style*="color"]` → `--sys-muted` (mit `!important` gegen Inline-Farben)
  - Trennlinie in `--sys-rule`
- Gemessen:
  - Kohle: Text rgb(162,162,158) auf rgb(20,20,20), etwa 7,5:1
  - Papier: rgb(91,90,86) auf rgb(241,240,236)
- Datei: `raster/visitCss.ts`, Test in `raster/visit.test.tsx`.
- Raster-Baselines decken keine Rechtsseiten ab, daher war kein Bild-Update nötig.

### Niedrig (behoben)

**N1 · Desktop-Navigation: kurze Einträge schmaler als 44 px.**
- Befund: „FAQ" war 26 × 44 px groß, „Preise" 43 × 44 px.
- Behebung: Die Links bekommen eine Mindestbreite gleich der Tippfläche und werden zentriert.
- Datei: `css.ts`.

**N2 · Gewerk unter dem Namen im Kopf zu klein.**
- Befund: Mono in Versalien war am Handy 11 px groß.
- Behebung: mindestens 0,8 × `small`, das sind 12 px.
- Datei: `css.ts`.

### Niedrig (offen, Entscheidung Betreiber)

**O1 · Bauplan-Reihenfolge Gastro.**
- Befund: Der Bauplan `gastro` kennt `process` und `pricelist` nicht in seiner Reihenfolge. Auf echten Bäckerei-Seiten stehen Backtag und Wochentafel deshalb hinter „Besuch". Das Systemblatt zeigt sie direkt nach dem Einstieg.
- Die Beispielseite bildet bewusst das echte Verhalten ab.
- Vorschlag: `order` im Gastro-Bauplan um `process` und `pricelist` ergänzen. Das ist eine systemübergreifende Änderung (auch Journal), daher nicht in W8.

**O2 · Reduzierte Bewegung.**
- Befund: Das Systemblatt sieht „nur Deckkraft 150 ms" vor. Umgesetzt ist „alles aus" (Inhalte sofort sichtbar, wie bei Journal und Raster).
- Funktional gleichwertig. Ein Überblenden bringt hier keinen Erkenntnisgewinn.

**O3 · Sprung über Anker.**
- Befund: Wer per Navigation weit springt, überspringt Abschnitte. Diese erscheinen erst, wenn man zurückscrollt. Dabei gibt es kein Ausblenden, sie werden nur später aufgedeckt.
- Gleiches Verhalten wie bei Raster und Journal.

## apple-design-Sicht

**Rückmeldung**
- Knöpfe reagieren auf `:active` mit `scale(.97)` in 140 ms.
- Hover gibt es nur bei `(hover: hover)`: Der Pfeil der Leistungszeile rückt 4 px.
- Die Handy-Leiste steht von Anfang an. Kein Ein- und Ausfahren beim Scrollen.

**Bewegung**
- Es gibt nur eine Kurve: `cubic-bezier(.23,1,.32,1)`.
- Animiert werden nur `transform`, `opacity` und `clip-path`.
- Einmal-Aufdecken:
  - Einstieg: die Überschrift wird in 560 ms freigelegt, der Zettel folgt 120 ms später.
  - Ziffern 1·2·3: gestaffelt um 80 ms.
  - Zeitleiste: rückt leicht von rechts nach, in Wischrichtung.
- Keine Endlos-Schleifen, kein Scroll-Hijack, kein Autoplay.
- Startzustände stehen nur unter `[data-ws-ready]` und `no-preference`. Ein Wächtertest schlägt fehl, wenn sie herauslaufen.
- Fotos werden nie versteckt oder bewegt (LCP).

**Typografie**
- Slab mit negativer Laufweite in Groß, Karla für den Text, Mono nur für Daten.
- Lesebreite 36 rem.
- Stufen über `--sys-*`, Abstände in rem.

**Zurückhaltung**
- Es gibt eine Signalfarbe je Palette, sie steht nur auf Handlungen und auf der Tafel.
- `deep` erscheint nur im Fuß.

## Messwerte

**Lighthouse mobil** (Prod-Build, `?live=1`, je drei Läufe):
- Schreinerei: LCP 2,20 s, CLS 0, FCP 1,2 s, TBT 0, Leistung 0,99
- Bäckerei: LCP 2,38 s, CLS 0, FCP 1,2 s, TBT 0, Leistung 0,98

**axe:** 0 Funde auf allen 12 Prüfseiten (375 und 1440). Dazu kommt `a11y.spec.ts`: Werkstoff × 3 Paletten × 390/1440 plus die drei Beispiele, alles grün.

**Überlauf:** 0 px auf allen Prüfseiten. Dazu kommt `systems.spec.ts`: 3 Paletten × full/minimal × 320/375/768/1024/1440.
