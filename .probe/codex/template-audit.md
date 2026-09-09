# Tiefenprüfung der 20 Pageblitz-Style-Packs

Stand: 5. September 2026. Geprüft wurden die 20 Pack-Module, ihre Verfassungen, der gemeinsame Renderer, die Layout-/Motion-Schichten, der Inhaltsvertrag, die Erstgenerierung und die 20 `full`-Fixtures. Die Rohdaten liegen in `fixture-metrics.json`; `audit.mjs` enthält den vorgesehenen Playwright-Messlauf für 1440×900 und 390×844.

> **Messgrenze:** Der geforderte Live-Playwright-Lauf konnte in dieser Ausführungsumgebung nicht belastbar abgeschlossen werden. `npx tsx` darf hier keinen IPC-Socket öffnen (`listen EPERM`), und Chromium wird beim macOS-Mach-Port-Handshake von der Sandbox beendet; der anschließende SSR-Abruf scheiterte nach einem zunächst erfolgreichen HEAD-Request an der nicht verfügbaren DNS-Auflösung. Deshalb sind alle nachfolgenden Zahlen entweder direkt aus Code/Fixtures gezählt oder als CSS-Sollwert bezeichnet. Es werden ausdrücklich **keine** erfundenen Browserboxen, Kundentexte oder Viewport-Screenshots ausgegeben.

## Kernbefund

Der Eindruck „halb fertig“ entsteht primär, weil der Inhaltsvertrag fast überall bereits **ein Zeichen** beziehungsweise **ein Element** als vollständig akzeptiert, während die großflächigen Pack-Layouts 60–150 px vertikales Padding pro Seite einer Sektion vorsehen. Die Erstgenerierung erzeugt nur fünf Kernsektionen; Galerie und Bewertungen erscheinen ausschließlich bei vorhandenen Fakten und vier visuell hilfreiche Zusatzsektionen (`story`, `stats`, `process`, `quote`) werden nie initial erzeugt. Dadurch trifft ein visuell aufwendig gestaltetes System auf strukturell dünne Inhalte: In den kuratierten Demos haben 20/20 Kontaktsektionen unter 20 Textwörter, weitere 14 Sektionen ebenfalls; reale Kundeninhalte dürfen laut Schema noch deutlich dünner sein. Die typografische Grundskala ist zwar konsistent (20/20: 16 px Basis), doch Hero-Maxima reichen von 54,4 bis 115,2 px und H2-Stile von etwa 24 bis 104 px, sodass die Hierarchie zwischen Packs nicht kalibriert ist. Zusätzlich bleibt sichtbare Detailtiefe ungleich verteilt: Pack-CSS enthält 4–11 Hover-Regeln und 18–32 Border-Deklarationen, aber nur 5/20 Renderer besitzen überhaupt ein `figcaption`.

## Methode und Messbasis

- Alle 20 Renderer implementieren dieselben 19 `case`-Zweige; gezählt per `case "<SectionType>"` in `client/src/components/site/packs/*/index.tsx`.
- Pro Pack wurden Fixture-Wörter, Textfelder, Bilder und Itemzahlen rekursiv aus `getFixture(pack, "full")` gezählt (`fixture-metrics.json`). URL-, Preis-, Adress- und Stundenfelder sind von der Wortmenge ausgenommen.
- Detailtiefe-Proxy: Vorkommen von `:hover`, `border*`, `<figcaption>` und `data-pb-slot` in Pack-CSS/Renderer. Dieser Proxy misst implementierte Zustände und Gestaltungshaken, nicht subjektive Schönheit.
- Typografie und Rhythmus sind CSS-Sollwerte. Für Mobil gilt der gemeinsame Breakpoint 720 px (`designProfileCss.ts:259–268`); 390×844 fällt darunter, 1440×900 darüber.
- Ranglistenwert (0–100): 30 % Demo-Inhaltsumfang, 15 % Bilder, 20 % Border-/Trenn-Details, 15 % Hover-Zustände, 10 % mindestens eine Caption, 10 % Layout-Slots; jeweils auf das beste beobachtete Pack normalisiert. Er ist ein nachvollziehbarer Code-/Fixture-Qualitätsproxy, kein Ersatz für die ausgefallene Pixelmessung.

## Systemische Befunde

### S1 — Der Vertrag definiert Form, aber kaum inhaltliche Mindesttiefe

**Messwerte:** `hero.headline`, Service-Titel/-Beschreibung, About-Headline/-Body, Review-Text, FAQ-Frage/-Antwort und CTA-Texte haben keine sinnvolle Wort- oder Zeichenuntergrenze; häufig genügt `z.string()` oder `.min(1)`. `services`, `testimonials`, `faq`, `menu`, `pricelist` und `team` akzeptieren jeweils nur ein Element. Im Prompt stehen zwar 4–6 Services und FAQs und 2–4 Sätze About, aber weder Mindestwortzahlen noch konkrete Beleg-/Differenzierungsfelder.

**Betroffen:** alle 20 Packs. **Schwere:** kritisch. **Belege:** `shared/siteContract/schema.ts:167–202`, `251–330`; `server/generationV2/contentPrompt.ts:34–45`.

**Konkreter Fix:** Im Prompt je Feld prüfbare Untergrenzen einführen (Hero-Subline 12–28 Wörter, Servicebeschreibung 18–45, About 80–160, FAQ-Antwort 25–70) und nach der LLM-Antwort einen Inhaltsqualitäts-Validator ergänzen. Im Zod-Schema keine harten Wortzahlen erzwingen, aber harmlose Untergrenzen wie `.min(20)` für Beschreibungen und `.min(80)` für About; bei Unterschreitung gezielter Retry mit Feldpfad.

### S2 — Die Erstseite ist strukturell zu klein für die angebotene visuelle Bühne

**Messwerte:** Standardmäßig werden exakt fünf Sektionen angefragt: Hero, Leistungen, About, FAQ, Kontakt; bei Gusto ersetzt Menü die Leistungen. Galerie kommt erst ab drei Bildern hinzu, Testimonials nur bei echten Reviews. `story`, `usp`, `stats`, `process` und `quote` existieren im Vertrag, werden aber von der Erstgenerierung nie angefragt. Das Ziel „6–8 Sektionen“ im Kommentar wird folglich nur mit externen Fotos/Reviews erreicht.

**Betroffen:** 19/20 Standardpacks plus Gusto in analoger Form. **Schwere:** kritisch. **Belege:** `server/generationV2/generateSiteContent.ts:74–101`, `238–304`; `server/generationV2/contentPrompt.ts:46–60`.

**Konkreter Fix:** Mindestens eine faktengebundene Vertiefungssektion deterministisch wählen: `process` bei Dienstleistern mit 4+ Leistungen, `stats` nur mit belegten Zahlen, `story` nur bei vorhandenem Crawl-/Editorial-Material, `usp` aus verifizierten Differenzierern. Keine generische Füllsektion erzeugen; fehlen Fakten, kompaktere Layoutdichte wählen.

### S3 — Große Sektionen werden auch für sehr wenig Inhalt reserviert

**Messwerte:** Pack-Sektionspadding reicht typischerweise von 60–80 px bis zu `clamp(..., 150px)` oben und unten: Werkbank 64–128 px (`css.ts:15`), Morgenlicht 76–150 px (`css.ts:14`), Schimmer 80–150 px (`css.ts:24`), Patina 72 px (`css.ts:27`), Fundament 72 px (`css.ts:25`). Gleichzeitig sind in den Demos alle 20 Kontaktsektionen <20 Wörter; zusätzlich sind Hero/Galerie/Preisliste bei Landgut, Atelier, Salon Noir, Morgenlicht, Zunft, Schimmer, Fundament, Karat und Marktplatz unter 20 Wörtern. Die globale „compact“-Regel senkt zwar auf 40–72 px, wird aber nur bei ≥7 Sektionen oder ≥6 Services abgeleitet – gerade **nicht** bei wenig Inhalt.

**Betroffen:** alle 20; besonders `morgenlicht`, `schimmer`, `werkbank` bei kurzen Sektionen. **Schwere:** hoch. **Belege:** `client/src/components/site/designProfileCss.ts:253–255`; `shared/siteContract/designProfile.ts:219–243`; jeweilige CSS-Zeilen oben.

**Konkreter Fix:** Dichte aus Inhaltsmenge ableiten: etwa `sectionWordCount < 35 && itemCount < 2 → compact-section` und dafür eine sektionsbezogene Klasse/Variable ausgeben. Das bestehende globale `density` nicht invertieren, sondern um `data-pb-content-density` pro Sektion ergänzen.

### S4 — Typografische Hierarchie ist innerhalb der Infrastruktur stabil, zwischen Packs aber zu breit

**Messwerte:** 20/20 Verfassungen nutzen 16 px Basis; die deklarierten modularen Ratios liegen eng bei 1,20–1,30. Hero-Clamps streuen dagegen um Faktor 2,12 beim Maximum: Marktplatz 54,4 px (`3.4rem`) bis Morgenlicht 115,2 px (`7.2rem`). H2-Sollwerte reichen grob von Salon Noir/Fundament ca. 24 px bis Werkbank 104 px; bei Werkbank kann ein H2 damit größer als der 80-px-Hero werden. Auf 390 px greifen überwiegend Clamp-Minima (Hero 30,4–54,4 px), während einzelne H2 weiterhin bis 40 px starten; die Differenz H1:H2 fällt damit teilweise auf ca. 1,2:1 statt einer klaren Stufe.

**Betroffen:** stärkste Brüche bei `werkbank`, `morgenlicht`, `schimmer`; flache Skalen bei `marktplatz`, `salon-noir`, `landgut`, `fundament`. **Schwere:** hoch. **Belege:** `shared/stylePacks/types.ts:36–40`; `shared/stylePacks/marktplatz.ts` und `morgenlicht.ts` jeweils beim `heroClamp`; `client/src/components/site/packs/werkbank/css.ts:15`, `salon-noir/css.ts:27`, `fundament/css.ts:26`.

**Konkreter Fix:** Packübergreifende semantische Grenzen definieren, ohne die Stilrichtungen gleichzumachen: mobil H1 36–56, H2 28–40; Desktop H1 56–96, H2 34–64. CI-Test berechnet die Clamp-Endpunkte und schlägt bei H2/H1 >0,75 oder <0,40 an.

### S5 — Bildarmut ist systemisch erlaubt und trifft detailorientierte Packs besonders hart

**Messwerte:** Das Schema macht Hero-/About-Bild optional und akzeptiert eine Galerie ab einem Bild. Der Merge setzt Hero/About nur, wenn Fakten vorhanden sind, und entfernt eine nicht vertrauenswürdige Galerie bei weniger als drei Bildern. In den Demos haben acht Packs nur zwei oder drei Bilder insgesamt (`kanzlei`, `klarwerk`, `fundament`, `plakat`, `raster`, `strom`, `ernte` je 2; `marktplatz`, `landgut`, `schimmer` je 3), während Werkbank und Patina 5 erreichen. Nur 4/20 Renderer enthalten eine Bildunterschrift: Werkbank (1), Gusto (1), Atelier (2), Schimmer (1), Raster (3) — tatsächlich sind es damit **5/20**, 15/20 liefern keine Caption-Komponente.

**Betroffen:** besonders `fundament`, `plakat`, `strom`, `ernte`, `kanzlei`, `klarwerk`. **Schwere:** hoch. **Belege:** `shared/siteContract/schema.ts:167–175`, `203–220`; `server/generationV2/generateSiteContent.ts:238–273`; Renderer-Zählung in `fixture-metrics.json` plus Quellzählung.

**Konkreter Fix:** Für Packs mit bildzentriertem Hero vor Auswahl/Rendering eine Mindestmedienfähigkeit deklarieren (`requiredMedia: 0|1|2`) und bildarme Betriebe in textstarke Packs routen. Captions zentral in `galleryAlbums`/Galerie-Chrome rendern, statt sie in nur fünf Pack-Renderern individuell vorzusehen.

### S6 — Die gemeinsame Layoutmechanik ist vorhanden, aber nicht vollständig slotbasiert

**Messwerte:** Positiv: 20/20 Pack-Module laufen über `SiteRenderer`, und dieser hängt `MOTION_CSS`, `LAYOUT_POLISH_CSS` sowie bei vorhandenem Profil `DESIGN_PROFILE_CSS` an. `DESIGN_PROFILE_CSS` bindet wiederum `packLayoutRules` in beiden Viewports ein. Alle 20 Renderer implementieren alle 19 Sektionszweige. Negativ: Layout-Slots variieren von 5 bis 8; Karat hat 5, Werkbank/Morgenlicht/Verve/Zunft 6, und Kontakt besitzt in Karat/Verve keinen Wrapper, weshalb ein `:not(:has(...))`-Fallback nötig ist.

**Betroffen:** alle nutzen das System; Sonderpfade vor allem `karat`, `verve`, danach `werkbank`, `morgenlicht`, `zunft`. **Schwere:** mittel. **Belege:** `client/src/components/site/SiteRenderer.tsx:149–157`, `230–260`; `designProfileCss.ts:15`, `214–225`, `259–268`; `layoutSlots.ts:10–23`.

**Konkreter Fix:** Die acht Slots als Renderer-Vertrag testen und Karat/Verve auf `contact-grid` migrieren. Kommentare „14 Packs“ in `SiteRenderer.tsx:156`, `motionCss.ts:2` und `layoutSlots.ts:7` auf 20 korrigieren; sie zeigen, dass die gemeinsame Schicht hinter der Pack-Erweiterung herlief.

### S7 — Detailtiefe ist messbar ungleich

**Messwerte:** Pack-eigene Hover-Regeln: 4 (`gusto`, `plakat`) bis 11 (`atelier`), Median 6,5. Border-Deklarationen: 18 (`ernte`) bis 32 (`kanzlei`), Median 23,5. Layout-Slots: 5–8. Caption-Komponenten: 0–3. Dadurch liefern Atelier/Raster/Werkbank mehr Mikrodetails, während Plakat trotz starker Grundidee, Ernte und Fundament weniger Zustands- und Metainformation besitzen.

**Betroffen:** unter Median besonders `plakat`, `ernte`, `fundament`, `karat`, `verve`. **Schwere:** mittel. **Belege:** `client/src/components/site/packs/*/css.ts` und `*/index.tsx`; Zähltabelle aus der Prüfung.

**Konkreter Fix:** Ein gemeinsames Detail-Budget pro Sektionsart testen: Servicekarte braucht mindestens Trennung/Fläche, Hover/Focus und optional Index; Galerie braucht Caption-Slot und Hover/Focus; Testimonial braucht Quelle/Rating/Autor. Der Test soll semantische Marker/Komponenten prüfen, nicht rohe CSS-Anzahl.

### S8 — Mobile Varianten sind technisch getrennt, aber werden nicht initial befüllt

**Messwerte:** Das Profil besitzt sechs optionale Mobile-Felder, doch `deriveDesignProfile` setzt keines davon; ohne Mobilwert wird die Desktopwahl bei ≤720 px wiederverwendet. Die gemeinsame CSS-Schicht repariert anschließend viele Packs mit pack-spezifischen `!important`-Regeln. Das erhöht die Zahl der Überschreibungen und macht besonders `centered`/`image-first` abhängig von nachträglichen Sonderfällen.

**Betroffen:** alle 20. **Schwere:** mittel. **Belege:** `shared/siteContract/designProfile.ts:86–110`, `235–245`; `client/src/components/site/designProfileCss.ts:259–268`; `packLayoutCss.ts:400 ff.`

**Konkreter Fix:** `deriveDesignProfile` soll explizite, kuratierte Mobile-Defaults setzen (z. B. Hero `image-first` nur bei geeignetem Bild, sonst `centered`; Services ab vier Items `grid`, sonst `list`) und einen Paritätstest ohne Fallback-Selektoren erhalten.

## Dichte der kuratierten Pack-Demos

| Pack | Sektionen | Inhaltswörter | Bilder | Sektionen <20 Wörter |
|---|---:|---:|---:|---|
| werkbank | 6 | 249 | 5 | contact |
| patina | 7 | 327 | 5 | contact |
| kanzlei | 6 | 247 | 2 | contact |
| salon-noir | 7 | 219 | 4 | pricelist, contact |
| morgenlicht | 7 | 308 | 4 | hero, contact |
| marktplatz | 7 | 280 | 3 | gallery, contact |
| gusto | 6 | 208 | 4 | contact |
| landgut | 6 | 244 | 3 | hero, gallery, contact |
| atelier | 6 | 183 | 4 | gallery, contact |
| klarwerk | 6 | 233 | 2 | contact |
| verve | 7 | 257 | 4 | contact |
| zunft | 7 | 209 | 4 | hero, contact |
| schimmer | 6 | 210 | 3 | hero, gallery, contact |
| fundament | 6 | 256 | 2 | hero, contact |
| karat | 7 | 290 | 4 | gallery, contact |
| plakat | 6 | 256 | 2 | contact |
| raster | 6 | 248 | 2 | contact |
| strom | 6 | 240 | 2 | contact |
| riviera | 7 | 288 | 4 | gallery, contact |
| ernte | 6 | 244 | 2 | contact |

Die Demo-Zahlen sind eher eine Obergrenze als ein Kundenrealitätsbild: Fixtures sind handkuratiert und aktivieren laut `generateSiteContent.ts:347–351` bewusst Extras, die eine frisch generierte Kundenseite nicht automatisch erhält.

## Rangliste nach gemessenem Code-/Fixture-Qualitätsproxy

1. **Patina — 82,8:** größter Demo-Inhaltsumfang, fünf Bilder, acht Layout-Slots und überdurchschnittlich viele Hover-/Trenndetails.
2. **Atelier — 76,9:** höchste Hover-Tiefe (11) und zwei Caption-Komponenten kompensieren den niedrigsten Textumfang.
3. **Werkbank — 76,8:** fünf Bilder, klare Nummerierung/Trennlinien und Caption, aber extreme H2-Skalierung und nur sechs Slots.
4. **Morgenlicht — 76,8:** sehr reiches Demo-Material und hohe Detailzahl, jedoch übergroße Flächen/Typografie und sechs Slots.
5. **Marktplatz — 73,0:** acht Slots und viele dekorative/strukturelle Details; nur drei Bilder und keine Caption.
6. **Schimmer — 71,6:** starke visuelle Metadetails und acht Slots, aber drei dünne Sektionen und sehr große vertikale Rhythmik.
7. **Gusto — 69,7:** vier Bilder, Caption und vollständige Slots; nur vier Pack-Hovers und 208 Inhaltswörter.
8. **Riviera — 69,7:** hoher Textumfang und vier Bilder; Detail-/Caption-Tiefe bleibt durchschnittlich.
9. **Salon Noir — 69,1:** vier Bilder und acht Slots, aber dünne Preisliste und keine Bildunterschriften.
10. **Kanzlei — 66,8:** stärkste Trennstruktur (32 Border-Deklarationen) und acht Slots, jedoch lediglich zwei Bilder.
11. **Raster — 66,8:** drei Caption-Komponenten und klare editoriale Metadaten; nur zwei Bilder und fünf Hover-Regeln.
12. **Landgut — 64,7:** acht Slots und solide Basis, aber Hero, Galerie und Kontakt sind bereits im Demo dünn.
13. **Zunft — 63,7:** vier Bilder und charakteristische Details, jedoch 209 Wörter und nur sechs Slots.
14. **Verve — 63,1:** vier Bilder und ordentlicher Inhalt; sechs Slots, kein Kontakt-Wrapper und unterdurchschnittliche Strukturdetails.
15. **Karat — 62,9:** guter Demo-Umfang und vier Bilder, aber nur fünf Layout-Slots und geringe Mikrointeraktionsdichte.
16. **Klarwerk — 62,5:** acht Slots und konsistente Struktur; lediglich zwei Bilder, keine Caption und mittlere Detailtiefe.
17. **Strom — 60,0:** technisch sauberer Grundaufbau, aber nur zwei Bilder, keine Caption und sieben Slots.
18. **Fundament — 58,9 — DREI SCHWÄCHSTE:** zwei Bilder, dünner Hero, keine Caption und unterdurchschnittliche Hover-/Trenndichte lassen die großen Flächen unfertig wirken.
19. **Ernte — 56,6 — DREI SCHWÄCHSTE:** nur zwei Bilder und die wenigsten Border-Details (18); die organische Dekoration trägt mehr Last als der Inhalt.
20. **Plakat — 55,6 — DREI SCHWÄCHSTE:** nur vier Hover-Regeln, zwei Bilder und keine Caption; die plakative Großform verstärkt damit jede Inhaltslücke.

## Inhaltsbefunde der zehn echten Kundenseiten

Eine seriöse Einzelanalyse der zehn Tokens ist in diesem Lauf nicht möglich: Es liegt kein lokaler Datenbestand zu diesen Tokens vor, der Browserstart wurde von der Sandbox verhindert, und der SSR-Fallback konnte nach Ausfall der DNS-Auflösung keine Bodies sichern. Entsprechend werden hier keine Namen, Textlängen, Wiederholungen oder Branchenfehler behauptet.

Der Code erlaubt jedoch genau die vom Betreiber beschriebene Fehlerklasse:

- Nur fünf LLM-Sektionen werden initial angefordert (`generateSiteContent.ts:80–98`); Fotos und Reviews sind externe Glücksfaktoren.
- Contact wird vollständig durch Fakten ersetzt und kann inhaltlich nur aus Überschrift plus Kontaktdaten bestehen (`generateSiteContent.ts:198–236`).
- Fehlen drei Galerie-Bilder, fällt die Galerie weg (`generateSiteContent.ts:248–273`); fehlen Reviews, fällt Testimonials weg (`276–303`). Aus dem Ziel von 6–8 Sektionen werden dann exakt fünf.
- Das Prompt verlangt „zur Kategorie“, verhindert fremde Städte/Branchenklischees und nutzt Crawl-Daten als Faktenquelle (`contentPrompt.ts:103–145`), aber verlangt keine Nennung konkreter Leistungen aus dieser Quelle, keine lokalen Details, keine Belege und keine Variation zwischen Hero/About/FAQ.
- Pack-Verfassungen liefern Tonalitätsregeln (`contentPrompt.ts:134–141`), aber keine Mindesttiefe. Sie können Wortwahl färben, nicht Informationsarmut verhindern.
- Das Schema verhindert nahezu keine Floskeln: `"Qualität und Leidenschaft"` wäre als komplette About-Section formal gültig (`schema.ts:195–202`). Wiederholungen über Sektionen werden nirgends geprüft.

Für den fehlenden Live-Teil sollte `audit.mjs` außerhalb der aktuellen Sandbox mit `npx tsx .probe/codex/audit.mjs` ausgeführt werden. Das Skript setzt `document.documentElement.style.scrollBehavior = "auto"`, misst beide geforderten Viewports, Sektionsboxen, Zwischenräume, berechnete H1/H2/H3-/Bodygrößen, Wortdichte, sichtbare Bilder inklusive CSS-Hintergründe, Seitenverhältnisse, kaputte Bilder, Captions und Detailmarker und schreibt `measurements.json` ausschließlich in `.probe/codex/`.

## Empfohlene Reihenfolge nach Wirkung pro Aufwand

1. **Prompt + Qualitätsretry schärfen (sehr hohe Wirkung, geringer Aufwand):** Wortkorridore, konkrete betriebliche Details und Anti-Duplikat-Regel in `contentPrompt.ts`; anschließender Validator in `generateSiteContent.ts`.
2. **Dichte an realen Inhalt koppeln (sehr hohe Wirkung, mittel):** sektionsbezogenen Dichtewert aus Wort-/Itemzahl berechnen und die vorhandenen Padding-Regeln daran binden. Das trifft den „halb fertig“-Eindruck direkt.
3. **Initiale Seitenstruktur erweitern (hohe Wirkung, mittel):** eine belegbare Vertiefungssektion je Betrieb hinzufügen und das kommentierte Ziel von 6–8 Sektionen tatsächlich garantieren.
4. **Bildfähigkeit vor Packwahl berücksichtigen (hoch, mittel):** medienarme Betriebe nicht in bildabhängige Packs wie Fundament/Plakat/Ernte routen; Caption zentralisieren.
5. **Typografische Grenzwerte testen (mittel-hoch, gering):** Clamp-Endpunkte und H1:H2-Verhältnis als Test über alle Verfassungen/Packs prüfen.
6. **Slot-Vertrag schließen (mittel, gering):** Karat/Verve-Kontaktwrapper ergänzen und acht Slots je Pack in `moduleParity.test.ts` absichern.
7. **Detail-Budget je Sektionsart (mittel, mittel):** gemeinsame semantische Komponenten für Caption, Index/Meta, Divider und Hover/Focus; zuerst die drei Schlusslichter.
8. **Explizite Mobile-Profile ableiten (mittel, mittel):** Mobile-Felder initial setzen und danach die Anzahl pack-spezifischer `!important`-Reparaturen reduzieren.

## Artefakte und Reproduzierbarkeit

- `audit.mjs` — vollständiger Playwright-Messplan für 20 Demos × 2 Viewports und zehn Kundenseiten × 2 Viewports.
- `fixture-metrics.mjs` / `fixture-metrics.json` — reproduzierbare Inhalts-/Bildmessung der 20 Full-Fixtures.
- `ssr-audit.mjs` / `ssr-measurements.json` — SSR-Fallback und protokollierte Abruffehler.
- Außerhalb `.probe/codex/` wurde durch diese Prüfung keine Datei verändert.
