# Plan B4c: Polish & Konsolidierung — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** v2 nach der Löschung (main 0b1257f) technisch sauber ziehen — Farbkette auf Pack-Palette, Rechtsseiten-Regenerierung abgesichert, toter Code weg, v1-DB-Spalten gedroppt, SSR/CSR konsistent, Landingpage performant, a11y messbar — ohne neue Produkt-Features.

**Architecture:** Acht Tasks in Spec-Reihenfolge; jeder Task ist einzeln gate-fähig (tsc/vitest/Playwright). Neue Messinstrumente werden als Playwright-Specs bzw. Skripte ins Repo gelegt (`tests/visual/a11y.spec.ts`, `scripts/build-pack-previews.mjs`), damit die Kriterien reproduzierbar bleiben. DB-Drops laufen als handgeschriebene Migration `drizzle/0027_drop_v1_columns.sql` (Konvention: kein drizzle-kit generate); Prod-Einspielung erst nach Merge mit Backup (Task 8 dokumentiert das Kommando, ausgeführt wird es mit Nutzer-Freigabe).

**Tech Stack:** React 19, TypeScript strict, Vite 7, Express 4, tRPC 11, Drizzle/MySQL 8, Vitest (node; Client-Tests via `renderToStaticMarkup` + `import React from "react"`), Playwright (`tests/visual/`, PORT 3005, `--workers=1 --reporter=line`, separate kurze Befehle), `@axe-core/playwright` (neu, devDependency), `knip` (einmalig via `npx knip`), Lighthouse (einmalig via `npx lighthouse`, Chromium aus Playwright).

**Spec:** `docs/superpowers/specs/2026-08-23-b4c-polish-design.md` (verbindlich; Entscheidungen §5 alle wie empfohlen) · Vorlauf: `docs/superpowers/specs/2026-08-23-b4b-ergebnis.md` (B4c-Liste, DB-Referenztabelle).

## Global Constraints

- Branch `onboarding-v2` (= main zu Beginn). Commit je Task NUR mit explizitem Pathspec (`git commit -m "…" -- <pfade>`, `git rm` für Löschungen), nie `git add -A`/`-a`, kein `git stash`; Prettier-Hook-Reformatierungen fremder Dateien nicht mitcommitten (eigene massiv reformatierte Dateien → separater `chore:`-Commit davor).
- Gates je Task: tsc-Liste `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "error TS" | sort` gegen die Baseline (21 Fehler bei 0b1257f; Ziel am Ende ≤ 10) — keine NEUEN; `npx vitest run` grün bis auf bekannte Fails (2× `server/resend.test.ts` ohne `RESEND_API_KEY`, 2 Stripe-Env-Suiten `auth.logout`/`pageblitz` ohne `STRIPE_SECRET_KEY`; `contrast.test.ts` entfällt in Task 2); Playwright-Baselines unverändert außer dort, wo der Task es ausdrücklich sagt (packs 84/84, studio 8/8, islands 4/4, landing 1/1, startpage-to-studio 1/1; Task 7 ergänzt `a11y.spec.ts`).
- Vor jeder Löschung: `grep -rn "<Name>" client server shared scripts tests drizzle` → 0 Treffer außerhalb der zu löschenden Dateien/Migrationen.
- **Behalten:** `layout_counters` + `getNextLayoutForIndustry`, `StockPhotoSearch` + `onboarding.searchStockPhotos`, `getIndustryImages`/`getHeroImageUrl`/`getGalleryImages` (`server/industryImages.ts`), `SSR_SITES`, `PB_LLM_MOCK`, `onboarding.getStepEvents`/`regenerateLegalPages`, `selfService.start`/`captureEmail`, `onboardingUpload.ts`, `legalGenerator.ts` (`generateImpressum`/`generateDatenschutz`), `onboardingV2Patch.ts`, `generation_jobs`, `onboarding_responses`-Spalten `businessName`, `businessCategory`, `studioProgress`, alle `legal*`-, `openingHours`-, `addOn*`-, `chat*`-, `photoUrls`-, `headlineFont`-Felder (nur die in Task 4 genannten v1-Inhaltsspalten fallen).
- DB-Spaltennamen sind camelCase in MySQL (wie `drizzle/schema.ts`), z. B. `heroImageUrl`, nicht `hero_image_url`.
- Keine neuen Produkt-Features (Team-Panel, Unterseiten, Dashboard-Redesign = B5). Texte deutsch. Commit-Format `<typ>: <beschreibung>` ohne Co-Authored-By. Neue Dateien < 400 Zeilen.
- Port 3000 fremd — nie anfassen; Dev/Playwright auf 3005 (`lsof -nP -iTCP:3005 -sTCP:LISTEN` vor Playwright leer, verwaiste `tsx watch server/_core/index.ts` beenden). Lokale DB: Docker `pageblitz-mysql` (`docker ps`; sonst `colima start && docker start pageblitz-mysql`), Zugang aus `.env`.

---

### Task 1: LegalPage auf Pack-Palette, Rechtsseiten-Regenerierung abgesichert

**Files:**
- Modify: `client/src/pages/LegalPage.tsx` (Z. 23–31 Mutation/Toast, Z. 66–67 Farbe)
- Create: `client/src/lib/packAccent.ts` (+ Test `client/src/lib/packAccent.test.ts`)
- Modify: `server/routers.ts` `onboarding.regenerateLegalPages` (~Z. 1922–1990)
- Modify: `client/src/components/landing/PackShowcase.tsx` (nutzt `getAccentColor` lokal → auf `packAccent.ts` umstellen, DRY)
- Test: `server/routers.v2Guards.test.ts` (neue Fälle)

**Interfaces:**
- Produces: `getPackAccent(packId: PackId | string | null | undefined): string` (Hex; Fallback `#111111`) in `client/src/lib/packAccent.ts` — nutzt `getConstitution(id).palette.find(c => c.role === "accent")?.hex`, bei unbekanntem Pack `FALLBACK_PACK`.
- Produces: `onboarding.regenerateLegalPages({ websiteId, token? })` → `{ success: true, regenerated: true } | { success: false, error: string }`; Zugriff: Admin (`ctx.user?.role === "admin"`), Abo-Inhaber (`loadStudioWebsite`-Ownership per `previewToken`-Input oder eingeloggter Besitzer über `getSubscriptionByWebsiteId`), sonst `FORBIDDEN`.

- [ ] **Step 1: Failing tests** — `client/src/lib/packAccent.test.ts` (gültiges Pack liefert Hex der Akzentfarbe aus `getConstitution`, unbekanntes/leer → Fallback, Ergebnis matcht `/^#[0-9a-f]{6}$/i`); in `server/routers.v2Guards.test.ts` drei Fälle: anonym ohne Token → `FORBIDDEN`; mit passendem `previewToken` → `regenerated: true` und `updateWebsite` mit `websiteData.legal.impressumHtml`; Admin-Kontext → ok (Mock-Muster der Datei übernehmen).
- [ ] **Step 2: Tests → FAIL.**
- [ ] **Step 3: `packAccent.ts`:**
```ts
import { FALLBACK_PACK, getConstitution } from "@shared/stylePacks";
import type { PackId } from "@shared/siteContract/types";
const FALLBACK_ACCENT = "#111111";
export function getPackAccent(packId: PackId | string | null | undefined): string {
  const id = (packId ?? FALLBACK_PACK) as PackId;
  let c; try { c = getConstitution(id); } catch { c = getConstitution(FALLBACK_PACK); }
  return c.palette.find(p => p.role === "accent")?.hex ?? FALLBACK_ACCENT;
}
```
(Prüfe, ob `getConstitution` bei unbekannter ID wirft oder Fallback liefert — `shared/stylePacks/index.ts:40` — und vereinfache entsprechend.)
- [ ] **Step 4: `LegalPage.tsx`:** `const primaryColor = getPackAccent(websiteData?.stylePackId)` statt `colorScheme`; `regenerated`-Auswertung bleibt, Typ passt jetzt (tsc-Altfehler Z. 27/31 verschwinden); Token aus der URL? — `LegalPage` wird unter `/site/:slug/impressum` aufgerufen (kein Token) → Regenerieren-Button nur anzeigen, wenn der Nutzer eingeloggter Besitzer ist (Query `customer.getMyWebsites` enthält die Website) — sonst Button ausblenden.
- [ ] **Step 5: Server:** Auth-Gate wie in Interfaces; Rückgabe `{ success: true, regenerated: true }`; `PackShowcase.getAccentColor` → `getPackAccent`.
- [ ] **Step 6: Gates** — `npx vitest run client/src/lib server/routers.v2Guards.test.ts client/src/components/landing` grün; tsc ≤ 21 (erwartet −2); Playwright `landing.spec.ts` 1/1.
- [ ] **Step 7: Commit** — `git commit -m "fix: Rechtsseiten — Farbe aus Pack-Palette, Regenerierung nur für Besitzer/Admin mit regenerated-Flag" -- <pfade>`

---

### Task 2: Farbkette entfernen

**Files:**
- Modify: `server/routers.ts` `customer.getMyWebsites` (colorScheme-Auto-Migration ~Z. 2040–2060 entfernen), Import `getIndustryColorScheme` weg
- Modify: `server/industryImages.ts` (`getIndustryColorScheme`, `getContrastColor` entfernen; `INDUSTRY_IMAGES`/`getIndustryImages`/`getHeroImageUrl`/`getGalleryImages` bleiben)
- Modify/Delete: `shared/industryImages.ts` (`INDUSTRY_COLORS` + davon abhängige Exporte entfernen; Datei löschen, falls danach leer/unreferenziert), `shared/layoutConfig.ts` (löschen), `shared/colorContrast.ts` + `server/contrast.test.ts` (löschen, falls 0 v2-Konsumenten — Stand: einziger Nutzer ist `layoutConfig.ts`), `shared/types.ts` (`ColorScheme` entfernen, falls 0 Referenzen; `BusinessSearchResult` bleibt)
- Modify: `client/src/pages/SitePage.tsx`/`dashboard/**` nur, falls `colorScheme` noch gelesen wird (grep)

- [ ] **Step 1: Referenz-Check** — `for n in getIndustryColorScheme INDUSTRY_COLORS withOnColors layoutConfig colorContrast getContrastColor ColorScheme; do echo "== $n"; grep -rn "$n" client server shared scripts tests | grep -v "drizzle/"; done` — `ColorScheme` darf nur noch in Drizzle-Schema (`colorScheme: json(...)`) vorkommen, das Task 4 droppt.
- [ ] **Step 2: Entfernen/Löschen; tote Importe nachziehen.**
- [ ] **Step 3: Gates** — `npx vitest run` grün (contrast.test weg → Env-Fail-Liste schrumpft), tsc ≤ vorher, Playwright `packs.spec.ts` 84/84 (Packs dürfen nichts aus der Kette importieren — vorher grep in `client/src/components/site`).
- [ ] **Step 4: Commit** — `git commit -m "chore: v1-Farbkette entfernt (colorScheme-Migration, industryColors, layoutConfig, colorContrast)" -- <pfade>`

---

### Task 3: Toter Code per knip

**Files:** ergeben sich aus dem Lauf; bekannte Kandidaten (Spec §2.4): `client/src/components/GoogleRatingBadge.tsx`, `IndustryIcon.tsx` + `shared/industryIcons.ts`, `ManusDialog.tsx`, `Map.tsx`, `client/src/hooks/useAnimations.ts`, `client/src/lib/industryStats.ts`, `server/_core/dataApi.ts`, `server/_core/voiceTranscription.ts`, `server/legalGenerator.ts patchWebsiteData`, `lifecycle.resolveSeedByPreviewToken` (+ Helfer), ungenutzte Importe `countBusinesses` (routers.ts), `like`/Typ-Importe in `server/db.ts`.

- [ ] **Step 1:** `npx knip --reporter compact > /private/tmp/claude-501/-Users-christianniessing-cursor-projects-pageblitz-pageblitz/3b6a8663-c1a8-42f3-a2c1-59ab5a5551b6/scratchpad/knip.txt 2>&1` (falls knip eine Konfiguration braucht: minimale `knip.json` mit `entry: ["client/src/main.tsx", "server/_core/index.ts", "scripts/*.mjs", "tests/**/*.ts"]`, `project: ["client/src/**", "server/**", "shared/**"]`; `knip.json` NICHT committen, außer sie ist dauerhaft sinnvoll — dann committen und in `BETRIEB-V2.md` erwähnen).
- [ ] **Step 2:** Befunde triagieren: unbenutzte Dateien/Exporte/Dependencies. Löschen, was 0 Referenzen hat und nicht auf der Behalten-Liste steht; `package.json`-Dependencies nur entfernen, wenn knip + grep übereinstimmen (`pnpm remove <pkg>`; Lockfile mitcommitten). Liste der Ausnahmen mit Begründung in den Bericht.
- [ ] **Step 3: Gates** — vitest grün, tsc ≤ vorher, `npm run build` grün, Playwright `studio.spec.ts` 8/8.
- [ ] **Step 4: Commit** — `git commit -m "chore: toten Code entfernt (knip-Lauf) — <n> Dateien, <m> Exporte, <k> Dependencies" -- <pfade>`

---

### Task 4: v1-DB-Spalten droppen (Code + Migration 0027)

**Files:**
- Modify: `server/onboardingV2/router.ts` (~Z. 110: `layoutStyle`-Spiegel beim Pack-Wechsel entfernen), `server/onboardingV2/devSeed.ts` (~Z. 52/99/100: `layoutStyle`/`layoutVersion` entfernen), `server/db.ts` `createOnboarding` (~Z. 810–842: Spread der v1-Inhaltsspalten entfernen; `getWebsiteByBusinessId`/`createGeneratedWebsite`-Typen folgen dem Schema), `server/routers.ts`/`client/**` (jede verbliebene Lese-/Schreibstelle der Spalten — grep je Name), `server/legalGenerator.ts:~262` (`patched.heroImageUrl` — In-Memory-Feld auf v1-Dokument; entfällt mit `patchWebsiteData` aus Task 3, sonst hier).
- Modify: `drizzle/schema.ts` (Spalten + Tabelle entfernen), Create: `drizzle/0027_drop_v1_columns.sql`
- Modify: `docs/BETRIEB-V2.md` (Migration 0027 + Backup-Kommando)
- Test: `server/onboardingV2/router.test.ts`, `server/onboardingV2/devSeed.test.ts`, `server/db*.test.ts` (Mocks/Erwartungen ohne die Spalten)

**Interfaces:** `createGeneratedWebsite`/`updateWebsite`/`createOnboarding` akzeptieren die gedroppten Felder nicht mehr (tsc erzwingt das nach Schema-Änderung).

- [ ] **Step 1: Referenztabelle** — für jede Spalte `for c in colorScheme heroImageUrl aboutImageUrl layoutStyle layoutVersion contactFormFields addOnTeamData tagline description foundedYear teamSize usp topServices targetAudience faqItems logoUrl heroPhotoUrl aboutPhotoUrl brandColor brandSecondaryColor sectionOrder hiddenSections; do echo "== $c"; grep -rn "\b$c\b" server client shared | grep -v "drizzle/"; done` — Achtung: `description`/`logoUrl`/`tagline` kommen auch als v2-Dokumentfelder vor (`websiteData.*`) — nur DB-Spaltenzugriffe (`onboarding.<col>`, `website.<col>`, `createOnboarding({ ... })`) zählen. Für `onboarding_responses` zusätzlich `colorScheme`, `addOnTeamData`, `contactFormFields` prüfen (Spec nennt sie nur für `generated_websites`; wenn auch dort unreferenziert → mit droppen).
- [ ] **Step 2: Code bereinigen**, bis alle Zugriffe weg sind; `server/onboardingV2/router.ts`: Admin-Listen (`WebsitesPage`) zeigen den Pack aus `websiteData.stylePackId` — prüfen, ob `WebsitesPage.tsx` `layoutStyle` liest (grep) und ggf. auf `stylePackId` umstellen.
- [ ] **Step 3: Schema + Migration** — `drizzle/schema.ts` Spalten/Tabelle entfernen; `drizzle/0027_drop_v1_columns.sql`:
```sql
-- B4c: v1-Spalten/Tabellen entfernen (Plan 2026-08-23-onboarding-v2-b4c-polish.md Task 4)
ALTER TABLE `generated_websites`
  DROP COLUMN `colorScheme`, DROP COLUMN `heroImageUrl`, DROP COLUMN `aboutImageUrl`,
  DROP COLUMN `layoutStyle`, DROP COLUMN `layoutVersion`,
  DROP COLUMN `contactFormFields`, DROP COLUMN `addOnTeamData`;
ALTER TABLE `onboarding_responses`
  DROP COLUMN `tagline`, DROP COLUMN `description`, DROP COLUMN `foundedYear`, DROP COLUMN `teamSize`,
  DROP COLUMN `usp`, DROP COLUMN `topServices`, DROP COLUMN `targetAudience`, DROP COLUMN `faqItems`,
  DROP COLUMN `logoUrl`, DROP COLUMN `heroPhotoUrl`, DROP COLUMN `aboutPhotoUrl`,
  DROP COLUMN `brandColor`, DROP COLUMN `brandSecondaryColor`, DROP COLUMN `sectionOrder`, DROP COLUMN `hiddenSections`;
DROP TABLE IF EXISTS `template_uploads`;
```
(Spaltenliste an das Ergebnis von Step 1 anpassen — nur nachweislich unreferenzierte Spalten; `onboarding_responses.colorScheme/addOnTeamData/contactFormFields` ergänzen, falls unreferenziert.) Lokal einspielen: `mysql -h127.0.0.1 -P<port> -u<user> -p<pw> <db> < drizzle/0027_drop_v1_columns.sql` (Werte aus `.env`), danach `npx drizzle-kit check`/`push --force` NICHT nötig — Schema und DB müssen übereinstimmen: `npm run dev` startet, `tests/visual/studio.spec.ts` 8/8.
- [ ] **Step 4: Gates** — vitest grün, tsc ≤ vorher, Playwright `studio.spec.ts` 8/8, `startpage-to-studio.spec.ts` 1/1, `islands.spec.ts` 4/4; `grep -rn "colorScheme\|layoutStyle\|layoutVersion\|heroImageUrl\|aboutImageUrl\|contactFormFields\|addOnTeamData\|template_uploads\|templateUploads" client server shared drizzle/schema.ts` → 0.
- [ ] **Step 5: Doku** — `BETRIEB-V2.md` §Datenbank: Migration 0027 (destruktiv), Prod-Ablauf: `mysqldump <db> generated_websites onboarding_responses template_uploads > backup-0027-$(date +%F).sql` → `mysql <db> < drizzle/0027_drop_v1_columns.sql` → Deploy.
- [ ] **Step 6: Commit** — `git commit -m "refactor: v1-DB-Spalten und template_uploads entfernt (Migration 0027), Schreib-/Lesestellen bereinigt" -- <pfade>`

---

### Task 5: SSR/CSR-Konsistenz — 404, Demo-Rechtsseiten, og:image

**Files:**
- Modify: `server/ssr/routes.ts` (`handleCustomerSiteSsr` ~Z. 296–372: unbekannter Pfad unter bekanntem Slug → SSR-404; `handleDemoRoute`/Route-Regex für `/demo/:pack/impressum|datenschutz`), `server/ssr/renderSite.tsx` (Head: `og:image`, `twitter:card`; `pathname`-Rendering der Rechtsseiten existiert schon ~Z. 222–231), Create: `server/ssr/notFoundPage.ts` (kleines HTML-404 mit `noindex`)
- Test: `server/ssr/routes.test.ts`, `server/ssr/renderSite.test.tsx` (falls vorhanden, sonst neu)

**Interfaces:** `renderNotFoundHtml({ businessName, homeHref })` → string; `renderSiteHtml` setzt `<meta property="og:image" content="<origin><heroImageUrl>">` wenn die erste Hero-Sektion ein `imageUrl` hat (absolut machen: relative Pfade mit `origin` präfixen).

- [ ] **Step 1: Failing tests** — `/site/<slug>/gibt-es-nicht` bei v2-Website → 404, `text/html`, enthält `noindex` und den Business-Namen; `/site/<slug>/impressum` weiterhin 200; `/demo/werkbank/impressum` → 200 + `noindex, nofollow` + enthält „Impressum"; `/demo/werkbank/foo` → 404; `renderSiteHtml` mit Hero-Bild → `og:image` absolut; ohne → kein Tag.
- [ ] **Step 2: Implementieren** — in `handleCustomerSiteSsr`: nach Slug-Auflösung, wenn `!SSR_ALLOWED_PATHNAMES.has(pathname)` UND der Pfad kein Asset ist (`/\.[a-z0-9]+$/i` → `next()`), Website laden; existiert sie (v2) → `res.status(404).type("html").send(renderNotFoundHtml(...))` mit `X-Robots-Tag: noindex`; sonst `next()`. Demo: Route `app.get("/demo/:pack([a-z0-9-]+)/:page(impressum|datenschutz)", …)` → `renderSiteHtml(fixture, { pathname: "/impressum" … basePath: "/demo/<pack>" })`. SPA-Liste in `server/_core/static.ts` unverändert (Sub-Pfade landen nicht mehr dort).
- [ ] **Step 3: Gates** — `npx vitest run server/ssr` grün; Playwright `packs.spec.ts` 84/84, `landing.spec.ts` 1/1 (Demo-iframes unverändert), `islands.spec.ts` 4/4.
- [ ] **Step 4: Commit** — `git commit -m "feat: SSR-404 für unbekannte Kundenpfade, Demo-Rechtsseiten, og:image im SSR-Head" -- <pfade>`

---

### Task 6: Landingpage-Performance — statische Pack-Vorschauen

**Files:**
- Create: `scripts/build-pack-previews.mjs` (Playwright/Chromium: startet KEINEN Server selbst — erwartet laufenden Dev-Server auf `PORT` (Default 3005); für jedes Pack aus `shared/stylePacks` `PACK_IDS`: `/demo/<pack>` bei 1280×800, Screenshot → `client/public/pack-previews/<pack>.webp` (Breite 800, Qualität 80; `sharp` vorhanden? `ls node_modules/sharp` — sonst PNG + Playwright `quality` nur für jpeg → `.jpg`), `npm run build:previews` in `package.json`), Assets: `client/public/pack-previews/*.{webp|jpg}` (14 Dateien, je ≤ 80 KB)
- Modify: `client/src/components/landing/PackShowcase.tsx` (Karte zeigt `<img src="/pack-previews/<pack>.webp" loading="lazy" width height alt>`; Klick/Taste öffnet die Live-Demo: Modal mit iframe `/demo/<pack>` (nur dann geladen) oder `target=_blank` — wähle Modal mit Fokusfalle, Esc schließt; Hero-Rotation bleibt)
- Modify: `tests/visual/landing.spec.ts` (wartet nicht mehr auf 14 iframes, sondern auf 14 geladene `img`; Baseline neu), `docs/BETRIEB-V2.md` (Build-Schritt `build:previews` nach Pack-Änderungen)
- Messung: Lighthouse vorher/nachher: `npx lighthouse http://localhost:3005/ --preset=desktop --only-categories=performance --output=json --output-path=<scratchpad>/lh-before.json --chrome-flags="--headless=new"` (CHROME_PATH auf Playwright-Chromium setzen: `$(node -e "console.log(require('playwright').chromium.executablePath())")`) und mobil (Default-Preset); LCP/TBT/JS-Größe in den Bericht.

- [ ] **Step 1: Lighthouse vorher** (Dev-Server + Produktions-Build: `npm run build && NODE_ENV=production PORT=3005 node dist/index.js` — falls `dist/index.js` ohne Env nicht startet, Dev-Server nehmen und das im Bericht sagen).
- [ ] **Step 2: Skript + Assets erzeugen, Komponente umbauen, Test anpassen (`--update-snapshots`, dann 2× grün).**
- [ ] **Step 3: Lighthouse nachher; Budget: LCP < 2,5 s (mobil simuliert), JS der Landingpage < 150 kB gzip (`vite build`-Ausgabe: Landing-Chunk + Vendor, die auf `/` geladen werden — per Network-Tab/`dist/public/assets`-Größen abschätzen). Wird das Budget verfehlt, dokumentieren, was noch fehlt (z. B. framer-motion lazy), nicht still übergehen.**
- [ ] **Step 4: Gates** — vitest `client/src/components/landing` grün; Playwright `landing.spec.ts` 2× grün, `packs.spec.ts` unverändert.
- [ ] **Step 5: Commit** — `git commit -m "perf: Landingpage-Showcase mit statischen Pack-Vorschauen, Live-Demo per Klick (Lighthouse vorher/nachher im Bericht)" -- <pfade>`

---

### Task 7: A11y-Pass — axe-Spec, Kontraste, Fokus, prefersMenu

**Files:**
- Add devDependency: `pnpm add -D @axe-core/playwright` (Lockfile mitcommitten)
- Create: `tests/visual/a11y.spec.ts` (Seiten: `/`, `/demo/<pack>` für alle 14 Packs, Studio `/onboarding/<token>` aus `/dev/studio-seed?pack=werkbank&fixture=full&json=1` — Checkliste + jedes Panel per `?panel=<id>`, Dashboard `/my-website` (Login über den Dev-Seed/Magic-Link wie in B4a Task 4 — wenn nicht stabil machbar, Dashboard auslassen und begründen); Assertion: `results.violations.filter(v => ["critical","serious"].includes(v.impact)).length === 0`; Verstöße im Testnamen/Fehlertext mit `id`, `impact`, `nodes[0].target` ausgeben)
- Modify: Verfassungen `shared/stylePacks/marktplatz.ts`, `shared/stylePacks/schimmer.ts` (CTA-Farbton so anpassen, dass Kontrast Text/Button ≥ 4,5:1 — mit `shared`-internem Kontrastrechner prüfen; falls der in Task 2 gelöscht wurde, kleine Hilfsfunktion im Test), ggf. weitere Packs/Module, die axe meldet; Studio-Panels (`client/src/pages/onboarding-v2/panels/PanelFrame.tsx`): Fokusfalle (Tab bleibt im Panel, Esc schließt, Fokus-Rückgabe), `aria-modal`/`role="dialog"` prüfen; Inseln (`client/src/components/site/islands/*`) Tastatur: Öffnen/Schließen per Enter/Esc
- Modify: `shared/stylePacks/types.ts` (`prefersMenu?: boolean` in `PackConstitution`), `shared/stylePacks/gusto.ts` (+ weitere Gastro-Packs: alle, deren `industries` Gastro-Begriffe enthalten — `grep -n "industries" shared/stylePacks/*.ts`), `client/src/pages/onboarding-v2/panels/OfferPanel.tsx` (`offerFromDoc`: wenn keine menu/pricelist/services-Sektion mit Inhalt → Startmodus `menu`, falls `getConstitution(doc.stylePackId).prefersMenu`), Test `OfferPanel.test.tsx`
- Baselines: betroffene `packs.spec.ts`-Baselines für angepasste Packs neu (`--update-snapshots` nur für diese Tests, z. B. `-g "marktplatz|schimmer"`), danach 2× grün

- [ ] **Step 1: Spec anlegen, laufen lassen, Verstöße sammeln (Liste in den Bericht).**
- [ ] **Step 2: Beheben (Kontraste in der Verfassung, fehlende Labels/Alt-Texte/Landmarken in Modulen/Studio), Fokusfalle, prefersMenu.**
- [ ] **Step 3: Gates** — `npx playwright test tests/visual/a11y.spec.ts --workers=1 --reporter=line` grün (2×), `packs.spec.ts` 84/84 mit neuen Baselines der geänderten Packs, `studio.spec.ts` 8/8 (ggf. Baselines, falls Fokus-Styles sichtbar), vitest grün, tsc ≤ vorher.
- [ ] **Step 4: Commit** — `git commit -m "feat: a11y-Spec (axe) für Landing/Demos/Studio, Kontraste und Fokusfallen korrigiert, prefersMenu für Gastro-Packs" -- <pfade>`

---

### Task 8: Abschluss B4c

- [ ] **Step 1: Volle Gates** — `npx vitest run`; tsc (Ziel ≤ 10; Restliste mit Begründung); `npm run build`; Playwright alle Specs separat (packs, studio 2×, islands, landing 2×, startpage-to-studio, a11y 2×).
- [ ] **Step 2: Erfolgskriterien der Spec §4 prüfen und dokumentieren** (grep-Liste, knip, axe, Lighthouse, Baselines, tsc).
- [ ] **Step 3: Doku** — `docs/BETRIEB-V2.md` (Migration 0027 + Prod-Ablauf, `build:previews`, a11y-Spec, Env-Fail-Liste), `docs/superpowers/specs/2026-08-23-b4c-ergebnis.md` (Tabelle je Task, Messwerte vorher/nachher, Abweichungen/Rulings, offene Punkte → B5), Memory-Hinweis für den Koordinator.
- [ ] **Step 4: Commit** — `git commit -m "docs: B4c-Ergebnis — Polish & Konsolidierung abgeschlossen" -- <pfade>`
- [ ] **Nach dem Merge (Koordinator, mit Nutzer-Freigabe):** Prod-Backup + Migration 0027 einspielen, Deploy (`cd /root/pageblitz && git fetch origin && git reset --hard origin/main && npm run build && pm2 restart pageblitz`), Smoke-Test `/`, `/demo/werkbank`, eine Kundenseite, Studio-Link.

---

## Self-Review

- **Spec-Abdeckung:** §2.1 → Task 1+2; §2.2 → Task 4; §2.3 → Task 1; §2.4 → Task 3; §2.5 → Task 5; §2.6 → Task 6; §2.7 → Task 7; §2.8 → Task 8; §3 (B5) bewusst nicht enthalten; §4 Erfolgskriterien in Task 8 Step 2.
- **Platzhalter:** Code für die neuen Helfer/Signaturen/SQL steht im Plan; Entscheidungen „nach grep" (Spaltenliste, knip-Befunde, axe-Verstöße) sind explizit als zu dokumentierende Ergebnisse formuliert, nicht als TODO.
- **Typkonsistenz:** `getPackAccent` (Task 1) wird von `LegalPage` und `PackShowcase` genutzt; `regenerateLegalPages`-Rückgabe `{ success, regenerated }` in Server und `LegalPage` identisch; `renderNotFoundHtml`/`renderSiteHtml`-Optionen (Task 5) nur dort; `PackConstitution.prefersMenu` (Task 7) in `types.ts` und `OfferPanel`.
