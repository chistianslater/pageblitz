# Journal – Design-Audit (Task 18)

Stand 10.10.2026 · Prüfling: `/demo/system/journal/friseur` (NOIR Haarstudio) in allen drei Farbstimmungen, 375/390 px und 1440 px, dazu `/dev/site-preview?system=journal&fixture=full|minimal`.
Werkzeuge: Skill `impeccable` (Modus Audit, inkl. Detektor `detect.mjs`), Skill `apple-design` (Checkliste Typo-Optik, Abstände, Trefferflächen ≥ 44 px, Fokus, Bewegung), Playwright-Messungen (Trefferflächen, Überschriften, Kontraste), axe, Lighthouse.
Maßstab: Systemblatt (`systemblatt.html`, Anker Aman Venice). Korrekturen nur über Tokens bzw. Journal-CSS/-Komponenten, keine Ausnahmen pro Betrieb.

Schwere: **hoch** = Regelverstoß (WCAG AA) oder sichtbarer Fehler · **mittel** = merkbare Schwäche, Umgehung möglich · **niedrig** = Feinschliff.

## Ergebnis in Zahlen (impeccable-Audit)

| Dimension | vorher | nachher | Kern |
|---|---|---|---|
| Barrierefreiheit | 3 | 4 | axe 0 serious/critical (6 Läufe), Fokusring jetzt 2 px, Trefferflächen ≥ 44 px |
| Leistung | 3 | 3 | LCP 2,78 s mobil (Ziel 2,5 s), CLS 0,0007, TBT 0 — siehe offener Punkt L1 |
| Responsiv | 3 | 4 | kein Überlauf 320–1440 (30 Bildvergleiche), Dock-Streifen behoben |
| Tokens/Theming | 4 | 4 | alle Farben aus Palette, Kontraste in allen 3 Stimmungen ≥ 5,4 : 1 |
| Umsetzungstreue | 3 | 4 | Detektor: nur Fehlalarme (Regex in Tests); Formular-Titel und Bildnachweis jetzt systemtreu |
| **Summe** | **16/20** | **19/20** | |

## Befunde und Behebung

### Barrierefreiheit

| # | Befund | Schwere | Ort | Behebung |
|---|---|---|---|---|
| A1 | Fokusring 1 px (global, Knopf, FAQ, Dock) – auf Papier/Salbei und am Dock-Rand kaum zu sehen, WCAG 2.4.13 empfiehlt 2 px | mittel | `css.ts` | Token `--jr-focus:2px`, alle vier Regeln darauf umgestellt; Test „nie `outline:1px`“ |
| A2 | Textlinks unter 44 px Höhe: Kopf „Anrufen“ 24 px, Besuch-Links 24 px, Fuß Telefon/E-Mail 20 px, Impressum/Datenschutz 22 px (unter WCAG 2.5.8 = 24 px) | hoch | `css.ts` | unsichtbare Trefferfläche per `::before` (`--jr-hit` = −10,5 px oben/unten) für `.jr-link`, Fuß-Kontakt und Rechtslinks — Optik unverändert, Ziel ≥ 44 px |
| A3 | Handy-Menü-Links 42 px hoch | mittel | `css.ts` | `min-height` 44 px (`space-l + space-2xs`) |
| A4 | „Nachricht schreiben“ erschien, sobald das Add-on aktiv war — auch dort, wo `SiteIslands` mangels Slug kein Formular rendert (Titel ohne Formular) | mittel | `Visit.tsx`, `SystemContext.tsx`, `SiteRenderer.tsx` | neues Feld `contactIsland` im System-Zustand mit exakt der SiteIslands-Bedingung (Slug + `features.contactForm`); Test für beide Fälle |
| A5 | Zwei pageHeader-Abschnitte auf einer Unterseite ergaben zwei h1 und doppelte `id="seite-titel"` | mittel | `Extras.tsx`, `sections.tsx` | nur der erste trägt h1 und Anker, weitere werden als h2-Kopf gesetzt; Test |
| A6 | Kontrast „HEUTE“ (Akzent, 11 px Versal) auf hellem Band | geprüft | `css.ts` | Papier 6,50 : 1, Salbei 6,19 : 1, Ton 6,03 : 1 (auf Papier 5,46–5,92) — alle ≥ 4,5, keine Änderung |
| A7 | Globales `transition/animation:none` bei reduzierter Bewegung | niedrig | `css.ts` | bewusst so: alle Zustände bleiben sichtbar, keine Information hängt an Bewegung — belassen |

### Sicherheit/Robustheit

| # | Befund | Schwere | Ort | Behebung |
|---|---|---|---|---|
| S1 | `mailto:` direkt aus Kundendaten gebaut (`a@b.de?bcc=…` oder Komma-Listen hätten den Link umgebaut) | mittel | `Chrome.tsx`, `Visit.tsx` | `mailHref()` lässt nur eine plausible Einzeladresse zu, kodiert den Betreff; ungültig → kein Link (Text bleibt); Tests |

### Gestaltung (apple-design-Checkliste, impeccable-Kritik)

| # | Befund | Schwere | Ort | Behebung |
|---|---|---|---|---|
| G1 | Handy: unter dem Fuß lag ein Streifen in Papierfarbe (Platzhalter für das Dock) — Seite endete mit einem fremden Band | mittel | `css.ts` | Platzhalter `--jr-dock-space` wird in der Fußfarbe (`--jr-raised`) gemalt |
| G2 | Unsplash-Bildnachweis (`PhotoCredits`) stand im Journal ungestaltet unter dem Fuß: Systemschrift, Grau #777 auf Weiß (4,48 : 1, knapp unter AA) | hoch | `css.ts` | im Journal: helles Fußband, Source Sans `small`, `--sys-muted`, linksbündig an der Satzkante |
| G3 | `.jr-brand`-Desktopgröße als nackter Faktor `* 1.125` | niedrig | `css.ts` | benannter Wert `--jr-brand-desk` mit Systemblatt-Begründung |
| G4 | Desktop-Navigationszeile beginnt mit „NOIR HAARSTUDIO“ direkt unter der gleichen Marke | niedrig | `Chrome.tsx` | belassen: dient auf Unterseiten als Startseiten-Link (Systemblatt: Kopf 2 Zeilen) |
| G5 | Kapitel, deren Titel dem Etikett gleicht, zeigen nur die Ziffer („07 / Besuch“) | niedrig | `sections.tsx` | belassen: verhindert doppelte Wörter, konsistent mit „02 / Leistungen“ |
| G6 | Typo-Optik: Name 300 mit −0,022em, Fließtext 400 mit +0,012em, Etiketten +0,2em — größenabhängige Laufweite wie gefordert | geprüft | Tokens | keine Änderung |
| G7 | Bewegung: nur transform/opacity/clip-path, Startzustände nur mit Script und ohne reduzierte Bewegung, Knopf-Druck `scale(.98)` sofort | geprüft | `css.ts`, `motion.ts` | keine Änderung |

### Leistung

| # | Befund | Schwere | Ort | Stand |
|---|---|---|---|---|
| L1 | LCP mobil 2,78 s (Lighthouse simuliert) bzw. 2,74 s (echte Drosselung), Ziel 2,5 s. Ursache: Bandbreitenkonkurrenz — Heldenbild 55 KB wartet neben zwei vorgeladenen Newsreader-Schnitten (123 KB) und zwei früh geladenen Lazy-Fotos (210 KB, 1400 px Demo-Dateien für 175–364 px Anzeige). Versuche: Vorhang statt clip-path am Bild (±0), nur einen Schnitt vorladen (−0,1 s, FCP schlechter) — beides verworfen. Vergleich Pack `salon-noir` mit denselben Fotos: 3,29 s | mittel | Bildpipeline (nicht Journal) | **offen** — Abhilfe gehört in die Bildauslieferung (responsive Varianten/`srcset`), siehe Bericht |
| L2 | CLS 0,0007, TBT 0 ms, FCP 1,35 s | geprüft | — | im Ziel |

## Fehlalarme

- Detektor `broken-image`: vier Treffer in `*.test.tsx` (Regex-Literale `<img[^>`), kein Produktionscode.
- `<img class="pb-lb-img">` ohne `src`: Lightbox-Gerüst der gemeinsamen Galerie-Insel, wird erst beim Öffnen befüllt; nicht Journal.

## Positiv

- Hierarchie über Größe statt Gewicht, ein großer Eingriff (Name) wie im Systemblatt.
- Alle Farben aus drei Paletten-Tokens, keine hart kodierten Werte außer `#fff` für das helle Band.
- Kein waagrechter Überlauf zwischen 320 und 1440 px, lange Namen über Längenklassen abgefangen.
- Dock mit 52 px Höhe und Telefon-Quadrat, Safe-Area berücksichtigt.
