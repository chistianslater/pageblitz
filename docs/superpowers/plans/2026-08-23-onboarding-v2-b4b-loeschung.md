# Plan B4b: Löschung des v1-Systems — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nach dem Cutover (B4a, main 4819b28) alle v1-Flächen entfernen — Chat, v1-Layouts/Renderer, v1-Generierung, v1-Prozeduren, Templates-Cluster, v1-Tests — ohne dass Studio, SSR, Dashboard, Admin oder Outreach Funktion verlieren.

**Architecture:** Reine Subtraktion in testbaren Schritten (tsc + vitest + Playwright nach jedem Task). Zwei kleine Rewrites sind nötig, bevor gelöscht werden kann: `SitePage`/`WebsiteRenderer` werden v2-only (CSR-Fallback rendert `SiteRenderer`, Legacy-Dokumente zeigen einen Platzhalter), und `website.generate` (Admin) erzeugt Website + Job über die v2-Pipeline statt synchron v1. Alles andere ist Löschen + Importe/Routen/SPA-Liste/Nav nachziehen.

**Tech Stack:** React 19, TypeScript strict, Vite 7, Express 4, tRPC 11, Drizzle/MySQL, Vitest (node env; Client-Tests via `renderToStaticMarkup`, `import React from "react"` nötig), Playwright (`tests/visual/`, PORT 3005, `--workers=1 --reporter=line`, separate kurze Befehle).

**Spec:** `docs/superpowers/specs/2026-08-22-cutover-design.md` (§2.5, §2.7, §4) · Lösch-Grundlage: `.superpowers/b4-inventar-delta.md` (Stand 4819b28, §5 „Korrigierte Löschreihenfolge") · Original-Inventar `.superpowers/b4-inventar.md`.

## Global Constraints

- Branch `onboarding-v2` (= main zu Beginn); nach jedem Task Commit mit explizitem Pathspec (`git rm` für Löschungen), nie `git add -A`/`-a`; Prettier-Hook-Reformatierungen fremder Dateien nicht mitcommitten (falls berührte Dateien massiv reformatiert werden → separater `chore:`-Commit vor dem Feature-Commit).
- Gate je Task: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -c "error TS"` darf nur **sinken** (Baseline 40; Liste vorher sichern, neue Fehler = Blocker); `npx vitest run` grün bis auf bekannte Env-Fails (4× `server/contrast.test.ts`, 2× `server/resend.test.ts`, 2 Stripe-Env-Suiten `auth.logout`/`pageblitz` ohne `STRIPE_SECRET_KEY`); Playwright-Baselines unverändert: `tests/visual/packs.spec.ts` 84/84, `studio.spec.ts` 8/8, `islands.spec.ts` 4/4, `landing.spec.ts` 1/1, `startpage-to-studio.spec.ts` 1/1 (nur die vom Task betroffenen Specs laufen lassen; Task 6 läuft alle).
- Vor JEDER Löschung: `grep -rn "<Name>" client server shared scripts tests` → 0 Treffer außerhalb der zu löschenden Dateien selbst (Kommentare zählen nicht). Aufrufer in Dateien, die im selben Task gelöscht werden, zählen nicht.
- **Behalten (Spec/Delta §4):** `layout_counters`-Tabelle + `getNextLayoutForIndustry` (`server/db.ts`, von `server/generationV2/selectPack.ts` genutzt) · `client/src/components/StockPhotoSearch.tsx` + `onboarding.searchStockPhotos` · `getIndustryImages`/`getHeroImageUrl`/`getGalleryImages`/`getContrastColor` (`server/industryImages.ts`; `shared/industryImages.ts`) · alle `onboarding_responses`-Spalten · `withOnColors` (`shared/layoutConfig.ts`) · `SSR_SITES`-Flag · `PB_LLM_MOCK` · `generation_jobs` · alle `customer.*`-Prozeduren außer den in B4a gelöschten · `onboarding.getStepEvents` (Admin-Funnel-Auswertung, LeadsPage/WebsitesPage) · `onboarding.regenerateLegalPages` (LegalPage) · `selfService.start`/`captureEmail` (StartPage/WelcomeBack) · `server/onboardingUpload.ts` (v2 PhotosPanel via `routerContent.ts`) · `server/legalGenerator.ts` · `server/_core/stockPhotos.ts` · `server/onboardingV2Patch.ts` (`applyOnboardingToV2`, genutzt von `routerCommerce.ts`/`generationV2/facts.ts`).
- **DB-Spalten/-Tabellen werden NICHT gedroppt** (B4c). Code darf Spalten wie `layoutStyle`, `layoutVersion`, `colorScheme`, `heroImageUrl`, `template_uploads` einfach nicht mehr beschreiben/lesen; Drizzle-Schema bleibt unverändert.
- Keine neuen Features, kein Redesign. Texte deutsch. Commit-Format `<typ>: <beschreibung>` (deutsch, ohne Co-Authored-By).
- Neu geschriebene Dateien < 400 Zeilen.
- Port 3000 gehört einem fremden Prozess — niemals killen. Dev/Playwright auf 3005. Lokale DB: Docker `pageblitz-mysql` (`docker ps`; sonst `colima start && docker start pageblitz-mysql`).

---

### Task 1: SitePage + WebsiteRenderer v2-only (R1) und v1-Preview-Seiten

**Files:**
- Modify: `client/src/pages/SitePage.tsx` (203 Zeilen → ~120)
- Modify: `client/src/components/WebsiteRenderer.tsx` (188 → ~40)
- Create: `client/src/components/site/LegacySitePlaceholder.tsx`
- Delete: `client/src/pages/PreviewPage.tsx` (unreferenziert seit B4a), `client/src/pages/LayoutPreviewStandalone.tsx` (+ Route `/layout-preview/:key` in `client/src/App.tsx` Z. ~233–236, lazy-Import Z. ~37–39, SPA-Regex `/^\/layout-preview\/[^/]+$/` in `server/_core/static.ts` + `server/_core/static.test.ts`)
- Test: `client/src/components/WebsiteRenderer.test.tsx` (neu), `client/src/components/site/LegacySitePlaceholder.test.tsx` (neu)

**Interfaces:**
- Consumes: `parseV2(websiteData)` aus `client/src/components/site/isV2.ts` (liefert `WebsiteDataV2 | null`), `SiteRenderer({ data, slug, packOverride?, islandsMode? })` aus `client/src/components/site/SiteRenderer.tsx`, `AgeGate`, `CookieBanner` (bleiben).
- Produces: `WebsiteRenderer({ websiteData: unknown, slug?, packOverride?, islandsMode? })` — nur noch diese Props; `LegacySitePlaceholder({ businessName? })`.

Hintergrund: In Produktion liefert die SSR-Middleware (`server/ssr/routes.ts`, `SSR_SITES !== "off"`) v2-Seiten direkt; `SitePage` ist nur CSR-Fallback (SSR aus, Subdomain-SPA-Fallback, v1-Dokumente). Nach B4b rendert der Fallback v2 über `SiteRenderer` (Inseln im Live-Modus ersetzen `ChatWidget`/`BookingWidget`), v1-Dokumente bekommen einen Platzhalter. `AgeGate` und `CookieBanner` bleiben im CSR-Pfad (Spalte `requiresAgeGate`, Umami-Consent). `OnboardingChat.tsx` importiert `WebsiteRenderer` mit v1-Props — es wird in **Task 3** gelöscht; damit Task 1 tsc-sauber bleibt, wird `OnboardingChat.tsx` (+ `client/src/components/MacbookMockup.tsx`, nur von ihm genutzt) **bereits hier** mitgelöscht, falls `grep -n "<WebsiteRenderer" client/src/pages/OnboardingChat.tsx` Treffer zeigt (Datei ist seit B4a nicht mehr geroutet — App.tsx importiert sie nicht). Im Commit-Text vermerken.

- [ ] **Step 1: Failing tests schreiben**

`client/src/components/site/LegacySitePlaceholder.test.tsx`:
```tsx
import React from "react";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LegacySitePlaceholder } from "./LegacySitePlaceholder";

describe("LegacySitePlaceholder", () => {
  test("zeigt Hinweis und Business-Namen", () => {
    const html = renderToStaticMarkup(<LegacySitePlaceholder businessName="Schreinerei Brandt" />);
    expect(html).toContain("Schreinerei Brandt");
    expect(html).toContain("wird gerade aktualisiert");
  });
  test("funktioniert ohne Namen", () => {
    const html = renderToStaticMarkup(<LegacySitePlaceholder />);
    expect(html).toContain("wird gerade aktualisiert");
  });
});
```

`client/src/components/WebsiteRenderer.test.tsx` (Export/Pfad von `getFixture` in `shared/siteContract/fixtures.ts` und das Namensfeld des Fixtures — z. B. `data.business.name` — vorher prüfen und anpassen):
```tsx
import React from "react";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import WebsiteRenderer from "./WebsiteRenderer";
import { getFixture } from "@shared/siteContract/fixtures";

describe("WebsiteRenderer (v2-only)", () => {
  test("v2-Dokument → SiteRenderer rendert Business-Namen", () => {
    const data = getFixture("werkbank", "minimal");
    const html = renderToStaticMarkup(<WebsiteRenderer websiteData={data} slug="test" />);
    expect(html).toContain(data.business.name);
  });
  test("v1-/ungültiges Dokument → Platzhalter statt Absturz", () => {
    const html = renderToStaticMarkup(
      <WebsiteRenderer websiteData={{ businessName: "Alt GmbH", sections: [] } as any} slug="alt" />
    );
    expect(html).toContain("wird gerade aktualisiert");
    expect(html).toContain("Alt GmbH");
  });
});
```

- [ ] **Step 2: Tests laufen lassen → FAIL**

Run: `npx vitest run client/src/components/WebsiteRenderer.test.tsx client/src/components/site/LegacySitePlaceholder.test.tsx`
Expected: FAIL (Modul `LegacySitePlaceholder` fehlt; WebsiteRenderer verlangt v1-Props).

- [ ] **Step 3: `LegacySitePlaceholder.tsx` anlegen**

```tsx
import React from "react";

/**
 * CSR-Fallback für Websites, deren websiteData noch im alten v1-Format liegt
 * (kein v2-Vertrag). Seit dem Cutover gibt es keinen v1-Renderer mehr; solche
 * Previews werden beim Öffnen des Studios neu erzeugt (ensureGeneration/force).
 */
export function LegacySitePlaceholder({ businessName }: { businessName?: string | null }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">
          {businessName ? `${businessName} — ` : ""}Diese Website wird gerade aktualisiert.
        </h1>
        <p className="mt-3 text-neutral-600">Bitte in wenigen Minuten erneut laden.</p>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: `WebsiteRenderer.tsx` auf v2-only kürzen**

Ersetze die gesamte Datei durch:
```tsx
import React from "react";
import type { PackId } from "@shared/siteContract/types";
import { parseV2 } from "./site/isV2";
import { SiteRenderer } from "./site/SiteRenderer";
import { LegacySitePlaceholder } from "./site/LegacySitePlaceholder";
import "./site/packs/index";

interface WebsiteRendererProps {
  websiteData: unknown;
  slug?: string;
  packOverride?: PackId;
  islandsMode?: "live" | "preview";
}

/**
 * Dünner Wrapper: seit dem Cutover (Plan B4b) gibt es nur noch den v2-Pfad.
 * Ungültige/alte Dokumente rendern einen Platzhalter statt eines v1-Layouts.
 */
export default function WebsiteRenderer({ websiteData, slug, packOverride, islandsMode }: WebsiteRendererProps) {
  const v2 = parseV2(websiteData);
  if (!v2) {
    const name = (websiteData as { businessName?: string } | null)?.businessName ?? null;
    return <LegacySitePlaceholder businessName={name} />;
  }
  return <SiteRenderer data={v2} packOverride={packOverride} slug={slug} islandsMode={islandsMode} />;
}
```
Der bisherige Re-Export `CURRENT_LAYOUT_VERSION` entfällt (`grep -rn "CURRENT_LAYOUT_VERSION" client/src` → darf außer `layoutConfig.ts` selbst keine Client-Treffer haben; `routers.ts` importiert direkt aus `@shared/layoutConfig`).

- [ ] **Step 5: `SitePage.tsx` umbauen**

Entferne die Importe `ChatWidget`, `BookingWidget`, `AnimatePresence`, `WebsiteData`, `ColorScheme`, `convertOpeningHoursToGerman`, den `bookingOpen`-State und alle Booking-/Chat-Blöcke. Render-Teil:
```tsx
  const w = data.website as { requiresAgeGate?: boolean | null; websiteData: unknown };
  const business = data.business;
  const primaryColor = "#111111";

  return (
    <>
      {w.requiresAgeGate && <AgeGate slug={effectiveSlug} businessName={business?.name} />}
      <WebsiteRenderer websiteData={w.websiteData} slug={effectiveSlug} islandsMode="live" />
      <CookieBanner slug={effectiveSlug} primaryColor={primaryColor} />
    </>
  );
```
SEO-Effekt: `wd?.businessName`/`tagline`/`description`/`heroImageUrl` stammen aus v1 — ersetze durch v2-Felder (`parseV2(w.websiteData)?.business.name`, SEO-Felder laut `shared/siteContract/schema.ts` — prüfen, was existiert; Fallback wie bisher auf `business.name`/Kategorie/Stadt). Falls `CookieBanner`/`AgeGate` eine Markenfarbe sollen: Akzent aus `getConstitution(v2.packId).palette` wie in `client/src/components/landing/PackShowcase.tsx` `getAccentColor` — sonst `#111111`.

- [ ] **Step 6: Tote Preview-Seiten löschen** — `git rm client/src/pages/PreviewPage.tsx client/src/pages/LayoutPreviewStandalone.tsx` (+ ggf. `OnboardingChat.tsx`, `MacbookMockup.tsx`, s. o.), Route `/layout-preview/:key` + lazy-Import aus `App.tsx`, Regex aus `static.ts`, Test in `static.test.ts` auf `isSpaRoute("/layout-preview/x") === false` drehen.

- [ ] **Step 7: Tests grün, tsc, Playwright**

Run: `npx vitest run client/src/components server/_core` → PASS. `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -c "error TS"` → ≤ 40. `npx playwright test tests/visual/islands.spec.ts --workers=1 --reporter=line` → 4/4 und `tests/visual/studio.spec.ts` → 8/8.

- [ ] **Step 8: Commit**

```bash
git add client/src/pages/SitePage.tsx client/src/components/WebsiteRenderer.tsx client/src/components/site/LegacySitePlaceholder.tsx client/src/components/WebsiteRenderer.test.tsx client/src/components/site/LegacySitePlaceholder.test.tsx client/src/App.tsx server/_core/static.ts server/_core/static.test.ts
git commit -m "refactor: SitePage/WebsiteRenderer v2-only — CSR-Fallback über SiteRenderer, Legacy-Platzhalter, v1-Preview-Seiten entfernt"
```
(`git rm` hat die Löschungen bereits gestaged.)

---

### Task 2: Totes Zeug (risikofrei)

**Files:**
- Delete: `client/src/pages/ComponentShowcase.tsx`, `client/src/pages/CustomerProfilePage.tsx`, `client/src/pages/OnboardingWizard.tsx` (+ lazy-Import `client/src/App.tsx:30`), `client/src/pages/TemplatesPage.tsx`, `client/src/components/layouts/PremiumLayout.tsx`, `FreshLayout.tsx`, `CraftLayout.tsx`, `TrustLayout.tsx`
- Modify: `server/routers.ts` — löschen: `mapCategoryToIndustryKey` (~Z. 1011), `buildVerifiedStats` (~1536), `onboarding.findEmail`, `onboarding.uploadPhoto` (nur wenn `grep -rn "onboarding.uploadPhoto" client/src` leer — v2 lädt über `onboardingV2.*`), `selfService.testEmail`, und den **v1-Rumpf von `runWebsiteGeneration`** (alles nach `if (V1_BODY_DISABLED) { return … }` bis Funktionsende, ~Z. 1668–2074) — die Funktion wird zum Dreizeiler; Konstante `V1_BODY_DISABLED` und Kommentar entfallen.
- Modify: `shared/layoutConfig.ts` — löschen: `LAYOUT_FALLBACK_IMAGES`, `SANS_ONLY_INDUSTRIES` + `prefersSansSerif` (nur falls 0 Treffer außerhalb), `LayoutFontConfig`/`LAYOUT_FONTS`/`LAYOUT_FONTS_DEFAULT`/`getLayoutFonts`/`getLLMFontPrompt`/`FORBIDDEN_BODY_FONTS`/`DESIGN_TOKEN_CONFIG` NUR, wenn ihre Aufrufer in `routers.ts` mit dem v1-Rumpf verschwinden (sonst Task 4).
- Modify: `shared/types.ts` — löschen `AVAILABLE_ADDONS`, `Addon` (0 externe Referenzen laut Delta; verifizieren).
- Test: `server/routers.v2Guards.test.ts` (Tests, die den v1-Rumpf/`V1_BODY_DISABLED` referenzieren, anpassen).

**Interfaces:** `runWebsiteGeneration(jobId: number, websiteId: number): Promise<void>` bleibt exportiert (Aufrufer `selfService.generateWebsiteAsync`/`outreach.queueBusinesses` bis Task 3/4).

- [ ] **Step 1: Referenz-Check je Name**
```bash
for n in ComponentShowcase CustomerProfilePage OnboardingWizard TemplatesPage PremiumLayout FreshLayout CraftLayout TrustLayout mapCategoryToIndustryKey buildVerifiedStats findEmail testEmail LAYOUT_FALLBACK_IMAGES SANS_ONLY_INDUSTRIES prefersSansSerif AVAILABLE_ADDONS; do echo "== $n"; grep -rn "$n" client server shared scripts tests | grep -v "^client/src/pages/$n.tsx\|^client/src/components/layouts/$n.tsx"; done
```
Alles außer Selbstreferenzen/Kommentaren/Aufrufern in hier gelöschten Dateien muss leer sein. Abweichungen → Name NICHT löschen, im Bericht „verschoben nach Task 4".
- [ ] **Step 2: Dateien löschen** (`git rm`), `App.tsx` lazy-Import `OnboardingWizard` entfernen.
- [ ] **Step 3: `routers.ts` kürzen** — `runWebsiteGeneration`:
```ts
export async function runWebsiteGeneration(jobId: number, websiteId: number): Promise<void> {
  // Seit dem Cutover (B4a) läuft jede Generierung über die v2-Pipeline.
  return runWebsiteGenerationV2Job(jobId, websiteId);
}
```
Danach alle dadurch unbenutzten Importe/Helfer in `routers.ts` entfernen (je Import `grep -c "<Name>(" server/routers.ts`).
- [ ] **Step 4: Tests** — `npx vitest run server/routers.v2Guards.test.ts server/generationV2` grün, dann `npx vitest run` (bekannte Env-Fails).
- [ ] **Step 5: Gate** — tsc-Zahl ≤ vorher; `npx playwright test tests/visual/studio.spec.ts --workers=1 --reporter=line` 8/8.
- [ ] **Step 6: Commit** — `git commit -m "chore: Totes v1-Material entfernt — Showcase/Wizard/Templates-Seiten, v1-Einzel-Layouts, unerreichbarer Generierungsrumpf"`

---

### Task 3: Chat-Cluster und v1-Prozeduren

**Files:**
- Delete: `client/src/pages/OnboardingChat.tsx`, `client/src/components/MacbookMockup.tsx` (falls nicht schon in Task 1), `client/src/pages/VariantPreviewPage.tsx` (+ Route `/variant-preview` `App.tsx:237`, lazy-Import Z. 40, `variant-preview` aus der SPA-Regex in `server/_core/static.ts` + Test), `client/src/pages/LayoutOverviewPage.tsx` (+ Route `/admin/layouts` `App.tsx:120`, lazy-Import Z. 33, Nav-Eintrag `client/src/components/DashboardLayout.tsx:40` „Layout-Vorschau").
- Modify: `server/routers.ts` — `onboarding`-Router (Z. ~4368–5353) auf **genau** `searchStockPhotos`, `getStepEvents`, `regenerateLegalPages` reduzieren (löschen: `generateText`, `suggestServices`, `logStep`, `saveStep`, `complete`, `uploadLogo`, `getGmbPhotos`, `getPhotoSuggestions` und weitere — vorher Aufrufer-Matrix, Step 1); `selfService`-Router (Z. ~6149–7112) auf Prozeduren mit Client-Aufrufern (`start`, `captureEmail`) plus serverseitig von `start` genutzte Hilfsprozeduren reduzieren; löschen: `generateWebsiteAsync`, `getGenerationStatus`, `updateCaptureStatus`, `saveCustomerEmail`, `sendLeadEmail`, `generateInitialContent`, `selectWebsiteTemplate` (Studio nutzt `onboardingV2.*`), `testEmail` (falls noch da).
- Modify: `client/src/pages/StartPage.tsx` nur, falls es noch etwas aus dem Chat importiert (grep).
- Tests: `server/routers.onboardingCompleteV2.test.ts`, `server/saveStep.color.test.ts`, `server/photo.color.test.ts`, `server/photo.colorpicker.test.ts`, `server/secondary.color.test.ts` löschen (testen nur Chat-Prozeduren — je Datei per `grep -n "onboarding\.\|saveStep\|complete" <file>` bestätigen); `server/customer.dashboard.test.ts`, `server/routers.v2Guards.test.ts`, `server/pageblitz.test.ts` anpassen, falls sie gelöschte Prozeduren referenzieren.

**Interfaces:** `onboarding.searchStockPhotos`, `onboarding.getStepEvents`, `onboarding.regenerateLegalPages`, `selfService.start`, `selfService.captureEmail` bleiben mit unveränderter Signatur.

- [ ] **Step 1: Aufrufer-Matrix** — `grep -rhn -o "trpc\.\(onboarding\|selfService\)\.[a-zA-Z]*" client/src | sort | uniq -c` und `grep -rln "onboarding\.\|selfService\." server --include="*.test.ts"` → Liste „behalten" (aktuell laut Delta: `searchStockPhotos` ← `StockPhotoSearch.tsx:46`, `getStepEvents` ← `LeadsPage.tsx:396`/`WebsitesPage.tsx:1841`, `regenerateLegalPages` ← `LegalPage.tsx:23`, `selfService.start` ← `StartPage.tsx:115`, `selfService.captureEmail` ← `WelcomeBack.tsx:22`).
- [ ] **Step 2: Client-Dateien löschen, Routen/Nav/SPA-Liste nachziehen**; `static.test.ts`: `isSpaRoute("/variant-preview") === false`.
- [ ] **Step 3: Router kürzen** (zusammenhängende Blöcke löschen; danach unbenutzte Importe/Helfer in `routers.ts` entfernen — `uploadLogo`/`uploadPhoto`-Importe nur, wenn in `routers.ts` sonst ungenutzt; `server/onboardingUpload.ts` bleibt für `routerContent.ts`).
- [ ] **Step 4: Tests löschen/anpassen; `npx vitest run` grün.**
- [ ] **Step 5: Gate** — tsc ≤ vorher; Playwright `studio.spec.ts` 8/8, `startpage-to-studio.spec.ts` 1/1.
- [ ] **Step 6: Commit** — `git commit -m "chore: Onboarding-Chat und v1-Prozeduren (onboarding.*/selfService.*) entfernt, Layout-Vorschau-Seiten und Routen weg"`

---

### Task 4: v1-Generierung und Alt-Mappings

**Files:**
- Modify: `server/routers.ts` — `website.generate` (Z. ~3051–3423) auf v2 umschreiben (Code unten); löschen: `DESIGN_ARCHETYPES`, `buildIndustryContext`, `buildPersonalityHint`, `buildEnhancedPrompt`, `buildProcessSection`, `getFallbackWebsiteData`, verbleibende v1-`invokeLLM`-Aufrufe (grep `invokeLLM(` — Support-Chat/Lifecycle-Stellen bleiben); `outreach.queueBusinesses` (Z. ~3848–3890): v1-Vorberechnung (`getIndustryColorScheme`, `getLayoutPool`, `getNextLayoutForIndustry`, `getHeroImageUrl` sowie `colorScheme`, `heroImageUrl`, `layoutStyle`, `layoutVersion` in `createGeneratedWebsite`) entfernen; Preview-Link im Bestand-Zweig (`https://pageblitz.de/preview/${token}`) → `${APP_BASE_URL}/onboarding/${token}` mit dem vorhandenen Helper aus `server/_core/lifecycleScheduler.ts` (`buildStudioUrl`) — importieren, nicht duplizieren.
- Modify: `server/outreachPipeline.ts:~420–445` — gleiche Vorberechnung entfernen; `createGeneratedWebsite` nur noch mit `businessId, slug, status: "preview", websiteData: null, industry, previewToken, addons: [], requiresAgeGate` (Pflichtfelder gegen `server/db.ts createGeneratedWebsite` und `server/onboardingV2/devSeed.ts:90` abgleichen).
- Modify: `server/industryImages.ts` — löschen `getIndustryColorScheme`, `getLayoutPool`, `getLayoutVariants`, `getLayoutStyle`, `VARIANT_FAMILY_RANKINGS` (nach Entfernung der Aufrufer 0 Treffer); behalten `getIndustryImages`, `getHeroImageUrl`, `getGalleryImages`, `getContrastColor`, `INDUSTRY_IMAGES`.
- Modify: `shared/layoutConfig.ts` → nur noch `withOnColors` (+ `ColorScheme`-Re-Export, falls Aufrufer) — `CURRENT_LAYOUT_VERSION`, `LAYOUT_FONTS*`, `getLayoutFonts`, `getLLMFontPrompt`, `FORBIDDEN_BODY_FONTS`, `FONT_OPTIONS`, `LOGO_FONT_OPTIONS`, `PREDEFINED_COLOR_SCHEMES`, `generateRandomColorScheme`, `DEFAULT_LAYOUT_COLOR_SCHEMES`, `DESIGN_TOKEN_CONFIG` löschen, sobald 0 Treffer; `layoutVersion: CURRENT_LAYOUT_VERSION` aus allen `createGeneratedWebsite`-Aufrufen (`selfService.start` Z. ~6548, `queueBusinesses`, `outreachPipeline.ts`) entfernen.
- Modify: `shared/types.ts` — `WebsiteData`, `WebsiteSection`, `DesignTokens` löschen (nach Task 1–3 keine Konsumenten; `ColorScheme` bleibt, solange `withOnColors`/Server es nutzen).
- Delete: `client/src/components/layouts/PremiumLayoutsV2.tsx` und das Verzeichnis `client/src/components/layouts/` komplett.
- Modify: `client/src/pages/WebsitesPage.tsx` — `generateMutation` (Z. ~148): `onSuccess`-Toast „Generierung gestartet — die Website erscheint in Kürze in der Liste", `generateAiImage` aus dem Aufruf entfernen (falls übergeben).
- Test: `server/routers.v2Guards.test.ts` (neuer Fall unten).

**Interfaces:**
- Produces: `website.generate({ businessId })` → `{ websiteId: number; jobId: number; previewToken: string; slug: string }` (adminProcedure; `CONFLICT`, wenn Website existiert).

- [ ] **Step 1: Failing Test** (in `server/routers.v2Guards.test.ts`, Mock-Muster der bestehenden Tests dort übernehmen — `vi.mock("./db")`, `vi.mock("./generationV2/runJob")`):
```ts
test("website.generate legt Preview-Website + Job an und startet die v2-Pipeline", async () => {
  getBusinessById.mockResolvedValue({ id: 7, name: "Schreinerei Brandt", category: "Schreiner", placeId: "p1" });
  getWebsiteByBusinessId.mockResolvedValue(null);
  createGeneratedWebsite.mockResolvedValue(42);
  createGenerationJob.mockResolvedValue(99);
  const caller = appRouter.createCaller(adminCtx());
  const res = await caller.website.generate({ businessId: 7 });
  expect(res).toMatchObject({ websiteId: 42, jobId: 99 });
  expect(createGeneratedWebsite).toHaveBeenCalledWith(expect.objectContaining({ businessId: 7, status: "preview", websiteData: null }));
  expect(createGeneratedWebsite.mock.calls[0][0]).not.toHaveProperty("layoutStyle");
  expect(runWebsiteGenerationV2Job).toHaveBeenCalledWith(99, 42);
});
```
- [ ] **Step 2: Test → FAIL** (`website.generate` läuft noch synchron v1).
- [ ] **Step 3: `website.generate` ersetzen**:
```ts
    generate: adminProcedure
      .input(z.object({ businessId: z.number() }))
      .mutation(async ({ input }) => {
        const business = await getBusinessById(input.businessId);
        if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
        const existing = await getWebsiteByBusinessId(input.businessId);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Website already generated for this business" });

        const category = business.category || "Dienstleistung";
        const slug = slugify(business.name) + "-" + nanoid(4);
        const previewToken = nanoid(32);
        const websiteId = await createGeneratedWebsite({
          businessId: input.businessId,
          slug,
          status: "preview",
          websiteData: null,
          industry: category,
          previewToken,
          addons: [],
          requiresAgeGate: shouldRequireAgeGate(category, business.name),
        });
        const jobId = await createGenerationJob({ websiteId, status: "pending", progress: 0 });
        runWebsiteGenerationV2Job(jobId, websiteId).catch(err => {
          console.error(`[website.generate] Generierung für Website ${websiteId} fehlgeschlagen:`, err);
        });
        return { websiteId, jobId, previewToken, slug };
      }),
```
- [ ] **Step 4: Test → PASS.** Dann v1-Helfer, `queueBusinesses`-/`outreachPipeline`-Vorberechnung, `industryImages`-Exporte, `layoutConfig`, `shared/types`, `layouts/`-Verzeichnis löschen — je grep-verifiziert; `WebsitesPage.tsx` anpassen.
- [ ] **Step 5: Gate** — `npx vitest run` grün; tsc ≤ vorher (Erwartung: deutlich unter 40 — viele Altfehler hingen an `PremiumLayoutsV2`/v1-Teilen von `routers.ts`); `npx vite build` grün (Größe des größten Chunks im Bericht); Playwright `packs.spec.ts` 84/84 (`withOnColors`-Konsumenten!), `studio.spec.ts` 8/8.
- [ ] **Step 6: Commit** — `git commit -m "refactor: Admin-Generierung auf v2-Job, v1-Generator/Layouts/Alt-Mappings entfernt (layouts/, layoutConfig, industryImages-Pools)"`

---

### Task 5: Templates-Cluster, Dashboard-Rest, SPA-Liste

**Files:**
- Modify: `server/routers.ts` — `templates`-Router (Z. ~4053–4280) löschen; Importe `selectTemplatesForIndustry`, `getTemplateStyleDescription`, `getTemplateImageUrls` entfernen.
- Delete: `server/templateSelector.ts`, alle `templates.json` (`find . -name templates.json -not -path "./node_modules/*"`), `template_uploads`-Helfer in `server/db.ts` (nur Funktionen; Tabelle bleibt bis B4c).
- Modify: `package.json` `build`: `&& mkdir -p dist/template-library && cp template-library/templates.json dist/template-library/templates.json` entfernen.
- Modify: `server/_core/static.ts` `SPA_ROUTES` mit `client/src/App.tsx` abgleichen (Kommentar „Muss mit den Routen in client/src/App.tsx übereinstimmen"): tote Einträge raus; `static.test.ts` entsprechend.
- Verify/Modify: `client/src/pages/dashboard/AddonsTab.tsx` — `grep -n "websiteData\|sections\|gallery\|menu\|pricelist" client/src/pages/dashboard/AddonsTab.tsx`: schreibt etwas noch v1-`websiteData.sections`/Galerie/Menü/Preisliste? Falls ja: Schreibpfad entfernen, Hinweistext „Inhalte der Add-ons pflegst du im Studio" + Link `?panel=addons` (Helfer `withPanelParam` aus `client/src/pages/onboarding-v2/studioUrl.ts`, wie `StudioCard.tsx`).
- Tests: `server/industry.mapping.test.ts` behalten, falls `shared/industryServices.ts` noch genutzt (v2 `getIndustryServicesSeed`? grep) — sonst Test + ungenutzte Exporte löschen; `server/pageblitz.test.ts`/`server/contrast.test.ts`: prüfen, ob sie nur v1-Funktionen importieren → dann löschen und die Liste „bekannte Env-Fails" in `docs/BETRIEB-V2.md` anpassen.

- [ ] **Step 1: Referenz-Checks** (`templates.`, `templateSelector`, `template_uploads`/`templateUploads`, `templates.json`).
- [ ] **Step 2: Löschen/Anpassen; `npm run build` ohne cp-Schritt grün.**
- [ ] **Step 3: `static.test.ts`:** Negativfälle für entfernte Routen, Positivfälle bleiben.
- [ ] **Step 4: Gate** — vitest grün, tsc ≤ vorher, `npm run build` grün.
- [ ] **Step 5: Commit** — `git commit -m "chore: Templates-Cluster entfernt, SPA-Routenliste bereinigt, Add-on-Tab ohne v1-Schreibpfad"`

---

### Task 6: Abschluss B4b — Gates, Doku, Inventar

**Files:**
- Modify: `docs/BETRIEB-V2.md` („Offen/Nächste Schritte": B4b erledigt, B4c = DB-Drops/Perf/a11y/Team/Unterseiten; Env-Fail-Liste; `runWebsiteGeneration` = reiner Wrapper).
- Modify: `docs/superpowers/specs/2026-08-22-cutover-design.md` §4 Erfolgskriterien → Stand.
- Create: `docs/superpowers/specs/2026-08-23-b4b-ergebnis.md` (kurz: gelöschte LOC je Task aus `git diff --shortstat main..HEAD`, tsc vorher/nachher, verbliebene v1-Reste mit Begründung, B4c-Liste inkl. zu droppender Spalten/Tabellen laut Inventar §7: `generatedWebsites.layoutStyle/layoutVersion/colorScheme/heroImageUrl/aboutImageUrl/…`, `template_uploads`).

- [ ] **Step 1: Volle Gates** — `npx vitest run`; `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -c "error TS"` (Zahl dokumentieren); `npm run build`; Playwright alle fünf Specs als separate Befehle, jeweils grün, `studio`+`landing` zweimal.
- [ ] **Step 2: Rest-Grep** — `grep -rn "components/layouts\|OnboardingChat\|PB_LAYOUT_V2\|layoutStyle\|PremiumLayoutsV2\|templateSelector" client server shared scripts tests` → nur noch Drizzle-Schema/Migrationen/Doku-Treffer; alles andere im Ergebnis-Dokument begründen.
- [ ] **Step 3: Doku schreiben, Commit** — `git commit -m "docs: B4b-Ergebnis — v1-System entfernt, Betriebsdoku und Spec-Stand aktualisiert"`

---

## Self-Review

- **Spec-Abdeckung:** §2.5 (`/layout-preview`, `/variant-preview` entfallen) → Task 1/3; §2.7 (Löschung nach Inventar, `layoutConfig` → `withOnColors`) → Task 2–5; §4 (kein v1-`websiteData`-Erzeuger mehr, `layouts/`, `OnboardingChat.tsx`, v1-Prozeduren, `PB_LAYOUT_V2` existieren nicht; tsc-Baseline sinkt; Dashboard-Kernfunktionen unverändert) → Task 1–6. §2.8 (aufgeschoben) bleibt B4c.
- **Platzhalter:** Jeder Lösch-Task nennt konkrete Namen/Zeilen plus grep-Check; die drei Rewrites (SitePage, WebsiteRenderer, website.generate) enthalten den Code. Entscheidungen „nach grep" sind explizit als solche markiert und müssen im Bericht dokumentiert werden.
- **Typkonsistenz:** `WebsiteRenderer`-Props (`websiteData: unknown`, `slug`, `packOverride`, `islandsMode`) in Task 1 definiert und von `SitePage` genutzt; `website.generate`-Rückgabe `{ websiteId, jobId, previewToken, slug }` in Test und Implementierung identisch; `runWebsiteGeneration(jobId, websiteId)` bleibt in Task 2 erhalten.
