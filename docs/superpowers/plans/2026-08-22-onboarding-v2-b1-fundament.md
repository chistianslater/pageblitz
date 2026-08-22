# Onboarding v2 — Plan B1 „Studio-Fundament" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Das Rückgrat des neuen Onboardings: v2-Generierung als eigenständiger Job-Runner (mit Bildern), Preview-SSR per Token, der `onboardingV2`-tRPC-Router (Zustand, Generierung, Stil-Wahl), die Checklisten-Ableitung und die Studio-Shell im Client (Route `/onboarding/:token`, Generierungs-Screen, Checkliste, Live-Preview, Stil-Panel) — plus Dev-Seed-Route und visueller Checkpoint.

**Architecture:** Studio = dünner React-Client über `onboardingV2.*`; jede Mutation lädt das Dokument, wendet einen puren Patch an (`server/onboardingV2/applyPatch.ts`), validiert gegen `WebsiteDataV2Schema`, schreibt hinter `assertV2SafeWrite`, invalidiert den SSR-Cache und gibt Dokument + Checklist zurück. Preview-Wahrheit ist ausschließlich SSR (`/preview-ssr/:token`). Der v2-Job-Runner wandert aus `routers.ts` nach `server/generationV2/runJob.ts`, damit der neue Router ihn ohne Import-Zyklus starten kann. Fortschritt wird NICHT gespeichert, sondern aus Dokument + `onboarding_responses` (neue JSON-Spalte `studioProgress`) abgeleitet.

**Tech Stack:** TypeScript strict, React 19, Wouter, tRPC 11 + react-query, zod v4, Drizzle/MySQL, Express 4, Vitest (+ supertest, renderToStaticMarkup), Playwright (PORT=3005), Tailwind 4 + CSS-Variablen.

**Spec:** `docs/superpowers/specs/2026-08-21-onboarding-v2-design.md` (§2 Architektur, §3 Flow, §4 Punkt 1 „Stil", §6 Zustand/Sicherheit, §8 Tests). Teilprojekt-A-Spec `docs/superpowers/specs/2026-08-20-style-packs-design.md` bleibt für Vertrag/Packs verbindlich.

## Global Constraints

- Sprache aller UI-Texte, Fehlermeldungen, Kommentare, Commit-Messages: **Deutsch**. Commit-Format `<type>: <beschreibung>` (feat/fix/refactor/docs/test/chore) **ohne** Co-Authored-By-Footer.
- `WebsiteDataV2Schema` ist `.strict()` — jedes persistierte v2-Dokument MUSS vorher validiert sein; jeder `updateWebsite`-Aufruf mit `websiteData` steht hinter `assertV2SafeWrite(stored, next)` (`server/v2WriteGuard.ts`).
- `legal.impressumHtml/datenschutzHtml` nur aus `legalGenerator` (XSS-Invariante, schema.ts-Kommentar). In B1 wird `legal.*` nicht angefasst.
- Kein localStorage für Onboarding-Zustand. Zustand kommt ausschließlich aus `onboardingV2.getState`.
- Dateien: typisch < 400 Zeilen, max 800. `routers.ts` darf NICHT wachsen (nur Import + Mount + Löschungen).
- Port 3000 gehört einem fremden Prozess — NIE killen. Dev-/Playwright-Server laufen auf `PORT=3005`.
- Bekannte, env-bedingte Testfails (dürfen bleiben): 4× contrast, 2× resend, Stripe-env-Suites `auth.logout`/`pageblitz`. Alles andere muss grün sein: `npx vitest run` und `npm run check`.
- Prettier-PostToolUse-Hook formatiert berührte Dateien — reine Reformatierungen fremder Dateien als eigener `chore:`-Commit, nie vermischt mit Logik.
- Keine neuen Google-Fonts laden: Studio nutzt `Fraunces` (Display) und `Instrument Sans` (UI), beide bereits in `client/src/index.css` importiert.
- `PB_LAYOUT_V2`-Flag bleibt in B1 unangetastet (entfällt erst in B3); `selfService.generateWebsiteAsync` und StartPage-Navigation bleiben unverändert.

---

## Dateistruktur (B1)

```
server/industryClassifier.ts           ← classifyIndustry (verschoben aus routers.ts, exportiert)
server/gmbPhotos.ts                    ← getGmbPhotos (verschoben aus routers.ts, exportiert)
server/generationV2/gmbOpeningHours.ts ← mapGmbOpeningHoursToV2 (verschoben, exportiert)
server/generationV2/runJob.ts          ← runWebsiteGenerationV2 (verschoben) + resolveV2Images + runWebsiteGenerationV2Job (neu)
server/generationV2/generateSiteContent.ts ← facts.images (hero/about) mergen
server/onboardingV2/ownership.ts       ← loadStudioWebsite(token, user) → { website, doc|null }
server/onboardingV2/applyPatch.ts      ← applyStylePack(doc, packId), parsePackId
server/onboardingV2/router.ts          ← onboardingV2Router: getState / ensureGeneration / getStyleCandidates / selectStylePack
server/onboardingV2/devSeed.ts         ← GET /dev/studio-seed?pack=… (nur non-production)
server/ssr/routes.ts                   ← GET /preview-ssr/:token(/impressum|/datenschutz)?pack=…
shared/onboardingV2/checklist.ts       ← ChecklistItemId, StudioProgress, deriveChecklistState, isCheckoutReady
drizzle/schema.ts                      ← onboardingResponses.studioProgress (json)
client/src/pages/onboarding-v2/studio.css, StudioPage.tsx, useStudioState.ts, GenerationScreen.tsx,
  Checklist.tsx, PreviewFrame.tsx, panels/StylePanel.tsx
client/src/App.tsx                     ← Route /onboarding/:token
tests/visual/studio.spec.ts            ← 3 Breakpoints Studio-Baseline (über Dev-Seed)
```

---

### Task 1: v2-Job-Runner aus `routers.ts` extrahieren

**Files:**
- Create: `server/industryClassifier.ts`, `server/gmbPhotos.ts`, `server/generationV2/gmbOpeningHours.ts`, `server/generationV2/runJob.ts`
- Test: `server/generationV2/runJob.test.ts`
- Modify: `server/routers.ts` (Funktionen `classifyIndustry`, `getGmbPhotos`, `mapGmbOpeningHoursToV2`, `runWebsiteGenerationV2` entfernen, stattdessen importieren)

**Interfaces:**
- Consumes: `generateSiteContent`, `selectPack` (bestehend); `getWebsiteById/getBusinessById/updateGenerationJob/updateWebsite` aus `server/db.ts`; `invalidateSsrCache` aus `server/ssr/routes.ts`; `getHeroImageUrl/getGalleryImages` aus `server/industryImages.ts`; `makeRequest` aus `server/_core/map.ts`; `invokeLLM` aus `server/_core/llm.ts`; `ENV` aus `server/_core/env.ts`.
- Produces: `runWebsiteGenerationV2Job(jobId: number, websiteId: number): Promise<void>` (Task 7 startet damit Jobs), `resolveV2Images(...)`, `runWebsiteGenerationV2(...)` (Aufruf in routers.ts bleibt), `classifyIndustry(category, businessName): Promise<string>`, `getGmbPhotos(placeId, maxPhotos?): Promise<string[]>`, `mapGmbOpeningHoursToV2(weekdayText)`.

- [ ] **Step 1: Die drei Helfer verschieben (Code verbatim, nur `export` davor)**

Zeilen finden: `grep -n "^async function classifyIndustry\|^async function getGmbPhotos\|^function mapGmbOpeningHoursToV2" server/routers.ts`. Jede Funktion inklusive ihres JSDoc-Blocks ausschneiden und in die neue Datei einfügen:

`server/industryClassifier.ts`:
```ts
import { invokeLLM } from "./_core/llm";

/** (JSDoc + Body 1:1 aus routers.ts übernehmen, nur `export` ergänzen) */
export async function classifyIndustry(
  category: string,
  businessName: string
): Promise<string> {
  // … unveränderter Body …
}
```

`server/gmbPhotos.ts`:
```ts
import { makeRequest } from "./_core/map";
import { ENV } from "./_core/env";

export async function getGmbPhotos(placeId: string, maxPhotos = 6): Promise<string[]> {
  // … unveränderter Body …
}
```

`server/generationV2/gmbOpeningHours.ts`:
```ts
export function mapGmbOpeningHoursToV2(
  weekdayText: string[] | null | undefined
): { day: string; hours: string }[] | undefined {
  if (!weekdayText || weekdayText.length === 0) return undefined;
  return weekdayText.map(line => {
    const sepIndex = line.indexOf(": ");
    if (sepIndex === -1) return { day: line, hours: "" };
    return { day: line.slice(0, sepIndex), hours: line.slice(sepIndex + 2) };
  });
}
```

In `server/routers.ts` die drei Definitionen löschen und oben importieren:
```ts
import { classifyIndustry } from "./industryClassifier";
import { getGmbPhotos } from "./gmbPhotos";
```
(`mapGmbOpeningHoursToV2` wird in routers.ts nach Step 2 nicht mehr gebraucht — prüfen mit `grep -n mapGmbOpeningHoursToV2 server/routers.ts`; falls doch, aus `./generationV2/gmbOpeningHours` importieren.)

- [ ] **Step 2: Failing Test für den neuen Job-Runner schreiben**

`server/generationV2/runJob.test.ts`:
```ts
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../db", () => ({
  getWebsiteById: vi.fn(),
  getBusinessById: vi.fn(),
  updateGenerationJob: vi.fn().mockResolvedValue(undefined),
  updateWebsite: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));
vi.mock("../industryClassifier", () => ({
  classifyIndustry: vi.fn().mockResolvedValue("handwerk"),
}));
vi.mock("../gmbPhotos", () => ({ getGmbPhotos: vi.fn() }));
vi.mock("./selectPack", () => ({ selectPack: vi.fn().mockResolvedValue("werkbank") }));
vi.mock("./generateSiteContent", () => ({ generateSiteContent: vi.fn() }));

import * as db from "../db";
import { getGmbPhotos } from "../gmbPhotos";
import { invalidateSsrCache } from "../ssr/routes";
import { generateSiteContent } from "./generateSiteContent";
import { resolveV2Images, runWebsiteGenerationV2Job } from "./runJob";

const mockedDb = vi.mocked(db);
const mockedPhotos = vi.mocked(getGmbPhotos);
const mockedGen = vi.mocked(generateSiteContent);

const website = { id: 42, slug: "preview-brandt", businessId: 7 };
const business = {
  id: 7, name: "Schreinerei Brandt", category: "Tischler", searchRegion: "Dortmund",
  phone: "0231 123", email: null, address: null, rating: "4.8", reviewCount: 12,
  openingHours: ["Montag: 08:00–17:00"], placeId: "ChIJabc",
};
const doc = {
  version: 2 as const, stylePackId: "werkbank" as const, businessName: "Schreinerei Brandt",
  sections: [{ type: "hero" as const, headline: "Massarbeit." }],
  seo: { title: "t", description: "d" },
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedDb.getWebsiteById.mockResolvedValue(website as any);
  mockedDb.getBusinessById.mockResolvedValue(business as any);
  mockedGen.mockResolvedValue(doc);
});

describe("resolveV2Images", () => {
  test("GMB-Fotos haben Vorrang: Foto 1 = Hero, Foto 2 = Über uns", async () => {
    mockedPhotos.mockResolvedValue(["https://g/1.jpg", "https://g/2.jpg", "https://g/3.jpg"]);
    await expect(resolveV2Images({ placeId: "ChIJabc", name: "X" }, "Tischler", "handwerk"))
      .resolves.toEqual({ hero: "https://g/1.jpg", about: "https://g/2.jpg" });
  });
  test("self-Place-IDs fragen Google gar nicht erst, Branchen-Stock greift", async () => {
    const result = await resolveV2Images({ placeId: "self-abc", name: "X" }, "Tischler", "handwerk");
    expect(mockedPhotos).not.toHaveBeenCalled();
    expect(result.hero).toMatch(/^https?:\/\//);
  });
});

describe("runWebsiteGenerationV2Job", () => {
  test("lädt Website+Business, übergibt Fakten+Bilder, persistiert, invalidiert Cache, schließt Job ab", async () => {
    mockedPhotos.mockResolvedValue(["https://g/1.jpg"]);
    await runWebsiteGenerationV2Job(99, 42);

    expect(mockedGen).toHaveBeenCalledTimes(1);
    const args = mockedGen.mock.calls[0][0];
    expect(args.packId).toBe("werkbank");
    expect(args.facts?.images).toEqual({ hero: "https://g/1.jpg" });
    expect(args.facts?.contact?.phone).toBe("0231 123");
    expect(args.facts?.contact?.openingHours).toEqual([{ day: "Montag", hours: "08:00–17:00" }]);
    expect(args.facts?.google).toEqual({ rating: 4.8, reviewCount: 12 });
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(42, { websiteData: doc });
    expect(invalidateSsrCache).toHaveBeenCalledWith("preview-brandt");
    expect(mockedDb.updateGenerationJob).toHaveBeenLastCalledWith(99, {
      status: "completed", progress: 100,
      result: { success: true, alreadyGenerated: false, usedFallback: false },
    });
  });
  test("Fehler → Job failed mit Meldung, kein Throw nach außen", async () => {
    mockedPhotos.mockResolvedValue([]);
    mockedGen.mockRejectedValue(new Error("LLM kaputt"));
    await expect(runWebsiteGenerationV2Job(99, 42)).resolves.toBeUndefined();
    expect(mockedDb.updateGenerationJob).toHaveBeenLastCalledWith(99, { status: "failed", error: "LLM kaputt" });
  });
});
```

- [ ] **Step 3: Test laufen lassen — erwartet FAIL** (`Cannot find module './runJob'`)

Run: `npx vitest run server/generationV2/runJob.test.ts`

- [ ] **Step 4: `server/generationV2/runJob.ts` schreiben**

`runWebsiteGenerationV2` aus routers.ts (Block `async function runWebsiteGenerationV2(` bis zur schließenden Klammer vor `export const appRouter`) hierher verschieben und um Bilder erweitern:
```ts
import {
  getBusinessById,
  getWebsiteById,
  updateGenerationJob,
  updateWebsite,
} from "../db";
import { invalidateSsrCache } from "../ssr/routes";
import { classifyIndustry } from "../industryClassifier";
import { getGmbPhotos } from "../gmbPhotos";
import { getGalleryImages, getHeroImageUrl } from "../industryImages";
import { generateSiteContent } from "./generateSiteContent";
import { selectPack } from "./selectPack";
import { mapGmbOpeningHoursToV2 } from "./gmbOpeningHours";

export interface V2JobBusiness {
  name: string;
  category: string | null;
  searchRegion: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  rating: string | null;
  reviewCount: number | null;
  openingHours: string[] | null;
  placeId: string | null;
}

export interface V2Images {
  hero?: string;
  about?: string;
}

/**
 * Bilder kommen NIE vom LLM: echte GMB-Fotos zuerst (Foto 1 = Hero, Foto 2 =
 * Über uns), sonst Branchen-Stock aus industryImages. "self-…"-Place-IDs sind
 * Platzhalter ohne Google-Eintrag — dort wird Google gar nicht erst gefragt.
 */
export async function resolveV2Images(
  business: { placeId: string | null; name: string },
  category: string,
  industryKey: string
): Promise<V2Images> {
  const gmb =
    business.placeId && !business.placeId.startsWith("self-")
      ? await getGmbPhotos(business.placeId, 3)
      : [];
  if (gmb.length > 0) {
    return { hero: gmb[0], ...(gmb[1] ? { about: gmb[1] } : {}) };
  }
  const hero = getHeroImageUrl(category, business.name, industryKey);
  const gallery = getGalleryImages(category, business.name, industryKey);
  return { hero, ...(gallery[0] ? { about: gallery[0] } : {}) };
}

/** (JSDoc aus routers.ts übernehmen) */
export async function runWebsiteGenerationV2(
  jobId: number,
  website: { id: number; slug: string },
  business: V2JobBusiness,
  category: string,
  industryKey: string
): Promise<void> {
  await updateGenerationJob(jobId, { progress: 30 });
  const packId = await selectPack(category, industryKey);
  await updateGenerationJob(jobId, { progress: 50 });

  const images = await resolveV2Images(business, category, industryKey);
  const rating = business.rating ? parseFloat(business.rating) : NaN;
  const websiteData = await generateSiteContent({
    packId,
    business: { name: business.name, category, city: business.searchRegion || undefined },
    facts: {
      slug: website.slug,
      businessCategory: category,
      ...(Number.isFinite(rating)
        ? { google: { rating, reviewCount: business.reviewCount || 0 } }
        : {}),
      contact: {
        phone: business.phone || undefined,
        email: business.email || undefined,
        // (Kommentar zu address/street/zip aus routers.ts übernehmen)
        city: business.searchRegion || undefined,
        openingHours: mapGmbOpeningHoursToV2(business.openingHours),
      },
      images,
    },
  });

  await updateGenerationJob(jobId, { progress: 90 });
  await updateWebsite(website.id, { websiteData: websiteData as any });
  invalidateSsrCache(website.slug);
  await updateGenerationJob(jobId, {
    status: "completed",
    progress: 100,
    result: { success: true, alreadyGenerated: false, usedFallback: false },
  });
  console.log(`[Generation Job ${jobId}] Completed (v2) for website ${website.id}, pack=${packId}`);
}

/**
 * Eigenständiger v2-Job (Studio/onboardingV2.ensureGeneration): unabhängig
 * vom PB_LAYOUT_V2-Flag immer der v2-Pfad. Fehler landen im Job (status
 * "failed" + Meldung) statt als unbehandelte Rejection.
 */
export async function runWebsiteGenerationV2Job(
  jobId: number,
  websiteId: number
): Promise<void> {
  try {
    await updateGenerationJob(jobId, { status: "processing", progress: 10 });
    const website = await getWebsiteById(websiteId);
    if (!website) throw new Error("Website nicht gefunden");
    const business = await getBusinessById(website.businessId);
    if (!business) throw new Error("Unternehmen nicht gefunden");
    const category = business.category || "Dienstleistung";
    const industryKey = await classifyIndustry(category, business.name);
    await runWebsiteGenerationV2(
      jobId,
      website,
      { ...business, openingHours: business.openingHours as string[] | null },
      category,
      industryKey
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Generation Job ${jobId}] v2-Generierung fehlgeschlagen:`, err);
    await updateGenerationJob(jobId, { status: "failed", error: message });
  }
}
```
In `server/routers.ts`: `import { runWebsiteGenerationV2 } from "./generationV2/runJob";` — der Aufruf in `runWebsiteGeneration` (Flag-Zweig) bleibt wie er ist. `facts.images` existiert erst nach Task 2 — bis dahin schlägt `npm run check` an dieser Stelle an; Task 2 direkt anschließend ausführen (beide Tasks zusammen sind der Review-Gate).

- [ ] **Step 5: Tests laufen lassen**

Run: `npx vitest run server/generationV2 server/routers.v2Guards.test.ts server/routers.onboardingCompleteV2.test.ts`
Expected: runJob-Tests PASS (Images-Assertion erst nach Task 2 grün, wenn die facts-Typen stimmen — falls TS-Fehler, Task 2 zuerst abschließen, dann hier zurück). v2Guards/onboardingCompleteV2 PASS.

- [ ] **Step 6: Commit**

```bash
git add server/industryClassifier.ts server/gmbPhotos.ts server/generationV2/gmbOpeningHours.ts server/generationV2/runJob.ts server/generationV2/runJob.test.ts server/routers.ts
git commit -m "refactor: v2-Job-Runner + Helfer aus routers.ts extrahiert (runWebsiteGenerationV2Job)"
```

---

### Task 2: Bilder deterministisch in die v2-Generierung mergen

**Files:**
- Modify: `server/generationV2/generateSiteContent.ts` (`GenerateSiteContentFacts.images`, `mergeFacts`)
- Test: `server/generationV2/generateSiteContent.test.ts` (zwei Fälle ergänzen)

**Interfaces:**
- Produces: `GenerateSiteContentFacts.images?: { hero?: string; about?: string }` — Hero-URL → `sections[type=hero].imageUrl`, About-URL → `sections[type=about].imageUrl`. Sektionen, die nicht existieren, werden NICHT erzeugt.

- [ ] **Step 1: Failing Tests ergänzen** (in der bestehenden Datei; das vorhandene Mock-Setup für `llmComplete` wiederverwenden — dort gibt es bereits einen Helfer, der eine gültige LLM-Antwort mit hero+services+about+contact liefert; falls nicht, lokal ein `validLlmJson` mit diesen vier Sektionen anlegen)

```ts
describe("facts.images", () => {
  test("setzt hero.imageUrl und about.imageUrl aus facts, nicht vom LLM", async () => {
    mockLlmOnce(validLlmJson); // bestehender Mock-Helfer der Datei
    const doc = await generateSiteContent({
      packId: "werkbank",
      business: { name: "Brandt", category: "Tischler" },
      facts: { images: { hero: "https://img/hero.jpg", about: "https://img/about.jpg" } },
    });
    const hero = doc.sections.find(s => s.type === "hero");
    const about = doc.sections.find(s => s.type === "about");
    expect(hero && "imageUrl" in hero ? hero.imageUrl : undefined).toBe("https://img/hero.jpg");
    expect(about && "imageUrl" in about ? about.imageUrl : undefined).toBe("https://img/about.jpg");
  });
  test("ohne facts.images bleiben die Sektionen unverändert (kein imageUrl-Feld)", async () => {
    mockLlmOnce(validLlmJson);
    const doc = await generateSiteContent({
      packId: "werkbank",
      business: { name: "Brandt", category: "Tischler" },
      facts: { slug: "x" },
    });
    const hero = doc.sections.find(s => s.type === "hero") as { imageUrl?: string };
    expect(hero.imageUrl).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run — erwartet FAIL** (`images` nicht im Typ / imageUrl undefined)

Run: `npx vitest run server/generationV2/generateSiteContent.test.ts`

- [ ] **Step 3: Implementieren**

In `GenerateSiteContentFacts` ergänzen:
```ts
  /** Deterministische Bild-URLs (GMB/Stock), nie vom LLM; nur gesetzt, wenn die Sektion existiert. */
  images?: { hero?: string; about?: string };
```
In `mergeFacts` nach dem contact-Block, vor dem `return`:
```ts
  if (facts.images) {
    const { hero, about } = facts.images;
    sections = sections.map(s => {
      if (s.type === "hero" && hero !== undefined) return { ...s, imageUrl: hero };
      if (s.type === "about" && about !== undefined) return { ...s, imageUrl: about };
      return s;
    });
  }
```
(Das anschließende `safeParse` in `generateSiteContent` validiert die URLs gegen `SafeUrlSchema` — ungültige Bild-URLs führen zum Throw, nicht zu stillen Kaputt-Dokumenten.)

- [ ] **Step 4: Run — PASS**, dann `npm run check` (jetzt muss auch Task 1 typklar sein)

- [ ] **Step 5: Commit**

```bash
git add server/generationV2/generateSiteContent.ts server/generationV2/generateSiteContent.test.ts
git commit -m "feat: v2-Generierung mergt deterministische Hero-/About-Bilder (facts.images)"
```

---

### Task 3: Spalte `studioProgress` + Checklisten-Ableitung (shared)

**Files:**
- Modify: `drizzle/schema.ts` (onboardingResponses)
- Create: `shared/onboardingV2/checklist.ts`
- Test: `shared/onboardingV2/checklist.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type ChecklistItemId = "style" | "photos" | "texts" | "offer" | "legal" | "addons";
  export interface StudioProgress { styleConfirmed?: boolean; textsReviewed?: boolean; addonsReviewed?: boolean }
  export interface ChecklistAnswers {
    legalOwner?: string | null; legalEmail?: string | null; legalStreet?: string | null;
    legalZip?: string | null; legalCity?: string | null; studioProgress?: StudioProgress | null;
  }
  export type ChecklistStatus = "done" | "open";
  export interface ChecklistItem { id: ChecklistItemId; title: string; hint: string; status: ChecklistStatus; required: boolean }
  export const CHECKLIST_ORDER: readonly ChecklistItemId[];
  export function deriveChecklistState(doc: WebsiteDataV2 | null, answers: ChecklistAnswers): ChecklistItem[];
  export function isCheckoutReady(items: ChecklistItem[], hasEmail: boolean): boolean;
  export function parseStudioProgress(value: unknown): StudioProgress;  // tolerant gegen null/Fremdwerte
  ```

- [ ] **Step 1: Schema-Spalte ergänzen**

In `drizzle/schema.ts`, Tabelle `onboardingResponses`, direkt nach `hiddenSections: json("hiddenSections"),`:
```ts
  // Studio (Onboarding v2): Bestätigungs-Flags, die sich nicht aus dem
  // Dokument ableiten lassen — { styleConfirmed?, textsReviewed?, addonsReviewed? }.
  // Alles andere (Fotos/Angebot/Rechtliches) wird aus websiteData bzw. den
  // legal*-Spalten abgeleitet (shared/onboardingV2/checklist.ts).
  studioProgress: json("studioProgress"),
```
Migration lokal anwenden: `npm run db:push` (drizzle-kit generate + migrate; die erzeugte SQL-Datei unter `drizzle/` mit committen). Falls `db:push` lokal wegen fehlender DB-Verbindung scheitert: nur `npx drizzle-kit generate` ausführen und die Migrationsdatei committen — die VPS-Anwendung steht in der Aktivierungs-Checkliste (Task 13 ergänzt sie).

- [ ] **Step 2: Failing Test**

`shared/onboardingV2/checklist.test.ts`:
```ts
import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../siteContract/types";
import { CHECKLIST_ORDER, deriveChecklistState, isCheckoutReady, parseStudioProgress } from "./checklist";

const base: WebsiteDataV2 = {
  version: 2, stylePackId: "werkbank", businessName: "Brandt",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "Hallo" },
    { type: "services", headline: "Leistungen", items: [{ title: "Möbelbau" }] },
  ],
};
const legalDone = { legalOwner: "Max Brandt", legalEmail: "m@b.de", legalStreet: "Weg 1", legalZip: "44135", legalCity: "Dortmund" };

describe("deriveChecklistState", () => {
  test("Reihenfolge ist fix: style, photos, texts, offer, legal, addons", () => {
    expect(deriveChecklistState(base, {}).map(i => i.id)).toEqual([...CHECKLIST_ORDER]);
    expect(CHECKLIST_ORDER).toEqual(["style", "photos", "texts", "offer", "legal", "addons"]);
  });
  test("ohne Dokument ist alles offen außer addons", () => {
    const items = deriveChecklistState(null, {});
    expect(items.filter(i => i.status === "done").map(i => i.id)).toEqual(["addons"]);
  });
  test("photos done sobald hero.imageUrl gesetzt", () => {
    const withImg = { ...base, sections: [{ type: "hero" as const, headline: "Hallo", imageUrl: "https://x/1.jpg" }, base.sections[1]] };
    expect(deriveChecklistState(withImg, {}).find(i => i.id === "photos")?.status).toBe("done");
    expect(deriveChecklistState(base, {}).find(i => i.id === "photos")?.status).toBe("open");
  });
  test("offer done bei ≥1 Leistung ODER ≥1 Speisekarten-/Preislisten-Kategorie", () => {
    expect(deriveChecklistState(base, {}).find(i => i.id === "offer")?.status).toBe("done");
    const menuOnly: WebsiteDataV2 = { ...base, sections: [base.sections[0], { type: "menu", categories: [{ name: "Pizza", items: [{ name: "Margherita", price: "9 €" }] }] }] };
    expect(deriveChecklistState(menuOnly, {}).find(i => i.id === "offer")?.status).toBe("done");
    const none: WebsiteDataV2 = { ...base, sections: [base.sections[0]] };
    expect(deriveChecklistState(none, {}).find(i => i.id === "offer")?.status).toBe("open");
  });
  test("legal done nur mit allen fünf Pflichtfeldern; legal ist required", () => {
    const legal = deriveChecklistState(base, legalDone).find(i => i.id === "legal");
    expect(legal?.status).toBe("done");
    expect(legal?.required).toBe(true);
    expect(deriveChecklistState(base, { ...legalDone, legalZip: "" }).find(i => i.id === "legal")?.status).toBe("open");
  });
  test("style/texts done über studioProgress-Flags", () => {
    const items = deriveChecklistState(base, { studioProgress: { styleConfirmed: true, textsReviewed: true } });
    expect(items.find(i => i.id === "style")?.status).toBe("done");
    expect(items.find(i => i.id === "texts")?.status).toBe("done");
  });
});

describe("isCheckoutReady", () => {
  test("bereit = alle required-Punkte done UND E-Mail vorhanden", () => {
    expect(isCheckoutReady(deriveChecklistState(base, legalDone), true)).toBe(true);
    expect(isCheckoutReady(deriveChecklistState(base, legalDone), false)).toBe(false);
    expect(isCheckoutReady(deriveChecklistState(base, {}), true)).toBe(false);
  });
});

describe("parseStudioProgress", () => {
  test("toleriert null/Strings/Fremdfelder", () => {
    expect(parseStudioProgress(null)).toEqual({});
    expect(parseStudioProgress("kaputt")).toEqual({});
    expect(parseStudioProgress({ styleConfirmed: true, foo: 1 })).toEqual({ styleConfirmed: true });
  });
});
```

- [ ] **Step 3: Run — FAIL** (`Cannot find module './checklist'`)

- [ ] **Step 4: Implementieren** `shared/onboardingV2/checklist.ts`

```ts
import type { WebsiteDataV2 } from "../siteContract/types";

export type ChecklistItemId = "style" | "photos" | "texts" | "offer" | "legal" | "addons";
export type ChecklistStatus = "done" | "open";

export interface StudioProgress {
  styleConfirmed?: boolean;
  textsReviewed?: boolean;
  addonsReviewed?: boolean;
}

export interface ChecklistAnswers {
  legalOwner?: string | null;
  legalEmail?: string | null;
  legalStreet?: string | null;
  legalZip?: string | null;
  legalCity?: string | null;
  studioProgress?: StudioProgress | null;
}

export interface ChecklistItem {
  id: ChecklistItemId;
  title: string;
  hint: string;
  status: ChecklistStatus;
  /** Muss "done" sein, bevor der Checkout freigegeben wird (Spec §4: nur Rechtliches). */
  required: boolean;
}

export const CHECKLIST_ORDER = ["style", "photos", "texts", "offer", "legal", "addons"] as const;

const TITLES: Record<ChecklistItemId, { title: string; hint: string }> = {
  style: { title: "Stil", hint: "Passt der Look? Du kannst zwischen passenden Stilen wechseln." },
  photos: { title: "Fotos", hint: "Eigene Fotos, Google-Fotos oder Stockbilder wählen." },
  texts: { title: "Texte", hint: "Überschriften und Über-uns-Text prüfen oder anpassen." },
  offer: { title: "Angebot", hint: "Leistungen, Speisekarte oder Preisliste pflegen." },
  legal: { title: "Rechtliches", hint: "Impressum-Angaben — Pflicht vor dem Freischalten." },
  addons: { title: "Extras", hint: "Kontaktformular, Galerie, Buchung & mehr." },
};

const hasText = (v: string | null | undefined): boolean => typeof v === "string" && v.trim().length > 0;

/** Tolerant gegen null/Strings/Fremdfelder — DB-JSON ist `unknown`. */
export function parseStudioProgress(value: unknown): StudioProgress {
  if (!value || typeof value !== "object") return {};
  const v = value as Record<string, unknown>;
  return {
    ...(v.styleConfirmed === true ? { styleConfirmed: true } : {}),
    ...(v.textsReviewed === true ? { textsReviewed: true } : {}),
    ...(v.addonsReviewed === true ? { addonsReviewed: true } : {}),
  };
}

function hasHeroImage(doc: WebsiteDataV2 | null): boolean {
  const hero = doc?.sections.find(s => s.type === "hero");
  return !!hero && "imageUrl" in hero && typeof hero.imageUrl === "string" && hero.imageUrl.length > 0;
}

function hasOffer(doc: WebsiteDataV2 | null): boolean {
  if (!doc) return false;
  return doc.sections.some(s => {
    if (s.type === "services") return s.items.length > 0;
    if (s.type === "menu" || s.type === "pricelist") return s.categories.length > 0;
    return false;
  });
}

function legalComplete(a: ChecklistAnswers): boolean {
  return hasText(a.legalOwner) && hasText(a.legalEmail) && hasText(a.legalStreet) && hasText(a.legalZip) && hasText(a.legalCity);
}

/** Pure Ableitung — nichts wird gespeichert, Reload-sicher per Konstruktion (Spec §4/§6). */
export function deriveChecklistState(doc: WebsiteDataV2 | null, answers: ChecklistAnswers): ChecklistItem[] {
  const progress = parseStudioProgress(answers.studioProgress);
  const statusOf: Record<ChecklistItemId, ChecklistStatus> = {
    style: progress.styleConfirmed ? "done" : "open",
    photos: hasHeroImage(doc) ? "done" : "open",
    texts: progress.textsReviewed ? "done" : "open",
    offer: hasOffer(doc) ? "done" : "open",
    legal: legalComplete(answers) ? "done" : "open",
    addons: "done",
  };
  return CHECKLIST_ORDER.map(id => ({
    id,
    ...TITLES[id],
    status: statusOf[id],
    required: id === "legal",
  }));
}

export function isCheckoutReady(items: ChecklistItem[], hasEmail: boolean): boolean {
  return hasEmail && items.filter(i => i.required).every(i => i.status === "done");
}
```

- [ ] **Step 5: Run — PASS**; `npm run check`

- [ ] **Step 6: Commit**

```bash
git add drizzle/schema.ts drizzle/ shared/onboardingV2/checklist.ts shared/onboardingV2/checklist.test.ts
git commit -m "feat: Studio-Checkliste — deriveChecklistState + studioProgress-Spalte"
```

---

### Task 4: Ownership + Stil-Patch (Server, pure)

**Files:**
- Create: `server/onboardingV2/ownership.ts`, `server/onboardingV2/applyPatch.ts`
- Test: `server/onboardingV2/ownership.test.ts`, `server/onboardingV2/applyPatch.test.ts`

**Interfaces:**
- Consumes: `getWebsiteByToken`, `getSubscriptionByWebsiteId` (`server/db.ts`); `TrpcContext["user"]`; `WebsiteDataV2Schema`, `PACK_IDS`.
- Produces:
  ```ts
  // ownership.ts
  export interface StudioWebsite { website: NonNullable<Awaited<ReturnType<typeof getWebsiteByToken>>>; doc: WebsiteDataV2 | null }
  export async function loadStudioWebsite(token: string, user: { id: number } | null): Promise<StudioWebsite>
  //   NOT_FOUND "Diese Vorschau existiert nicht (mehr)." bei unbekanntem Token
  //   FORBIDDEN "Diese Website gehört einem anderen Konto." wenn status !== "preview" und subscription.userId !== user?.id
  //   doc = safeParse(websiteData) → data, sonst null (v1/leer)
  // applyPatch.ts
  export function parsePackId(value: string): PackId            // BAD_REQUEST `Unbekanntes Style-Pack: "…"`
  export function applyStylePack(doc: WebsiteDataV2, packId: PackId): WebsiteDataV2  // pure, validiert
  ```

- [ ] **Step 1: Failing Tests**

`server/onboardingV2/ownership.test.ts`:
```ts
import { beforeEach, describe, expect, test, vi } from "vitest";
import { TRPCError } from "@trpc/server";

vi.mock("../db", () => ({ getWebsiteByToken: vi.fn(), getSubscriptionByWebsiteId: vi.fn() }));
import * as db from "../db";
import { loadStudioWebsite } from "./ownership";
const mockedDb = vi.mocked(db);

const v2 = { version: 2, stylePackId: "werkbank", businessName: "B", seo: { title: "t", description: "d" }, sections: [{ type: "hero", headline: "H" }] };

beforeEach(() => vi.clearAllMocks());

describe("loadStudioWebsite", () => {
  test("unbekannter Token → NOT_FOUND", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue(undefined);
    await expect(loadStudioWebsite("nope", null)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
  test("Preview-Website ist per Token zugänglich, doc geparst", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({ id: 1, status: "preview", websiteData: v2 } as any);
    const r = await loadStudioWebsite("tok", null);
    expect(r.doc?.stylePackId).toBe("werkbank");
  });
  test("v1-/leeres Dokument → doc null, kein Throw", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({ id: 1, status: "preview", websiteData: { hero: {} } } as any);
    expect((await loadStudioWebsite("tok", null)).doc).toBeNull();
  });
  test("verkaufte Website: fremder/kein User → FORBIDDEN, Eigentümer → ok", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({ id: 1, status: "active", websiteData: v2 } as any);
    mockedDb.getSubscriptionByWebsiteId.mockResolvedValue({ userId: 7 } as any);
    await expect(loadStudioWebsite("tok", null)).rejects.toBeInstanceOf(TRPCError);
    await expect(loadStudioWebsite("tok", { id: 8 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(loadStudioWebsite("tok", { id: 7 })).resolves.toBeTruthy();
  });
});
```

`server/onboardingV2/applyPatch.test.ts`:
```ts
import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import { applyStylePack, parsePackId } from "./applyPatch";

const doc: WebsiteDataV2 = { version: 2, stylePackId: "werkbank", businessName: "B", seo: { title: "t", description: "d" }, sections: [{ type: "hero", headline: "H" }] };

describe("parsePackId", () => {
  test("kennt registrierte IDs, wirft BAD_REQUEST sonst", () => {
    expect(parsePackId("kanzlei")).toBe("kanzlei");
    expect(() => parsePackId("disco")).toThrowError(/Unbekanntes Style-Pack/);
  });
});
describe("applyStylePack", () => {
  test("setzt stylePackId, mutiert das Original nicht, Rest bleibt identisch", () => {
    const next = applyStylePack(doc, "kanzlei");
    expect(next.stylePackId).toBe("kanzlei");
    expect(doc.stylePackId).toBe("werkbank");
    expect(next.sections).toEqual(doc.sections);
  });
});
```

- [ ] **Step 2: Run — FAIL** (Module fehlen)

- [ ] **Step 3: Implementieren**

`server/onboardingV2/ownership.ts`:
```ts
import { TRPCError } from "@trpc/server";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import { getSubscriptionByWebsiteId, getWebsiteByToken } from "../db";

export interface StudioWebsite {
  website: NonNullable<Awaited<ReturnType<typeof getWebsiteByToken>>>;
  doc: WebsiteDataV2 | null;
}

/**
 * Zugriffsregel Studio (Spec §6): Der previewToken (nanoid 32) ist im
 * Preview-Zustand das Zugangsgeheimnis. Sobald die Website verkauft/aktiv
 * ist, muss zusätzlich der eingeloggte Nutzer der Abo-Inhaber sein — sonst
 * könnte ein alter Preview-Link eine bezahlte Website verändern.
 */
export async function loadStudioWebsite(
  token: string,
  user: { id: number } | null
): Promise<StudioWebsite> {
  const website = await getWebsiteByToken(token);
  if (!website) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Diese Vorschau existiert nicht (mehr)." });
  }
  if (website.status !== "preview") {
    const subscription = await getSubscriptionByWebsiteId(website.id);
    if (!user || !subscription || subscription.userId !== user.id) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Diese Website gehört einem anderen Konto." });
    }
  }
  const parsed = WebsiteDataV2Schema.safeParse(website.websiteData);
  return { website, doc: parsed.success ? parsed.data : null };
}
```

`server/onboardingV2/applyPatch.ts`:
```ts
import { TRPCError } from "@trpc/server";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import { PACK_IDS, type PackId, type WebsiteDataV2 } from "../../shared/siteContract/types";

export function parsePackId(value: string): PackId {
  if ((PACK_IDS as readonly string[]).includes(value)) return value as PackId;
  throw new TRPCError({ code: "BAD_REQUEST", message: `Unbekanntes Style-Pack: "${value}"` });
}

/** Pure: neues, schema-validiertes Dokument mit anderem Pack; Inhalte bleiben 1:1. */
export function applyStylePack(doc: WebsiteDataV2, packId: PackId): WebsiteDataV2 {
  return WebsiteDataV2Schema.parse({ ...doc, stylePackId: packId });
}
```

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Commit**

```bash
git add server/onboardingV2/ownership.ts server/onboardingV2/ownership.test.ts server/onboardingV2/applyPatch.ts server/onboardingV2/applyPatch.test.ts
git commit -m "feat: onboardingV2 — Ownership-Prüfung per Token und purer Stil-Patch"
```

---

### Task 5: `onboardingV2`-Router (getState / ensureGeneration / getStyleCandidates / selectStylePack)

**Files:**
- Create: `server/onboardingV2/router.ts`
- Modify: `server/routers.ts` (Import + `onboardingV2: onboardingV2Router` im `appRouter`)
- Test: `server/onboardingV2/router.test.ts`

**Interfaces:**
- Consumes: `loadStudioWebsite`, `applyStylePack`, `parsePackId` (Task 4); `deriveChecklistState`, `isCheckoutReady`, `parseStudioProgress` (Task 3); `runWebsiteGenerationV2Job` (Task 1); `getV2VariantCandidates` (`shared/stylePacks/variantCandidates.ts`), `STYLE_PACKS`, `getConstitution` (`shared/stylePacks`); db: `getBusinessById`, `getOnboardingByWebsiteId`, `updateOnboarding`, `updateWebsite`, `getGenerationJobByWebsiteId`, `createGenerationJob`; `assertV2SafeWrite`; `invalidateSsrCache`.
- Produces (Client nutzt exakt diese Formen):
  ```ts
  type StudioState = {
    websiteId: number; token: string; businessName: string; category: string;
    stylePackId: PackId | null; doc: WebsiteDataV2 | null;
    job: { id: number; status: "pending"|"processing"|"completed"|"failed"; progress: number; error: string | null } | null;
    checklist: ChecklistItem[]; checkoutReady: boolean; customerEmail: string | null;
  }
  onboardingV2.getState({ token })                → StudioState
  onboardingV2.ensureGeneration({ token })        → { jobId: number | null; status: "completed"|"pending"|"processing" }
  onboardingV2.getStyleCandidates({ token, round }) → { candidates: { id: PackId; name: string; essence: string }[] }
  onboardingV2.selectStylePack({ token, packId })  → StudioState
  ```

- [ ] **Step 1: Failing Tests**

`server/onboardingV2/router.test.ts`:
```ts
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

vi.hoisted(() => { process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy_for_unit_tests"; });

vi.mock("../db", async importOriginal => {
  const actual = await importOriginal<typeof import("../db")>();
  return {
    ...actual,
    getWebsiteByToken: vi.fn(), getSubscriptionByWebsiteId: vi.fn(), getBusinessById: vi.fn(),
    getOnboardingByWebsiteId: vi.fn(), updateOnboarding: vi.fn().mockResolvedValue(undefined),
    updateWebsite: vi.fn().mockResolvedValue(undefined), getGenerationJobByWebsiteId: vi.fn(),
    createGenerationJob: vi.fn().mockResolvedValue(501),
  };
});
vi.mock("../generationV2/runJob", () => ({ runWebsiteGenerationV2Job: vi.fn().mockResolvedValue(undefined) }));
vi.mock("../ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));

import { appRouter } from "../routers";
import * as db from "../db";
import { runWebsiteGenerationV2Job } from "../generationV2/runJob";
import { invalidateSsrCache } from "../ssr/routes";
const mockedDb = vi.mocked(db);

const ctx = (): TrpcContext => ({ user: null, req: { protocol: "https", headers: {} } as any, res: {} as any });
const v2 = { version: 2, stylePackId: "werkbank", businessName: "Brandt", seo: { title: "t", description: "d" },
  sections: [{ type: "hero", headline: "H", imageUrl: "https://x/h.jpg" }, { type: "services", headline: "L", items: [{ title: "A" }] }] };

beforeEach(() => {
  vi.clearAllMocks();
  mockedDb.getWebsiteByToken.mockResolvedValue({ id: 42, slug: "preview-brandt", status: "preview", businessId: 7, websiteData: v2, customerEmail: null } as any);
  mockedDb.getBusinessById.mockResolvedValue({ id: 7, name: "Brandt", category: "Tischler" } as any);
  mockedDb.getOnboardingByWebsiteId.mockResolvedValue({ websiteId: 42, studioProgress: null } as any);
  mockedDb.getGenerationJobByWebsiteId.mockResolvedValue(undefined);
});

describe("onboardingV2.getState", () => {
  test("liefert Dokument, Checkliste und Job-Zustand", async () => {
    const s = await appRouter.createCaller(ctx()).onboardingV2.getState({ token: "tok" });
    expect(s.websiteId).toBe(42);
    expect(s.stylePackId).toBe("werkbank");
    expect(s.checklist.find(i => i.id === "photos")?.status).toBe("done");
    expect(s.checklist.find(i => i.id === "legal")?.status).toBe("open");
    expect(s.checkoutReady).toBe(false);
    expect(s.job).toBeNull();
  });
});

describe("onboardingV2.ensureGeneration", () => {
  test("v2-Dokument vorhanden → completed, kein neuer Job", async () => {
    const r = await appRouter.createCaller(ctx()).onboardingV2.ensureGeneration({ token: "tok" });
    expect(r.status).toBe("completed");
    expect(mockedDb.createGenerationJob).not.toHaveBeenCalled();
  });
  test("kein v2-Dokument + kein aktiver Job → neuer Job, v2-Runner gestartet", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({ id: 42, slug: "s", status: "preview", businessId: 7, websiteData: null } as any);
    const r = await appRouter.createCaller(ctx()).onboardingV2.ensureGeneration({ token: "tok" });
    expect(r).toEqual({ jobId: 501, status: "pending" });
    expect(mockedDb.createGenerationJob).toHaveBeenCalledWith({ websiteId: 42, status: "pending", progress: 0 });
    expect(runWebsiteGenerationV2Job).toHaveBeenCalledWith(501, 42);
  });
  test("laufender Job → wird zurückgegeben, kein Doppelstart", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({ id: 42, slug: "s", status: "preview", businessId: 7, websiteData: null } as any);
    mockedDb.getGenerationJobByWebsiteId.mockResolvedValue({ id: 77, status: "processing", progress: 40, error: null } as any);
    const r = await appRouter.createCaller(ctx()).onboardingV2.ensureGeneration({ token: "tok" });
    expect(r).toEqual({ jobId: 77, status: "processing" });
    expect(runWebsiteGenerationV2Job).not.toHaveBeenCalled();
  });
});

describe("onboardingV2.getStyleCandidates", () => {
  test("liefert 2 Kandidaten mit Name/Essenz aus der Registry", async () => {
    const r = await appRouter.createCaller(ctx()).onboardingV2.getStyleCandidates({ token: "tok", round: 0 });
    expect(r.candidates).toHaveLength(2);
    expect(r.candidates[0]).toMatchObject({ id: expect.any(String), name: expect.any(String), essence: expect.any(String) });
  });
});

describe("onboardingV2.selectStylePack", () => {
  test("persistiert Pack + layoutStyle, setzt styleConfirmed, invalidiert Cache, gibt neuen State", async () => {
    const s = await appRouter.createCaller(ctx()).onboardingV2.selectStylePack({ token: "tok", packId: "kanzlei" });
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(42, expect.objectContaining({ layoutStyle: "kanzlei", websiteData: expect.objectContaining({ stylePackId: "kanzlei" }) }));
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(42, expect.objectContaining({ studioProgress: { styleConfirmed: true } }));
    expect(invalidateSsrCache).toHaveBeenCalledWith("preview-brandt");
    expect(s.stylePackId).toBe("kanzlei");
    expect(s.checklist.find(i => i.id === "style")?.status).toBe("done");
  });
  test("unbekanntes Pack → BAD_REQUEST; ohne v2-Dokument → BAD_REQUEST", async () => {
    await expect(appRouter.createCaller(ctx()).onboardingV2.selectStylePack({ token: "tok", packId: "disco" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    mockedDb.getWebsiteByToken.mockResolvedValue({ id: 42, slug: "s", status: "preview", businessId: 7, websiteData: null } as any);
    await expect(appRouter.createCaller(ctx()).onboardingV2.selectStylePack({ token: "tok", packId: "kanzlei" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
```

- [ ] **Step 2: Run — FAIL** (`onboardingV2` existiert nicht am Router)

- [ ] **Step 3: Router implementieren** `server/onboardingV2/router.ts`

```ts
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  createGenerationJob,
  getBusinessById,
  getGenerationJobByWebsiteId,
  getOnboardingByWebsiteId,
  updateOnboarding,
  updateWebsite,
} from "../db";
import { runWebsiteGenerationV2Job } from "../generationV2/runJob";
import { invalidateSsrCache } from "../ssr/routes";
import { assertV2SafeWrite } from "../v2WriteGuard";
import { getConstitution } from "../../shared/stylePacks";
import { getV2VariantCandidates } from "../../shared/stylePacks/variantCandidates";
import {
  deriveChecklistState,
  isCheckoutReady,
  parseStudioProgress,
  type ChecklistItem,
  type StudioProgress,
} from "../../shared/onboardingV2/checklist";
import type { PackId, WebsiteDataV2 } from "../../shared/siteContract/types";
import { applyStylePack, parsePackId } from "./applyPatch";
import { loadStudioWebsite, type StudioWebsite } from "./ownership";

export interface StudioJob {
  id: number;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  error: string | null;
}

export interface StudioState {
  websiteId: number;
  token: string;
  businessName: string;
  category: string;
  stylePackId: PackId | null;
  doc: WebsiteDataV2 | null;
  job: StudioJob | null;
  checklist: ChecklistItem[];
  checkoutReady: boolean;
  customerEmail: string | null;
}

const tokenInput = z.object({ token: z.string().min(1) });

/** Baut den vollständigen Studio-Zustand — eine Quelle der Wahrheit für Client-Reloads (Spec §6). */
async function buildState(token: string, loaded: StudioWebsite): Promise<StudioState> {
  const { website, doc } = loaded;
  const [business, onboarding, job] = await Promise.all([
    getBusinessById(website.businessId),
    getOnboardingByWebsiteId(website.id),
    getGenerationJobByWebsiteId(website.id),
  ]);
  const checklist = deriveChecklistState(doc, {
    legalOwner: onboarding?.legalOwner,
    legalEmail: onboarding?.legalEmail,
    legalStreet: onboarding?.legalStreet,
    legalZip: onboarding?.legalZip,
    legalCity: onboarding?.legalCity,
    studioProgress: parseStudioProgress(onboarding?.studioProgress),
  });
  return {
    websiteId: website.id,
    token,
    businessName: doc?.businessName ?? business?.name ?? "Dein Unternehmen",
    category: doc?.businessCategory ?? business?.category ?? "",
    stylePackId: doc?.stylePackId ?? null,
    doc,
    job: job
      ? { id: job.id, status: job.status, progress: job.progress, error: job.error ?? null }
      : null,
    checklist,
    checkoutReady: isCheckoutReady(checklist, !!website.customerEmail),
    customerEmail: website.customerEmail ?? null,
  };
}

function requireDoc(loaded: StudioWebsite): WebsiteDataV2 {
  if (!loaded.doc) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Die Website wurde noch nicht erstellt — bitte die Generierung abwarten.",
    });
  }
  return loaded.doc;
}

async function mergeStudioProgress(websiteId: number, patch: StudioProgress): Promise<void> {
  const onboarding = await getOnboardingByWebsiteId(websiteId);
  const next = { ...parseStudioProgress(onboarding?.studioProgress), ...patch };
  await updateOnboarding(websiteId, { studioProgress: next, updatedAt: Date.now() });
}

export const onboardingV2Router = router({
  getState: publicProcedure.input(tokenInput).query(async ({ input, ctx }) => {
    const loaded = await loadStudioWebsite(input.token, ctx.user);
    return buildState(input.token, loaded);
  }),

  /**
   * Idempotent: v2-Dokument da → "completed" ohne neuen Job; aktiver Job →
   * zurückgeben; sonst neuen Job anlegen und den v2-Runner im Hintergrund
   * starten (Fehler landen im Job, nicht im Request).
   */
  ensureGeneration: publicProcedure.input(tokenInput).mutation(async ({ input, ctx }) => {
    const { website, doc } = await loadStudioWebsite(input.token, ctx.user);
    if (doc) return { jobId: null, status: "completed" as const };
    const existing = await getGenerationJobByWebsiteId(website.id);
    if (existing && (existing.status === "pending" || existing.status === "processing")) {
      return { jobId: existing.id, status: existing.status };
    }
    const jobId = await createGenerationJob({ websiteId: website.id, status: "pending", progress: 0 });
    runWebsiteGenerationV2Job(jobId, website.id).catch(err =>
      console.error(`[onboardingV2] Job ${jobId} unerwartet abgebrochen:`, err)
    );
    return { jobId, status: "pending" as const };
  }),

  getStyleCandidates: publicProcedure
    .input(tokenInput.extend({ round: z.number().int().min(0).default(0) }))
    .query(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const business = await getBusinessById(loaded.website.businessId);
      const category = loaded.doc?.businessCategory ?? business?.category ?? "";
      const candidates = getV2VariantCandidates(category, input.round).map(id => {
        const c = getConstitution(id);
        return { id, name: c.name, essence: c.essence };
      });
      return { candidates };
    }),

  selectStylePack: publicProcedure
    .input(tokenInput.extend({ packId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const packId = parsePackId(input.packId);
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = requireDoc(loaded);
      const next = applyStylePack(doc, packId);
      assertV2SafeWrite(loaded.website.websiteData, next);
      // layoutStyle nur als Kompatibilitäts-Spiegel für Admin-Listen; v2-Renderer lesen stylePackId.
      await updateWebsite(loaded.website.id, { websiteData: next as any, layoutStyle: packId });
      await mergeStudioProgress(loaded.website.id, { styleConfirmed: true });
      invalidateSsrCache(loaded.website.slug);
      return buildState(input.token, { website: { ...loaded.website, websiteData: next as any }, doc: next });
    }),
});
```
In `server/routers.ts`: `import { onboardingV2Router } from "./onboardingV2/router";` und im `appRouter`-Objekt (z. B. direkt nach `onboarding: router({ … }),`): `onboardingV2: onboardingV2Router,`.

- [ ] **Step 4: Run — PASS**; `npm run check`

- [ ] **Step 5: Commit**

```bash
git add server/onboardingV2/router.ts server/onboardingV2/router.test.ts server/routers.ts
git commit -m "feat: onboardingV2-Router — getState, ensureGeneration, getStyleCandidates, selectStylePack"
```

---

### Task 6: Preview-SSR per Token (`/preview-ssr/:token`)

**Files:**
- Modify: `server/ssr/routes.ts`
- Test: `server/ssr/routes.test.ts` (neue describe-Gruppe)

**Interfaces:**
- Produces: `GET /preview-ssr/:token` und `/preview-ssr/:token/impressum|datenschutz`, optional `?pack=<PackId>` (Override nur für die Darstellung). Antworten: 200 HTML (Header `X-Robots-Tag: noindex, nofollow`, `Cache-Control: no-store`), 404 „Vorschau nicht gefunden" bei unbekanntem Token, 404 „Noch keine Website" wenn kein v2-Dokument, 400 bei unbekanntem `pack`. Kein Cache (immer frisch — das Studio lädt den iframe nach jedem Patch neu).

- [ ] **Step 1: Failing Tests** (an `server/ssr/routes.test.ts` anhängen; das bestehende `vi.mock("../db", …)` um `getWebsiteByToken: vi.fn()` erweitern)

```ts
describe("preview-ssr per Token", () => {
  test("unbekannter Token → 404", async () => {
    (getWebsiteByToken as Mock).mockResolvedValue(undefined);
    const res = await request(buildAppWithFallback()).get("/preview-ssr/abcdefghabcdefgh");
    expect(res.status).toBe(404);
  });
  test("v2-Dokument → 200 HTML, noindex, no-store; Rechtsseiten laufen über basePath", async () => {
    (getWebsiteByToken as Mock).mockResolvedValue({ id: 1, slug: "s", websiteData: getFixture("werkbank", "full") });
    const res = await request(buildAppWithFallback()).get("/preview-ssr/abcdefghabcdefgh");
    expect(res.status).toBe(200);
    expect(res.headers["x-robots-tag"]).toContain("noindex");
    expect(res.headers["cache-control"]).toContain("no-store");
    expect(res.text).toContain('href="/preview-ssr/abcdefghabcdefgh/impressum"');
    const legal = await request(buildAppWithFallback()).get("/preview-ssr/abcdefghabcdefgh/impressum");
    expect(legal.status).toBe(200);
  });
  test("?pack=kanzlei rendert die Inhalte im anderen Pack, ohne zu persistieren", async () => {
    (getWebsiteByToken as Mock).mockResolvedValue({ id: 1, slug: "s", websiteData: getFixture("werkbank", "full") });
    const res = await request(buildAppWithFallback()).get("/preview-ssr/abcdefghabcdefgh?pack=kanzlei");
    expect(res.status).toBe(200);
    expect(res.text).toContain('class="pb-kanzlei');
  });
  test("v1-Dokument → 404, unbekanntes pack → 400", async () => {
    (getWebsiteByToken as Mock).mockResolvedValue({ id: 1, slug: "s", websiteData: { hero: {} } });
    expect((await request(buildAppWithFallback()).get("/preview-ssr/abcdefghabcdefgh")).status).toBe(404);
    (getWebsiteByToken as Mock).mockResolvedValue({ id: 1, slug: "s", websiteData: getFixture("werkbank", "full") });
    expect((await request(buildAppWithFallback()).get("/preview-ssr/abcdefghabcdefgh?pack=disco")).status).toBe(400);
  });
});
```

- [ ] **Step 2: Run — FAIL** (404 aus SPA-Fallback statt 200/400)

- [ ] **Step 3: Implementieren** in `server/ssr/routes.ts`

Import ergänzen: `import { getWebsiteBySlug, getWebsiteByToken } from "../db";`. Handler:
```ts
const PREVIEW_PATHNAMES = new Set(["/", "/impressum", "/datenschutz"]);

/**
 * Studio-Live-Preview: rendert das gespeicherte v2-Dokument per previewToken
 * (Zugangsgeheimnis, nanoid 32) — ungecacht (jeder Patch soll sofort sichtbar
 * sein), noindex, optional mit Pack-Override (?pack=) für Stil-Kandidaten.
 * Der Override verändert NIE das gespeicherte Dokument.
 */
async function handlePreviewSsr(req: Request, res: Response): Promise<void> {
  // Express-Regex-Route (siehe registerSsrRoutes): params[0] = Token, params[1] = Restpfad
  const token = typeof req.params[0] === "string" ? req.params[0] : "";
  const rest = typeof req.params[1] === "string" && req.params[1].length > 0 ? req.params[1] : "/";
  const pathname = rest.startsWith("/") ? rest : `/${rest}`;
  if (!PREVIEW_PATHNAMES.has(pathname)) {
    res.status(404).send("Vorschau-Seite nicht gefunden");
    return;
  }
  const packParam = typeof req.query.pack === "string" ? req.query.pack : "";
  if (packParam && !isKnownPackId(packParam)) {
    res.status(400).send(`Unbekanntes Pack: "${packParam}"`);
    return;
  }
  try {
    const website = await getWebsiteByToken(token);
    if (!website || !website.websiteData) {
      res.status(404).send("Vorschau nicht gefunden");
      return;
    }
    const parsed = WebsiteDataV2Schema.safeParse(website.websiteData);
    if (!parsed.success) {
      res.status(404).send("Noch keine Website im neuen Format");
      return;
    }
    const data = packParam ? { ...parsed.data, stylePackId: packParam as PackId } : parsed.data;
    const origin = `${req.protocol}://${req.get("host") ?? "localhost"}`;
    const basePath = `/preview-ssr/${token}`;
    const { html, status } = renderSiteHtml(data, { origin, pathname, basePath });
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.setHeader("Cache-Control", "no-store");
    res.status(status).type("html").send(html);
  } catch (err) {
    console.error("[SSR] Preview-Render fehlgeschlagen:", err);
    res.status(500).send("Vorschau konnte nicht gerendert werden");
  }
}
```
Registrierung in `registerSsrRoutes` VOR `app.use(handleCustomerSiteSsr)`:
```ts
  app.get(/^\/preview-ssr\/([A-Za-z0-9_-]{16,64})(\/.*)?$/, (req, res) => {
    void handlePreviewSsr(req, res);
  });
```
(Hinweis: Wenn der `?pack=`-Override die Linkfarbe/CTA-Regel in `renderSiteHtml` über `stylePackId` zieht, ist das gewollt — es soll aussehen wie ein echter Pack-Wechsel.)

- [ ] **Step 4: Run — PASS**; `npm run check`

- [ ] **Step 5: Commit**

```bash
git add server/ssr/routes.ts server/ssr/routes.test.ts
git commit -m "feat: Preview-SSR per Token (/preview-ssr/:token, ?pack-Override, noindex, ungecacht)"
```

---

### Task 7: Dev-Seed-Route für Studio-Tests

**Files:**
- Create: `server/onboardingV2/devSeed.ts`
- Modify: `server/_core/index.ts` (Registrierung neben `registerSsrRoutes(app)`)
- Test: `server/onboardingV2/devSeed.test.ts`

**Interfaces:**
- Produces: `GET /dev/studio-seed?pack=<PackId>&fixture=<full|minimal>` (Default werkbank/full), nur `NODE_ENV !== "production"`. Idempotent über Slug `studio-seed-<pack>-<fixture>`: existiert die Website, wird sie wiederverwendet (websiteData auf Fixture zurückgesetzt, Onboarding-Flags geleert); sonst Business (placeId `self-studio-seed-<pack>`), Website (status preview, previewToken nanoid 32, layoutVersion 2), Onboarding-Record. Antwort: 302 → `/onboarding/<token>`. Mit `?json=1`: `{ token, websiteId }` (für Playwright).

- [ ] **Step 1: Failing Test**

```ts
import { beforeEach, describe, expect, test, vi } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../db", () => ({
  getWebsiteBySlug: vi.fn(), upsertBusiness: vi.fn().mockResolvedValue(7),
  createGeneratedWebsite: vi.fn().mockResolvedValue(42), updateWebsite: vi.fn().mockResolvedValue(undefined),
  createOnboarding: vi.fn().mockResolvedValue(1), getOnboardingByWebsiteId: vi.fn().mockResolvedValue(undefined),
  updateOnboarding: vi.fn().mockResolvedValue(undefined),
}));
import * as db from "../db";
import { registerStudioDevSeed } from "./devSeed";
const mockedDb = vi.mocked(db);

function app() { const a = express(); registerStudioDevSeed(a); return a; }

beforeEach(() => { vi.clearAllMocks(); delete process.env.NODE_ENV; });

describe("/dev/studio-seed", () => {
  test("production → 404", async () => {
    process.env.NODE_ENV = "production";
    expect((await request(app()).get("/dev/studio-seed")).status).toBe(404);
  });
  test("neu: legt Business+Website+Onboarding an und leitet ins Studio", async () => {
    mockedDb.getWebsiteBySlug.mockResolvedValue(undefined);
    const res = await request(app()).get("/dev/studio-seed?pack=kanzlei");
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/^\/onboarding\/[A-Za-z0-9_-]{32}$/);
    expect(mockedDb.createGeneratedWebsite).toHaveBeenCalledWith(expect.objectContaining({ slug: "studio-seed-kanzlei-full", status: "preview", layoutVersion: 2 }));
    expect(mockedDb.createOnboarding).toHaveBeenCalled();
  });
  test("vorhanden: setzt Fixture zurück, erzeugt nichts Neues, json=1 liefert Token", async () => {
    mockedDb.getWebsiteBySlug.mockResolvedValue({ id: 42, previewToken: "t".repeat(32) } as any);
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue({ websiteId: 42 } as any);
    const res = await request(app()).get("/dev/studio-seed?pack=werkbank&json=1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ token: "t".repeat(32), websiteId: 42 });
    expect(mockedDb.createGeneratedWebsite).not.toHaveBeenCalled();
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(42, expect.objectContaining({ websiteData: expect.objectContaining({ stylePackId: "werkbank" }) }));
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(42, expect.objectContaining({ studioProgress: {} }));
  });
  test("unbekanntes Pack → 400", async () => {
    expect((await request(app()).get("/dev/studio-seed?pack=disco")).status).toBe(400);
  });
});
```

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implementieren** `server/onboardingV2/devSeed.ts`

```ts
import type { Express, Request, Response } from "express";
import { nanoid } from "nanoid";
import { getFixture } from "../../shared/siteContract/fixtures";
import { PACK_IDS, type PackId } from "../../shared/siteContract/types";
import {
  createGeneratedWebsite, createOnboarding, getOnboardingByWebsiteId,
  getWebsiteBySlug, updateOnboarding, updateWebsite, upsertBusiness,
} from "../db";

/**
 * Nur Entwicklung/Test: legt eine v2-Preview-Website aus einer Fixture an
 * (oder setzt sie zurück) und leitet ins Studio. Macht das Studio ohne
 * LLM-Lauf testbar (Playwright-Baselines, manuelles Durchklicken).
 */
async function handleStudioSeed(req: Request, res: Response): Promise<void> {
  if (process.env.NODE_ENV === "production") { res.status(404).send("Not found"); return; }
  const pack = typeof req.query.pack === "string" ? req.query.pack : "werkbank";
  const fixture = req.query.fixture === "minimal" ? "minimal" : "full";
  if (!(PACK_IDS as readonly string[]).includes(pack)) { res.status(400).send(`Unbekanntes Pack: "${pack}"`); return; }
  const packId = pack as PackId;
  const slug = `studio-seed-${packId}-${fixture}`;
  const doc = { ...getFixture(packId, fixture), slug };

  let websiteId: number; let token: string;
  const existing = await getWebsiteBySlug(slug);
  if (existing && existing.previewToken) {
    websiteId = existing.id; token = existing.previewToken;
    await updateWebsite(websiteId, { websiteData: doc as any, layoutStyle: packId, status: "preview" });
    const onboarding = await getOnboardingByWebsiteId(websiteId);
    if (onboarding) await updateOnboarding(websiteId, { studioProgress: {}, legalOwner: null, legalEmail: null, legalStreet: null, legalZip: null, legalCity: null, updatedAt: Date.now() });
    else await createOnboarding({ websiteId, status: "in_progress", stepCurrent: 0, createdAt: Date.now(), updatedAt: Date.now() });
  } else {
    const businessId = await upsertBusiness({
      name: doc.businessName, slug, placeId: `self-studio-seed-${packId}`,
      category: doc.businessCategory ?? "", address: "", phone: "", email: null,
      googleReviews: null, openingHours: null, rating: null, reviewCount: null,
    });
    token = nanoid(32);
    websiteId = await createGeneratedWebsite({
      businessId, slug, status: "preview", previewToken: token, onboardingStatus: "in_progress",
      source: "external", customerEmail: null, captureStatus: "onboarding_started",
      layoutVersion: 2, layoutStyle: packId, websiteData: doc as any,
    });
    await createOnboarding({ websiteId, status: "in_progress", stepCurrent: 0, createdAt: Date.now(), updatedAt: Date.now() });
  }
  if (req.query.json === "1") { res.json({ token, websiteId }); return; }
  res.redirect(302, `/onboarding/${token}`);
}

export function registerStudioDevSeed(app: Express): void {
  app.get("/dev/studio-seed", (req, res) => {
    handleStudioSeed(req, res).catch(err => {
      console.error("[dev/studio-seed] fehlgeschlagen:", err);
      res.status(500).send(err instanceof Error ? err.message : "Seed fehlgeschlagen");
    });
  });
}
```
(`upsertBusiness`-Signatur vorher mit `grep -n "export async function upsertBusiness" -A6 server/db.ts` prüfen und die Felder exakt daran anpassen.) In `server/_core/index.ts` direkt vor `registerSsrRoutes(app);`: `registerStudioDevSeed(app);` (Import `from "../onboardingV2/devSeed"`).

- [ ] **Step 4: Run — PASS**; `npm run check`; manuell: `PORT=3005 npm run dev` → `curl -I http://localhost:3005/dev/studio-seed?pack=werkbank` liefert 302 mit Location `/onboarding/…` (Server danach stoppen: `lsof -ti :3005 | xargs kill`).

- [ ] **Step 5: Commit**

```bash
git add server/onboardingV2/devSeed.ts server/onboardingV2/devSeed.test.ts server/_core/index.ts
git commit -m "feat: Dev-Seed-Route /dev/studio-seed für Studio-Tests (non-production)"
```

---

### Task 8: Studio-Shell im Client (Route, Zustand, Generierungs-Screen, Checkliste, Preview)

**Files:**
- Create: `client/src/pages/onboarding-v2/studio.css`, `StudioPage.tsx`, `useStudioState.ts`, `GenerationScreen.tsx`, `Checklist.tsx`, `PreviewFrame.tsx`
- Modify: `client/src/App.tsx` (lazy Route `/onboarding/:token`)
- Test: `client/src/pages/onboarding-v2/Checklist.test.tsx`, `client/src/pages/onboarding-v2/GenerationScreen.test.tsx`

**Interfaces:**
- Consumes: `trpc.onboardingV2.getState/ensureGeneration` (Task 5 — Typen via `AppRouter`), `ChecklistItem` (Task 3), Route `/preview-ssr/:token` (Task 6).
- Produces:
  ```ts
  // useStudioState.ts
  export function useStudioState(token: string): { state: StudioState | undefined; isLoading: boolean; error: string | null; refetch: () => void; previewVersion: number; bumpPreview: () => void }
  // Checklist.tsx
  export function Checklist(props: { items: ChecklistItem[]; activeId: ChecklistItemId | null; onSelect: (id: ChecklistItemId) => void }): JSX.Element
  // GenerationScreen.tsx
  export function GenerationScreen(props: { businessName: string; progress: number; status: "pending"|"processing"|"failed"; error: string | null; onRetry: () => void }): JSX.Element
  // PreviewFrame.tsx
  export function PreviewFrame(props: { token: string; version: number; device: "desktop"|"mobile"; packOverride?: PackId }): JSX.Element
  ```
  `StudioPage` rendert: `GenerationScreen` solange `state.doc === null` (und stößt `ensureGeneration` genau einmal an; Polling `getState` alle 1500 ms bis Job completed/failed), danach das Zwei-Spalten-Layout. Panel-Slot: `activeId === "style"` → `<StylePanel>` (Task 9); andere IDs → kleiner Hinweis „Kommt im nächsten Schritt" (Platzhalter bis Plan B2, bewusst sichtbar).

- [ ] **Step 1: Failing Tests (statisches Rendern, kein jsdom)**

`Checklist.test.tsx`:
```tsx
import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { deriveChecklistState } from "../../../../shared/onboardingV2/checklist";
import { Checklist } from "./Checklist";

describe("Checklist", () => {
  test("rendert sechs Punkte in fester Reihenfolge, markiert erledigt/aktiv/pflicht", () => {
    const items = deriveChecklistState(null, { legalOwner: "", studioProgress: { styleConfirmed: true } });
    const html = renderToStaticMarkup(<Checklist items={items} activeId="photos" onSelect={() => {}} />);
    expect(html.match(/class="[^"]*pb-studio-check-item/g)).toHaveLength(6);
    expect(html.indexOf("Stil")).toBeLessThan(html.indexOf("Rechtliches"));
    expect(html).toContain('data-status="done"');
    expect(html).toContain('aria-current="step"');
    expect(html).toContain("Pflicht");
  });
});
```
`GenerationScreen.test.tsx`:
```tsx
import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GenerationScreen } from "./GenerationScreen";

describe("GenerationScreen", () => {
  test("zeigt Firmenname, Fortschritt und Phase", () => {
    const html = renderToStaticMarkup(<GenerationScreen businessName="Schreinerei Brandt" progress={30} status="processing" error={null} onRetry={() => {}} />);
    expect(html).toContain("Schreinerei Brandt");
    expect(html).toContain('aria-valuenow="30"');
    expect(html).toContain("Texte");
  });
  test("failed → Fehlermeldung + Erneut-versuchen-Button", () => {
    const html = renderToStaticMarkup(<GenerationScreen businessName="B" progress={0} status="failed" error="LLM kaputt" onRetry={() => {}} />);
    expect(html).toContain("LLM kaputt");
    expect(html).toContain("Erneut versuchen");
  });
});
```

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Design-Tokens** `client/src/pages/onboarding-v2/studio.css`

Richtung (Spec §9, „ruhiges Arbeits-UI, die Preview ist der Star"): warmes Papier statt Dashboard-Grau, eine Display-Serif für den Firmennamen und die Punktnummern, Preview als „Gerät" auf der Arbeitsfläche mit weichem Schatten; keine Karten-Gitter, keine bunten Akzent-Badges.
```css
.pb-studio {
  --st-canvas: #f3efe7;        /* warmes Papier */
  --st-surface: #fbf9f4;
  --st-ink: #1d1a17;
  --st-muted: #6b645b;
  --st-line: #d9d2c5;
  --st-accent: #1f5f4b;        /* tiefes Grün: "erledigt"/Aktion */
  --st-accent-ink: #ffffff;
  --st-warn: #a4441f;
  --st-display: "Fraunces", Georgia, serif;
  --st-ui: "Instrument Sans", "Inter", system-ui, sans-serif;
  --st-space: clamp(1rem, 0.8rem + 1vw, 1.75rem);
  min-height: 100dvh; background: var(--st-canvas); color: var(--st-ink); font-family: var(--st-ui);
}
.pb-studio-layout { display: grid; grid-template-columns: minmax(320px, 420px) 1fr; min-height: 100dvh; }
.pb-studio-rail { padding: var(--st-space); border-right: 1px solid var(--st-line); background: var(--st-surface); display: flex; flex-direction: column; gap: var(--st-space); }
.pb-studio-stage { position: relative; padding: var(--st-space); display: flex; flex-direction: column; gap: 0.75rem; }
.pb-studio-title { font-family: var(--st-display); font-weight: 500; font-size: clamp(1.5rem, 1.2rem + 1vw, 2rem); line-height: 1.1; letter-spacing: -0.01em; }
.pb-studio-kicker { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--st-muted); }
.pb-studio-check { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.pb-studio-check-item { display: grid; grid-template-columns: 2.25rem 1fr auto; gap: 0.75rem; align-items: start; padding: 0.85rem 0.5rem; border-top: 1px solid var(--st-line); background: transparent; border-left: 0; border-right: 0; border-bottom: 0; text-align: left; width: 100%; cursor: pointer; font: inherit; color: inherit; }
.pb-studio-check-item:last-child { border-bottom: 1px solid var(--st-line); }
.pb-studio-check-item[aria-current="step"] { background: var(--st-canvas); }
.pb-studio-check-item:focus-visible { outline: 2px solid var(--st-accent); outline-offset: -2px; }
.pb-studio-check-num { font-family: var(--st-display); font-size: 1.4rem; line-height: 1; color: var(--st-muted); }
.pb-studio-check-item[data-status="done"] .pb-studio-check-num { color: var(--st-accent); }
.pb-studio-check-title { font-weight: 600; }
.pb-studio-check-hint { font-size: 0.85rem; color: var(--st-muted); margin-top: 0.15rem; }
.pb-studio-check-flag { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--st-warn); align-self: center; }
.pb-studio-check-item[data-status="done"] .pb-studio-check-flag { color: var(--st-accent); }
.pb-studio-device { flex: 1; min-height: 60dvh; border-radius: 14px; background: #fff; box-shadow: 0 30px 60px -30px rgba(29,26,23,0.45), 0 0 0 1px var(--st-line); overflow: hidden; margin: 0 auto; width: 100%; transition: max-width 240ms ease; }
.pb-studio-device[data-device="mobile"] { max-width: 390px; }
.pb-studio-device iframe { width: 100%; height: 100%; min-height: 60dvh; border: 0; display: block; }
.pb-studio-toolbar { display: flex; gap: 0.5rem; align-items: center; justify-content: space-between; }
.pb-studio-seg { display: inline-flex; border: 1px solid var(--st-line); border-radius: 999px; overflow: hidden; }
.pb-studio-seg button { font: inherit; padding: 0.35rem 0.9rem; background: transparent; border: 0; color: var(--st-muted); cursor: pointer; }
.pb-studio-seg button[aria-pressed="true"] { background: var(--st-ink); color: var(--st-surface); }
.pb-studio-btn { font: inherit; font-weight: 600; padding: 0.65rem 1.1rem; border-radius: 999px; border: 1px solid var(--st-ink); background: var(--st-ink); color: var(--st-surface); cursor: pointer; }
.pb-studio-btn[data-variant="ghost"] { background: transparent; color: var(--st-ink); }
.pb-studio-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.pb-studio-gen { min-height: 100dvh; display: grid; place-items: center; padding: var(--st-space); text-align: center; }
.pb-studio-gen-bar { height: 6px; width: min(420px, 80vw); background: var(--st-line); border-radius: 999px; overflow: hidden; margin: 1.25rem auto; }
.pb-studio-gen-bar > span { display: block; height: 100%; background: var(--st-accent); transition: width 400ms ease; }
.pb-studio-tabs { display: none; }
@media (max-width: 1023px) {
  .pb-studio-layout { grid-template-columns: 1fr; }
  .pb-studio-rail { border-right: 0; border-bottom: 1px solid var(--st-line); }
  .pb-studio-tabs { display: inline-flex; }
  .pb-studio-layout[data-tab="preview"] .pb-studio-rail { display: none; }
  .pb-studio-layout[data-tab="edit"] .pb-studio-stage { display: none; }
}
@media (prefers-reduced-motion: reduce) { .pb-studio-device, .pb-studio-gen-bar > span { transition: none; } }
```

- [ ] **Step 4: Komponenten**

`useStudioState.ts`:
```ts
import { useCallback, useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

export function useStudioState(token: string) {
  const [previewVersion, setPreviewVersion] = useState(0);
  const ensure = trpc.onboardingV2.ensureGeneration.useMutation();
  const query = trpc.onboardingV2.getState.useQuery(
    { token },
    {
      // @tanstack/react-query v5: das Argument ist die Query, Daten liegen unter query.state.data
      refetchInterval: query => {
        const data = query.state.data;
        const job = data?.job;
        const running = !data?.doc && (!job || job.status === "pending" || job.status === "processing");
        return running ? 1500 : false;
      },
    }
  );
  const kicked = useRef(false);
  useEffect(() => {
    if (kicked.current || !query.data || query.data.doc) return;
    kicked.current = true;
    ensure.mutate({ token }, { onSuccess: () => query.refetch() });
  }, [query.data, token]); // eslint-disable-line react-hooks/exhaustive-deps
  const bumpPreview = useCallback(() => setPreviewVersion(v => v + 1), []);
  const retry = useCallback(() => { kicked.current = false; ensure.reset(); query.refetch(); }, [ensure, query]);
  return {
    state: query.data,
    isLoading: query.isLoading,
    error: query.error?.message ?? ensure.error?.message ?? null,
    refetch: query.refetch,
    retry,
    previewVersion,
    bumpPreview,
  };
}
```
(package.json: `@tanstack/react-query ^5.90` — daher die Query-Signatur oben.)

`Checklist.tsx`:
```tsx
import type { ChecklistItem, ChecklistItemId } from "@shared/onboardingV2/checklist";

interface ChecklistProps { items: ChecklistItem[]; activeId: ChecklistItemId | null; onSelect: (id: ChecklistItemId) => void }

export function Checklist({ items, activeId, onSelect }: ChecklistProps) {
  return (
    <ol className="pb-studio-check" aria-label="Checkliste">
      {items.map((item, index) => (
        <li key={item.id}>
          <button
            type="button"
            className="pb-studio-check-item"
            data-status={item.status}
            aria-current={activeId === item.id ? "step" : undefined}
            onClick={() => onSelect(item.id)}
          >
            <span className="pb-studio-check-num" aria-hidden="true">{item.status === "done" ? "✓" : String(index + 1).padStart(2, "0")}</span>
            <span>
              <span className="pb-studio-check-title">{item.title}</span>
              <span className="pb-studio-check-hint">{item.hint}</span>
            </span>
            <span className="pb-studio-check-flag">{item.status === "done" ? "Erledigt" : item.required ? "Pflicht" : ""}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}
```

`GenerationScreen.tsx`:
```tsx
const PHASES = ["Stil wird gewählt", "Texte entstehen", "Bilder werden gesetzt", "Vorschau wird gebaut"] as const;

interface GenerationScreenProps { businessName: string; progress: number; status: "pending" | "processing" | "failed"; error: string | null; onRetry: () => void }

export function GenerationScreen({ businessName, progress, status, error, onRetry }: GenerationScreenProps) {
  const phase = PHASES[Math.min(PHASES.length - 1, Math.floor((progress / 100) * PHASES.length))];
  return (
    <section className="pb-studio-gen" aria-live="polite">
      <div>
        <p className="pb-studio-kicker">Deine Website entsteht</p>
        <h1 className="pb-studio-title">{businessName}</h1>
        {status === "failed" ? (
          <>
            <p role="alert" style={{ color: "var(--st-warn)", marginTop: "1rem" }}>{error ?? "Die Generierung ist fehlgeschlagen."}</p>
            <button type="button" className="pb-studio-btn" onClick={onRetry} style={{ marginTop: "1rem" }}>Erneut versuchen</button>
          </>
        ) : (
          <>
            <div className="pb-studio-gen-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
              <span style={{ width: `${Math.max(4, progress)}%` }} />
            </div>
            <p style={{ color: "var(--st-muted)" }}>{phase} — etwa eine Minute.</p>
          </>
        )}
      </div>
    </section>
  );
}
```

`PreviewFrame.tsx`:
```tsx
import type { PackId } from "@shared/siteContract/types";

interface PreviewFrameProps { token: string; version: number; device: "desktop" | "mobile"; packOverride?: PackId }

export function PreviewFrame({ token, version, device, packOverride }: PreviewFrameProps) {
  const params = new URLSearchParams();
  if (packOverride) params.set("pack", packOverride);
  params.set("v", String(version)); // Cache-Bust nach jedem Patch (Server ist ohnehin no-store)
  const src = `/preview-ssr/${token}?${params.toString()}`;
  return (
    <div className="pb-studio-device" data-device={device}>
      <iframe key={src} src={src} title="Live-Vorschau deiner Website" loading="eager" />
    </div>
  );
}
```

`StudioPage.tsx`:
```tsx
import { useState } from "react";
import type { ChecklistItemId } from "@shared/onboardingV2/checklist";
import { useStudioState } from "./useStudioState";
import { GenerationScreen } from "./GenerationScreen";
import { Checklist } from "./Checklist";
import { PreviewFrame } from "./PreviewFrame";
import "./studio.css";
// Task 9 ergänzt hier: import { StylePanel } from "./panels/StylePanel";

export default function StudioPage({ token }: { token: string }) {
  const studio = useStudioState(token);
  const [activeId, setActiveId] = useState<ChecklistItemId | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  if (studio.isLoading && !studio.state) return <div className="pb-studio pb-studio-gen"><p>Lade dein Studio …</p></div>;
  if (!studio.state) return <div className="pb-studio pb-studio-gen"><p role="alert">{studio.error ?? "Diese Vorschau konnte nicht geladen werden."}</p></div>;

  const { state } = studio;
  if (!state.doc) {
    const job = state.job;
    return (
      <div className="pb-studio">
        <GenerationScreen
          businessName={state.businessName}
          progress={job?.progress ?? 5}
          status={job?.status === "failed" ? "failed" : job?.status === "processing" ? "processing" : "pending"}
          error={job?.error ?? studio.error}
          onRetry={studio.retry}
        />
      </div>
    );
  }

  return (
    <div className="pb-studio">
      <div className="pb-studio-layout" data-tab={tab}>
        <aside className="pb-studio-rail">
          <header>
            <p className="pb-studio-kicker">Pageblitz Studio</p>
            <h1 className="pb-studio-title">{state.businessName}</h1>
          </header>
          <div className="pb-studio-seg pb-studio-tabs" role="tablist" aria-label="Ansicht">
            <button type="button" aria-pressed={tab === "edit"} onClick={() => setTab("edit")}>Bearbeiten</button>
            <button type="button" aria-pressed={tab === "preview"} onClick={() => setTab("preview")}>Vorschau</button>
          </div>
          {activeId ? (
            <section aria-label="Bereich">
              <p className="pb-studio-kicker">{state.checklist.find(i => i.id === activeId)?.title}</p>
              <p style={{ color: "var(--st-muted)" }}>Dieser Bereich kommt im nächsten Schritt.</p>
              <button type="button" className="pb-studio-btn" data-variant="ghost" onClick={() => setActiveId(null)}>Zurück</button>
            </section>
          ) : (
            <Checklist items={state.checklist} activeId={activeId} onSelect={setActiveId} />
          )}
        </aside>
        <main className="pb-studio-stage">
          <div className="pb-studio-toolbar">
            <div className="pb-studio-seg" aria-label="Gerät">
              <button type="button" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}>Desktop</button>
              <button type="button" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")}>Mobil</button>
            </div>
            <a className="pb-studio-btn" data-variant="ghost" href={`/preview-ssr/${token}`} target="_blank" rel="noreferrer">In neuem Tab öffnen</a>
          </div>
          <PreviewFrame token={token} version={studio.previewVersion} device={device} />
        </main>
      </div>
    </div>
  );
}
```
`App.tsx`: `const StudioPage = lazy(() => import("./pages/onboarding-v2/StudioPage"));` und neben den Onboarding-Routen: `<Route path="/onboarding/:token">{(params) => <StudioPage token={params.token} />}</Route>`.

- [ ] **Step 5: Run — PASS** (`npx vitest run client/src/pages/onboarding-v2`); `npm run check`; manuell: `PORT=3005 npm run dev`, `http://localhost:3005/dev/studio-seed?pack=werkbank` → Studio mit Preview; Server stoppen.

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/onboarding-v2 client/src/App.tsx
git commit -m "feat: Studio-Shell — Route /onboarding/:token, Generierungs-Screen, Checkliste, Live-Preview"
```

---

### Task 9: Stil-Panel (Kandidaten, Mini-Previews, Wechsel)

**Files:**
- Create: `client/src/pages/onboarding-v2/panels/StylePanel.tsx`
- Modify: `client/src/pages/onboarding-v2/studio.css` (Panel-Klassen), `client/src/pages/onboarding-v2/StudioPage.tsx` (StylePanel-Verdrahtung)
- Test: `client/src/pages/onboarding-v2/panels/StylePanel.test.tsx`

**Interfaces:**
- Consumes: `trpc.onboardingV2.getStyleCandidates`, `trpc.onboardingV2.selectStylePack` (Task 5); `/preview-ssr/:token?pack=` (Task 6).
- Produces: `StylePanel(props: { token: string; currentPackId: PackId | null; category: string; onApplied: () => void; onClose: () => void })` + reine Darstellungskomponente `StyleCandidateList(props: { token: string; candidates: { id: PackId; name: string; essence: string }[]; currentPackId: PackId | null; busyId: PackId | null; onPick: (id: PackId) => void })`.

- [ ] **Step 1: Failing Test (statisch, für die reine Liste)**

```tsx
import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StyleCandidateList } from "./StylePanel";

describe("StyleCandidateList", () => {
  test("rendert je Kandidat Mini-Preview (iframe mit ?pack=), Name, Essenz; aktuelles Pack markiert", () => {
    const html = renderToStaticMarkup(
      <StyleCandidateList token={"t".repeat(32)} currentPackId="werkbank" busyId={null} onPick={() => {}}
        candidates={[{ id: "werkbank", name: "Werkbank", essence: "Robust." }, { id: "kanzlei", name: "Kanzlei", essence: "Seriös." }]} />
    );
    expect(html).toContain(`/preview-ssr/${"t".repeat(32)}?pack=werkbank`);
    expect(html).toContain(`/preview-ssr/${"t".repeat(32)}?pack=kanzlei`);
    expect(html).toContain("Kanzlei");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("Aktuell");
  });
});
```

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implementieren**

CSS ergänzen (studio.css):
```css
.pb-studio-panel { display: flex; flex-direction: column; gap: 1rem; }
.pb-studio-cands { display: grid; gap: 0.85rem; }
.pb-studio-cand { display: grid; gap: 0.5rem; padding: 0.6rem; border: 1px solid var(--st-line); border-radius: 12px; background: var(--st-canvas); text-align: left; font: inherit; color: inherit; cursor: pointer; }
.pb-studio-cand[aria-pressed="true"] { border-color: var(--st-accent); box-shadow: 0 0 0 2px color-mix(in oklab, var(--st-accent) 25%, transparent); }
.pb-studio-cand:focus-visible { outline: 2px solid var(--st-accent); outline-offset: 2px; }
.pb-studio-thumb { position: relative; aspect-ratio: 16 / 10; overflow: hidden; border-radius: 8px; background: #fff; border: 1px solid var(--st-line); }
.pb-studio-thumb iframe { position: absolute; inset: 0; width: 400%; height: 400%; transform: scale(0.25); transform-origin: 0 0; border: 0; pointer-events: none; }
.pb-studio-cand-name { font-weight: 600; display: flex; justify-content: space-between; gap: 0.5rem; }
.pb-studio-cand-ess { font-size: 0.85rem; color: var(--st-muted); }
```
`panels/StylePanel.tsx`:
```tsx
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import type { PackId } from "@shared/siteContract/types";

interface Candidate { id: PackId; name: string; essence: string }

interface StyleCandidateListProps { token: string; candidates: Candidate[]; currentPackId: PackId | null; busyId: PackId | null; onPick: (id: PackId) => void }

export function StyleCandidateList({ token, candidates, currentPackId, busyId, onPick }: StyleCandidateListProps) {
  return (
    <div className="pb-studio-cands" role="group" aria-label="Stil-Kandidaten">
      {candidates.map(c => {
        const isCurrent = c.id === currentPackId;
        return (
          <button key={c.id} type="button" className="pb-studio-cand" aria-pressed={isCurrent} disabled={busyId !== null} onClick={() => onPick(c.id)}>
            <span className="pb-studio-thumb" aria-hidden="true">
              <iframe src={`/preview-ssr/${token}?pack=${c.id}`} title={`Vorschau ${c.name}`} tabIndex={-1} loading="lazy" />
            </span>
            <span className="pb-studio-cand-name">
              <span>{c.name}</span>
              <span className="pb-studio-kicker">{isCurrent ? "Aktuell" : busyId === c.id ? "Wird übernommen…" : ""}</span>
            </span>
            <span className="pb-studio-cand-ess">{c.essence}</span>
          </button>
        );
      })}
    </div>
  );
}

interface StylePanelProps { token: string; currentPackId: PackId | null; category: string; onApplied: () => void; onClose: () => void }

export function StylePanel({ token, currentPackId, onApplied, onClose }: StylePanelProps) {
  const [round, setRound] = useState(0);
  const [busyId, setBusyId] = useState<PackId | null>(null);
  const candidates = trpc.onboardingV2.getStyleCandidates.useQuery({ token, round });
  const select = trpc.onboardingV2.selectStylePack.useMutation();

  const pick = (id: PackId) => {
    setBusyId(id);
    select.mutate({ token, packId: id }, { onSettled: () => setBusyId(null), onSuccess: () => onApplied() });
  };

  return (
    <section className="pb-studio-panel" aria-label="Stil wählen">
      <div>
        <p className="pb-studio-kicker">Schritt 1</p>
        <h2 className="pb-studio-title" style={{ fontSize: "1.4rem" }}>Welcher Stil passt zu dir?</h2>
        <p style={{ color: "var(--st-muted)" }}>Deine Inhalte bleiben gleich — nur der Look wechselt. Du kannst jederzeit zurück.</p>
      </div>
      {candidates.isLoading && <p>Lade Vorschläge …</p>}
      {candidates.error && <p role="alert" style={{ color: "var(--st-warn)" }}>{candidates.error.message}</p>}
      {candidates.data && (
        <StyleCandidateList token={token} candidates={candidates.data.candidates} currentPackId={currentPackId} busyId={busyId} onPick={pick} />
      )}
      {select.error && <p role="alert" style={{ color: "var(--st-warn)" }}>{select.error.message}</p>}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button type="button" className="pb-studio-btn" data-variant="ghost" onClick={() => setRound(r => r + 1)}>Andere zeigen</button>
        <button type="button" className="pb-studio-btn" onClick={onClose}>Passt so</button>
      </div>
    </section>
  );
}
```
Verdrahtung in `StudioPage.tsx` (Task 8 hat den Platzhalter gelassen): Import `import { StylePanel } from "./panels/StylePanel";` aktivieren, `const selectMutation = trpc.onboardingV2.selectStylePack.useMutation();` (Import `trpc` aus `@/lib/trpc`) ergänzen und den Panel-Slot so erweitern:
```tsx
          {activeId === "style" ? (
            <StylePanel
              token={token}
              currentPackId={state.stylePackId}
              category={state.category}
              onApplied={() => { studio.refetch(); studio.bumpPreview(); }}
              onClose={() => {
                // „Passt so" = Bestätigung des aktuellen Packs → Punkt wird "done"
                if (state.stylePackId) {
                  selectMutation.mutate(
                    { token, packId: state.stylePackId },
                    { onSuccess: () => { studio.refetch(); studio.bumpPreview(); } }
                  );
                }
                setActiveId(null);
              }}
            />
          ) : activeId ? (
            <section aria-label="Bereich"> … (Platzhalter aus Task 8 unverändert) … </section>
          ) : (
            <Checklist items={state.checklist} activeId={activeId} onSelect={setActiveId} />
          )}
```

- [ ] **Step 4: Run — PASS**; `npm run check`; manuell im Dev-Server: Kandidat anklicken → Preview wechselt, Checkliste zeigt „Stil ✓".

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/onboarding-v2
git commit -m "feat: Stil-Panel — Kandidaten mit Mini-Previews, Pack-Wechsel, Bestätigung"
```

---

### Task 10: Visueller Checkpoint (Playwright-Baselines Studio) + Doku

**Files:**
- Create: `tests/visual/studio.spec.ts`
- Modify: `docs/superpowers/specs/2026-08-21-flag-aktivierung.md` (Abschnitt „Onboarding v2 / Studio": DB-Migration `studioProgress`, Dev-Seed nur non-production, Preview-SSR-Route)

**Interfaces:** nutzt `/dev/studio-seed?pack=werkbank&json=1` (Task 7) und `/onboarding/:token` (Task 8/9).

- [ ] **Step 1: Spec schreiben**

```ts
import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobil", width: 320, height: 900 },
  { name: "tablet", width: 768, height: 1000 },
  { name: "desktop", width: 1440, height: 900 },
];

test.describe("Studio", () => {
  for (const vp of VIEWPORTS) {
    test(`Checkliste + Preview ${vp.name}`, async ({ page, request }) => {
      const seed = await request.get("/dev/studio-seed?pack=werkbank&fixture=full&json=1");
      const { token } = (await seed.json()) as { token: string };
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`/onboarding/${token}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot(`studio-checklist-${vp.name}.png`, { fullPage: true });
    });
  }
  test("Stil-Panel desktop", async ({ page, request }) => {
    const seed = await request.get("/dev/studio-seed?pack=werkbank&fixture=full&json=1");
    const { token } = (await seed.json()) as { token: string };
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/onboarding/${token}`);
    await page.getByRole("button", { name: /Stil/ }).first().click();
    await expect(page.getByRole("group", { name: "Stil-Kandidaten" })).toBeVisible();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("studio-style-panel-desktop.png", { fullPage: true });
  });
});
```
Hinweis: Die Stage-Preview (iframe auf werkbank/full) ist deterministisch (keine datumsabhängigen Elemente in werkbank). Falls Mini-Preview-iframes im Stil-Panel flackern, `animations: "disabled"` ergänzen und den Screenshot auf `page.locator(".pb-studio-rail")` beschränken.

- [ ] **Step 2: Baselines erzeugen (doppelt laufen lassen = Determinismus-Check)**

Run: `npx playwright test tests/visual/studio.spec.ts --update-snapshots && npx playwright test tests/visual/studio.spec.ts`
Expected: zweiter Lauf PASS ohne Diffs. (Playwright startet den Dev-Server auf 3005 selbst; vorher `lsof -ti :3005` leer.)

- [ ] **Step 3: Aktivierungs-Doku ergänzen** — neuer Abschnitt am Ende von `docs/superpowers/specs/2026-08-21-flag-aktivierung.md`:
  - „Onboarding v2 (Studio) — Vorbereitung": `npm run db:push` auf dem VPS (Spalte `onboarding_responses.studioProgress`), Route `/preview-ssr/:token` ist öffentlich erreichbar (Token = Geheimnis, noindex, no-store), `/dev/studio-seed` existiert nur außerhalb production, StartPage führt bis Plan B3 weiter in den alten Chat.

- [ ] **Step 4: Commit**

```bash
git add tests/visual/studio.spec.ts tests/visual/studio.spec.ts-snapshots docs/superpowers/specs/2026-08-21-flag-aktivierung.md
git commit -m "test: Studio-Visual-Baselines (3 Breakpoints + Stil-Panel) + Aktivierungs-Doku Studio"
```

---

## Abschluss Plan B1

- `npx vitest run` — nur die bekannten env-Fails; `npm run check` grün; `npx playwright test` (Packs + Studio) grün.
- Screenshots aus `tests/visual/studio.spec.ts-snapshots/` dem User als **Mockup-Checkpoint** zeigen (Spec §9) — Freigabe der Studio-Designrichtung VOR Plan B2 (Panels Fotos/Texte/Angebot/Rechtliches/Add-ons, KI-Chat, Checkout).
