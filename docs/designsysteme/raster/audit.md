# Raster – Design-Audit (Task R8)

Stand 11.10.2026 · Prüflinge: `/demo/system/raster/steuerberater` (Papier), `/werkstatt` (Werk), `/schluesseldienst` (Kohle, ohne Foto, ohne Bewertungen, rund um die Uhr), dazu `makler`, `it`, `taxi`, `hersteller`, `gaertnerei` und `/dev/site-preview?system=raster&fixture=full|minimal` in allen drei Paletten; 320, 375/390 und 1440 px.
Werkzeuge: Skill `impeccable` (Modus Audit, Detektor `detect.mjs`), Skill `apple-design` (Typo-Optik, Trefferflächen, Fokus, Bewegung/reduzierte Bewegung), Playwright-Messungen (Überlauf, h1, Trefferflächen, Fokusring, geladene Schriften), axe, Lighthouse (Produktions-Build, mobil).
Maßstab: Systemblatt (`systemblatt.html`, Anker Colophon). Korrekturen nur über Tokens bzw. Raster-CSS/-Komponenten; Showcase-Daten in `shared/stylePacks/blueprintShowcase*.ts`.

Schwere: **hoch** = Regelverstoß oder sichtbarer Fehler · **mittel** = merkbare Schwäche · **niedrig** = Feinschliff.

## Ergebnis in Zahlen (impeccable-Audit)

| Dimension | vorher | nachher | Kern |
|---|---|---|---|
| Barrierefreiheit | 3 | 4 | axe 0 serious/critical (6 Läufe: 3 Paletten × 390/1440), Fokusring 2 px, alle Rasterlinks ≥ 44 px Trefferfläche |
| Leistung | 4 | 4 | LCP 1,4 s, CLS 0, TBT 0 ms, FCP 1,1 s (mobil, beide Prüfseiten) |
| Responsiv | 3 | 4 | kein Überlauf 320–1440 (30 Bildvergleiche + 8 Betriebe × 3 Paletten × 320/1440), Einstieg passt auf den ersten Bildschirm |
| Tokens/Theming | 4 | 4 | alle Farben aus Paletten-Tokens, Kohle (dunkles Papier) in allen Abschnitten lesbar |
| Umsetzungstreue | 3 | 4 | Detektor: nur Fehlalarme; fremde Fixture-Daten aus den Beispielbetrieben entfernt |
| **Summe** | **17/20** | **20/20** | |

## Befunde und Behebung

### Gestaltung und Responsiv

| # | Befund | Schwere | Ort | Behebung |
|---|---|---|---|---|
| G1 | Desktop 1440 × 900: „Kfz-Service Brandt" lief über drei Zeilen à 18 rem — der erste Bildschirm zeigte nur den Namen, Satz und Fakten lagen darunter (Systemblatt 10: Name, Satz, „Heute geöffnet" in einem Bild) | hoch | `fit.ts`, `Entry.tsx`, `css.ts` | Höhenbremse: Zeilenzahl auf Desktop-Breite (`--rs-lines`, nur ab 2 Zeilen) begrenzt alle Zeilen auf 60 % der Höhe; der Name rückt auf zwei Zeilen, Satz und Fakten stehen im ersten Bildschirm. Einzeilige Namen unverändert. Tests |
| G2 | Typo-Einstieg (Schlüsseldienst) auf Desktop: „NORD" und „24/7" füllten je fast eine halbe Höhe, der Satz „Ausgesperrt? Ruf an." lag unter dem ersten Bildschirm | mittel | `css.ts` | im Typo-Einstieg Name ≤ 36 %, „24/7" ≤ 26 % der Höhe; Handy unverändert (dort begrenzt die Breite). Test |
| G3 | Über uns ohne Foto: ein Satz von 122 Zeichen stand als `lede` (5 Zeilen Desktop, 7 Zeilen Handy) direkt unter der Abschnittsüberschrift — zwei große Textblöcke übereinander | mittel | `Story.tsx` | `lede` nur bis 120 Zeichen (Systemblatt: zwei, drei Zeilen); längere Sätze laufen als Fließtext. Test |
| G4 | Fuß, Spalte „Zeiten": je Wochentag eine Zeile („Montag 8–17 Uhr" … fünfmal), während das Kontakt-Kapitel „Montag–Donnerstag" zusammenfasst | mittel | `Chrome.tsx`, `css.ts` | gleiche Folgetage zusammengefasst (`groupOpeningHours`), Uhrzeit bricht nicht mehr um („8–⏎17 Uhr"). Test |
| G5 | Handy: unter dem Fuß lag ein Papierstreifen in Höhe der Leiste (Abstand für das Dock auf dem Seitenrahmen) | niedrig | `css.ts` | Abstand sitzt jetzt im Fuß selbst (Fußfarbe); Seitenrahmen nur ohne Fuß. Test |
| G6 | Kohle: Fuß (`deep` #050505) hob sich kaum vom Papier (#141414) ab | niedrig | `css.ts` | Haarlinie über dem Fuß aus `on-deep` 16 % in `deep` — auf Kohle sichtbar, auf Papier/Werk dunkel an dunkel unsichtbar. **Betreiber urteilt** (Bild `schluesseldienst-kohle-*-ganzseite.jpg`) |
| G7 | Handy-Leiste Werkstatt: zweites Feld zeigt die E-Mail gekürzt („service@kfz-brandt-…") | niedrig | `Dock.tsx` | belassen: Feld bleibt tippbar und eindeutig; Kürzung mit Auslassung wie im Systemblatt-Muster |
| G8 | Kapitel-Etikett und Überschrift wiederholen sich teils („04 Betrieb" / „Der Betrieb") | niedrig | Bauplan-Überschriften | belassen: Überschrift kommt aus dem Bauplan der Branche, nicht aus Raster |
| G9 | Typo-Optik: Name Versal −0,05 em/0,88, `lede` −0,03 em/1,08, Fließtext 0 — Laufweite und Zeilenabstand größenabhängig (apple-design §15) | geprüft | Tokens | keine Änderung |

### Barrierefreiheit

| # | Befund | Schwere | Ort | Behebung |
|---|---|---|---|---|
| A1 | Fuß-Aufforderung („Erstgespräch anfragen", Stufe h2) nur 36 px hoch | mittel | `css.ts` | unsichtbare Trefferfläche per `::before` bis `--rs-tap` (44 px), Optik unverändert. Test |
| A2 | Fuß-Links (Leistungen, Telefon, Rechtliches) 43 px statt 44 px | niedrig | `css.ts` | `--rs-hit` von −0,75 auf −0,8125 × `space-s` (≈ 45 px) |
| A3 | Fokusring 2 px auf allen Flächen, auch Foto-Einstieg (`on-deep`) und Leiste (innen) | geprüft | `css.ts` | Playwright-Test „Fokusring 2 px" (1440 und 375) |
| A4 | Genau ein h1 je Seite, gewandertes Gewerk bleibt für Vorleser im h1 („Schlüsseldienst Nord" → sichtbar NORD) | geprüft | `Entry.tsx` | 8 Betriebe × 3 Paletten × 2 Breiten gemessen |
| A5 | Reduzierte Bewegung: Startzustände nur unter `no-preference` + `data-rs-ready`, ohne JS normale Abfolge (apple-design §14) | geprüft | `motionCss.ts` | Wächter-Test: das Entfernen des Bewegungsblocks muss das CSS wirklich kürzen |
| A6 | axe-Fund `aria-prohibited-attr` an `.pb-art-rating` auf `/demo/raster` | — | Pack „raster" (rev 2), nicht Designsystem | unverändert in diesem Zweig, bestand vorher; nicht Teil von R8 |

### Umsetzungstreue / Daten

| # | Befund | Schwere | Ort | Behebung |
|---|---|---|---|---|
| U1 | Beispielbetriebe mit Beispieltexten trugen Kontaktdaten und Leistungs-Einleitung der fremden Fixture: Kfz-Werkstatt zeigte `info@schreinerei-brandt-dortmund.de` und „Vier Kernbereiche … lange haltbar", Taxi `service@nordvolt.de` und „Vier Systeme — ein Ansprechpartner, ein Protokoll" | hoch | `blueprintShowcase.ts` | Beispieltexte bringen eigene E-Mail mit, Einleitung der Fixture entfällt, Fußnotiz/Unterzeile der Fixture ersetzt. Test |
| U2 | Kein Beispiel für „Sofort-Dienst ohne Foto und ohne Bewertungen" (Review-Fokus 2) in Vorschau und Design-Übersicht | mittel | `blueprintShowcaseList.ts` | neuer Betrieb **Schlüsseldienst Nord** (Münster, Mo–So 24 Stunden, `photos: "none"`, keine Bewertungen → kein Stimmen-Abschnitt, keine Google-Zahlen). Raster hat in `/design-review` jetzt 8 Betriebe (Beratung ×3, Auto, Sofort ×2, Industrie, Standard). Test |

### Wartung (aufgeschobene Kleinigkeiten)

- `SiteRenderer.tsx`: verwaister Doc-Kommentar vor `SYSTEM_MOTION` an `withLegacyVars` zurückgesetzt; `SYSTEM_MOTION` exportiert, Test „Schlüssel == `SYSTEMS_WITH_MOTION`".
- `shared/legal.ts`: Stil-Muster erkennt `</style >`; `BACK_LINK` verweist auf `server/legalGenerator.ts`. Test.
- `motion.test.ts`: Wächter, dass das Muster den Bewegungsblock wirklich entfernt.
- Veralteter Kommentar `withoutBandPhotos` → `claimPhotos`; doppelte Leerzeilen in `Story/Extras/Visit.tsx`.

## Leistung (Lighthouse 12, mobil, Produktions-Build Port 3013)

| Seite | LCP | CLS | FCP | TBT | Score |
|---|---|---|---|---|---|
| `/demo/system/raster/werkstatt?palette=werk&live=1` (Foto-Einstieg) | 1,4 s | 0 | 1,1 s | 0 ms | 100 |
| `/demo/system/raster/schluesseldienst?palette=kohle&live=1` (ohne Foto) | 1,4 s | 0 | 1,1 s | 0 ms | 100 |

Ein erster Kaltlauf (Bild noch nicht im Cache des Bilddienstes) lag bei 2,2 s, alle Folgeläufe bei 1,4 s. Ein einziger Schriftschnitt (Geist variabel, 29 kB) wird vorgeladen.

## Fehlalarme

- Detektor `broken-image`: drei Treffer in `*.test.tsx` (Regex-Literale `<img[^>`), kein Produktionscode.

## Positiv

- Ein Schriftschnitt, ein Preload, keine Fremdanfragen (Kartenfläche ohne Google-Einbettung).
- Bänder per `position: sticky` ohne Scroll-Übernahme; ohne JS und bei reduzierter Bewegung normale Abfolge.
- Kein „24/7", kein „Jetzt erreichbar" ohne echte 24-Stunden-Zeiten; keine Google-Zahlen ohne Daten.
- Kohle: alle Abschnitte, Karte, FAQ, Leiste und Fuß lesbar (axe ohne Kontrastfund).
