# B4 — Delta-Inventar (Grundlage für Plan B4b)

**Stand:** 4819b28 (Branch `onboarding-v2` = `main`) · Inventar-Baseline: 719f508 · **read-only, nichts editiert außer dieser Datei**
**Methode:** jeder Eintrag gegen aktuellen Code geprüft via `grep -rn` über `client/ server/ shared/ tests/ scripts/` (0 Treffer außerhalb der Zieldatei = unreferenziert) plus Datei-Existenz- und Zeilen-Checks.
**B4a ist bereits gelaufen** (14 Commits zwischen den beiden Ständen, netto **+7.298 / −10.957 LOC** über 65 Dateien) und hat einen erheblichen Teil des Inventars vorweggenommen — dieses Delta trennt „schon erledigt" von „noch zu tun" für B4b.

Legende: ✅ erledigt · ⏳ noch offen (wie im Original-Inventar) · 🆕 abweichend vom Original gelöst (neuer Mechanismus) · ⚠️ Restrisiko

---

## 1. Was B4a bereits erledigt hat (nicht mehr in B4b nötig)

| # | Item | Beweis |
|---|---|---|
| 1 | `PB_LAYOUT_V2`-Flag aus Code entfernt | `grep PB_LAYOUT_V2 client/ server/ shared/` → 0 Treffer (nur noch in `docs/`) |
| 2 | `runWebsiteGeneration()` ruft nur noch `runWebsiteGenerationV2Job` | `routers.ts:1660-1666`, Guard-Konstante `V1_BODY_DISABLED = true` |
| 3 | `/onboarding/:token` in `SPA_ROUTES` ergänzt (R5) | `server/_core/static.ts:85` |
| 4 | `LegalPage.tsx` liest v1 **und** v2 (R2) | `client/src/lib/legalHtml.ts` (`pickLegalHtml`, mit Tests) |
| 5 | `customer.updateWebsiteContent`, `uploadLogoForWebsite`, `getImageSuggestions`, `saveTeamMembers`, `updateServices`, `updateDesign`, `updateLegalData`, `uploadGalleryImage`, `changeLayout`, `applyAiEdit`, `confirmAiEdit`, `getChatSettings`, `updateChatSettings` **komplett aus `routers.ts` gelöscht** (R4 + großer Teil §4.6) | `customer:`-Router jetzt `routers.ts:5353-6149`, keine dieser Namen mehr enthalten |
| 6 | `website.regenerate` auf v2-Pfad umgeschrieben (nicht nur geguardet) | `routers.ts:3423-3489` — `selectPack`, `resolveV2Images`, `generateSiteContent`, `assertV2SafeWrite`; nur noch für `status === "preview"` erlaubt |
| 7 | `pipelineGenerationBridge.ts` ruft direkt `runWebsiteGenerationV2Job` (R7, teilweise) | Datei komplett neu, 17 LOC |
| 8 | `StartPage.tsx` navigiert direkt zu `/onboarding/:token` (R3, Haupt-Funnel) | `StartPage.tsx:165,208` |
| 9 | Magic-Link-Redirect nutzt `/onboarding/:token` (R3) | `routers.ts:3771` |
| 10 | `selfService.sendLeadEmail`-Preview-Link auf `/onboarding/:token` | `routers.ts:6716` |
| 11 | `lifecycleScheduler.ts` baut Studio-Link über echten Token (R3, `:151/:475`-Bug behoben) | `lifecycleScheduler.ts:85-90` (`buildStudioLink`) |
| 12 | `App.tsx`: `/preview/:token/onboarding` → Client-`Redirect`; `/websites/:id/onboarding` → `LegacyWebsiteRedirect` (Server löst Token auf) | `App.tsx:211-217` |
| 13 | 🆕 `/preview/:token` **serverseitig 302 direkt auf `/onboarding/:token`** (nicht `/preview-ssr/:token` wie im Original geplant) → `PreviewPage.tsx` dadurch **komplett unerreichbar/tot**, nicht nur REW-bedürftig | `server/ssr/routes.ts:388-390`; `client/src/App.tsx` importiert `PreviewPage` **nicht mehr** |
| 14 | `LandingPage.tsx`-Showcase auf 14 Style Packs umgebaut (R6) — `/demo/:pack`-SSR-Route in iframes, alle v1-Layout-Importe entfernt | `LandingPage.tsx:456-630`, `server/ssr/routes.ts` (`handleDemoRoute`); `PREDEFINED_COLOR_SCHEMES`/`LAYOUT_CONFIG`/`LAYOUT_COMPONENTS` nicht mehr in der Datei |
| 15 | `CustomerDashboard.tsx` **8.038 → 1.617 LOC**, in Sub-Komponenten zerlegt | `client/src/pages/dashboard/*.tsx` (neu: `AddonsTab`, `ChatLeadsTab`, `AppointmentsTab`, `PreviewTab`, `StudioCard`, `AiChatAddonSection`, `BookingAddonSection`) |
| 16 | Dashboard-Leichen gelöscht: `ContentEditorSplitView.tsx` (Datei weg), `AiContentEditor`, `DesignEditor`, `LayoutSwitcherCard`, `ContentFieldsAccordion`, `StructureEditor`, `DesignStudio`, `LogoUploadCard`, `ServicesEditor`, `LegalEditor`, `TeamAddonSection`, `ContactFormEditor` (v1-Kontaktkarte, Ruling Cutover-Spec §2.2) | 0 Treffer in `CustomerDashboard.tsx` + Repo-weite Suche |
| 17 | Dashboard-Tabs jetzt: `preview, settings, addons, domain, submissions, leads, appointments, analytics` — `content`/`structure`/`design` weg | `CustomerDashboard.tsx:390-423` |
| 18 | Vorschau-Tab = iframe auf `/preview-ssr/:token` (genau der im Inventar §5.6 vorgeschlagene Weg) | `client/src/pages/dashboard/PreviewTab.tsx` |
| 19 | `@shared/layoutConfig`-Import + `LAYOUT_*_DASH`-Konstanten aus Dashboard entfernt | `FONT_OPTIONS`/`DEFAULT_LAYOUT_COLOR_SCHEMES` nicht mehr in `CustomerDashboard.tsx` referenziert |
| 20 | Studio: Panel-Deep-Links + „Live-Modus" für verkaufte Websites + CheckoutBar-Guard (§5.5 UX-Wart) | `StudioPage.tsx:72-75,224-227` (`state.status !== "preview"`) |
| 21 | „Im Studio bearbeiten"-Link (`StudioCard`) im Dashboard verdrahtet | `client/src/pages/dashboard/StudioCard.tsx` (+ Test) |
| 22 | Alte v1-Preview-Websites werden beim Studio-Öffnen neu (v2) generiert | Spec-Ziel §1 „ensureGeneration bei legacy" — Mechanik nicht im Detail nachverifiziert, aber `StudioPage`/`state.ts` sprechen von `legacy` |
| 23 | Neue Visual-/E2E-Tests für die neuen Flows ergänzt | `tests/visual/landing.spec.ts` (+95), `tests/visual/startpage-to-studio.spec.ts` (+77), neue Baseline `pack-showcase-*.png` |

---

## 2. Was **noch vollständig offen** ist (1:1 wie im Original-Inventar, verifiziert)

### 2.1 Client — v1-only Module (unverändert vorhanden, unverändert referenziert)

| Datei | LOC | Referenziert von | Verdikt |
|---|---|---|---|
| `client/src/components/layouts/PremiumLayoutsV2.tsx` | 4.891 | **nur noch** `WebsiteRenderer.tsx:23`, `LayoutPreviewStandalone.tsx:15` (LandingPage-Import weg, s.o.) | DEL, Cluster kleiner geworden |
| `PremiumLayout.tsx`, `FreshLayout.tsx`, `CraftLayout.tsx`, `TrustLayout.tsx` | 461 | 0 Treffer | DEAD → DEL, sofort möglich |
| `client/src/pages/OnboardingChat.tsx` | 10.130 | **0 Importe mehr** (nur Kommentare in `MacbookMockup.tsx`, `PreviewPage.tsx`(tot), `LegacyWebsiteRedirect.tsx`, `routers.ts`, Tests) — **komplett dead code, nicht mehr geroutet** | DEL, jetzt risikofrei (war vorher noch über `/preview/:token/onboarding` erreichbar) |
| `client/src/components/MacbookMockup.tsx` | 252 | nur `OnboardingChat.tsx` | DEL mit Chat-Cluster |
| `client/src/pages/LayoutPreviewStandalone.tsx` | 227 | Route `App.tsx:234` (`/layout-preview/:key`), SPA-Allowlist `static.ts:82` | DEL, Ersatz `/dev/site-preview` existiert |
| `client/src/pages/LayoutOverviewPage.tsx` | 330 | Route `App.tsx:120` (`/admin/layouts`), Nav vermutlich weiterhin verlinkt | DEL |
| `client/src/pages/VariantPreviewPage.tsx` | 113 | Route `App.tsx:237` (`/variant-preview`); nutzt weiterhin `DEFAULT_LAYOUT_COLOR_SCHEMES`, `trpc.onboarding.getPhotoSuggestions` | REW/DEL wie im Original |
| `client/src/pages/PreviewPage.tsx` | 304 | **0 Referenzen mehr** — nicht in `App.tsx` importiert, Route serverseitig weg-redirected | 🆕 **jetzt DEAD → DEL statt REW** (einfacher als geplant) |
| `client/src/pages/SitePage.tsx` | 203 | Route `App.tsx:202` + Subdomain-Router | **unverändert v1-verdrahtet** (`layoutStyle`/`layoutVersion` an `WebsiteRenderer`, alte Widgets `AgeGate/CookieBanner/ChatWidget/BookingWidget`) — **R1 weiterhin offen** |
| `client/src/pages/OnboardingWizard.tsx` | 588 | nur `App.tsx:30` lazy-importiert, keine Route | DEAD → DEL, unverändert |
| `client/src/pages/ComponentShowcase.tsx` | 1.437 | 0 Treffer | DEAD → DEL |
| `client/src/pages/CustomerProfilePage.tsx` | 382 | 0 Treffer | DEAD → DEL |
| `client/src/pages/TemplatesPage.tsx` | 871 | nur Selbstreferenz (nicht geroutet) | DEAD → DEL |
| `client/src/components/WebsiteRenderer.tsx` | 188 | **unverändert**: v2-Zweig `:125-134` (`parseV2`→`SiteRenderer`), v1-Zweig `:135-187` | REW → ~20 LOC, unverändert offen |
| `client/src/components/StockPhotoSearch.tsx` | 159 | `PhotosPanel` (v2) + `OnboardingChat` (tot) + `CustomerDashboard`? (Import in Dashboard nicht mehr gefunden — prüfen ob nur noch v2 nutzt) | **KEEP (Spec)** |
| `ChatWidget/BookingWidget/CookieBanner/AgeGate` | 354+430+194+206 | weiterhin in `SitePage.tsx` (aktive Route!) | KEEP solange R1 offen |

### 2.2 Routen (`App.tsx`, 304 LOC)

Unverändert offen: `/layout-preview/:key` → `LayoutPreviewStandalone`, `/variant-preview` → `VariantPreviewPage`, `/admin/layouts` → `LayoutOverviewPage`. `PreviewPage`-Route existiert gar nicht mehr (s. 2.1) — im Original als „REW" geplant, jetzt gegenstandslos. `static.ts` `SPA_ROUTES` enthält weiterhin tote Einträge `variant-preview`, `layout-preview`, `websites/:id/onboarding`, `preview/:token/onboarding` (harmlos, aber Aufräum-Kandidat).

### 2.3 Shared-Konfiguration — **komplett unverändert**

`shared/layoutConfig.ts` (675 LOC) und `shared/types.ts` (139 LOC) sind **byte-für-byte in derselben Verdikt-Lage wie im Original**: alle DEL-Exporte noch da, dieselben 0-Referenz-Befunde für `LayoutFontConfig`, `LAYOUT_FONTS_DEFAULT`, `SANS_ONLY_INDUSTRIES`, `LAYOUT_FALLBACK_IMAGES`. **Neu bestätigt tot:** `AVAILABLE_ADDONS`/`Addon` (0 externe Referenzen mehr — `shared/pricing.ts` hat vollständig übernommen). `WebsiteSection`/`DesignTokens` (0 externe Referenzen, nur noch in `WebsiteData` selbst verschachtelt). `WebsiteData` wird noch von 8 Dateien gebraucht (`WebsiteRenderer`, 4× `layouts/*`, `SitePage`, `PreviewPage`(tot), `OnboardingChat`).

`server/industryImages.ts`: `VARIANT_FAMILY_RANKINGS`, `getLayoutPool`, `getLayoutStyle`, `getIndustryColorScheme` weiterhin von `routers.ts` **und** `outreachPipeline.ts` gebraucht. `getLayoutVariants` weiterhin 0 Referenzen (DEAD). **KEEP-Liste bestätigt:** `getIndustryImages`/`getHeroImageUrl`/`getGalleryImages`/`getContrastColor`, `getNextLayoutForIndustry`+`layout_counters`, `withOnColors`.

### 2.4 `server/routers.ts` — **größtenteils unverändert offen**

8.801 → **7.588 LOC** (−1.213, ausschließlich durch §4.6-Löschung, s. Abschnitt 1). Alles andere aus dem Original-Inventar ist **1:1 noch vorhanden, an nahezu identischen Zeilen**:

| Block | Zeilen jetzt | Status |
|---|---|---|
| `DESIGN_ARCHETYPES` | 274–?? (2 Treffer gesamt) | unverändert, DEL offen |
| `buildIndustryContext`/`buildPersonalityHint`/`buildEnhancedPrompt` | 661/848/884 | unverändert offen |
| `mapCategoryToIndustryKey` (tot) | 1011 | unverändert offen, sofort löschbar |
| `buildProcessSection` | 1100 | unverändert offen |
| `buildVerifiedStats` (tot) | 1536 | unverändert offen, sofort löschbar |
| `getFallbackWebsiteData` | 1589 | unverändert offen |
| `runWebsiteGeneration` v1-Rumpf | **1668–2074** (~406 LOC) | 🆕 **jetzt per `V1_BODY_DISABLED`-Guard tot/unreachable**, aber Code steht noch da — reine Löschung ohne Risiko |
| `website.generate` | 3051–3423 (~372 LOC) | **unverändert v1**, Client-Aufrufer prüfen (`WebsitesPage.tsx:88`) |
| `templates`-Router | 4053–4280 | unverändert, TemplatesPage weiterhin unrouted |
| `onboarding.generateText/suggestServices/findEmail/logStep/saveStep/complete/uploadLogo/uploadPhoto/getGmbPhotos` | 4368–5353 | **alle unverändert vorhanden** — **aber jetzt garantiert dead code**, da `OnboardingChat.tsx` nicht mehr geroutet ist (s. 2.1) |
| `selfService.generateWebsiteAsync/updateCaptureStatus/saveCustomerEmail/sendLeadEmail/testEmail/generateInitialContent/selectWebsiteTemplate` (v1-Zweig) | 6149–7112 | unverändert vorhanden, gleicher dead-code-Effekt |
| `outreach.queueBusinesses` v1-Vorberechnung | ~3852–3866 | unverändert, dupliziert mit `outreachPipeline.ts:425-428` — Bridge selbst ist schon v2, dies ist nur noch **totes Vorrechnen** |
| `invokeLLM`-Aufrufstellen v1 (`routers.ts:1781/3150/4368/4640/4677/8164`) | | alle noch da |

**Wichtige neue Erkenntnis:** Weil `OnboardingChat.tsx` nicht mehr geroutet ist, sind **alle** `onboarding.*`- und `selfService.*`-v1-Prozeduren, die im Original nur „nur von OnboardingChat genutzt" waren, jetzt **serverseitig unreachable von echten Nutzern aus** (nur noch via direktem API-Call erreichbar). Das senkt das Lösch-Risiko für Phase 3 auf praktisch null — sie sind aber noch nicht gelöscht.

### 2.5 Dashboard-Restarbeit

`customer.updateAddons` ist die **einzige** verbliebene `customer.*`-Prozedur aus dem alten §4.6-Cluster (noch nicht auf `applyPatch` umgestellt, aber nicht mehr Teil des Guard-Lücken-Risikos). `AddonsTab.tsx` (399 LOC) + `AiChatAddonSection.tsx`/`BookingAddonSection.tsx` sind neu und ersetzen die alten Addon-Editoren — Galerie-/Menü-/Preisliste-Redaktion in `AddonsTab.tsx` noch nicht geprüft, ob sie noch `websiteData.sections[...]` (v1) schreibt — **zu verifizieren in B4b**.

### 2.6 Templates-Cluster, DB-Spalten, Tests, Env — **alle unverändert**

- `server/templateSelector.ts`, beide `templates.json`, Build-Copy `package.json:9`, `template_uploads`-Helper: **exakt wie im Original**, nichts angefasst.
- `drizzle/schema.ts`: **kein Diff** zwischen 719f508 und 4819b28 — §7 (DB-Spalten) ist 1:1 identisch zum Original-Inventar, B4c weiterhin komplett offen.
- Alle 11 Tests aus §8.1 (`routers.v2Guards.test.ts` 305→**431 LOC** gewachsen, `onboardingCompleteV2.test.ts`, `saveStep.color.test.ts`, `photo.color.test.ts`, `photo.colorpicker.test.ts`, `secondary.color.test.ts`, `industry.mapping.test.ts`, `pageblitz.test.ts`, `contrast.test.ts`) **existieren weiterhin unverändert**. Ausnahme: `customer.dashboard.test.ts` (139 LOC) referenziert die gelöschten Prozeduren (`changeLayout` etc.) **nicht mehr** → wurde bereits an den B4a-Umbau angepasst, zählt für B4b nicht mehr als Risiko.
- `PB_LAYOUT_V2` aus Code weg (s. Abschnitt 1); Doku (`docs/superpowers/specs/2026-08-21-flag-aktivierung.md` etc.) noch nicht als „obsolet" markiert.
- `SSR_SITES` unverändert KEEP (Notbremse).

---

## 3. Risiken — aktualisierter Status

| # | Risiko | Status |
|---|---|---|
| R1 | SitePage-CSR-Fallback v1-verdrahtet | ⏳ **weiterhin offen, unverändert** — höchste Priorität für B4b, da SitePage die einzige Route ist, die noch aktiv alte Widgets + `layoutStyle` nutzt |
| R2 | Rechtsseiten v1-Top-Level | ✅ gelöst (`pickLegalHtml`) |
| R3 | E-Mail-/Redirect-Links auf gelöschten Chat | ✅ weitgehend gelöst (StartPage, Magic-Link, lifecycleScheduler, sendLeadEmail); ⚠️ `outreach.queueBusinesses` (Bestand-Website-Zweig, `routers.ts:~3837`) baut noch `https://pageblitz.de/preview/${token}` statt direkt `/onboarding/${token}` — funktioniert nur wegen des 302-Redirects, unnötiger Hop |
| R4 | `customer.updateWebsiteContent` korrumpiert v2-Dokumente | ✅ gelöst (Prozedur komplett entfernt, nicht nur geguardet) |
| R5 | Studio-Route 404 in Prod | ✅ gelöst |
| R6 | LandingPage blockiert `layouts/`-Löschung | ✅ gelöst (Showcase auf `/demo/:pack` umgebaut) |
| R7 | Outreach-Pipeline erzeugt v1-Websites | 🆕 **Bridge gelöst** (`pipelineGenerationBridge.ts` → v2), aber `outreachPipeline.ts:425-428` und `routers.ts:queueBusinesses` rechnen weiterhin ungenutzt v1-`colorScheme`/`layoutPool`/`heroImageUrl` vor — funktional harmlos, aber totes Gewicht, gehört in B4b bereinigt |
| R8 | Funnel-Telemetrie (`onboarding.logStep`) | ⏳ unverändert offen |
| R9 | `/preview/:token` mit veralteter Preisliste | ✅ **entfällt** — Route/Komponente jetzt tot (s. 2.1) |
| R10 | Umami/Analytics CSR vs. SSR | ⏳ nicht geprüft, unverändert offen |
| R11 | SEO/Sitemap | kein Risiko (bestätigt) |
| R12 | `getIndustryProfile` | ⏳ unverändert offen, weiterhin von `routers.ts` (2×) + Test genutzt |

---

## 4. Behalten-Liste (bestätigt, unverändert gegenüber Spec)

`layout_counters`-Tabelle + `getNextLayoutForIndustry` (`server/db.ts:781`, von `server/generationV2/selectPack.ts` mitbenutzt) · `StockPhotoSearch.tsx` (von v2 `PhotosPanel` genutzt) · `getIndustryImages`/`getHeroImageUrl`/`getGalleryImages`/`getContrastColor` (`server/industryImages.ts`) · alle `onboarding_responses`-Spalten (keine Migration in B4a) · `withOnColors` (`shared/layoutConfig.ts`) · `SSR_SITES`-Flag · `PB_LLM_MOCK` · `generation_jobs`-Tabelle · alle unabhängigen `customer.*`-Prozeduren (Domain, Leads, Termine, Analytics, Submissions, Billing, `updateAddons`).

---

## 5. Korrigierte Löschreihenfolge §11' für Plan B4b

Phase 0 (Vorarbeiten) und der Kern von Phase 1 (Routen-Umschaltung) sowie ein großer Teil von Phase 4 (Dashboard) aus dem Original-§11 sind **bereits erledigt**. B4b beginnt effektiv bei Phase 2. Jeder Schritt einzeln mit `tsc --noEmit` + `npx vitest run` (+ betroffene Playwright-Specs) testbar.

**Schritt 1 — Rest-Vorarbeit (klein, vor allem Löschen)**
- `SitePage.tsx` auf `SiteRenderer`+Inseln umstellen oder `SSR_SITES` verpflichtend machen (R1, weiterhin höchstes Risiko).
- `outreachPipeline.ts:425-428` + `routers.ts:queueBusinesses`-Vorberechnung auf reines v2-Triggern reduzieren (R7-Rest).
- `outreach.queueBusinesses`-Bestand-Zweig auf `/onboarding/${token}` direkt umstellen (R3-Rest).
- ~10 LOC

**Schritt 2 — Totes Zeug, risikofrei (sofort möglich)**
`ComponentShowcase.tsx` (1.437), `CustomerProfilePage.tsx` (382), `OnboardingWizard.tsx` (588) + Import `App.tsx:30`, `TemplatesPage.tsx` (871), `PreviewPage.tsx` (304, jetzt trivial da unreferenziert), `layouts/PremiumLayout.tsx`+`FreshLayout.tsx`+`CraftLayout.tsx`+`TrustLayout.tsx` (461), `routers.ts`: `mapCategoryToIndustryKey` (89), `buildVerifiedStats` (53), `onboarding.findEmail` (94), `onboarding.uploadPhoto` (36), `selfService.testEmail` (40), `runWebsiteGeneration`-v1-Rumpf (406, bereits unreachable), `LAYOUT_FALLBACK_IMAGES`, `AVAILABLE_ADDONS`/`Addon`, `SANS_ONLY_INDUSTRIES`, `LayoutFontConfig`/`LAYOUT_FONTS_DEFAULT`.
**≈ 4.760 LOC**

**Schritt 3 — Chat-Cluster (jetzt risikofrei, da unrouted)**
`OnboardingChat.tsx` (10.130) + `MacbookMockup.tsx` (252); `routers.ts`: `onboarding.generateText/suggestServices/logStep/saveStep/uploadLogo/getGmbPhotos/complete` (v1-Teile), `selfService.generateWebsiteAsync/updateCaptureStatus/saveCustomerEmail/sendLeadEmail/generateInitialContent`, v1-Zweig `selectWebsiteTemplate`; `VariantPreviewPage.tsx` reduzieren (verliert `getPhotoSuggestions`-Aufrufer außer sich selbst).
**≈ 10.700 LOC**

**Schritt 4 — Renderer & Alt-Mappings**
`WebsiteRenderer.tsx` v1-Zweig raus → `parseV2` Pflicht; `layouts/PremiumLayoutsV2.tsx` (4.891) + `LayoutPreviewStandalone.tsx` (227) + `LayoutOverviewPage.tsx` (330) + Routen/Nav; `shared/layoutConfig.ts` auf `withOnColors` eindampfen; `server/industryImages.ts`: `VARIANT_FAMILY_RANKINGS`, `getLayoutPool`, `getLayoutStyle`, `getLayoutVariants`, `getIndustryColorScheme` raus; `routers.ts`: `DESIGN_ARCHETYPES`, `buildIndustryContext`, `buildPersonalityHint`, `buildEnhancedPrompt`, `buildProcessSection`, `getFallbackWebsiteData`, `website.generate`; `shared/types.ts`: `WebsiteData`/`WebsiteSection`/`DesignTokens` raus (nach Schritt 1+4 keine Konsumenten mehr außer `SitePage`, das dann auf `WebsiteDataV2` umgestellt sein muss).
**≈ 6.400 LOC**

**Schritt 5 — Templates & Aufräumen**
`templates`-Router (225), `server/templateSelector.ts` (264), beide `templates.json`, Build-Copy `package.json:9`, `template_uploads`-DB-Helper; Dashboard-Rest prüfen (`customer.updateAddons` → `applyPatch`, Galerie/Menü/Preisliste-Schreibpfad in `AddonsTab.tsx` verifizieren); §8.1-Tests löschen/umschreiben (`v2Guards`, `onboardingCompleteV2`, `saveStep.color`, `photo.color`, `photo.colorpicker`, `secondary.color`, `industry.mapping` [nur falls `getIndustryProfile` fällt], `pageblitz.test.ts` prüfen, `contrast.test.ts` prüfen); `PB_LAYOUT_V2` aus Doku als obsolet markieren.
**≈ 1.400 LOC**

**Optional / B4c (unverändert aufgeschoben):** DB-`DROP COLUMN`/`DROP TABLE`, a11y-/Perf-Pass, `prefersMenu`, Team-Panel, Unterseiten-Add-on.

---

## 6. LOC-Schätzung B4b (Rest nach B4a)

| Schritt | LOC gelöscht |
|---|---|
| 1 (Rest-Vorarbeit, kein Löschen) | ~0 |
| 2 (totes Zeug) | ≈ 4.760 |
| 3 (Chat-Cluster) | ≈ 10.700 |
| 4 (Renderer/Alt-Mappings) | ≈ 6.400 |
| 5 (Templates/Aufräumen) | ≈ 1.400 |
| **Summe B4b** | **≈ 23.260 LOC** |

Zum Vergleich: Original-Inventar schätzte **≈ 31.850 LOC** Gesamtwegfall; B4a hat davon bereits **≈ 8.600 LOC** netto entfernt (Dashboard-Reduktion 6.421, `routers.ts` −1.213, `ContentEditorSplitView` 1.015, plus einige kleinere Aufräumarbeiten, abzüglich neuer v2-Hilfsdateien/Tests) — die B4b-Restschätzung (≈ 23.260) plus bereits Erledigtes ergibt größenordnungsmäßig wieder die Original-Summe.

---

## Zusammenfassung

- **Gesamt-LOC B4b:** ≈ 23.260 Zeilen (gegenüber ursprünglich geschätzten ≈ 31.850 für den kompletten Cutover — B4a hat bereits ≈ 8.600 Netto-LOC entfernt).
- **Schritte:** 5 (statt ursprünglich 6 Phasen/31 Einzelpunkten) — Phase 0/1 aus dem Original sind erledigt, Phase 4 (Dashboard) ist zu ~90 % erledigt.
- **Top-3-Risiken für B4b:**
  1. **R1 — `SitePage.tsx` (CSR-Fallback)** ist die einzige noch aktiv genutzte Route mit alten Widgets (`AgeGate`/`CookieBanner`/`ChatWidget`/`BookingWidget`) und `layoutStyle`-Übergabe; blockiert `WebsiteRenderer`-v1-Zweig-Löschung.
  2. **`website.generate`** (372 LOC, Admin-Neugenerierung) ist die letzte v1-Generierungs-Prozedur, die noch produktiv aufrufbar ist (`WebsitesPage.tsx`) — im Gegensatz zu `regenerate` noch nicht auf v2 umgestellt.
  3. **Templates-Cluster** (`templates`-Router, `templateSelector.ts`, `template_uploads`-Tabelle, Build-Copy-Schritt) ist komplett tote Fläche seit vor B4a und in B4a nicht angefasst worden — größter „risikoloser aber vergessener" Batch.
