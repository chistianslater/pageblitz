# Landing `/` — Designstand

Die Showroom-Seite ist **nicht** das Studio. Tokens nur auf `.lp`.
Schrift überall Space Grotesk (Variable, self-hosted,
`client/public/fonts/`).

Referenz der Sektionsenergie: [https://www.dayos.com/](https://www.dayos.com/).
Nicht Barlow zurückholen, nicht alle H2 in Versalien schreien.

## Token-Schicht (nur `.lp`)

| Token | Wert | Rolle |
|---|---|---|
| `--lp-canvas` | `#e5e5e5` | warmer Grau-Boden |
| `--lp-surface` | `#ffffff` | Karten |
| `--lp-ink` | `#000000` | Text + Primary-CTA |
| `--lp-muted` | `#444444` | Fließtext |
| `--lp-line` | `rgba(0,0,0,0.08)` | Hairlines |
| `--lp-mint` | `#d1ffca` | Kicker, Selection, Vergleichsspalte |
| `--lp-volt` | `#fff100` | knappe Punkte (Trust-Linie, Proof) |
| `--lp-display` | Space Grotesk 700 | Headlines |
| `--lp-ease` | `cubic-bezier(0.23, 1, 0.32, 1)` | Motion |

Global (`:root`) bleiben die Studio-Papierwerte — Cookie-Banner und Portale
außerhalb von `.lp` erben die. `--lp-mint` / `--lp-volt` liegen global,
werden auf der Landing genutzt.

## Typo & Chrome (Apple-optical, behalten)

- H1/H2: Sentence Case, Tracking nach Größe (`.lp-h1` ≈ −0.028em / lh 1.04,
  `.lp-h2` ≈ −0.022em / lh 1.08).
- Kickers: Mint-Pille, Versalien, `letter-spacing: 0.08em`.
- Nav: `.lp-nav-pill` — `blur(20px) saturate(180%)`, dichter bei
  `data-scrolled`. Fallback bei `prefers-reduced-transparency` / more-contrast.
- Press: `.lp-press` `scale(0.97)` 140ms. Hover nur hinter
  `(hover: hover) and (pointer: fine)`.
- Reveal: IntersectionObserver setzt `lp-in`; bei `prefers-reduced-motion`
  kein `lp-reveal-on`. Hub: 8px / 400ms, nicht 24px.

## Dayos-Sektionsmotive (2026-08-29)

Jede Bühne hat ein eigenes Layout, nicht dieselbe 8/4-Kartenformel.

| Klasse / Baustein | Zweck |
|---|---|
| `.lp-h2--billboard` | eine Stufe größer, lh 1 |
| `.lp-echo` | Ghost-Kopie des Titels, `opacity: 0.22`, `aria-hidden` |
| `.lp-manifesto` | volle Mint-Fläche, Kicker schwarz/weiß |
| `.lp-pillar` | ein Wort trägt die Feature-Karte |
| `.lp-stage-card` | weiße Fläche, Radius 40px |
| `SectionHead` `billboard` / `echo` | in `primitives.tsx` |

**Wichtig:** Eine Outline-Echo (`color: transparent` + text-stroke) war
unsichtbar. Echo muss **gefüllt** `currentColor` + Opacity sein.

Vite-CSS-Cache: nach Änderungen an `index.css` Dev-Server neu starten, wenn
die Klasse in den Devtools nicht ankommt.

## Seitenordnung

`LandingPage.tsx`:

1. `LandingNav`
2. `LandingHero` — H1 „Deine Website in 3 Minuten.“ + Remotion-Bühne
3. `ProofBar` — weiße Zahlenleiste, Volt-Punkte, Count-up
4. `ProblemSection` — Billboard + Echo + 3 Verlustkarten
5. `ManifestoBand` — Mint: „Wir ersetzen die Agentur nicht durch ein Tool.“
6. `HowItWorks` (`#ablauf`) — vier Schritte, „Immer dabei“-Karten
7. `ForWhom` — 4 Branchen (zunft, kanzlei, gusto, morgenlicht; kein Werkbank)
8. `StudioProof` — drei CSS-Schemata, keine Pack-Screenshots
9. `FeatureShowcase` — dunkel, Pillars **Antworten / Zeigen / Buchen**
10. `Pricing` (`#pricing`) — eine Karte, dann Vergleichstabelle (Mint-Spalte)
11. `PackShowcase` (`#showcase`) — 14 Packs, Modal → `/demo/<id>`
12. `TrustSection` — Tags Recht / Hosting / Inhalte / Vertrag
13. `Testimonials` — no-op solange leer
14. `IndustryLinks` (`#branchen`)
15. `Faq` (`#faq`)
16. `FinalCta` — dunkel, Echo auf „Erst sehen. Dann entscheiden.“
17. `LandingFooter` — „Fragen? Schreib uns →“
18. `StickyCta` — mobil, verschwindet am Final-CTA
19. `DeferredChatWidget`

Einstieg Hero/Final: Firmenname → `/start?billing=…&name=…`.

## Hero-Film

`client/src/components/landing/hero-film/` + Wrapper `HeroBuild.tsx`.

- 1280×800, 30 fps, 390 Frames (~13 s), Loop.
- Verlauf: Werkbank-Poster → Glitch → SiteBuild (Brandt-Nav, Maßarbeit /
  aus Holz. / Punkt., Foto, Marquee, Chips LAYOUT/COPY/PHOTO/LIVE) → Wipe.
- Innerer Film: Arial Black (Pack-Stimme), nicht Space Grotesk.
- Studio: `npm run remotion`.

## Dateien

```
client/src/pages/LandingPage.tsx
client/src/index.css                 # .lp … .lp-final-dark, Skizzen .lps-*
client/src/components/landing/
  primitives.tsx                     # Kicker, SectionHead, Pillen, Preise
  LandingNav.tsx / LandingHero.tsx / HeroBuild.tsx
  ProofBar.tsx / ProblemSection.tsx / ManifestoBand.tsx
  HowItWorks.tsx / ForWhom.tsx / StudioProof.tsx
  FeatureShowcase.tsx / Pricing.tsx / PackShowcase.tsx
  TrustSection.tsx / Testimonials.tsx / Faq.tsx
  LandingFooter.tsx / StickyCta.tsx
  hero-film/                         # Remotion
client/src/components/LandingPageChatWidget.tsx
tests/visual/landing.spec.ts
```

SEO-Prerender `/`: `server/seo/homePage.ts` (FAQPage-Schema). Meta in
`client/index.html`.

## Tests zur Landing

- `ProofBar.test.ts` — Counter-Easing
- `LandingNav.test.tsx`, `PackShowcase.test.tsx`
- `tests/visual/landing.spec.ts` — Modal, Fokusfalle, Mobile-Menü, Sticky-CTA
- Showcase-Screenshot-Test erwartet 14 geladene `/pack-previews/*.webp`

## Was nicht tun

- Keinen vierten „kompletten Look“ (neues Font-Paar, neues Canvas).
- Remotion nicht in den kritischen `/`-Chunk ziehen.
- Pack-IDs und Preiscopy nicht „fürs Design“ ändern.
- `studio.css` / `:root`-Papierwerte nicht anfassen, um die Landing zu matchen.
