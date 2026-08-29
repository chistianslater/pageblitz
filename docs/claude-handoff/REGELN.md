# Harte Regeln

Diese Liste ist verbindlich. Nicht „aus Kulanz“ umgehen.

## Produkt

- **Genau 14 Style-Packs.** Kein 15. Pack erfinden, keine Pack-ID umbenennen.
  Quelle: `shared/siteContract/packIds.ts`.
- **Preise und Add-on-Namen** nur aus `shared/pricing.ts`. Landing, Checkout,
  SEO-Prerender und Copy müssen dieselbe Zahl zeigen.
- **Keine erfundenen Testimonials**, Kundenzahlen oder Bewertungen
  (`Testimonials.tsx` rendert absichtlich nichts, solange die Liste leer ist).
- Google-Bewertungen auf Kundenseiten bleiben **read-only**.
- FAQ-Texte aus `shared/faq.ts` (auch JSON-LD). Nicht an einer Stelle
  umschreiben und an der anderen vergessen.

## Studio vs. Landing

- Studio-Tokens (`:root` `--lp-canvas` Papier/Grün, `studio.css`) **nicht**
  auf den Dayos-/Marketing-Look ziehen.
- Landing-Tokens nur auf **`.lp`** überschreiben (`client/src/index.css`).
- Layout-Chrome (Rahmen, „Preview“, Pack-Umschalter) nur im Studio
  `PreviewFrame` und auf `/design-review`. **Nie** auf live Kunden-Sites.

## Landing-Technik

- Hero-Film: `@remotion/player` in `hero-film/`, **lazy**, nicht im ersten
  Paint. LCP bleibt `/pack-previews/werkbank.webp`.
- `prefers-reduced-motion: reduce` → statisches Poster, kein Player.
- Remotion-`translate`-Interpolation: **eine Einheit pro Achse**
  (nicht `["48% 0%", "0% 0px"]` — das knallt zur Laufzeit).
- Player: `acknowledgeRemotionLicense`, `clickToPlay={false}`,
  `spaceKeyToPlayOrPause={false}`, `errorFallback={() => null}`, Pause wenn
  off-screen.
- Headlines: Sentence Case. Kein `text-transform: uppercase` auf `h1`/`h2`.
  Kickers bleiben Versalien mit Tracking.
- Barlow / zweite Display-Schrift **nicht** zurückholen. Nur Space Grotesk
  (self-hosted). Innerer Hero-Film darf Arial Black behalten (Werkbank-Stimme).
- Chat-Widget auf `/` bleibt lazy (`DeferredChatWidget` in `LandingPage.tsx`).

## Git / Build

- `.agents/` und `skills-lock.json` nicht committen (gitignored).
- Untracked Playwright-Snapshots unter `tests/visual/islands.spec.ts-snapshots/`
  und eine lokal erzeugte `pack-showcase-linux.png` nicht ungefragt committen.
- Deploy nutzt `npm ci --legacy-peer-deps`. Neue Deps: **beide** Lockfiles
  (`pnpm-lock.yaml` und `package-lock.json`).
- SQL-Migrationen von Hand (`drizzle/NNNN_….sql`). Kein
  `drizzle-kit generate` — das Journal ist veraltet (`docs/BETRIEB-V2.md` §3).

## Copy / SEO

- Produktwahrheit halten. Straffen ja, erfinden nein.
- Branchen-SEO-Routen `/website-erstellen/<slug>` sind SSR — mit `<a href>`,
  nicht mit wouter-`<Link>` (sonst SPA-404).
- Kontakt: `hallo@pageblitz.de` (JSON-LD). Chat-Widget erwähnt teilweise
  `hello@pageblitz.de` — bei Änderungen angleichen, nicht eine dritte Adresse
  einführen.
