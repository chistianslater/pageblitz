# Brief: Landingpage-Neubau im Pageblitz-Studio-Look

**Datum:** 2026-08-23 · **Status:** freigegeben („go!") · **Auftrag (Christian):** „die landingpage muss visuell auf ein neues niveau gehoben werden. zum pageblitz studio passen. ohne ai slop. generell auch im pageblitz studio bitte: Space Grotesk verwenden. in den Beispielen entweder echte Bilder oder Illustrationen verwenden."

## 1. Richtung (verbindlich)

Die Landingpage ist die Außenseite des Studios — gleiche Welt, nicht „Marketing-Template mit Studio-Farben". Referenz für die Welt ist `client/src/pages/onboarding-v2/studio.css`:

| Token | Wert | Rolle |
|---|---|---|
| Canvas | `#f3efe7` | warmes Papier, Seitenhintergrund |
| Surface | `#fbf9f4` | Karten/Leisten (wenn überhaupt) |
| Ink | `#1d1a17` | Text |
| Muted | `#6b645b` | Kleintext, Kicker |
| Line | `#d9d2c5` | Hairlines (1 px), Trenner, Rahmen |
| Accent | `#1f5f4b` | Aktion/„erledigt" — CTA-Fläche, Links, Markierungen; Text auf Accent `#ffffff` |
| Warn | `#a4441f` | nur für echte Warnungen |
| Schrift | `"Space Grotesk", system-ui, sans-serif` | **einzige** Schrift (Display + UI), Gewichte 300–700 |

Stilprinzipien („Editorial / Werkstatt-Papier"):
- **Hairlines statt Schatten.** Struktur durch 1-px-Linien, Spalten, Nummerierung, Kicker in Versalien mit Letterspacing (`0.12em`), nicht durch Karten-Schatten.
- **Hierarchie durch Größe und Gewicht**, nicht durch Farbe: Headlines groß (`clamp(2.5rem, 1.5rem + 4vw, 5.5rem)`), Gewicht 500, `letter-spacing: -0.02em`, `line-height: 1.02`; Fließtext 400, Kicker 500.
- **Eine Akzentfarbe, sparsam.** Grün für den primären CTA und für Zustands-/Fortschritts-Markierungen (Haken, „live"-Punkte). Keine Verläufe, keine Glows, keine Blobs, kein „Shimmer", keine Neon-Lime-Reste, kein Dark-Mode-Toggle (Landing ist hell; `prefers-color-scheme` wird ignoriert).
- **Echte Bilder statt Deko.** Die 14 Pack-Vorschauen (`/pack-previews/<pack>.webp`, werden nach dem Bild-Einbau neu gerendert) und die neuen Demo-Bilder (`/demo/<pack>-hero.webp`, `-detail-1.webp`, `-detail-2.webp`; Fotos bei werkbank/kanzlei/morgenlicht/gusto/patina/landgut/zunft/schimmer, Flat-Illustrationen bei klarwerk/fundament/verve/salon-noir/marktplatz/atelier) sind das Bildmaterial. Keine Stock-Icons-in-Kreisen, keine 3-Spalten-Feature-Karten mit Icon oben links.
- **Bewegung nur, wenn sie etwas erklärt** (z. B. der Studio-Ablauf: Checkliste füllt sich). `prefers-reduced-motion` respektieren; framer-motion bleibt via `LazyMotion` erlaubt, aber kein Eingangs-Stagger auf jeder Überschrift.
- **Raster:** 12-Spalten-Gefühl mit max-width ~ 1200 px, großzügige vertikale Rhythmen (`clamp(4rem, 3rem + 5vw, 9rem)` zwischen Sektionen), bewusst asymmetrische Kompositionen (Text links schmal, Bild/Vorschau rechts breit oder umgekehrt), keine zentrierten Stock-Hero-Layouts.

## 2. Inhalt (Produktwahrheit bleibt)

Aus `client/src/pages/LandingPage.tsx` (alt, 2.514 Zeilen) übernehmen — Copy darf gestrafft, aber nicht erfunden werden; Preise **nur** aus `shared/pricing.ts`:
1. **Navbar**: Logo (Blitz-Mark + „Pageblitz"), Links (Vorlagen, Ablauf, Preise, FAQ), CTA „Website erstellen" → Hero-Formular/`/start`; Login-Link. Mobile-Menü bleibt (Tastatur/ARIA).
2. **Hero**: Eingabefeld „Wie heißt dein Unternehmen?" + Submit (→ `handleHeroStart`-Logik 1:1 wie heute im Code), Kicker „Webagentur kostet 3.000 €+ – Pageblitz ab 19,90 €/Monat" (Preis aus `shared/pricing.ts`), H1 heute „Deine professionelle Website in 3 Minuten." (neu formulieren erlaubt, Aussage behalten), Subline. Rechts/unten: **echte Studio-Vorschau** (Screenshot-Komposition aus Pack-Previews oder ein stilisierter Studio-Rahmen mit Checkliste + Vorschaubild), kein abstrakter Blob.
3. **Für wen** (Branchen-Beispiele mit den neuen Bildern — 3–4 große Bildkacheln mit Pack-Name/Branche, nicht 12 Mini-Karten).
4. **GMB-Import** („Jetzt GMB-Daten importieren") als Schritt im Ablauf, nicht als eigene Bühne.
5. **Ablauf / Studio** („So funktioniert's"): 3–4 nummerierte Schritte in Checklisten-Optik des Studios (Name → Stil → Texte & Bilder → live), Nummern als typografisches Element.
6. **Vorlagen**: `PackShowcase` (14 Packs, Klick → Live-Vorschau-Dialog) — Komponente behalten und **restylen** (Hairline-Raster, Pack-Name + Essenz + Akzentpunkt, kein Karten-Schatten, `isDark` entfernen).
7. **Preise**: Basis + Add-ons aus `shared/pricing.ts`, als Preisliste in Tabellen-/Listenform mit Hairlines, ein primärer CTA; Billing-Toggle nur, wenn er heute existiert und funktioniert.
8. **FAQ**: `HOME_FAQ_ITEMS`, Accordion (Tastatur, `aria-expanded`), ruhig.
9. **Branchen-Links** („Website erstellen – nach Branche", `SEO_INDUSTRY_LINKS`) als kompakte Linkliste im Fußbereich (SEO-relevant, bleibt).
10. **Footer**: Impressum/Datenschutz/AGB-Links wie heute, `LandingPageChatWidget` bleibt gemountet (nur Trigger-Optik an Tokens anpassen, wenn trivial).
11. **SEO/Meta/JSON-LD**: alles, was heute gesetzt wird (Title, Description, Schema), unverändert übernehmen.

## 3. Technische Leitplanken
- Dateien: `client/src/pages/LandingPage.tsx` neu (Ziel < 800 Zeilen; Sektionen in `client/src/components/landing/*.tsx` auslagern, je < 300 Zeilen), Styles bevorzugt als Tailwind-Klassen mit den Tokens als CSS-Variablen in `client/src/index.css` (`--lp-*`), kein `isDark`-Prop mehr, `localStorage lp-theme` entfernen. `BackgroundGradientAnimation` wird nicht mehr verwendet (Datei löschen, wenn kein anderer Import).
- Bundle-Budget `/`: nicht größer als heute (B5: ~245 kB gzip JS); Hero-Bild `loading="eager" fetchpriority="high"`, alles andere lazy, alle Bilder mit width/height.
- a11y: axe 0 critical/serious (`tests/visual/a11y.spec.ts` — die Dark-Mode-Variante für `/` entfällt mit dem Toggle; Test entsprechend anpassen und im Bericht nennen), Kontraste ≥ 4,5:1 (Muted `#6b645b` auf Canvas ≈ 5,2:1 ok; Accent `#1f5f4b` auf Canvas ok).
- Tests: `tests/visual/landing.spec.ts` Baselines neu (nur diese + ggf. a11y), `PackShowcase.test.tsx` anpassen, `npx tsc` 0, `npx vitest run` grün, `PW_PROJECT=prod npx playwright test --project=prod` grün.
- Screenshots (Desktop 1440, Mobile 390) der fertigen Seite als Abnahme-Artefakte in den Scratchpad legen und Pfade im Bericht nennen.

## 4. Nicht im Umfang
Studio-/Dashboard-Optik (außer Schrift, schon erledigt), Start-Page (`/start`), Rechtsseiten, SEO-Landingpages (`server/seo`).
