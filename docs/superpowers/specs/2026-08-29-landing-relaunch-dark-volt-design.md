# Landing-Relaunch „Nachtschicht" — Design-Spec (2026-08-29)

Entscheidungsgrundlage: 5-Varianten-Mockup, vom Betreiber final auf **Variante D
(Fusion)** entschieden — Nachtschicht-Ästhetik × Werkstattlicht-Layout/-Copy.
Klickbares Referenz-Artifact: https://claude.ai/code/artifact/215eba0b-320d-4e76-8e51-7788486e4ef2
(Tab „D · Fusion"). Variante E („Blueprint", hell) wurde geprüft und abgelehnt.

## 1. Ziel

Die Landingpage `/` wird komplett neu gebaut: verkaufspsychologisch
durchkomponiert, visuell auf Referenzniveau (Linear/Vercel-Klasse, aber mit
eigener Identität), und mit einer Hero-Animation, die das Produkt erzählt
statt eines abstrakten Effekts. Null zahlende Kunden → keine
Migrationsrücksichten, aber SEO-Substanz (Meta, Schema, Prerender,
Branchenlinks) bleibt vollständig erhalten.

## 2. Designwelt „Nachtschicht"

### Prinzipien (aus Moving-Parts-Referenz übernommen, auf dunkel übertragen)

1. **Eine Akzentfarbe macht die gesamte chromatische Arbeit**: Volt. Kein
   zweiter Farbakzent. Grün nur als Live-/Erfolgs-Semantik, nie dekorativ.
2. **Mono-Schrift für UI-Chrome**: Kicker, kleine Labels, URL-Zeilen,
   Preis-Badges in JetBrains Mono. Nie für Fließtext.
3. **Seltene, schwere Schatten**: ein großer Schatten unter der Hero-Bühne
   und den Feature-Demos — sonst keine. Elevation sonst über 1px-Hairlines
   (`rgba(255,255,255,.09)`), nie Border + Schatten gleichzeitig.
4. **Glas nur funktional**: Nav und schwebende Chips. Keine dekorativen
   Blur-Flächen.

### Farb-Tokens (ersetzen den `.lp`-Block in `client/src/index.css`)

| Token | Wert | Rolle |
|---|---|---|
| `--lp-bg` | `#0b0b0d` | Seitengrund |
| `--lp-panel` | `#131316` | Karten, Frames |
| `--lp-panel-2` | `#1a1a1e` | erhöhte Fläche im Panel |
| `--lp-ink` | `#f2f1ee` | Headlines, Primärtext |
| `--lp-muted` | `#a4a39d` | Sekundärtext |
| `--lp-faint` | `#7c7b76` | Tertiär/Platzhalter |
| `--lp-line` | `rgba(255,255,255,.09)` | Hairlines |
| `--lp-volt` | `#ccff00` | DIE Akzentfarbe: CTAs, em-Wörter, Kicker, aktive Zustände |
| `--lp-volt-ink` | `#0b0b0d` | Text auf Volt |
| `--lp-live` | `#22c55e` | ausschließlich Live-/Erfolgs-Punkt |
| `--lp-glow` | `rgba(204,255,0,.08)` | radialer Hero-Glow, max. 1× pro Viewport |
| `--lp-shadow-heavy` | `0 40px 90px -30px rgba(0,0,0,.9)` | die seltene schwere Elevation |

Kontrast-Pflicht: `--lp-muted` auf `--lp-bg` ≥ 4,5:1 (a4a39d/0b0b0d ≈ 7,4:1 ✓).
Volt nie als Fließtextfarbe auf Panel-Flächen unter 3:1-Größenregel.

### Typografie

- **Space Grotesk** (bereits geladen): alles außer Mono-Chrome.
  Gewichte 400/500/700 — 700 ist das Maximum der Familie; keine 800er.
- **JetBrains Mono** 400/500 (neu, subset latin): Kicker, Labels, URL, Badges.
- H1: `clamp(2.5rem, 5vw, 4.2rem)`, 700, `-.03em`, `line-height 1.02`,
  `text-wrap: balance`. Volt-`em` für das Nutzenwort.
- Body: 1.12rem/1.55. Maximal 32rem Zeilenbreite in Textspalten.
- Sektions-H2: `clamp(1.9rem, 3.2vw, 2.8rem)`, 700. Keine Echo-/Doppeltitel
  mehr (das Dayos-Muster entfällt komplett).

### Motion-Grammatik

- **Ein** orchestrierter Moment pro Sektion: Scroll-Reveal via bestehendem
  IntersectionObserver-Muster (`lp-reveal-on`/`lp-in` bleibt technisch, neue
  Kurve `cubic-bezier(.16,1,.3,1)`, 500ms, 12px Y-Versatz, Kaskade 60ms).
- Hover: CTAs -1px Y + Glow-Verstärkung; Karten nur Hairline → Volt-Hairline.
- `prefers-reduced-motion: reduce`: alles statisch, Hero zeigt Endzustand.
- Nur `transform`, `opacity`, `clip-path`, `box-shadow` (Glow) animieren.

### Logo

Neues Blitz-Zeichen (SVG, geliefert 2026-08-29). Einbau als React-Komponente
`BrandMark` in `client/src/components/landing/primitives.tsx`:
- weißes Hintergrund-Rect des Quell-SVG entfernen,
- Pfad mit `fill="currentColor"`,
- `viewBox="480 380 1060 1360"` (engerer Crop),
- Quelle nach `client/src/assets/pageblitz-mark.svg` committen (Original liegt
  in `~/Downloads/magnific_keep-the-core-concept-of-_VXtcgrIMMU.svg`).
Nav: Zeichen in Volt + Wortmarke „Pageblitz" in Ink. Favicon-Update ist ein
separater Task (nicht Teil dieses Umbaus).

## 3. Hero-Animation „Website entsteht"

Ersetzt den Remotion-Film (`hero-film/`) vollständig. Leichte CSS/JS-Komponente
`HeroBuildLive` (kein Canvas, kein Remotion, kein Framer Motion).

### Phasen (Loop ~9,5 s, JS-Timeline + `data-phase="0…4"` am Wurzelelement)

| Phase | Dauer | Inhalt |
|---|---|---|
| 1 Eingabe | ~1,6 s | Suchfeld-Karte, „Schreinerei Brandt" wird getippt (55 ms/Zeichen), Caret blinkt |
| 2 Daten | ~2,0 s | 4 Google-Chips fliegen gestaffelt ein: „★ 4,9 · 127 Bewertungen", „12 Fotos", „Öffnungszeiten", „Adresse & Karte" |
| 3 Aufbau | ~2,6 s | Browser-Frame wird voll opak; Skeleton-Shimmer blendet aus; Site-Nav slidet von oben; H1 „MASSARBEIT / AUS HOLZ. / PUNKT." zeilenweise per clip-path; Bildfläche skaliert ein; CTA + Sterne poppen |
| 4 Live | ~2,8 s | URL wechselt auf `brandt-schreinerei.pageblitz.de`, Volt-Badge „● LIVE" mit Puls; Halten; Loop |

### Technik

- Phasen-Zustände komplett in CSS (Transitions auf `[data-phase]`-Selektoren),
  JS nur als Timer-Timeline (setTimeout-Kette mit Cleanup, Muster aus dem
  Mockup übernehmen).
- Der Frame-Inhalt ist die Werkbank-Demo als HTML/CSS nachgebaut (wie im
  Mockup) — **kein** Screenshot-Bild im LCP-Pfad. Die Holz-Bildfläche ist ein
  CSS-Gradient mit Maserungs-Streifen.
- Sichtbarkeit: IntersectionObserver pausiert die Timeline, wenn der Hero
  nicht im Viewport ist (Battery/CPU).
- `prefers-reduced-motion`: sofort Phase 4, statisch, kein Loop.
- A11y: Wurzel `role="img"` + deutsches `aria-label`, das die Story
  beschreibt; alle Innen-Elemente `aria-hidden`.
- Demo-Betrieb bleibt fiktiv „Schreinerei Brandt, Dortmund" (konsistent zur
  bestehenden Werkbank-Demo). Zahlen im Chip (4,9/127) sind Demo-Daten und
  tauchen nirgends als Pageblitz-Eigenlob auf.

### Entfernen

- `client/src/components/landing/hero-film/` (alle 6 Dateien) löschen,
  `HeroBuild.tsx` durch `HeroBuildLive.tsx` ersetzen.
- Remotion-Abhängigkeit aus `package.json` entfernen, **sofern** kein anderer
  Code sie importiert (vor dem Entfernen `grep -r "remotion" client/ server/`
  — Stand heute nutzt nur hero-film sie; `npm run build:islands` prüfen).

## 4. Seitenarchitektur (10 Sektionen)

Reihenfolge in `LandingPage.tsx`. Jede Sektion: Zweck → finale Copy → Motion.

### 4.1 Nav (Glas, sticky)
`LandingNav.tsx` umbauen: schwebende Glas-Leiste (`backdrop-filter: blur(14px)`,
Panel-Tint, Hairline, 16px Radius, 1rem vom Rand). Links: Design, Ablauf,
Preise, FAQ (Anker). CTA „Kostenlos starten" (Volt). Burger-Menü mobil wie
gehabt. Sticky-CTA unten mobil bleibt (`StickyCta.tsx`, Volt-Restyle).

### 4.2 Hero
- Layout: Grid 5/12 Copy links, 7/12 Bühne rechts; Bühne läuft rechts aus dem
  Viewport (Panel-Tint-Fläche mit `border-radius 24px 0 0 24px`), Glow oben
  rechts.
- **H1:** „Die fertige Website für deinen Betrieb — *in 3 Minuten.*"
- **Sub:** „Tipp deinen Firmennamen ein. Pageblitz holt Fotos, Bewertungen und
  Öffnungszeiten aus deinem Google-Profil und baut daraus eine echte Website.
  **Du siehst das Ergebnis, bevor du irgendetwas bezahlst.**"
- **Form:** Feld „Wie heißt dein Betrieb?" + Button „Meine Website ansehen"
  (bestehende `HeroForm`-Logik: Name → `/start?name=…` bleibt unverändert).
- **Risk-Line (Mono):** „Kostenlos ansehen · keine Kreditkarte · monatlich
  kündbar".
- Kein Kicker über dem H1 (der Agentur-Vergleich zieht in Sektion 4.3).
- Motion: Copy-Kaskade beim Load (bestehende `lp-rise`-Mechanik), rechts läuft
  `HeroBuildLive`.

### 4.3 Beweis-Streifen (neu: `ProofBar.tsx` ersetzt)
3 Spalten mit Hairline-Trennern, Mono-Kicker in Volt:
1. **Statt Agentur** — ~~2.000–8.000 €~~ **19,90 €/Monat** — „Keine
   Einrichtungskosten, kein Projekthonorar, monatlich kündbar."
2. **Statt Wartezeit** — ~~4–12 Wochen~~ **3 Minuten** — „Von der Eingabe
   deines Firmennamens bis zur fertigen Vorschau."
3. **Dein Risiko** — **0 €** — „Erst sehen, dann entscheiden. Gefällt dir die
   Website nicht, zahlst du nichts."
Durchgestrichene Anker als echtes `<s>` (Screenreader-freundlich mit
`aria-label` Langform).

### 4.4 Problem (Verlustaversion)
`ProblemSection.tsx` straffen, `ManifestoBand.tsx` löschen — dessen Kernsatz
wird der Abschluss dieser Sektion.
- **H2:** „Jeden Tag suchen Kunden — und wählen einen anderen."
- Drei Punkte (bestehende Copy gestrafft): unsichtbar bei Google / Bewertungen
  arbeiten nicht für dich / der Mitbewerber mit Website bekommt den Auftrag.
- **Schlusszeile (Volt-em):** „Nicht weil deine Arbeit schlechter ist. Sondern
  weil man sie *online nicht sieht.*"
- Inline-CTA: „Website kostenlos erstellen".

### 4.5 Ablauf (gezeigt, nicht versprochen)
`HowItWorks.tsx` + `StudioProof.tsx` verschmelzen zu einer Sektion.
- **H2:** „Vier Schritte. Keine Technik."
- 4 Schritte mit Mini-Visuals (kleine gezeichnete UI-Stills im
  Nachtschicht-Stil, CSS/SVG, keine Screenshots): 1 Firmenname/Google-Profil →
  2 Designrichtung wählen → 3 Texte & Fotos prüfen (Checkliste + Live-Vorschau,
  das StudioProof-Motiv) → 4 Freischalten.
- Nummerierung erlaubt (echte Sequenz).

### 4.6 Designrichtungen (Karussell)
`PackShowcase.tsx` erweitern, `ForWhom.tsx` löschen.
- **H2:** „Welche Richtung passt zu deinem Betrieb?"
- Karussell mit den 14 Pack-Previews (bestehende `/pack-previews/*.webp` +
  `shared/stylePacks/summary.ts`), jede Karte: Preview, Name, Ein-Zeiler,
  **Branchen-Zeile** (aus ForWhom übernommen: „Bäckerei, Manufaktur,
  Fachgeschäft" etc.) und „Ansehen"-Link auf `/demo/<packId>`.
- Sub-Zeile: „Professionelle Ausgangspunkte, keine fertigen Vorlagen — deine
  Inhalte, Farben und Bilder formen daraus deine Website."
- Link „Alle Branchen ansehen" → SEO-Branchenindex bleibt (Ersatz für den
  ForWhom-Link).

### 4.7 Extras, die arbeiten
`FeatureShowcase.tsx` dunkel neu bauen, Inhalte bleiben: KI-Chat, Galerie,
Terminbuchung als Mini-Demos (Chat-Bubbles, Lightbox-Andeutung, Slot-Picker).
- **H2:** „Deine Website ist kein Plakat. Sie arbeitet."
- Jede Demo mit Mono-Badge „EXTRA · + X,XX €" (Preise aus `shared/pricing.ts`,
  nicht hartcodiert).

### 4.8 Preis (mit integriertem Anker)
`Pricing.tsx` umbauen; die separate Vergleichstabellen-Sektion entfällt.
- Links die Preis-Karte (Panel, schwerer Schatten — zweiter und letzter
  Einsatz von `--lp-shadow-heavy`): 19,90 €/Monat jährlich / 24,90 € monatlich
  (Toggle bleibt, Werte aus `shared/pricing.ts`), Inklusiv-Liste wie heute.
- Rechts daneben der **Anker-Block** (kompakt, 3 Zeilen statt Tabelle):
  Agentur 2.000–8.000 € einmalig + 50–150 €/Monat + 4–12 Wochen vs. Pageblitz
  0 € + ab 19,90 €/Monat + 3 Minuten. Schlusszeile: „Ersparnis im ersten
  Jahr: bis zu 8.000 €."
- Extras-Grid (8 Extras + Preise) unter der Karte, 2-spaltig wie heute.
- CTA + Einwandzeile („Vorschau ohne Kreditkarte · 7 Tage gratis · jederzeit
  kündbar").

### 4.9 Vertrauen
`TrustSection.tsx` restylen, Copy bleibt (sie ist gut): Rechtssicher ohne
Anwalt / SSL & Hosting immer dabei / Deine Inhalte gehören dir / Monatlich
kündbar. 4 Karten mit Hairlines, Mono-Kicker.
- **H2:** „In sicheren Händen — ohne Kleingedrucktes."

### 4.10 FAQ → Schluss-CTA → Footer
- `Faq.tsx`: dunkles Akkordeon, Inhalte unverändert aus `shared/faq.ts`
  (FAQ-Schema im Server bleibt synchron).
- `FinalCta` (in `LandingFooter.tsx`): Volt-Bühne — voltfarbene Fläche,
  `--lp-volt-ink`-Text, H2 „Sehen kostet nichts." + wiederholtes Namensfeld
  (dunkle Variante des Formulars) + Risk-Line.
- Footer + `IndustryLinks` (SEO-Branchenlinks) bleiben, dunkel gestylt.
- `Testimonials.tsx` bleibt als leer-rendernde Komponente im Baum (Struktur
  für echte Stimmen), wird visuell auf die neue Welt vorbereitet.

## 5. Komponenten-Mapping

| Heute | Wird |
|---|---|
| LandingNav | umgebaut (Glas) |
| LandingHero + HeroForm | umgebaut (neue Copy/Layout, Logik unverändert) |
| HeroBuild + hero-film/* | **gelöscht** → neu `HeroBuildLive.tsx` |
| ProofBar | **ersetzt** durch 3-Anker-Streifen |
| ProblemSection | gestrafft |
| ManifestoBand | **gelöscht** (Kernsatz → Problem-Sektion) |
| HowItWorks + StudioProof | **verschmolzen** |
| ForWhom | **gelöscht** (Branchen → PackShowcase-Karten) |
| PackShowcase | erweitert (Branchen-Zeile) |
| FeatureShowcase | dunkel neu |
| Pricing (+ Vergleichstabelle) | Preis + integrierter Anker |
| TrustSection | restyled |
| Testimonials | bleibt (leer) |
| Faq, LandingFooter, IndustryLinks, StickyCta | restyled |
| primitives.tsx | neue Tokens/Bausteine + `BrandMark` |

## 6. Technik & Nebenwirkungen

- **Tokens:** `.lp { … }`-Block in `client/src/index.css` komplett ersetzen.
  Studio (`/onboarding`) behält Papier/Grün — der Umbau darf ausschließlich
  `.lp`-Scope und Landing-Komponenten anfassen.
- **SEO-Prerender:** `server/seo/homePage.ts` spiegelt H1/Sektions-Copy für
  Crawler — muss auf die neue Copy aktualisiert werden (H1, Sektionstitel,
  gestrichene Sektionen raus). Meta/OG in `client/index.html` bleiben, außer
  das OG-Image passt später nicht mehr zur dunklen Seite (separater Task).
- **Chat-Widget:** `DeferredChatWidget` und Lazy-Loading-Mechanik unverändert.
- **Performance-Budget:** Landing-JS < 150 kB gzip. Remotion-Entfernung senkt
  das Hero-Chunk-Gewicht erheblich; erster Paint braucht kein Bild (LCP =
  H1-Text oder Skeleton-Panel). Fonts: JetBrains Mono zusätzlich, nur 400/500,
  `font-display: swap`, Subset.
- **Billing-State:** `billingYearly`-State und `/start?billing=…`-Weitergabe
  bleiben unverändert.
- **Branch:** `landing-relaunch-v3`. Deploy erst nach Abnahme.

## 7. Tests & Abnahme

- Bestehende Tests anpassen: `LandingNav.test.tsx`, `PackShowcase.test.tsx`,
  `ProofBar.test.ts` (ersetzen durch Test des neuen Anker-Streifens),
  `hero-film/meta.test.ts` löschen.
- Neu: Test für `HeroBuildLive`-Timeline (Phasen-Abfolge, Cleanup bei
  Unmount, Reduced-Motion-Pfad).
- Visuelle Prüfung 320/375/768/1024/1440 (Playwright-Screenshots), Fokus:
  Hero-Bühne mobil, Karussell-Touch, Preis-Anker-Nebeneinander → untereinander.
- A11y: Kontrast-Stichproben (muted/volt), Tastatur-Navigation Akkordeon +
  Karussell, `prefers-reduced-motion`.
- Lighthouse auf `/`: Performance ≥ 90 mobil, LCP < 2,5 s.

## 8. Risiken / bewusste Entscheidungen

- **Dunkle Seite für konservative Zielgruppe:** bewusst entschieden (D statt
  hellem E). Gegengewichte: hohe Kontraste, warme Ink-Töne, viel Weißraum,
  seriöse Trust-Sektion.
- **Kein Social Proof:** weiterhin keine erfundenen Testimonials. Der Beweis
  läuft über Demo-Transparenz („erst sehen, dann zahlen") und die
  Live-Animation. Echte Stimmen werden nachgerüstet, sobald vorhanden.
- **OG-Image & Favicon** passen nach dem Umbau visuell nicht mehr —
  Folge-Tasks, nicht Teil dieses Umbaus.
