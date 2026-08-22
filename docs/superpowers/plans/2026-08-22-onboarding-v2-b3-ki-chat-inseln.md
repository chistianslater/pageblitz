# Onboarding v2 — Plan B3 „KI-Chat, Features & SSR-Inseln" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Das Studio bekommt den freien **KI-Chat** („Was soll anders sein?") mit Diff-Vorschau; der v2-Vertrag bekommt das **`features`-Feld**; bezahlte Add-ons werden **nach Zahlung aktiviert** (Webhook → Website-Flags + Dokument); Kundenseiten (SSR) bekommen **Inseln** für Kontaktformular, KI-Widget und Terminbuchung — pack-agnostisch über `--pb-*`-Tokens, mit No-JS-Fallback für das Formular.

**Architecture:** Inhalt bleibt im strikten v2-Dokument; `features` ist ein additives, striktes Objekt `{ contactForm?, aiChat?, booking? }`. SSR rendert Inseln als statisches Markup nach der Pack-Seite (`SiteIslands`), das Kontaktformular wird per Skript in die Kontakt-Sektion (`#kontakt`) verschoben; ein kleines esbuild-Bundle (`/islands/site-islands.js`, React) hydratisiert die Inseln nur, wenn mindestens ein Feature aktiv ist. APIs: neuer Express-Endpunkt `/api/site/:slug/contact` (Logik aus `contact.submit` extrahiert, JSON + Form-POST), bestehende `/api/chat/:slug/message` und `/api/booking/:slug/*` (gated über Website-Flags, die der Webhook setzt). KI-Chat: `aiEdit` liefert einen validierten Vorschlag (Inhalt ODER Stil-Vorschlag) mit Diff, `applyAiEdit` persistiert über `persistDoc`.

**Scope-Grenzen:** Unterseiten-Add-on (`subpages`) → nach B4 (eigener Plan); Team-Add-on bleibt „bald verfügbar" (Team-Panel fehlt); Cutover/Löschung → **Plan B4**.

**Tech Stack:** wie B1/B2 + esbuild (vorhanden) für das Inseln-Bundle; React 19 `hydrateRoot`/`createRoot`; Stripe-Webhook (vorhanden).

**Spec:** `docs/superpowers/specs/2026-08-21-onboarding-v2-design.md` (§4 Punkt 6, §5, §9 Risiko „Add-ons ohne Sektion"). Vorarbeit B2: `server/onboardingV2/{state,routerContent,routerCommerce,suggest,checkout}.ts`, `shared/pricing.ts` (`BOOKABLE_ADDON_KEYS`, `sanitizeAddOns`), `client/src/pages/onboarding-v2/**`, `server/ssr/renderSite.tsx` (`renderSiteHtml`), `client/src/components/site/SiteRenderer.tsx`, `server/stripeWebhook.ts`, `server/_core/{chatRoutes,bookingRoutes,static}.ts`, `server/routers.ts` `contact.submit`.

## Global Constraints

- Deutsch in UI-Texten/Meldungen/Kommentaren/Commits; Commit-Format `<type>: <beschreibung>` **ohne** Co-Authored-By.
- Jede Dokument-Mutation über `persistDoc`; `legal.*` unangetastet; Vertrag bleibt `.strict()` — `features` ist additiv und optional, bestehende Fixtures/Dokumente bleiben gültig.
- Inseln: CSS nur über `--pb-*`-Variablen + eigene `pb-island-*`-Klassen (keine Tailwind-Klassen — auf Kundenseiten gibt es kein Tailwind), kein Inline-JS im HTML außer dem Bundle-Tag; kein localStorage außer `sessionStorage`-Session-ID für den Chat (wie v1).
- Sicherheit: Kontakt-Endpunkt mit Honeypot + IP-Limit (5/h) wie `contact.submit`; Chat/Buchung bleiben hinter `website.addOnAiChat`/`addOnBooking`; KI-Chat-Vorschläge werden NIE ohne expliziten `applyAiEdit` persistiert; Quota 20 Vorschläge/Website/Stunde; Prompt verbietet URLs/Kontaktdaten/Rechtstexte; Design-Wünsche → Pack-Vorschlag, nie Farb-/Font-Patch.
- `server/routers.ts` darf nur schrumpfen (Extraktion der Kontakt-Logik); Dateien < 400 Zeilen; tsc-Gate: keine neuen Fehler (Baseline 73); Vitest: bekannte env-Fails dürfen bleiben; Playwright PORT=3005, Port 3000 nie; Inseln-Bundle muss vor Playwright gebaut sein (`npm run build:islands`).
- Prozess: keine parallelen Implementierer im selben Arbeitsbaum; Playwright-Läufe als getrennte kurze Befehle; `git add <paths>` explizit.

---

## Dateistruktur (B3)

```
shared/siteContract/schema.ts            ← FeaturesSchema (strict, optional) im WebsiteDataV2Schema
shared/siteContract/types.ts             ← SiteFeatures
shared/onboardingV2/aiEdit.ts            ← zod: AiEditResponseSchema (content | style), AiEditDiff-Typen
server/onboardingV2/applyPatch.ts        ← + applyFeatures(doc, features)
server/onboardingV2/aiEdit.ts            ← Prompt, LLM-Aufruf, Validierung, Diff, Proposal-Store (TTL 10 min), Quota
server/onboardingV2/routerAi.ts          ← aiEdit, applyAiEdit, discardAiEdit
server/onboardingV2/routerCommerce.ts    ← updateAddons setzt features (contactForm/aiChat/booking) im Dokument; Sperre nur noch für team
shared/pricing.ts                        ← BOOKABLE_ADDON_KEYS = alle außer team
server/stripeWebhook.ts                  ← 7 Add-on-Keys; Website-Flags addOnAiChat/addOnBooking/addOnTeam; v2: features im Dokument
server/_core/magicLinkAuth.ts / db.ts    ← Post-Checkout: Abo mit userId 0 an Konto mit gleicher E-Mail binden
server/contactSubmit.ts                  ← submitContactRequest(...) (aus contact.submit extrahiert) + Express-Endpunkt /api/site/:slug/contact
client/src/components/site/islands/{islandsCss.ts,ContactFormIsland.tsx,ChatIsland.tsx,BookingIsland.tsx,SiteIslands.tsx}
client/src/site-islands/main.tsx         ← Hydration-Entry (esbuild → dist/public/islands/site-islands.js)
scripts/build-islands.mjs                ← esbuild-Konfiguration; package.json: build:islands, build (erweitert)
server/_core/index.ts                    ← express.static für /islands (dev + prod)
server/ssr/renderSite.tsx                ← Bundle-Tag + Inseln-CSS, wenn Features aktiv
client/src/components/site/SiteRenderer.tsx ← <SiteIslands> nach der Pack-Seite
client/src/pages/onboarding-v2/AiChat.tsx, panels/AddonsPanel.tsx, panels/StylePanel.tsx (preselect), StudioPage.tsx
tests/visual/{studio.spec.ts,islands.spec.ts}; shared/siteContract/fixtures.ts (+ Fixture mit features)
docs/superpowers/specs/2026-08-21-flag-aktivierung.md (§6/§7)
```

---

### Task 1: `features` im Vertrag + `applyFeatures`

**Files:** Modify `shared/siteContract/schema.ts`, `shared/siteContract/types.ts`, `shared/siteContract/fixtures.ts` (+ Fixture-Variante `withFeatures` für werkbank), `shared/siteContract/schema.test.ts`, `server/onboardingV2/applyPatch.ts` (+test).

**Interfaces:**
```ts
export const FeaturesSchema = z.object({ contactForm: z.boolean().optional(), aiChat: z.boolean().optional(), booking: z.boolean().optional() }).strict();
// WebsiteDataV2Schema: features: FeaturesSchema.optional()
export type SiteFeatures = z.infer<typeof FeaturesSchema>;
export function applyFeatures(doc: WebsiteDataV2, patch: SiteFeatures): WebsiteDataV2   // merge, false-Werte werden entfernt (kein features-Objekt mit nur false), validiert
export function getFixture(packId, kind: "full" | "minimal" | "features"): WebsiteDataV2  // "features" = full + { features: { contactForm: true, aiChat: true, booking: true } }
```
- [ ] Tests (FAIL→PASS): Schema akzeptiert `features: {contactForm:true}`, lehnt Fremdfeld ab; `applyFeatures` mergt/entfernt false; Fixture „features" valide für alle 14 Packs (Loop wie bestehender Fixture-Test).
- [ ] Commit `feat: v2-Vertrag — features (contactForm/aiChat/booking) + applyFeatures`

### Task 2: Add-on-Aktivierung nach Zahlung (Webhook) + buchbare Add-ons erweitern

**Files:** Modify `server/stripeWebhook.ts` (+ `server/stripeWebhook.test.ts` neu, Handler-Funktion extrahieren: `handleCheckoutCompleted(session, deps)`), `shared/pricing.ts` (`BOOKABLE_ADDON_KEYS` = contactForm, gallery, menu, pricelist, aiChat, booking; `team` bleibt gesperrt), `server/onboardingV2/routerCommerce.ts` (`updateAddons`: zusätzlich `applyFeatures(doc, { contactForm, aiChat, booking })` über `persistDoc`; Sperrmeldung nur noch „Team"), Tests.

**Verhalten Webhook `checkout.session.completed`:** `addOns` aus Metadaten mit allen 7 Keys normalisieren (Default false) → `createSubscription({ addOns })`; `updateWebsite({ status:"sold", …, addOnAiChat: addOns.aiChat, addOnBooking: addOns.booking, addOnTeam: addOns.team })`; wenn `website.websiteData` v2-valide: `applyFeatures(doc, { contactForm, aiChat, booking })` + `assertV2SafeWrite` + `updateWebsite({websiteData})` + `invalidateSsrCache(slug)`.
- [ ] Tests: Webhook-Handler mit Fake-Session (metadata addOns `{aiChat:true, gallery:true}`) → subscription.addOns enthält 7 Keys, Website-Flags gesetzt, v2-Dokument hat `features.aiChat=true`; v1-Dokument bleibt unangetastet. `updateAddons` mit aiChat=true → OK (Dokument `features.aiChat=true`), team=true → BAD_REQUEST.
- [ ] Client: `AddonsPanel` liest `BOOKABLE_ADDON_KEYS` (keine Code-Änderung nötig, Test anpassen: aiChat jetzt buchbar). Doku-Satz anpassen.
- [ ] Commit `feat: Add-ons nach Zahlung aktivieren (Webhook 7 Keys, Website-Flags, features) — KI-Chat/Buchung buchbar`

### Task 3: Post-Checkout-Zugang — Abo an Konto binden

**Files:** Investigate `server/_core/magicLinkAuth.ts`, `server/_core/sdk.ts`/Login-Pfade, `server/db.ts`; Create `server/linkSubscriptions.ts` (`linkOrphanSubscriptionsToUser(userId, email)`: Abos mit `userId = 0`, deren Website `customerEmail` = email (case-insensitive) → `userId` setzen) + Test; aufrufen nach erfolgreichem Magic-Link-Login/Registrierung (einmal, idempotent). Außerdem `loadStudioWebsite`: verkaufte Website + Abo mit `userId 0` + eingeloggter Nutzer mit gleicher E-Mail wie `website.customerEmail` → erlauben (und Abo binden).
- [ ] Tests für Link-Funktion + Ownership-Fall.
- [ ] Commit `fix: Post-Checkout — verwaiste Abos (userId 0) beim Login an das Konto binden`

### Task 4: KI-Chat Server — `aiEdit` / `applyAiEdit`

**Files:** Create `shared/onboardingV2/aiEdit.ts`, `server/onboardingV2/aiEdit.ts` (+test), `server/onboardingV2/routerAi.ts` (+test); Modify `server/onboardingV2/router.ts` (Merge `...aiProcedures`).

**Interfaces:**
```ts
// shared/onboardingV2/aiEdit.ts
export const AiEditResponseSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("content"), seo: z.object({ title: z.string(), description: z.string() }).strict(), sections: z.array(SectionV2Schema).min(1) }).strict(),
  z.object({ kind: z.literal("style"), packId: z.enum(PACK_IDS), reason: z.string().max(200) }).strict(),
  z.object({ kind: z.literal("reject"), reason: z.string().max(200) }).strict(),   // z. B. Kontaktdaten/URLs gewünscht → Hinweis aufs Panel
]);
export interface AiDiffEntry { path: string; label: string; before: string; after: string }   // z. B. path "sections.hero.headline", label „Hero – Überschrift"
export function diffDocuments(before: WebsiteDataV2, after: WebsiteDataV2): AiDiffEntry[]      // pure: vergleicht seo + Sektionen je Typ (Felder flach, Arrays als JSON-Strings mit kurzem Label)
// server/onboardingV2/aiEdit.ts
export async function proposeAiEdit(args: { doc: WebsiteDataV2; message: string; category: string }): Promise<{ kind:"content"; next: WebsiteDataV2; diff: AiDiffEntry[] } | { kind:"style"; packId: PackId; reason: string } | { kind:"reject"; reason: string }>
//   Prompt: Verfassung essence+llmHints, aktuelles seo+sections als JSON, Regeln (nur Inhalte; keine URLs/Telefon/E-Mail/Adressen/Rechtstexte; Sektionstypen/Struktur beibehalten, imageUrl/ctaHref/openingHours/contact-Fakten unverändert übernehmen; bei Design-Wunsch kind=style mit Pack aus der Kandidatenliste (getV2VariantCandidates(category, 0..2) + alle), bei Faktenwunsch kind=reject); Antwort per json_schema; Validierung; bei content: Envelope-Whitelist (nur seo+sections übernehmen), contact-Sektion und alle imageUrl/ctaHref aus dem Original zurückkopieren (Fakten-Garantie), `WebsiteDataV2Schema.parse`; 1 Retry; Quota 20/Website/h (eigener Bucket in suggest.ts: `assertQuota(bucket, websiteId, limit)` verallgemeinern).
export const proposals: Map<string, { websiteId: number; next: WebsiteDataV2; createdAt: number }>; export function storeProposal(...): string; export function takeProposal(id, websiteId): WebsiteDataV2 | null  // TTL 10 min, Sweep bei Zugriff
// routerAi.ts
onboardingV2.aiEdit({ token, message: z.string().min(3).max(500) }) → { kind:"content", proposalId, diff } | { kind:"style", packId, name, reason } | { kind:"reject", reason }
onboardingV2.applyAiEdit({ token, proposalId }) → StudioState  (persistDoc; unbekannte/abgelaufene proposalId → BAD_REQUEST „Der Vorschlag ist abgelaufen — bitte erneut anfragen.")
onboardingV2.discardAiEdit({ token, proposalId }) → { ok: true }
```
- [ ] Tests: diffDocuments (Headline-Änderung → 1 Eintrag; Sektion hinzugefügt → Eintrag), proposeAiEdit content (Mock-LLM; contact/imageUrl bleiben aus Original), style, reject, Retry bei ungültigem JSON, Quota 21. Router: aiEdit→proposalId, applyAiEdit persistiert (updateWebsite + invalidate), abgelaufen → BAD_REQUEST, fremde websiteId → BAD_REQUEST.
- [ ] Commit `feat: onboardingV2 — KI-Chat (aiEdit/applyAiEdit) mit Diff, Stil-Vorschlag, Quota`

### Task 5: KI-Chat Client

**Files:** Create `client/src/pages/onboarding-v2/AiChat.tsx` (+ pure `AiDiffList` in `aiChatParts.tsx`, Tests); Modify `StudioPage.tsx` (AiChat unter der Checkliste, über der CheckoutBar), `panels/StylePanel.tsx` (`preselectPackId?: PackId` → Kandidat vorausgewählt/hervorgehoben, Hinweis „Vorschlag aus dem KI-Chat"), `studio.css`.

**Verhalten:** Eingabefeld „Was soll anders sein?" (z. B. „Mach die Überschrift knackiger", „Erwähne, dass wir auch samstags arbeiten"), Senden → Ladezustand → Ergebnis: content → `AiDiffList` (Label, vorher → nachher) + Buttons „Übernehmen"/„Verwerfen" (Übernehmen → `applyAiEdit` → `onApplied`); style → Karte „Stil-Vorschlag: <Name> — <reason>" + „Ansehen" (öffnet StylePanel mit `preselectPackId`); reject → Hinweis mit Link zum passenden Panel. Verlauf der letzten 5 Anfragen im Component-State (kein Storage). Quota-/Fehlermeldungen `role="alert"`.
- [ ] Tests: `AiDiffList` statisch (Einträge, leere Liste → „Keine Änderungen"), Stil-Karte.
- [ ] Commit `feat: Studio — KI-Chat mit Diff-Vorschau, Übernehmen/Verwerfen, Stil-Vorschlag`

### Task 6: Inseln-Infrastruktur (Komponenten-Gerüst, Bundle, SSR-Einbettung)

**Files:** Create `client/src/components/site/islands/{islandsCss.ts,SiteIslands.tsx,ContactFormIsland.tsx,ChatIsland.tsx,BookingIsland.tsx}` (Task 6: Gerüst + ContactForm-Markup; Chat/Booking-Markup als Buttons mit „lädt…"), `client/src/site-islands/main.tsx`, `scripts/build-islands.mjs`; Modify `package.json` (`"build:islands": "node scripts/build-islands.mjs"`, `"build": "npm run build:islands && vite build && …"`), `server/_core/index.ts` (`app.use("/islands", express.static(<dist>/public/islands, { maxAge: "1h" }))` vor `registerSsrRoutes`), `server/ssr/renderSite.tsx` (wenn `hasActiveFeatures(data)`: `<style>{islandsCss}</style>` im Head + `<script type="module" src="/islands/site-islands.js" defer></script>` vor `</body>`), `client/src/components/site/SiteRenderer.tsx` (`<SiteIslands data slug basePath />` nach `<mod.Page>`), `.gitignore` (dist bereits ignoriert — prüfen).

**Interfaces:**
```tsx
export function hasActiveFeatures(data: WebsiteDataV2): boolean
export const SiteIslands: React.FC<{ data: WebsiteDataV2; slug: string }>  // rendert nur aktive Inseln: <div class="pb-island" data-island="contact" data-slug data-target="#kontakt"> … </div>, data-island="chat"/"booking" (floating, rechts unten)
// main.tsx: querySelectorAll('[data-island]') → contact: vor Hydration in `#kontakt`-Sektion verschieben (appendChild), dann hydrateRoot(el, <ContactFormIsland slug …/>); chat/booking: createRoot (Client-only Widgets)
// build-islands.mjs: esbuild { entryPoints: ["client/src/site-islands/main.tsx"], bundle: true, format: "esm", minify: true, outfile: "dist/public/islands/site-islands.js", jsx: "automatic", define: { "process.env.NODE_ENV": '"production"' }, alias/paths wie tsconfig (@shared) }
```
`slug` kommt in `renderSiteHtml` aus `opts.slug` (neu in `RenderSiteOptions`; routes.ts übergibt website.slug; Preview-Route ebenfalls slug der Website).
- [ ] Tests: `hasActiveFeatures`; `SiteIslands` statisch (nur aktive Inseln, data-Attribute); renderSite-Test: Bundle-Tag nur bei Features; Build-Skript läuft (`npm run build:islands` erzeugt Datei, Größe < 200 kB).
- [ ] Commit `feat: SSR-Inseln — Gerüst, esbuild-Bundle, Einbettung in Kundenseiten`

### Task 7: Kontaktformular-Insel + Endpunkt

**Files:** Create `server/contactSubmit.ts` (`submitContactRequest({ slug, name, email, phone?, message, honeypot?, ip })` → `{ ok: true } | throws TRPCError`; `registerContactRoutes(app)`: `POST /api/site/:slug/contact` akzeptiert JSON und `application/x-www-form-urlencoded`; JSON → `{ ok: true }` / Fehler-JSON mit deutscher Meldung; Form → 303 Redirect auf `Referer`-Pfad + `?kontakt=gesendet` bzw. `?kontakt=fehler`), Test mit supertest; Modify `server/routers.ts` (`contact.submit` ruft `submitContactRequest`, Body schrumpft), `server/_core/index.ts` (Registrierung); `ContactFormIsland.tsx` (Felder Name, E-Mail, Telefon optional, Nachricht, Honeypot `website_url` versteckt, Datenschutz-Hinweis mit Link `${basePath}/datenschutz`; `action`/`method` für No-JS; hydratisiert: fetch JSON, Busy, Erfolg „Danke — wir melden uns." / Fehler; liest `?kontakt=` für No-JS-Ergebnis).
- [ ] Tests: Endpunkt JSON ok/Honeypot/Rate-Limit/unbekannter Slug; Form-POST Redirect; Island statisch (Form-Attribute, Honeypot).
- [ ] Commit `feat: Kontaktformular-Insel (SSR, No-JS-Fallback) + /api/site/:slug/contact`

### Task 8: KI-Widget-Insel

**Files:** `ChatIsland.tsx` (Floating-Button „Chat", Panel mit Verlauf, Eingabe, fetch `/api/chat/:slug/message` mit `{ messages, sessionId }` (sessionStorage), Willkommenstext aus `data-welcome` (website.chatWelcomeMessage via SSR-Attribut — `renderSiteHtml` bekommt `opts.site: { chatWelcomeMessage?: string|null }`), 404/403 → „Der Chat ist nach der Freischaltung aktiv."), Styles in `islandsCss.ts`; Tests statisch.
- [ ] Commit `feat: KI-Chat-Insel für Kundenseiten`

### Task 9: Buchungs-Insel

**Files:** `BookingIsland.tsx` (Floating-Button „Termin", Panel: Settings laden, Datumsauswahl (nächste `advanceDays` Tage, nur aktive Wochentage), Slots (`/slots?date=`), Formular Name/E-Mail/Telefon/Nachricht → `/book`, Erfolg/Fehler; gemeinsam mit Chat: `pb-island-fab`-Leiste rechts unten, beide Buttons nebeneinander), Styles; Tests statisch (Slot-Liste aus Props via pure `BookingSlots`).
- [ ] Commit `feat: Buchungs-Insel für Kundenseiten`

### Task 10: Studio-Integration der Inseln + Preview

**Files:** `server/ssr/routes.ts` (Preview-Route übergibt slug + site-Infos), `AddonsPanel.tsx` (Texte: „Kontaktformular erscheint sofort in der Vorschau; KI-Chat & Terminbuchung nach der Freischaltung"), `PreviewFrame` unverändert; Playwright `tests/visual/islands.spec.ts`: Dev-Preview `/dev/site-preview?pack=werkbank&fixture=features` → Screenshot Kontaktformular-Insel (Desktop/Mobil), FAB-Leiste; `studio.spec.ts`: + „KI-Chat Diff" (LLM nicht mockbar im E2E → nur Eingabe + Ladezustand oder Mock über `PB_LLM_MOCK=1` in `server/onboardingV2/aiEdit.ts` (Env-Schalter liefert festes JSON) — Schalter nur non-production).
- [ ] Baselines (Studio + Inseln) neu, Doppellauf; `packs.spec.ts` unverändert.
- [ ] Commit `test: Inseln-Baselines, Studio KI-Chat-Screenshot, Preview mit Features`

### Task 11: Doku + Abschluss

- `docs/superpowers/specs/2026-08-21-flag-aktivierung.md`: §7 „Inseln & Add-ons": `npm run build` baut jetzt das Inseln-Bundle (`dist/public/islands/`), Nginx/PM2 unverändert; Webhook aktiviert Add-ons; Subpages verschoben; KI-Chat-Quota; `/api/site/:slug/contact`.
- Commit `docs: Aktivierungs-Doku — Inseln, Add-on-Aktivierung, KI-Chat`

---

## Abschluss Plan B3
- `npm run build` (inkl. Inseln), `npx vitest run`, `npm run check`, Playwright (packs + studio + islands) grün.
- Screenshots (KI-Chat-Diff, Kundenseite mit Kontaktformular/FABs) dem User zeigen; danach **Plan B4 (Cutover & Löschung)**.
