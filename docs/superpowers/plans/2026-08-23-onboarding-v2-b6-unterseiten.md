# Plan B6: Unterseiten-Add-on, Add-on-Konsistenz, Statistik, Perf-Rest — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unterseiten als Add-on (Vertrag `pages[]`, SSR-Routen, Navigation in 14 Packs, Studio-Editor, Preis), Add-on-Logik auf eine Quelle der Wahrheit (nicht gebuchter Inhalt wird ausgeblendet, Studio-Toggle nach Checkout aktualisiert Stripe), Kundenstatistik (Umami-Provisionierung), Perf-Rest, Pack-Identität über `accent-text` — und als neues Gate ein Playwright-Smoke gegen den **Produktions-Build** (Lehre aus dem Hotfix 9875dd9: Dev-basierte Specs sehen Bundle-Fehler nicht).

**Architecture:** Unterseiten leben im v2-Dokument (`pages[]`, je Page eigene Sektionen), werden über Patches (`PagesPatchSchema` → `applyPages` → `onboardingV2.updatePages`) gepflegt und vom SSR unter `/site/:slug/:page` (sowie Subdomain-Form, `/preview-ssr/:token/:page`, `/demo/:pack/:page`) gerendert; die Packs bekommen statt eigener Anker-Listen einen gemeinsamen `buildNavItems`-Helfer (engine.ts) und ein `pageHeader`-Modul. Add-on-Gating passiert zentral in `engine.ts` (`visibleSections`) für SSR und CSR über ein neues additives Vertragsfeld `addOns`. Stripe-Sync nach Checkout über `server/stripeAddons.ts` (Subscription-Items) + Webhook `customer.subscription.updated`. Umami-Provisionierung beim Aktivwerden. Jeder Task gate-fähig; neues Playwright-Projekt „prod" läuft gegen `node dist/index.js`.

**Tech Stack:** React 19, TypeScript strict, Vite 7, Express 4, tRPC 11, zod v4, Drizzle/MySQL 8, Stripe, Vitest (node; Client-Tests via `renderToStaticMarkup` + `import React from "react"`), Playwright (`tests/visual/` dev auf 3005; neues Projekt `prod` auf 3012), `@axe-core/playwright`, Lighthouse via `npx lighthouse` (Port 3011).

**Spec:** `docs/superpowers/specs/2026-08-23-b6-unterseiten-design.md` (verbindlich; §5 alle wie empfohlen + Prod-Build-Smoke als Gate) · Vorlauf: `docs/superpowers/specs/2026-08-23-b5-ergebnis.md`, Hotfix 9875dd9.

## Global Constraints

- Branch `onboarding-v2` (= main 9875dd9 + Spec/Plan). Commit je Task NUR mit Pathspec, nie `git add -A`/`-a`, kein `git stash`; Prettier-Reformatierungen fremder Dateien nicht mitcommitten.
- Gates je Task: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -c "error TS"` → **0**; `npx vitest run` grün bis auf bekannte Env-Fails (2× `server/resend.test.ts`, 2 Stripe-Env-Suiten); Playwright-Baselines unverändert außer wo der Task es sagt (packs 98/98, studio 9/9, landing 4/4, islands 4/4, startpage 1/1, a11y 29/29); **ab Task 1 zusätzlich** `npx playwright test --project=prod` grün bei jedem Task, der `vite.config.ts`, `client/src/App.tsx`, `client/src/main.tsx`, `client/index.html` oder Chunking berührt — und in Task 10 für alle.
- Texte deutsch; Commit-Format `<typ>: <beschreibung>` ohne Co-Authored-By; neue Dateien < 400 Zeilen; `assertV2SafeWrite` bleibt vor jedem `websiteData`-Write; Patches sind die einzigen Schreibpfade ins Dokument.
- Port 3000 fremd — nie anfassen; Dev/Playwright 3005, Prod-Smoke 3012, Lighthouse 3011. Lokale DB: Docker `pageblitz-mysql`. Prod-Deploy/-Migration nur durch den Koordinator nach Merge mit Freigabe.
- Behalten-Listen aus B4b/B4c/B5 gelten weiter. Keine Dashboard-Umgestaltung.

---

### Task 1: Playwright-Projekt „prod" (Produktions-Build-Smoke) als Gate

**Files:**
- Modify: `playwright.config.ts` (`projects`: `dev` = bisherige Specs `tests/visual/**` mit bisherigem `webServer` auf 3005; `prod` = `testMatch: "tests/prod/**/*.spec.ts"`, `webServer: { command: "npm run build && NODE_ENV=production PORT=3012 node dist/index.js", port: 3012, reuseExistingServer: false, timeout: 240_000 }`, `use.baseURL: "http://localhost:3012"`)
- Create: `tests/prod/smoke.spec.ts` — Seiten `/`, `/start`, `/my-website`, `/demo/werkbank`, `/onboarding/0123456789abcdef0123456789abcdef` (ungültiger Token → Studio-Shell mit Fehlerzustand; JS muss laden), `/site/does-not-exist`; je Seite `pageerror` + `console.error` sammeln (erwartete 404-Ressourcen ausnehmen), Assertions: keine `pageerror`, `document.body.innerText.trim().length > 0`, HTML enthält kein `%VITE_`, alle `<script type="module">`-Chunks antworten 200.
- Modify: `package.json` (`"test:prod": "playwright test --project=prod"`, `"test:visual": "playwright test --project=dev"`), `docs/BETRIEB-V2.md` (Gate-Beschreibung, warum: Hotfix 9875dd9).
- [ ] **Step 1:** Config + Spec schreiben; sicherstellen, dass `npx playwright test tests/visual/x.spec.ts` weiterhin NUR das dev-Projekt fährt (Pfad matcht `testMatch` von `dev`; prüfen, dass `prod` nicht mitstartet).
- [ ] **Step 2:** `npx playwright test --project=prod --reporter=line` 2× grün; ein dev-Spec (`landing.spec.ts`) zur Gegenprobe grün.
- [ ] **Step 3:** Commit `git commit -m "test: Playwright-Projekt prod — Smoke gegen Produktions-Build (Bundle-Fehler wie Hotfix 9875dd9 werden gefangen)" -- <pfade>`

---

### Task 2: Vertrag, Pricing, Patch — `pages[]`, `pageHeader`, `features.subpages`, `addOns`

**Files:**
- Modify: `shared/siteContract/schema.ts`: Sektion `pageHeader { type: "pageHeader", title ≤ 60, intro? ≤ 300 }` in `SECTION_TYPES`/Union; `RESERVED_PAGE_SLUGS = ["impressum","datenschutz","start","api","preview","preview-ssr","onboarding","demo","site","admin","my-website","my-account","login","dev"]`; `PageSchema { slug: z.string().regex(/^[a-z0-9-]{2,40}$/).refine(not reserved), title ≤ 60, navLabel? ≤ 24, seo: { title ≤ 70, description ≤ 160 }, sections: z.array(PageSectionSchema).min(1).max(8) }` mit `PageSectionSchema` = Union aus `pageHeader, services, about, gallery, faq, contact, testimonials, pricelist, menu`; `pages: z.array(PageSchema).max(5).optional()` + Refine unique slugs; `FeaturesSchema.subpages?: boolean`; **neues** `addOns: z.object({ gallery?, menu?, pricelist?, team?, subpages? }).strict().optional()` (Sektions-Add-ons, Gating-Quelle für Task 6 — hier nur Schema + Typ); `shared/siteContract/types.ts`; `shared/siteContract/fixtures.ts` (Fixture „full": `pages: [{ slug: "leistungen-im-detail", title: "Leistungen im Detail", seo, sections: [pageHeader, services, contact] }]`, `addOns: { gallery: true, menu: true, pricelist: true, team: true, subpages: true }`; Fixture „features": zusätzlich `features.subpages: true`).
- Modify: `shared/pricing.ts` (`subpages` in `ADDON_KEYS`/`ADDON_NAMES` („Unterseiten")/`BOOKABLE_ADDON_KEYS`, Preis 390), `shared/onboardingV2/patches.ts` (`PagesPatchSchema = z.object({ pages: z.array(PageSchema).max(5) }).strict()`), `server/onboardingV2/applyPatch.ts` (`applyPages(doc, p)`: ersetzt `pages`; leeres Array → Feld entfernen; Ergebnis `WebsiteDataV2Schema.parse`), `server/onboardingV2/routerContent.ts` (`onboardingV2.updatePages({ token, patch })` wie `updateOffer`; bei `pages.length > 0` Flag `addOnSubpages: true` in `onboarding_responses` wie `updateTeam`), `server/onboardingV2/applyFeatures.ts` (`subpages` als Feature wie aiChat → `features.subpages`), `server/stripeWebhookHandlers.ts` (`subpages` → `features.subpages`, Spalte `addOnSubpages` in `generated_websites` prüfen — fehlt sie: Migration `drizzle/0029_add_on_subpages.sql` additiv `ALTER TABLE generated_websites ADD COLUMN addOnSubpages boolean DEFAULT false;` + Schema)
- Test: `shared/siteContract/schema.test.ts` (Slug-Regex, reserviert, unique, max 5, Sektions-Whitelist, `addOns` strict), `applyPatch.test.ts` (`applyPages` setzt/entfernt, Immutabilität), `routerContent.test.ts` (`updatePages` Ownership + Flag), Webhook-Test, `pricing.test.ts`.
- [ ] **Steps:** Tests → FAIL → implementieren → `npx vitest run shared server/onboardingV2 server/stripeWebhookHandlers*` grün, tsc 0; lokale Migration falls 0029 → Commit `git commit -m "feat: Unterseiten im Vertrag (pages, pageHeader, features.subpages, addOns), Pricing, Patch/Router" -- <pfade>`

---

### Task 3: SSR/CSR-Routen für Unterseiten + Nav-Helfer

**Files:**
- Modify: `client/src/components/site/engine.ts`:
```ts
export type NavItem = { key: string; href: string; label: string; current?: boolean };
export function buildNavItems(doc: WebsiteDataV2, opts: { pathname: string; basePath: string }): NavItem[]
// Startseite (pathname "/"): Anker `#${SECTION_ANCHORS[type]}` für navSections (wie bisher) + je Page `${basePath}/${slug}` (Label navLabel ?? title)
// Unterseite: Anker → `${basePath || "/"}#anker`, Page-Links wie oben, aktuelle Page current: true
export function pageForPathname(doc: WebsiteDataV2, pathname: string): Page | null  // "/leistungen-im-detail" → Page
```
  `client/src/components/site/SiteRenderer.tsx` (Prop `pathname?: string`; Page → Pack-Modul erhält `sections = page.sections`, `navItems`, `pageTitle`; Startseite unverändert), `server/ssr/renderSite.tsx` (Page-Modus: `<title>`/description/canonical aus `page.seo`, `og:image` Fallback Startseiten-Hero; Legal-Pfade unverändert), `server/ssr/routes.ts` (`handleCustomerSiteSsr`: Reihenfolge Slug → Website laden (Cache) → Pfad prüfen: `/`, Legal, `/${page.slug}` → sonst 404; `invalidateSsrCache(slug)`: Prefix-Scan über alle Keys `sub:<slug>`/`path:<slug>` + `NOT_FOUND_CACHE_PATH`; `/preview-ssr/:token/:page`, `/demo/:pack/:page([a-z0-9-]+)` (Fixture-Page; unbekannt → 404)), `server/_core/static.ts` (SPA-Regex `/^\/site\/[^/]+(\/[a-z0-9-]+)?$/`), `client/src/App.tsx` (Route `/site/:slug/:page` → `SitePage` mit `pageSlug`; Subdomain-Branch analog; Suspense), `client/src/pages/SitePage.tsx`/`WebsiteRenderer.tsx` (`pathname` durchreichen)
- Test: `server/ssr/routes.test.ts` (Page 200 + SEO/canonical, unbekannte Page 404, Legal weiter 200, Invalidation löscht Page-Cache (Prefix), preview-ssr Page, demo Page), `engine.test.ts` (`buildNavItems` Start/Unterseite/current, `pageForPathname`), `static.test.ts`
- [ ] **Steps:** Tests → FAIL → implementieren → `npx vitest run server/ssr client/src/components/site server/_core` grün, tsc 0; Playwright `packs.spec.ts`: Fixture „full" hat jetzt eine Page → Nav zeigt einen Link mehr → **„full"-Baselines aller 14 Packs neu** (`-g "full" --update-snapshots`, minimal bleibt), dann 98/98; `--project=prod` grün → Commit `git commit -m "feat: SSR/CSR-Routen für Unterseiten, Nav-Helfer, Demo-/Preview-Pages" -- <pfade>`

---

### Task 4: Packs — `buildNavItems` + `pageHeader` in allen 14 Modulen

**Files:** `client/src/components/site/packs/*/index.tsx` + `css.ts` (14×): Nav-Block durch `navItems.map(item => <a key={item.key} href={item.href} aria-current={item.current ? "page" : undefined}>{item.label}</a>)` ersetzen (Styling unverändert; `[aria-current]` dezent markieren), `case "pageHeader"` (Titel + Intro in Pack-Typografie, ohne CTA); `client/src/components/site/moduleParity.test.ts` (jedes Pack behandelt `pageHeader`); `tests/visual/packs.spec.ts` (+14: `/demo/<pack>/leistungen-im-detail` Desktop-Screenshot; Baselines neu), `tests/visual/a11y.spec.ts` (+3 Stichproben-Pages)
- [ ] **Steps:** pro Pack mechanisch (sequenziell, ein Implementierer), nach jedem Pack `npx vitest run client/src/components/site`; danach packs 112/112, a11y grün, `--project=prod` grün → Commit `git commit -m "feat: Unterseiten-Navigation und pageHeader-Modul in allen 14 Packs" -- <pfade>`

---

### Task 5: Studio — Unterseiten-Editor, Vorschau, KI-Chat, Dashboard

**Files:**
- Create: `client/src/pages/onboarding-v2/panels/pagesLogic.ts` (+test): `slugFromTitle(title)`, `addPage(pages, title)` (unique/reserviert/max 5), `removePage`, `movePage`, `addSectionFromTemplate(page, "services-detail" | "about" | "gallery" | "faq" | "contact")`, `removeSection`, `moveSection`, `validatePages` via `PagesPatchSchema` (deutsche Meldungen); `PagesEditor.tsx` (+test statisch): Seitenliste, Seite anlegen (Titel → Slug editierbar), je Seite Sektionen mit Mini-Editoren (pageHeader title/intro; services Liste Titel/Text/Preis; about Text; faq Frage/Antwort; contact = Hinweis „übernimmt Kontaktdaten"; gallery = Hinweis „nutzt Galerie-Bilder"), ↑/↓/entfernen, a11y-Labels nummeriert
- Modify: `AddonsPanel.tsx` (Schalter `subpages` + Preis; Unterbereich „Unterseiten" mit `PagesEditor`, „Übernehmen" → `updatePages`), `useStudioState.ts`/`StudioPage.tsx` (Mutation; Vorschau-Leiste „Startseite | <Pages…>" über dem iframe → `/preview-ssr/<token>/<slug>`), `server/onboardingV2/aiEdit.ts` (Scope: optional `pageSlug` im Request → KI bearbeitet `pages[i].sections` mit derselben Whitelist/Restauration; Prompt-Kontext), `client/src/pages/dashboard/AddonsTab.tsx` (subpages wie Team)
- Test: Logik-/Komponententests; `tests/visual/studio.spec.ts` (+1: Extras → Unterseiten ein → „Leistungen im Detail" anlegen → Vorlage Leistungen → Übernehmen → Vorschau-Leiste zeigt Page → iframe enthält Titel); a11y Extras-Panel
- [ ] **Steps:** Tests → FAIL → implementieren → vitest grün, tsc 0, studio.spec 10/10 (2×), a11y grün → Commit `git commit -m "feat: Unterseiten im Studio pflegen (Extras-Panel), Vorschau je Seite, KI-Chat-Scope, Dashboard" -- <pfade>`

---

### Task 6: Add-on-Konsistenz — Gating, PhotosPanel, Gastro-Default, Stripe-Sync

**Files:**
- Modify: `client/src/components/site/engine.ts` (`visibleSections(doc)`: blendet `gallery|menu|pricelist|team` aus, wenn `doc.addOns?.<key>` nicht true; `pages` nur wenn `doc.addOns?.subpages`; Feature-Inseln unverändert über `features`), `SiteRenderer.tsx`/`renderSite.tsx` (nutzen `visibleSections`/`buildNavItems` mit demselben Filter), `server/onboardingV2/applyFeatures.ts` (schreibt `features` **und** `addOns` im Dokument + Spalten in einem Write), `server/onboardingV2/routerCommerce.ts` (`updateAddons`: Team-Sektion nicht mehr löschen — nur `addOns.team=false`; `updateTeam`/`updatePages` setzen `addOns.team/subpages=true` mit; nach Checkout (`status !== "preview"`): `syncSubscriptionAddOns` aufrufen, Fehler → BAD_REQUEST „Add-on-Änderung konnte nicht abgerechnet werden", Flags unverändert), `server/stripeWebhookHandlers.ts` (Checkout → `addOns` aus Metadaten; neu `customer.subscription.updated` → `subscriptions.addOns` + Dokument `addOns`/`features` nachziehen), Create: `server/stripeAddons.ts` (`syncSubscriptionAddOns(stripeSubscriptionId, addOns)`: Subscription-Items je Add-on über Price-IDs aus Env `STRIPE_PRICE_ADDON_<KEY>` (Mapping in `shared/pricing.ts`-Nähe, Env-Namen in `.env.example`), `proration_behavior: "create_prorations"`; Test mit Stripe-Mock), `client/src/pages/onboarding-v2/panels/PhotosPanel.tsx` (Galerie-Bereich nur bei aktivem `addOns.gallery`, sonst Hinweis + Schalter → `updateAddons`), `AddonsPanel.tsx` (Gastro-Packs `prefersMenu` → Menü-Add-on im Entwurf vorausgewählt), `generateSiteContent.ts` (Menü-Sektion für Gastro weiter erzeugen; Sichtbarkeit über `addOns.menu`), `client/src/pages/dashboard/AddonsTab.tsx` (Anzeige aus `subscriptions.addOns`), `shared/onboardingV2/checklist.ts` (Extras-Erledigt-Regel prüfen)
- Test: `engine.test.ts` (Matrix addOns × Sektion, pages), SSR-Test (ungebuchte Galerie nicht im HTML; Fixture „full" hat alle `addOns` → Baselines unverändert), `routerCommerce.test.ts` (Sync-Mock, Fehlerpfad, preview ohne Sync), Webhook-Tests, `PhotosPanel.test.tsx`, `AddonsPanel.test.tsx` (Gastro-Default)
- [ ] **Steps:** Tests → FAIL → implementieren → vitest grün, tsc 0, Playwright packs 112/112, studio 10/10, islands 4/4 → Commit `git commit -m "feat: Add-on-Konsistenz — Gating über addOns im Vertrag, ausblenden statt löschen, Gastro-Default, Stripe-Sync nach Checkout" -- <pfade>`

---

### Task 7: Kundenstatistik — Umami-Provisionierung

**Files:** `server/umami.ts` (`registerUmamiWebsite(name, domain)` wiederherstellen/neu: `UMAMI_API_URL`/`UMAMI_API_TOKEN` aus Env, Fehler → Log ohne Abbruch; Signatur dokumentieren), `server/stripeWebhookHandlers.ts` + Aktivierung im Setup-Flow (`routers.ts` `customer.setSlug`/`updateStatus` → `active`) → registrieren, `generatedWebsites.umamiWebsiteId` setzen (idempotent), `server/ssr/renderSite.tsx` (Umami-Script im Head nur für aktive Sites mit ID; `data-website-id`, `defer`, cookielos), `client/src/pages/SitePage.tsx` (CSR gleich), `server/legalGenerator.ts` (Datenschutz-Absatz „Reichweitenmessung (Umami, cookielos, keine personenbezogenen Daten)" — Text prüfen/ergänzen), `docs/BETRIEB-V2.md` (Env-Vars), `.env.example`
- Test: Umami-Client gemockt (Registrierung bei Aktivierung, idempotent, Fehler tolerant), `getAnalytics` liefert Werte, SSR-Head enthält Script nur bei ID, Legal-Text enthält Absatz
- [ ] **Steps:** Tests → FAIL → implementieren → vitest grün, tsc 0, Playwright islands/packs unverändert → Commit `git commit -m "feat: Umami-Provisionierung bei Aktivierung, Statistik im Dashboard, cookieloses Tracking auf Kundenseiten" -- <pfade>`

---

### Task 8: Perf-Rest Landingpage (messbar)

**Files:** Create `client/src/components/landing/LandingButton.tsx` (ohne Radix-Slot; `asChild`-Ersatz per `React.cloneElement` oder einfach `<a className=buttonVariants()>`), Landing/StartPage auf `LandingButton` umstellen (`ui/button.tsx` bleibt fürs Dashboard), `LandingPage.tsx`/`components/landing/*` (`LazyMotion features={() => import("framer-motion").then(m => m.domAnimation)}`), Fonts: `client/public/fonts/*.woff2` (Inter + Plus Jakarta Sans, latin Subset, Regular/Semibold/Bold — Quelle/Lizenz im Ordner-README) + `@font-face` in `client/src/index.css` + `<link rel=preload as=font crossorigin>` nur Regular/Semibold; Google-Fonts-Link für Inter/PJS aus `index.html` raus; GTM/Rybbit (`index.html`/`main.tsx`) erst nach Consent bzw. `requestIdleCallback`; Pack-Fonts CSR-Fallback: sitewide Familien nicht doppelt; `vite.config.ts`/`index.html` nur mit `--project=prod`-Lauf
- Messung: Lighthouse vorher/nachher (mobil + Desktop, Port 3011), Chunk-Tabelle; Ziel LCP < 2,5 s, JS < 150 kB gzip — ehrlich dokumentieren
- [ ] **Steps:** messen → implementieren → messen → vitest, tsc 0, Playwright landing/studio/a11y + `--project=prod` grün → Commit `git commit -m "perf: Landing ohne Radix-Slot, async LazyMotion, self-hosted Fonts, Third-Party verzögert (Lighthouse vorher/nachher)" -- <pfade>`

---

### Task 9: Pack-Identität — `accent-text`

**Files:** `shared/stylePacks/types.ts` (`PaletteRole` + `"accent-text"`), `shared/stylePacks/toCssVars.ts` (`--pb-accent-text`, Fallback `--pb-accent`), Verfassungen werkbank/marktplatz/schimmer (Akzent zurück auf Original aus `git show 71ebf07:shared/stylePacks/<pack>.ts`; `accent-text` = heutiger dunkler Ton), `client/src/components/site/packs/{werkbank,marktplatz,schimmer}/css.ts` (Kleintext `color:var(--pb-accent)` → `var(--pb-accent-text)`; CTA-Text `var(--pb-ink)`), `tests/visual/packs.spec.ts` (Farbassertion: CTA-Hintergrund = accent, CTA-Text = ink), Baselines der drei Packs + `npm run build:previews` + `client/public/demo/*.svg` für die drei Packs, `shared/stylePacks/summary.ts` (+Test), a11y 0 critical/serious
- [ ] **Steps:** Kontraste berechnen (jede betroffene Stelle ≥ 4,5:1) → implementieren → packs 112/112 (Baselines der 3 Packs + full/min neu), landing 4/4 (Baseline neu), a11y grün → Commit `git commit -m "feat: accent-text in den Verfassungen; werkbank/marktplatz/schimmer mit Original-Akzent und ink-CTA" -- <pfade>`

---

### Task 10: Abschluss B6

- [ ] Volle Gates: vitest, tsc 0, build, Playwright `--project=dev` alle Specs (studio/landing/a11y 2×) + `--project=prod` 2×; Lighthouse-Endwerte; Erfolgskriterien Spec §4 mit Status.
- [ ] Doku: `docs/BETRIEB-V2.md` (Unterseiten-Routen, `addOns`-Vertragsfeld/Gating, Stripe-Sync + Price-IDs, Umami-Env, Prod-Smoke-Gate, Fonts), `docs/superpowers/specs/2026-08-23-b6-ergebnis.md`, Spec §4 Stand-Block.
- [ ] Commit `git commit -m "docs: B6-Ergebnis — Unterseiten, Add-on-Konsistenz, Statistik, Perf" -- <pfade>`
- [ ] Nach Merge (Koordinator, mit Freigabe): Prod-Env prüfen/anlegen (`UMAMI_API_URL`, `UMAMI_API_TOKEN`, `STRIPE_PRICE_ADDON_*`), Deploy, ggf. Migration 0029, Browser-Smoke gegen https://pageblitz.de (inkl. `/start`, Studio, eine Kundenseite mit Unterseite).

---

## Self-Review
- Spec-Abdeckung: §2.1 → Tasks 2–5; §2.2 → Task 6; §2.3 → Task 7; §2.4 → Task 8; §2.5 → Task 9; §2.6 → Task 10; Gate-Ergänzung Prod-Smoke → Task 1.
- Platzhalter: Schemata/Signaturen (`PageSchema`, `PagesPatchSchema`, `applyPages`, `updatePages`, `buildNavItems`, `pageForPathname`, `visibleSections`, `syncSubscriptionAddOns`, `registerUmamiWebsite`) sind benannt; Pack-Arbeit mechanisch beschrieben; Messungen/Baseline-Entscheidungen als zu dokumentierende Ergebnisse.
- Typkonsistenz: `PageSchema`/`pages`/`addOns` (Task 2) ↔ `buildNavItems`/`pageForPathname`/`visibleSections` (Task 3/6) ↔ Packs (Task 4) ↔ `PagesEditor` (Task 5); Prod-Projekt (Task 1) in Tasks 3/4/8/10 genutzt.
