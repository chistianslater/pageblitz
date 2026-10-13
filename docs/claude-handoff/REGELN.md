# Harte Regeln

Diese Liste ist verbindlich. Nicht „aus Kulanz“ umgehen.

## Produkt

- **Sechs Designsysteme** (`journal`, `raster`, `werkstoff`, `plakat`, `klar`,
  `nacht`), nur rev 3; kein Pack-Renderer mehr. Quelle:
  `shared/designSystems/types.ts`. Die 20 **Textstimmen**
  (`shared/siteContract/packIds.ts`, `shared/textVoices/`) steuern nur Texte;
  keine Stimmen-ID umbenennen, das Feld `stylePackId` bleibt (Rollback).
- **Preise und Add-on-Namen** nur aus `shared/pricing.ts`. Landing, Checkout,
  SEO-Prerender und Copy müssen dieselbe Zahl zeigen.
- **Keine erfundenen Testimonials**, Kundenzahlen oder Bewertungen
  (`Testimonials.tsx` rendert absichtlich nichts, solange die Liste leer ist).
- Google-Bewertungen auf Kundenseiten bleiben **read-only**.
- FAQ-Texte aus `shared/faq.ts` (auch JSON-LD). Nicht an einer Stelle
  umschreiben und an der anderen vergessen.

## Änderungen an Systemen einstufen

Das Design liegt im Code, nicht im Dokument: Eine geänderte Zeile in
`client/src/components/site/systems/<id>/` oder `shared/designSystems/<id>.ts`
verändert **jede** Kundenseite dieses Systems beim nächsten Aufruf. Jede
Änderung bekommt im Commit eine von zwei Einstufungen:

- **Korrektur** — Kontrast, Umbruch, Klickbarkeit, Sicherheit, Performance.
  Gilt sofort für alle.
- **Gestaltung** — Hero-Komposition, Typo-Skala, Sektionsreihenfolge,
  Farbstimmungen. Gehört in einen neuen Design-Stand, nicht in den laufenden.

Im Zweifel **Gestaltung**.

**Byte-Gleichheit als Regel:** Ein Aufräum- oder Umbau-Commit ändert das
SSR-HTML der Systeme nicht. Nachweis: `scripts/seiten-fingerabdruck.ts` —
Basis vor dem Umbau erzeugen (`--beispiele --fixtures --aus basis`, bei
Live-Dokumenten `--datei export.json`), danach mit `--aus nach` erzeugen und
mit `--vergleich` prüfen; erlaubt ist nur, was im Commit ausdrücklich als
Abweichung gelistet ist. Als String ins HTML inlinete CSS/JS-Konstanten
(`SITE_ENHANCER_JS`, `RICH_TEXT_CSS` …) sind eingefroren.

**Rollback-Sicherheit:** Der vorherige Prod-Commit muss jedes Dokument lesen
können, das der neue Code schreibt — Schema nicht erweitern, Felder nicht
umbenennen.

Hintergrund: `docs/superpowers/specs/2026-10-10-designsysteme-design.md`.

## Studio vs. Landing

- Studio-Tokens (`:root` `--lp-canvas` Papier/Grün, `studio.css`) **nicht**
  auf den Dayos-/Marketing-Look ziehen.
- Landing-Tokens nur auf **`.lp`** überschreiben (`client/src/index.css`).
- Layout-Chrome (Rahmen, „Preview“, System-Umschalter) nur im Studio
  `PreviewFrame` und auf `/design-review`. **Nie** auf live Kunden-Sites.

## Landing-Technik

- Hero-Film: `@remotion/player` in `hero-film/`, **lazy**, nicht im ersten
  Paint. LCP: siehe `Klarstart` (kein Pack-Vorschaubild mehr).
- `prefers-reduced-motion: reduce` → statisches Poster, kein Player.
- Remotion-`translate`-Interpolation: **eine Einheit pro Achse**
  (nicht `["48% 0%", "0% 0px"]` — das knallt zur Laufzeit).
- Player: `acknowledgeRemotionLicense`, `clickToPlay={false}`,
  `spaceKeyToPlayOrPause={false}`, `errorFallback={() => null}`, Pause wenn
  off-screen.
- Headlines: Sentence Case. Kein `text-transform: uppercase` auf `h1`/`h2`.
  Kickers bleiben Versalien mit Tracking.
- Barlow / zweite Display-Schrift **nicht** zurückholen. Nur Space Grotesk
  (self-hosted). Innerer Hero-Film darf Arial Black behalten (Hero-Film-Stimme).
- Chat-Widget auf `/` bleibt lazy (`DeferredChatWidget` in `LandingPage.tsx`).

## Git / Build

- `.agents/` und `skills-lock.json` nicht committen (gitignored).
- Untracked Playwright-Snapshots unter `tests/visual/islands.spec.ts-snapshots/`
  nicht ungefragt committen.
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
