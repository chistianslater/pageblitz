# Onboarding v2 — Plan B2 „Panels, E-Mail & Checkout" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Das Studio wird vom Stil-Demo zum vollständigen Onboarding: Panels **Fotos, Texte, Angebot, Rechtliches, Extras**, E-Mail-Erfassung und **Checkout** (Stripe) — alles als validierte v2-Patches hinter Ownership + Write-Guard, Zustand server-only.

**Architecture:** `server/onboardingV2/` wächst um pure Patch-Funktionen (`applyImages/applyTexts/applyOffer`, Legal über bestehendes `applyOnboardingToV2`), zod-Patch-Schemas in `shared/onboardingV2/patches.ts`, Preise in `shared/pricing.ts` (aus `routers.ts` extrahiert, Client rechnet mit denselben Zahlen). Der tRPC-Router wird in Core / Content / Commerce aufgeteilt; eine gemeinsame `persistDoc`-Kette (Guard → updateWebsite → studioProgress → Cache-Invalidierung → neuer State) hält die Invarianten. Client: je Panel eine Datei unter `client/src/pages/onboarding-v2/panels/`, `CheckoutBar` unter der Checkliste.

**Scope-Grenzen:** KI-Chat (Spec §5), `features`-Vertragsfeld + SSR-Inseln (Kontaktformular, KI-Widget, Buchung, Unterseiten) → **Plan B3**; Cutover/Löschung → **Plan B4**. Add-on-**Flags** (Preis, Abo) werden hier vollständig erfasst; Add-on-**Inhalte** mit Sektion (Galerie, Speisekarte, Preisliste) entstehen über Fotos-/Angebot-Panel.

**Tech Stack:** wie B1 (TypeScript strict, React 19, tRPC 11, zod v4, Drizzle/MySQL, Vitest, Playwright PORT=3005) + react-hook-form 7 / `@hookform/resolvers` (vorhanden), Stripe SDK (vorhanden).

**Spec:** `docs/superpowers/specs/2026-08-21-onboarding-v2-design.md` (§2, §3.4, §4 Punkte 2–6, §6, §8). Vorarbeit: Plan B1 (`2026-08-22-onboarding-v2-b1-fundament.md`), `server/onboardingV2/router.ts` (getState/ensureGeneration/getStyleCandidates/selectStylePack), `server/onboardingV2Patch.ts` (`applyOnboardingToV2`), `server/legalGenerator.ts` (`generateImpressum/generateDatenschutz`), `server/onboardingUpload.ts` (`uploadPhoto(base64, mime, websiteId, index)`), `server/_core/stockPhotos.ts` (`searchStockPhotos`), `server/industryImages.ts` (`getIndustryImages`), `server/gmbPhotos.ts`, `server/stripeWebhook.ts` (liest `session.metadata.{websiteId,userId,billingInterval,addOns,totalAmount}`).

## Global Constraints

- Deutsch in UI-Texten, Fehlermeldungen, Kommentaren, Commits; Commit-Format `<type>: <beschreibung>` **ohne** Co-Authored-By.
- Jede Mutation: `loadStudioWebsite(token, user)` → purer Patch → `assertV2SafeWrite(stored, next)` → `updateWebsite` → `invalidateSsrCache(slug)` → `buildState`. Kein Schreibpfad daran vorbei. `legal.impressumHtml/datenschutzHtml` nur aus `legalGenerator`.
- Kein localStorage/sessionStorage für Onboarding-Zustand.
- `server/routers.ts` darf nur **schrumpfen** (Pricing-Extraktion) — keine neuen Prozeduren dort.
- Dateien < 400 Zeilen typisch, max 800; eine Verantwortung pro Datei. Unit-getestete React-Komponenten: `import React from "react"`.
- tsc-Gate: keine NEUEN Fehler (main-Baseline 73 Altfehler). Vitest: bekannte env-Fails dürfen bleiben (4× contrast, 2× resend, Stripe-env-Suites auth.logout/pageblitz). Router-Tests: `vi.hoisted` Stripe-Stub + `vi.mock("../db", importOriginal …)` wie `server/onboardingV2/router.test.ts`.
- Port 3000 nie anfassen; Playwright/Dev auf 3005; Dev-DB = Docker `pageblitz-mysql` (läuft; falls nicht: `docker start pageblitz-mysql`, Colima muss laufen: `colima start`).
- Prettier-Hook-Reformatierungen fremder Dateien als eigene `chore:`-Commits.
- Preise: Basis 24,90 €/Mo monatlich, 19,90 €/Mo jährlich; Add-on 3,90 €, KI-Chat 9,90 €, Buchung 4,90 € (Cent-Werte in `shared/pricing.ts`, einzige Quelle).

---

## Dateistruktur (B2)

```
shared/pricing.ts                      ← PRICING, AddOnKey, ADDON_KEYS, ADDON_NAMES, addonPrice, calcTotalCents (aus routers.ts verschoben)
shared/onboardingV2/patches.ts         ← zod: ImagesPatch, TextsPatch, OfferPatch, LegalPatch, AddonsPatch (+ Typen)
shared/onboardingV2/checklist.ts       ← legalPhone wird Pflichtfeld
shared/siteContract/schema.ts          ← SafeUrlSchema exportieren
server/onboardingV2/state.ts           ← StudioState, buildState, mergeStudioProgress, requireDoc, persistDoc (aus router.ts)
server/onboardingV2/router.ts          ← Core (getState, ensureGeneration, getStyleCandidates, selectStylePack) + Merge der Teil-Router
server/onboardingV2/routerContent.ts   ← getPhotoSources, uploadPhoto, setImages, updateTexts, suggestTexts, updateOffer, suggestOffer
server/onboardingV2/routerCommerce.ts  ← updateLegal, updateAddons, setCustomerEmail, createCheckout
server/onboardingV2/applyPatch.ts      ← + applyImages, applyTexts, applyOffer
server/onboardingV2/suggest.ts         ← LLM-Aufrufe für Text-/Angebots-Vorschläge (json_schema)
server/onboardingV2/checkout.ts        ← Stripe-Session (gleiche Metadaten wie checkout.createSession)
client/src/pages/onboarding-v2/panels/{PhotosPanel,TextsPanel,OfferPanel,LegalPanel,AddonsPanel}.tsx
client/src/pages/onboarding-v2/CheckoutBar.tsx, panels/PanelFrame.tsx (gemeinsamer Kopf/Fuß), studio.css (+ Panel-Klassen)
client/src/pages/onboarding-v2/StudioPage.tsx, useStudioState.ts (legacy → kein Polling)
tests/visual/studio.spec.ts            ← + Rechtliches-Panel, Checkout-bereit-Flow
```

---

### Task 1: Kleinkram — Legacy-Polling, Telefon-Pflicht, SafeUrl-Export, Pricing nach `shared/`

**Files:**
- Modify: `client/src/pages/onboarding-v2/studioLogic.ts`, `client/src/pages/onboarding-v2/useStudioState.ts`, `client/src/pages/onboarding-v2/studioLogic.test.ts`
- Modify: `shared/onboardingV2/checklist.ts`, `shared/onboardingV2/checklist.test.ts`
- Modify: `shared/siteContract/schema.ts` (`export const SafeUrlSchema`)
- Create: `shared/pricing.ts`, `shared/pricing.test.ts`
- Modify: `server/routers.ts` (PRICING/AddOnKey/ADDON_NAMES/addonPrice löschen → Import aus `@shared/pricing`)

**Interfaces:**
- Produces: `computeRefetchInterval(ensureFailed, data)` liefert `false`, wenn `data.legacy === true`; `ChecklistAnswers.legalPhone`; `shared/pricing.ts`:
  ```ts
  export const PRICING = { base: { monthly: 2490, yearly: 1990 }, addon: 390, addonAiChat: 990, addonBooking: 490 } as const;
  export type BillingInterval = "monthly" | "yearly";
  export type AddOnKey = "contactForm" | "gallery" | "menu" | "pricelist" | "aiChat" | "booking" | "team";
  export const ADDON_KEYS: readonly AddOnKey[];
  export const ADDON_NAMES: Record<AddOnKey, string>;
  export function addonPrice(key: AddOnKey): number;            // Cent
  export type AddOnFlags = Partial<Record<AddOnKey, boolean>>;
  export function calcTotalCents(interval: BillingInterval, addOns: AddOnFlags): number;
  export function formatEuro(cents: number): string;            // "24,90 €"
  ```

- [ ] **Step 1: Failing Tests**

`studioLogic.test.ts` ergänzen:
```ts
test("legacy-Dokument → kein Polling, auch ohne Job", () => {
  expect(computeRefetchInterval(false, { doc: null, job: null, legacy: true })).toBe(false);
});
```
`checklist.test.ts`: im Test „legal done nur mit allen Pflichtfeldern" `legalDone` um `legalPhone: "0231 1"` erweitern und einen Fall `{ ...legalDone, legalPhone: "" }` → `"open"` ergänzen.
`shared/pricing.test.ts`:
```ts
import { describe, expect, test } from "vitest";
import { ADDON_KEYS, ADDON_NAMES, addonPrice, calcTotalCents, formatEuro, PRICING } from "./pricing";
describe("pricing", () => {
  test("Basispreise und Add-on-Preise", () => {
    expect(PRICING.base.monthly).toBe(2490); expect(PRICING.base.yearly).toBe(1990);
    expect(addonPrice("aiChat")).toBe(990); expect(addonPrice("booking")).toBe(490); expect(addonPrice("gallery")).toBe(390);
  });
  test("calcTotalCents summiert nur aktive Add-ons", () => {
    expect(calcTotalCents("yearly", {})).toBe(1990);
    expect(calcTotalCents("monthly", { gallery: true, aiChat: true, menu: false })).toBe(2490 + 390 + 990);
  });
  test("formatEuro deutsches Format", () => { expect(formatEuro(1990)).toBe("19,90 €"); });
  test("jeder Key hat einen Namen", () => { for (const k of ADDON_KEYS) expect(ADDON_NAMES[k]).toBeTruthy(); });
});
```

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implementieren**

`studioLogic.ts`: `RefetchIntervalDataLike` um `legacy?: boolean` erweitern; in `computeRefetchInterval` als erstes `if (data?.legacy) return false;`. `useStudioState.ts` übergibt bereits `query.state.data` (enthält `legacy`) — keine Änderung nötig, prüfen.
`checklist.ts`: `ChecklistAnswers.legalPhone?: string | null`; `legalComplete` prüft zusätzlich `hasText(a.legalPhone)`; `TITLES.legal.hint` bleibt. `router.ts`/`state.ts`-Aufrufer übergeben `legalPhone: onboarding?.legalPhone` (in Task 2 beim Verschieben von buildState erledigen — hier in `router.ts` direkt ergänzen).
`schema.ts`: `const SafeUrlSchema` → `export const SafeUrlSchema`.
`shared/pricing.ts`:
```ts
export const PRICING = {
  base: { monthly: 2490, yearly: 1990 },
  addon: 390,
  addonAiChat: 990,
  addonBooking: 490,
} as const;
export type BillingInterval = "monthly" | "yearly";
export type AddOnKey = "contactForm" | "gallery" | "menu" | "pricelist" | "aiChat" | "booking" | "team";
export const ADDON_KEYS: readonly AddOnKey[] = ["contactForm", "gallery", "menu", "pricelist", "aiChat", "booking", "team"];
export const ADDON_NAMES: Record<AddOnKey, string> = {
  contactForm: "Kontaktformular", gallery: "Bildergalerie", menu: "Speisekarte", pricelist: "Preisliste",
  aiChat: "KI-Chat", booking: "Terminbuchung", team: "Team",
};
export function addonPrice(key: AddOnKey): number {
  if (key === "aiChat") return PRICING.addonAiChat;
  if (key === "booking") return PRICING.addonBooking;
  return PRICING.addon;
}
export type AddOnFlags = Partial<Record<AddOnKey, boolean>>;
export function calcTotalCents(interval: BillingInterval, addOns: AddOnFlags): number {
  return ADDON_KEYS.reduce((sum, k) => sum + (addOns[k] ? addonPrice(k) : 0), PRICING.base[interval]);
}
export function formatEuro(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}
```
`server/routers.ts`: die lokalen Definitionen (`const PRICING`, `type AddOnKey`, `const ADDON_NAMES`, `function addonPrice`) löschen, oben `import { PRICING, ADDON_NAMES, addonPrice, type AddOnKey } from "@shared/pricing";` (Alias `@shared` ist in tsconfig/vitest vorhanden — prüfen, sonst relativer Import). `checkout.createSession` bleibt funktional identisch.

- [ ] **Step 4: Run — PASS**: `npx vitest run shared client/src/pages/onboarding-v2 server/onboardingV2 server/routers.onboardingCompleteV2.test.ts`; `npm run check` (keine neuen Fehler).

- [ ] **Step 5: Commit** — `fix: Studio — kein Polling bei Legacy-Website; Telefon als Legal-Pflichtfeld; Pricing nach shared/pricing.ts`

---

### Task 2: Router aufteilen — `state.ts` mit `persistDoc`, erweiterter `StudioState`

**Files:**
- Create: `server/onboardingV2/state.ts`
- Modify: `server/onboardingV2/router.ts` (Core bleibt; Helfer raus), `server/onboardingV2/router.test.ts` (Assertions auf neue State-Felder)

**Interfaces:**
- Produces (`state.ts`):
  ```ts
  export interface StudioLegal { legalOwner: string; legalStreet: string; legalZip: string; legalCity: string; legalEmail: string; legalPhone: string; legalVatId: string }
  export interface StudioState { …wie bisher…; legal: StudioLegal; addOns: AddOnFlags; uploadedPhotos: string[]; openingHours: { day: string; hours: string }[] }
  export async function buildState(token, loaded: StudioWebsite, progressOverride?: StudioProgress): Promise<StudioState>
  export async function mergeStudioProgress(websiteId: number, patch: StudioProgress): Promise<StudioProgress>
  export function requireDoc(loaded: StudioWebsite): WebsiteDataV2
  /** Guard → updateWebsite(websiteData[, extra]) → studioProgress → Cache → State. */
  export async function persistDoc(token: string, loaded: StudioWebsite, next: WebsiteDataV2, opts?: { progress?: StudioProgress; extra?: Partial<InsertGeneratedWebsite> }): Promise<StudioState>
  ```
  `addOns` aus `onboarding_responses.addOn{ContactForm,Gallery,Menu,Pricelist,AiChat,Booking,Team}` (boolean ?? false); `legal.*` aus `onboarding_responses` (leer-String statt null; `legalEmail` fällt auf `website.customerEmail` zurück — Spec §4: E-Mail vorbelegt); `uploadedPhotos` = `onboarding.photoUrls` (Array, sonst []); `openingHours` aus `doc.sections[type=contact].openingHours ?? []`.

- [ ] **Step 1: Failing Test** (in `router.test.ts`, describe getState):
```ts
test("liefert legal (E-Mail aus customerEmail vorbelegt), addOns, uploadedPhotos, openingHours", async () => {
  mockedDb.getWebsiteByToken.mockResolvedValue({ id: 42, slug: "s", status: "preview", businessId: 7, customerEmail: "kunde@x.de",
    websiteData: { ...v2, sections: [...v2.sections, { type: "contact", openingHours: [{ day: "Mo", hours: "9–17" }] }] } } as any);
  mockedDb.getOnboardingByWebsiteId.mockResolvedValue({ websiteId: 42, legalOwner: "Max", legalEmail: null, addOnGallery: true, photoUrls: ["https://u/1.jpg"] } as any);
  const s = await appRouter.createCaller(ctx()).onboardingV2.getState({ token: "tok" });
  expect(s.legal).toMatchObject({ legalOwner: "Max", legalEmail: "kunde@x.de", legalPhone: "" });
  expect(s.addOns).toEqual({ contactForm: false, gallery: true, menu: false, pricelist: false, aiChat: false, booking: false, team: false });
  expect(s.uploadedPhotos).toEqual(["https://u/1.jpg"]);
  expect(s.openingHours).toEqual([{ day: "Mo", hours: "9–17" }]);
});
```
- [ ] **Step 2: Run — FAIL**
- [ ] **Step 3: Implementieren** — `state.ts` erhält `StudioJob`, `StudioState`, `buildState` (+ neue Felder, `legalPhone` in die Checklisten-Antworten), `mergeStudioProgress` (inkl. createOnboarding-Fallback aus B1), `requireDoc`, und
```ts
export async function persistDoc(token, loaded, next, opts = {}) {
  assertV2SafeWrite(loaded.website.websiteData, next);
  await updateWebsite(loaded.website.id, { websiteData: next as any, ...(opts.extra ?? {}) });
  const progress = opts.progress ? await mergeStudioProgress(loaded.website.id, opts.progress) : undefined;
  invalidateSsrCache(loaded.website.slug);
  return buildState(token, { ...loaded, website: { ...loaded.website, websiteData: next as any }, doc: next }, progress);
}
```
`router.ts` importiert aus `./state`, `selectStylePack` nutzt `persistDoc(input.token, loaded, next, { progress: { styleConfirmed: true }, extra: { layoutStyle: packId } })`. Am Ende von `router.ts`: `export const onboardingV2Router = router({ ...coreProcedures, ...contentProcedures, ...commerceProcedures })` — `contentProcedures`/`commerceProcedures` entstehen in Task 4/6; bis dahin `router({ ...coreProcedures })` mit `const coreProcedures = { getState: …, ensureGeneration: …, getStyleCandidates: …, selectStylePack: … }`.
- [ ] **Step 4: Run — PASS** (alle `server/onboardingV2`-Tests); tsc.
- [ ] **Step 5: Commit** — `refactor: onboardingV2 — state.ts mit persistDoc, StudioState um legal/addOns/uploadedPhotos/openingHours erweitert`

---

### Task 3: Patch-Schemas + pure Patches (Bilder, Texte, Angebot)

**Files:**
- Create: `shared/onboardingV2/patches.ts`, `shared/onboardingV2/patches.test.ts`
- Modify: `server/onboardingV2/applyPatch.ts`, `server/onboardingV2/applyPatch.test.ts`

**Interfaces:**
```ts
// shared/onboardingV2/patches.ts
export const ImagesPatchSchema = z.object({ hero: SafeUrlSchema.optional(), about: SafeUrlSchema.optional(),
  gallery: z.array(z.object({ url: SafeUrlSchema, alt: z.string().min(1) }).strict()).max(12).optional() }).strict();
export const TextsPatchSchema = z.object({ headline: z.string().min(1).max(120).optional(), subheadline: z.string().max(240).optional(),
  ctaText: z.string().max(40).optional(), aboutHeadline: z.string().min(1).max(120).optional(), aboutBody: z.string().min(1).max(2000).optional(),
  seoTitle: z.string().min(1).max(70).optional(), seoDescription: z.string().min(1).max(170).optional() }).strict();
export const OfferPatchSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("services"), headline: z.string().min(1).max(80), intro: z.string().max(300).optional(),
    items: z.array(z.object({ title: z.string().min(1).max(80), description: z.string().max(240).optional(), price: z.string().max(40).optional() }).strict()).min(1).max(12) }).strict(),
  z.object({ mode: z.enum(["menu", "pricelist"]), headline: z.string().max(80).optional(),
    categories: z.array(z.object({ name: z.string().min(1).max(60), items: z.array(z.object({ name: z.string().min(1).max(80), description: z.string().max(200).optional(), price: z.string().min(1).max(40) }).strict()).min(1).max(40) }).strict()).min(1).max(12) }).strict(),
]);
export const LegalPatchSchema = z.object({ legalOwner: z.string().min(2).max(120), legalStreet: z.string().min(3).max(120), legalZip: z.string().regex(/^\d{5}$/),
  legalCity: z.string().min(2).max(80), legalEmail: z.string().email().max(320), legalPhone: z.string().min(5).max(40), legalVatId: z.string().max(20).optional(),
  openingHours: z.array(z.object({ day: z.string().min(1).max(40), hours: z.string().min(1).max(60) }).strict()).max(14).optional() }).strict();
export const AddonsPatchSchema = z.object({ contactForm: z.boolean(), gallery: z.boolean(), menu: z.boolean(), pricelist: z.boolean(), aiChat: z.boolean(), booking: z.boolean(), team: z.boolean() }).strict();
export type ImagesPatch = z.infer<typeof ImagesPatchSchema>; export type TextsPatch = …; export type OfferPatch = …; export type LegalPatch = …; export type AddonsPatch = …;
// server/onboardingV2/applyPatch.ts
export function applyImages(doc, patch: ImagesPatch): WebsiteDataV2   // hero/about setzen (nur wenn Sektion existiert); gallery: [] → Sektion entfernen, [x..] → Sektion upserten (Position: nach about, sonst vor contact, sonst Ende)
export function applyTexts(doc, patch: TextsPatch): WebsiteDataV2     // hero.headline/subheadline/ctaText, about.headline/body, seo.title/description
export function applyOffer(doc, offer: OfferPatch): WebsiteDataV2     // entfernt ALLE services/menu/pricelist-Sektionen, fügt die neue an der Position der ersten entfernten ein (sonst nach hero); services: {type,headline,intro?,items}; menu/pricelist: {type,headline?,categories}
```
Alle drei: immutable, `WebsiteDataV2Schema.parse(result)`.

- [ ] **Step 1: Failing Tests**

`patches.test.ts`: je Schema ein gültiger + ein ungültiger Fall (z. B. `ImagesPatchSchema` lehnt `javascript:`-URL ab; `LegalPatchSchema` lehnt PLZ „1234" ab; `OfferPatchSchema` verlangt ≥1 item; `AddonsPatchSchema` strict lehnt Fremdfeld ab).
`applyPatch.test.ts` ergänzen:
```ts
const docFull: WebsiteDataV2 = { version: 2, stylePackId: "werkbank", businessName: "B", seo: { title: "t", description: "d" },
  sections: [ { type: "hero", headline: "H" }, { type: "services", headline: "L", items: [{ title: "A" }] }, { type: "about", headline: "Ü", body: "Text" }, { type: "contact", phone: "1" } ] };
describe("applyImages", () => {
  test("setzt hero/about und legt Galerie nach about an", () => {
    const next = applyImages(docFull, { hero: "https://x/h.jpg", about: "https://x/a.jpg", gallery: [{ url: "https://x/g.jpg", alt: "Werkstatt" }] });
    expect((next.sections[0] as any).imageUrl).toBe("https://x/h.jpg");
    expect(next.sections.map(s => s.type)).toEqual(["hero", "services", "about", "gallery", "contact"]);
  });
  test("gallery: [] entfernt die Sektion; fehlende about-Sektion → about-Bild ignoriert", () => {
    const withGallery = applyImages(docFull, { gallery: [{ url: "https://x/g.jpg", alt: "a" }] });
    expect(applyImages(withGallery, { gallery: [] }).sections.some(s => s.type === "gallery")).toBe(false);
    const noAbout = { ...docFull, sections: docFull.sections.filter(s => s.type !== "about") };
    expect(applyImages(noAbout, { about: "https://x/a.jpg" }).sections.some(s => s.type === "about")).toBe(false);
  });
});
describe("applyTexts", () => {
  test("ändert nur die übergebenen Felder", () => {
    const next = applyTexts(docFull, { headline: "Neu", seoTitle: "SEO" });
    expect((next.sections[0] as any).headline).toBe("Neu"); expect((next.sections[0] as any).subheadline).toBeUndefined();
    expect(next.seo).toEqual({ title: "SEO", description: "d" }); expect(docFull.seo.title).toBe("t");
  });
});
describe("applyOffer", () => {
  test("ersetzt services durch menu an gleicher Position", () => {
    const next = applyOffer(docFull, { mode: "menu", categories: [{ name: "Pizza", items: [{ name: "Margherita", price: "9 €" }] }] });
    expect(next.sections.map(s => s.type)).toEqual(["hero", "menu", "about", "contact"]);
  });
  test("ohne vorhandene Angebotssektion wird nach hero eingefügt; es bleibt genau eine Angebotssektion", () => {
    const bare = { ...docFull, sections: [docFull.sections[0], docFull.sections[3]] };
    const next = applyOffer(bare, { mode: "services", headline: "Leistungen", items: [{ title: "A" }] });
    expect(next.sections.map(s => s.type)).toEqual(["hero", "services", "contact"]);
    const twice = applyOffer(next, { mode: "pricelist", categories: [{ name: "Haare", items: [{ name: "Schnitt", price: "25 €" }] }] });
    expect(twice.sections.filter(s => ["services", "menu", "pricelist"].includes(s.type))).toHaveLength(1);
  });
});
```
- [ ] **Step 2: Run — FAIL**
- [ ] **Step 3: Implementieren** (Hilfsfunktionen in applyPatch.ts):
```ts
const OFFER_TYPES = new Set(["services", "menu", "pricelist"]);
function replaceSection<T extends SectionType>(sections: SectionV2[], type: T, map: (s: SectionOf<T>) => SectionOf<T>): SectionV2[] {
  return sections.map(s => (s.type === type ? map(s as SectionOf<T>) : s));
}
function insertAfter(sections: SectionV2[], afterType: SectionType | null, section: SectionV2): SectionV2[] {
  const idx = afterType ? sections.findIndex(s => s.type === afterType) : -1;
  if (idx >= 0) return [...sections.slice(0, idx + 1), section, ...sections.slice(idx + 1)];
  const contactIdx = sections.findIndex(s => s.type === "contact");
  if (contactIdx >= 0) return [...sections.slice(0, contactIdx), section, ...sections.slice(contactIdx)];
  return [...sections, section];
}
export function applyImages(doc: WebsiteDataV2, patch: ImagesPatch): WebsiteDataV2 {
  let sections = doc.sections;
  if (patch.hero !== undefined) sections = replaceSection(sections, "hero", s => ({ ...s, imageUrl: patch.hero }));
  if (patch.about !== undefined) sections = replaceSection(sections, "about", s => ({ ...s, imageUrl: patch.about }));
  if (patch.gallery !== undefined) {
    const existing = sections.find(s => s.type === "gallery") as SectionOf<"gallery"> | undefined;
    const without = sections.filter(s => s.type !== "gallery");
    if (patch.gallery.length === 0) sections = without;
    else {
      const gallery: SectionOf<"gallery"> = { type: "gallery", ...(existing?.headline ? { headline: existing.headline } : { headline: "Einblicke" }), images: patch.gallery };
      sections = existing ? sections.map(s => (s.type === "gallery" ? gallery : s)) : insertAfter(without, without.some(s => s.type === "about") ? "about" : null, gallery);
    }
  }
  return WebsiteDataV2Schema.parse({ ...doc, sections });
}
export function applyTexts(doc: WebsiteDataV2, p: TextsPatch): WebsiteDataV2 {
  let sections = doc.sections;
  if (p.headline !== undefined || p.subheadline !== undefined || p.ctaText !== undefined)
    sections = replaceSection(sections, "hero", s => ({ ...s, ...(p.headline !== undefined ? { headline: p.headline } : {}), ...(p.subheadline !== undefined ? { subheadline: p.subheadline } : {}), ...(p.ctaText !== undefined ? { ctaText: p.ctaText } : {}) }));
  if (p.aboutHeadline !== undefined || p.aboutBody !== undefined)
    sections = replaceSection(sections, "about", s => ({ ...s, ...(p.aboutHeadline !== undefined ? { headline: p.aboutHeadline } : {}), ...(p.aboutBody !== undefined ? { body: p.aboutBody } : {}) }));
  const seo = { title: p.seoTitle ?? doc.seo.title, description: p.seoDescription ?? doc.seo.description };
  return WebsiteDataV2Schema.parse({ ...doc, sections, seo });
}
export function applyOffer(doc: WebsiteDataV2, offer: OfferPatch): WebsiteDataV2 {
  const firstIdx = doc.sections.findIndex(s => OFFER_TYPES.has(s.type));
  const without = doc.sections.filter(s => !OFFER_TYPES.has(s.type));
  const section: SectionV2 = offer.mode === "services"
    ? { type: "services", headline: offer.headline, ...(offer.intro ? { intro: offer.intro } : {}), items: offer.items }
    : { type: offer.mode, ...(offer.headline ? { headline: offer.headline } : {}), categories: offer.categories };
  let sections: SectionV2[];
  if (firstIdx >= 0) { const removedBefore = doc.sections.slice(0, firstIdx).filter(s => OFFER_TYPES.has(s.type)).length; const at = firstIdx - removedBefore; sections = [...without.slice(0, at), section, ...without.slice(at)]; }
  else sections = insertAfter(without, "hero", section);
  return WebsiteDataV2Schema.parse({ ...doc, sections });
}
```
- [ ] **Step 4: Run — PASS**; tsc.
- [ ] **Step 5: Commit** — `feat: onboardingV2 — Patch-Schemas (Bilder/Texte/Angebot/Rechtliches/Extras) und pure Patches`

---

### Task 4: Content-Prozeduren (Fotoquellen, Upload, Bilder, Texte, Angebot)

**Files:**
- Create: `server/onboardingV2/routerContent.ts`, `server/onboardingV2/routerContent.test.ts`
- Modify: `server/onboardingV2/router.ts` (Merge `...contentProcedures`)

**Interfaces:**
```ts
onboardingV2.getPhotoSources({ token }) → { gmb: string[]; stock: string[]; uploaded: string[] }
onboardingV2.uploadPhoto({ token, imageData: string (base64, max ~6 MB), mimeType: "image/jpeg"|"image/png"|"image/webp" }) → { url: string; uploaded: string[] }
onboardingV2.setImages({ token, patch: ImagesPatch }) → StudioState
onboardingV2.updateTexts({ token, patch: TextsPatch }) → StudioState   // setzt studioProgress.textsReviewed = true
onboardingV2.updateOffer({ token, offer: OfferPatch }) → StudioState
```
`getPhotoSources`: `gmb` über `getGmbPhotos(business.placeId, 7)` nur wenn placeId weder `self-` noch `email-`-Präfix; `stock` über `getIndustryImages(category, businessName)` → `[...hero.slice(0,6), ...gallery.slice(0,6)]` dedupliziert; `uploaded` = `onboarding.photoUrls`. `uploadPhoto`: `uploadPhoto(imageData, mimeType, website.id, uploaded.length)` aus `server/onboardingUpload.ts`, dann `photoUrls` in `onboarding_responses` anhängen (Row bei Bedarf via `createOnboarding` anlegen).

- [ ] **Step 1: Failing Tests** (Mock-Setup wie `router.test.ts`, zusätzlich `vi.mock("../onboardingUpload", () => ({ uploadPhoto: vi.fn().mockResolvedValue({ url: "https://cdn/x.jpg", key: "k" }) }))`, `vi.mock("../gmbPhotos", () => ({ getGmbPhotos: vi.fn().mockResolvedValue(["https://g/1.jpg"]) }))`):
```ts
describe("onboardingV2.getPhotoSources", () => {
  test("liefert gmb (nur echte placeId), stock und uploaded", async () => {
    mockedDb.getBusinessById.mockResolvedValue({ id: 7, name: "Brandt", category: "Tischler", placeId: "ChIJabc" } as any);
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue({ websiteId: 42, photoUrls: ["https://u/1.jpg"] } as any);
    const r = await caller().onboardingV2.getPhotoSources({ token: "tok" });
    expect(r.gmb).toEqual(["https://g/1.jpg"]); expect(r.stock.length).toBeGreaterThan(0); expect(r.uploaded).toEqual(["https://u/1.jpg"]);
  });
  test("self-placeId → gmb leer ohne Google-Aufruf", async () => {
    mockedDb.getBusinessById.mockResolvedValue({ id: 7, name: "B", category: "Tischler", placeId: "self-x" } as any);
    const r = await caller().onboardingV2.getPhotoSources({ token: "tok" });
    expect(r.gmb).toEqual([]); expect(getGmbPhotos).not.toHaveBeenCalled();
  });
});
describe("onboardingV2.uploadPhoto", () => {
  test("lädt hoch und hängt URL an photoUrls an", async () => {
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue({ websiteId: 42, photoUrls: ["https://u/1.jpg"] } as any);
    const r = await caller().onboardingV2.uploadPhoto({ token: "tok", imageData: "data:image/jpeg;base64,AAAA", mimeType: "image/jpeg" });
    expect(r.url).toBe("https://cdn/x.jpg"); expect(r.uploaded).toEqual(["https://u/1.jpg", "https://cdn/x.jpg"]);
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(42, expect.objectContaining({ photoUrls: ["https://u/1.jpg", "https://cdn/x.jpg"] }));
  });
});
describe("onboardingV2.setImages / updateTexts / updateOffer", () => {
  test("setImages persistiert hinter Guard und invalidiert Cache", async () => {
    const s = await caller().onboardingV2.setImages({ token: "tok", patch: { hero: "https://x/h.jpg" } });
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(42, expect.objectContaining({ websiteData: expect.objectContaining({ version: 2 }) }));
    expect(invalidateSsrCache).toHaveBeenCalledWith("preview-brandt");
    expect((s.doc!.sections[0] as any).imageUrl).toBe("https://x/h.jpg");
  });
  test("updateTexts markiert texts als erledigt", async () => {
    const s = await caller().onboardingV2.updateTexts({ token: "tok", patch: { headline: "Neu" } });
    expect(s.checklist.find(i => i.id === "texts")?.status).toBe("done");
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(42, expect.objectContaining({ studioProgress: expect.objectContaining({ textsReviewed: true }) }));
  });
  test("updateOffer: ungültiger Patch (0 items) → BAD_REQUEST, kein Write", async () => {
    await expect(caller().onboardingV2.updateOffer({ token: "tok", offer: { mode: "services", headline: "L", items: [] } as any })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });
  test("updateOffer menu ersetzt services", async () => {
    const s = await caller().onboardingV2.updateOffer({ token: "tok", offer: { mode: "menu", categories: [{ name: "Pizza", items: [{ name: "Margherita", price: "9 €" }] }] } });
    expect(s.doc!.sections.map(x => x.type)).toContain("menu"); expect(s.doc!.sections.map(x => x.type)).not.toContain("services");
  });
});
```
- [ ] **Step 2: Run — FAIL**
- [ ] **Step 3: Implementieren** `routerContent.ts`:
```ts
export const contentProcedures = {
  getPhotoSources: publicProcedure.input(tokenInput).query(async ({ input, ctx }) => { … }),
  uploadPhoto: publicProcedure.input(tokenInput.extend({ imageData: z.string().min(10).max(8_000_000), mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]) })).mutation(…),
  setImages: publicProcedure.input(tokenInput.extend({ patch: ImagesPatchSchema })).mutation(async ({ input, ctx }) => {
    const loaded = await loadStudioWebsite(input.token, ctx.user); const doc = requireDoc(loaded);
    return persistDoc(input.token, loaded, applyImages(doc, input.patch));
  }),
  updateTexts: … persistDoc(input.token, loaded, applyTexts(doc, input.patch), { progress: { textsReviewed: true } }),
  updateOffer: … persistDoc(input.token, loaded, applyOffer(doc, input.offer)),
};
```
`tokenInput` nach `state.ts` exportieren. zod-Fehler werden von tRPC automatisch zu BAD_REQUEST.
- [ ] **Step 4: Run — PASS**; tsc.
- [ ] **Step 5: Commit** — `feat: onboardingV2 — Fotoquellen, Upload, setImages/updateTexts/updateOffer`

---

### Task 5: KI-Vorschläge für Texte und Angebot

**Files:**
- Create: `server/onboardingV2/suggest.ts`, `server/onboardingV2/suggest.test.ts`
- Modify: `server/onboardingV2/routerContent.ts` (+ `suggestTexts`, `suggestOffer`), `routerContent.test.ts`

**Interfaces:**
```ts
// suggest.ts
export type TextField = "headline" | "subheadline" | "aboutBody" | "seoTitle" | "seoDescription";
export async function suggestTextVariants(args: { field: TextField; doc: WebsiteDataV2; businessName: string; category: string; city?: string }): Promise<string[]>  // genau 3 Varianten, gefiltert auf Länge je Feld (headline ≤ 120, seoTitle ≤ 70, seoDescription ≤ 170, aboutBody ≤ 2000)
export async function suggestOffer(args: { mode: "services" | "menu" | "pricelist"; businessName: string; category: string }): Promise<OfferPatch>   // 6 Leistungen bzw. 3 Kategorien à 3–5 Positionen, Preise als Platzhalter "ab … €" nur bei pricelist/menu
onboardingV2.suggestTexts({ token, field: TextField }) → { variants: string[] }
onboardingV2.suggestOffer({ token, mode }) → { offer: OfferPatch }
```
LLM über `invokeLLM` (`server/_core/llm.ts`) mit `response_format: { type: "json_schema", json_schema: { name, strict: true, schema } }` wie `suggestServices` in routers.ts; Ergebnis IMMER durch zod (`z.array(z.string()).length(3)` bzw. `OfferPatchSchema`) validieren; bei Fehler genau 1 Retry, dann TRPCError INTERNAL_SERVER_ERROR „Die KI konnte gerade keinen Vorschlag liefern — bitte noch einmal versuchen." Prompt enthält Verfassungs-`llmHints` (`getConstitution(doc.stylePackId).llmHints`) und verbietet URLs/Kontaktdaten. Rate-Limit: max. 30 Vorschlags-Aufrufe pro Website und Stunde (prozesslokale Map websiteId → {count, windowStart}); darüber TRPCError TOO_MANY_REQUESTS „Zu viele KI-Anfragen — bitte in einer Stunde erneut."

- [ ] **Step 1: Failing Tests** (`vi.mock("../_core/llm", () => ({ invokeLLM: vi.fn() }))`):
```ts
test("suggestTextVariants liefert 3 validierte Varianten aus LLM-JSON", async () => {
  vi.mocked(invokeLLM).mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ variants: ["A", "B", "C"] }) } }] } as any);
  await expect(suggestTextVariants({ field: "headline", doc, businessName: "B", category: "Tischler" })).resolves.toEqual(["A", "B", "C"]);
});
test("ungültiges JSON → ein Retry, dann Fehler", async () => {
  vi.mocked(invokeLLM).mockResolvedValueOnce({ choices: [{ message: { content: "kaputt" } }] } as any).mockResolvedValueOnce({ choices: [{ message: { content: "{}" } }] } as any);
  await expect(suggestTextVariants({ field: "headline", doc, businessName: "B", category: "T" })).rejects.toThrow(); expect(invokeLLM).toHaveBeenCalledTimes(2);
});
test("suggestOffer menu → OfferPatch valide", async () => { … mock liefert {mode:"menu",categories:[…]} … expect(OfferPatchSchema.safeParse(r).success).toBe(true); });
// routerContent.test.ts
test("suggestTexts: 31. Aufruf in der Stunde → TOO_MANY_REQUESTS", async () => { … 30× ok, 31. rejects code TOO_MANY_REQUESTS });
```
- [ ] **Step 2: Run — FAIL**
- [ ] **Step 3: Implementieren** (Prompt-Bausteine je Feld: headline „max 6 Wörter, konkret, kein Marketing-Blabla", subheadline „1 Satz Nutzen + Ort", aboutBody „120–180 Wörter, Wir-Form, 3 Absätze mit \n\n", seoTitle „≤ 60 Zeichen mit Ort", seoDescription „≤ 155 Zeichen, Handlungsaufforderung"). Rate-Limiter in `suggest.ts` (`export function assertSuggestQuota(websiteId: number, now = Date.now()): void`, `export function resetSuggestQuotaForTests()`).
- [ ] **Step 4: Run — PASS**; tsc.
- [ ] **Step 5: Commit** — `feat: onboardingV2 — KI-Vorschläge für Texte und Angebot (validiert, Retry, Stundenlimit)`

---

### Task 6: Commerce-Prozeduren — Rechtliches, Extras, E-Mail

**Files:**
- Create: `server/onboardingV2/routerCommerce.ts`, `server/onboardingV2/routerCommerce.test.ts`
- Modify: `server/onboardingV2/router.ts` (Merge `...commerceProcedures`)

**Interfaces:**
```ts
onboardingV2.updateLegal({ token, legal: LegalPatch }) → StudioState
onboardingV2.updateAddons({ token, addOns: AddonsPatch }) → StudioState   // studioProgress.addonsReviewed = true
onboardingV2.setCustomerEmail({ token, email, marketingConsent?: boolean }) → StudioState
```
`updateLegal`: (1) `onboarding_responses` schreiben (legalOwner/Street/Zip/City/Email/Phone/VatId, `legalCountry: "Deutschland"`, Row via createOnboarding anlegen falls fehlt); (2) `generateImpressum/generateDatenschutz({ businessName: doc.businessName, …legal, websiteUrl: `https://${website.slug}.pageblitz.de` })`; (3) `applyOnboardingToV2(doc, { impressumHtml, datenschutzHtml, legalPhone, legalEmail, legalStreet, legalZip, legalCity, openingHours })`; (4) `persistDoc(..., { extra: { hasLegalPages: true } })`. `updateAddons`: `updateOnboarding` mit `addOnContactForm/addOnGallery/addOnMenu/addOnPricelist/addOnAiChat/addOnBooking/addOnTeam` + `mergeStudioProgress({ addonsReviewed: true })` + `buildState` (kein Dokument-Write). `setCustomerEmail`: `updateWebsite({ customerEmail, captureStatus: "email_captured", marketingConsent/At })` + Lifecycle-Mails wie `selfService.saveCustomerEmail` (dynamischer Import `../_core/lifecycleScheduler`, Fehler nur loggen) + `buildState`.

- [ ] **Step 1: Failing Tests** (Mock `../legalGenerator` NICHT — echte Generatoren nutzen und im Ergebnis `legal.impressumHtml` auf `Max Brandt` prüfen; `vi.mock("../_core/lifecycleScheduler", () => ({ sendImmediateWelcomeEmail: vi.fn(), scheduleInitialLifecycleEmails: vi.fn() }))`):
```ts
const legal = { legalOwner: "Max Brandt", legalStreet: "Weg 1", legalZip: "44135", legalCity: "Dortmund", legalEmail: "m@b.de", legalPhone: "0231 1", openingHours: [{ day: "Mo–Fr", hours: "9–17 Uhr" }] };
test("updateLegal: schreibt Onboarding-Row, generiert Rechtstexte, patcht contact + legal, Checkliste legal done", async () => {
  const s = await caller().onboardingV2.updateLegal({ token: "tok", legal });
  expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(42, expect.objectContaining({ legalOwner: "Max Brandt", legalZip: "44135" }));
  expect(s.doc!.legal!.impressumHtml).toContain("Max Brandt");
  const contact = s.doc!.sections.find(x => x.type === "contact") as any; expect(contact.phone).toBe("0231 1"); expect(contact.openingHours).toEqual(legal.openingHours);
  expect(mockedDb.updateWebsite).toHaveBeenCalledWith(42, expect.objectContaining({ hasLegalPages: true }));
  expect(s.checklist.find(i => i.id === "legal")?.status).toBe("done");
});
test("updateLegal: PLZ ungültig → BAD_REQUEST, kein Write", …);
test("updateAddons: Flags persistiert, addonsReviewed, kein Dokument-Write", async () => {
  const s = await caller().onboardingV2.updateAddons({ token: "tok", addOns: { contactForm: true, gallery: false, menu: false, pricelist: false, aiChat: true, booking: false, team: false } });
  expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(42, expect.objectContaining({ addOnContactForm: true, addOnAiChat: true, addOnGallery: false }));
  expect(mockedDb.updateWebsite).not.toHaveBeenCalled(); expect(s.addOns.aiChat).toBe(true);
});
test("setCustomerEmail: speichert E-Mail + captureStatus, checkoutReady hängt an legal", async () => {
  const s = await caller().onboardingV2.setCustomerEmail({ token: "tok", email: "kunde@x.de" });
  expect(mockedDb.updateWebsite).toHaveBeenCalledWith(42, expect.objectContaining({ customerEmail: "kunde@x.de", captureStatus: "email_captured" }));
  expect(s.customerEmail).toBe("kunde@x.de");
});
```
Hinweis Mock-Verhalten: Da `updateOnboarding`/`updateWebsite` gemockt sind, liest `buildState` die Legal-Werte nicht aus der DB — `updateLegal` übergibt daher `progressOverride` NICHT, sondern baut den State mit einem `legalOverride`-Parameter (analog progressOverride) ODER ruft `buildState` mit dem gepatchten `loaded` auf und akzeptiert, dass `legal.*` aus dem (gemockten) Onboarding-Read kommt: Für den Test `legal done` muss `getOnboardingByWebsiteId` im Test NACH dem Write die neuen Werte liefern → im Test `mockedDb.updateOnboarding.mockImplementation(async (_id, data) => { onboardingRow = { ...onboardingRow, ...data }; })` und `getOnboardingByWebsiteId.mockImplementation(async () => onboardingRow)`. So bleibt der Server-Code ohne Override-Sonderfall.
- [ ] **Step 2: Run — FAIL**
- [ ] **Step 3: Implementieren** `routerCommerce.ts` (`commerceProcedures`), Helfer `upsertOnboarding(websiteId, patch)` in `state.ts` (liest Row, `updateOnboarding` oder `createOnboarding` mit Pflichtfeldern + patch) — wiederverwendet von `mergeStudioProgress`.
- [ ] **Step 4: Run — PASS**; tsc.
- [ ] **Step 5: Commit** — `feat: onboardingV2 — updateLegal (Rechtstexte + Kontakt), updateAddons, setCustomerEmail`

---

### Task 7: Checkout-Prozedur (Stripe) mit Ownership

**Files:**
- Create: `server/onboardingV2/checkout.ts`, `server/onboardingV2/checkout.test.ts`
- Modify: `server/onboardingV2/routerCommerce.ts` (+ `createCheckout`), `routerCommerce.test.ts`

**Interfaces:**
```ts
// checkout.ts
export interface CheckoutArgs { websiteId: number; websiteName: string; userId: number | null; customerEmail: string; origin: string; token: string; billingInterval: BillingInterval; addOns: AddOnFlags }
export async function createStudioCheckoutSession(args: CheckoutArgs, stripeClient = defaultStripe): Promise<{ url: string; sessionId: string; totalCents: number }>
// Metadaten EXAKT wie checkout.createSession (stripeWebhook.ts liest sie): { websiteId, userId: "0"|id, billingInterval, addOns: JSON.stringify({contactForm,gallery,menu,pricelist,aiChat,booking,team}), totalAmount }
// success_url `${origin}/my-website?checkout=success`, cancel_url `${origin}/onboarding/${token}`, mode subscription, trial 7 Tage, tax_behavior inclusive, customer_email = customerEmail
onboardingV2.createCheckout({ token, billingInterval }) → { url: string }
```
`createCheckout`: `loadStudioWebsite`; `requireDoc`; Zustand bauen; wenn `!state.checkoutReady` → BAD_REQUEST „Bitte zuerst Impressum-Angaben und E-Mail-Adresse vervollständigen."; `addOns` aus `state.addOns`; Session erzeugen; danach `updateWebsite({ onboardingStatus: "completed", captureStatus: "onboarding_completed" })` + `updateOnboarding({ status: "completed", completedAt, updatedAt })`; `{ url }` zurück. (Aktivierung/Subscription macht der bestehende Webhook.)

- [ ] **Step 1: Failing Tests** — `checkout.test.ts` mit Fake-Stripe (`{ checkout: { sessions: { create: vi.fn().mockResolvedValue({ url: "https://stripe/s", id: "cs_1" }) } } }`): prüft line_items unit_amount = `calcTotalCents`, metadata-Shape, URLs. `routerCommerce.test.ts`: `createCheckout` ohne Legal → BAD_REQUEST ohne Stripe-Aufruf; mit vollständigem Zustand → `{ url }`, `updateWebsite` mit `onboardingStatus: "completed"`.
- [ ] **Step 2: Run — FAIL**
- [ ] **Step 3: Implementieren** (`defaultStripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")` in checkout.ts; Description wie im Original: `"19,90 €/Mo Basis (Jahresabo) + Bildergalerie + …"`).
- [ ] **Step 4: Run — PASS**; tsc.
- [ ] **Step 5: Commit** — `feat: onboardingV2 — createCheckout (Stripe-Session mit Webhook-kompatiblen Metadaten, Ownership)`

---

### Task 8: Client — PanelFrame + PhotosPanel

**Files:**
- Create: `client/src/pages/onboarding-v2/panels/PanelFrame.tsx`, `panels/PhotosPanel.tsx`, `panels/PhotosPanel.test.tsx`
- Modify: `client/src/pages/onboarding-v2/studio.css`, `StudioPage.tsx` (Slot `photos`)

**Interfaces:**
```tsx
export function PanelFrame(props: { step: string; title: string; intro?: string; children: React.ReactNode; footer: React.ReactNode }): JSX.Element  // Kopf (Kicker „Schritt N", h2), Body, Fuß (Buttons)
export function PhotosPanel(props: { token: string; doc: WebsiteDataV2; onApplied: () => void; onClose: () => void }): JSX.Element
export function PhotoTargetPicker(props: { target: "hero"|"about"|"gallery"; onTarget: (t) => void; hasAbout: boolean }): JSX.Element  // reine Darstellung (testbar)
export function PhotoGrid(props: { photos: string[]; selected: string[]; onPick: (url: string) => void; emptyText: string }): JSX.Element  // reine Darstellung (testbar)
```
Verhalten: Ziel wählen (Hero / Über uns [nur wenn about-Sektion existiert] / Galerie [Mehrfachauswahl, max 12]); Quellen-Tabs „Google-Fotos | Stockbilder | Hochladen" (Daten aus `getPhotoSources`; Stock-Tab zusätzlich `StockPhotoSearch`-Komponente mit `onSelect` — vorhandene Komponente `client/src/components/StockPhotoSearch.tsx`); Upload per `<input type="file" accept="image/*">` → FileReader → base64 → `uploadPhoto` → erscheint unter „Hochgeladen" + wird direkt gewählt; „Übernehmen" → `setImages({ hero?|about?|gallery? })` je nach Ziel (Galerie: `{url, alt: businessName}`), danach `onApplied()`; „Fertig" schließt. Fehler `role="alert"`.

- [ ] **Step 1: Failing Tests** (statisch): `PhotoGrid` rendert Buttons mit `aria-pressed` für `selected`, zeigt `emptyText` bei []; `PhotoTargetPicker` blendet „Über uns" ohne `hasAbout` aus.
- [ ] **Step 2–3:** Implementieren (CSS: `.pb-studio-photo-grid` 3 Spalten Thumbnails `aspect-ratio: 4/3`, `object-fit: cover`, gewählte mit Accent-Ring; `.pb-studio-src-tabs` = `.pb-studio-seg`). StudioPage: `activeId === "photos"` → `<PhotosPanel token doc={state.doc} onApplied={() => { studio.refetch(); studio.bumpPreview(); }} onClose={() => setActiveId(null)} />`.
- [ ] **Step 4: Run — PASS**; tsc; manuell im Dev-Server (Seed → Fotos → Stockbild auf Hero → Preview zeigt Bild, Checkliste Fotos ✓).
- [ ] **Step 5: Commit** — `feat: Studio — Fotos-Panel (Google/Stock/Upload → Hero/Über uns/Galerie)`

---

### Task 9: Client — TextsPanel + OfferPanel

**Files:**
- Create: `panels/TextsPanel.tsx`, `panels/OfferPanel.tsx`, `panels/OfferPanel.test.tsx`, `panels/TextsPanel.test.tsx`
- Modify: `studio.css`, `StudioPage.tsx` (Slots `texts`, `offer`)

**Interfaces:**
```tsx
export function TextsPanel(props: { token: string; doc: WebsiteDataV2; onApplied: () => void; onClose: () => void }): JSX.Element
export function TextsForm(props: { values: TextsPatch; onChange: (v: TextsPatch) => void; onSuggest: (field: TextField) => void; suggesting: TextField | null; variants: Partial<Record<TextField, string[]>>; onPickVariant: (field, value) => void }): JSX.Element  // rein
export function OfferPanel(props: { token: string; doc: WebsiteDataV2; onApplied: () => void; onClose: () => void }): JSX.Element
export function OfferEditor(props: { value: OfferPatch; onChange: (v: OfferPatch) => void }): JSX.Element  // rein: Modus-Segment (Leistungen | Speisekarte | Preisliste), Listen-Editor (Zeile hinzufügen/entfernen, Felder)
export function offerFromDoc(doc: WebsiteDataV2): OfferPatch   // bestehende Sektion → Patch; keine → { mode: "services", headline: "Leistungen", items: [{ title: "" }] }
export function textsFromDoc(doc: WebsiteDataV2): TextsPatch
```
Texte: Felder Headline, Subheadline, CTA-Text, Über-uns-Überschrift, Über-uns-Text (Textarea), SEO-Titel (Zähler /70), SEO-Beschreibung (Zähler /170); je Textfeld Button „KI-Vorschlag" → `suggestTexts` → 3 Varianten als klickbare Chips; „Speichern" → `updateTexts` (nur geänderte Felder senden) → `onApplied`. Angebot: `OfferEditor`; Button „KI-Vorschlag" → `suggestOffer({mode})` füllt den Editor (ersetzt, mit Rückfrage-Hinweis); „Speichern" → `updateOffer`.

- [ ] **Step 1: Failing Tests**: `textsFromDoc`/`offerFromDoc` (pure) + statisches Rendern von `OfferEditor` (Modus-Segment, eine Zeile) und `TextsForm` (Zähler zeigt `12/70`).
- [ ] **Step 2–3:** Implementieren (Formulare mit lokalem State, kein RHF nötig; Eingaben `className="pb-studio-input"`/`pb-studio-textarea` in studio.css).
- [ ] **Step 4: Run — PASS**; tsc; manuell (Text ändern → Preview; KI-Vorschlag → Chips; Angebot auf Speisekarte → Preview zeigt Speisekarte, Checkliste Angebot ✓).
- [ ] **Step 5: Commit** — `feat: Studio — Texte-Panel mit KI-Vorschlägen und Angebot-Panel (Leistungen/Speisekarte/Preisliste)`

---

### Task 10: Client — LegalPanel, AddonsPanel, CheckoutBar, StudioPage-Verdrahtung

**Files:**
- Create: `panels/LegalPanel.tsx`, `panels/AddonsPanel.tsx`, `panels/AddonsPanel.test.tsx`, `CheckoutBar.tsx`, `CheckoutBar.test.tsx`
- Modify: `studio.css`, `StudioPage.tsx`

**Interfaces:**
```tsx
export function LegalPanel(props: { token: string; initial: StudioLegal; openingHours: {day,hours}[]; onApplied: () => void; onClose: () => void }): JSX.Element  // react-hook-form + zodResolver(LegalPatchSchema); Öffnungszeiten als Zeilenliste (day/hours), „+ Zeile"
export function AddonsPanel(props: { token: string; addOns: AddOnFlags; onApplied: () => void; onClose: () => void }): JSX.Element
export function AddonsList(props: { value: AddOnFlags; onToggle: (k: AddOnKey) => void; interval: BillingInterval }): JSX.Element  // rein: Schalter je Add-on mit Preis, Summe über calcTotalCents
export function CheckoutBar(props: { state: StudioState; token: string; onStateChanged: () => void }): JSX.Element
export function CheckoutSummary(props: { interval: BillingInterval; addOns: AddOnFlags; ready: boolean; hasEmail: boolean; missing: string[] }): JSX.Element  // rein
```
CheckoutBar (immer unten in der linken Spalte): Abrechnung monatlich/jährlich (Segment, Default jährlich, Hinweis „2 Monate gratis" als ruhiger Text, kein Badge), Summe „19,90 €/Monat + Extras", fehlende Pflichtpunkte als Liste („Impressum-Angaben", „E-Mail-Adresse"), E-Mail-Feld + „Speichern" (`setCustomerEmail`) falls `customerEmail` leer, Button „Website freischalten" (disabled bis `checkoutReady`) → `createCheckout` → `window.location.assign(url)`. Add-on-Hinweis: Team/Kontaktformular/KI-Chat/Buchung „werden nach dem Freischalten im Dashboard eingerichtet" (Inhalte kommen in B3).
StudioPage: Slots `legal`, `addons`; Platzhalter-Zweig entfällt; `<CheckoutBar>` unter der Checkliste (nur wenn kein Panel offen).

- [ ] **Step 1: Failing Tests**: `AddonsList` (Summe bei gallery+aiChat jährlich = „33,70 €"), `CheckoutSummary` (listet fehlende Punkte; Button-Zustand wird in CheckoutBar geprüft → statisch: `disabled` ohne ready).
- [ ] **Step 2–3:** Implementieren.
- [ ] **Step 4: Run — PASS**; tsc; `npx vite build`; manuell: Seed → Rechtliches ausfüllen → Checkliste ✓ → E-Mail speichern → Button aktiv (Klick erzeugt echte Stripe-Session nur mit echtem Key — lokal ohne Key erwartete Fehlermeldung im `role="alert"`).
- [ ] **Step 5: Commit** — `feat: Studio — Rechtliches-Panel, Extras-Panel, Checkout-Leiste`

---

### Task 11: E2E-Flow, Baselines, Doku

**Files:**
- Modify: `tests/visual/studio.spec.ts` (+ Tests), `tests/visual/studio.spec.ts-snapshots/` (neu erzeugen), `docs/superpowers/specs/2026-08-21-flag-aktivierung.md` (§6 ergänzen: Studio-Checkout nutzt denselben Webhook; Rate-Limit KI-Vorschläge; Upload-Pfad)

- [ ] **Step 1: Tests** — (a) „Rechtliches-Panel desktop": Panel öffnen, Screenshot `.pb-studio-rail`; (b) „Checkout-Flow": Seed → Rechtliches ausfüllen (Formular per `getByLabel`) → Speichern → Checkliste zeigt „Rechtliches … Erledigt" → E-Mail eingeben + speichern → Button „Website freischalten" ist `enabled` (NICHT klicken); (c) „Fotos-Panel desktop" Screenshot nach Stock-Tab; (d) bestehende 4 Tests bleiben. Reload-Test: nach (b) `page.reload()` → Checkliste weiterhin ✓ (Spec §8.1 Reload-Garantie).
- [ ] **Step 2: Baselines** — alte Studio-PNGs löschen, `--update-snapshots`, dann zweimal ohne (grün); `packs.spec.ts` unverändert grün.
- [ ] **Step 3: Doku** ergänzen; Commit — `test: Studio-E2E (Rechtliches → Checkout-bereit, Reload) + Baselines + Doku`

---

## Abschluss Plan B2
- `npx vitest run` (nur bekannte env-Fails), `npm run check` (keine neuen Fehler), `npx playwright test` (Packs + Studio grün), `npx vite build`.
- Screenshots der neuen Panels dem User zeigen; danach Plan B3 (KI-Chat, `features`, SSR-Inseln).
