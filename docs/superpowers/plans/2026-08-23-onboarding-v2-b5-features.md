# Plan B5: Team-Add-on, Admin-Reste, Performance-Hebel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Team-Add-on buchbar und im Studio pflegbar machen, Admin-Altlasten bereinigen (Pack-Anzeige, 79-€-Dialog, Statistik-Bug, zunft-Preisfarbe), Dashboard test-/a11y-fähig machen, Landingpage-Performance-Hebel ziehen (Fonts, Chunking), Pack-Identität für drei Packs prüfen, Dark-Mode-a11y — ohne Unterseiten (B6).

**Architecture:** Team folgt dem Galerie-Muster: Inhalt lebt als Sektion `team` im v2-Dokument (`TeamSchema`), Aktivierung als Add-on-Flag (`addOnTeam`-Spalte + `BOOKABLE_ADDON_KEYS`), Pflege über einen neuen Patch `TeamPatchSchema` + `applyTeam` + `onboardingV2.updateTeam`, UI als Unterbereich des Extras-Panels. Dev-Login für das Dashboard läuft über eine neue Dev-Route analog `/dev/studio-seed`, die eine Session wie der Magic-Link setzt. Perf-Arbeit ist messbar (Lighthouse vorher/nachher, Produktions-Build). Alles gate-fähig je Task.

**Tech Stack:** React 19, TypeScript strict, Vite 7, Express 4, tRPC 11, zod v4, Drizzle/MySQL 8, Vitest (node; Client-Tests via `renderToStaticMarkup` + `import React from "react"`), Playwright (`tests/visual/`, PORT 3005, `--workers=1 --reporter=line`, separate kurze Befehle), `@axe-core/playwright`, Lighthouse via `npx lighthouse` (Chromium aus Playwright, `CHROME_PATH`).

**Spec:** `docs/superpowers/specs/2026-08-23-b5-features-design.md` (verbindlich, §5 alle wie empfohlen) · Vorlauf: `docs/superpowers/specs/2026-08-23-b4c-ergebnis.md`.

## Global Constraints

- Branch `onboarding-v2` (= main f01c3ef + Spec-Commits). Commit je Task NUR mit Pathspec (`git commit -m "…" -- <pfade>`, `git rm` für Löschungen), nie `git add -A`/`-a`, kein `git stash`; Prettier-Reformatierungen fremder Dateien nicht mitcommitten.
- Gates je Task: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -c "error TS"` → **0** (Stand main: 0 — jede Abweichung ist ein Blocker); `npx vitest run` grün bis auf bekannte Env-Fails (2× `server/resend.test.ts` ohne `RESEND_API_KEY`, 2 Stripe-Env-Suiten `auth.logout`/`pageblitz` ohne `STRIPE_SECRET_KEY`); Playwright-Baselines unverändert außer dort, wo der Task es sagt (packs 98/98 inkl. 14 Farbassertionen, studio 8/8, landing 4/4, islands 4/4, startpage-to-studio 1/1, a11y 24/24 + 1 skip).
- Texte deutsch; Commit-Format `<typ>: <beschreibung>` ohne Co-Authored-By; neue Dateien < 400 Zeilen; keine Unterseiten, kein Dashboard-Redesign.
- Port 3000 fremd — nie anfassen; Dev/Playwright auf 3005 (`lsof -nP -iTCP:3005 -sTCP:LISTEN` vor Playwright leer, verwaiste `tsx watch server/_core/index.ts` beenden). Lokale DB: Docker `pageblitz-mysql`.
- DB-Änderungen als handgeschriebene Migration (`drizzle/0028_*.sql`), lokal einspielen (`docker exec -i pageblitz-mysql mysql …`), Prod erst nach Merge mit Freigabe (Expand/Contract wie BETRIEB-V2 §3).

---

### Task 1: Team-Add-on — Vertrag, Patch, Router, Webhook, Pricing, Migration 0028

**Files:**
- Modify: `shared/pricing.ts` (`BOOKABLE_ADDON_KEYS` + `team`; `sanitizeAddOns`-Kommentar), `shared/onboardingV2/patches.ts` (neu `TeamPatchSchema`), `server/onboardingV2/applyPatch.ts` (`applyTeam`), `server/onboardingV2/routerCommerce.ts` (`updateAddons` team-Flag; neu `updateTeam`), `server/onboardingV2/router.ts` (Prozedur registrieren, falls Router dort zusammengesetzt wird), `server/stripeWebhookHandlers.ts` (Team-Flag bereits gesetzt — prüfen, dass `features`-Write unberührt bleibt), `server/db.ts` (keine Referenz auf `addOnTeamData` mehr), `drizzle/schema.ts` (`onboardingResponses.addOnTeamData` entfernen), Create: `drizzle/0028_drop_addon_team_data.sql`
- Test: `shared/onboardingV2/patches.test.ts` (falls vorhanden, sonst neu), `server/onboardingV2/applyPatch.test.ts`, `server/onboardingV2/routerCommerce.test.ts`, `server/stripeWebhookHandlers.test.ts` (Team-Flag)

**Interfaces (Produces):**
```ts
// shared/onboardingV2/patches.ts
export const TeamPatchSchema = z.object({
  headline: z.string().max(80).optional(),
  members: z.array(z.object({ name: z.string().min(1).max(80), role: z.string().max(80).optional(), imageUrl: SafeUrlSchema.optional() }).strict()).max(12),
}).strict();
export type TeamPatch = z.infer<typeof TeamPatchSchema>;
// server/onboardingV2/applyPatch.ts
export function applyTeam(doc: WebsiteDataV2, p: TeamPatch): WebsiteDataV2 // members leer → team-Sektion entfernen; sonst Sektion ersetzen/anlegen (Position: nach "about", sonst vor "contact"; sectionOrder respektieren, falls gesetzt)
// onboardingV2.updateTeam({ token, patch: TeamPatch }) → StudioState (wie updateOffer: loadStudioWebsite → applyTeam → persistDoc)
```
- [ ] **Step 1: Failing tests** — `applyTeam`: (a) 2 Mitglieder → Sektion `team` mit `members` im Dokument, Schema-valide (`WebsiteDataV2Schema.parse`); (b) Mitglieder leer → Sektion entfernt; (c) vorhandene Sektion wird ersetzt, andere Sektionen unverändert; Router `updateTeam`: Ownership (fremder Token → NOT_FOUND/FORBIDDEN wie die anderen `update*`), Erfolg persistiert; `updateAddons({ team: true })` setzt `addOnTeam` (Mock `updateWebsite`); Webhook-Test: Checkout mit `team` → `addOnTeam: true`; `sanitizeAddOns({ team: true }).team === true`.
- [ ] **Step 2: Tests → FAIL.**
- [ ] **Step 3: Implementieren** wie Interfaces. Abschalten des Team-Add-ons in `updateAddons`: Packs rendern jede Sektion im Dokument unabhängig vom Flag → beim Abschalten `applyTeam(doc, { members: [] })` ausführen (Sektion raus), beim Einschalten keine leere Sektion anlegen (erst mit dem ersten Mitglied); Verhalten der Galerie zum Vergleich prüfen und im Bericht dokumentieren.
- [ ] **Step 4: Migration** `drizzle/0028_drop_addon_team_data.sql`: `ALTER TABLE \`onboarding_responses\` DROP COLUMN \`addOnTeamData\`;` — Schema nachziehen, lokal einspielen, `grep -rn addOnTeamData client server shared` → 0.
- [ ] **Step 5: Gates** — vitest grün, tsc 0, Playwright `studio.spec.ts` 8/8.
- [ ] **Step 6: Commit** — `git commit -m "feat: Team-Add-on — Vertrag/Patch/Router/Pricing buchbar, Migration 0028 (addOnTeamData)" -- <pfade>`

---

### Task 2: Team im Studio (Extras-Panel) und Dashboard

**Files:**
- Modify: `client/src/pages/onboarding-v2/panels/AddonsPanel.tsx` (Team-Schalter wie Galerie; bei aktivem Team Unterbereich „Team pflegen": Liste der Mitglieder mit Name/Rolle/Foto, Hinzufügen/Entfernen/↑↓, max. 12, „Übernehmen" → `updateTeam`), Create: `client/src/pages/onboarding-v2/panels/TeamEditor.tsx` (+ `.test.tsx`), `client/src/pages/onboarding-v2/panels/teamLogic.ts` (reine Funktionen: add/remove/move/validate + Test), Modify: `client/src/pages/onboarding-v2/useStudioState.ts`/`StudioPage.tsx` (Mutation `updateTeam` verdrahten wie `updateOffer`), `client/src/pages/dashboard/AddonsTab.tsx` (Team wie Galerie: Kauf-/Aktiv-Zustand, Link `?panel=addons`), `client/src/pages/onboarding-v2/CheckoutBar.tsx`/`shared/pricing.ts`-Summen (Team zählt mit)
- Test: `tests/visual/studio.spec.ts` (+1: Extras-Panel öffnen → Team einschalten → Mitglied „Anna Beispiel / Meisterin" anlegen → Übernehmen → Vorschau-iframe enthält „Anna Beispiel"; Baseline optional)
- Fotos: Mitgliederfoto über `StockPhotoSearch`/Upload-Pfad des Fotos-Panels (bestehende `onboardingV2.uploadPhoto`/`searchStockPhotos` nutzen; keine neue Upload-Route)

- [ ] **Step 1: Failing tests** — `teamLogic.test.ts` (add bis 12, 13. abgelehnt; remove; move up/down an Rändern; validate: Name leer → Fehler), `TeamEditor.test.tsx` (statischer Render: Liste, Buttons, leere-Liste-Hinweis), `AddonsPanel.test.tsx` (Team nicht mehr „bald verfügbar", Schalter vorhanden; Unterbereich nur bei aktivem Team).
- [ ] **Step 2: Tests → FAIL; implementieren; Playwright-Szenario ergänzen (Seed `werkbank/full`).**
- [ ] **Step 3: Gates** — vitest grün, tsc 0, Playwright `studio.spec.ts` 9/9 (2×), `a11y.spec.ts` Extras-Panel weiterhin 0 critical/serious.
- [ ] **Step 4: Commit** — `git commit -m "feat: Team im Studio pflegen (Extras-Panel) und im Dashboard buchen" -- <pfade>`

---

### Task 3: Admin-Altlasten — Pack-Anzeige, CheckoutDialog weg, Statistik, zunft-Preisfarbe

**Files:**
- Modify: `client/src/pages/WebsitesPage.tsx` (Spalte „Pack" mit `STYLE_PACKS[stylePackId]?.name ?? "—"` aus `(w.websiteData as { stylePackId?: string })`, Aktion „Im Studio öffnen" → `/onboarding/<previewToken>`; `CheckoutDialog`-Komponente + Aufruf + tote Imports entfernen; verbliebene Preisangaben aus `shared/pricing.ts` formatieren), `server/routers.ts` ~Z. 2721 (`umamiWebsiteId` typisiert aus `owned.website.umamiWebsiteId` — Spalte existiert im Schema; `as any` weg; falls `owned.website` ein schmaler Typ ist, Select erweitern), `client/src/components/site/packs/zunft/css.ts:20` (`.pb-zf-price{color:var(--pb-ink)…}` oder Akzent mit ≥ 4,5:1 — per Kontrastrechnung gegen den Kartenhintergrund entscheiden), `shared/stylePacks/zunft.ts` (Rollen-/usage-Kommentar konsistent)
- Test: `server/routers.v2Guards.test.ts` oder `customer.dashboard.test.ts` (Statistik: `umamiWebsiteId` gesetzt → `getUmamiStats` aufgerufen; null → `null`), `client/src/pages/WebsitesPage.test.tsx` (neu, statisch: Pack-Name erscheint, kein „79"), Playwright `packs.spec.ts` zunft-Baselines neu (`-g zunft --update-snapshots`), danach 98/98.

- [ ] **Step 1–4:** Tests → FAIL → implementieren → Gates (vitest, tsc 0, packs 98/98) → Commit `git commit -m "refactor: Admin-Website-Liste zeigt Pack + Studio-Link, 79-€-CheckoutDialog entfernt, Statistik liest umamiWebsiteId, zunft-Preisfarbe" -- <pfade>`

---

### Task 4: Dev-Login fürs Dashboard, a11y Dashboard + Dark-Mode

**Files:**
- Create: `server/onboardingV2/devDashboardSeed.ts` (nur `NODE_ENV !== "production"`; `GET /dev/dashboard-seed?pack=werkbank&fixture=full&json=1`: legt User (E-Mail `dev-dashboard@example.test`), Website (v2-Dokument wie `studio-seed`, `status: "active"`, `slug: dev-dashboard-<pack>`), Subscription (`status: active`, `checkoutEmail`) an, erzeugt eine Session wie `server/_core/magicLinkAuth.ts` `createSessionToken` + `res.cookie(COOKIE_NAME, …)` (Helfer exportieren/teilen statt duplizieren) und antwortet `{ websiteId, slug, previewToken }` bzw. redirectet auf `/my-website`), registrieren neben `/dev/studio-seed` (`server/_core/index.ts`/`devSeed.ts`)
- Modify: `tests/visual/a11y.spec.ts` (Skip entfernen: Dashboard Übersicht, Add-ons-Tab, Anfragen-Tab via Seed-Cookie; Dark-Mode-Variante `/`: Toggle-Button klicken oder `emulateMedia({ colorScheme: "dark" })` — prüfen, wie `LandingPage` `isDark` initialisiert), `client/src/pages/LandingPage.tsx` + `PackShowcase.tsx` (nur Dark-Klassen-Kontraste, falls axe meldet), `docs/BETRIEB-V2.md` (Dev-Seeds)
- Test: `server/onboardingV2/devDashboardSeed.test.ts` (in production nicht registriert; Seed legt Zeilen an und setzt Cookie)

- [ ] **Step 1–4:** Tests → FAIL → implementieren → Gates (vitest, tsc 0, `a11y.spec.ts` grün 2× inkl. Dashboard + Dark, `studio.spec.ts`) → Commit `git commit -m "feat: Dev-Dashboard-Seed mit Session, a11y-Spec deckt Dashboard und Dark-Mode ab" -- <pfade>`

---

### Task 5: Performance I — Fonts

**Files:**
- Modify: `client/src/index.css` (Z. ~38: `@import url(https://fonts.googleapis.com/…25 Familien…)` entfernen), `client/index.html` (Z. ~114: riesiger Font-Preload der v1-Layouts entfernen; Z. ~89 Inter/Plus Jakarta Sans behalten — prüfen, ob Studio/Dashboard/Landing weitere Familien nutzen: `grep -rn "font-family\|fontFamily" client/src --include=*.tsx --include=*.css | grep -v packs/` → nur diese behalten), `client/src/pages/SitePage.tsx` (CSR-Fallback: Pack-Fonts aus `getConstitution(packId).type.*.googleCss` als `<link rel="stylesheet">` injizieren — wie `server/ssr/renderSite.tsx` den SSR-Head baut; Helfer in `client/src/lib/packFonts.ts` + Test), `tests/visual/landing.spec.ts`/`studio.spec.ts` Baselines (Schrift bleibt gleich → erwartet unverändert; falls Fallback-Font sichtbar wird, Ursache beheben, nicht Baseline anpassen)
- Messung: Lighthouse vorher/nachher (Produktions-Build auf Port 3011, mobil + Desktop; CHROME_PATH wie in B4c Task 6) → LCP/render-blocking im Bericht

- [ ] **Step 1–4:** Lighthouse vorher → implementieren → Lighthouse nachher → Gates (vitest, tsc 0, Playwright landing/studio/packs/islands) → Commit `git commit -m "perf: v1-Font-Importe entfernt, Pack-Fonts im CSR-Fallback aus der Verfassung" -- <pfade>`

---

### Task 6: Performance II — Chunking und Pack-Identität

**Files:**
- Modify: `client/src/App.tsx` (`LandingPage`, `StartPage`, `SitePage`, `LegalPage` per `lazy()`; `TooltipProvider` aus `App.tsx:~283` in `DashboardLayout`/Admin-Root verschieben — prüfen, wo Tooltips genutzt werden: `grep -rn "Tooltip" client/src --include=*.tsx | grep -v ui/tooltip`), `vite.config.ts` (`manualChunks`: `@tanstack/react-query` getrennt von `@radix-ui/*`; Pack-Daten `shared/stylePacks` + `gmbCategories` nicht im Entry), `client/src/components/landing/PackShowcase.tsx` (Pack-Liste aus einer kleinen Datei `shared/stylePacks/summary.ts` `{ id, name, essence, accent }[]` — handgepflegter Export mit Test, der gegen `STYLE_PACKS` prüft, oder per Skript generiert), framer-motion: `LazyMotion` + `m` in `LandingPage`/`PackShowcase`/Studio (nur wo `motion.*` genutzt wird; `AnimatePresence` bleibt)
- Pack-Identität (Spec §2.4): für `werkbank`, `marktplatz`, `schimmer` Kontrast „`ink`-Text auf Original-Akzent" berechnen (Originale aus `git show 71ebf07:shared/stylePacks/<pack>.ts`); wenn ≥ 4,5:1 → Akzent zurück, CTA-Textfarbe in Pack-CSS auf `var(--pb-ink)` (und `packs.spec`-Farbassertion anpassen: Rolle/Prop), Vorschauen (`npm run build:previews`), Demo-SVGs, Baselines der drei Packs neu; wenn nein → nichts ändern, Ergebnis dokumentieren
- Messung: Lighthouse + `vite build`-Ausgabe (gzip je Chunk, was `/` lädt) vorher/nachher

- [ ] **Step 1–4:** Messen → implementieren → messen → Gates (vitest, tsc 0, Playwright alle Specs; Baselines nur für die drei Packs + landing bei Farbänderung) → Commit `git commit -m "perf: Landing-Entry ohne Radix/Pack-Daten, Seiten lazy, LazyMotion; Pack-Identität werkbank/marktplatz/schimmer" -- <pfade>`

---

### Task 7: Abschluss B5

- [ ] Volle Gates (vitest, tsc 0, build, Playwright alle Specs separat, studio/landing/a11y 2×); Lighthouse-Endwerte; Erfolgskriterien Spec §4 mit Status.
- [ ] Doku: `docs/BETRIEB-V2.md` (Migration 0028 + Prod-Ablauf Expand/Contract, Dev-Seeds, Fonts), `docs/superpowers/specs/2026-08-23-b5-ergebnis.md` (Tabelle je Task, Messwerte, Rulings, offene Punkte → B6), Spec §4 Stand-Block.
- [ ] Commit `git commit -m "docs: B5-Ergebnis — Team-Add-on, Admin-Reste, Performance" -- <pfade>`
- [ ] Nach Merge (Koordinator, mit Freigabe): Prod Deploy → Backup → Migration 0028 → Smoke.

---

## Self-Review
- Spec-Abdeckung: §2.1 → Task 1+2; §2.2 → Task 3+4; §2.3 → Task 5+6; §2.4 → Task 6; §2.5 → Task 4; §2.6 → Task 7. §3 (B6) ausgeschlossen.
- Platzhalter: Schemata/Signaturen für `TeamPatchSchema`, `applyTeam`, `updateTeam`, Dev-Seed-Route sind definiert; Messungen und „nach grep"-Entscheidungen explizit als zu dokumentierende Ergebnisse.
- Typkonsistenz: `TeamPatch` (Task 1) wird von `TeamEditor`/`useStudioState` (Task 2) genutzt; `BOOKABLE_ADDON_KEYS` (Task 1) steuert AddonsPanel/AddonsTab (Task 2); Dev-Seed-Antwort `{ websiteId, slug, previewToken }` (Task 4) wird von `a11y.spec` genutzt.
