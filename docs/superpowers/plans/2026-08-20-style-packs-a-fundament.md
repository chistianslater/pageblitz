# Style Packs v2 — Plan A: Fundament + Pack „Werkbank"

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Datenvertrag v2, Pack-Registry, Sektions-Engine, SSR-Renderer und das erste vollständige Style Pack (Werkbank) inkl. visueller Regressions-Basis.

**Architecture:** Zod-Vertrag in `shared/siteContract/`, reine Daten-Verfassungen in `shared/stylePacks/`, Pack-Module (JSX + CSS-String) in `client/src/components/site/packs/`, SSR über `renderToStaticMarkup` in `server/ssr/`. Packs liefern das komplette Seiten-Gesicht; die Engine liefert nur Reihenfolge/Sichtbarkeit/Anker.

**Tech Stack:** TypeScript strict, React 19, zod v4, Vitest (vorhanden, `vitest.config.ts`), Playwright (neu, dev-Dependency), Express 4, pnpm.

**Spec:** `docs/superpowers/specs/2026-08-20-style-packs-design.md`
**Visuelle Referenz (verbindlich):** `docs/design/stilkatalog.html` — Kachel 01 „Werkbank" (Runde 2, vom User freigegeben).

## Global Constraints

- Paketmanager: `pnpm`. Tests: `pnpm vitest run <datei>`; kompletter Lauf `npm run test`.
- Kein `any` an Modul-Grenzen (Spec §10). Dateien < 800 Zeilen, viele kleine Dateien.
- UI-Texte Deutsch. Sektions-Anker deutsch und stabil (`#leistungen`, `#ueber-uns`, …).
- Pro Pack max. 2 Font-Familien + optional 1 Utility-Font; Google Fonts mit `display=swap`.
- Commits: `<type>: <beschreibung>` (feat/test/docs/chore/fix), **kein** Co-Authored-Footer.
- Server-Port: `process.env.PORT || 3000` (`server/_core/index.ts:431`).
- zod ist vorhanden (`"zod": "^4.1.12"`), nichts installieren außer wo der Plan es sagt.
- Alt-System (`client/src/components/layouts/`, `WebsiteRenderer`) wird in Plan A **nicht angefasst** — v2 entsteht parallel.

---

### Task 1: Datenvertrag `shared/siteContract`

**Files:**
- Create: `shared/siteContract/schema.ts`
- Create: `shared/siteContract/types.ts`
- Test: `shared/siteContract/schema.test.ts`

**Interfaces:**
- Consumes: nichts (Fundament).
- Produces: `WebsiteDataV2Schema` (zod), Typen `WebsiteDataV2`, `SectionV2`, `SectionType`, `PackId`, Konstante `PACK_IDS`. Alle späteren Tasks importieren aus `shared/siteContract/types`.

- [ ] **Step 1: Failing Test schreiben**

```ts
// shared/siteContract/schema.test.ts
import { describe, expect, test } from "vitest";
import { WebsiteDataV2Schema } from "./schema";

const valid = {
  version: 2, stylePackId: "werkbank", businessName: "Schreinerei Brandt",
  seo: { title: "Schreinerei Brandt Dortmund", description: "Möbelbau und Innenausbau." },
  sections: [
    { type: "hero", headline: "Massarbeit aus Massivholz.", ctaText: "Projekt anfragen" },
    { type: "services", headline: "Leistungen", items: [{ title: "Möbelbau" }] },
    { type: "contact", phone: "0231 123456", city: "Dortmund" },
  ],
};

describe("WebsiteDataV2Schema", () => {
  test("akzeptiert gültiges Dokument", () => {
    expect(WebsiteDataV2Schema.parse(valid).stylePackId).toBe("werkbank");
  });
  test("lehnt unbekannte Pack-ID ab", () => {
    expect(() => WebsiteDataV2Schema.parse({ ...valid, stylePackId: "disco" })).toThrow();
  });
  test("lehnt Sektion mit falschen Feldern ab", () => {
    const bad = { ...valid, sections: [{ type: "services", headline: "X", items: [{ price: 3 }] }] };
    expect(() => WebsiteDataV2Schema.parse(bad)).toThrow();
  });
  test("hiddenSections nur bekannte Typen", () => {
    expect(() => WebsiteDataV2Schema.parse({ ...valid, hiddenSections: ["kekse"] })).toThrow();
  });
});
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `pnpm vitest run shared/siteContract/schema.test.ts`
Expected: FAIL („Cannot find module ./schema")

- [ ] **Step 3: Schema implementieren**

```ts
// shared/siteContract/schema.ts
import { z } from "zod";

export const PACK_IDS = [
  "werkbank", "patina", "kanzlei", "salon-noir", "morgenlicht", "marktplatz",
  "gusto", "landgut", "atelier", "klarwerk", "verve", "zunft", "schimmer", "fundament",
] as const;

export const SECTION_TYPES = [
  "hero", "services", "about", "gallery", "testimonials",
  "contact", "faq", "menu", "pricelist", "team", "cta",
] as const;

const PackIdSchema = z.enum(PACK_IDS);
const SectionTypeSchema = z.enum(SECTION_TYPES);

const HeroSchema = z.object({ type: z.literal("hero"), headline: z.string().min(1),
  subheadline: z.string().optional(), ctaText: z.string().optional(),
  ctaHref: z.string().optional(), imageUrl: z.string().optional() }).strict();
const ServicesSchema = z.object({ type: z.literal("services"), headline: z.string(),
  intro: z.string().optional(),
  items: z.array(z.object({ title: z.string(), description: z.string().optional(),
    price: z.string().optional() }).strict()).min(1) }).strict();
const AboutSchema = z.object({ type: z.literal("about"), headline: z.string(),
  body: z.string(), imageUrl: z.string().optional() }).strict();
const GallerySchema = z.object({ type: z.literal("gallery"), headline: z.string().optional(),
  images: z.array(z.object({ url: z.string(), alt: z.string() }).strict()).min(1) }).strict();
const TestimonialsSchema = z.object({ type: z.literal("testimonials"),
  headline: z.string().optional(),
  items: z.array(z.object({ author: z.string(), text: z.string(),
    rating: z.number().min(1).max(5).optional() }).strict()).min(1) }).strict();
const OpeningHoursSchema = z.object({ day: z.string(), hours: z.string() }).strict();
const ContactSchema = z.object({ type: z.literal("contact"), headline: z.string().optional(),
  phone: z.string().optional(), email: z.string().optional(), street: z.string().optional(),
  zip: z.string().optional(), city: z.string().optional(),
  openingHours: z.array(OpeningHoursSchema).optional() }).strict();
const FaqSchema = z.object({ type: z.literal("faq"), headline: z.string().optional(),
  items: z.array(z.object({ question: z.string(), answer: z.string() }).strict()).min(1) }).strict();
const PricedItemSchema = z.object({ name: z.string(), description: z.string().optional(),
  price: z.string() }).strict();
const PricedCategorySchema = z.object({ name: z.string(),
  items: z.array(PricedItemSchema).min(1) }).strict();
const MenuSchema = z.object({ type: z.literal("menu"), headline: z.string().optional(),
  categories: z.array(PricedCategorySchema).min(1) }).strict();
const PricelistSchema = z.object({ type: z.literal("pricelist"), headline: z.string().optional(),
  categories: z.array(PricedCategorySchema).min(1) }).strict();
const TeamSchema = z.object({ type: z.literal("team"), headline: z.string().optional(),
  members: z.array(z.object({ name: z.string(), role: z.string().optional(),
    imageUrl: z.string().optional() }).strict()).min(1) }).strict();
const CtaSchema = z.object({ type: z.literal("cta"), headline: z.string(),
  ctaText: z.string(), ctaHref: z.string().optional() }).strict();

export const SectionV2Schema = z.discriminatedUnion("type", [
  HeroSchema, ServicesSchema, AboutSchema, GallerySchema, TestimonialsSchema,
  ContactSchema, FaqSchema, MenuSchema, PricelistSchema, TeamSchema, CtaSchema,
]);

export const WebsiteDataV2Schema = z.object({
  version: z.literal(2),
  stylePackId: PackIdSchema,
  businessName: z.string().min(1),
  slug: z.string().optional(),
  businessCategory: z.string().optional(),
  tagline: z.string().optional(),
  logo: z.union([
    z.object({ kind: z.literal("font"), font: z.string() }).strict(),
    z.object({ kind: z.literal("image"), url: z.string() }).strict(),
  ]).optional(),
  sections: z.array(SectionV2Schema).min(1),
  sectionOrder: z.array(SectionTypeSchema).optional(),
  hiddenSections: z.array(SectionTypeSchema).optional(),
  seo: z.object({ title: z.string(), description: z.string() }).strict(),
  footerNote: z.string().optional(),
  google: z.object({ rating: z.number(), reviewCount: z.number() }).strict().optional(),
  legal: z.object({ impressumHtml: z.string().optional(),
    datenschutzHtml: z.string().optional() }).strict().optional(),
  colorOverrides: z.record(z.string(), z.string()).optional(),
}).strict();
```

```ts
// shared/siteContract/types.ts
import type { z } from "zod";
import { PACK_IDS, SECTION_TYPES, SectionV2Schema, WebsiteDataV2Schema } from "./schema";

export { PACK_IDS, SECTION_TYPES };
export type PackId = (typeof PACK_IDS)[number];
export type SectionType = (typeof SECTION_TYPES)[number];
export type SectionV2 = z.infer<typeof SectionV2Schema>;
export type WebsiteDataV2 = z.infer<typeof WebsiteDataV2Schema>;
export type SectionOf<T extends SectionType> = Extract<SectionV2, { type: T }>;
```

- [ ] **Step 4: Test laufen lassen — muss grün sein**

Run: `pnpm vitest run shared/siteContract/schema.test.ts`
Expected: 4 passed

- [ ] **Step 5: Commit**

```bash
git add shared/siteContract/
git commit -m "feat: WebsiteDataV2-Vertrag mit zod-Schema (siteContract)"
```

---

### Task 2: Verfassungs-Typen + `toCssVars` (`shared/stylePacks`)

**Files:**
- Create: `shared/stylePacks/types.ts`
- Create: `shared/stylePacks/toCssVars.ts`
- Test: `shared/stylePacks/toCssVars.test.ts`

**Interfaces:**
- Consumes: `PackId` aus `shared/siteContract/types`.
- Produces: `PackConstitution`, `PaletteColor`, `FontSpec`; `toCssVars(c: PackConstitution, overrides?: Record<string, string>): Record<string, string>` — CSS-Var-Namen: `--pb-<role>` je Palette-Rolle, `--pb-font-display|body|utility`, `--pb-radius-card|button`, `--pb-hero-size`.

- [ ] **Step 1: Failing Test**

```ts
// shared/stylePacks/toCssVars.test.ts
import { describe, expect, test } from "vitest";
import { toCssVars } from "./toCssVars";
import type { PackConstitution } from "./types";

const mini: PackConstitution = {
  id: "werkbank", name: "Werkbank", essence: "Test", theme: "light", industries: ["schreinerei"],
  palette: [
    { name: "Beton", hex: "#E8E6E1", role: "canvas", usage: "Grund" },
    { name: "Signal", hex: "#FF4D00", role: "accent", usage: "CTA", locked: true },
    { name: "Kohle", hex: "#191919", role: "ink", usage: "Text" },
  ],
  type: { display: { family: "Archivo Black", weights: [400], fallback: "sans-serif",
      googleCss: "Archivo+Black" },
    body: { family: "Inter", weights: [400, 700], fallback: "sans-serif",
      googleCss: "Inter:wght@400;700" },
    scale: { basePx: 16, ratio: 1.25, heroClamp: "clamp(2.4rem,6vw,4.5rem)" } },
  shape: { radiusCard: "0px", radiusButton: "0px", buttonStyle: "block", density: "dense" },
  signature: { hero: "vertical-rail", decor: ["marquee"], imageTreatment: "hard-crop" },
  llmHints: { do: ["direkt"], dont: ["blumig"] },
};

describe("toCssVars", () => {
  test("emittiert Rollen- und Font-Variablen", () => {
    const v = toCssVars(mini);
    expect(v["--pb-canvas"]).toBe("#E8E6E1");
    expect(v["--pb-accent"]).toBe("#FF4D00");
    expect(v["--pb-font-display"]).toBe('"Archivo Black", sans-serif');
    expect(v["--pb-radius-button"]).toBe("0px");
  });
  test("Override greift bei nicht gesperrter Farbe", () => {
    expect(toCssVars(mini, { ink: "#222222" })["--pb-ink"]).toBe("#222222");
  });
  test("Override wird bei locked-Farbe ignoriert", () => {
    expect(toCssVars(mini, { accent: "#00FF00" })["--pb-accent"]).toBe("#FF4D00");
  });
});
```

- [ ] **Step 2: Run — FAIL erwartet**

Run: `pnpm vitest run shared/stylePacks/toCssVars.test.ts`
Expected: FAIL („Cannot find module ./toCssVars")

- [ ] **Step 3: Implementieren**

```ts
// shared/stylePacks/types.ts
import type { PackId } from "../siteContract/types";

export type PaletteRole =
  | "canvas" | "surface" | "ink" | "muted" | "line"
  | "accent" | "accent-contrast" | "accent-2";

export interface PaletteColor {
  name: string; hex: string; role: PaletteRole; usage: string; locked?: boolean;
}
export interface FontSpec {
  family: string; weights: number[]; fallback: string;
  /** Family-Teil der Google-Fonts-css2-URL, z. B. "Inter:wght@400;700" */
  googleCss: string;
}
export interface TypeScale { basePx: number; ratio: number; heroClamp: string }

export interface PackConstitution {
  id: PackId; name: string; essence: string; industries: string[];
  theme: "light" | "dark";
  palette: PaletteColor[];
  type: { display: FontSpec; body: FontSpec; utility?: FontSpec; scale: TypeScale };
  shape: { radiusCard: string; radiusButton: string; buttonStyle: string;
    density: "airy" | "normal" | "dense" };
  signature: { hero: string; decor: string[]; imageTreatment: string };
  llmHints: { do: string[]; dont: string[] };
}
```

```ts
// shared/stylePacks/toCssVars.ts
import type { FontSpec, PackConstitution } from "./types";

const fontStack = (f: FontSpec) => `"${f.family}", ${f.fallback}`;

export function toCssVars(
  c: PackConstitution,
  overrides?: Record<string, string>,
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const color of c.palette) {
    const wanted = overrides?.[color.role];
    vars[`--pb-${color.role}`] = wanted && !color.locked ? wanted : color.hex;
  }
  vars["--pb-font-display"] = fontStack(c.type.display);
  vars["--pb-font-body"] = fontStack(c.type.body);
  if (c.type.utility) vars["--pb-font-utility"] = fontStack(c.type.utility);
  vars["--pb-radius-card"] = c.shape.radiusCard;
  vars["--pb-radius-button"] = c.shape.radiusButton;
  vars["--pb-hero-size"] = c.type.scale.heroClamp;
  return vars;
}
```

- [ ] **Step 4: Run — PASS erwartet**

Run: `pnpm vitest run shared/stylePacks/toCssVars.test.ts`
Expected: 3 passed

- [ ] **Step 5: Commit**

```bash
git add shared/stylePacks/
git commit -m "feat: PackConstitution-Typen und toCssVars"
```

---

### Task 3: Werkbank-Verfassung + Registry

**Files:**
- Create: `shared/stylePacks/werkbank.ts`
- Create: `shared/stylePacks/index.ts`
- Test: `shared/stylePacks/registry.test.ts`

**Interfaces:**
- Consumes: `PackConstitution` (Task 2), `PackId` (Task 1).
- Produces: `WERKBANK: PackConstitution`; Registry `STYLE_PACKS: Partial<Record<PackId, PackConstitution>>`; `getConstitution(id: PackId): PackConstitution` (wirft bei unbekannt); `getPackPool(categoryKey: string): PackId[]`; `FALLBACK_PACK: PackId = "werkbank"` (Plan B erweitert Pools, Plan C stellt Fallback auf `klarwerk` um).

- [ ] **Step 1: Failing Test**

```ts
// shared/stylePacks/registry.test.ts
import { describe, expect, test } from "vitest";
import { FALLBACK_PACK, getConstitution, getPackPool, STYLE_PACKS } from "./index";

describe("stylePacks registry", () => {
  test("werkbank ist registriert und vollständig", () => {
    const c = getConstitution("werkbank");
    expect(c.palette.length).toBeGreaterThanOrEqual(4);
    expect(c.palette.some((p) => p.role === "canvas")).toBe(true);
    expect(c.palette.some((p) => p.role === "accent")).toBe(true);
    expect(c.signature.decor.length).toBeGreaterThanOrEqual(2);
  });
  test("unbekannte Branche fällt auf FALLBACK_PACK zurück", () => {
    expect(getPackPool("unbekannte-branche")).toEqual([FALLBACK_PACK]);
  });
  test("Schreinerei landet bei werkbank", () => {
    expect(getPackPool("schreinerei")[0]).toBe("werkbank");
  });
  test("jede registrierte Verfassung hat konsistente id", () => {
    for (const [id, c] of Object.entries(STYLE_PACKS)) expect(c!.id).toBe(id);
  });
});
```

- [ ] **Step 2: Run — FAIL erwartet**

Run: `pnpm vitest run shared/stylePacks/registry.test.ts`

- [ ] **Step 3: Implementieren**

```ts
// shared/stylePacks/werkbank.ts  (Werte aus docs/design/stilkatalog.html, Kachel 01)
import type { PackConstitution } from "./types";

export const WERKBANK: PackConstitution = {
  id: "werkbank", name: "Werkbank",
  essence: "Beton, Stahl und eine Signalfarbe — Typografie wie ein Werkstück.",
  industries: ["schreinerei", "tischler", "bau", "dachdecker", "elektriker",
    "sanitaer", "kfz", "metallbau", "maler", "geruestbau"],
  theme: "light",
  palette: [
    { name: "Beton", hex: "#E8E6E1", role: "canvas", usage: "Seitengrund — nie Reinweiß." },
    { name: "Putz", hex: "#F4F2EE", role: "surface", usage: "Karten, helle Flächen." },
    { name: "Kohle", hex: "#191919", role: "ink", usage: "Text, dunkle Panels, Rail." },
    { name: "Staub", hex: "#4A4844", role: "muted", usage: "Sekundärtext, Meta." },
    { name: "Fuge", hex: "#CFCCC5", role: "line", usage: "Trennlinien, Rahmen." },
    { name: "Signal", hex: "#FF4D00", role: "accent", locked: true,
      usage: "CTA, Akzentwort, Bild-Border — nie großflächig." },
    { name: "Weiß", hex: "#FFFFFF", role: "accent-contrast", usage: "Text auf Signal/Kohle." },
  ],
  type: {
    display: { family: "Archivo Black", weights: [400],
      fallback: "'Arial Black', sans-serif", googleCss: "Archivo+Black" },
    body: { family: "Inter", weights: [400, 600, 700],
      fallback: "system-ui, sans-serif", googleCss: "Inter:wght@400;600;700" },
    utility: { family: "Space Mono", weights: [400],
      fallback: "monospace", googleCss: "Space+Mono" },
    scale: { basePx: 16, ratio: 1.25, heroClamp: "clamp(2.6rem, 6vw, 5rem)" },
  },
  shape: { radiusCard: "0px", radiusButton: "0px", buttonStyle: "block-uppercase",
    density: "dense" },
  signature: {
    hero: "vertical-rail + stacked-display (Zeile 2 outline, Zeile 3 accent) + diagonal-photo + marquee",
    decor: ["vertical-rail", "marquee", "diagonal-clip", "mono-index"],
    imageTreatment: "harter Schnitt, warmes Duotone, 8px Signal-Border links",
  },
  llmHints: {
    do: ["kurze, direkte Sätze", "Versalien-taugliche knappe Headlines (2–4 Wörter pro Zeile)",
      "Leistungen als nummerierte, knappe Begriffe"],
    dont: ["blumige Adjektive", "Ausrufezeichen-Häufung", "englische Buzzwords"],
  },
};
```

```ts
// shared/stylePacks/index.ts
import type { PackId } from "../siteContract/types";
import type { PackConstitution } from "./types";
import { WERKBANK } from "./werkbank";

export type { PackConstitution, PaletteColor, FontSpec } from "./types";
export { toCssVars } from "./toCssVars";

export const STYLE_PACKS: Partial<Record<PackId, PackConstitution>> = {
  werkbank: WERKBANK,
};

export const FALLBACK_PACK: PackId = "werkbank";

export function getConstitution(id: PackId): PackConstitution {
  const c = STYLE_PACKS[id];
  if (!c) throw new Error(`Style Pack nicht registriert: ${id}`);
  return c;
}

/** Primär-Pack zuerst; unbekannte Branchen → [FALLBACK_PACK]. */
export function getPackPool(categoryKey: string): PackId[] {
  const key = categoryKey.toLowerCase();
  const pool = (Object.values(STYLE_PACKS) as PackConstitution[])
    .filter((c) => c.industries.some((i) => key.includes(i)))
    .map((c) => c.id);
  return pool.length > 0 ? pool : [FALLBACK_PACK];
}
```

- [ ] **Step 4: Run — 4 passed erwartet**

Run: `pnpm vitest run shared/stylePacks/registry.test.ts`

- [ ] **Step 5: Commit**

```bash
git add shared/stylePacks/
git commit -m "feat: Werkbank-Verfassung und Style-Pack-Registry"
```

---

### Task 4: Engine-Kern + SiteRenderer

**Files:**
- Create: `client/src/components/site/engine.ts`
- Create: `client/src/components/site/packRegistry.ts`
- Create: `client/src/components/site/SiteRenderer.tsx`
- Test: `client/src/components/site/engine.test.ts`
- Test: `client/src/components/site/SiteRenderer.test.tsx`

**Interfaces:**
- Consumes: `WebsiteDataV2`, `SectionV2`, `SectionType` (Task 1); `getConstitution`, `toCssVars` (Task 2/3).
- Produces:
  - `orderedSections(data: WebsiteDataV2): SectionV2[]`
  - `SECTION_ANCHORS: Record<SectionType, string>`
  - `interface PackModule { id: PackId; css: string; Page: React.FC<{ data: WebsiteDataV2 }> }`
  - `PACK_MODULES: Partial<Record<PackId, PackModule>>` (Packs registrieren sich hier)
  - `SiteRenderer: React.FC<{ data: WebsiteDataV2 }>` — rendert `<style>{css}</style>` + `Page`, Root-`div` mit `toCssVars` als Inline-Style.

- [ ] **Step 1: Failing Tests**

```ts
// client/src/components/site/engine.test.ts
import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";
import { orderedSections, SECTION_ANCHORS } from "./engine";

const base: WebsiteDataV2 = {
  version: 2, stylePackId: "werkbank", businessName: "Test",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "contact", city: "Dortmund" },
    { type: "hero", headline: "H" },
    { type: "services", headline: "L", items: [{ title: "A" }] },
  ],
};

describe("orderedSections", () => {
  test("ohne sectionOrder: hero immer zuerst, Rest in Dokument-Reihenfolge", () => {
    expect(orderedSections(base).map((s) => s.type)).toEqual(["hero", "contact", "services"]);
  });
  test("sectionOrder wird angewendet, hiddenSections gefiltert", () => {
    const d: WebsiteDataV2 = { ...base,
      sectionOrder: ["hero", "services", "contact"], hiddenSections: ["contact"] };
    expect(orderedSections(d).map((s) => s.type)).toEqual(["hero", "services"]);
  });
  test("Anker sind deutsch und vollständig", () => {
    expect(SECTION_ANCHORS.services).toBe("leistungen");
    expect(SECTION_ANCHORS.about).toBe("ueber-uns");
    expect(Object.keys(SECTION_ANCHORS)).toHaveLength(11);
  });
});
```

```tsx
// client/src/components/site/SiteRenderer.test.tsx
import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";
import { PACK_MODULES } from "./packRegistry";
import { SiteRenderer } from "./SiteRenderer";

const data: WebsiteDataV2 = {
  version: 2, stylePackId: "werkbank", businessName: "Probe",
  seo: { title: "t", description: "d" },
  sections: [{ type: "hero", headline: "Hallo Welt" }],
};

describe("SiteRenderer", () => {
  test("rendert registriertes Pack mit CSS und CSS-Variablen", () => {
    PACK_MODULES.werkbank = { id: "werkbank", css: ".pb-test{color:red}",
      Page: ({ data }) => <main>{data.businessName}</main> };
    const html = renderToStaticMarkup(<SiteRenderer data={data} />);
    expect(html).toContain("Probe");
    expect(html).toContain(".pb-test{color:red}");
    expect(html).toContain("--pb-accent:#FF4D00");
  });
  test("wirft verständlich bei nicht registriertem Pack-Modul", () => {
    delete PACK_MODULES.werkbank;
    expect(() => renderToStaticMarkup(<SiteRenderer data={data} />))
      .toThrow(/Pack-Modul nicht registriert/);
  });
});
```

- [ ] **Step 2: Run — FAIL erwartet**

Run: `pnpm vitest run client/src/components/site/engine.test.ts client/src/components/site/SiteRenderer.test.tsx`

- [ ] **Step 3: Implementieren**

```ts
// client/src/components/site/engine.ts
import type { SectionType, SectionV2, WebsiteDataV2 } from "../../../../shared/siteContract/types";

export const SECTION_ANCHORS: Record<SectionType, string> = {
  hero: "start", services: "leistungen", about: "ueber-uns", gallery: "galerie",
  testimonials: "bewertungen", contact: "kontakt", faq: "faq", menu: "speisekarte",
  pricelist: "preise", team: "team", cta: "anfrage",
};

export function orderedSections(data: WebsiteDataV2): SectionV2[] {
  const hidden = new Set(data.hiddenSections ?? []);
  const visible = data.sections.filter((s) => !hidden.has(s.type));
  const order = data.sectionOrder;
  const rank = (t: SectionType): number => {
    if (t === "hero") return -1; // Hero immer zuerst
    if (!order) return 0; // stabil: Dokument-Reihenfolge
    const i = order.indexOf(t);
    return i === -1 ? order.length : i;
  };
  return [...visible].sort((a, b) => rank(a.type) - rank(b.type));
}
```

```ts
// client/src/components/site/packRegistry.ts
import type React from "react";
import type { PackId, WebsiteDataV2 } from "../../../../shared/siteContract/types";

export interface PackModule {
  id: PackId;
  css: string;
  Page: React.FC<{ data: WebsiteDataV2 }>;
}

export const PACK_MODULES: Partial<Record<PackId, PackModule>> = {};
```

```tsx
// client/src/components/site/SiteRenderer.tsx
import React from "react";
import { getConstitution, toCssVars } from "../../../../shared/stylePacks";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";
import { PACK_MODULES } from "./packRegistry";

export const SiteRenderer: React.FC<{ data: WebsiteDataV2 }> = ({ data }) => {
  const mod = PACK_MODULES[data.stylePackId];
  if (!mod) throw new Error(`Pack-Modul nicht registriert: ${data.stylePackId}`);
  const vars = toCssVars(getConstitution(data.stylePackId), data.colorOverrides);
  return (
    <div className={`pb-site pb-${data.stylePackId}`} style={vars as React.CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: mod.css }} />
      <mod.Page data={data} />
    </div>
  );
};
```

Hinweis: `dangerouslySetInnerHTML` ist hier sicher — `mod.css` ist ein statischer, eingecheckter String aus dem Pack-Modul, nie Nutzereingabe. Kein Import von `WebsiteRenderer`/Altsystem.

- [ ] **Step 4: Run — 5 passed erwartet**

Run: `pnpm vitest run client/src/components/site/engine.test.ts client/src/components/site/SiteRenderer.test.tsx`

- [ ] **Step 5: Commit**

```bash
git add client/src/components/site/
git commit -m "feat: Sektions-Engine (Anker, Reihenfolge) und SiteRenderer v2"
```

---

### Task 5: Pack-Modul „Werkbank"

**Files:**
- Create: `client/src/components/site/packs/werkbank/css.ts`
- Create: `client/src/components/site/packs/werkbank/index.tsx`
- Create: `client/src/components/site/packs/index.ts`
- Test: `client/src/components/site/packs/werkbank/werkbank.test.tsx`

**Interfaces:**
- Consumes: `PackModule`, `PACK_MODULES` (Task 4), `orderedSections`, `SECTION_ANCHORS` (Task 4), `SectionOf` (Task 1).
- Produces: `WERKBANK_MODULE: PackModule` — registriert unter `PACK_MODULES.werkbank` via Import-Nebenwirkung von `client/src/components/site/packs/index.ts`.

**Visuelle Vorgabe (verbindlich, aus `docs/design/stilkatalog.html` Kachel 01):** Vertikal-Rail links (Kohle, Mono-Schrift, 90° gedreht), Nav mit Versalien, Hero mehrzeilig (Zeile 1 solid, Zeile 2 Outline via `-webkit-text-stroke`, letzte Zeile Signal), diagonal beschnittenes Hero-Bild mit 8px-Signal-Border, Marquee-Band (−2° gedreht) mit Leistungs-Titeln, Mono-Index (`01`, `02`, …) bei Leistungen. Kein `border-radius` irgendwo im Pack.

- [ ] **Step 1: Failing Test**

```tsx
// client/src/components/site/packs/werkbank/werkbank.test.tsx
import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { WebsiteDataV2 } from "../../../../../../shared/siteContract/types";
import "../index"; // registriert alle Pack-Module
import { SiteRenderer } from "../../SiteRenderer";

const data: WebsiteDataV2 = {
  version: 2, stylePackId: "werkbank", businessName: "Schreinerei Brandt",
  businessCategory: "Schreinerei", tagline: "Massarbeit seit 2004",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "Massarbeit aus Massivholz.", ctaText: "Projekt anfragen" },
    { type: "services", headline: "Leistungen",
      items: [{ title: "Möbelbau" }, { title: "Innenausbau" }] },
    { type: "about", headline: "Über uns", body: "Seit 2004 in Dortmund." },
    { type: "contact", phone: "0231 1", email: "post@brandt.de", city: "Dortmund" },
  ],
};

describe("Pack werkbank", () => {
  const html = renderToStaticMarkup(<SiteRenderer data={data} />);
  test("genau eine h1 mit Hero-Headline", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("Massarbeit aus Massivholz.");
  });
  test("deutsche Anker vorhanden", () => {
    for (const id of ["leistungen", "ueber-uns", "kontakt"]) {
      expect(html).toContain(`id="${id}"`);
    }
  });
  test("Signatur-Elemente vorhanden (Rail + Marquee)", () => {
    expect(html).toContain("pb-wb-rail");
    expect(html).toContain("pb-wb-marquee");
  });
  test("versteckte Sektion wird nicht gerendert", () => {
    const h = renderToStaticMarkup(
      <SiteRenderer data={{ ...data, hiddenSections: ["about"] }} />);
    expect(h).not.toContain('id="ueber-uns"');
  });
});
```

- [ ] **Step 2: Run — FAIL erwartet**

Run: `pnpm vitest run client/src/components/site/packs/werkbank/werkbank.test.tsx`

- [ ] **Step 3: Implementieren**

`css.ts` exportiert einen CSS-String mit Präfix `pb-wb-`. Alle Farben über `var(--pb-*)`, nie Hex im CSS:

```ts
// client/src/components/site/packs/werkbank/css.ts
export const WERKBANK_CSS = `
.pb-werkbank{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.5}
.pb-wb-rail{position:fixed;left:0;top:0;bottom:0;width:56px;background:var(--pb-ink);color:var(--pb-canvas);display:flex;align-items:center;justify-content:center;z-index:40}
.pb-wb-rail b{writing-mode:vertical-rl;transform:rotate(180deg);font-family:var(--pb-font-utility);font-size:11px;letter-spacing:.3em;font-weight:400}
.pb-wb-main{margin-left:56px}
.pb-wb-nav{display:flex;align-items:center;gap:20px;padding:18px 28px;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:.06em}
.pb-wb-logo{font-family:var(--pb-font-display);font-size:16px}
.pb-wb-nav-links{display:flex;gap:16px;margin-left:auto}
.pb-wb-hero{position:relative;padding:40px 28px 90px;overflow:hidden}
.pb-wb-hero h1{font-family:var(--pb-font-display);font-size:var(--pb-hero-size);line-height:.92;text-transform:uppercase;max-width:14ch}
.pb-wb-hero .outline{display:block;color:transparent;-webkit-text-stroke:2px var(--pb-ink)}
.pb-wb-hero .accent{display:block;color:var(--pb-accent)}
.pb-wb-photo{position:absolute;right:0;top:0;width:34%;height:82%;object-fit:cover;clip-path:polygon(26% 0,100% 0,100% 100%,0 100%);border-left:8px solid var(--pb-accent)}
.pb-wb-cta{display:inline-block;margin-top:26px;background:var(--pb-accent);color:var(--pb-accent-contrast);padding:14px 26px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;text-decoration:none}
.pb-wb-marquee{background:var(--pb-ink);color:var(--pb-canvas);transform:rotate(-2deg);margin:0 -4%;padding:12px 0;white-space:nowrap;overflow:hidden;font-family:var(--pb-font-display);text-transform:uppercase;font-size:14px;letter-spacing:.08em}
.pb-wb-marquee em{font-style:normal;color:var(--pb-accent);padding:0 16px}
.pb-wb-section{padding:70px 28px;border-top:1px solid var(--pb-line)}
.pb-wb-section h2{font-family:var(--pb-font-display);text-transform:uppercase;font-size:clamp(1.6rem,3vw,2.4rem);margin-bottom:28px}
.pb-wb-service{display:flex;gap:18px;padding:16px 0;border-bottom:1px solid var(--pb-line);align-items:baseline}
.pb-wb-service .idx{font-family:var(--pb-font-utility);color:var(--pb-accent);font-size:13px}
.pb-wb-footer{background:var(--pb-ink);color:var(--pb-canvas);padding:36px 28px;font-size:13px}
@media(max-width:720px){.pb-wb-rail{display:none}.pb-wb-main{margin-left:0}.pb-wb-photo{display:none}}
`;
```

`index.tsx`: `WerkbankPage` rendert:
- Rail: `<aside className="pb-wb-rail"><b>{businessCategory} · {stadt} — {tagline}</b></aside>` (Stadt aus der contact-Sektion; fehlende Teile weglassen).
- Nav: Logo = `logo.kind === "font" ? businessName in Logo-Font : <img>`, sonst businessName; Links nur für vorhandene Sektionstypen, `href={"#" + SECTION_ANCHORS[t]}`.
- Danach `orderedSections(data)` durch ein `switch (section.type)`:
  - `hero`: Headline an Wortgrenzen auf 2–3 Zeilen verteilen (Hilfsfunktion `splitHeadline(h: string): string[]` — bei ≥ 4 Wörtern drei Zeilen, sonst zwei; letzte Zeile `.accent`, mittlere `.outline`), `subheadline` als Absatz, CTA `<a className="pb-wb-cta" href={ctaHref ?? "#kontakt"}>`, `imageUrl` als `<img className="pb-wb-photo" alt="">`.
  - Marquee direkt nach dem Hero: Service-Titel 3× wiederholt, getrennt durch `<em>✕</em>`.
  - `services`: `pb-wb-service`-Zeilen mit `<span className="idx">{String(i+1).padStart(2,"0")}</span>`, Titel fett, description in `muted`.
  - `about`, `contact` (Telefon/Mail als `tel:`/`mailto:`-Links, Adresse, Öffnungszeiten-Tabelle), `testimonials`, `gallery`, `faq`, `cta`, `menu`/`pricelist`/`team` als Listen in derselben strengen Ästhetik — jede in `<section id={SECTION_ANCHORS[type]} className="pb-wb-section">`, `headline` als `<h2>` (Fallback auf deutschen Standardtitel, z. B. „Bewertungen").
- Footer: businessName, © Jahr fest aus `new Date().getFullYear()`, `footerNote`, Links auf `/impressum` und `/datenschutz`.

Dateiende `index.tsx`:

```tsx
import { PACK_MODULES, type PackModule } from "../../packRegistry";
import { WERKBANK_CSS } from "./css";

export const WERKBANK_MODULE: PackModule = { id: "werkbank", css: WERKBANK_CSS, Page: WerkbankPage };
PACK_MODULES.werkbank = WERKBANK_MODULE;
```

```ts
// client/src/components/site/packs/index.ts
// Import-Nebenwirkung: registriert alle Pack-Module in PACK_MODULES.
import "./werkbank";
```

- [ ] **Step 4: Run — 4 passed erwartet**

Run: `pnpm vitest run client/src/components/site/packs/werkbank/werkbank.test.tsx`

- [ ] **Step 5: Gesamtlauf + Commit**

Run: `npm run test`
Expected: alle Tests grün (auch Task 1–4)

```bash
git add client/src/components/site/
git commit -m "feat: Style Pack werkbank (Rail, Outline-Hero, Marquee, Mono-Index)"
```

---

### Task 6: Fixtures

**Files:**
- Create: `shared/siteContract/fixtures.ts`
- Test: `shared/siteContract/fixtures.test.ts`

**Interfaces:**
- Consumes: `WebsiteDataV2Schema` (Task 1).
- Produces: `getFixture(packId: PackId, kind: "full" | "minimal"): WebsiteDataV2` — deterministische Demo-Daten pro Pack (Plan A: nur `werkbank`; wirft für andere IDs `Error("Fixture fehlt für Pack: <id>")`).

- [ ] **Step 1: Failing Test**

```ts
// shared/siteContract/fixtures.test.ts
import { describe, expect, test } from "vitest";
import { WebsiteDataV2Schema } from "./schema";
import { getFixture } from "./fixtures";

describe("fixtures", () => {
  test("werkbank-full validiert gegen Schema und hat alle Kern-Sektionen", () => {
    const d = WebsiteDataV2Schema.parse(getFixture("werkbank", "full"));
    const types = d.sections.map((s) => s.type);
    for (const t of ["hero", "services", "about", "testimonials", "contact"]) {
      expect(types).toContain(t);
    }
  });
  test("werkbank-minimal hat nur hero, services, contact", () => {
    const d = WebsiteDataV2Schema.parse(getFixture("werkbank", "minimal"));
    expect(d.sections.map((s) => s.type).sort()).toEqual(["contact", "hero", "services"]);
  });
  test("Pack ohne Fixture wirft", () => {
    // absichtlich ungültige ID, damit der Test auch nach Plan B/C stabil bleibt
    expect(() => getFixture("nicht-existent" as never, "full")).toThrow(/Fixture fehlt/);
  });
});
```

- [ ] **Step 2: Run — FAIL erwartet**

Run: `pnpm vitest run shared/siteContract/fixtures.test.ts`

- [ ] **Step 3: Implementieren**

`fixtures.ts`: Objekt `FIXTURES: Partial<Record<PackId, { full: WebsiteDataV2; minimal: WebsiteDataV2 }>>` mit realistischen deutschen Inhalten für „Schreinerei Brandt, Dortmund" (Texte aus der Katalog-Kachel übernehmen und ausbauen: 4 Leistungen mit je 1-Satz-Beschreibung, About-Absatz ~80 Wörter, 3 Bewertungen mit Namen, Kontakt mit Öffnungszeiten Mo–Fr 7–17 Uhr, `google: { rating: 4.9, reviewCount: 87 }`, `tagline`, `seo` ausgefüllt). Bild-URLs relativ: `"/demo/werkbank-hero.jpg"` (Screenshot-Stabilität; Datei kommt in Task 8). `getFixture` wirft bei Lücken.

- [ ] **Step 4: Run — 3 passed erwartet**

Run: `pnpm vitest run shared/siteContract/fixtures.test.ts`

- [ ] **Step 5: Commit**

```bash
git add shared/siteContract/fixtures.ts shared/siteContract/fixtures.test.ts
git commit -m "feat: deterministische Demo-Fixtures (werkbank full/minimal)"
```

---

### Task 7: SSR-Renderer `renderSiteHtml`

**Files:**
- Create: `server/ssr/renderSite.tsx`
- Test: `server/ssr/renderSite.test.tsx`

**Interfaces:**
- Consumes: `SiteRenderer` + `packs/index` (Task 4/5), `getConstitution` (Task 3), `WebsiteDataV2` (Task 1), `getFixture` (Task 6, nur im Test).
- Produces: `renderSiteHtml(data: WebsiteDataV2, opts: { origin: string; pathname?: string }): string` — vollständiges HTML-Dokument.

**Anforderungen (Spec §5):** `<html lang="de">`; `<title>` = `seo.title`; Meta-Description; Canonical = `origin` + (`pathname` ?? "/"); OG-Tags (title, description, type=website); `LocalBusiness`-JSON-LD (name, telephone/email/address aus der contact-Sektion, `aggregateRating` falls `google` vorhanden); Google-Fonts-`<link>` aus den `googleCss`-Werten der Verfassung als EINE css2-URL mit `display=swap`; Body = `renderToStaticMarkup(<SiteRenderer data={data}/>)`; einziges Skript: 6-Zeilen-Inline-Toggle für Mobile-Nav (`classList.toggle`), kein React im Browser. Bei `pathname === "/impressum"`/"/datenschutz": statt der Seite nur `legal.impressumHtml`/`datenschutzHtml` in schlichter Hülle mit Zurück-Link (404-Text wenn leer). Alle interpolierten Strings durch lokale `esc()` (&, <, >, ") geschützt; JSON-LD via `JSON.stringify(...).replace(/</g, "\\u003c")`.

- [ ] **Step 1: Failing Test**

```tsx
// server/ssr/renderSite.test.tsx
import { describe, expect, test } from "vitest";
import { getFixture } from "../../shared/siteContract/fixtures";
import { renderSiteHtml } from "./renderSite";

describe("renderSiteHtml", () => {
  const html = renderSiteHtml(getFixture("werkbank", "full"),
    { origin: "https://brandt.pageblitz.de" });
  test("liefert komplettes Dokument mit Meta und Canonical", () => {
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain('<html lang="de">');
    expect(html).toContain("<title>");
    expect(html).toContain('rel="canonical" href="https://brandt.pageblitz.de/"');
  });
  test("enthält LocalBusiness-JSON-LD", () => {
    expect(html).toContain('"@type":"LocalBusiness"');
    expect(html).toContain('"aggregateRating"');
  });
  test("lädt Pack-Fonts über eine css2-URL mit display=swap", () => {
    expect(html).toContain("fonts.googleapis.com/css2?family=Archivo+Black");
    expect(html).toContain("display=swap");
  });
  test("Inhalt ist ohne JS im HTML (Anker vorhanden)", () => {
    expect(html).toContain('id="leistungen"');
    expect(html).toContain("Massarbeit");
  });
});
```

- [ ] **Step 2: Run — FAIL erwartet**

Run: `pnpm vitest run server/ssr/renderSite.test.tsx`

- [ ] **Step 3: Implementieren** (gemäß Anforderungsblock oben; Font-URL-Baustein: `[display, body, utility].filter(Boolean).map(f => "family=" + f.googleCss).join("&") + "&display=swap"`)

- [ ] **Step 4: Run — 4 passed erwartet**

Run: `pnpm vitest run server/ssr/renderSite.test.tsx`

- [ ] **Step 5: Commit**

```bash
git add server/ssr/
git commit -m "feat: SSR-Renderer renderSiteHtml (Meta, JSON-LD, Pack-Fonts)"
```

---

### Task 8: Express-Anbindung (Dev-Preview + Kundenseiten hinter Flag)

**Files:**
- Create: `server/ssr/routes.ts`
- Modify: `server/_core/index.ts` (Registrierung VOR dem SPA-Fallback aus `server/_core/static.ts:32`; exakte Einfügestelle anhand der bestehenden Middleware-Reihenfolge wählen und im Commit-Text nennen)
- Create: `client/public/demo/werkbank-hero.jpg` (rechtefreies Werkstatt-Foto, < 300 kb; Quelle im Commit nennen)
- Test: `server/ssr/routes.test.ts`

**Interfaces:**
- Consumes: `renderSiteHtml` (Task 7), `getFixture` (Task 6).
- Produces: `registerSsrRoutes(app: Express): void`:
  1. `GET /dev/site-preview?pack=<id>&fixture=<full|minimal>` — nur wenn `process.env.NODE_ENV !== "production"`, sonst 404. Unbekanntes Pack/Fixture → 400 mit Klartext.
  2. Kundenseiten-SSR: greift nur, wenn `process.env.SSR_SITES !== "off"` UND die geladene Website `websiteData.version === 2` hat; sonst `next()` (SPA-Verhalten unverändert). Host-Erkennung server-seitig wie `getCustomerSubdomain()` in `client/src/App.tsx:109-115` (Host gegen `*.pageblitz.de`, Reserved-Liste `["www","api","analytics","admin","mail","ftp"]`); zusätzlich Pfad `/site/:slug`. Website-Ladung über die bestehende DB-Helper-Funktion, die auch `trpc.website.get` benutzt (in `server/db.ts` heraussuchen; sie existiert).
- In-Memory-Cache: `Map<slug, { html: string; at: number }>`, TTL 60 s (Publish-Invalidierung kommt in Plan B mit der Generierung).

- [ ] **Step 1: supertest installieren + Failing Test**

```bash
pnpm add -D supertest @types/supertest
```

```ts
// server/ssr/routes.test.ts
import { describe, expect, test } from "vitest";
import express from "express";
import request from "supertest";
import { registerSsrRoutes } from "./routes";

describe("SSR routes", () => {
  test("dev-preview liefert HTML für werkbank/full", async () => {
    const app = express();
    registerSsrRoutes(app);
    const res = await request(app).get("/dev/site-preview?pack=werkbank&fixture=full");
    expect(res.status).toBe(200);
    expect(res.text).toContain('id="leistungen"');
  });
  test("unbekanntes Pack → 400 mit Meldung", async () => {
    const app = express();
    registerSsrRoutes(app);
    const res = await request(app).get("/dev/site-preview?pack=disco&fixture=full");
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run — FAIL erwartet**

Run: `pnpm vitest run server/ssr/routes.test.ts`

- [ ] **Step 3: Implementieren + Demo-Bild ablegen**

- [ ] **Step 4: Tests + manueller Check**

Run: `pnpm vitest run server/ssr/routes.test.ts` → 2 passed
Run (Server läuft via `npm run dev`):
`curl -s "http://localhost:3000/dev/site-preview?pack=werkbank&fixture=full" | grep -c leistungen`
Expected: ≥ 1

- [ ] **Step 5: Commit**

```bash
git add server/ssr/ server/_core/index.ts client/public/demo/ package.json pnpm-lock.yaml
git commit -m "feat: SSR-Routen (Dev-Preview + Kundenseiten hinter SSR_SITES-Flag)"
```

---

### Task 9: Visuelle Regression (Playwright) + Abnahme

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/visual/packs.spec.ts`
- Modify: `package.json` (Scripts `test:visual`, `test:visual:update`)
- Create (generiert): `tests/visual/packs.spec.ts-snapshots/*`

**Interfaces:**
- Consumes: Dev-Preview-Route (Task 8).
- Produces: `pnpm test:visual` als Regressions-Netz; Baselines im Repo. Plan B/C erweitern nur die `PACKS`-Liste.

- [ ] **Step 1: Playwright installieren und konfigurieren**

```bash
pnpm add -D @playwright/test
pnpm exec playwright install chromium
```

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/visual",
  webServer: { command: "npm run dev", url: "http://localhost:3000",
    reuseExistingServer: true, timeout: 60_000 },
  use: { baseURL: "http://localhost:3000" },
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
});
```

- [ ] **Step 2: Screenshot-Test schreiben**

```ts
// tests/visual/packs.spec.ts
import { expect, test } from "@playwright/test";

const PACKS = ["werkbank"] as const;           // Plan B/C erweitern diese Liste
const FIXTURES = ["full", "minimal"] as const;
const VIEWPORTS = [
  { name: "mobil", width: 320, height: 900 },
  { name: "tablet", width: 768, height: 900 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const pack of PACKS) for (const fixture of FIXTURES) for (const vp of VIEWPORTS) {
  test(`${pack} ${fixture} ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`/dev/site-preview?pack=${pack}&fixture=${fixture}`);
    await page.waitForLoadState("networkidle"); // Fonts geladen
    await expect(page).toHaveScreenshot(`${pack}-${fixture}-${vp.name}.png`, { fullPage: true });
  });
}
```

`package.json`-Scripts: `"test:visual": "playwright test"`, `"test:visual:update": "playwright test --update-snapshots"`.

- [ ] **Step 3: Baselines erzeugen und prüfen**

Run: `pnpm test:visual:update` → 6 PNGs entstehen.
Jeden PNG gegen `docs/design/stilkatalog.html` Kachel 01 prüfen: Rail vorhanden, Outline-Zeile, Marquee gedreht, kein Radius, Mobil ohne horizontales Scrollen.

- [ ] **Step 4: Regressionslauf grün**

Run: `pnpm test:visual`
Expected: 6 passed

- [ ] **Step 5: Commit + Abnahme-Checkpoint**

```bash
git add playwright.config.ts tests/visual/ package.json pnpm-lock.yaml
git commit -m "test: visuelle Regression für Pack werkbank (2 Fixtures x 3 Breakpoints)"
```

**CHECKPOINT (nicht überspringen):** `werkbank-full-desktop.png` dem User zeigen und Freigabe einholen, bevor Plan B startet. Erst nach User-„passt" gilt das Pack-Muster als bestätigt.

---

## Selbstreview-Ergebnis (Plan A)

- Spec-Abdeckung Plan A: §2 (Struktur), §3 (Verfassung, 1/14), §4 (Vertrag, Engine, Anti-Baukasten via Signatur-Test in Task 5), §5 (SSR inkl. `SSR_SITES`-Flag), §8.1–8.3 anteilig (visuell / Vertrag / SSR-Smoke). §6 (Generierung), §8.4–8.5 (axe, Perf-Budget) und die restlichen Packs: Plan B/C.
- Typkonsistenz geprüft: `getFixture` / `renderSiteHtml` / `registerSsrRoutes` / `PACK_MODULES` / `WERKBANK_MODULE` werden überall mit identischer Signatur verwendet.
- Kein Platzhalter-Muster („TBD", „später", codelose Code-Schritte) enthalten; beschreibende Schritte (Task 5/7/8 Step 3) nennen exakte Klassen, Feldnamen, Fehlertexte und Quellen.
