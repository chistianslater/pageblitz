# B4b-Ergebnis: Löschung des v1-Systems

**Datum:** 2026-08-23 · **Plan:** `docs/superpowers/plans/2026-08-23-onboarding-v2-b4b-loeschung.md` · **Basis:** B4a (main `c8c2221`) · **Endstand:** `onboarding-v2` `f74f700`.

## Ziel und Umfang

Nach dem Cutover auf v2 (B4a) alle v1-only-Flächen entfernen — Chat
(`OnboardingChat.tsx`), v1-Layouts/-Renderer, v1-Generierungsrumpf,
v1-`onboarding.*`/`selfService.*`-Prozeduren, Templates-Cluster, v1-Tests —
ohne Studio, SSR, Dashboard, Admin oder Outreach zu beeinträchtigen. Reine
Subtraktion: keine neuen Features, DB-Spalten/-Tabellen bleiben unangetastet
(B4c). Insgesamt `c8c2221..f74f700`: **53 Dateien, +1.394 / −30.358 LOC**.

## Ergebnis je Task

| Task | Commit(s) | Kernumfang | Hauptdateien gelöscht/geändert | LOC |
|---|---|---|---|---|
| 1 — SitePage/WebsiteRenderer v2-only | `21b3c86` (+ Folgefix `b13302e`) | CSR-Fallback auf `SiteRenderer` umgestellt, `LegacySitePlaceholder` neu, v1-Preview-Seiten weg | Del: `PreviewPage.tsx`, `LayoutPreviewStandalone.tsx`, `OnboardingChat.tsx` (10.130 LOC, vorgezogen), `MacbookMockup.tsx`. Mod: `SitePage.tsx`, `WebsiteRenderer.tsx`, `App.tsx`, `static.ts` | 21b3c86: 13 Dateien, +95/−11.194 · b13302e: 14 Dateien, +91/−4.638 (enthält vorgezogene Task-2-Löschungen, s. Vorfall unten) |
| 2 — Totes Zeug (risikofrei) | `24ba732` | `runWebsiteGeneration`-v1-Rumpf, Alt-Mappings, Font-/Farb-Helfer aus `routers.ts`/`layoutConfig.ts`/`types.ts`/`industryImages.ts` | Mod: `server/routers.ts` (−793 LOC netto), `shared/layoutConfig.ts` (−168), `shared/types.ts` (−16), `shared/industryImages.ts` (−53) | 5 Dateien, +3/−1.031 |
| 3 — Chat-Cluster & v1-Prozeduren | `efcfd23` | `onboarding`/`selfService`-Router auf je 3/2 Prozeduren reduziert, `VariantPreviewPage.tsx`/`LayoutOverviewPage.tsx` + Routen/Nav weg, 6 Chat-only-Tests gelöscht | Del: `VariantPreviewPage.tsx`, `LayoutOverviewPage.tsx`, 6 Testdateien. Mod: `routers.ts`, `App.tsx`, `DashboardLayout.tsx`, `static.ts`/`.test.ts` | 14 Dateien, +188/−2.942 |
| 4 — v1-Generierung & Alt-Mappings | `1539a8a` | `website.generate` (Admin) auf v2-Job umgestellt (asynchron), `client/src/components/layouts/` (`PremiumLayoutsV2.tsx`, 4.891 LOC) gelöscht, `shared/layoutConfig.ts` auf `withOnColors` eingedampft | Del: `layouts/PremiumLayoutsV2.tsx`. Mod: `routers.ts`, `outreachPipeline.ts`, `industryImages.ts`, `generationV2/runJob.ts`, `layoutConfig.ts`, `types.ts` | 9 Dateien, +111/−7.215 |
| 5 — Templates-Cluster & Aufräumen | `a1d1ff2` | `templates`-Router, `server/templateSelector.ts`, `template-library/templates.json` ×2, Build-Copy-Schritt, `template_uploads`-DB-Helper, `shared/industryServices.ts`, `email.ts`-Lead-Templates weg | Del: `templateSelector.ts`, `industryServices.ts`, `industry.mapping.test.ts`, `templates.json` ×2. Mod: `routers.ts`, `db.ts`, `package.json`, `_core/email.ts` | 13 Dateien, +17/−3.290 |
| Prettier-Sweeps (fremde Reformatierungen, s. u.) | `1b0cfcf`, `9f00c3b`, `5cf3eee`, `f74f700` | Reine Formatierungs-Commits für Dateien, die der Hook außerhalb der eigentlichen Edits reformatiert hatte | `LegacySitePlaceholder.*`, `shared/industryImages.ts`, `DashboardLayout.tsx`, `outreachPipeline.ts`, `layoutConfig.ts` | 1b0cfcf: +13/−4 · 9f00c3b: +742/−72 · 5cf3eee: +64/−17 · f74f700: +164/−49 |

## Gates vorher/nachher

| Gate | Vor B4b (main `c8c2221`) | Nach B4b (`f74f700`) |
|---|---|---|
| tsc-Fehler | 40 (Baseline; vor B4a: 73) | **21** |
| vitest | 802 grün, bekannte Env-Fails | **755 grün** + 6 bekannte Fails (4× `contrast.test.ts` = Wertabweichung in `getContrastColor()`, nicht Env; 2× `resend.test.ts` ohne `RESEND_API_KEY`) + 2 Suiten ohne `STRIPE_SECRET_KEY` (`auth.logout`, `pageblitz`) |
| Playwright | packs 84/84, studio 8/8, islands 4/4, landing 1/1, startpage-to-studio 1/1 | unverändert grün (packs 84/84, studio 8/8 ×2, islands 4/4, landing 1/1 ×2, startpage-to-studio 1/1) |
| Build | grün | grün, `dist/index.js` 1,3 → 1,1 MB |

## Rulings und Abweichungen vom Plan

- **`getIndustryColorScheme` + `colorScheme`-Migration bleiben aktiv** (Abweichung vom Task-4-Brief, der die Löschung vorsah): `customer.getMyWebsites` (`server/routers.ts`) rekonstruiert `colorScheme` bei fehlendem Wert und schreibt es zurück; `client/src/pages/LegalPage.tsx:66-67` liest `website.colorScheme` für die Rechtsseiten-Akzentfarbe. v2-Websites setzen `colorScheme` nie selbst — der Migrationspfad ist für sie load-bearing. `withOnColors`/`ColorScheme` (`shared/layoutConfig.ts`) bleiben aus demselben Grund (einziger verbleibender Konsument).
- **`shared/industryServices.ts` komplett gelöscht** (über den Task-5-Brief-Wortlaut „ungenutzte Exporte löschen" hinaus): alle Exporte (`getIndustryProfile`, `getIndustryServicesSeed`, `INDUSTRY_PROFILES`) hatten 0 v2-Konsumenten.
- **`website.generate` (Admin) ist jetzt asynchron**: legt Website + `generation_jobs`-Eintrag an, stößt `runWebsiteGenerationV2Job` fire-and-forget an, Rückgabe `{ websiteId, jobId, previewToken, slug }` sofort (vorher: synchroner v1-LLM-Aufruf im Request).
- **`onboarding.get` und `selfService.resolveLink` zusätzlich gelöscht** (nicht namentlich im Plan-Text, aber durch „auf genau 3/2 Prozeduren reduzieren" impliziert): 0 Aufrufer im gesamten Repo.
- **`server/_core/email.ts`: `emailTemplates` + `sendLeadEmail` gelöscht** (Zusatzfund Task 5): nur intern gegenseitig referenziert, 0 externe Aufrufer nach der `selfService.sendLeadEmail`-Löschung in Task 3.
- **`runWebsiteGeneration`-Wrapper komplett entfernt statt nur der v1-Rumpf**: einziger verbleibender Aufrufer (`outreach.queueBusinesses`) wurde auf den direkten `runWebsiteGenerationV2Job`-Aufruf umgestellt (analog `website.generate`), danach 0 Referenzen auf den Wrapper selbst.

## Prozess-Vorfall

Während Task 2 lief eine **parallele Read-Only-Reviewer-Session**, die einen
eigenen Fix-Commit (`b13302e`, `chatWelcomeMessage`-Durchreichung) ohne engen
Pathspec erstellte. Da zu dem Zeitpunkt bereits `git rm` für mehrere
Task-2-Client-Dateien im Index stand (aber noch nicht committet), nahm dieser
fremde Commit die bereits gestageten Löschungen mit — inhaltlich korrekt
(`ComponentShowcase.tsx`, `CustomerProfilePage.tsx`, `OnboardingWizard.tsx`,
`TemplatesPage.tsx`, vier `layouts/*.tsx`, `ChatWidget.tsx`/`BookingWidget.tsx`,
`shared/hours.ts`), aber unter einer irreführenden Commit-Message. Keine
History-Umschreibung vorgenommen (das wäre destruktiv gegenüber korrekt
abgeschlossener Arbeit); die betroffenen Löschungen wurden inhaltlich als
„für Task 2 erledigt" behandelt und nicht erneut committet. Lehre (im Ledger
vermerkt): **immer** expliziten Pathspec verwenden, auch bei kleinen
Parallel-Fixes.

Zusätzlich traten wiederholt **fremde Prettier-Reformatierungen** in
Dateien auf, die von keiner der Task-Sessions editiert wurden
(`shared/industryImages.ts`, `client/src/components/DashboardLayout.tsx`,
`server/outreachPipeline.ts`, `shared/layoutConfig.ts`) — jeweils reine
Whitespace-Diffs ohne Inhaltsänderung, vermutlich Nebenwirkung parallel
laufender Review-Sessions mit demselben `PostToolUse`-Hook. Wurden gemäß
Constraint nicht in die Feature-Commits gemischt, sondern in separaten
`chore: Prettier`-Commits (`1b0cfcf`, `9f00c3b`, `5cf3eee`, `f74f700`) isoliert.

## Verbliebene v1-Reste (mit Begründung)

- **`colorScheme`-Spalte + Migration**: load-bearing für `LegalPage.tsx` (s. o.) — Entfernung erst nach Umstellung der LegalPage-Akzentfarbe auf die v2-Pack-Palette (B4c).
- **`layoutStyle`/`layoutVersion`-Spalten**: werden aktiv von `server/onboardingV2/devSeed.ts` (Dev/Test-Seed-Route, gated außerhalb Produktion) geschrieben; `layoutStyle` zusätzlich von `server/onboardingV2/router.ts` als "Kompatibilitäts-Spiegel für Admin-Listen" bei jeder Pack-Auswahl (`extra: { layoutStyle: packId }`) — kein v1-Restcode, sondern bewusste v2-Nutzung derselben Spaltennamen.
- **DB-Spalten allgemein**: laut Plan-Vorgabe nicht gedroppt (B4c) — Code liest/schreibt die v1-only-Spalten aber (bis auf die beiden oben genannten Ausnahmen) nicht mehr.
- **Kommentare**: vereinzelte historische Prosakommentare, die `OnboardingChat`/`PremiumLayoutsV2` erwähnen (`SkeletonOverlay.tsx`, `LegacyWebsiteRedirect.tsx`, `PackShowcase.tsx:118`, `contactSubmit.ts:93`, `routers.ts:3266` bei `resolveSeedByPreviewToken`) — keine Imports/Aufrufe, bewusst als Kontext stehen gelassen bzw. bereits in Task 3/5 auf den korrekten (gelöscht-)Stand korrigiert.
- **`resolveSeedByPreviewToken`** (`server/routers.ts`, `lifecycle`-Router): 0 Client-Aufrufer mehr seit `OnboardingChat.tsx` weg ist, Kommentar korrigiert, Prozedur selbst aber nicht gelöscht (außerhalb des B4b-Scopes, kein Löschauftrag).

## B4c-Liste: DB-Spalten/-Tabellen — Referenzstand

Grep-Basis: `grep -rn "<Spalte>" server client shared --include=*.ts --include=*.tsx | grep -v drizzle/schema.ts`, Stand `f74f700`. Spalten aus `generatedWebsites` (`drizzle/schema.ts`):

| Spalte | Referenziert? | Wo | B4c-Einschätzung |
|---|---|---|---|
| `layoutStyle` | **Ja** | `server/onboardingV2/router.ts:110` (aktiver Schreibpfad, Admin-Kompatibilitätsspiegel), `server/onboardingV2/devSeed.ts` (Dev-Seed) | Nicht droppbar ohne Klärung, ob der Admin-Spiegel noch gebraucht wird |
| `layoutVersion` | **Ja** | `server/onboardingV2/devSeed.ts`/`.test.ts` (Dev-Seed) | Nicht droppbar ohne Umstellung des Dev-Seed-Skripts |
| `colorScheme` | **Ja** | `server/routers.ts` (`getMyWebsites`-Auto-Migration), `server/db.ts:841-842` (optionaler Schreibpfad), `client/src/pages/LegalPage.tsx:66-67` (liest Akzentfarbe) | **Load-bearing**, nicht droppbar vor LegalPage-Umstellung auf Pack-Palette (s. o.) |
| `heroImageUrl` | Ja, aber ungeklärt | `server/legalGenerator.ts:262` — schreibt `patched.heroImageUrl` auf einen **JSON-Klon von `websiteData`** (In-Memory-Objekt), nicht erkennbar auf die DB-Spalte selbst; keine direkte Spalten-Referenz gefunden | Wahrscheinlich droppbar, aber `legalGenerator.ts`-Zweck vorher klären (vestigiales v1-Feld im Dokument-Objekt?) |
| `aboutImageUrl` | **Nein** | — (0 Treffer außerhalb `drizzle/schema.ts`) | Droppbar |
| `addOnTeamData` | **Nein** | — (0 Treffer, kein `saveTeamMembers` mehr im Code) | Laut Behalten-Liste dennoch **nicht** droppen — Team-Panel im Studio ist „deferred" (Spec §2.8), Spalte wird erst gebraucht, wenn das v2-Team-Panel gebaut wird |
| `contactFormFields` | Nein (nur Kommentar) | `server/routers.ts:2455` (erklärender Kommentar, kein Lese-/Schreibzugriff) | Laut Behalten-Liste **nicht** droppen — für die v2-Insel als formatunabhängige Feldkonfiguration vorgesehen, auch wenn aktuell ungenutzt |

**`template_uploads`**: komplett unreferenziert (Task 5 verifiziert, Router + Helper + `templateSelector.ts` gelöscht) — **droppbar**.

**`onboarding_responses`-Spalten**: laut Behalten-Liste (Plan-Konstante, Delta-Dokument §4) **nicht** droppen — alle in B4a/B4b unverändert, keine erneute Prüfung in diesem Task nötig; die v1-only-Inhaltsspalten (`businessCategory`, `businessName`, `tagline`, `faqItems`, `brandColor` u. a., vollständige Liste in `.superpowers/b4-inventar.md` §7.2) bleiben ungenutzt liegen, bis eine eigene B4c-Migration entscheidet.

**`generation_jobs`, `layout_counters`**: laut Behalten-Liste aktiv von v2 genutzt (`runWebsiteGenerationV2Job` bzw. `getNextLayoutForIndustry`/`selectPack.ts`) — nicht anfassen.

## B4c-Liste: weitere offene Punkte

- LegalPage-Akzentfarbe aus der v2-Pack-Palette statt `colorScheme`-Spalte ableiten (Voraussetzung für den `colorScheme`-Drop).
- `SSR_ALLOWED_PATHNAMES` (`server/ssr/routes.ts:43`) auf vollständige Unterseiten-Abdeckung prüfen.
- Landing-Perf: `/demo/:pack`-Showcase lädt 14 Packs als iframes.
- Demo-Rechtsseiten (`/demo/:pack/impressum|datenschutz`) fallen auf SPA/404 durch.
- a11y-/Perf-Pass, `prefersMenu`, Team-Panel, Unterseiten-Add-on (Spec §2.8, aufgeschoben).
- `server/contrast.test.ts`-Erwartungen an `getContrastColor()` korrigieren (kein Env-Fail, echte Wertabweichung).

## Nachtrag Final-Review (f829bf1)

Fixwelle nach dem Gesamt-Review: tote Dateien `client/src/components/AIChatBox.tsx`, `client/src/components/SkeletonOverlay.tsx`, `client/src/lib/designTokens.ts`, `client/src/lib/layoutUtils.ts`, `server/_core/imageGeneration.ts` gelöscht; tote Importe (`ENV`, `invokeLLM`, `getOutreachEmailByWebsiteId`) aus `server/routers.ts`; veraltete Kommentare (`VariantPreviewPage`, `PremiumLayoutsV2`) korrigiert.

Zusätzliche B4c-Punkte aus dem Gesamt-Review:
- `onboarding.regenerateLegalPages` ist `publicProcedure` mit Schreibzugriff auf beliebige `websiteId` und liefert kein `regenerated`-Feld → `LegalPage` zeigt immer den „unvollständig“-Hinweis (tsc-Altfehler `LegalPage.tsx:27/31`). Auth-Gate prüfen, `regenerated: true` zurückgeben oder Client anpassen.
- `website.get` per Slug migriert `colorScheme` nicht (nur `customer.getMyWebsites`) → `LegalPage` im CSR-Fallback für v2-Sites immer Fallback-Blau; entfällt mit der Umstellung auf die Pack-Palette.
- Vorbestehend tote Dateien (nicht durch B4b): `GoogleRatingBadge.tsx`, `IndustryIcon.tsx` + `shared/industryIcons.ts`, `ManusDialog.tsx`, `Map.tsx`, `hooks/useAnimations.ts`, `lib/industryStats.ts`, `server/_core/dataApi.ts`, `server/_core/voiceTranscription.ts`; tote Exporte `server/legalGenerator.ts patchWebsiteData`, `lifecycle.resolveSeedByPreviewToken`; ungenutzte Importe `countBusinesses` (routers.ts), `like`/Typen in db.ts. Einmalig `npx knip` erwägen.
- `onboarding_responses`-v1-Inhaltsspalten werden nur noch konditional in `db.createOnboarding` gespreadet → Spread entfernen, dann droppen; `businessName`/`businessCategory` behalten.
