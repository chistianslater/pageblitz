# Freundlich — Design-Audit (F4)

Stand 2026-10-13, Branch `feat/designsystem-freundlich`. Geprüft mit den
Skills **impeccable** (Audit: Barrierefreiheit, Leistung, Responsiv, Theming,
Umsetzungstreue) und **apple-design** (Rückmeldung, Bewegung, Feder,
reduzierte Bewegung). Schwerpunkt: Pastellflächen — Kontrast überall geprüft,
Fokus sichtbar auf Pastell, ein einziger Federmoment.

**Prüfstand:** 320/375/390/768/1024/1440 px × Paletten Wald, Himmel, Beere.

Geprüfte Seiten:
- Fixture `full`/`minimal` über `/dev/site-preview?system=freundlich&palette=…`
- die drei Beispielbetriebe über `/demo/system/freundlich/<id>?live=1`:
  - Kita Pusteblume (Wald, ohne Foto)
  - Fellfreunde (Himmel, gutes Foto auf der Bühne)
  - Gelato Mio (Beere, schwaches Foto klein)
- dazu Musikschule Tonleiter (Himmel)
- Chat- und Termin-Insel über `fixture=features`: Knöpfe, offenes Panel, Fokus

Werkzeuge:
- axe-core: alle Schweregrade, nach Durchscrollen, reduzierte Bewegung
- Messskript: Tippflächen unter 44 px, Schrift unter 16 px, waagrechter Überlauf
- impeccable-Detektor (`detect.mjs`)
- Lighthouse mobil auf dem Prod-Build (je drei Läufe, nach dem Feinschliff ein vierter)
- Sichtprüfung im Browser:
  - ganze Seiten
  - Bewegung ohne reduce
  - Handy-Leiste bei 390 px mit gebautem Bundle

## Ergebnis

| # | Bereich | Note | Kernbefund |
|---|---|---|---|
| 1 | Barrierefreiheit | 4/4 | axe: 0 Befunde jeder Schwere auf 13 Prüfseiten (3 Paletten + 3 Betriebe × Desktop/Handy, Unterseite). Fließtext ≥ 7:1 auf Papier, Band und allen 12 Pastellen; Angebots-/Zeilentext jetzt in Pastell-Tinte (≥ 7 statt 6,94). Fokus 3 px Akzent, auf Tief hell, auch in Chat/Termin. |
| 2 | Leistung | 4/4 | Lighthouse mobil: Kita LCP 1,35–1,51 s, Fellfreunde 1,85–1,86 s, Gelato 1,35–1,44 s; CLS 0, TBT 0 ms, Leistung 1,0, A11y 1,0. Einstiegsfoto (LCP) nie versteckt — die Feder bewegt nur `transform`. |
| 3 | Responsiv | 4/4 | Kein Überlauf 320–1440 px. Alle Tippflächen ≥ 44 px, Knöpfe 56 px, Leiste 48 px. Nach M1 keine Schrift unter 16 px. |
| 4 | Theming | 4/4 | Nur `--sys-*`-Tokens bzw. Vielfache; Ausnahmen 1/1,5-px-Linien und der 3-px-Fokus. Bewegung ohne feste Pixel. |
| 5 | Umsetzungstreue | 4/4 | Entspricht dem Systemblatt 8 (ein Federmoment, 16 px Aufstieg, Knopf hebt 2/sinkt 3 px, Farbkarte −4 px/−0,6° nur mit Maus). Detektor: 5 Treffer, alle eingeordnet (s. u.). |
| **Summe** | | **20/20** | Sehr gut. Mittel und gering sind behoben bzw. bewusst so. |

**Umsetzungstreue: bestanden.**
- Eigene Handschrift:
  - Pastellflächen mit Wolkenkante
  - Druckkante an Knöpfen und Kacheln
  - Bricolage in zwei Tönen
  - weiche, runde Fotos
  - ein einziger Federmoment
- Abgrenzung zu den sechs Live-Systemen:
  - keine dunkle Fläche als Grund (Nacht)
  - keine Versalien und kein Laufband (Plakat)
  - kein Raster mit Linien (Raster)
  - keine Zettel aus Papier und Pappe (Werkstoff)
  - keine Magazin-Spalten (Journal)
  - Klar ist kühl und gerade, Freundlich warm, rund und gekippt

## Befunde nach Schwere

### Mittel (behoben)

- **M1 Schrift unter 16 px.**
  - Die Fragen in „Gut zu wissen" standen bei 320 px auf 15,8 px (h3 × 0,72). Sie sind jetzt mindestens 1 rem.
  - Die „heute"-Marke an den Zeiten stand auf 13 px, jetzt 1 rem.
  - Datei: `visitCss.ts`. Das Messskript findet danach keine Schrift unter 16 px mehr.
- **M2 Insel-Knöpfe lasen sich als zweiter Hauptweg.** Der Termin-Knopf in Signal schwebte bei 390 px über dem Signal-Hauptknopf „Termin buchen". Er ist jetzt eine weiße Pille mit Tintenrand und Druckkante, wie der Zweitknopf (`islandCss.ts`). Unter 48 rem schweben die Knöpfe über der Handy-Leiste, nicht auf ihr.
- **M3 Leere Kapitel und tote Anker** (aus dem F3-Review).
  - „Besuch uns" ohne jede Angabe und ohne Formular entfällt samt Anker.
  - Kein Knopf zeigt mehr auf ein fehlendes `#kontakt` (`freundlichActions`).
  - Ein Abschluss-Band ohne Knopf entfällt.
  - Geschichte bzw. Leitsatz ohne Text entfallen.

### Gering (bewusst so)

- **G1 Feder mit Überschwingen** (`cubic-bezier(.3,1.22,.6,1)`). Der Detektor meldet es als „bounce easing"; apple-design rät, Überschwingen nur nach einer Geste mit Schwung zu nutzen.
  - Es ist der eine abgenommene Moment des Systemblatts, einmal, 0,9 s, kaum sichtbar (20 px, 96 %).
  - Bei reduzierter Bewegung entfällt er.
  - Bleibt so.
- **G2 Farbkarte hebt sich bei Mauszeiger**, obwohl sie kein Link ist. Laut Systemblatt gewünscht.
  - Nur mit `hover:hover`/`pointer:fine`, −4 px und −0,6°, ohne Zeigerwechsel.
  - Wirkt nicht wie ein Knopf (keine Kante, kein Unterstrich).
  - Wenn es stört, reicht das Löschen einer Zeile in `motionCss.ts`.
- **G3 Meldungen mit Akzentstrich links** (Detektor „side-tab"). Das ist kein Kartenschmuck: Fehler und Erfolg im Panel stehen in Tinte mit Strich und „!", damit sie nicht nur über die Farbe erkennbar sind.
- **G4 Fokusring des Schließen-Knopfs im Chat** liegt bei 390 px an der rechten Panelkante an. Er bleibt sichtbar (3 px, Akzent).
- **G5 Reduzierte Bewegung schaltet global ab** (`transition`/`animation: none`). Rückmeldung bleibt trotzdem erhalten: Drücken zeigt die flache Kante sofort, ohne Übergang. Die Kippwinkel bleiben stehen (Systemblatt).

### Detektor (`detect.mjs`)

Fünf Treffer:
- zwei Fehlalarme in Test-Regex (`<img[^>` in `content.test.tsx`)
- der Akzentstrich der Meldungen im Test (G3)
- die Feder in `motionCss.ts` und ihr Test (G1)

## apple-design (Bewegung und Rückmeldung)

- **Rückmeldung beim Drücken:** `:active` senkt den Knopf sofort um 3 px (Kante 1 px), 140 ms. Heben nur mit Maus, kein „klebendes" Hover am Handy.
- **Ein Moment, sonst Ruhe:**
  - Das Einstiegsfoto bzw. das kleine Foto setzt sich einmal in seine Lage (ab Desktop gekippt).
  - Kapitel steigen 16 px auf, einmalig per IntersectionObserver, ohne Scroll-Listener.
  - Kein Laufband, kein Parallax, keine Schleife.
- **Nie unsichtbar:**
  - Startzustände gibt es nur mit Script (`data-fr-ready`) und nur ohne reduzierte Bewegung.
  - Ein Kapitel mit Tastaturfokus ist sofort sichtbar.
  - Beim Drucken ist nichts versteckt.
  - bfcache: Aufräumen nur beim echten Verlassen.
- **Leiste:** dockAutoHide ist aktiv. Im Browser bei 390 px geprüft (Playwright): Die Leiste ist aus, solange die Einstiegsknöpfe sichtbar sind, und kommt nach dem Einstieg.

## Zahlen

axe (Playwright, `a11y.spec.ts`, Abschnitt „Designsystem Freundlich" + Unterseite): 13/13 ohne Befund.

Lighthouse (mobil, Prod-Build, `?live=1`, je drei Läufe):

| Betrieb | Leistung | LCP | CLS | TBT | A11y |
|---|---|---|---|---|---|
| Kita Pusteblume | 1,0 | 1,50–1,51 s | 0 | 0 ms | 1,0 |
| Fellfreunde | 1,0 | 1,86 s | 0 | 0 ms | 1,0 |
| Gelato Mio | 1,0 | 1,35–1,44 s | 0 | 0 ms | 1,0 |

Ein vierter Lauf nach dem Feinschliff: 1,35 / 1,85 / 1,35 s.

SEO 0,66–0,69 und Best Practices 0,96 liegen nur am `noindex` der Demo-Seiten und am fehlenden `favicon.ico` auf localhost.

Abnahme-Vorschaubilder: `docs/designsysteme/freundlich/abnahme-*.jpg`
- je Beispiel (Kita, Fellfreunde, Gelato, Musikschule):
  - Handy erster Bildschirm (2×)
  - Handy ganz
  - Desktop erster Bildschirm
  - Desktop ganz

## Offen für die Abnahme (F5)

- Die Beispielseiten haben kein gebuchtes Kontaktformular. Der Hauptknopf heißt darum „Anrufen" (Kita, Fellfreunde) bzw. „Route planen" (Gelato), nicht „Platz anfragen" wie im Blatt. Mit gebuchtem Formular führt er nach `#kontakt`.
- Die Insel-Knöpfe überdecken am Handy, wie in allen Systemen, kurz die Einstiegsknöpfe, solange die Leiste weicht.
