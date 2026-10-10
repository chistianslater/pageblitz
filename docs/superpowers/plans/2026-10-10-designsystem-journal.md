# Designsystem „Journal“ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Das erste von sechs Designsystemen („Journal“) vollständig bauen — inklusive des gemeinsamen Grundgerüsts `designRevision: 3` — bis zur Abnahme durch den Betreiber und Freischaltung für neue Friseur-/Kosmetik-, Unterkunfts- und Kreativ-Seiten.

**Architecture:** Ein System ist ein Modul mit derselben Form wie ein Pack-Modul (`{ id, css, Page }`) und hängt sich in `SiteRenderer` ein: Bei `designRevision === 3` nimmt `SiteRenderer` das System-Modul statt `PACK_MODULES[stylePackId]` und die System-Tokens statt `toCssVars`. Navigation, Unterseiten, Galerie-Alben, Inseln, Hinweis-Banner und Rechtsseiten laufen dadurch unverändert weiter. Tokens und Zuordnung liegen in `shared/designSystems/`, die Journal-Abschnitte in `client/src/components/site/systems/journal/`. Rev 1/2 bleiben unverändert; neue Seiten bekommen rev 3 nur, wenn ihr Hauptsystem in `RELEASED_SYSTEMS` steht.

**Tech Stack:** React 19 (SSR via `renderToStaticMarkup`), TypeScript, Zod (`.strict()`), Vitest, Playwright, Express (SSR-Routen), tRPC 11 (Studio), selbst gehostete WOFF2-Schriften.

**Spec:** `docs/superpowers/specs/2026-10-10-designsysteme-design.md`

## Global Constraints

- Antworten/Texte an den Betreiber: Deutsch, informell (du). UI-Texte auf Kundenseiten: Deutsch, Sie-/neutral wie bisher in den Bauplänen.
- Sechs Systeme, IDs exakt: `journal`, `raster`, `plakat`, `nacht`, `werkstoff`, `klar`. In diesem Plan wird nur `journal` gebaut; die anderen fünf existieren nur als ID und in der Zuordnungstabelle.
- Je System genau **3** kuratierte Paletten; keine freie Farb- oder Schriftwahl bei rev 3.
- Schriften selbst gehostet (`client/public/fonts/systems/`), `font-display: swap`, **höchstens 2** `<link rel="preload">` je System. Bei rev 3 **kein** Google-Fonts-Link.
- Kontrast: Fließtext WCAG AA (≥ 4,5:1), große Schrift ≥ 3:1; Ziel ink/paper ≥ 7:1.
- Lighthouse: LCP < 2,5 s, CLS < 0,1; kein horizontales Scrollen bei 320/375/768/1024/1440.
- `prefers-reduced-motion: reduce` → keine Bewegung.
- Keine erfundenen Preise, Zitate oder Teammitglieder; Platzhalter nur in der Vorschau (`preview === true`), nie live.
- Rev 1/2-Seiten rendern nach jedem Task pixelgleich (`npm run test:visual` für `packs.spec.ts` bleibt grün).
- Branchen-Baupläne (`blueprintFor`) bestimmen weiterhin Abschnitte, Reihenfolge, Navigationsnamen, Hauptaktion, Vertrauensleiste.
- Commits: Conventional Commits auf Deutsch, Abschluss `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Arbeit auf Branch `feat/designsystem-journal`.
- Produktion deployt von `origin/main` — erst nach Abnahme (Task 19) mergen.

## Review Focus

1. **Schwaches oder fehlendes Titelfoto** (Logo als Foto, Hochformat, gar kein Foto) → Journal zeigt einen reinen Typo-Einstieg, kein leeres Bildfeld, kein verzerrtes Logo. Test in Task 8.
2. **Sehr lange Betriebsnamen / Überschriften** („Friseursalon Haarmonie & Kosmetikstudio Lindner-Bramhoff“) → keine Überläufe bei 320 px, Silbentrennung statt horizontales Scrollen. Test in Task 8 (Markup) und Task 17 (Screenshot 320).
3. **Minimaler Inhalt** (keine Bewertungen, keine Galerie, kein Über-uns-Foto, keine Öffnungszeiten) → Abschnitte entfallen sauber, keine leeren Überschriften, Nummerierung der Kapitel bleibt lückenlos. Test in Task 9–11 mit `getFixture(…, "minimal")`.
4. **Pack-Wechsel im Studio auf einer rev-3-Seite** (und umgekehrt System-Wahl auf rev 2) → Seite wechselt sauber die Revision, kein Mischzustand (`designRevision: 3` mit Pack-Look oder rev 2 mit `system`). Test in Task 6.
5. **Unterseiten und Rechtsseiten** (Impressum, Datenschutz, Unterseiten-Add-on) einer Journal-Seite → gleiche Schrift, Farben, Nav und Fuß wie die Startseite. Test in Task 12.

---

## Dateistruktur

| Datei | Verantwortung |
|---|---|
| `shared/siteContract/schema.ts` (ändern) | `designRevision` um `3` erweitern; Felder `system`, `palette` |
| `shared/designSystems/types.ts` | Typen `DesignSystemId`, `SystemPalette`, `TypeStep`, `DesignSystemDef` |
| `shared/designSystems/journal.ts` | Journal-Tokens (Schriften, Schriftskala, Abstände, 3 Paletten) |
| `shared/designSystems/registry.ts` | `DESIGN_SYSTEMS`, `RELEASED_SYSTEMS`, `getSystem`, `isReleased` |
| `shared/designSystems/palette.ts` | `pickPalette`, `getPalette` |
| `shared/designSystems/toCss.ts` | `systemCssVars` (Tokens → CSS-Variablen) |
| `shared/designSystems/assignment.ts` | Tabelle Branche → (Haupt, Alt 1, Alt 2), `systemsForDoc` |
| `shared/designSystems/apply.ts` | `withDesignSystem`, `withoutDesignSystem` |
| `shared/designSystems/index.ts` | Re-Exporte |
| `shared/stylePacks/blueprints.ts` (ändern) | `isBarberShop` exportieren |
| `client/src/components/site/systems/SystemContext.tsx` | Kontext `{data, blueprint, preview, now, palette}` |
| `client/src/components/site/systems/registry.ts` | `SYSTEM_MODULES` |
| `client/src/components/site/systems/journal/index.tsx` | `JOURNAL_MODULE` (`Page`, `css`) |
| `client/src/components/site/systems/journal/css.ts` | gesamtes Journal-CSS (inkl. `@font-face`) |
| `client/src/components/site/systems/journal/Chrome.tsx` | Kopfzeile, Fuß, Kapitelkopf, Handy-Dock |
| `client/src/components/site/systems/journal/Entry.tsx` | Einstieg (Foto- und Typo-Fassung) + Faktenleiste |
| `client/src/components/site/systems/journal/Offer.tsx` | Leistungen, Ablauf, Preise, Speisekarte, Team |
| `client/src/components/site/systems/journal/Story.tsx` | Über uns, Galerie, Stimmen |
| `client/src/components/site/systems/journal/Visit.tsx` | Gut zu wissen, Kontakt |
| `client/src/components/site/systems/journal/sections.tsx` | Abschnitts-Weiche + Kapitelnummern |
| `client/src/components/site/systems/journal/journal.test.tsx` | Renderer-Tests |
| `client/src/components/site/SiteRenderer.tsx` (ändern) | rev-3-Zweig |
| `server/ssr/renderSite.tsx` (ändern) | Font-Kopf für rev 3 (Preload statt Google) |
| `server/ssr/routes.ts` (ändern) | `?system=&palette=` in Vorschau, Dev-Vorschau, Demo-Route |
| `server/onboardingV2/applyPatch.ts` (ändern) | Pack-Wahl auf rev 3 → zurück zu rev 2 |
| `server/onboardingV2/router.ts` (ändern) | Kandidaten mit Systemen, `selectDesignSystem` |
| `client/src/pages/onboarding-v2/PreviewFrame.tsx`, `DesignSplash.tsx`, `panels/StylePanel.tsx` (ändern) | System-/Paletten-Auswahl |
| `server/generationV2/runJob.ts` (ändern) | rev 3 bei freigeschaltetem Hauptsystem |
| `shared/stylePacks/blueprintShowcaseList.ts`, `client/src/pages/DesignReviewPage.tsx` (ändern) | System-Übersicht |
| `tests/visual/systems.spec.ts` | Screenshot-Vergleich |
| `client/public/fonts/systems/*.woff2` | Schriftdateien (OFL) |

---

## Phase A — Gestaltung (Betreiber-Gates)

### Task 1: Referenz-Board Journal

**Files:**
- Create: `docs/designsysteme/journal/referenzen.html`
- Create: `docs/designsysteme/journal/referenzen.jpg` (Screenshot des Boards)

**Interfaces:**
- Produces: freigegebene Referenzliste (URLs + je ein Satz „was wir übernehmen“), die Task 2 als Grundlage nimmt.

- [ ] **Step 1: Skill laden** — `refero-design` per Skill-Tool aufrufen und dessen Recherche-Methode befolgen.
- [ ] **Step 2: Recherche** — Refero (`refero_search_styles`, `refero_search_sites`, `refero_search_screens`) und Web nach redaktionellen/Magazin-Websites mit Serifen-Display, Haarlinien, nummerierten Kapiteln, Bildunterschriften durchsuchen. Suchbegriffe u. a.: „editorial salon website“, „magazine layout serif beauty“, „hair studio website editorial“, „boutique hotel editorial website“. Ziel: 8–12 Seiten, davon mind. 4 aus Friseur/Kosmetik/Unterkunft, mind. 2 mit starker Handy-Darstellung.
- [ ] **Step 3: Board bauen** — `docs/designsysteme/journal/referenzen.html`: Raster aus Screenshots (Desktop + Handy), je Karte Name, URL und ein Satz „Übernehmen: …“ (konkret: z. B. „Kapitelnummer kursiv links neben H2“, „Bildunterschrift rechtsbündig mit Abb.-Nr.“). Screenshot nach `referenzen.jpg`.
- [ ] **Step 4: Dem Betreiber zeigen** — per `SendUserFile` (`referenzen.jpg`) senden, fragen: „Welche Karten treffen Journal, welche raus?“ **STOP bis zur Freigabe.** Abgelehnte Karten entfernen, Board neu speichern.
- [ ] **Step 5: Commit**

```bash
git checkout -b feat/designsystem-journal
git add docs/designsysteme/journal/
git commit -m "docs(journal): Referenz-Board für Designsystem Journal

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 2: Systemblatt Journal

**Files:**
- Create: `docs/designsysteme/journal/systemblatt.html`
- Create: `docs/designsysteme/journal/systemblatt.jpg`

**Interfaces:**
- Consumes: freigegebenes Referenz-Board (Task 1).
- Produces: endgültige Werte für `JOURNAL` (Task 4). Die Startwerte unten sind der Vorschlag; jede Änderung aus der Freigabe wird **wörtlich** in Task 4 Step 3 übernommen.

- [ ] **Step 1: Skills laden** — `high-end-visual-design`, `design-taste-frontend` und `emil-design-eng` per Skill-Tool laden; deren Typo-/Spacing-Regeln auf die Startwerte anwenden.
- [ ] **Step 2: Systemblatt bauen** — eine HTML-Seite mit: Schriftmuster (Fraunces 300/400/300-kursiv, Inter Tight 400/500/600), jede Stufe der Schriftskala mit echtem deutschem Text („Schnitt, Farbe & gute Laune.“, „Damenschnitt“, Fließtext 3 Zeilen) bei 375 und 1440 px, Abstandsskala als Balken, Raster (Handy 1 Spalte + Rand, Desktop 12 Spalten, Textmaß 34rem), drei Paletten als Flächen mit Kontrastwerten, Bildregeln (Hochformat 4:5 im Einstieg, Bildpaar 1,3:1, Bildunterschrift „Abb. n“), Bewegung (Einstieg: Überschrift 600 ms Einblenden von 12 px unten, Abschnitte 400 ms beim ersten Sichtbarwerden), Typo-Einstieg ohne Foto.

Startwerte (in das Blatt übernehmen):

| Stufe | Schrift | Größe | Zeilenhöhe | Laufweite | Gewicht |
|---|---|---|---|---|---|
| `display` | Fraunces | `clamp(3.25rem, 1.4rem + 7.6vw, 7.75rem)` | 0.92 | -0.035em | 300 |
| `h2` | Fraunces | `clamp(2.125rem, 1.45rem + 2.8vw, 3.75rem)` | 1.0 | -0.022em | 300 |
| `h3` | Fraunces | `clamp(1.25rem, 1.12rem + 0.55vw, 1.625rem)` | 1.2 | -0.01em | 400 |
| `lede` | Fraunces | `clamp(1.25rem, 1.08rem + 0.75vw, 1.75rem)` | 1.34 | -0.006em | 300 |
| `body` | Inter Tight | `1rem` | 1.62 | 0 | 400 |
| `small` | Inter Tight | `0.8125rem` | 1.5 | 0.005em | 400 |
| `kicker` | Inter Tight | `0.6875rem` | 1.2 | 0.14em | 500 (Versalien) |

Abstände: `2xs .25rem`, `xs .5rem`, `s .75rem`, `m 1.25rem`, `l 2rem`, `xl 3.5rem`, `2xl 5.5rem`, `section clamp(4.5rem, 2.8rem + 6.5vw, 9.5rem)`, `gutter clamp(1.375rem, 0.75rem + 2.6vw, 3.25rem)`, `measure 34rem`, `max 78rem`.

Paletten:

| ID | Name | paper | ink | muted | rule | accent | deep | onDeep |
|---|---|---|---|---|---|---|---|---|
| `papier` | Papier | `#f3eee5` | `#1d1b18` | `#6e665b` | `#d8cfc1` | `#87573a` | `#1d1b18` | `#f3eee5` |
| `salbei` | Salbei | `#eef0ea` | `#1b211d` | `#5e6858` | `#cfd5c8` | `#4a6545` | `#1f2a22` | `#eef0ea` |
| `ton` | Ton | `#f4ece6` | `#2a1d18` | `#76625a` | `#dfcfc4` | `#9c4630` | `#2a1d18` | `#f4ece6` |

- [ ] **Step 3: Kontrast prüfen** — im Blatt für jede Palette `contrastRatio` (aus `shared/stylePacks/colorMath.ts`) ink/paper, muted/paper, accent/paper, onDeep/deep anzeigen; Werte unter Global Constraints dunkler ziehen, bis sie passen.
- [ ] **Step 4: Dem Betreiber zeigen** — `systemblatt.jpg` per `SendUserFile`; fragen: „Passt Typo, Abstand, Farben?“ **STOP bis zur Freigabe.** Änderungen ins Blatt und in die Tabellen oben übernehmen.
- [ ] **Step 5: Commit**

```bash
git add docs/designsysteme/journal/
git commit -m "docs(journal): Systemblatt mit Schriftskala, Abständen, Paletten

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Phase B — Grundgerüst rev 3

### Task 3: Seitenvertrag rev 3

**Files:**
- Modify: `shared/siteContract/schema.ts:613-720` (`WebsiteDataV2Schema`)
- Create: `shared/designSystems/types.ts`
- Test: `shared/siteContract/schemaRev3.test.ts`

**Interfaces:**
- Produces: `DESIGN_SYSTEM_IDS`, `type DesignSystemId`, Schema-Felder `system?: DesignSystemId`, `palette?: string` (`/^[a-z]+$/`, max 20), `designRevision?: 1 | 2 | 3`. Refine: `designRevision === 3` ⇔ `system` gesetzt.

- [ ] **Step 1: Failing test**

```ts
// shared/siteContract/schemaRev3.test.ts
import { describe, expect, test } from "vitest";
import { WebsiteDataV2Schema } from "./schema";
import { getFixture } from "./fixtures";

const base = getFixture("salon-noir", "full");

describe("Seitenvertrag rev 3", () => {
  test("akzeptiert rev 3 mit System und Palette", () => {
    const r = WebsiteDataV2Schema.safeParse({
      ...base, designRevision: 3, system: "journal", palette: "papier",
    });
    expect(r.success).toBe(true);
  });
  test("lehnt unbekanntes System ab", () => {
    const r = WebsiteDataV2Schema.safeParse({
      ...base, designRevision: 3, system: "barock", palette: "papier",
    });
    expect(r.success).toBe(false);
  });
  test("lehnt Palette mit Sonderzeichen ab", () => {
    const r = WebsiteDataV2Schema.safeParse({
      ...base, designRevision: 3, system: "journal", palette: "x;color:red",
    });
    expect(r.success).toBe(false);
  });
  test("rev 3 ohne System ist ungültig", () => {
    expect(WebsiteDataV2Schema.safeParse({ ...base, designRevision: 3 }).success).toBe(false);
  });
  test("System ohne rev 3 ist ungültig", () => {
    expect(
      WebsiteDataV2Schema.safeParse({ ...base, designRevision: 2, system: "journal" }).success
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Run** `npx vitest run shared/siteContract/schemaRev3.test.ts` — Expected: FAIL (`system` unbekannter Schlüssel).
- [ ] **Step 3: Implement**

```ts
// shared/designSystems/types.ts
export const DESIGN_SYSTEM_IDS = [
  "journal", "raster", "plakat", "nacht", "werkstoff", "klar",
] as const;
export type DesignSystemId = (typeof DESIGN_SYSTEM_IDS)[number];

export type TypeStep = "display" | "h2" | "h3" | "lede" | "body" | "small" | "kicker";
export type SpaceStep =
  | "2xs" | "xs" | "s" | "m" | "l" | "xl" | "2xl" | "section" | "gutter" | "measure" | "max";

export type TypeSpec = {
  font: "display" | "text";
  size: string;
  line: number;
  track: string;
  weight: number;
  upper?: boolean;
};

export type SystemPalette = {
  id: string;
  name: string;
  paper: string;
  ink: string;
  muted: string;
  rule: string;
  accent: string;
  deep: string;
  onDeep: string;
};

export type FontFile = { file: string; weight: string; style: "normal" | "italic" };
export type SystemFont = { family: string; fallback: string; files: readonly FontFile[] };

export type DesignSystemDef = {
  id: DesignSystemId;
  name: string;
  essence: string;
  fonts: { display: SystemFont; text: SystemFont };
  /** Dateinamen (aus fonts.*.files), die im <head> vorgeladen werden — max. 2. */
  preload: readonly string[];
  type: Record<TypeStep, TypeSpec>;
  space: Record<SpaceStep, string>;
  palettes: readonly [SystemPalette, SystemPalette, SystemPalette];
};
```

In `schema.ts` (Import oben ergänzen: `import { DESIGN_SYSTEM_IDS } from "../designSystems/types";`):

```ts
    designRevision: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
    // Designsysteme (2026-10-10): nur bei designRevision 3. `palette` ist
    // ein Lookup-Key (getPalette), landet nie als CSS-Wert im Dokument.
    system: z.enum(DESIGN_SYSTEM_IDS).optional(),
    palette: z.string().regex(/^[a-z]+$/).max(20).optional(),
```

und am Ende des Objekts (vor/neben bestehenden `.refine`/`.superRefine` — wenn bereits eine `superRefine` existiert, die Prüfung dort anhängen):

```ts
  .superRefine((doc, ctx) => {
    if ((doc.designRevision === 3) !== Boolean(doc.system)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["system"],
        message: "designRevision 3 und system gehören zusammen",
      });
    }
  })
```

- [ ] **Step 4: Run** `npx vitest run shared/siteContract/` — Expected: PASS (alle bestehenden Schema-Tests ebenfalls grün). Dann `npm run check`.
- [ ] **Step 5: Commit** — `feat(vertrag): designRevision 3 mit system und palette`

### Task 4: Journal-Tokens, Register, Paletten, CSS-Variablen

**Files:**
- Create: `shared/designSystems/journal.ts`, `registry.ts`, `palette.ts`, `toCss.ts`, `index.ts`
- Test: `shared/designSystems/tokens.test.ts`

**Interfaces:**
- Consumes: Typen aus Task 3; freigegebene Werte aus Task 2.
- Produces:
  - `JOURNAL: DesignSystemDef`
  - `DESIGN_SYSTEMS: Partial<Record<DesignSystemId, DesignSystemDef>>`
  - `RELEASED_SYSTEMS: readonly DesignSystemId[]` (jetzt `[]`, Journal kommt in Task 19 dazu)
  - `getSystem(id: DesignSystemId): DesignSystemDef | undefined`
  - `isReleased(id: DesignSystemId): boolean`
  - `getPalette(def: DesignSystemDef, id?: string): SystemPalette` (unbekannt → erste)
  - `pickPalette(def: DesignSystemDef, accentHex?: string): SystemPalette`
  - `systemCssVars(def: DesignSystemDef, paletteId?: string): Record<string, string>`

- [ ] **Step 1: Failing test**

```ts
// shared/designSystems/tokens.test.ts
import { describe, expect, test } from "vitest";
import { JOURNAL } from "./journal";
import { getPalette, pickPalette } from "./palette";
import { systemCssVars } from "./toCss";
import { contrastRatio } from "../stylePacks/colorMath";

describe("Journal-Tokens", () => {
  test("genau drei Paletten mit eindeutigen IDs", () => {
    expect(JOURNAL.palettes).toHaveLength(3);
    expect(new Set(JOURNAL.palettes.map(p => p.id)).size).toBe(3);
  });
  test.each(JOURNAL.palettes.map(p => [p.id, p] as const))("Kontrast %s", (_id, p) => {
    expect(contrastRatio(p.ink, p.paper)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(p.muted, p.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.accent, p.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.onDeep, p.deep)).toBeGreaterThanOrEqual(7);
  });
  test("höchstens zwei Preloads, alle existieren in fonts", () => {
    const files = [...JOURNAL.fonts.display.files, ...JOURNAL.fonts.text.files].map(f => f.file);
    expect(JOURNAL.preload.length).toBeLessThanOrEqual(2);
    for (const f of JOURNAL.preload) expect(files).toContain(f);
  });
  test("unbekannte Palette fällt auf die erste zurück", () => {
    expect(getPalette(JOURNAL, "gibtsnicht").id).toBe(JOURNAL.palettes[0].id);
  });
  test("Akzentfarbe wählt die nächste Palette", () => {
    expect(pickPalette(JOURNAL, "#4f7048").id).toBe("salbei");
    expect(pickPalette(JOURNAL, "#a3402a").id).toBe("ton");
    expect(pickPalette(JOURNAL).id).toBe("papier");
  });
  test("CSS-Variablen enthalten Palette und Skala", () => {
    const v = systemCssVars(JOURNAL, "salbei");
    expect(v["--sys-paper"]).toBe("#eef0ea");
    expect(v["--sys-display-size"]).toContain("clamp(");
    expect(v["--sys-space-section"]).toContain("clamp(");
    expect(v["--sys-font-display"]).toContain("Fraunces");
    expect(Object.values(v).every(x => !/[;{}]/.test(x))).toBe(true);
  });
});
```

- [ ] **Step 2: Run** `npx vitest run shared/designSystems/tokens.test.ts` — Expected: FAIL (Module fehlen).
- [ ] **Step 3: Implement** (Werte aus dem freigegebenen Systemblatt; hier die Startwerte):

```ts
// shared/designSystems/journal.ts
import type { DesignSystemDef } from "./types";

export const JOURNAL: DesignSystemDef = {
  id: "journal",
  name: "Journal",
  essence: "Magazin, ruhig, gebildet",
  fonts: {
    display: {
      family: "Fraunces",
      fallback: "Georgia, 'Times New Roman', serif",
      files: [
        { file: "fraunces-latin-opsz-wght.woff2", weight: "300 600", style: "normal" },
        { file: "fraunces-latin-opsz-wght-italic.woff2", weight: "300 600", style: "italic" },
      ],
    },
    text: {
      family: "Inter Tight",
      fallback: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      files: [{ file: "inter-tight-latin-wght.woff2", weight: "400 700", style: "normal" }],
    },
  },
  preload: ["fraunces-latin-opsz-wght.woff2", "inter-tight-latin-wght.woff2"],
  type: {
    display: { font: "display", size: "clamp(3.25rem, 1.4rem + 7.6vw, 7.75rem)", line: 0.92, track: "-0.035em", weight: 300 },
    h2: { font: "display", size: "clamp(2.125rem, 1.45rem + 2.8vw, 3.75rem)", line: 1, track: "-0.022em", weight: 300 },
    h3: { font: "display", size: "clamp(1.25rem, 1.12rem + 0.55vw, 1.625rem)", line: 1.2, track: "-0.01em", weight: 400 },
    lede: { font: "display", size: "clamp(1.25rem, 1.08rem + 0.75vw, 1.75rem)", line: 1.34, track: "-0.006em", weight: 300 },
    body: { font: "text", size: "1rem", line: 1.62, track: "0em", weight: 400 },
    small: { font: "text", size: "0.8125rem", line: 1.5, track: "0.005em", weight: 400 },
    kicker: { font: "text", size: "0.6875rem", line: 1.2, track: "0.14em", weight: 500, upper: true },
  },
  space: {
    "2xs": ".25rem", xs: ".5rem", s: ".75rem", m: "1.25rem", l: "2rem", xl: "3.5rem", "2xl": "5.5rem",
    section: "clamp(4.5rem, 2.8rem + 6.5vw, 9.5rem)",
    gutter: "clamp(1.375rem, 0.75rem + 2.6vw, 3.25rem)",
    measure: "34rem",
    max: "78rem",
  },
  palettes: [
    { id: "papier", name: "Papier", paper: "#f3eee5", ink: "#1d1b18", muted: "#6e665b", rule: "#d8cfc1", accent: "#87573a", deep: "#1d1b18", onDeep: "#f3eee5" },
    { id: "salbei", name: "Salbei", paper: "#eef0ea", ink: "#1b211d", muted: "#5e6858", rule: "#cfd5c8", accent: "#4a6545", deep: "#1f2a22", onDeep: "#eef0ea" },
    { id: "ton", name: "Ton", paper: "#f4ece6", ink: "#2a1d18", muted: "#76625a", rule: "#dfcfc4", accent: "#9c4630", deep: "#2a1d18", onDeep: "#f4ece6" },
  ],
};
```

```ts
// shared/designSystems/registry.ts
import { JOURNAL } from "./journal";
import type { DesignSystemDef, DesignSystemId } from "./types";

export const DESIGN_SYSTEMS: Partial<Record<DesignSystemId, DesignSystemDef>> = {
  journal: JOURNAL,
};

/** Nur abgenommene Systeme gehen an neue Seiten und ins Studio (Spec §6). */
export const RELEASED_SYSTEMS: readonly DesignSystemId[] = [];

export function getSystem(id: DesignSystemId): DesignSystemDef | undefined {
  return DESIGN_SYSTEMS[id];
}

export function isReleased(id: DesignSystemId): boolean {
  return RELEASED_SYSTEMS.includes(id) && Boolean(DESIGN_SYSTEMS[id]);
}
```

```ts
// shared/designSystems/palette.ts
import { hexToRgb } from "../stylePacks/colorMath";
import type { DesignSystemDef, SystemPalette } from "./types";

export function getPalette(def: DesignSystemDef, id?: string): SystemPalette {
  return def.palettes.find(p => p.id === id) ?? def.palettes[0];
}

function distance(a: string, b: string): number {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return Math.hypot(x.r - y.r, x.g - y.g, x.b - y.b);
}

/** Palette mit dem Akzent, der der Logo-/Fotofarbe am nächsten ist (Spec §5). */
export function pickPalette(def: DesignSystemDef, accentHex?: string): SystemPalette {
  if (!accentHex) return def.palettes[0];
  return [...def.palettes].sort(
    (a, b) => distance(a.accent, accentHex) - distance(b.accent, accentHex)
  )[0];
}
```

```ts
// shared/designSystems/toCss.ts
import { getPalette } from "./palette";
import type { DesignSystemDef, SystemFont } from "./types";

const stack = (f: SystemFont) => `"${f.family}", ${f.fallback}`;

export function systemCssVars(def: DesignSystemDef, paletteId?: string): Record<string, string> {
  const p = getPalette(def, paletteId);
  const vars: Record<string, string> = {
    "--sys-paper": p.paper, "--sys-ink": p.ink, "--sys-muted": p.muted,
    "--sys-rule": p.rule, "--sys-accent": p.accent, "--sys-deep": p.deep, "--sys-on-deep": p.onDeep,
    "--sys-font-display": stack(def.fonts.display),
    "--sys-font-text": stack(def.fonts.text),
  };
  for (const [step, t] of Object.entries(def.type)) {
    vars[`--sys-${step}-size`] = t.size;
    vars[`--sys-${step}-line`] = String(t.line);
    vars[`--sys-${step}-track`] = t.track;
    vars[`--sys-${step}-weight`] = String(t.weight);
  }
  for (const [step, value] of Object.entries(def.space)) vars[`--sys-space-${step}`] = value;
  return vars;
}
```

```ts
// shared/designSystems/index.ts
export * from "./types";
export * from "./registry";
export * from "./palette";
export * from "./toCss";
export { JOURNAL } from "./journal";
```

- [ ] **Step 4: Run** `npx vitest run shared/designSystems/` — Expected: PASS. Schlägt ein Kontrasttest fehl: die betreffende Farbe in `journal.ts` **und** im Systemblatt dunkler ziehen, bis grün.
- [ ] **Step 5: Commit** — `feat(systeme): Journal-Tokens, Register und CSS-Variablen`

### Task 5: Zuordnung Branche → System

**Files:**
- Modify: `shared/stylePacks/blueprints.ts:74-80` (Barber-Erkennung exportieren)
- Create: `shared/designSystems/assignment.ts`
- Test: `shared/designSystems/assignment.test.ts`

**Interfaces:**
- Consumes: `blueprintFor`, `BlueprintId`, `BLUEPRINT_IDS`, `GastroKind` aus `blueprints.ts`.
- Produces:
  - `isBarberShop(category: string | undefined, name: string): boolean` (in `blueprints.ts`)
  - `type SystemTriple = readonly [DesignSystemId, DesignSystemId, DesignSystemId]`
  - `systemsFor(family: BlueprintId, sub?: { barber?: boolean; gastroKind?: GastroKind }): SystemTriple`
  - `systemsForDoc(doc: Pick<WebsiteDataV2, "businessCategory" | "businessName" | "blueprintFamily">): SystemTriple`

- [ ] **Step 1: Failing test**

```ts
// shared/designSystems/assignment.test.ts
import { describe, expect, test } from "vitest";
import { BLUEPRINT_IDS, isBarberShop } from "../stylePacks/blueprints";
import { systemsFor, systemsForDoc } from "./assignment";

describe("Zuordnung Branche → System", () => {
  test.each(BLUEPRINT_IDS.map(id => [id]))("%s: drei verschiedene Systeme", id => {
    expect(new Set(systemsFor(id)).size).toBe(3);
  });
  test("Spec-Tabelle", () => {
    expect(systemsFor("beauty")).toEqual(["journal", "nacht", "plakat"]);
    expect(systemsFor("beauty", { barber: true })).toEqual(["plakat", "nacht", "raster"]);
    expect(systemsFor("trade")).toEqual(["werkstoff", "raster", "plakat"]);
    expect(systemsFor("gastro", { gastroKind: "restaurant" })).toEqual(["nacht", "journal", "werkstoff"]);
    expect(systemsFor("gastro", { gastroKind: "imbiss" })).toEqual(["plakat", "werkstoff", "raster"]);
    expect(systemsFor("gastro", { gastroKind: "cafe" })).toEqual(["werkstoff", "journal", "plakat"]);
    expect(systemsFor("health")).toEqual(["klar", "journal", "raster"]);
    expect(systemsFor("advice")).toEqual(["raster", "klar", "journal"]);
    expect(systemsFor("retail")).toEqual(["werkstoff", "journal", "plakat"]);
    expect(systemsFor("auto")).toEqual(["raster", "plakat", "nacht"]);
    expect(systemsFor("courses")).toEqual(["plakat", "klar", "raster"]);
    expect(systemsFor("stay")).toEqual(["journal", "nacht", "werkstoff"]);
    expect(systemsFor("creative")).toEqual(["journal", "raster", "plakat"]);
    expect(systemsFor("urgent")).toEqual(["raster", "klar", "plakat"]);
    expect(systemsFor("industry")).toEqual(["raster", "werkstoff", "klar"]);
    expect(systemsFor("standard")).toEqual(["raster", "journal", "klar"]);
  });
  test("Barbershop über den Namen erkannt", () => {
    expect(isBarberShop("Friseursalon", "Kante Barbershop")).toBe(true);
    expect(isBarberShop("Friseursalon", "Salon Lindner")).toBe(false);
    expect(systemsForDoc({ businessCategory: "Friseursalon", businessName: "Kante Barbershop", blueprintFamily: "beauty" })[0]).toBe("plakat");
  });
  test("Gastro ohne erkennbare Unterart → Restaurant-Zeile", () => {
    expect(systemsFor("gastro")).toEqual(["nacht", "journal", "werkstoff"]);
  });
});
```

- [ ] **Step 2: Run** `npx vitest run shared/designSystems/assignment.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** — in `blueprints.ts` die lokale Erkennung herausziehen (Verhalten unverändert):

```ts
/** Google führt viele Barbershops als „Friseursalon" — der Name verrät sie. */
export function isBarberShop(category: string | undefined, name: string): boolean {
  return /barb|herren/i.test(`${category ?? ""} ${name}`);
}

function beautyBlueprint(category: string, name: string): Blueprint {
  const text = `${category} ${name}`;
  const barber = isBarberShop(category, name);
  // … Rest unverändert
```

```ts
// shared/designSystems/assignment.ts
import type { WebsiteDataV2 } from "../siteContract/types";
import { blueprintFor, isBarberShop, type BlueprintId, type GastroKind } from "../stylePacks/blueprints";
import type { DesignSystemId } from "./types";

export type SystemTriple = readonly [DesignSystemId, DesignSystemId, DesignSystemId];

/** Spec §5 — Haupt, Alternative 1, Alternative 2. */
const BY_FAMILY: Record<Exclude<BlueprintId, "gastro">, SystemTriple> = {
  beauty: ["journal", "nacht", "plakat"],
  trade: ["werkstoff", "raster", "plakat"],
  health: ["klar", "journal", "raster"],
  advice: ["raster", "klar", "journal"],
  retail: ["werkstoff", "journal", "plakat"],
  auto: ["raster", "plakat", "nacht"],
  courses: ["plakat", "klar", "raster"],
  stay: ["journal", "nacht", "werkstoff"],
  creative: ["journal", "raster", "plakat"],
  urgent: ["raster", "klar", "plakat"],
  industry: ["raster", "werkstoff", "klar"],
  standard: ["raster", "journal", "klar"],
};
const BARBER: SystemTriple = ["plakat", "nacht", "raster"];
const GASTRO: Record<GastroKind, SystemTriple> = {
  restaurant: ["nacht", "journal", "werkstoff"],
  imbiss: ["plakat", "werkstoff", "raster"],
  cafe: ["werkstoff", "journal", "plakat"],
};

export function systemsFor(
  family: BlueprintId,
  sub: { barber?: boolean; gastroKind?: GastroKind } = {}
): SystemTriple {
  if (family === "gastro") return GASTRO[sub.gastroKind ?? "restaurant"];
  if (family === "beauty" && sub.barber) return BARBER;
  return BY_FAMILY[family];
}

export function systemsForDoc(
  doc: Pick<WebsiteDataV2, "businessCategory" | "businessName" | "blueprintFamily">
): SystemTriple {
  const bp = blueprintFor(doc.businessCategory, doc.businessName, doc.blueprintFamily);
  return systemsFor(bp.id, {
    barber: bp.id === "beauty" && isBarberShop(doc.businessCategory, doc.businessName),
    gastroKind: bp.gastroKind,
  });
}
```

Export in `index.ts` ergänzen: `export * from "./assignment";`

- [ ] **Step 4: Run** `npx vitest run shared/` — Expected: PASS (inkl. bestehender `blueprints.test.ts`).
- [ ] **Step 5: Commit** — `feat(systeme): Zuordnung Branche → Haupt- und Alternativsysteme`

### Task 6: System anwenden und Revision sauber wechseln

**Files:**
- Create: `shared/designSystems/apply.ts`
- Modify: `server/onboardingV2/applyPatch.ts:48` (`applyStylePack`)
- Test: `shared/designSystems/apply.test.ts`, `server/onboardingV2/applyPatch.test.ts` (erweitern; falls nicht vorhanden, anlegen)

**Interfaces:**
- Consumes: `getSystem`, `getPalette`, `pickPalette` (Task 4).
- Produces:
  - `withDesignSystem(doc: WebsiteDataV2, system: DesignSystemId, paletteId?: string): WebsiteDataV2` — setzt `designRevision: 3`, `system`, `palette` (gegebene, sonst `pickPalette(def, doc.colorOverrides?.accent)`), entfernt `fontPairId` und `designProfile` (gehören zum Pack-Look). Wirft `Error("Designsystem nicht vorhanden: <id>")`, wenn `getSystem` nichts liefert.
  - `withoutDesignSystem(doc: WebsiteDataV2): WebsiteDataV2` — `designRevision: 2`, entfernt `system`, `palette`.
  - `applyStylePack` ruft auf rev-3-Dokumenten zuerst `withoutDesignSystem`.

- [ ] **Step 1: Failing tests**

```ts
// shared/designSystems/apply.test.ts
import { describe, expect, test } from "vitest";
import { getFixture } from "../siteContract/fixtures";
import { WebsiteDataV2Schema } from "../siteContract/schema";
import { withArtDirection } from "../stylePacks/artDirection";
import { withDesignSystem, withoutDesignSystem } from "./apply";

const rev2 = withArtDirection(getFixture("salon-noir", "full"));

describe("withDesignSystem", () => {
  test("setzt rev 3, System, Palette und entfernt Pack-Look", () => {
    const doc = withDesignSystem({ ...rev2, fontPairId: "modern" }, "journal", "ton");
    expect(doc.designRevision).toBe(3);
    expect(doc.system).toBe("journal");
    expect(doc.palette).toBe("ton");
    expect(doc.fontPairId).toBeUndefined();
    expect(doc.designProfile).toBeUndefined();
    expect(WebsiteDataV2Schema.safeParse(doc).success).toBe(true);
  });
  test("ohne Palette: nach Akzentfarbe", () => {
    const doc = withDesignSystem({ ...rev2, colorOverrides: { accent: "#4f7048" } }, "journal");
    expect(doc.palette).toBe("salbei");
  });
  test("unbekannte Palette → erste Palette", () => {
    expect(withDesignSystem(rev2, "journal", "gibtsnicht").palette).toBe("papier");
  });
  test("nicht gebautes System wirft", () => {
    expect(() => withDesignSystem(rev2, "nacht")).toThrow(/nicht vorhanden/);
  });
  test("withoutDesignSystem kehrt zu rev 2 zurück", () => {
    const back = withoutDesignSystem(withDesignSystem(rev2, "journal"));
    expect(back.designRevision).toBe(2);
    expect(back.system).toBeUndefined();
    expect(back.palette).toBeUndefined();
    expect(WebsiteDataV2Schema.safeParse(back).success).toBe(true);
  });
});
```

In `server/onboardingV2/applyPatch.test.ts` ergänzen:

```ts
import { withDesignSystem } from "../../shared/designSystems/apply";
// …
test("Pack-Wahl auf einer Journal-Seite wechselt zurück auf rev 2", () => {
  const doc = withDesignSystem(withArtDirection(getFixture("salon-noir", "full")), "journal");
  const next = applyStylePack(doc, "werkbank");
  expect(next.designRevision).toBe(2);
  expect(next.system).toBeUndefined();
  expect(next.stylePackId).toBe("werkbank");
});
```

- [ ] **Step 2: Run** `npx vitest run shared/designSystems/apply.test.ts server/onboardingV2/applyPatch.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement**

```ts
// shared/designSystems/apply.ts
import type { WebsiteDataV2 } from "../siteContract/types";
import { getPalette, pickPalette } from "./palette";
import { getSystem } from "./registry";
import type { DesignSystemId } from "./types";

export function withDesignSystem(
  doc: WebsiteDataV2,
  system: DesignSystemId,
  paletteId?: string
): WebsiteDataV2 {
  const def = getSystem(system);
  if (!def) throw new Error(`Designsystem nicht vorhanden: ${system}`);
  const palette = paletteId
    ? getPalette(def, paletteId)
    : pickPalette(def, doc.colorOverrides?.accent);
  const { fontPairId: _f, designProfile: _p, ...rest } = doc;
  return { ...rest, designRevision: 3, system, palette: palette.id };
}

export function withoutDesignSystem(doc: WebsiteDataV2): WebsiteDataV2 {
  const { system: _s, palette: _p, ...rest } = doc;
  return { ...rest, designRevision: 2 };
}
```

In `applyStylePack` (erste Zeile des Funktionskörpers):

```ts
  doc = doc.designRevision === 3 ? withoutDesignSystem(doc) : doc;
```

Export in `index.ts`: `export * from "./apply";`

- [ ] **Step 4: Run** dieselben Tests + `npx vitest run server/onboardingV2/` — Expected: PASS.
- [ ] **Step 5: Commit** — `feat(systeme): System anwenden, Pack-Wahl kehrt zu rev 2 zurück`

---

## Phase C — Journal-Renderer

> Vor Task 7: Skills `high-end-visual-design`, `design-taste-frontend`, `emil-design-eng` laden. Alle Maße im CSS **nur** aus `--sys-*`-Variablen; keine freien px-/rem-Werte außer Haarlinien (`1px`) und Bildseitenverhältnissen.

### Task 7: Grundgerüst — Schriften, Modul, SiteRenderer-Zweig, Kopf und Fuß

**Files:**
- Create: `client/public/fonts/systems/fraunces-latin-opsz-wght.woff2`, `fraunces-latin-opsz-wght-italic.woff2`, `inter-tight-latin-wght.woff2`, `OFL.txt`
- Create: `client/src/components/site/systems/SystemContext.tsx`, `registry.ts`, `journal/index.tsx`, `journal/css.ts`, `journal/Chrome.tsx`, `journal/sections.tsx`
- Modify: `client/src/components/site/SiteRenderer.tsx:186-300,340-470`
- Modify: `server/ssr/renderSite.tsx:~104-130,~214-260` (Font-Kopf)
- Test: `client/src/components/site/systems/journal/journal.test.tsx`, `server/ssr/renderSiteRev3.test.ts`

**Interfaces:**
- Consumes: `systemCssVars`, `getSystem`, `getPalette` (Task 4); `blueprintFor`; `PackModule`-Form aus `client/src/components/site/packRegistry.ts`.
- Produces:
  - `SystemContext: React.Context<SystemState | undefined>`, `type SystemState = { data: WebsiteDataV2; blueprint: Blueprint; preview: boolean; now: Date }`, Hook `useSystem(): SystemState` (wirft außerhalb des Providers)
  - `SYSTEM_MODULES: Partial<Record<DesignSystemId, PackModule>>`
  - `JOURNAL_MODULE: PackModule` (`id: "journal"` — Typ-Cast nötig, da `PackModule.id` `PackId` ist; `PackModule` dafür auf `id: string` lockern)
  - `systemFontHead(def: DesignSystemDef): string` (in `renderSite.tsx`, liefert die Preload-Links)
  - Root-`div` trägt `data-pb-system="journal"` und `data-pb-palette="<id>"`
  - `JournalChapter({ index, title, intro })` und `chapterIndex(sections, type)` in `sections.tsx` für Task 8–11

- [ ] **Step 1: Schriften holen** (OFL, latin-Subset):

```bash
mkdir -p client/public/fonts/systems
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
curl -sA "$UA" "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Inter+Tight:wght@400..700&display=swap" > /tmp/journal-fonts.css
grep -B3 "src: url" /tmp/journal-fonts.css | grep -A3 "/\* latin \*/"
```

Aus der Ausgabe die drei `latin`-URLs (Fraunces normal, Fraunces italic, Inter Tight) herunterladen:

```bash
curl -so client/public/fonts/systems/fraunces-latin-opsz-wght.woff2 "<URL Fraunces normal latin>"
curl -so client/public/fonts/systems/fraunces-latin-opsz-wght-italic.woff2 "<URL Fraunces italic latin>"
curl -so client/public/fonts/systems/inter-tight-latin-wght.woff2 "<URL Inter Tight latin>"
cp client/public/fonts/OFL.txt client/public/fonts/systems/OFL.txt
ls -la client/public/fonts/systems
```

Erwartet: drei Dateien, je 20–150 KB. Die Platzhalter `<URL …>` sind die konkreten Werte aus der grep-Ausgabe des vorherigen Befehls.

- [ ] **Step 2: Failing tests**

```tsx
// client/src/components/site/systems/journal/journal.test.tsx
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import "../../packs";
import "../registry";
import { SiteRenderer } from "../../SiteRenderer";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { withDesignSystem } from "../../../../../../shared/designSystems/apply";

export const journalDoc = (kind: "full" | "minimal" | "features" = "full", palette?: string) =>
  withDesignSystem(getFixture("salon-noir", kind), "journal", palette);

export const render = (data = journalDoc(), preview = false) =>
  renderToStaticMarkup(
    <SiteRenderer data={data} islandsMode={preview ? "preview" : "live"} preview={preview} now={new Date("2026-10-13T10:00:00+02:00")} />
  );

describe("Journal: Grundgerüst", () => {
  test("rendert mit System-Attributen und System-Variablen", () => {
    const html = render(journalDoc("full", "salbei"));
    expect(html).toContain('data-pb-system="journal"');
    expect(html).toContain('data-pb-palette="salbei"');
    expect(html).toContain("--sys-paper:#eef0ea");
    expect(html).toContain("@font-face");
    expect(html).toContain("/fonts/systems/fraunces-latin-opsz-wght.woff2");
  });
  test("kein Pack- oder rev-2-CSS", () => {
    const html = render();
    expect(html).not.toContain("pb-salon-noir");
    expect(html).not.toContain("pb-art-hero");
    expect(html).not.toContain("pb-entry-");
  });
  test("Kopfzeile mit Betriebsname und Navigation, Fuß mit Adresse", () => {
    const data = journalDoc();
    const html = render(data);
    expect(html).toContain('class="jr-head"');
    expect(html).toContain(data.businessName);
    expect(html).toContain('class="jr-foot"');
  });
});
```

```ts
// server/ssr/renderSiteRev3.test.ts
import { describe, expect, test } from "vitest";
import { renderSiteHtml } from "./renderSite";
import { getFixture } from "../../shared/siteContract/fixtures";
import { withDesignSystem } from "../../shared/designSystems/apply";

describe("SSR rev 3", () => {
  test("lädt Schriften selbst gehostet vor, kein Google Fonts", () => {
    const { html } = renderSiteHtml(withDesignSystem(getFixture("salon-noir", "full"), "journal"), { origin: "https://x.pageblitz.de" });
    expect(html).not.toContain("fonts.googleapis.com");
    expect((html.match(/rel="preload"[^>]+as="font"/g) ?? []).length).toBe(2);
    expect(html).toContain('href="/fonts/systems/inter-tight-latin-wght.woff2"');
  });
  test("rev 2 bleibt bei Google Fonts", () => {
    const { html } = renderSiteHtml(getFixture("salon-noir", "full"), { origin: "https://x.pageblitz.de" });
    expect(html).toContain("fonts.googleapis.com");
  });
});
```

- [ ] **Step 3: Run** `npx vitest run client/src/components/site/systems server/ssr/renderSiteRev3.test.ts` — Expected: FAIL.
- [ ] **Step 4: Implement Kontext, Register, Modul**

```tsx
// client/src/components/site/systems/SystemContext.tsx
import { createContext, useContext } from "react";
import type { WebsiteDataV2 } from "../../../../../shared/siteContract/types";
import type { Blueprint } from "../../../../../shared/stylePacks/blueprints";

export type SystemState = { data: WebsiteDataV2; blueprint: Blueprint; preview: boolean; now: Date };
export const SystemContext = createContext<SystemState | undefined>(undefined);

export function useSystem(): SystemState {
  const state = useContext(SystemContext);
  if (!state) throw new Error("useSystem außerhalb von SystemContext");
  return state;
}
```

```ts
// client/src/components/site/systems/registry.ts
import type { DesignSystemId } from "../../../../../shared/designSystems/types";
import type { PackModule } from "../packRegistry";
import { JOURNAL_MODULE } from "./journal";

export const SYSTEM_MODULES: Partial<Record<DesignSystemId, PackModule>> = {
  journal: JOURNAL_MODULE,
};
```

`journal/sections.tsx` — Kapitelzählung und Abschnitts-Weiche (Task 8–11 füllen die `case`s):

```tsx
import React from "react";
import type { SectionV2 } from "../../../../../../shared/siteContract/types";
import { rich } from "../../richText";

/** Nummerierte Kapitel: nur sichtbare Inhaltsabschnitte, lückenlos ab 01. */
const NUMBERED = new Set(["services", "process", "about", "gallery", "testimonials", "team", "pricelist", "menu", "faq"]);

export function chapterIndex(sections: readonly SectionV2[], type: SectionV2["type"]): number {
  return sections.filter(s => NUMBERED.has(s.type)).findIndex(s => s.type === type) + 1;
}

export function JournalChapter({ index, title, intro, id }: { index: number; title: string; intro?: string; id: string }) {
  return (
    <header className="jr-chapter">
      <span className="jr-chapter-no" aria-hidden="true">{String(index).padStart(2, "0")}</span>
      <h2 id={`${id}-titel`}>{rich(title)}</h2>
      {intro && <p className="jr-chapter-intro">{rich(intro)}</p>}
    </header>
  );
}

export function renderJournalSection(section: SectionV2, sections: readonly SectionV2[]): React.ReactNode {
  switch (section.type) {
    default:
      return null;
  }
}
```

`journal/Chrome.tsx` — Kopf (Name links in Fraunces, Navigation als Versal-Kicker rechts, Hauptaktion als Pille; auf dem Handy `MobileNav` aus dem bestehenden Burger-Menü) und Fuß (dunkle Fläche `--sys-deep`, große Abschiedszeile in Fraunces „Bis bald in der {Straße}.“ bzw. ohne Straße „Bis bald.“, Hauptaktion, Adresse, Zeiten, Rechtslinks):

```tsx
import React from "react";
import type { NavItem } from "../../engine";
import { MobileNav } from "../../MobileNav";
import { isPlaceholderHours, shortHours, streetLine, telHref } from "../../artDirection/heroFacts";
import { useSystem } from "../SystemContext";
import type { SectionOf, WebsiteDataV2 } from "../../../../../../shared/siteContract/types";
import type { Blueprint } from "../../../../../../shared/stylePacks/blueprints";

function contactOf(sections: { type: string }[]): SectionOf<"contact"> | undefined {
  return sections.find((s): s is SectionOf<"contact"> => s.type === "contact");
}

/** „Hammer Straße 41, 48153 Münster" — leer, wenn nichts bekannt ist. */
export function addressLine(c: SectionOf<"contact"> | undefined): string {
  return [c?.street, [c?.zip, c?.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
}

export const mapsHref = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

/** Hauptaktion laut Bauplan: Anruf, Route oder Sprung zum Kontakt. */
export function primaryAction(
  data: WebsiteDataV2,
  blueprint: Blueprint
): { label: string; href: string } | undefined {
  const contact = contactOf(data.sections);
  const hero = data.sections.find((s): s is SectionOf<"hero"> => s.type === "hero");
  const label = hero?.ctaText ?? blueprint.ctaText ?? "Kontakt";
  if (blueprint.ctaAction === "tel" && contact?.phone) return { label, href: telHref(contact.phone)! };
  if (blueprint.ctaAction === "route" && addressLine(contact)) return { label, href: mapsHref(addressLine(contact)) };
  return { label, href: hero?.ctaHref ?? "#kontakt" };
}

export function JournalHead({ navItems }: { navItems: NavItem[] }) {
  const { data, blueprint } = useSystem();
  const action = primaryAction(data, blueprint);
  return (
    <header className="jr-head">
      <a className="jr-brand" href="#start">{data.businessName}</a>
      <nav className="jr-nav" aria-label="Hauptnavigation">
        {navItems.map(item => <a key={item.href} href={item.href} aria-current={item.current ? "page" : undefined}>{item.label}</a>)}
      </nav>
      {action && <a className="jr-pill" href={action.href}>{action.label}</a>}
      <MobileNav items={navItems} />
    </header>
  );
}

export function JournalFoot() {
  const { data } = useSystem();
  const contact = contactOf(data.sections);
  const street = streetLine(contact?.street);
  const address = addressLine(contact);
  const hours = (contact?.openingHours ?? []).filter(h => !isPlaceholderHours(h.hours));
  return (
    <footer className="jr-foot">
      <p className="jr-foot-line">{street ? <>Bis bald in der <em>{street}.</em></> : "Bis bald."}</p>
      {contact?.phone && <a className="jr-pill jr-pill--inverse" href={telHref(contact.phone)}>{contact.phone}</a>}
      <dl className="jr-foot-facts">
        {address && <div><dt>Adresse</dt><dd>{address}</dd></div>}
        {hours.length > 0 && (
          <div><dt>Zeiten</dt><dd>{hours.map(h => <span key={h.day}>{h.day} {shortHours(h.hours)}<br /></span>)}</dd></div>
        )}
      </dl>
      <nav className="jr-foot-legal" aria-label="Rechtliches">
        <a href="impressum">Impressum</a><a href="datenschutz">Datenschutz</a>
      </nav>
    </footer>
  );
}
```

> Hinweis für den Implementierer: Kontaktfelder laut `ContactSchema` (`schema.ts:297`): `phone`, `email`, `street`, `zip`, `city`, `openingHours: {day, hours}[]`. Die Props von `MobileNav` in `client/src/components/site/MobileNav.tsx` nachlesen (Import-Pfad ggf. anpassen); die Rechtslinks genauso bauen wie im Footer von `client/src/components/site/packs/werkbank/index.tsx` (relative Pfade vs. `basePath`). `addressLine`, `mapsHref`, `primaryAction` werden in Task 8 und 11 wiederverwendet.

`journal/index.tsx`:

```tsx
import React from "react";
import type { PackModule } from "../../packRegistry";
import { JOURNAL_CSS } from "./css";
import { JournalFoot, JournalHead } from "./Chrome";
import { renderJournalSection } from "./sections";

export const JOURNAL_MODULE: PackModule = {
  id: "journal",
  css: JOURNAL_CSS,
  Page: ({ data, navItems = [], sections }) => {
    const list = sections ?? data.sections;
    return (
      <>
        <JournalHead navItems={navItems} />
        <main className="jr-main" id="inhalt">
          {list.map(s => <React.Fragment key={s.type}>{renderJournalSection(s, list)}</React.Fragment>)}
        </main>
        <JournalFoot />
      </>
    );
  },
};
```

`journal/css.ts` — Grundschicht (Abschnitte ergänzen ihr CSS in Task 8–11 am Ende dieser Datei):

```ts
const FONT = "/fonts/systems";

export const JOURNAL_CSS = `
@font-face{font-family:"Fraunces";src:url(${FONT}/fraunces-latin-opsz-wght.woff2) format("woff2");font-weight:300 600;font-style:normal;font-display:swap}
@font-face{font-family:"Fraunces";src:url(${FONT}/fraunces-latin-opsz-wght-italic.woff2) format("woff2");font-weight:300 600;font-style:italic;font-display:swap}
@font-face{font-family:"Inter Tight";src:url(${FONT}/inter-tight-latin-wght.woff2) format("woff2");font-weight:400 700;font-style:normal;font-display:swap}

.pb-journal{background:var(--sys-paper);color:var(--sys-ink);font-family:var(--sys-font-text);font-size:var(--sys-body-size);line-height:var(--sys-body-line);
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;font-kerning:normal;font-variant-numeric:oldstyle-nums proportional-nums}
.pb-journal *{box-sizing:border-box}
.pb-journal h1,.pb-journal h2,.pb-journal h3{margin:0;font-family:var(--sys-font-display);font-variation-settings:"opsz" 144;text-wrap:balance;hyphens:manual}
.pb-journal p{margin:0;text-wrap:pretty;hyphens:auto;hyphenate-limit-chars:7 3 3}
.pb-journal a{color:inherit}
.pb-journal img{display:block;max-width:100%}
.pb-journal .jr-kicker{font-size:var(--sys-kicker-size);line-height:var(--sys-kicker-line);letter-spacing:var(--sys-kicker-track);font-weight:var(--sys-kicker-weight);text-transform:uppercase;color:var(--sys-muted)}
.pb-journal .jr-wrap{max-width:var(--sys-space-max);margin-inline:auto;padding-inline:var(--sys-space-gutter)}

.jr-head{position:sticky;top:0;z-index:20;display:flex;align-items:baseline;gap:var(--sys-space-l);padding:var(--sys-space-m) var(--sys-space-gutter);
  background:color-mix(in srgb,var(--sys-paper) 92%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--sys-rule)}
.jr-brand{font-family:var(--sys-font-display);font-size:var(--sys-h3-size);font-weight:400;letter-spacing:var(--sys-h3-track);text-decoration:none;margin-right:auto}
.jr-nav{display:none;gap:var(--sys-space-l)}
.jr-nav a{font-size:var(--sys-kicker-size);letter-spacing:var(--sys-kicker-track);text-transform:uppercase;text-decoration:none;color:var(--sys-muted);transition:color .2s}
.jr-nav a:hover,.jr-nav a[aria-current]{color:var(--sys-ink)}
.jr-pill{display:inline-flex;align-items:center;padding:var(--sys-space-s) var(--sys-space-m);border:1px solid currentColor;border-radius:999px;
  font-size:var(--sys-small-size);font-weight:500;text-decoration:none;transition:background .2s,color .2s}
.jr-pill:hover{background:var(--sys-ink);color:var(--sys-paper)}
.jr-pill:focus-visible,.jr-nav a:focus-visible{outline:2px solid var(--sys-accent);outline-offset:3px}
@media (min-width:64rem){.jr-nav{display:flex}.jr-head .pb-mobile-nav{display:none}}

.jr-chapter{display:grid;grid-template-columns:auto 1fr;column-gap:var(--sys-space-s);align-items:baseline;border-top:1px solid var(--sys-ink);padding-top:var(--sys-space-s);margin-bottom:var(--sys-space-xl)}
.jr-chapter-no{font-family:var(--sys-font-display);font-style:italic;font-weight:300;font-size:var(--sys-lede-size);color:var(--sys-muted)}
.jr-chapter h2{font-size:var(--sys-h2-size);line-height:var(--sys-h2-line);letter-spacing:var(--sys-h2-track);font-weight:var(--sys-h2-weight)}
.jr-chapter-intro{grid-column:2;margin-top:var(--sys-space-s);max-width:var(--sys-space-measure);color:var(--sys-muted)}
.jr-section{padding-top:var(--sys-space-section)}

.jr-foot{margin-top:var(--sys-space-section);background:var(--sys-deep);color:var(--sys-on-deep);padding:var(--sys-space-2xl) var(--sys-space-gutter) var(--sys-space-xl);display:grid;gap:var(--sys-space-l)}
.jr-foot-line{font-family:var(--sys-font-display);font-size:var(--sys-h2-size);line-height:var(--sys-h2-line);letter-spacing:var(--sys-h2-track);font-weight:300;max-width:14ch}
.jr-foot-line em{font-style:italic}
.jr-pill--inverse{justify-self:start;color:var(--sys-on-deep)}
.jr-pill--inverse:hover{background:var(--sys-on-deep);color:var(--sys-deep)}
.jr-foot-facts{display:grid;gap:var(--sys-space-m);margin:0;font-size:var(--sys-small-size)}
.jr-foot-facts dt{font-size:var(--sys-kicker-size);letter-spacing:var(--sys-kicker-track);text-transform:uppercase;opacity:.7}
.jr-foot-facts dd{margin:0}
.jr-foot-legal{display:flex;gap:var(--sys-space-m);font-size:var(--sys-small-size);opacity:.75}
@media (min-width:48rem){.jr-foot{grid-template-columns:1.4fr 1fr;align-items:end}.jr-foot-facts{grid-template-columns:1fr 1fr}}
`;
```

- [ ] **Step 5: SiteRenderer-Zweig** — in `SiteRenderer.tsx`:

```tsx
import { SYSTEM_MODULES } from "./systems/registry";
import { SystemContext } from "./systems/SystemContext";
import { getSystem } from "../../../../shared/designSystems/registry";
import { systemCssVars } from "../../../../shared/designSystems/toCss";
// …
  const systemDef = effectiveData.designRevision === 3 && effectiveData.system ? getSystem(effectiveData.system) : undefined;
  const mod = systemDef ? SYSTEM_MODULES[systemDef.id] : PACK_MODULES[effectiveData.stylePackId];
  if (!mod) throw new Error(`Modul nicht registriert: ${effectiveData.system ?? effectiveData.stylePackId}`);
  const vars = systemDef
    ? systemCssVars(systemDef, effectiveData.palette)
    : toCssVars(/* bisheriger Aufruf unverändert */);
```

- Den gesamten `if (effectiveData.designRevision === 2) { … }`-Block unverändert lassen (greift bei rev 3 nicht).
- `packOverride` bei rev 3 ignorieren: Bedingung für `effectiveData` um `data.designRevision !== 3 &&` erweitern.
- Root-`div`: `className={systemDef ? \`pb-site pb-${systemDef.id}\` : \`pb-site pb-${effectiveData.stylePackId}\`}`, zusätzlich `data-pb-system={systemDef?.id}` und `data-pb-palette={systemDef ? getPalette(systemDef, effectiveData.palette).id : undefined}`. Bei rev 3 die `data-pb-hero…`/`data-pb-deco…`-Attribute weglassen (`designProfile` ist bei rev 3 `undefined`, sie fallen dadurch schon weg — prüfen).
- `<style>`: bei rev 3 nur `mod.css + MOBILE_NAV_CSS + RICH_TEXT_CSS + NOTICE_CSS + BRANDING_CSS + (albumJson ? ALBUM_CSS : "") + (ageGate ? AGE_GATE_CSS : "") + (photoCredits ? PHOTO_CREDITS_CSS : "")` — **ohne** `MOTION_CSS`, `LAYOUT_POLISH_CSS`, `DESIGN_PROFILE_CSS`, `STORY_CSS`, `USP_CSS`, `EXTRA_SECTIONS_CSS`, `PARTNERS_CSS`, `REVIEW_CHROME_CSS`, `DECO_TOGGLE_CSS`, `SECTION_LINK_CSS` und ohne rev-2-CSS.
- Provider: bei rev 3 `<SystemContext.Provider value={{ data: effectiveData, blueprint: blueprintFor(effectiveData.businessCategory, effectiveData.businessName, effectiveData.blueprintFamily), preview, now }}>` um `<mod.Page …/>` und `<PhotoCredits/>`; `EntryContext`/`EntryDock` nur bei rev ≠ 3.

- [ ] **Step 6: SSR-Font-Kopf** — in `renderSite.tsx`:

```ts
import { getSystem } from "../../shared/designSystems/registry";
import type { DesignSystemDef } from "../../shared/designSystems/types";

export function systemFontHead(def: DesignSystemDef): string {
  return def.preload
    .map(f => `<link rel="preload" href="/fonts/systems/${esc(f)}" as="font" type="font/woff2" crossorigin />`)
    .join("\n");
}
```

In `renderHead` und `renderPageHead`: wenn `data.designRevision === 3 && data.system && getSystem(data.system)`, statt der drei Google-Zeilen (`preconnect` ×2 + `stylesheet`) `systemFontHead(def)` ausgeben; sonst unverändert. `renderLegalPage` genauso (falls es einen eigenen Kopf baut — in der Datei suchen, gleiche Ersetzung).

- [ ] **Step 7: Run** `npx vitest run client/src/components/site server/ssr` — Expected: PASS; außerdem `npm run check`.
- [ ] **Step 8: Statische Auslieferung prüfen** — `npm run dev`, dann `curl -sI http://localhost:3000/fonts/systems/inter-tight-latin-wght.woff2 | head -3` → `200` und `content-type: font/woff2`. Liefert der Server die Datei auf Kunden-Subdomains/eigenen Domains über denselben Express-Static-Pfad aus, ist nichts zu tun; sonst in `server/_core/index.ts` den Static-Pfad für `/fonts` vor das Subdomain-Routing setzen und mit einem Test in `server/ssr/routes.test.ts` absichern (GET `/fonts/systems/…` mit Host-Header einer Kunden-Subdomain → 200).
- [ ] **Step 9: Commit** — `feat(journal): Grundgerüst, selbst gehostete Schriften, SiteRenderer-Zweig`

### Task 8: Journal-Einstieg (Foto- und Typo-Fassung)

**Files:**
- Create: `client/src/components/site/systems/journal/Entry.tsx`
- Modify: `journal/sections.tsx` (`case "hero"`), `journal/css.ts` (Einstiegs-CSS anhängen)
- Test: `journal/journal.test.tsx` (erweitern)

**Interfaces:**
- Consumes: `useSystem`, `todayLine`, `streetLine`, `telHref` (`heroFacts.ts`), `trustFacts` (`entrySections.tsx:661`), Google-Bewertung aus `data` (Feld wie in `ArtDirectedHero.tsx` gelesen — dort nachsehen und gleich übernehmen).
- Produces: `JournalEntry({ hero }: { hero: SectionOf<"hero"> })`; Klassen `jr-entry`, `jr-entry--type` (ohne Foto), `jr-entry-facts`.

Gestaltung (aus Systemblatt): Kicker „{Branche} · {Ort}, {Straße}“; H1 in `display`, letztes Wort/Satzteil kursiv in Akzentfarbe (`rich`-Markierung des Modells nutzen; ohne Markierung: letztes Wort kursiv); Foto 4:5 auf dem Handy volle Breite, ab 64rem rechts in Spalte 7–12 mit Bildunterschrift „{Betriebsname}, {Straße}“ + „Abb. 1“; darunter Lede in `lede`; Faktenleiste als 2×2-Raster mit Haarlinien: Google-Note, heute geöffnet, Telefon, ein Vertrauensfakt (`trustFacts`, erstes nicht-`weak`). Typo-Fassung (kein Foto, Foto aussortiert `hiddenElements` oder Hochformat-Logo): H1 über volle Breite, darunter Lede zweispaltig, keine leere Bildfläche.

- [ ] **Step 1: Failing tests**

```tsx
describe("Journal: Einstieg", () => {
  test("mit Foto: Bild, Bildunterschrift, Faktenleiste", () => {
    const html = render();
    expect(html).toMatch(/<section[^>]+class="jr-entry"/);
    expect(html).toContain("Abb. 1");
    expect(html).toContain('class="jr-entry-facts"');
  });
  test("ohne Foto: Typo-Einstieg, kein leeres Bildfeld", () => {
    const d = journalDoc();
    const data = { ...d, sections: d.sections.map(s => (s.type === "hero" ? { ...s, imageUrl: undefined } : s)) };
    const html = render(data);
    expect(html).toContain("jr-entry--type");
    expect(html).not.toContain("Abb. 1");
  });
  test("langer Name: Silbentrennung erlaubt, kein festes nowrap", () => {
    const d = journalDoc();
    const html = render({ ...d, businessName: "Friseursalon Haarmonie & Kosmetikstudio Lindner-Bramhoff" });
    expect(html).toContain("Friseursalon Haarmonie");
    expect(JOURNAL_CSS).toMatch(/\.jr-entry h1\{[^}]*overflow-wrap:anywhere/);
    expect(JOURNAL_CSS).not.toMatch(/\.jr-entry h1\{[^}]*white-space:nowrap/);
  });
  test("genau ein h1", () => {
    expect((render().match(/<h1/g) ?? []).length).toBe(1);
  });
});
```

(Import ergänzen: `import { JOURNAL_CSS } from "./css";`)

- [ ] **Step 2: Run** `npx vitest run client/src/components/site/systems` — Expected: FAIL.
- [ ] **Step 3: Implement** `Entry.tsx`:

```tsx
import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { rich, stripMarks, hasMarks } from "../../richText";
import { streetLine, telHref, todayLine } from "../../artDirection/heroFacts";
import { trustFacts } from "../../artDirection/entrySections";
import { formatHeroRating } from "../../artDirection/ArtDirectedHero";
import { useSystem } from "../SystemContext";

function lastWordItalic(text: string): React.ReactNode {
  const i = text.trimEnd().lastIndexOf(" ");
  if (i < 0) return <em>{text}</em>;
  return <>{text.slice(0, i + 1)}<em>{text.slice(i + 1)}</em></>;
}

export function JournalEntry({ hero }: { hero: SectionOf<"hero"> }) {
  const { data, now } = useSystem();
  const contact = data.sections.find((s): s is SectionOf<"contact"> => s.type === "contact");
  const hidden = data.designProfile?.hiddenElements?.includes("hero-media");
  const photo = !hidden ? hero.imageUrl : undefined;
  const street = streetLine(contact?.street);
  const today = todayLine(contact?.openingHours, now);
  const trust = trustFacts(data).find(f => !f.weak);
  const google = data.google;
  const facts = [
    google && google.reviewCount > 0 && {
      label: "Google",
      value: `${formatHeroRating(google.rating)} / 5 · ${google.reviewCount.toLocaleString("de-DE")} ${google.reviewCount === 1 ? "Stimme" : "Stimmen"}`,
    },
    today && { label: "Heute", value: today },
    contact?.phone && { label: "Termin", value: contact.phone, href: telHref(contact.phone) },
    trust && { label: trust.label, value: trust.value },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  return (
    <section id="start" className={photo ? "jr-entry" : "jr-entry jr-entry--type"} aria-label={stripMarks(hero.headline)}>
      <div className="jr-entry-copy">
        <p className="jr-kicker">{[data.businessCategory, street].filter(Boolean).join(" · ")}</p>
        <h1>{hasMarks(hero.headline) ? rich(hero.headline) : lastWordItalic(hero.headline)}</h1>
        {hero.subheadline && <p className="jr-entry-lede">{rich(hero.subheadline)}</p>}
      </div>
      {photo && (
        <figure className="jr-entry-photo">
          <img src={photo} alt="" loading="eager" fetchPriority="high" width={1200} height={1500} />
          <figcaption><span>{[data.businessName, street].filter(Boolean).join(", ")}</span><span>Abb. 1</span></figcaption>
        </figure>
      )}
      {facts.length > 0 && (
        <dl className="jr-entry-facts">
          {facts.slice(0, 4).map(f => (
            <div key={f.label}><dt>{f.label}</dt><dd>{f.href ? <a href={f.href}>{f.value}</a> : f.value}</dd></div>
          ))}
        </dl>
      )}
    </section>
  );
}
```

> Implementierer: Google-Werte stehen in `data.google = { rating, reviewCount }` (`schema.ts:636`); `formatHeroRating` ist in `ArtDirectedHero.tsx:26` exportiert, `hasMarks`/`stripMarks`/`rich` in `richText.tsx`. Prüfen, dass `todayLine` die `openingHours`-Liste so annimmt (Signatur `heroFacts.ts:105`).

In `sections.tsx`: `case "hero": return <JournalEntry hero={section} />;`

CSS anhängen:

```css
.jr-entry{display:grid;gap:var(--sys-space-l);padding:var(--sys-space-xl) var(--sys-space-gutter) 0;max-width:var(--sys-space-max);margin-inline:auto}
.jr-entry h1{font-size:var(--sys-display-size);line-height:var(--sys-display-line);letter-spacing:var(--sys-display-track);font-weight:var(--sys-display-weight);margin-top:var(--sys-space-m);overflow-wrap:anywhere;hyphens:auto}
.jr-entry h1 em{font-style:italic;color:var(--sys-accent)}
.jr-entry-lede{font-family:var(--sys-font-display);font-size:var(--sys-lede-size);line-height:var(--sys-lede-line);letter-spacing:var(--sys-lede-track);font-weight:300;margin-top:var(--sys-space-l);max-width:var(--sys-space-measure)}
.jr-entry-photo{margin:0}
.jr-entry-photo img{width:100%;aspect-ratio:4/5;object-fit:cover}
.jr-entry-photo figcaption{display:flex;justify-content:space-between;gap:var(--sys-space-m);padding:var(--sys-space-xs) 0;border-bottom:1px solid var(--sys-rule);font-size:var(--sys-small-size);color:var(--sys-muted)}
.jr-entry-facts{display:grid;grid-template-columns:1fr 1fr;margin:0;border-top:1px solid var(--sys-ink)}
.jr-entry-facts>div{padding:var(--sys-space-s) 0;border-bottom:1px solid var(--sys-rule)}
.jr-entry-facts>div:nth-child(odd){padding-right:var(--sys-space-s);border-right:1px solid var(--sys-rule)}
.jr-entry-facts>div:nth-child(even){padding-left:var(--sys-space-s)}
.jr-entry-facts dt{font-size:var(--sys-kicker-size);letter-spacing:var(--sys-kicker-track);text-transform:uppercase;color:var(--sys-muted);margin-bottom:var(--sys-space-2xs)}
.jr-entry-facts dd{margin:0;font-size:var(--sys-small-size)}
@media (min-width:64rem){
  .jr-entry{grid-template-columns:repeat(12,1fr);column-gap:var(--sys-space-l);align-items:end;padding-top:var(--sys-space-2xl)}
  .jr-entry-copy{grid-column:1/8}
  .jr-entry-photo{grid-column:8/13;grid-row:1/3}
  .jr-entry-facts{grid-column:1/8;grid-template-columns:repeat(4,1fr)}
  .jr-entry-facts>div{padding-inline:var(--sys-space-s)!important;border-right:1px solid var(--sys-rule)!important}
  .jr-entry--type .jr-entry-copy,.jr-entry--type .jr-entry-facts{grid-column:1/13}
  .jr-entry--type .jr-entry-lede{columns:2;column-gap:var(--sys-space-l);max-width:none}
}
```

(In `css.ts` als Teil des Template-Strings anhängen.)

- [ ] **Step 4: Run** Tests — Expected: PASS.
- [ ] **Step 5: Sichtprüfung** — `npm run dev`, Dev-Vorschau aus Task 15 ist noch nicht da: vorübergehend mit `npx tsx -e` ein HTML via `renderSiteHtml(withDesignSystem(getFixture("salon-noir","full"),"journal"),{origin:"http://localhost:3000"})` nach `/tmp/journal.html` schreiben und im Browser-Pane bei 375 und 1440 ansehen; Screenshot an den Betreiber erst in Task 19.
- [ ] **Step 6: Commit** — `feat(journal): Einstieg mit Foto- und Typo-Fassung`

### Task 9: Leistungen, Ablauf, Preise, Speisekarte, Team

**Files:**
- Create: `client/src/components/site/systems/journal/Offer.tsx`
- Modify: `journal/sections.tsx`, `journal/css.ts`
- Test: `journal/journal.test.tsx`

**Interfaces:**
- Consumes: `JournalChapter`, `chapterIndex` (Task 7); `useSystem().preview`; Platzhaltertexte aus `blueprint.placeholderText` (wie in `entrySections.tsx` → `Placeholder` gelesen).
- Produces: `JournalServices`, `JournalProcess`, `JournalPricelist`, `JournalMenu`, `JournalTeam` — je `({ section, sections })`.

Gestaltung: Leistungen als Zeilen mit Haarlinie: Titel in `h3` (Fraunces 400), rechts klein `description` in `muted` bzw. `price` nur, wenn vorhanden; ab 64rem zweispaltig (Kapitelkopf links Spalte 1–4 sticky, Liste 5–12). Ablauf als nummerierte Schritte mit kursiver Ziffer. Preise/Speisekarte/Team: live nur mit echtem Inhalt; in der Vorschau ohne Inhalt eine Karte mit gestrichelter Haarlinie, Kicker „Nur in deiner Vorschau“, Text aus dem Bauplan.

- [ ] **Step 1: Failing tests**

```tsx
describe("Journal: Angebot", () => {
  test("Leistungen als nummeriertes Kapitel 01 mit allen Titeln", () => {
    const data = journalDoc();
    const html = render(data);
    const services = data.sections.find(s => s.type === "services")!;
    expect(html).toContain('class="jr-section jr-services"');
    for (const item of (services as any).items) expect(html).toContain(item.title);
    expect(html).toMatch(/jr-chapter-no[^>]*>01</);
  });
  test("keine erfundenen Preise", () => {
    const d = journalDoc();
    const data = { ...d, sections: d.sections.map(s => (s.type === "services" ? { ...s, items: s.items.map(i => ({ title: i.title })) } : s)) };
    expect(render(data)).not.toMatch(/€/);
  });
  test("Preis-Platzhalter nur in der Vorschau", () => {
    const d = journalDoc();
    const data = { ...d, sectionOrder: [...(d.sectionOrder ?? d.sections.map(s => s.type)), "pricelist" as const] };
    expect(render(data, true)).toContain("Nur in deiner Vorschau");
    expect(render(data, false)).not.toContain("Nur in deiner Vorschau");
  });
});
```

> Implementierer: Wie die Vorschau einen fehlenden Preis-/Team-Abschnitt anfordert (Bauplan `placeholders`, nicht `sectionOrder`), in `entrySections.tsx` nachsehen und den Test darauf anpassen; das zu prüfende Verhalten bleibt: Platzhalter in Vorschau ja, live nein.

- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** `Offer.tsx`:

```tsx
import React from "react";
import type { SectionOf, SectionV2 } from "../../../../../../shared/siteContract/types";
import { rich } from "../../richText";
import { useSystem } from "../SystemContext";
import { JournalChapter, chapterIndex } from "./sections";

type P<T extends SectionV2["type"]> = { section: SectionOf<T>; sections: readonly SectionV2[] };

export function JournalServices({ section, sections }: P<"services">) {
  return (
    <section id="leistungen" className="jr-section jr-services" aria-labelledby="leistungen-titel">
      <div className="jr-wrap jr-split">
        <JournalChapter id="leistungen" index={chapterIndex(sections, "services")} title={section.headline} intro={section.intro} />
        <ul className="jr-rows">
          {section.items.map(item => (
            <li key={item.title}>
              <h3>{rich(item.title)}</h3>
              {(item.price || item.description) && <p>{item.price ?? rich(item.description!)}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function JournalProcess({ section, sections }: P<"process">) {
  return (
    <section id="ablauf" className="jr-section jr-process" aria-labelledby="ablauf-titel">
      <div className="jr-wrap">
        <JournalChapter id="ablauf" index={chapterIndex(sections, "process")} title={section.headline ?? "So läuft's ab"} />
        <ol className="jr-steps">
          {section.steps.map((step, i) => (
            <li key={step.title}><span aria-hidden="true">{i + 1}</span><h3>{rich(step.title)}</h3>{step.text && <p>{rich(step.text)}</p>}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function JournalPreviewSlot({ id, title, text }: { id: string; title: string; text: string }) {
  const { preview } = useSystem();
  if (!preview) return null;
  return (
    <section id={id} className="jr-section">
      <aside className="jr-wrap"><div className="jr-slot"><p className="jr-kicker">Nur in deiner Vorschau</p><h3>{title}</h3><p>{text}</p></div></aside>
    </section>
  );
}
```

> Implementierer: Feldnamen von `process` (`steps`, `title`, `text`), `pricelist`, `menu`, `team` aus `schema.ts:338-470` übernehmen. `JournalPricelist`/`JournalMenu`/`JournalTeam` nach demselben Muster wie `JournalServices` (Zeilen mit Haarlinie; Team als Porträt 4:5 mit Name in `h3` und Rolle als Kicker); ohne echten Inhalt `JournalPreviewSlot` mit dem Bauplan-Text.

`sections.tsx`: `case "services"`, `"process"`, `"pricelist"`, `"menu"`, `"team"` auf die Komponenten legen.

CSS anhängen:

```css
.jr-split{display:grid;gap:var(--sys-space-l)}
.jr-rows{list-style:none;margin:0;padding:0;border-top:1px solid var(--sys-ink)}
.jr-rows li{display:flex;justify-content:space-between;align-items:baseline;gap:var(--sys-space-m);padding:var(--sys-space-m) 0;border-bottom:1px solid var(--sys-rule)}
.jr-rows h3{font-size:var(--sys-h3-size);line-height:var(--sys-h3-line);letter-spacing:var(--sys-h3-track);font-weight:var(--sys-h3-weight)}
.jr-rows p{font-size:var(--sys-small-size);color:var(--sys-muted);text-align:right;max-width:22ch}
.jr-steps{list-style:none;margin:0;padding:0;display:grid;gap:var(--sys-space-l)}
.jr-steps li{display:grid;grid-template-columns:auto 1fr;column-gap:var(--sys-space-m)}
.jr-steps span{font-family:var(--sys-font-display);font-style:italic;font-weight:300;font-size:var(--sys-h2-size);line-height:1;color:var(--sys-accent);grid-row:span 2}
.jr-steps h3{font-size:var(--sys-h3-size);font-weight:400}
.jr-steps p{color:var(--sys-muted);margin-top:var(--sys-space-2xs);max-width:var(--sys-space-measure)}
.jr-slot{border:1px dashed var(--sys-rule);padding:var(--sys-space-l);display:grid;gap:var(--sys-space-xs)}
.jr-slot h3{font-size:var(--sys-h3-size);font-weight:400}
@media (min-width:64rem){
  .jr-split{grid-template-columns:repeat(12,1fr);column-gap:var(--sys-space-l);align-items:start}
  .jr-split>.jr-chapter{grid-column:1/5;position:sticky;top:calc(var(--sys-space-2xl) + var(--sys-space-m));grid-template-columns:auto 1fr}
  .jr-split>.jr-chapter .jr-chapter-intro{grid-column:1/3}
  .jr-split>:not(.jr-chapter){grid-column:5/13}
  .jr-steps{grid-template-columns:repeat(4,1fr)}
}
```

- [ ] **Step 4: Run** — PASS (inkl. `getFixture("salon-noir","minimal")`-Render ohne Fehler: Test ergänzen `expect(() => render(journalDoc("minimal"))).not.toThrow()`).
- [ ] **Step 5: Commit** — `feat(journal): Leistungen, Ablauf, Preise, Speisekarte, Team`

### Task 10: Über uns, Galerie, Stimmen

**Files:**
- Create: `client/src/components/site/systems/journal/Story.tsx`
- Modify: `journal/sections.tsx`, `journal/css.ts`
- Test: `journal/journal.test.tsx`

**Interfaces:**
- Consumes: `JournalChapter`, `chapterIndex`; `pickReviewQuote` (`heroFacts.ts:179`); Galerie-Daten nach `flattenGalleryAlbums` (bereits in `SiteRenderer` angewandt).
- Produces: `JournalAbout`, `JournalGallery`, `JournalReviews`.

Gestaltung: Über uns — Bildpaar (1,3 : 1, zweites Bild niedriger, unten bündig) + Fließtext zweispaltig ab 48rem; nur ein Foto → einzelnes Bild 3:2; kein Foto → Einleitungssatz groß in `lede`, Rest Fließtext. Galerie — Magazinstrecke: erstes Bild breit 3:2, dann Paare, jedes mit Bildunterschrift (`caption` falls vorhanden, sonst nur „Abb. n“), Abb.-Nummern fortlaufend ab 2 (Abb. 1 = Einstieg). Stimmen — eine große kursive Stimme (`pickReviewQuote`) in `h2`-Größe, darunter bis zu zwei weitere klein zweispaltig; Quelle als Kicker „Google · ★★★★★“; ohne Bewertungen entfällt der Abschnitt komplett.

- [ ] **Step 1: Failing tests**

```tsx
describe("Journal: Geschichte", () => {
  test("Über uns mit Bildpaar und Fließtext", () => {
    const html = render();
    expect(html).toContain('class="jr-section jr-about"');
  });
  test("Galerie nummeriert Abbildungen ab 2", () => {
    const html = render();
    expect(html).toContain("Abb. 2");
  });
  test("ohne Bewertungen kein Stimmen-Abschnitt und lückenlose Kapitel", () => {
    const d = journalDoc();
    const data = { ...d, sections: d.sections.filter(s => s.type !== "testimonials") };
    const html = render(data);
    expect(html).not.toContain("jr-reviews");
    const nos = [...html.matchAll(/jr-chapter-no[^>]*>(\d\d)</g)].map(m => Number(m[1]));
    expect(nos).toEqual(nos.map((_, i) => i + 1));
  });
  test("große Stimme kursiv mit Quelle", () => {
    const html = render();
    expect(html).toMatch(/<blockquote class="jr-quote"/);
  });
});
```

- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** `Story.tsx` nach den Gestaltungsregeln oben (gleiches Muster wie `Offer.tsx`: `section.jr-section.jr-<name>` mit `id` laut `SECTION_ANCHORS`, `JournalChapter`, Bilder mit `loading="lazy"`, `width`/`height` gesetzt, `alt` aus den Daten). Kern der Stimmen:

```tsx
export function JournalReviews({ section, sections }: P<"testimonials">) {
  const quote = pickReviewQuote(section.items);
  if (!quote) return null;
  const rest = section.items.filter(i => i.text !== quote.text).slice(0, 2);
  return (
    <section id="stimmen" className="jr-section jr-reviews" aria-labelledby="stimmen-titel">
      <div className="jr-wrap">
        <JournalChapter id="stimmen" index={chapterIndex(sections, "testimonials")} title={section.headline ?? "Stimmen"} />
        <blockquote className="jr-quote"><p>„{quote.text}“</p><footer className="jr-kicker">{quote.author} · Google · ★★★★★</footer></blockquote>
        {rest.length > 0 && (
          <ul className="jr-quote-more">
            {rest.map(r => <li key={r.text}><p>„{r.text}“</p><span className="jr-kicker">{r.author}</span></li>)}
          </ul>
        )}
      </div>
    </section>
  );
}
```

> Implementierer: `SECTION_ANCHORS` (Anker-IDs der Navigation) aus `client/src/components/site/engine.ts` importieren und statt der festen `id`-Strings verwenden — gilt rückwirkend auch für Task 9 (`leistungen`, `ablauf`); sonst springt die Navigation ins Leere. Sterne nur zeigen, wenn die Bewertung 5 ist; Feld für die Einzelnote wie in `entrySections.tsx` → `EntryReviews` lesen.

CSS anhängen:

```css
.jr-about-pair{display:grid;grid-template-columns:1.3fr 1fr;gap:var(--sys-space-s);align-items:end}
.jr-about-pair img:first-child{aspect-ratio:4/5;object-fit:cover;width:100%}
.jr-about-pair img:last-child{aspect-ratio:1/1;object-fit:cover;width:100%}
.jr-about-body{margin-top:var(--sys-space-l);max-width:var(--sys-space-measure)}
.jr-about-lede{font-family:var(--sys-font-display);font-size:var(--sys-lede-size);line-height:var(--sys-lede-line);font-weight:300;margin-bottom:var(--sys-space-m)}
.jr-gallery{display:grid;gap:var(--sys-space-l)}
.jr-gallery figure{margin:0}
.jr-gallery img{width:100%;aspect-ratio:3/2;object-fit:cover}
.jr-gallery figcaption{display:flex;justify-content:space-between;gap:var(--sys-space-m);padding-top:var(--sys-space-xs);font-size:var(--sys-small-size);color:var(--sys-muted)}
.jr-quote{margin:0;max-width:24ch}
.jr-quote p{font-family:var(--sys-font-display);font-style:italic;font-weight:300;font-size:var(--sys-h2-size);line-height:1.12;letter-spacing:var(--sys-h2-track)}
.jr-quote footer{margin-top:var(--sys-space-m)}
.jr-quote-more{list-style:none;margin:var(--sys-space-xl) 0 0;padding:0;display:grid;gap:var(--sys-space-l);border-top:1px solid var(--sys-rule);padding-top:var(--sys-space-l)}
.jr-quote-more p{font-family:var(--sys-font-display);font-size:var(--sys-h3-size);line-height:1.3;font-weight:300}
@media (min-width:48rem){
  .jr-about-body{columns:2;column-gap:var(--sys-space-l);max-width:none}
  .jr-gallery{grid-template-columns:1fr 1fr}
  .jr-gallery figure:first-child{grid-column:1/3}
  .jr-quote-more{grid-template-columns:1fr 1fr}
}
@media (min-width:64rem){.jr-quote{margin-left:calc(100% / 12 * 2)}}
```

- [ ] **Step 4: Run** — PASS; `render(journalDoc("minimal"))` wirft nicht.
- [ ] **Step 5: Commit** — `feat(journal): Über uns, Galerie, Stimmen`

### Task 11: Gut zu wissen, Kontakt, Handy-Dock

**Files:**
- Create: `client/src/components/site/systems/journal/Visit.tsx`
- Modify: `journal/sections.tsx`, `journal/css.ts`, `journal/index.tsx` (Dock)
- Test: `journal/journal.test.tsx`

**Interfaces:**
- Consumes: `JournalChapter`, `chapterIndex`; `shortHours`, `isPlaceholderHours`, `telHref`, `whatsappHref`; Kontakt-Insel: bestehendes Formular-Markup `data-island="contact"` (wie in den Packs eingebunden — in `packs/werkbank/index.tsx` Kontaktabschnitt nachsehen und dieselbe Insel-Komponente verwenden).
- Produces: `JournalFaq`, `JournalContact`, `JournalDock`.

Gestaltung: Gut zu wissen — `<details>`-Liste mit Haarlinien, Frage in `h3`-Größe, Plus-Zeichen rechts dreht sich auf 45° (CSS `transform`, 200 ms), ab 64rem Kapitelkopf links sticky wie Leistungen. Kontakt — Kapitel ohne Nummer („Besuch“), Adresse in `h2`-Größe Fraunces, darunter 2-spaltiges Faktenraster (Zeiten je Tag als Liste, Telefon, E-Mail, WhatsApp), Route-Link „Route planen →“ (Google-Maps-Suche mit Adresse), Kontaktformular-Insel falls Feature aktiv; Platzhalter-Öffnungszeiten (`isPlaceholderHours`) werden nicht gezeigt. Dock — nur Handy (< 48rem), fest unten, zwei Aktionen (Anrufen/WhatsApp + Route), Fläche `--sys-deep`, erscheint erst nach dem Einstieg (CSS `animation` per IntersectionObserver aus Task 13; ohne JS sichtbar).

- [ ] **Step 1: Failing tests**

```tsx
describe("Journal: Besuch", () => {
  test("FAQ als details, Kontakt mit Adresse und Route", () => {
    const html = render();
    expect(html).toContain('<details class="jr-faq-item"');
    expect(html).toContain('class="jr-section jr-contact"');
    expect(html).toContain("google.com/maps/search/?api=1&amp;query=");
  });
  test("Platzhalter-Öffnungszeiten werden nicht gezeigt", () => {
    const d = journalDoc();
    const data = { ...d, sections: d.sections.map(s => (s.type === "contact" ? { ...s, openingHours: [{ day: "Mo–Fr", hours: "09:00–18:00 Uhr" }] } : s)), blueprintFamily: "stay" as const };
    expect(render(data)).not.toContain("Mo–Fr 9–18 Uhr");
  });
  test("Dock mit Anruf-Link", () => {
    expect(render()).toMatch(/class="jr-dock"[\s\S]*href="tel:/);
  });
});
```

> Implementierer: Ob `isPlaceholderHours` an der Familie hängt (Unterkunft/Sofort-Dienst) oder generell gilt, in `entrySections.tsx` (`EntryVisit`) nachlesen und identisch übernehmen; den Test entsprechend anpassen.

- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** nach den Regeln oben. Route-Link:

```tsx
// `mapsHref` und `addressLine` aus ./Chrome importieren (Task 7).
```

CSS anhängen:

```css
.jr-faq{border-top:1px solid var(--sys-ink)}
.jr-faq-item{border-bottom:1px solid var(--sys-rule)}
.jr-faq-item summary{display:flex;justify-content:space-between;gap:var(--sys-space-m);padding:var(--sys-space-m) 0;cursor:pointer;list-style:none;font-family:var(--sys-font-display);font-size:var(--sys-h3-size);line-height:var(--sys-h3-line);font-weight:400}
.jr-faq-item summary::-webkit-details-marker{display:none}
.jr-faq-item summary::after{content:"+";font-family:var(--sys-font-text);font-weight:300;transition:transform .2s ease}
.jr-faq-item[open] summary::after{transform:rotate(45deg)}
.jr-faq-item summary:focus-visible{outline:2px solid var(--sys-accent);outline-offset:4px}
.jr-faq-item p{padding-bottom:var(--sys-space-m);max-width:var(--sys-space-measure);color:var(--sys-muted)}
.jr-contact-address{font-family:var(--sys-font-display);font-size:var(--sys-h2-size);line-height:var(--sys-h2-line);letter-spacing:var(--sys-h2-track);font-weight:300;max-width:16ch}
.jr-contact-facts{display:grid;gap:var(--sys-space-l);margin-top:var(--sys-space-xl);border-top:1px solid var(--sys-ink);padding-top:var(--sys-space-m)}
.jr-contact-facts dt{font-size:var(--sys-kicker-size);letter-spacing:var(--sys-kicker-track);text-transform:uppercase;color:var(--sys-muted);margin-bottom:var(--sys-space-xs)}
.jr-contact-facts dd{margin:0}
.jr-link{display:inline-block;margin-top:var(--sys-space-l);text-decoration:underline;text-underline-offset:.25em;text-decoration-thickness:1px}
.jr-dock{position:fixed;inset:auto var(--sys-space-s) var(--sys-space-s);z-index:30;display:grid;grid-template-columns:1fr 1fr;gap:1px;border-radius:999px;overflow:hidden;background:var(--sys-deep);color:var(--sys-on-deep);box-shadow:0 12px 30px -12px rgba(0,0,0,.45)}
.jr-dock a{padding:var(--sys-space-s);text-align:center;font-size:var(--sys-small-size);font-weight:500;text-decoration:none}
.jr-dock a+a{border-left:1px solid color-mix(in srgb,var(--sys-on-deep) 25%,transparent)}
@media (min-width:48rem){.jr-dock{display:none}.jr-contact-facts{grid-template-columns:repeat(3,1fr)}}
.pb-journal{padding-bottom:calc(var(--sys-space-2xl) + var(--sys-space-s))}
@media (min-width:48rem){.pb-journal{padding-bottom:0}}
```

- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** — `feat(journal): Gut zu wissen, Kontakt, Handy-Dock`

### Task 12: Unterseiten, Rechtsseiten, übrige Abschnittstypen

**Files:**
- Modify: `journal/sections.tsx`, `journal/index.tsx`, `journal/css.ts`
- Modify (falls nötig): `server/ssr/renderSite.tsx` (`renderLegalPage`)
- Test: `journal/journal.test.tsx`, `server/ssr/renderSiteRev3.test.ts`

**Interfaces:**
- Consumes: `pageTitle`-Prop von `Page`; Abschnittstypen `pageHeader`, `cta`, `story`, `stats`, `usp`, `quote`, `partners` (`schema.ts`).
- Produces: Journal rendert **jeden** `SectionV2`-Typ (kein `default: return null` mehr außer `notice`, das zentral gerendert wird).

Gestaltung: `pageHeader` → Kicker „{Betriebsname}“ + `display`-Titel ohne Foto (Typo-Einstieg); `cta` → dunkles Band `--sys-deep` mit `h2` und Pille; `story`/`usp`/`stats`/`quote`/`partners` → als Kapitel mit Haarlinien (Zahlen bei `stats` in `display`-Größe kursiv). Rechtsseiten: gleicher Kopf/Fuß, Fließtext im Textmaß `--sys-space-measure`, Überschriften `h2`/`h3` aus der Skala.

- [ ] **Step 1: Failing tests**

```tsx
import { SECTION_TYPES } from "../../../../../../shared/siteContract/schema"; // Name des Enums dort nachsehen
test("jeder Abschnittstyp außer notice erzeugt Markup", () => {
  // Fixture "features" enthält die meisten Zusatzabschnitte; fehlende Typen
  // mit minimalen gültigen Daten aus schema.ts ergänzen.
  const html = render(journalDoc("features"));
  for (const t of ["cta", "stats", "usp", "story"]) expect(html).toContain(`jr-${t}`);
});
```

```ts
test("Impressum einer Journal-Seite nutzt Journal-Schrift und -Fuß", () => {
  const doc = withDesignSystem(getFixture("salon-noir", "full"), "journal");
  const { html } = renderSiteHtml(doc, { origin: "https://x.pageblitz.de", pathname: "/impressum" });
  expect(html).toContain('data-pb-system="journal"');
  expect(html).toContain('class="jr-foot"');
  expect(html).not.toContain("fonts.googleapis.com");
});
test("Unterseite einer Journal-Seite hat Typo-Kopf", () => {
  const base = getFixture("salon-noir", "full");
  // Unterseiten-Add-on aktivieren und eine Seite anlegen — Struktur aus engine.test.ts ("visiblePages") übernehmen
});
```

> Implementierer: Den zweiten Test mit der Unterseiten-Struktur aus `client/src/components/site/engine.test.ts:274` vervollständigen (Seite mit `slug: "leistungen"`, `pathname: "/leistungen"`), Erwartung: `jr-page-head` im HTML und genau ein `<h1`.

- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** die fehlenden `case`s und `JournalPageHead`; in `index.tsx` bei gesetztem `pageTitle` statt Einstieg `JournalPageHead` rendern. Prüfen, ob `renderLegalPage` über `SiteRenderer` läuft; wenn nicht, dort den rev-3-Zweig ergänzen (Kopf über `systemFontHead`, Inhalt in `.pb-journal`-Hülle mit `systemCssVars`).
- [ ] **Step 4: Run** `npx vitest run client/src/components/site server/ssr` — PASS.
- [ ] **Step 5: Commit** — `feat(journal): Unterseiten, Rechtsseiten, alle Abschnittstypen`

### Task 13: Bewegung

**Files:**
- Create: `client/src/components/site/systems/journal/motion.ts`
- Modify: `client/src/components/site/SiteRenderer.tsx` (Effekt für rev 3), `journal/css.ts`
- Test: `journal/journal.test.tsx`

**Interfaces:**
- Produces: `mountJournalMotion(root: HTMLElement): () => void` — setzt `data-jr-in` auf Abschnitte beim ersten Sichtbarwerden (IntersectionObserver, `threshold: 0.15`, einmalig) und `data-jr-ready` auf den Root nach dem ersten Frame.

Skill `motion-design` laden. Regeln: Einstieg — H1 und Lede blenden 600 ms von `translateY(12px)` + `opacity:0` ein (`cubic-bezier(0.16,1,0.3,1)`), Foto 800 ms `clip-path: inset(0 0 100% 0)` → `inset(0)`; Abschnitte 400 ms `opacity`/`translateY(16px)`. Nur `transform`, `opacity`, `clip-path`. Ohne JS und bei `prefers-reduced-motion: reduce` ist alles sofort sichtbar (Startzustand nur unter `.pb-journal[data-jr-ready]`).

- [ ] **Step 1: Failing test**

```tsx
test("Bewegung nur mit data-jr-ready und ohne reduzierte Bewegung", () => {
  expect(JOURNAL_CSS).toMatch(/@media \(prefers-reduced-motion: no-preference\)\{[^]*\[data-jr-ready\]/);
  expect(JOURNAL_CSS).not.toMatch(/transition:[^;]*(width|height|top|left|margin|padding)/);
});
```

- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement**

```ts
// journal/motion.ts
export function mountJournalMotion(root: HTMLElement): () => void {
  const sections = Array.from(root.querySelectorAll<HTMLElement>(".jr-section"));
  const io = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) { e.target.setAttribute("data-jr-in", ""); io.unobserve(e.target); } }),
    { threshold: 0.15 }
  );
  sections.forEach(s => io.observe(s));
  const raf = requestAnimationFrame(() => root.setAttribute("data-jr-ready", ""));
  return () => { io.disconnect(); cancelAnimationFrame(raf); };
}
```

In `SiteRenderer.tsx` neben dem rev-2-`useEffect`: bei `effectiveData.system === "journal"` dynamisch `import("./systems/journal/motion")` und `mountJournalMotion(root)` (gleiches Muster mit `cancelled`/`cleanup`).

> Wichtig: Der SSR-Pfad hydriert die Seite nicht als Ganzes — Bewegung auf Live-Seiten läuft über das Motion-Bundle (`getMotionBundlePath`, `server/ssr/islandsBundle.ts:53`). Dort (Einstieg des Motion-Bundles, Datei über `scripts/build-islands.mjs` finden) ergänzen: `document.querySelector('.pb-journal')` → `mountJournalMotion`. Mit `npm run build:islands` bauen und im Browser-Pane prüfen.

CSS anhängen:

```css
@media (prefers-reduced-motion: no-preference){
  .pb-journal[data-jr-ready] .jr-entry h1,.pb-journal[data-jr-ready] .jr-entry-lede{animation:jr-rise .6s cubic-bezier(.16,1,.3,1) both}
  .pb-journal[data-jr-ready] .jr-entry-lede{animation-delay:.12s}
  .pb-journal[data-jr-ready] .jr-entry-photo img{animation:jr-reveal .8s cubic-bezier(.16,1,.3,1) both .1s}
  .pb-journal[data-jr-ready] .jr-section:not([data-jr-in]){opacity:0;transform:translateY(16px)}
  .pb-journal[data-jr-ready] .jr-section{transition:opacity .4s ease,transform .4s cubic-bezier(.16,1,.3,1)}
  @keyframes jr-rise{from{opacity:0;transform:translateY(12px)}}
  @keyframes jr-reveal{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0)}}
}
```

- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** — `feat(journal): Bewegung für Einstieg und Abschnitte`

---

## Phase D — Anbindung

### Task 14: Generierung erzeugt Journal-Seiten (wenn freigeschaltet)

**Files:**
- Modify: `server/generationV2/runJob.ts:192-235,520-615`
- Test: `server/generationV2/runJobSystems.test.ts`

**Interfaces:**
- Consumes: `systemsForDoc` (Task 5), `isReleased` (Task 4), `withDesignSystem` (Task 6).
- Produces: `withPrimarySystem(doc: WebsiteDataV2): WebsiteDataV2` (exportiert aus `runJob.ts` oder neu in `shared/designSystems/apply.ts` — **in `apply.ts`**, damit Showcase und Studio sie teilen): liefert `withDesignSystem(doc, primary)`, wenn `isReleased(primary)`, sonst `doc` unverändert.

- [ ] **Step 1: Failing test**

```ts
// server/generationV2/runJobSystems.test.ts
import { describe, expect, test, vi } from "vitest";
import { getFixture } from "../../shared/siteContract/fixtures";
import { withArtDirection } from "../../shared/stylePacks/artDirection";

describe("withPrimarySystem", () => {
  test("ohne Freischaltung bleibt rev 2", async () => {
    const { withPrimarySystem } = await import("../../shared/designSystems/apply");
    const doc = withArtDirection({ ...getFixture("salon-noir", "full"), blueprintFamily: "beauty", businessCategory: "Friseursalon", businessName: "Salon Lindner" });
    expect(withPrimarySystem(doc).designRevision).toBe(2);
  });
  test("mit Freischaltung: Friseur → Journal, Handwerk bleibt rev 2", async () => {
    vi.resetModules();
    vi.doMock("../../shared/designSystems/registry", async orig => ({ ...(await orig<object>()), RELEASED_SYSTEMS: ["journal"], isReleased: (id: string) => id === "journal" }));
    const { withPrimarySystem } = await import("../../shared/designSystems/apply");
    const friseur = withArtDirection({ ...getFixture("salon-noir", "full"), blueprintFamily: "beauty", businessCategory: "Friseursalon", businessName: "Salon Lindner" });
    const tischler = withArtDirection({ ...getFixture("werkbank", "full"), blueprintFamily: "trade", businessCategory: "Tischlerei", businessName: "Tischlerei Klähn" });
    expect(withPrimarySystem(friseur).system).toBe("journal");
    expect(withPrimarySystem(tischler).designRevision).toBe(2);
    vi.doUnmock("../../shared/designSystems/registry");
  });
});
```

- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** in `apply.ts`:

```ts
import { systemsForDoc } from "./assignment";
import { isReleased } from "./registry";

export function withPrimarySystem(doc: WebsiteDataV2): WebsiteDataV2 {
  const [primary] = systemsForDoc(doc);
  return isReleased(primary) ? withDesignSystem(doc, primary) : doc;
}
```

In `runJob.ts`: am Ende von `withNewSiteDesign` (Zeile ~200) und am finalen Dokument von `runWebsiteGenerationV2` (Zeile ~610, **nach** `withFamily`/Bauplan, damit `blueprintFamily` gesetzt ist) `withPrimarySystem(…)` anwenden. `buildInterimV2Doc` bleibt rev 2 (Zwischenstand während der Erzeugung).

- [ ] **Step 4: Run** `npx vitest run server/generationV2` — PASS.
- [ ] **Step 5: Commit** — `feat(generierung): neue Seiten bekommen freigeschaltetes Hauptsystem`

### Task 15: Vorschau-Routen, Dev-Vorschau, Design-Übersicht

**Files:**
- Modify: `server/ssr/routes.ts:173-240` (`handlePreviewSsr`), `:331-400` (`handleDevPreview`), `:~484` + `:790` (neue Demo-Route)
- Modify: `shared/stylePacks/blueprintShowcase.ts` (`systemShowcaseDoc`), `client/src/pages/DesignReviewPage.tsx`
- Test: `server/ssr/routes.test.ts` (erweitern)

**Interfaces:**
- Consumes: `withDesignSystem`, `getSystem`, `DESIGN_SYSTEM_IDS`, `findShowcase`, `showcaseDoc`.
- Produces:
  - `/preview-ssr/<token>?system=journal&palette=salbei` → rendert das Dokument mit `withDesignSystem` (unbekanntes/nicht gebautes System → 400 ohne Parameter im Body)
  - `/dev/site-preview?system=journal&palette=ton&fixture=full|minimal|features` (nur Dev)
  - `/demo/system/:system([a-z]+)/:id([a-z0-9-]+)?palette=` → Showcase-Betrieb im System, `islandsMode: "preview"` außer `?live=1`
  - `systemShowcaseDoc(showcase: Showcase, system: DesignSystemId, palette?: string): WebsiteDataV2`
  - `/design-review`: neuer Abschnitt „Systeme“ oben: je gebautem System alle Showcases der Familien, deren Hauptsystem es ist, × 3 Paletten, Handy/Desktop-Umschalter (bestehende iframe-Karte wiederverwenden)

- [ ] **Step 1: Failing tests** (in `routes.test.ts`, gleiche Testserver-Hilfe wie die vorhandenen Tests nutzen):

```ts
test("Dev-Vorschau rendert Journal", async () => {
  const res = await get("/dev/site-preview?system=journal&palette=ton&fixture=full");
  expect(res.status).toBe(200);
  expect(res.text).toContain('data-pb-system="journal"');
  expect(res.text).toContain('data-pb-palette="ton"');
});
test("Dev-Vorschau lehnt unbekanntes System ab, ohne es zu spiegeln", async () => {
  const res = await get("/dev/site-preview?system=%3Cscript%3E&fixture=full");
  expect(res.status).toBe(400);
  expect(res.text).not.toContain("<script>");
});
test("Demo-Route Journal × Friseur", async () => {
  const res = await get("/demo/system/journal/friseur");
  expect(res.status).toBe(200);
  expect(res.text).toContain("jr-entry");
});
test("Demo-Route: nicht gebautes System → 404", async () => {
  expect((await get("/demo/system/nacht/friseur")).status).toBe(404);
});
```

(Showcase-ID `friseur` in `blueprintShowcaseList.ts` nachsehen; falls anders benannt, die vorhandene Friseur-ID verwenden.)

- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** — in `handleDevPreview` vor der Pack-Prüfung:

```ts
  const systemParam = typeof req.query.system === "string" ? req.query.system : "";
  if (systemParam) {
    if (!(DESIGN_SYSTEM_IDS as readonly string[]).includes(systemParam) || !getSystem(systemParam as DesignSystemId)) {
      res.status(400).type("text/plain").send("Unbekanntes System");
      return;
    }
    const palette = typeof req.query.palette === "string" ? req.query.palette : undefined;
    const data = withDesignSystem(getFixture("salon-noir", fixtureParam), systemParam as DesignSystemId, palette);
    // weiter wie der bestehende Render-Pfad dieser Funktion (renderSiteHtml + send)
  }
```

Gleiches Muster für `handlePreviewSsr` (`system`-Param neben `pack`; `system` hat Vorrang, `variant`/`font` werden bei `system` ignoriert) und eine neue `handleSystemDemoRoute` nach dem Vorbild von `handleBauplanDemoRoute` mit `systemShowcaseDoc`:

```ts
// shared/stylePacks/blueprintShowcase.ts
export function systemShowcaseDoc(showcase: Showcase, system: DesignSystemId, palette?: string): WebsiteDataV2 {
  return withDesignSystem(showcaseDoc(showcase, "stage"), system, palette);
}
```

`DesignReviewPage.tsx`: Abschnitt „Systeme“ mit `systemSrc(system, id, palette, live)` → `/demo/system/${system}/${id}?palette=${palette}${live ? "&live=1" : ""}`; Showcases filtern mit `systemsFor(...)[0] === system` (Familie aus `showcase.businessCategory` über `systemsForDoc`).

- [ ] **Step 4: Run** `npx vitest run server/ssr` — PASS (einzeln laufen lassen, falls `routes.test.ts` unter Volllast flaky ist — bekannt, siehe Memory).
- [ ] **Step 5: Commit** — `feat(vorschau): System-Vorschau, Demo-Route, Design-Übersicht`

### Task 16: Studio — Systeme und Paletten wählen

**Files:**
- Modify: `server/onboardingV2/router.ts:167-240`
- Modify: `client/src/pages/onboarding-v2/PreviewFrame.tsx:117`, `DesignSplash.tsx`, `panels/StylePanel.tsx`
- Test: `server/onboardingV2/router.test.ts` (erweitern), `tests/visual/studio.spec.ts` (erweitern)

**Interfaces:**
- Consumes: `systemsForDoc`, `isReleased`, `getSystem`, `withDesignSystem`.
- Produces:
  - `getStyleCandidates` liefert zusätzlich `kind: "pack" | "system"` je Kandidat; Systemkandidaten: `{ kind: "system", id: DesignSystemId, name, essence, palettes: {id,name,accent,paper}[] }`. Reihenfolge: freigeschaltete Systeme aus dem Tripel zuerst (aktuelles System der Seite ausgenommen), Rest mit Pack-Kandidaten wie bisher aufgefüllt bis `count`.
  - neue Prozedur `selectDesignSystem({ token, system: z.enum(DESIGN_SYSTEM_IDS), palette: z.string().regex(/^[a-z]+$/).max(20).optional(), confirm: z.boolean().default(false) })` → `withDesignSystem` + `persistDoc`; nicht freigeschaltetes System → `TRPCError("BAD_REQUEST")`.
  - `buildPreviewSrc({ …, system?, palette? })` hängt `system`/`palette` an (Vorrang vor `pack`).

- [ ] **Step 1: Failing tests**

```ts
test("Kandidaten enthalten freigeschaltetes Hauptsystem", async () => {
  // RELEASED_SYSTEMS wie in Task 14 per vi.doMock auf ["journal"] setzen
  const { candidates } = await caller.getStyleCandidates({ token: friseurToken, count: 3 });
  expect(candidates.some(c => c.kind === "system" && c.id === "journal")).toBe(true);
  expect(candidates).toHaveLength(3);
});
test("selectDesignSystem setzt rev 3", async () => {
  await caller.selectDesignSystem({ token: friseurToken, system: "journal", palette: "ton" });
  const doc = await loadDoc(friseurToken);
  expect(doc.designRevision).toBe(3);
  expect(doc.palette).toBe("ton");
});
test("selectDesignSystem lehnt nicht freigeschaltetes System ab", async () => {
  await expect(caller.selectDesignSystem({ token: friseurToken, system: "nacht" })).rejects.toThrow();
});
```

(Test-Helfer `caller`, `friseurToken`, `loadDoc` aus den bestehenden Router-Tests übernehmen; falls es dort keine gibt, das Muster aus dem nächstliegenden `*.test.ts` in `server/onboardingV2/` verwenden.)

- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** Server (Prozeduren wie oben) und Client:
  - `DesignSplash.tsx`: Kandidaten mit `kind === "system"` als Karte mit iframe `buildPreviewSrc({ token, version, system: c.id, palette: c.palettes[0].id })`, darunter drei runde Farbfelder (paper-Hintergrund, accent-Punkt) als Radio-Gruppe (`role="radiogroup"`, Pfeiltasten) — Wechsel lädt iframe mit neuer Palette; `pick()` ruft `selectDesignSystem`.
  - `StylePanel.tsx`: gleiche Logik; bei rev-3-Seite oben die drei Paletten des aktuellen Systems, darunter die Alternativen. Schriftwahl-Bereich bei rev 3 ausblenden.
  - Pack-Kandidaten unverändert (Task 6 sorgt dafür, dass sie eine rev-3-Seite sauber auf rev 2 setzen).
- [ ] **Step 4: Run** `npx vitest run server/onboardingV2` und `npm run test:visual -- studio.spec.ts` — PASS (Screenshots des Studios bewusst aktualisieren, wenn sich nur die Karten geändert haben: `--update-snapshots`, Diff vorher ansehen).
- [ ] **Step 5: Commit** — `feat(studio): Designsysteme und Farbstimmungen wählen`

---

## Phase E — Prüfung und Abnahme

### Task 17: Visuelle Tests, Barrierefreiheit, Ladezeit

**Files:**
- Create: `tests/visual/systems.spec.ts`
- Test-Snapshots: `tests/visual/systems.spec.ts-snapshots/`

**Interfaces:**
- Consumes: `/dev/site-preview?system=&palette=&fixture=` (Task 15).

- [ ] **Step 1: Spec schreiben**

```ts
// tests/visual/systems.spec.ts
import { test, expect } from "@playwright/test";

const PALETTES = ["papier", "salbei", "ton"];
const WIDTHS = [320, 375, 768, 1024, 1440];

for (const palette of PALETTES) {
  for (const fixture of ["full", "minimal"]) {
    for (const width of WIDTHS) {
      test(`journal ${palette} ${fixture} ${width}`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/dev/site-preview?system=journal&palette=${palette}&fixture=${fixture}`);
        await page.evaluate(() => document.fonts.ready);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(0);
        await expect(page).toHaveScreenshot(`journal-${palette}-${fixture}-${width}.png`, { fullPage: true, maxDiffPixelRatio: 0.003 });
      });
    }
  }
}

test("Schriften werden geladen (keine Fallback-Schrift)", async ({ page }) => {
  await page.goto("/dev/site-preview?system=journal&fixture=full");
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() => [...document.fonts].filter(f => f.status === "loaded").map(f => f.family));
  expect(loaded.join(",")).toMatch(/Fraunces/);
  expect(loaded.join(",")).toMatch(/Inter Tight/);
});

test("Tastatur: Navigation und FAQ erreichbar, Fokus sichtbar", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dev/site-preview?system=journal&fixture=full");
  await page.keyboard.press("Tab");
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
  expect(outline).not.toBe("none");
});
```

- [ ] **Step 2: Run** `npm run test:visual -- systems.spec.ts --update-snapshots`, dann alle Bilder in `systems.spec.ts-snapshots/` ansehen (Read-Tool) — Überläufe, abgeschnittene Wörter, leere Flächen beheben, bis die Bilder stimmen; danach ohne `--update-snapshots` erneut: PASS.
- [ ] **Step 3: Barrierefreiheit** — `tests/visual/a11y.spec.ts` um `/dev/site-preview?system=journal&fixture=full` und `…&palette=salbei`/`ton` erweitern (vorhandenes axe-Muster der Datei übernehmen). Run: PASS ohne Verstöße der Stufe „serious“/„critical“.
- [ ] **Step 4: Lighthouse** — `npm run build && npm start` (Port aus `docs/BETRIEB-V2.md`), dann `npx lighthouse "http://localhost:<port>/demo/system/journal/friseur?live=1" --preset=perf --form-factor=mobile --quiet --output=json --output-path=/tmp/lh-journal.json` und `node -e 'const r=require("/tmp/lh-journal.json");console.log(r.audits["largest-contentful-paint"].numericValue,r.audits["cumulative-layout-shift"].numericValue)'`. Erwartet: LCP < 2500, CLS < 0.1. Sonst beheben (Bildgrößen, Preload) und wiederholen.
- [ ] **Step 5: Regression rev 1/2** — `npm run test:visual -- packs.spec.ts` → PASS ohne Snapshot-Update.
- [ ] **Step 6: Commit** — `test(journal): Bildvergleich, Barrierefreiheit, Ladezeit`

### Task 18: Design-Audits und Feinschliff

**Files:**
- Modify: `client/src/components/site/systems/journal/*` (nur Feinschliff)
- Create: `docs/designsysteme/journal/audit.md`

- [ ] **Step 1:** Skill `impeccable` laden, Modus Kritik/Audit auf `/demo/system/journal/<friseur-id>` bei 375 und 1440 (Browser-Pane) anwenden. Befunde mit Schwere in `audit.md` notieren.
- [ ] **Step 2:** Skill `apple-design` laden, Audit-Checkliste (Typo-Optik, Abstände, Berührungsflächen ≥ 44 px, Fokus, Bewegung) anwenden. Befunde in `audit.md`.
- [ ] **Step 3:** Alle Befunde der Schwere „hoch“ und „mittel“ beheben; jede Änderung nur über Tokens oder Journal-CSS, keine Ausnahmen pro Betrieb. Danach Task-17-Tests erneut laufen lassen, Snapshots bewusst aktualisieren und ansehen.
- [ ] **Step 4: Commit** — `fix(journal): Feinschliff nach Design-Audit`

### Task 19: Abnahme mit echten Betrieben, Freischaltung, Deploy

**Files:**
- Modify: `shared/designSystems/registry.ts` (`RELEASED_SYSTEMS`)
- Create: `docs/designsysteme/journal/abnahme-*.jpg`
- Modify: Memory (`kundenseiten-richtung-2026-10.md` bzw. neue Datei `designsysteme-2026-10.md`), `docs/claude-handoff/STAND.md`

- [ ] **Step 1: Prüfbetriebe wählen** — auf dem VPS (`ssh -i ~/.ssh/claude_pageblitz root@76.13.147.95`) per `mysql` drei echte Seiten auswählen: zwei Postkarten-Friseure mit guten Google-Fotos und einen mit schwachen Fotos (z. B. 574 Bramhoff oder einer der Stock-Betriebe 571/578/585/607, wenn Friseur). Dokumente (`generated_websites`-JSON) lokal nach `/tmp/abnahme/<id>.json` holen — **nur lesen**, nichts in Prod ändern.
- [ ] **Step 2: Rendern** — mit `npx tsx` je Dokument `withDesignSystem(doc, "journal", <jede Palette>)` durch `renderSiteHtml` schicken, HTML lokal ablegen, im Browser-Pane bei 375 und 1440 ansehen und Screenshots nach `docs/designsysteme/journal/abnahme-<id>-<palette>-<breite>.jpg` speichern. Dazu je eine Vorher-Aufnahme der heutigen Live-Seite.
- [ ] **Step 3: Dem Betreiber zeigen** — Vorher/Nachher per `SendUserFile` schicken, fragen: „Abnahme für Journal?“ **STOP bis zur Freigabe.** Änderungswünsche → zurück zu Task 18 Step 3.
- [ ] **Step 4: Freischalten** — `RELEASED_SYSTEMS = ["journal"]`; Test aus Task 14 ohne Mock ergänzen: `expect(isReleased("journal")).toBe(true)`. `npm run check && npm run test` grün.
- [ ] **Step 5: Merge und Deploy** — PR `feat/designsystem-journal` → `main` (Beschreibung mit Abnahmebildern, Testplan; Abschluss `🤖 Generated with [Claude Code](https://claude.com/claude-code)`), nach Merge Deploy laut Memory/`docs/BETRIEB-V2.md` (`set -o pipefail`, nach `pm2 restart` > 5 s warten). Danach auf Prod prüfen: `curl -sI https://<kunden-subdomain>/fonts/systems/inter-tight-latin-wght.woff2` → 200; eine neue Testgenerierung eines Friseurs im Admin → `designRevision: 3`, `system: "journal"`.
- [ ] **Step 6: Bestand bleibt** — Die 35 bestehenden Seiten werden **nicht** umgestellt (Spec §8: erst nach allen sechs Systemen).
- [ ] **Step 7: Doku/Memory** — `STAND.md` und Memory: „Journal live seit <Datum>, Commit <hash>; nächste Systeme Raster → Werkstoff → Plakat → Klar → Nacht; Grundgerüst rev 3 in `shared/designSystems/` + `client/src/components/site/systems/`“. Commit `docs: Stand nach Journal-Freischaltung`.
