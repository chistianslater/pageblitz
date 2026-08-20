# Style Packs v2 — Plan B: Leuchtturm-Packs + Generierung

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drei weitere Packs (Kanzlei, Morgenlicht, Gusto), v2-Anbindung an die bestehenden Preview-/Site-Pfade und die LLM-Generierung nach dem Prinzip „LLM liefert Inhalte, nie Design".

**Architecture:** Baut ausschließlich auf Plan A auf (Vertrag, Registry, Engine, SSR, Visual-Harness). Jedes Pack = Verfassung (`shared/stylePacks/<id>.ts`) + Fixtures + Pack-Modul (`client/…/packs/<id>/`) + Baselines. Generierung: `buildContentPrompt` aus der Verfassung, zod-Validierung mit einem Retry, Pack-Wahl über Registry + bestehende `layoutCounters`-Rotation.

**Tech Stack:** wie Plan A. Zusätzlich: bestehende LLM-Anbindung `server/_core/llm.ts`, Rotation `getNextLayoutForIndustry` (`server/db.ts:490`), Job-Pfad `selfService.generateWebsiteAsync` (`server/routers.ts:5059`).

**Spec:** `docs/superpowers/specs/2026-08-20-style-packs-design.md`
**Voraussetzung:** Plan A (`2026-08-20-style-packs-a-fundament.md`) vollständig umgesetzt UND Werkbank-Checkpoint vom User freigegeben.

## Global Constraints

Wie Plan A. Zusätzlich:
- Jede neue Pack-CSS-Klasse trägt das Pack-Kürzel-Präfix (`pb-kz-`, `pb-ml-`, `pb-gu-`).
- Verfassungswerte kommen aus `docs/design/stilkatalog.html` (Kacheln 03, 05, 07) — Farben/Fonts NICHT frei erfinden.
- Nach jedem Pack: `PACKS`-Liste in `tests/visual/packs.spec.ts` erweitern, `pnpm test:visual:update`, PNGs sichten, committen.
- Altsystem bleibt funktionsfähig, bis Plan C den Cutover macht.

---

### Task 1: Pack „Kanzlei" (Verfassung, Fixtures, Modul, Baselines)

**Files:**
- Create: `shared/stylePacks/kanzlei.ts`
- Modify: `shared/stylePacks/index.ts` (Registry-Eintrag `kanzlei: KANZLEI`)
- Modify: `shared/siteContract/fixtures.ts` (Fixtures `kanzlei` full/minimal)
- Create: `client/src/components/site/packs/kanzlei/css.ts`
- Create: `client/src/components/site/packs/kanzlei/index.tsx`
- Modify: `client/src/components/site/packs/index.ts` (`import "./kanzlei";`)
- Modify: `tests/visual/packs.spec.ts` (`PACKS = ["werkbank", "kanzlei"]`)
- Test: `client/src/components/site/packs/kanzlei/kanzlei.test.tsx`

**Interfaces:**
- Consumes: `PackConstitution`, `PackModule`, `PACK_MODULES`, `orderedSections`, `SECTION_ANCHORS`, `getFixture` (Plan A).
- Produces: `KANZLEI: PackConstitution`, `KANZLEI_MODULE: PackModule`, Fixtures „Roth & Weber Steuerberater, Köln".

- [ ] **Step 1: Failing Tests (Registry + Rendering)**

```tsx
// client/src/components/site/packs/kanzlei/kanzlei.test.tsx
import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";

describe("Pack kanzlei", () => {
  test("Verfassung registriert, Signatur enthält Raster + Mono-Index", () => {
    const c = getConstitution("kanzlei");
    expect(c.signature.decor).toContain("column-grid");
    expect(c.signature.decor).toContain("mono-index");
  });
  const html = renderToStaticMarkup(<SiteRenderer data={getFixture("kanzlei", "full")} />);
  test("eine h1, deutsche Anker, Signatur-Klassen", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('id="leistungen"');
    expect(html).toContain("pb-kz-grid");
    expect(html).toContain("pb-kz-idx");
  });
  test("Kennzahlen-Leiste rendert", () => {
    expect(html).toContain("pb-kz-facts");
  });
});
```

- [ ] **Step 2: Run — FAIL erwartet**

Run: `pnpm vitest run client/src/components/site/packs/kanzlei/kanzlei.test.tsx`

- [ ] **Step 3: Verfassung implementieren**

```ts
// shared/stylePacks/kanzlei.ts  (Werte aus docs/design/stilkatalog.html, Kachel 03)
import type { PackConstitution } from "./types";

export const KANZLEI: PackConstitution = {
  id: "kanzlei", name: "Kanzlei",
  essence: "Weißraum, Hairlines und ein tiefes Blau — Ordnung als Ästhetik.",
  industries: ["steuerberater", "rechtsanwalt", "anwalt", "notar",
    "unternehmensberatung", "finanzberater", "wirtschaftspruefer", "buchhaltung"],
  theme: "light",
  palette: [
    { name: "Papier", hex: "#F7F7F4", role: "canvas", usage: "Seitengrund — warmes Fast-Weiß." },
    { name: "Bogen", hex: "#FFFFFF", role: "surface", usage: "Karten, Hervorhebungsflächen." },
    { name: "Tinte", hex: "#101012", role: "ink", usage: "Text, harte 1px-Linien." },
    { name: "Grau", hex: "#54544E", role: "muted", usage: "Sekundärtext, Bildunterschriften." },
    { name: "Hairline", hex: "#D8D8D2", role: "line", usage: "Rasterlinien, Spalten-Trenner." },
    { name: "Royal", hex: "#1D3FBF", role: "accent", locked: true,
      usage: "Mono-Etiketten, Links, Unterstreichungen — nie als Fläche." },
    { name: "Weiß", hex: "#FFFFFF", role: "accent-contrast", usage: "Text auf Royal." },
  ],
  type: {
    display: { family: "Inter Tight", weights: [600, 700],
      fallback: "system-ui, sans-serif", googleCss: "Inter+Tight:wght@600;700" },
    body: { family: "Inter Tight", weights: [400, 500],
      fallback: "system-ui, sans-serif", googleCss: "Inter+Tight:wght@400;500" },
    utility: { family: "IBM Plex Mono", weights: [400, 500],
      fallback: "monospace", googleCss: "IBM+Plex+Mono:wght@400;500" },
    scale: { basePx: 16, ratio: 1.25, heroClamp: "clamp(2.4rem, 5.4vw, 4.4rem)" },
  },
  shape: { radiusCard: "0px", radiusButton: "0px", buttonStyle: "hairline-underline",
    density: "airy" },
  signature: {
    hero: "sichtbares Spaltenraster + Mono-Eyebrow + zweifarbige Display-Headline + Seiten-Index rechts oben + §-Wasserzeichen",
    decor: ["column-grid", "mono-index", "paragraph-watermark", "facts-rule"],
    imageTreatment: "entsättigt, kühl, in Hairline-Rahmen, nie randlos",
  },
  llmHints: {
    do: ["präzise, nüchterne Sprache", "Zahlen und Fakten nach vorn",
      "kurze Substantiv-Headlines (2–3 Wörter)"],
    dont: ["Superlative", "Emotionalisierung", "Emojis oder Ausrufezeichen"],
  },
};
```

Registry-Eintrag in `shared/stylePacks/index.ts` ergänzen (`import { KANZLEI } from "./kanzlei";` + `kanzlei: KANZLEI,`).

- [ ] **Step 4: Fixtures ergänzen**

In `shared/siteContract/fixtures.ts`: „Roth & Weber Steuerberater", Köln, seit 1998. full: hero („Klarheit in Zahlen.", CTA „Erstgespräch anfragen"), services (4: Jahresabschluss, Lohnbuchhaltung, Steuergestaltung, Gründungsberatung — je 1 Satz), about (~80 Wörter, nüchtern), testimonials (2, Mandanten), faq (3 Fragen: Kosten, Unterlagen, Fristen), contact (Adresse Köln, Öffnungszeiten Mo–Do 8–17, Fr 8–14), `google: { rating: 4.8, reviewCount: 41 }`. minimal: hero, services, contact.

- [ ] **Step 5: Pack-Modul implementieren**

```ts
// client/src/components/site/packs/kanzlei/css.ts — Kern (vollständig ausformulieren)
export const KANZLEI_CSS = `
.pb-kanzlei{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.55}
.pb-kz-grid{background-image:linear-gradient(90deg,var(--pb-line) 1px,transparent 1px);background-size:25% 100%;background-position:14px 0}
.pb-kz-nav{display:flex;align-items:center;gap:20px;padding:20px 32px;border-bottom:1px solid var(--pb-ink);font-size:13px;font-weight:500}
.pb-kz-logo{font-weight:700;font-family:var(--pb-font-display)}
.pb-kz-idx{position:absolute;right:32px;top:86px;font-family:var(--pb-font-utility);font-size:11px;color:var(--pb-accent);text-align:right;line-height:1.9}
.pb-kz-watermark{position:absolute;right:20px;bottom:-40px;font-size:200px;color:var(--pb-accent);opacity:.07;line-height:1;pointer-events:none}
.pb-kz-eyebrow{font-family:var(--pb-font-utility);font-size:11px;letter-spacing:.1em;color:var(--pb-accent);margin-bottom:14px;text-transform:uppercase}
.pb-kz-hero{position:relative;padding:64px 32px 48px;overflow:hidden}
.pb-kz-hero h1{font-family:var(--pb-font-display);font-weight:600;font-size:var(--pb-hero-size);letter-spacing:-.035em;line-height:1.0;max-width:14ch}
.pb-kz-hero h1 span{color:var(--pb-muted)}
.pb-kz-facts{display:flex;margin:44px 32px 0;border-top:1px solid var(--pb-line)}
.pb-kz-facts div{flex:1;padding:14px 14px 0 0;font-size:12px;color:var(--pb-muted);border-right:1px solid var(--pb-line);margin-right:14px}
.pb-kz-facts div:last-child{border-right:none}
.pb-kz-facts b{display:block;font-size:19px;color:var(--pb-ink);font-weight:600;letter-spacing:-.02em}
.pb-kz-link{color:var(--pb-accent);font-weight:600;text-decoration:none;border-bottom:2px solid var(--pb-accent)}
.pb-kz-section{padding:72px 32px;border-top:1px solid var(--pb-line);position:relative}
.pb-kz-section h2{font-family:var(--pb-font-display);font-weight:600;letter-spacing:-.02em;font-size:clamp(1.5rem,2.6vw,2.1rem);margin-bottom:26px}
@media(max-width:720px){.pb-kz-idx{display:none}.pb-kz-facts{flex-direction:column;gap:14px}}
`;
```

`index.tsx`-Struktur: Nav (Logo links, Links rechts, KEIN Button — CTA ist ein `pb-kz-link` mit Pfeil „→"). Hero: `pb-kz-eyebrow` = `{businessCategory} — {stadt}`, `<h1>` (letztes Wort in `<span>` grau), rechts `pb-kz-idx` (businessCategory versal umgebrochen + „— 01 / 0N" mit N = Sektionszahl), `pb-kz-watermark` = „§". Facts-Leiste nach dem Hero: bis zu 3 Kennzahlen (services.length → „N Leistungsfelder"; google.rating → „★ N,N"; google.reviewCount → „N Bewertungen"; fehlende weglassen). Root trägt `pb-kanzlei pb-kz-grid`. Leistungen als Zeilen mit Mono-Nummern (wie werkbank-Muster, aber Hairlines statt Kohle-Linien), Testimonials als Zitate mit Hairline links, Kontakt zweispaltig. Dateiende:

```tsx
export const KANZLEI_MODULE: PackModule = { id: "kanzlei", css: KANZLEI_CSS, Page: KanzleiPage };
PACK_MODULES.kanzlei = KANZLEI_MODULE;
```

- [ ] **Step 6: Tests grün + Baselines + Commit**

Run: `pnpm vitest run client/src/components/site/packs/kanzlei/kanzlei.test.tsx shared/stylePacks/registry.test.ts shared/siteContract/fixtures.test.ts`
Expected: PASS (Plan-A-Tests bleiben grün)
Run: `pnpm test:visual:update` → 6 neue PNGs (kanzlei), gegen Katalog-Kachel 03 sichten.
Run: `pnpm test:visual` → 12 passed

```bash
git add shared/stylePacks/ shared/siteContract/fixtures.ts client/src/components/site/packs/ tests/visual/
git commit -m "feat: Style Pack kanzlei (Spaltenraster, Mono-Index, Paragraph-Wasserzeichen)"
```

---

### Task 2: Pack „Morgenlicht"

**Files:**
- Create: `shared/stylePacks/morgenlicht.ts` · Modify: `shared/stylePacks/index.ts`
- Modify: `shared/siteContract/fixtures.ts` (Zahnarztpraxis Dr. Sommer, Hamburg)
- Create: `client/src/components/site/packs/morgenlicht/css.ts` + `index.tsx`
- Modify: `client/src/components/site/packs/index.ts`, `tests/visual/packs.spec.ts`
- Create: `client/public/demo/morgenlicht-hero.jpg` (helles Praxisfoto, < 300 kb, Quelle im Commit)
- Test: `client/src/components/site/packs/morgenlicht/morgenlicht.test.tsx`

**Interfaces:** wie Task 1; Produces `MORGENLICHT: PackConstitution`, `MORGENLICHT_MODULE: PackModule`.

- [ ] **Step 1: Failing Test** — gleicher Aufbau wie Task 1 Step 1 (Imports identisch, Fixture `morgenlicht`), mit diesen Assertions: `getConstitution("morgenlicht").signature.decor` enthält `"image-blob"` und `"float-cards"`; HTML enthält `pb-ml-blob`, `pb-ml-float`, `pb-ml-wave`; genau eine h1; Anker `leistungen` und `kontakt` vorhanden.

- [ ] **Step 2: Run — FAIL erwartet**

Run: `pnpm vitest run client/src/components/site/packs/morgenlicht/morgenlicht.test.tsx`

- [ ] **Step 3: Verfassung implementieren** (Kachel 05)

```ts
// shared/stylePacks/morgenlicht.ts
import type { PackConstitution } from "./types";

export const MORGENLICHT: PackConstitution = {
  id: "morgenlicht", name: "Morgenlicht",
  essence: "Helles Salbeigrün, runde Formen, viel Luft — beruhigend wie ein guter Empfang.",
  industries: ["zahnarzt", "arzt", "physiotherapie", "ergotherapie", "logopaedie",
    "psychotherapie", "hebamme", "pflege", "tierarzt", "apotheke"],
  theme: "light",
  palette: [
    { name: "Morgen", hex: "#F4F8F7", role: "canvas", usage: "Seitengrund." },
    { name: "Weiß", hex: "#FFFFFF", role: "surface", usage: "Karten, Pillen-Nav." },
    { name: "Tanne", hex: "#1C2B29", role: "ink", usage: "Text." },
    { name: "Nebel", hex: "#5C6E6B", role: "muted", usage: "Sekundärtext." },
    { name: "Lind", hex: "#DCEAE7", role: "line", usage: "Bänder, sanfte Flächen, Chips." },
    { name: "Salbei", hex: "#2E7E78", role: "accent",
      usage: "CTA, Akzentwort, Chips-Text — override-fähig für Praxisfarben." },
    { name: "Weiß", hex: "#FFFFFF", role: "accent-contrast", usage: "Text auf Salbei." },
  ],
  type: {
    display: { family: "Plus Jakarta Sans", weights: [800],
      fallback: "system-ui, sans-serif", googleCss: "Plus+Jakarta+Sans:wght@800" },
    body: { family: "Plus Jakarta Sans", weights: [400, 600],
      fallback: "system-ui, sans-serif", googleCss: "Plus+Jakarta+Sans:wght@400;600" },
    scale: { basePx: 16, ratio: 1.2, heroClamp: "clamp(2.2rem, 4.8vw, 3.6rem)" },
  },
  shape: { radiusCard: "18px", radiusButton: "999px", buttonStyle: "pill", density: "airy" },
  signature: {
    hero: "Pillen-Nav als schwebende Leiste + organischer Bild-Blob rechts + 2 schwebende Info-Karten (Öffnungszeiten, Google-Rating) + Wellen-Übergang in Lind-Band mit Leistungs-Chips",
    decor: ["pill-nav", "image-blob", "float-cards", "wave-divider"],
    imageTreatment: "weich, hell, im Blob (border-radius:58% 42% 55% 45%/55% 48% 52% 45%)",
  },
  llmHints: {
    do: ["warm und beruhigend", "Patienten-Perspektive (Sie-Form)",
      "konkrete Entlastung benennen (Angst nehmen, erklären, Zeit)"],
    dont: ["Fachjargon ohne Erklärung", "Dringlichkeit oder Druck", "Heilversprechen"],
  },
};
```

- [ ] **Step 4: Fixtures ergänzen**

„Zahnarztpraxis Dr. Sommer", Hamburg-Eppendorf. full: hero („Ein Lächeln beginnt mit Vertrauen.", imageUrl `/demo/morgenlicht-hero.jpg`), services (4: Prophylaxe, Implantate, Kinderzahnheilkunde, Angstpatienten-Sprechstunde), about (~80 Wörter), testimonials (3), faq (3: Kosten, Angst, Termine), contact (Öffnungszeiten Mo–Fr 8–18), `google: { rating: 4.9, reviewCount: 128 }`. minimal: hero, services, contact.

- [ ] **Step 5: Pack-Modul implementieren**

CSS-Kern (`pb-ml-`, vollständig ausformulieren): `.pb-ml-nav` (weiße Pille, `border-radius:999px`, Schatten `0 2px 10px rgba(28,60,56,.06)`, sticky top 12px), `.pb-ml-blob` (`position:absolute;right:-40px;top:50px;width:46%;height:300px`, Blob-Radius aus der Verfassung, Hintergrund = `imageUrl` als `background-image` mit `background-size:cover`, Fallback Linear-Gradient Lind→Salbei), `.pb-ml-float` (weiße Karte, `border-radius:16px`, Schatten `0 8px 24px rgba(28,60,56,.14)`; `.f1` rotate(3deg) = „Heute geöffnet" + heutige Öffnungszeit aus contact; `.f2` rotate(-2deg) = `★ {rating}` + `{reviewCount} Google-Bewertungen`; ohne Daten nicht rendern), `.pb-ml-wave` (Inline-SVG `<path d="M0,18 C100,32 200,2 300,14 C400,26 500,6 600,16 L600,30 L0,30 Z">`, `fill` = `var(--pb-line)`, `preserveAspectRatio="none"`), `.pb-ml-band` (Lind-Fläche mit Leistungs-Chips: weiße Pillen, Salbei-Text), Sektionen als weiche weiße Karten (`border-radius:var(--pb-radius-card)`) auf Morgen-Grund, CTA-Pille Salbei. Mobil (≤ 640px): Blob `opacity:.3` hinter dem Text, Floats `display:none`. Registrierung:

```tsx
export const MORGENLICHT_MODULE: PackModule = { id: "morgenlicht", css: MORGENLICHT_CSS, Page: MorgenlichtPage };
PACK_MODULES.morgenlicht = MORGENLICHT_MODULE;
```

- [ ] **Step 6: Tests + Baselines + Commit**

Run: `pnpm vitest run client/src/components/site/packs/morgenlicht/morgenlicht.test.tsx` → PASS
`tests/visual/packs.spec.ts`: `PACKS = ["werkbank", "kanzlei", "morgenlicht"]`
Run: `pnpm test:visual:update` → sichten (Kachel 05) → `pnpm test:visual` → 18 passed

```bash
git add shared/ client/src/components/site/packs/ tests/visual/ client/public/demo/
git commit -m "feat: Style Pack morgenlicht (Blob, Schwebekarten, Wellen-Band)"
```

---

### Task 3: Pack „Gusto"

**Files:**
- Create: `shared/stylePacks/gusto.ts` · Modify: `shared/stylePacks/index.ts`
- Modify: `shared/siteContract/fixtures.ts` (Trattoria Lucia, Berlin-Charlottenburg)
- Create: `client/src/components/site/packs/gusto/css.ts` + `index.tsx`
- Modify: `client/src/components/site/packs/index.ts`, `tests/visual/packs.spec.ts`
- Create: `client/public/demo/gusto-hero.jpg` (dunkles Food-Foto, < 300 kb, Quelle im Commit)
- Test: `client/src/components/site/packs/gusto/gusto.test.tsx`

**Interfaces:** Produces `GUSTO: PackConstitution` (**erste dunkle Verfassung**, `theme: "dark"` — prüft, dass Engine/SSR nichts Helles hartkodieren), `GUSTO_MODULE: PackModule`.

- [ ] **Step 1: Failing Test** — gleicher Aufbau wie Task 1 Step 1 (Fixture `gusto`), Assertions: `getConstitution("gusto").theme === "dark"`; `signature.decor` enthält `"double-frame"` und `"dotted-menu"`; HTML enthält `pb-gu-frame` und `pb-gu-menu`; die menu-Sektion rendert Kategorienamen und Preise aus der Fixture; genau eine h1.

- [ ] **Step 2: Run — FAIL erwartet**

Run: `pnpm vitest run client/src/components/site/packs/gusto/gusto.test.tsx`

- [ ] **Step 3: Verfassung implementieren** (Kachel 07)

```ts
// shared/stylePacks/gusto.ts
import type { PackConstitution } from "./types";

export const GUSTO: PackConstitution = {
  id: "gusto", name: "Gusto",
  essence: "Espresso-Dunkel, warmes Gold, kursive Serifen — ein Abend in einem Satz.",
  industries: ["restaurant", "trattoria", "weinbar", "bar", "catering", "bistro"],
  theme: "dark",
  palette: [
    { name: "Espresso", hex: "#16110D", role: "canvas", usage: "Seitengrund — die dunkle Bühne." },
    { name: "Mokka", hex: "#241C15", role: "surface", usage: "Karten, Menü-Flächen." },
    { name: "Creme", hex: "#F3E9DB", role: "ink", usage: "Text auf dunklem Grund." },
    { name: "Sand", hex: "#B9A88F", role: "muted", usage: "Sekundärtext, Beschreibungen." },
    { name: "Rauch", hex: "#3A2F22", role: "line", usage: "Punktlinien, Hairlines, Divider." },
    { name: "Gold", hex: "#C99B4A", role: "accent", locked: true,
      usage: "Rahmen, Preise, Eyebrows, CTA-Fläche — nie als Textfläche über 24px." },
    { name: "Espresso", hex: "#16110D", role: "accent-contrast", usage: "Text auf Gold." },
  ],
  type: {
    display: { family: "Playfair Display", weights: [500],
      fallback: "Georgia, serif", googleCss: "Playfair+Display:ital,wght@0,500;1,500" },
    body: { family: "Lato", weights: [300, 400],
      fallback: "system-ui, sans-serif", googleCss: "Lato:wght@300;400" },
    scale: { basePx: 16, ratio: 1.25, heroClamp: "clamp(2.4rem, 5vw, 4.2rem)" },
  },
  shape: { radiusCard: "0px", radiusButton: "0px", buttonStyle: "letterspaced-uppercase",
    density: "normal" },
  signature: {
    hero: "zentrierte Bühne im doppelten Goldrahmen + gesperrter Eyebrow + Diamant-Ornament-Divider + Menü-Vorschau mit Punktlinien + Teller-Kreis ragt über den Rahmen",
    decor: ["double-frame", "dotted-menu", "ornament-divider", "plate-overlap"],
    imageTreatment: "sehr dunkel (brightness .4), warm, als Bühnengrund oder im Teller-Kreis",
  },
  llmHints: {
    do: ["sinnliche, kurze Sätze", "italienische/regionale Begriffe sparsam und korrekt",
      "Preise im Format „16,5" ohne Euro-Zeichen"],
    dont: ["Superlativ-Stapel", "das Wort „lecker"", "Emojis"],
  },
};
```

- [ ] **Step 4: Fixtures ergänzen**

„Trattoria Lucia", Berlin-Charlottenburg. full: hero („Ein Tisch. Ein Abend. Italien.", CTA „Tisch reservieren", imageUrl `/demo/gusto-hero.jpg`), menu (2 Kategorien: „Antipasti & Primi" / „Secondi & Dolci", je 3 Positionen mit Preisen wie „16,5"), about (~70 Wörter, Nonna-Geschichte), testimonials (2), gallery (3 × `/demo/gusto-hero.jpg` mit alt-Texten), contact (Di–So 17–23), `google: { rating: 4.7, reviewCount: 213 }`. minimal: hero, menu, contact.

- [ ] **Step 5: Pack-Modul implementieren**

CSS-Kern (`pb-gu-`, vollständig ausformulieren): `.pb-gu-frame` (`position:relative;margin:14px;border:1px solid` Gold 50 % via `color-mix(in srgb, var(--pb-accent) 50%, transparent)` + `outline:1px solid color-mix(in srgb, var(--pb-accent) 25%, transparent);outline-offset:4px`), zentrierte Nav (zwei Link-Gruppen, Logo in Playfair mittig), `.pb-gu-eyebrow` (`letter-spacing:.34em;text-transform:uppercase;font-size:10px`, Gold), `.pb-gu-div` (Diamant „◆" 9px Gold zwischen zwei 60px-Hairlines), `.pb-gu-menu` (Zeilen `display:flex;align-items:baseline;gap:8px`; `i{flex:1;border-bottom:1px dotted var(--pb-line)}`; Preis Gold), `.pb-gu-plate` (200px-Kreis, Radial-Gradient warm, `position:absolute;right:-70px;top:50%`, 10px Mokka-Border + Gold-Ring, Mobil ausgeblendet), CTA Gold-Fläche mit Espresso-Text, gesperrt. Fließtext zentriert, `max-width:46ch`. Registrierung:

```tsx
export const GUSTO_MODULE: PackModule = { id: "gusto", css: GUSTO_CSS, Page: GustoPage };
PACK_MODULES.gusto = GUSTO_MODULE;
```

- [ ] **Step 6: Tests + Baselines + Commit**

Run: `pnpm vitest run client/src/components/site/packs/gusto/gusto.test.tsx` → PASS
`tests/visual/packs.spec.ts`: `PACKS = ["werkbank", "kanzlei", "morgenlicht", "gusto"]`
Run: `pnpm test:visual:update` → sichten (Kachel 07) → `pnpm test:visual` → 24 passed

```bash
git add shared/ client/src/components/site/packs/ tests/visual/ client/public/demo/
git commit -m "feat: Style Pack gusto (Goldrahmen, Punktlinien-Menue, dunkle Buehne)"
```

---

### Task 4: v2-Dispatch in bestehenden Ansichten

**Files:**
- Create: `client/src/components/site/isV2.ts`
- Modify: `client/src/components/WebsiteRenderer.tsx` (nur oben: v2-Weiche, Altpfad unangetastet)
- Test: `client/src/components/site/isV2.test.ts`

**Interfaces:**
- Consumes: `WebsiteDataV2Schema` (Plan A Task 1), `SiteRenderer` + `packs/index` (Plan A Task 4/5).
- Produces: `parseV2(data: unknown): WebsiteDataV2 | null` — `null`, wenn kein gültiges v2-Dokument. Über die Weiche rendern PreviewPage, SitePage, VariantPreviewPage und die Onboarding-Preview v2-Websites automatisch mit dem `SiteRenderer`.

- [ ] **Step 1: Failing Test**

```ts
// client/src/components/site/isV2.test.ts
import { describe, expect, test } from "vitest";
import { getFixture } from "../../../../shared/siteContract/fixtures";
import { parseV2 } from "./isV2";

describe("parseV2", () => {
  test("gültiges v2-Dokument wird erkannt", () => {
    expect(parseV2(getFixture("werkbank", "full"))?.stylePackId).toBe("werkbank");
  });
  test("v1-Dokument (ohne version:2) → null", () => {
    expect(parseV2({ businessName: "Alt", sections: [] })).toBeNull();
  });
  test("kaputtes v2-Dokument → null (kein Throw im Renderer-Pfad)", () => {
    expect(parseV2({ version: 2, stylePackId: "werkbank" })).toBeNull();
  });
});
```

- [ ] **Step 2: Run — FAIL erwartet**

Run: `pnpm vitest run client/src/components/site/isV2.test.ts`

- [ ] **Step 3: Implementieren**

```ts
// client/src/components/site/isV2.ts
import { WebsiteDataV2Schema } from "../../../../shared/siteContract/schema";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";

export function parseV2(data: unknown): WebsiteDataV2 | null {
  if (typeof data !== "object" || data === null) return null;
  if ((data as { version?: unknown }).version !== 2) return null;
  const parsed = WebsiteDataV2Schema.safeParse(data);
  return parsed.success ? parsed.data : null;
}
```

In `client/src/components/WebsiteRenderer.tsx` vor der bestehenden Layout-Auflösung (Imports: `parseV2` aus `./site/isV2`, `SiteRenderer` aus `./site/SiteRenderer`, `./site/packs/index` für die Registrierung):

```tsx
const v2 = parseV2(websiteData);
if (v2) return <SiteRenderer data={v2} />;
// … bestehender v1-Pfad unverändert
```

- [ ] **Step 4: Run — 3 passed + Gesamtsuite**

Run: `pnpm vitest run client/src/components/site/isV2.test.ts` → PASS
Run: `npm run test` → alles grün (kein bestehender Test darf brechen)

- [ ] **Step 5: Commit**

```bash
git add client/src/components/
git commit -m "feat: v2-Weiche in WebsiteRenderer (Preview/Site/VariantPreview rendern SiteRenderer)"
```

---

### Task 5: Generierung v2 (Inhalte vom LLM, Design aus der Verfassung)

**Files:**
- Create: `server/generationV2/llmClient.ts`
- Create: `server/generationV2/contentPrompt.ts`
- Create: `server/generationV2/generateSiteContent.ts`
- Create: `server/generationV2/selectPack.ts`
- Modify: `server/routers.ts` (Jobpfad von `selfService.generateWebsiteAsync`, ~`:5059`: wenn `process.env.PB_LAYOUT_V2 === "1"` → v2-Pfad, sonst Altpfad unverändert)
- Modify: `server/ssr/routes.ts` (Export `invalidateSsrCache(slug: string): void` ergänzen)
- Test: `server/generationV2/contentPrompt.test.ts`, `server/generationV2/generateSiteContent.test.ts`, `server/generationV2/selectPack.test.ts`

**Interfaces:**
- Consumes: `getConstitution`, `getPackPool` (Plan A Task 3), `WebsiteDataV2Schema` (Plan A Task 1), vorhandene LLM-Funktion aus `server/_core/llm.ts` (beim Implementieren heraussuchen und in `llmClient.ts` als `llmComplete(prompt: string): Promise<string>` kapseln), Rotation `getNextLayoutForIndustry(industryKey, pool)` (`server/db.ts:490`; Pool-Werte sind ab jetzt Pack-IDs).
- Produces:
  - `buildContentPrompt(args: { constitution: PackConstitution; business: { name: string; category: string; city?: string }; sections: SectionType[] }): string`
  - `generateSiteContent(args: { packId: PackId; business: { name: string; category: string; city?: string } }): Promise<WebsiteDataV2>` — LLM-Aufruf, `JSON.parse`, `WebsiteDataV2Schema`-Validierung; bei Fehler GENAU EIN Retry mit angehängter Fehlermeldung; danach Throw (kein stiller Fallback, Spec §4.1/§6). `version`/`stylePackId` werden nach dem Parse hart gesetzt, nie dem LLM überlassen.
  - `selectPack(category: string, industryKey: string): Promise<PackId>` — `getPackPool(category)` + Rotation.

- [ ] **Step 1: Failing Tests**

```ts
// server/generationV2/contentPrompt.test.ts
import { describe, expect, test } from "vitest";
import { getConstitution } from "../../shared/stylePacks";
import { buildContentPrompt } from "./contentPrompt";

describe("buildContentPrompt", () => {
  const p = buildContentPrompt({
    constitution: getConstitution("werkbank"),
    business: { name: "Schreinerei Brandt", category: "Schreinerei", city: "Dortmund" },
    sections: ["hero", "services", "about", "contact"],
  });
  test("enthält Essenz und llmHints, aber keine Farb-/Font-Anweisungen", () => {
    expect(p).toContain("Beton, Stahl");
    expect(p).toContain("kurze, direkte Sätze");
    expect(p).not.toMatch(/#[0-9A-Fa-f]{6}/);
    expect(p).not.toContain("Archivo");
  });
  test("verlangt nur die angefragten Sektionen als JSON", () => {
    expect(p).toContain('"hero"');
    expect(p).toContain('"contact"');
    expect(p).not.toContain('"gallery"');
  });
});
```

```ts
// server/generationV2/generateSiteContent.test.ts
import { describe, expect, test, vi } from "vitest";

const good = JSON.stringify({
  version: 2, stylePackId: "werkbank", businessName: "Schreinerei Brandt",
  seo: { title: "Schreinerei Brandt", description: "Möbelbau in Dortmund." },
  sections: [
    { type: "hero", headline: "Massarbeit.", ctaText: "Anfragen" },
    { type: "services", headline: "Leistungen", items: [{ title: "Möbelbau" }] },
    { type: "contact", city: "Dortmund" },
  ],
});

describe("generateSiteContent", () => {
  test("validiert gültige LLM-Antwort", async () => {
    vi.doMock("./llmClient", () => ({ llmComplete: vi.fn().mockResolvedValue(good) }));
    const { generateSiteContent } = await import("./generateSiteContent");
    const d = await generateSiteContent({ packId: "werkbank",
      business: { name: "Schreinerei Brandt", category: "Schreinerei", city: "Dortmund" } });
    expect(d.sections[0].type).toBe("hero");
    vi.doUnmock("./llmClient"); vi.resetModules();
  });
  test("ein Retry bei invalidem JSON, dann Erfolg", async () => {
    const fn = vi.fn().mockResolvedValueOnce("{kaputt").mockResolvedValueOnce(good);
    vi.doMock("./llmClient", () => ({ llmComplete: fn }));
    const { generateSiteContent } = await import("./generateSiteContent");
    await generateSiteContent({ packId: "werkbank",
      business: { name: "X", category: "Schreinerei" } });
    expect(fn).toHaveBeenCalledTimes(2);
    vi.doUnmock("./llmClient"); vi.resetModules();
  });
  test("nach zweitem Fehlschlag: Throw, kein Fallback", async () => {
    vi.doMock("./llmClient", () => ({ llmComplete: vi.fn().mockResolvedValue("{kaputt") }));
    const { generateSiteContent } = await import("./generateSiteContent");
    await expect(generateSiteContent({ packId: "werkbank",
      business: { name: "X", category: "S" } })).rejects.toThrow(/Validierung/);
    vi.doUnmock("./llmClient"); vi.resetModules();
  });
});
```

`selectPack.test.ts`: mockt das Modul mit `getNextLayoutForIndustry` per `vi.doMock` (Rückgabe = erstes Pool-Element) und prüft: (a) der an die Rotation übergebene Pool ist exakt `getPackPool("schreinerei")`; (b) der Rückgabewert ist Element dieses Pools.

- [ ] **Step 2: Run — FAIL erwartet**

Run: `pnpm vitest run server/generationV2/`

- [ ] **Step 3: Implementieren**

`contentPrompt.ts`: deutscher Prompt — Rolle („Du schreibst Website-Inhalte für deutsche Kleinunternehmen."), Business-Fakten (Name, Kategorie, Stadt), `essence` als Tonalitäts-Anker, `llmHints.do` als Regeln / `llmHints.dont` als Verbote, dann das geforderte JSON-Format: pro angefragter Sektion die exakte Feldliste aus einem lokalen `SECTION_FIELD_DOC: Record<SectionType, string>` (Feldnamen identisch zum zod-Schema), Schlussanweisung „Antworte NUR mit JSON. Keine Farben, keine Schriftnamen, keine Design-Anweisungen." `generateSiteContent.ts`: Sektionsliste Plan B fest: hero, services, about, contact (+ menu statt services bei Kategorien, die `getPackPool` auf `gusto` mappen); Ablauf Prompt → `llmComplete` → `JSON.parse` (try/catch) → `safeParse`; Fehlerfall: Retry-Prompt = Original + `\n\nDeine letzte Antwort war ungültig: <Fehlertext>. Antworte erneut, nur JSON.`; zweiter Fehler → `throw new Error("Validierung der LLM-Antwort fehlgeschlagen: " + fehler)`. Danach `version: 2` und `stylePackId` überschreiben. Router: im v2-Zweig `selectPack` → `generateSiteContent` → als `websiteData` persistieren (gleiche JSON-Spalte) → `invalidateSsrCache(slug)`.

- [ ] **Step 4: Run — alles grün**

Run: `pnpm vitest run server/generationV2/` → 8 passed
Run: `npm run test` → komplette Suite grün

- [ ] **Step 5: Commit**

```bash
git add server/generationV2/ server/ssr/routes.ts server/routers.ts
git commit -m "feat: Generierung v2 — LLM liefert Inhalte (zod-validiert, 1 Retry), Pack-Wahl per Registry"
```

---

### Task 6: End-to-End-Probe + Abnahme-Checkpoint

**Files:** keine neuen (nur Verifikation).

- [ ] **Step 1: Kompletter Testlauf**

Run: `npm run test && pnpm test:visual`
Expected: alle Unit-Tests + 24 visuelle Tests grün

- [ ] **Step 2: Echte Generierung gegen v2**

Run (Server mit `PB_LAYOUT_V2=1 npm run dev`): über die StartPage einen Test-Betrieb anlegen (Kategorie „Schreinerei"), Generierung durchlaufen lassen. Danach:
`curl -s http://localhost:3000/site/<slug> | grep -c '"@type":"LocalBusiness"'` → ≥ 1
Onboarding-Preview im Browser öffnen: v2-Rendering sichtbar (Weiche aus Task 4).

- [ ] **Step 3: CHECKPOINT — User-Abnahme**

Dem User zeigen: je 1 Desktop-PNG der 4 Packs (aus `tests/visual/packs.spec.ts-snapshots/`) + Link auf eine live generierte v2-Seite. Erst nach Freigabe: **Plan C erstellen** (restliche 10 Packs nach dem Task-Muster 1–3 dieses Plans; Cutover nach Spec §7: `FALLBACK_PACK` auf `klarwerk`, Löschliste §7.3 abarbeiten, `PB_LAYOUT_V2`-Flag entfernen und v2 zum Standard machen; §8.4 axe-Checks und §8.5 Perf-Budget ergänzen).

---

## Selbstreview-Ergebnis (Plan B)

- Spec-Abdeckung: §3.1 (4/14 Packs inkl. erster dunkler Verfassung), §4 komplett, §5 (+ Cache-Invalidierung), §6 komplett (Prompt, Validierung + genau 1 Retry, Registry + Rotation; Variant-Picker erbt v2 über die Task-4-Weiche). Offen für Plan C: restliche 10 Packs, §7-Cutover/Löschungen, §8.4/§8.5, Fallback `klarwerk`.
- Typkonsistenz: `parseV2` / `generateSiteContent` / `selectPack` / `invalidateSsrCache` / `PACK_MODULES.<id> = <ID>_MODULE` zwischen allen Tasks und mit Plan A abgeglichen.
- Placeholder-Scan: keine „TBD"/„später"-Muster; beschreibende Schritte nennen exakte Klassen, Werte, Formeln (`color-mix`), Feldnamen und Fehlertexte.
