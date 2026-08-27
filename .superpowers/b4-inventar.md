# B4 — Cutover- & Löschungs-Inventar (v1 → v2)

**Stand:** 2026-08-22 · Branch `onboarding-v2` (= `main` @ `719f508`) · **read-only Bestandsaufnahme, kein Code geändert**
**Spec-Grundlage:** `docs/superpowers/specs/2026-08-20-style-packs-design.md` §7 · `docs/superpowers/specs/2026-08-21-onboarding-v2-design.md` §7
**Randbedingung:** null zahlende Kunden → keine Datenmigration; v1-Preview-Sites in Prod dürfen regeneriert oder ignoriert werden.

> Legende: **DEL** = ersatzlos löschen · **REW** = umschreiben/auf v2 umstellen · **KEEP** = bleibt · **DEAD** = schon heute unerreichbar (Bonus-Löschung)

---

## 1. v1-only Client-Module

### 1.1 `client/src/components/layouts/**` — 5.352 LOC, **DEL komplett**

| Datei | LOC | Importeure |
|---|---|---|
| `client/src/components/layouts/PremiumLayoutsV2.tsx` | 4.891 | `WebsiteRenderer.tsx:23`, `LandingPage.tsx:36`, `LayoutPreviewStandalone.tsx:15` |
| `client/src/components/layouts/PremiumLayout.tsx` | 96 | **keiner** (DEAD) |
| `client/src/components/layouts/FreshLayout.tsx` | 108 | **keiner** (DEAD) |
| `client/src/components/layouts/CraftLayout.tsx` | 126 | **keiner** (DEAD) |
| `client/src/components/layouts/TrustLayout.tsx` | 131 | **keiner** (DEAD) |

`PremiumLayoutsV2.tsx` exportiert 18 Layout-Komponenten (`BoldLayoutV2` … `FluxLayoutV2`, Zeilen 1805–4844) plus zwei Alt-Mappings am Ende:
- `getLayoutKeyByIndustry` (`:4844`) — **nur innerhalb derselben Datei** verwendet → stirbt mit ihr.
- `LayoutEngine` (`:4872`) — **nur innerhalb derselben Datei** verwendet → stirbt mit ihr.

Alle Layout-Props sind `(props: any)` — der in Spec A §1 benannte „kein Vertrag"-Zustand.

### 1.2 Seiten

| Datei | LOC | Status | Begründung |
|---|---|---|---|
| `client/src/pages/OnboardingChat.tsx` | **10.130** | **DEL** | 26-Schritt-Chat. Enthält eine eigene Kopie von `VARIANT_FAMILY_RANKINGS` (ab `:66`). Nutzt `WebsiteRenderer`, `MacbookMockup`, `ChatWidget`, `HelpWidget`, `StockPhotoSearch`, 8 `layoutConfig`-Exporte, `@shared/industryImages`. Ersetzt durch `client/src/pages/onboarding-v2/*`. |
| `client/src/pages/LayoutPreviewStandalone.tsx` | 227 | **DEL** | Route `/layout-preview/:key`, rendert 18 v1-Layouts mit Mock-Daten. v2-Äquivalent existiert: SSR `/dev/site-preview?pack=<id>&fixture=full\|minimal` (`server/ssr/routes.ts:312`). |
| `client/src/pages/LayoutOverviewPage.tsx` | 330 | **DEL** | Admin-Katalog der „18 Premium-Layouts", hartcodierte Layout-Liste + `PREDEFINED_COLOR_SCHEMES`. Verlinkt aus `DashboardLayout.tsx:40`. |
| `client/src/pages/VariantPreviewPage.tsx` | 113 | **REW (schrumpft auf ~40 LOC)** | **Hat noch einen v1-Zweig:** `:14` `DEFAULT_LAYOUT_COLOR_SCHEMES`, `:60` `cs = DEFAULT_LAYOUT_COLOR_SCHEMES[layout]`, `:107` `layoutStyle={layout}`, `:95-97` heroImage/aboutImage aus `trpc.onboarding.getPhotoSuggestions` (v1-Prozedur). Der v2-Zweig (`:26-28` `packOverrideCandidate`, `:108`) ist bereits da. Nach Cutover: nur `packOverride` + `SiteRenderer`. Alternativ ganz entfernen, weil der v2-Style-Picker (`StylePanel.tsx`) eigene Mini-Previews hat — dann fällt auch Route `/variant-preview` weg. |
| `client/src/pages/PreviewPage.tsx` | 304 | **REW** | Route `/preview/:token` (Outreach-/Lead-Vorschau). Rendert `WebsiteRenderer` mit v1-Patchwerk: liest `trpc.onboarding.get` (v1-Antworten) und patcht `addOnContactForm`, `contactFormFields`, `addOnGallery`, `heroPhotoUrl`, `aboutPhotoUrl`, `headlineFont`, `headlineSize` in `websiteData` (`:67-152`, `:210-217`). Enthält den Add-on-Banner mit **hartcodierter, veralteter Preisliste** (`:24-51`, 49/99/79/29 €) und die CTA `window.location.href = "/preview/${token}/onboarding"` (`:232`) → muss auf `/onboarding/:token` zeigen. v2-Ersatz für den reinen Render: `/preview-ssr/:token` (SSR). |
| `client/src/pages/SitePage.tsx` | 203 | **KEEP (v1-Zweig entfernen)** | CSR-Fallback der echten Kundenseite, greift wenn `SSR_SITES=off` **oder** SSR nicht matched. `:124/:143` reichen `layoutStyle` an `WebsiteRenderer` durch (v1). Nutzt `AgeGate`, `CookieBanner`, `ChatWidget`, `BookingWidget` — also die **alten** Widgets, während SSR die **Inseln** (`site/islands/*`) benutzt: doppelte Implementierung, siehe Risiko R1. |
| `client/src/pages/LegalPage.tsx` | 187 | **REW** | SPA-Route `/site/:slug/impressum|datenschutz` + Subdomain-`/impressum`. Liest **`websiteData.impressumHtml` / `websiteData.datenschutzHtml` (top-level = v1)** (`:76-78`). v2 legt die Texte unter `websiteData.legal.impressumHtml` ab (`shared/siteContract/schema.ts:237`, SSR `server/ssr/renderSite.tsx:213-227`) → für v2-Dokumente rendert LegalPage heute **leer**, sobald SSR nicht greift. Zusätzlich `trpc.onboarding.regenerateLegalPages` (`:22`). |
| `client/src/pages/OnboardingWizard.tsx` | 588 | **DEAD → DEL** | In `App.tsx:31` lazy-importiert, aber **von keiner Route benutzt**. Nutzt `trpc.onboarding.saveStep/complete`. |
| `client/src/pages/ComponentShowcase.tsx` | 1.437 | **DEAD → DEL** | Nirgends importiert. |
| `client/src/pages/CustomerProfilePage.tsx` | 382 | **DEAD → DEL** | Nirgends importiert. |
| `client/src/pages/TemplatesPage.tsx` | 871 | **DEAD → DEL** | Nirgends importiert (keine Route in `App.tsx`), spricht aber `trpc.templates.list/upload/classify/update/approve/bulkApprove/delete` an → Backend-Prozeduren + Tabelle `template_uploads` sind damit tote Fläche. |

### 1.3 Komponenten

| Datei | LOC | Status | Begründung |
|---|---|---|---|
| `client/src/components/WebsiteRenderer.tsx` | 188 | **REW → ~20 LOC oder ganz weg** | `:125-134` v2-Zweig (`parseV2` → `SiteRenderer`); `:135-187` v1-Zweig (`getLayoutComponent`, `hiddenSections`-Filter, `designTokens`-Patch, `layoutVersion`). Nach Cutover: `parseV2` wird Pflicht (Spec B §7.2), Aufrufer rendern direkt `SiteRenderer`. |
| `client/src/components/ContentEditorSplitView.tsx` | **1.015** | **DEL** | Einziger Importeur: `CustomerDashboard.tsx`. 17× `WebsiteData` (v1-Typ), Feld-Whitelist mit `"layoutStyle"` (`:62`), `layoutStyle`-Prop an `WebsiteRenderer` (`:995`). Ersetzt durch Studio-Panels. |
| `client/src/components/MacbookMockup.tsx` | 252 | **DEL** | Einziger Importeur: `OnboardingChat.tsx`. |
| `client/src/components/StockPhotoSearch.tsx` | 159 | **KEEP** | Wird von `onboarding-v2/panels/PhotosPanel.tsx` **und** `OnboardingChat`/`CustomerDashboard` benutzt; ruft `trpc.onboarding.searchStockPhotos` → diese Prozedur muss ebenfalls bleiben (ggf. nach `onboardingV2` umhängen). |
| `client/src/components/ChatWidget.tsx` (354), `BookingWidget.tsx` (430), `CookieBanner.tsx` (194), `AgeGate.tsx` (206) | | **KEEP solange SitePage/PreviewPage CSR existieren**, sonst DEL zugunsten `site/islands/*` (`ChatIsland` 268, `BookingIsland` 378, `ContactFormIsland` 167) | Doppelte Implementierung, siehe R1. |
| `client/src/components/HelpWidget.tsx` (311) | | KEEP | Auch im Dashboard. |
| `client/src/components/site/**` (9.528 LOC: 14 Packs, Engine, Islands, SiteRenderer) | | **KEEP** | v2-Zielzustand. |

---

## 2. Routen in `client/src/App.tsx` (300 LOC)

### 2.1 Subdomain-Router (`:166-178`, `kunde.pageblitz.de`)

| Route | Komponente | Klassifikation |
|---|---|---|
| `/impressum` | `LegalPage forceSlug` | **shared** — v1-Feldnamen, REW (§1.2) |
| `/datenschutz` | `LegalPage forceSlug` | **shared** — REW |
| `*` (catch-all) | `SitePage forceSlug` | **shared** — CSR-Fallback hinter SSR |

### 2.2 Admin-Router (`AdminSwitch`, `:110-125`)

| Route | Klassifikation |
|---|---|
| `/admin`, `/admin/search`, `/admin/websites`, `/admin/outreach`, `/admin/stats`, `/admin/leads`, `/admin/businesses`, `/admin/users`, `/admin/pipeline`, `/admin/support-chats`, `/admin/errors`, `/admin/lifecycle` | **shared / v1-neutral** — keine `layoutStyle`-/Layout-Referenzen im Client (geprüft, 0 Treffer). `WebsitesPage.tsx:733` nutzt `trpc.website.regenerate` → hängt am v1-Regenerierungspfad (§4). |
| `/admin/layouts` → `LayoutOverviewPage` | **v1-only → DEL** (Nav-Eintrag `DashboardLayout.tsx:40` mitentfernen) |

### 2.3 Haupt-Router (`:190-236`)

| Route | Komponente | Klassifikation / Aktion |
|---|---|---|
| `/` | `LandingPage` (2.710 LOC) | **shared, aber v1-gekoppelt** → siehe unten |
| `/impressum`, `/datenschutz` | `PageblitzImpressum`, `PageblitzDatenschutz` | shared, KEEP |
| `/start` | `StartPage` (541) | shared, KEEP — **navigiert nach `/preview/${previewToken}/onboarding` (`:165`, `:208`) → muss auf `/onboarding/${previewToken}` umgestellt werden** |
| `/welcome-back` | `WelcomeBack` | shared, KEEP |
| `/preview/:token` | `PreviewPage` | REW (§1.2) — Add-on-Banner + CTA auf Studio |
| `/site/:slug` | `SitePage` | shared, KEEP (CSR-Fallback; primär SSR) |
| `/site/:slug/impressum`, `/site/:slug/datenschutz` | `LegalPage` | REW auf `websiteData.legal.*` |
| `/preview/:token/onboarding` | **`OnboardingChat`** | **v1-only → Redirect auf `/onboarding/:token`** |
| `/websites/:id/onboarding` | **`OnboardingChat`** | **v1-only → Redirect** (Token via Server auflösen; wird von `lifecycleScheduler.ts:151,475` verlinkt) |
| `/onboarding/:token` | `StudioPage` | **v2 — Zielroute** |
| `/my-website` | `CustomerDashboard` (8.038) | shared, REW (§5) |
| `/my-account` | `AccountPage` (611) | shared, KEEP |
| `/login`, `/admin-login` | `CustomerLoginPage`, `LoginPage` | shared, KEEP |
| `/layout-preview/:key` | `LayoutPreviewStandalone` | **v1-only → DEL** |
| `/variant-preview` | `VariantPreviewPage` | v1/v2-Mischform → REW oder DEL |

### 2.4 `LandingPage.tsx` — v1-Kopplung (nicht in den Specs erwähnt, **Blocker**)

`LandingPage.tsx:33-36` importiert 7 v1-Layouts. Betroffener Block ≈ **`:345`–`:1545` (~1.200 LOC)**:
- `HERO_PREVIEW_LAYOUTS` (`:345`, `["BOLD","ELEGANT","AURORA",…]`)
- `GhostWebsiteCreation` (`:349-519`) — Hero-Animation mit Layout-Namen
- `LAYOUT_COMPONENTS` (`:523-531`) — Map auf 7 v1-Layouts
- `LAYOUT_CONFIG` (`:534-1081`) — ~550 LOC hartcodierte v1-Demo-`websiteData` (Sektionstypen `process`, `services` …)
- `EXTENDED_COLOR_SCHEMES` (`:1084-1272`), `getColorScheme` (`:1275`)
- `ALL_WEBSITE_EXAMPLES`/`pickRandom5` (`:1280-1297`), `LivePreviewCard` (`:1308-1436`), `WebsiteShowcase` (`:1438-1545`)

→ Muss auf Style-Pack-Previews umgebaut werden (z. B. iframes auf `/dev/site-preview?pack=<id>&fixture=full`, dafür existieren bereits 14 Fixtures in `shared/siteContract/fixtures.ts`). **Ohne diesen Umbau lässt sich `layouts/` nicht löschen.**

### 2.5 Server-seitige Routen-Allowlist

`server/_core/static.ts:63-70` (`SPA_ROUTES`) muss mit `App.tsx` übereinstimmen.
**Befund: `/onboarding/:token` fehlt dort bereits heute** → ein Direktaufruf/Reload der Studio-URL liefert in Produktion **HTTP 404** (index.html wird zwar ausgeliefert, aber mit Status 404). Ebenfalls zu bereinigen: `/^\/preview\/[^/]+(\/onboarding)?$/` (`:67`), `/^\/layout-preview\/[^/]+$/` (`:69`), `/^\/websites\/\d+\/onboarding$/` (`:68`), `variant-preview` in `:65`.

---

## 3. Shared-Konfiguration

### 3.1 `shared/layoutConfig.ts` (675 LOC) — Export-für-Export

| Export | Zeile | Verwender | Verdikt |
|---|---|---|---|
| `CURRENT_LAYOUT_VERSION` | 13 | `server/routers.ts` (5×), `WebsiteRenderer.tsx` (2×) | **DEL** (v1-Versionsstempel) |
| `withOnColors` | 27 | 33× intern, `OnboardingChat` (4×), `LayoutPreviewStandalone`, `server/industryImages.ts` (2×), `shared/industryImages.ts` | **KEEP** (Farb-Utility, auch für Fallback-Schemata) |
| `LayoutFontConfig` / `LAYOUT_FONTS` / `LAYOUT_FONTS_DEFAULT` / `getLayoutFonts` | 38–92 | `server/routers.ts` (4×, v1-Generierung), `OnboardingChat`, `CustomerDashboard` | **DEL** — Fonts kommen in v2 aus der Pack-Verfassung |
| `getLLMFontPrompt` | 94 | nur `server/routers.ts` (v1-Prompt) | **DEL** (Spec B §7.2 explizit) |
| `FORBIDDEN_BODY_FONTS` | 114 | nur `server/routers.ts` | **DEL** (Spec B §7.2 explizit) |
| `SANS_ONLY_INDUSTRIES` / `prefersSansSerif` | 131–138 | nur `OnboardingChat` | **DEL** |
| `FONT_OPTIONS` | 147 | `CustomerDashboard` (10×), `OnboardingChat` (3×) | **DEL** mit beiden Verwendern (v2 wählt keine Fonts) |
| `LOGO_FONT_OPTIONS` | 165 | nur `OnboardingChat` | **DEL** |
| `PREDEFINED_COLOR_SCHEMES` | 174 | `OnboardingChat`, `LayoutPreviewStandalone`, `LayoutOverviewPage`, **`LandingPage`** | **DEL nach LandingPage-Umbau** |
| `generateRandomColorScheme` | 364 | nur `OnboardingChat` | **DEL** |
| `DEFAULT_LAYOUT_COLOR_SCHEMES` | 447 | `OnboardingChat` (3×), `CustomerDashboard` (3×), `VariantPreviewPage` (2×) | **DEL** (Spec B §7.2 explizit) |
| `DESIGN_TOKEN_CONFIG` | 645 | nur `server/routers.ts` (**13×**, v1-Design-Token-Prompt) | **DEL** |
| `LAYOUT_FALLBACK_IMAGES` | 655 | **niemand** | **DEAD → DEL** |

→ **Ergebnis:** `shared/layoutConfig.ts` schrumpft auf `ColorScheme`-Re-Export + `withOnColors` (≈ 40 LOC) oder geht ganz in `shared/stylePacks/` auf. **`DESIGN_ARCHETYPES` liegt nicht hier**, sondern in `server/routers.ts` (2 Treffer) → dort löschen.

### 3.2 `shared/types.ts` (139 LOC)

| Typ | Verwendungen (ohne Tests) | Verdikt |
|---|---|---|
| `WebsiteData` (`:70-89`) + `WebsiteSection` (`:11-31`) + `DesignTokens` (`:37-68`) | **34 Treffer in 11 Dateien**: `ContentEditorSplitView` 17, `OnboardingChat` 6, `CustomerDashboard` 5, `PreviewPage` 4, `SitePage` 2, `WebsiteRenderer` 2, 4× `layouts/*` je 2 | **DEL nach Abbau der obigen Dateien.** `SitePage`/`PreviewPage` müssen auf `WebsiteDataV2` umgestellt werden. |
| `ColorScheme` (`:91-108`) | breit (auch `shared/industryImages`, SSR-nah) | **KEEP** vorerst |
| `BusinessSearchResult` (`:110`) | GMB-Suche | **KEEP** |
| `Addon` / `AVAILABLE_ADDONS` (`:125-139`) | v1-Preisliste (49/99/79/29 €) — parallel zu `shared/pricing.ts` | prüfen, vermutlich **DEL** (v2 nutzt `shared/pricing`) |

### 3.3 Weitere Alt-Mappings (nicht in `layoutConfig.ts`)

| Symbol | Definition | Verwender | Verdikt |
|---|---|---|---|
| `VARIANT_FAMILY_RANKINGS` | **zwei Kopien**: `server/industryImages.ts:210` und `client/src/pages/OnboardingChat.tsx:66` | `getLayoutVariants` (`server/industryImages.ts:252`), OnboardingChat | **DEL beide** — v2-Ersatz: `shared/stylePacks/variantCandidates.ts` (`getV2VariantCandidates`, bereits von OnboardingChat `:55` mitbenutzt) |
| `getLayoutPool` | `server/industryImages.ts:125` | `server/routers.ts` (6×), `server/outreachPipeline.ts:426`, intern | **DEL** — v2: `getPackPool` (`shared/stylePacks`) via `server/generationV2/selectPack.ts` |
| `getLayoutStyle` | `server/industryImages.ts:261` | intern | **DEL** |
| `getLayoutVariants` | `server/industryImages.ts:252` | – | **DEL** |
| `getIndustryColorScheme` | `server/industryImages.ts:79` | `server/routers.ts` (8×), `outreachPipeline.ts:425` | **DEL** — v2-Farben kommen aus der Pack-Verfassung |
| `getIndustryImages` / `getHeroImageUrl` / `getGalleryImages` / `getContrastColor` | `server/industryImages.ts:19/54/70/107` | **auch v2**: `generationV2/runJob.ts:10`, `onboardingV2/routerContent.ts:11` | **KEEP** |
| `getNextLayoutForIndustry` + Tabelle `layout_counters` | `server/db.ts:781` | v1: `routers.ts` (5×), `outreachPipeline.ts:427`; **v2: `server/generationV2/selectPack.ts:15`** | **KEEP** (v2 rotiert Pack-IDs über denselben Zähler) |
| `getIndustryProfile` | `shared/industryServices.ts:277` | `server/routers.ts` (2×), Test `server/industry.mapping.test.ts` | prüfen — v1-Service-Vorschläge; v2 hat `server/onboardingV2/suggest.ts`. Wahrscheinlich **DEL/REW** |
| `selectTemplatesForIndustry`, `getTemplateStyleDescription` | `server/templateSelector.ts:172/241` | `server/routers.ts` (je 4×) | **DEL** mit `server/templateSelector.ts` (264 LOC) + `template-library/templates.json` (2 KB) + Build-Copy-Step in `package.json:9` |
| `getLayoutKeyByIndustry`, `LayoutEngine` | `PremiumLayoutsV2.tsx:4844/4872` | nur dateiintern | **DEL** (mit der Datei) |
| `DESIGN_ARCHETYPES` | `server/routers.ts` (2 Treffer) | v1-Design-Token-Prompt | **DEL** |

---

## 4. `server/routers.ts` (8.801 LOC) — v1-Flächen

### 4.1 v1-Generierung

| Block | Zeilen | LOC | Was | v2-Ersatz |
|---|---|---|---|---|
| `runWebsiteGeneration(jobId, websiteId)` | **1642–2065** | 424 | v1-Job-Runner | — |
| ├ gemeinsamer Vorspann (Job-Status, Website/Business laden, `classifyIndustry`) | 1646–1671 | 26 | dupliziert in `runWebsiteGenerationV2Job` | `server/generationV2/runJob.ts:120+` |
| ├ **`PB_LAYOUT_V2`-Zweig → v2 + `return`** | **1674–1685** | 12 | **einziger Flag-Check der App** | Bedingung entfernen, Aufruf behalten |
| └ **v1-Rumpf** | **1686–2065** | ~380 | colorScheme/Layout-Rotation, Bild-+Template-Auswahl, LLM-Prompt (`invokeLLM:1781`), Stats-/Process-Injektion, Testimonials, Kontakt-Injektion, DesignToken-Clamping, `updateWebsite` | `runWebsiteGenerationV2` (`server/generationV2/runJob.ts:63–115`, ~53 LOC) |

Aufrufer von `runWebsiteGeneration`: `routers.ts:4133` (`outreach.queueBusinesses`), `routers.ts:7613` (`selfService.generateWebsiteAsync`), `server/pipelineGenerationBridge.ts:9` (← `outreachPipeline.ts:453`).

**v1-only Helper (alle lokal in `routers.ts`):**

| Helper | Zeilen | LOC | Weitere Aufrufer | Verdikt |
|---|---|---|---|---|
| `DESIGN_ARCHETYPES` (12 Archetypen mit CSS-Prompt-Anweisungen) | **267–651** | 385 | nur `buildEnhancedPrompt:907` | **DEL** |
| `buildIndustryContext` | 654–840 | 187 | 1664, 3066, 3436, 4903 | DEL |
| `buildPersonalityHint` | 841–876 | 36 | 1666, 3067, 3437 | DEL |
| `buildEnhancedPrompt` | 877–1003 | 127 | 1748, 3136, 3493 | DEL (Ersatz `server/generationV2/contentPrompt.ts`) |
| `mapCategoryToIndustryKey` | 1004–1092 | 89 | **keine — bereits toter Code** | **DEL sofort** |
| `buildProcessSection` | 1093–1523 | **431** | 1853, 3294, 3646 | DEL (größter Einzelblock) |
| `buildVerifiedStats` | 1529–1581 | 53 | **keine — bereits tot** | **DEL sofort** |
| `getFallbackWebsiteData` | 1582–1641 | 60 | nur 1833 | DEL (v2 hat bewusst keinen stillen Fallback) |
| `formatOpeningHoursText` | 182–235 | 54 | 5120 (`onboarding.complete`) | KEEP bis `complete` weg |
| `slugify` (169–181), `extractGmbCategory` (236–245), `getGmbReviews` (246–262) | | 40 | breit | **KEEP** |

v1-only Importe (`routers.ts:112–144`): `getLayoutStyle`, `getLayoutPool`, `selectTemplatesForIndustry`, `getTemplateStyleDescription`, `getTemplateImageUrls`, `getLayoutFonts`, `DESIGN_TOKEN_CONFIG`, `getLLMFontPrompt`, `FORBIDDEN_BODY_FONTS`.
**Nicht** löschen: `getHeroImageUrl`, `getGalleryImages`, `getNextLayoutForIndustry` — von v2 mitbenutzt.

### 4.2 `PB_LAYOUT_V2` — alle Fundstellen

- **Code (genau 1 Verzweigung):** `server/routers.ts:1677` — `if (process.env.PB_LAYOUT_V2 === "1")`, Kommentar `:1674-1676`.
- **Nur Kommentare:** `server/generationV2/runJob.ts:57`, `:120`.
- **Docs:** `specs/2026-08-21-flag-aktivierung.md` (1, 9, 11, 27, 117, 126, 159, 235), `specs/2026-08-21-onboarding-v2-design.md` (19, 106, 135), `plans/2026-08-22-onboarding-v2-b1-fundament.md` (24, 309), `plans/2026-08-21-style-packs-c2-…` (87, 88), `plans/2026-08-21-style-packs-c1-…` (5), `plans/2026-08-20-style-packs-b-leuchttuerme.md` (428, 544, 550).
- **Nicht** in `client/`, `shared/`, `.env.example`, `package.json` (Flag steht nur in der VPS-Env).

### 4.3 `selfService.*` (Router 7362–8322)

| Prozedur | Zeilen | Client-Aufrufer | Verdikt |
|---|---|---|---|
| `resolveLink` | 7368–7584 | (StartPage indirekt) | KEEP |
| **`generateWebsiteAsync`** | 7585–7622 | nur `OnboardingChat:1928` | **DEL** — v2: `onboardingV2.ensureGeneration` (`server/onboardingV2/router.ts:34–70`) |
| `getGenerationStatus` | 7623–7650 | Chat-Polling | KEEP oder in v2 falten |
| **`selectWebsiteTemplate`** | 7651–7710 | `OnboardingChat:295` | v2-Zweig 7667–7702, **v1-Zweig 7704–7709 DEL**; gesamte Prozedur ersetzbar durch `onboardingV2.selectStylePack` |
| `start` | 7711–7815 | `StartPage:115` | **KEEP** (format-agnostisch) |
| `updateCaptureStatus` | 7816–7855 | nur OnboardingChat | DEL/portieren |
| `saveCustomerEmail` | 7856–7899 | nur OnboardingChat | DEL — v2: `onboardingV2.setCustomerEmail` |
| `sendLeadEmail` | 7900–7956 | nur OnboardingChat | v1-only |
| `captureEmail` | 7957–7997 | `WelcomeBack:22` | **KEEP** |
| `testEmail` | 7998–8037 | keiner | DEAD → DEL |
| **`generateInitialContent`** | **8038–8321** (284) | nur OnboardingChat | v2-No-op-Stub 8064–8078, **8079–8321 rein v1** → **DEL komplett** |

### 4.4 `onboarding.*` (Router 4604–5583)

**v1-Zweige in geteilten Prozeduren:**
- `saveStep` **4847–5046** — v2-Early-Return **4891–4893**; **v1-Sideeffects 4894–5045 (~152 LOC)**: Kategorie→Industrie-Reklassifizierung, Hero/Gallery/colorScheme-Umbau, brandLogo, headlineFont, Kontrast-Neuberechnung.
- `complete` **5048–5388** — `isV2` bei **5088**; v1-only: `patchWebsiteData` **5089–5106**, Kontakt-Item-Injektion **5123–5169**, Section-Order/Hide **5171–5194**, v1-Spread `{...patchedData, impressumHtml, datenschutzHtml, hasLegalPages}` **5334–5342**. v2-Pfad: `applyOnboardingToV2` **5248–5298**. Gemeinsamer Schwanz (colorScheme-Patch, Aktivierung, Umami, Notify) **5300–5388**.

| Prozedur | Zeilen | Verwender | Verdikt |
|---|---|---|---|
| `get` | 4605–4612 | `OnboardingChat:1660`, `PreviewPage:67` | KEEP (solange PreviewPage) |
| `generateText` | 4613–4655 | **nur OnboardingChat** | **DEL** — v2: `onboardingV2.suggestTexts` |
| `suggestServices` | 4656–4732 | **nur OnboardingChat** | **DEL** — v2: `onboardingV2.suggestOffer` |
| `findEmail` | 4733–4826 | **niemand** (Hunter.io) | **DEAD → DEL** |
| `logStep` | 4827–4840 | **nur OnboardingChat** | v1-only (Funnel-Telemetrie) |
| `getStepEvents` | 4841–4846 | `WebsitesPage:1135`, `LeadsPage:396` | KEEP — aber Datenquelle stirbt mit `logStep` → v2-Events nachziehen |
| `saveStep` | 4847–5046 | `OnboardingChat:1921`, `OnboardingWizard:110` (tot) | **DEL** |
| `complete` | 5048–5388 | `OnboardingChat:1922`, `OnboardingWizard:111` (tot) | **REW/DEL** — v2: `server/onboardingV2/checkout.ts` + `applyOnboardingToV2` |
| `uploadLogo` | 5389–5410 | **nur OnboardingChat** | **DEL** |
| `uploadPhoto` | 5411–5446 | **niemand** | **DEAD → DEL** (v2: `onboardingV2.uploadPhoto`) |
| `searchStockPhotos` | 5447–5458 | `StockPhotoSearch:46` (auch v2-`PhotosPanel`) | **KEEP** |
| `getPhotoSuggestions` | 5459–5484 | OnboardingChat, `VariantPreviewPage:55` | KEEP nur falls VariantPreviewPage überlebt |
| `getGmbPhotos` | 5485–5501 | **nur OnboardingChat** | **DEL** — v2: `onboardingV2.getPhotoSources` |
| `regenerateLegalPages` | 5502–5583 | `LegalPage:22` | **REW** — v2-Zweig 5554–5569, `assertV2SafeWrite:5570` |

`onboardingV2: onboardingV2Router` hängt bei **5585**.

### 4.5 Admin-Generierung / Template-Auswahl

- **`website.generate` 3042–3405 (~364 LOC)** — komplette v1-Pipeline inline, Dublette von `runWebsiteGeneration`. `invokeLLM:3150`, `getGmbReviews:3249`, `buildProcessSection:3294`, DesignToken-Clamp 3345–3352, `getLayoutFonts:3365`, `CURRENT_LAYOUT_VERSION:3394`. Client `WebsitesPage:88`. **DEL** (kein Guard nötig — legt neuen Datensatz an).
- **`website.regenerate` 3407–3757 (~350 LOC)** — dieselbe Pipeline auf bestehendem Datensatz, `assertV2SafeWrite` bei **3736** → wirft heute für v2-Websites. Client `WebsitesPage:733`. **DEL oder REW auf `runWebsiteGenerationV2Job`.** *(Ein `admin.regenerate` gibt es nicht — das ist diese Prozedur.)*
- **`selfService.selectWebsiteTemplate` 7651–7710** — v1-Zweig 7704–7709 **DEL**.

### 4.6 `customer.*`-Schreibpfade auf `websiteData` (Router 5589–7360)

| Prozedur | Zeilen | `assertV2SafeWrite` | Verdikt |
|---|---|---|---|
| `uploadLogoForWebsite` | 5656–5692 | **5681** | REW |
| `changeLayout` | 5693–5712 | — (nur `layoutStyle`-Spalte) | **DEL** (v2 ignoriert `layoutStyle`) |
| `getImageSuggestions` | 5714–5736 | — (read-only, v1-Stock) | REW |
| `saveTeamMembers` | 5994–6031 | **6023** | REW (`teamMembers` nicht im v2-Vertrag an dieser Stelle) |
| `generateLegalPages` | 6198–6275 | **6267** | KEEP (v2-Zweig 6249–6266) |
| **`updateWebsiteContent`** | **6276–6384** | **KEINER** | **BUG — siehe unten** |
| `applyAiEdit` | 6385–6513 | **6508** | **DEL** — v2: `onboardingV2.aiEdit` (`invokeLLM:6449`) |
| `confirmAiEdit` | 6514–6536 | **6529** | **DEL** — v2: `onboardingV2.applyAiEdit` |
| `updateLegalData` | 6537–6628 | **6615** | KEEP (v2-Zweig 6596–6614) |
| `getOnboardingData` | 6629–6645 | — | KEEP |
| `updateServices` | 6646–6720 | **6715** | REW |
| `updateDesign` | 6721–6798 | **6792** (bedingt) | REW |
| `uploadGalleryImage` | 6799–6836 | — (liefert nur URL) | KEEP |
| `updateAddons` | 6837–7080 | **7069** + **7075** | REW |

Weitere `assertV2SafeWrite`-Stellen: `routers.ts:3736`, `:5570`; `server/stripeWebhookHandlers.ts:195`; `server/onboardingV2/state.ts:223`. Guard: `server/v2WriteGuard.ts:26` (44 LOC).

> **🔴 Guard-Lücke (Critical, verifiziert):** `customer.updateWebsiteContent` (**6276–6384**) schreibt `websiteData` bei **6383 ohne `assertV2SafeWrite`** und mutiert das geladene Objekt **in place** (`const websiteData = (website.websiteData as any) || {}` bei **6310**, danach direkte Property-Zuweisungen 6326–6350). Selbst ein nachträglich eingesetzter Guard bei 6382 würde das Objekt mit sich selbst vergleichen und immer passieren. Client-Aufrufer: `CustomerDashboard.tsx:3140` (Struktur), `:5137` (Logo), `:6158` (SEO/Hero/About). Auf einer v2-Seite schreibt das v1-Keys (`tagline`, `sections`, `hiddenSections`, `logoImageUrl`, `seoTitle`, `seoDescription`) in ein v2-Dokument → `WebsiteDataV2Schema` parst nicht mehr → `loadStudioWebsite` meldet `hasLegacyDoc` → **der Eigentümer wird aus dem Studio ausgesperrt**. Das ist der einzige verbliebene v2-Korruptionspfad und sollte **vor** dem Cutover geschlossen werden (Guard + Kopie statt In-place, oder Prozedur samt Aufrufern löschen).

### 4.7 Template-/Upload-Admin

- **`templates`-Router `routers.ts:4289–4513` (~225 LOC)**, alle `adminProcedure`: `upload` 4291–4319, `classify` 4321–4440 (LLM-Vision, `invokeLLM:4368`), `update` 4441–4463, `approve` 4464–4471, `bulkApprove` 4472–4480, `list` 4481–4499, `delete` 4501–4507, `getForPool` 4508–4512. Einziger Client: **`TemplatesPage.tsx` — nicht geroutet** → komplett tote Fläche.
- `server/templateSelector.ts` (264 LOC): `selectTemplatesForIndustry:172`, `getTemplateStyleDescription:241`, `getTemplateImageUrls:260`. Aufrufer: `routers.ts:1723/1726/1727` sowie dieselbe Trias in `website.generate` und `website.regenerate`.
- JSON-Bibliotheken: `server/template-library/templates.json` (geladen `templateSelector.ts:28`) und `template-library/templates.json` (2 KB) — Letztere wird im Build kopiert (`package.json:9` `mkdir -p dist/template-library && cp …`) → **Build-Schritt mitentfernen**.
- DB-Helper: `createTemplateUpload`, `listTemplateUploads`, `listTemplateUploadsByIndustry`, `listTemplateUploadsByPool`, `deleteTemplateUpload`, `updateTemplateUpload`, `getTemplateUploadById` (`routers.ts:47–54`); `listTemplateUploadsByPool` zusätzlich `routers.ts:1738`.

**Verdikt: gesamter Cluster v1-only → DEL** (Router + `templateSelector.ts` + beide `templates.json` + `TemplatesPage.tsx` + Build-Copy + DB-Helper).

### 4.8 `server/outreachPipeline.ts` (538 LOC)

| Stelle | Was |
|---|---|
| `:22` | `getHeroImageUrl, getIndustryColorScheme, getLayoutPool` |
| `:23` | `getNextLayoutForIndustry` |
| `:425–428` | v1-colorScheme + Layout-Pool-Rotation + Hero-Bild **vor** der Job-Erstellung |
| `:434–444` | `createGeneratedWebsite` mit v1-Spalten `colorScheme`/`heroImageUrl`/`layoutStyle` |
| `:446–450` | `createGenerationJob` |
| `:453–461` | `import("./pipelineGenerationBridge").triggerGeneration(jobId, websiteId)` → `server/pipelineGenerationBridge.ts:8–11` → `runWebsiteGeneration` |

**REW `:425–461`**: v1-Design-Vorberechnung streichen, Bridge auf `runWebsiteGenerationV2Job` zeigen lassen. **Dasselbe Muster dupliziert in `routers.ts:4085–4138` (`outreach.queueBusinesses`).**
**Nicht** v1: `:149` `invokeLLM` (Outreach-E-Mail-Copy) und `:370` `analyzeWebsite` → KEEP.

### 4.9 `server/_core/llm.ts` (366 LOC) — Aufrufstellen

`invokeLLM` definiert bei `server/_core/llm.ts:347`. **Modul selbst: KEEP** (geteilte Infrastruktur).

| Aufrufstelle | Zweck | Klasse |
|---|---|---|
| `routers.ts:1781` | v1-Website-Generierung (multimodal, + Template-Screenshots) | **v1** |
| `routers.ts:3150` | `website.generate` | **v1** |
| `routers.ts:3508` | `website.regenerate` | **v1** |
| `routers.ts:4368` | `templates.classify` | **v1** |
| `routers.ts:4640` | `onboarding.generateText` | **v1** |
| `routers.ts:4677` | `onboarding.suggestServices` | **v1** |
| `routers.ts:6449` | `customer.applyAiEdit` | **v1** |
| `routers.ts:8164` | `selfService.generateInitialContent` | **v1** |
| `outreachPipeline.ts:149` | Outreach-E-Mail-Copy | shared |
| `industryClassifier.ts:21` | `classifyIndustry` | shared (v1+v2) |
| `_core/chatRoutes.ts:200`, `_core/supportChatRoutes.ts:90`, `_core/landingChatRoutes.ts:83` | Chat-Widgets | shared |
| `generationV2/llmClient.ts:11`, `onboardingV2/suggest.ts:153`, `:372`, `onboardingV2/aiEdit.ts:159` | v2 | v2 |

**8 von 13 Produktiv-Aufrufstellen sind v1-only — alle in `routers.ts`.** Nach dem Cutover braucht `routers.ts` den `invokeLLM`-Import (`:107`) nicht mehr.

### 4.10 LOC-Bilanz `routers.ts`

| Block | Zeilen | ~LOC |
|---|---|---|
| `DESIGN_ARCHETYPES` | 267–651 | 385 |
| `buildIndustryContext`+`buildPersonalityHint`+`buildEnhancedPrompt` | 654–1003 | 350 |
| `mapCategoryToIndustryKey` (tot) | 1004–1092 | 89 |
| `buildProcessSection` | 1093–1523 | 431 |
| `buildVerifiedStats` (tot) | 1529–1581 | 53 |
| `getFallbackWebsiteData` | 1582–1641 | 60 |
| `runWebsiteGeneration` v1-Rumpf | 1686–2065 | 380 |
| `website.generate` | 3042–3405 | 364 |
| `website.regenerate` | 3407–3757 | 351 |
| `outreach.queueBusinesses` v1-Vorberechnung | 4086–4138 | 53 |
| `templates`-Router | 4289–4513 | 225 |
| `onboarding.generateText`/`suggestServices`/`findEmail` | 4613–4826 | 214 |
| `onboarding.saveStep` v1-Sideeffects | 4894–5045 | 152 |
| `onboarding.complete` v1-Fragmente | 5089–5106, 5123–5194, 5334–5342 | ~140 |
| `onboarding.uploadLogo`+`uploadPhoto` | 5389–5446 | 58 |
| `onboarding.getGmbPhotos` | 5485–5501 | 17 |
| `customer.changeLayout` | 5693–5712 | 20 |
| `customer.applyAiEdit`+`confirmAiEdit` | 6385–6536 | 152 |
| `selfService.generateWebsiteAsync` | 7585–7622 | 38 |
| `selfService.selectWebsiteTemplate` v1-Zweig | 7704–7709 | 6 |
| `selfService.updateCaptureStatus`/`saveCustomerEmail`/`sendLeadEmail`/`testEmail` | 7816–8037 | 222 |
| `selfService.generateInitialContent` | 8038–8321 | 284 |
| **Summe reine Löschung** | | **≈ 4.044 (~46 %)** |

Zusätzlich **≈ 700–900 LOC Umschreiben** statt Löschen: `customer.updateServices/updateDesign/updateAddons/saveTeamMembers/uploadLogoForWebsite/updateWebsiteContent/getImageSuggestions`, `onboarding.complete`-Schwanz (5300–5388).

---

## 5. Kundendashboard

### 5.1 Größen

| Datei | LOC | Rolle |
|---|---|---|
| `client/src/pages/CustomerDashboard.tsx` | **8.038** | Kundendashboard (eigener Header+Sidebar inline) |
| `client/src/components/ContentEditorSplitView.tsx` | **1.015** | KI-Inhaltseditor (nur vom Dashboard genutzt) |
| `client/src/pages/AccountPage.tsx` | 611 | Profil/Abo/Passwort — **null `websiteData`-Bezug** |
| `client/src/components/DashboardLayout.tsx` | 255 | **Admin**-Shell (`/admin/*`), **nicht** Kundendashboard — nur `App.tsx:138` |
| Studio-Vergleich: `client/src/pages/onboarding-v2/**` ≈ 2.760 (ohne Tests), `server/onboardingV2/**` 4.967 (inkl. Tests) | | |

### 5.2 Tabs (`tabs`-Array `CustomerDashboard.tsx:6414–6463`)

| Tab | Render | Klasse |
|---|---|---|
| `preview` Vorschau | 6795–6854 (`WebsiteRenderer`) | **gemischt** — v2-Pfad ignoriert alle Props außer `slug` |
| `content` Inhalte | 6857–6870 (`ContentEditorSplitView`) | **v1-gebunden** |
| `structure` Struktur | 7061–7093 (`StructureEditor` 3121–3351) | **v1-gebunden** |
| `design` Design | 6872–6884 (`DesignStudio` 4559–5113, `LogoUploadCard` 5114–5237) | **v1-gebunden** |
| `settings` Einstellungen | 6885–7060 | gemischt (Aufschlüsselung unten) |
| `addons` Add-ons | 7094–7119 (`AddonsEditor` 1254–3120, `ContactFormEditor` 711–984, `BookingAddonSection` 3407–3836, `AiChatAddonSection` 3837–4084, `TeamAddonSection` 4085–4464) | gemischt |
| `domain` Domain | 7221–7400 (Slug + CNAME) | **unabhängig** |
| `submissions` Anfragen | 7401–7640 | **unabhängig** |
| `leads` Chat-Leads | 5238–5639, montiert 7120–7128 | **unabhängig** |
| `appointments` Termine | 5640–5938, montiert 7129–7137 | **unabhängig** |
| `analytics` Statistiken | 7138–7218 (Umami) | **unabhängig** |
| Setup-Wizard-Modal | 7644–8038 | unabhängig, außer `generateLegalPages` |

**Settings-Tab aufgeschlüsselt:** 6889–6914 Kontaktdaten → `business`-Tabelle (**unabhängig**) · 6916–6960 SEO liest/schreibt flache v1-Keys, v2 nutzt `seo: {title, description}` (**v1**) · 6962–6977 `ServicesEditor` (427–553, **v1**) · 6979–7004 `LegalEditor` (554–710, **v1**) · 7006–7057 Branding-Toggle → `showBranding`-Spalte (**unabhängig**).

**Add-ons-Tab:** Galerie/Menü/Preisliste schreiben `websiteData.sections[…]` (1275–1300, **v1**) · `ContactFormEditor` (711–984, überwiegend unabhängig) · `BookingAddonSection` (3407–3836, **unabhängig**) · `AiChatAddonSection` (3837–4084, **unabhängig**) · `TeamAddonSection` (4085–4464, **v1**, schreibt `team`-Sektion) · `purchaseAddon`/Stripe (**unabhängig**).

**Toter Code im Dashboard (~600 LOC, definiert aber nie gerendert):** `AiContentEditor` **291–426**, `DesignEditor` **985–1253**, `LayoutSwitcherCard` **4465–4558**, `ContentFieldsAccordion` **5939–6108**.

### 5.3 `trpc.customer.*`-Aufrufstellen

**A — v1-`websiteData`-gebunden (löschen / durch Studio-Link ersetzen):**
`applyAiEdit` `CustomerDashboard:315` (tot) + `ContentEditorSplitView:378` · `confirmAiEdit` `ContentEditorSplitView:424` · `updateServices` `:449` · `updateLegalData` `:581` · `updateDesign` `:1034` (tot), `:4649` · `changeLayout` `:4477` (tot), `:4648` · `updateWebsiteContent` `:3140`, `:5137`, `:6158` · `uploadLogoForWebsite` `:5126` · `uploadGalleryImage` `:1443`, `:4120` · `getTeamMembers`/`saveTeamMembers` `:4109`/`:4121` · `getImageSuggestions` `:6153` · `generateLegalPages` `:6291` · `updateAddons` `:1445`, `:3874`.

**B — unabhängig (behalten):**
`getMyWebsites` `:6142` + `AccountPage:122` · `getOnboardingData` `:6145` · `getAnalytics` `:6167` · `getSubmissions`/`markSubmissionRead`/`archiveSubmission`/`deleteSubmission` `:6182`/`:6190`/`:6194`/`:6199` · `updateContactEmail` `:6211` · `updateShowBranding` `:6223` · `updateSlug`/`checkSlugAvailability` `:6280`/`:6297`,`:6302` · `setLive` `:6285` · `getChatLeads`/`getChatTranscripts`/`markChatLeadRead`/`deleteChatLead`/`deleteChatTranscript` `:5252`–`:5261` · `getBookingSettings`/`saveBookingSettings` `:1472`,`:3467`,`:5651`/`:1463`,`:3455` · `getAppointments`/`cancelAppointmentByOwner` `:5656`,`:5671`/`:5657` · `purchaseAddon` `:1396`,`:3441`,`:3860`,`:4134` · `createBillingPortalSession` `AccountPage:112`.

**Tote API-Fläche:** `customer.getChatSettings` (`routers.ts:5841`) und `customer.updateChatSettings` (`:5863`) haben **keinen** Client-Aufrufer.

### 5.4 v1-Importe des Dashboards

`CustomerDashboard.tsx:1–55`:
- `@shared/layoutConfig` → `FONT_OPTIONS`, `DEFAULT_LAYOUT_COLOR_SCHEMES`, `LAYOUT_FONTS` (`:51–55`); benutzt bei 1176/1183/1202/1209 (tot), 4698, 4880, 4959–4994. `LAYOUT_FONTS` ist importiert, aber **nie referenziert** (toter Import). **v1-only.**
- Lokale v1-Layout-Metadaten `LAYOUT_LABELS_DASH`/`LAYOUT_VIBES_DASH`/`LAYOUT_FAMILIES_DASH` (`:57–113`, die 18 v1-Keys) — **v1-only.**
- `type { WebsiteData, ColorScheme }` (`:50`) — **v1-only.**
- `ContentEditorSplitView` (`:47`) — v1-only in der Praxis.
- `StockPhotoSearch` (`:48`) — wiederverwendbar, aber nur über den v1-Bildpicker erreichbar.
- `WebsiteRenderer` (`:46`) — **nicht** v1-only (dispatcht v2 auf `SiteRenderer`).

Weder `DESIGN_ARCHETYPES` noch `getLayoutKeyByIndustry` werden hier importiert.
**Null v2-Bewusstsein in der Kundenfläche:** kein `parseV2`/`isV2`/`stylePackId`/`siteContract` in `CustomerDashboard.tsx`, `ContentEditorSplitView.tsx`, `AccountPage.tsx`.

**Weitere stille No-ops auf v2:** Hero-/About-Bildaustausch schreibt die Spalten `heroImageUrl`/`aboutImageUrl`, die der v2-Zweig nie liest (v2-Bilder liegen in `doc.sections[].imageUrl`). `customer.changeLayout` schreibt die von v2 ignorierte `layoutStyle`-Spalte.

### 5.5 Studio für verkaufte Websites

**Ja, unterstützt.** `server/onboardingV2/ownership.ts:25–80` (`loadStudioWebsite`): bei `website.status !== "preview"` muss zusätzlich der eingeloggte Nutzer Abo-Inhaber sein (`subscription.userId === user.id`), plus Heilfall über die unveränderliche `subscription.checkoutEmail`. Alle Studio-Prozeduren (`router.ts`, `routerContent.ts`, `routerCommerce.ts`, `routerAi.ts`) gehen durch dieselbe Funktion → Post-Sale-Bearbeitung unter `/onboarding/:token` funktioniert bereits heute.

**Was das Studio abdeckt:** Stil, Fotos, Texte, Angebot, Rechtliches, Add-ons, KI-Chat, SSR-Preview (`/preview-ssr/:token`), Checkout.

**Was dem Studio nach dem Checkout fehlt** (`StudioState`, `server/onboardingV2/state.ts:132–157`, enthält nur `websiteId, token, businessName, category, stylePackId, doc, legacy, job, checklist, checkoutReady, customerEmail, legal, addOns, uploadedPhotos, openingHours`):

1. **Slug-/Subdomain-Änderung** (`updateSlug`, `checkSlugAvailability`) — kein Feld, keine Prozedur
2. **Eigene Domain / CNAME-Anleitung** (Dashboard 7317–7395)
3. **Live-/Offline-Schalter** (`setLive`)
4. **„Erstellt mit Pageblitz"-Toggle** (`showBranding`) — auch nicht im v2-Vertrag
5. **Sektions-Reihenfolge/-Sichtbarkeit** — `sectionOrder`/`hiddenSections` existieren im Schema (`shared/siteContract/schema.ts:223–225`), aber **kein Panel schreibt sie**; der KI-Prompt verbietet es sogar (`server/onboardingV2/aiEditPrompt.ts:63`)
6. **Logo-Upload** — `logo` im Vertrag (`schema.ts:217`), kein Panel
7. **Team-Mitglieder** — `TeamSchema` (`schema.ts:169`), im Studio bewusst gesperrt (`AddonsPanel.tsx:18–30`, `COMING_SOON_KEYS`)
8. **Galerie-/Menü-/Preislisten-Positionen** — `PhotosPanel` deckt nur Sektionsbilder ab
9. **Kontaktformular-Feldkonfiguration** — Studio kippt nur das Flag
10. **Buchungs-Zeiten/Slots und KI-Chat-Ton/Wissen** — Studio kippt nur die Flags
11. **Posteingänge:** Kontaktanfragen, Chat-Leads + Transkripte + TXT-Download, Termine
12. **Analytics/Umami**
13. **Abo & Stripe-Portal** (liegt auf `AccountPage`)
14. **Downloads/Exporte** — es gibt nur `downloadTranscriptJson` (5298–5323); keinen Site-Export

> **UX-Wart:** `CheckoutBar` wird in `StudioPage.tsx:174–178` **bedingungslos** gerendert und `createCheckout` (`routerCommerce.ts:232–277`) hat keinen „bereits verkauft"-Guard. Ein zurückkehrender Eigentümer sieht auf seiner Live-Website weiterhin Preisleiste und „Website freischalten".

### 5.6 Vorschlag: minimales v2-sicheres Dashboard

**Behalten (unabhängig, ≈ 2.000 LOC):** `ChatLeadsTab` 5238–5639 · `AppointmentsTab` 5640–5938 · Analytics 7138–7218 · Domain 7221–7400 · Submissions 7401–7640 · Setup-Wizard 7644–8038 (aber `generateLegalPages` `:6291` → `onboardingV2.updateLegal`) · Branding-Toggle 7006–7057 · Kontaktdaten 6889–6914 · `BookingAddonSection` 3407–3836 · `AiChatAddonSection` 3837–4084 · `purchaseAddon`-Flows · Vorschau-Tab 6795–6854 (v1-Props strippen — besser: iframe auf `/preview-ssr/:token` wie im Studio, dann ist die Dashboard-Vorschau byte-identisch zur Live-Ausgabe) · **`AccountPage.tsx` komplett unverändert**.

**Löschen:** tote Komponenten 291–426 / 985–1253 / 4465–4558 / 5939–6108 (~600) · `LAYOUT_*_DASH` 57–113 · `@shared/layoutConfig`-Import 51–55 · `DesignStudio`+`LogoUploadCard` 4559–5237 · `StructureEditor`+Tab 3121–3351, 7061–7093 · `ContentEditorSplitView` (ganze Datei, 1.015) + Tab 6857–6870 · `ServicesEditor` 427–553 + SEO-Felder 6916–6977 · `LegalEditor` 554–710 + 6979–7004 · Galerie-/Menü-/Preislisten-Editoren in `AddonsEditor` · `TeamAddonSection` 4085–4464 (Kaufflag behalten, Editor verstecken) · Bildpicker-Modal + `handleImageUpload` + `getImageSuggestions` 6466–6640, 6153 · serverseitig `customer.getChatSettings`/`updateChatSettings`.

→ **CustomerDashboard sinkt auf ≈ 3.200–3.500 LOC**, `ContentEditorSplitView.tsx` entfällt ganz.

**„Im Studio bearbeiten"** — `previewToken` liegt bereits auf `row.website` aus `getMyWebsites` (`routers.ts:5645–5649`), Link auf `/onboarding/${previewToken}`:
1. Primär-CTA im Header (~`:6640`) neben „Website ansehen".
2. Overlay/Footer-CTA auf dem Vorschau-Tab.
3. Statt Inhalte-/Design-/Struktur-Tab: entweder ganz entfernen (saubersten) oder drei Stub-Tabs mit je einer Karte + Deep-Link. **Deep-Linking eines Panels ist noch nicht möglich** (`activeId` ist lokales `useState` in `StudioPage.tsx:21`) — ein `?panel=style|photos|texts|offer|legal|addons`-Query-Param wäre ein ~5-Zeilen-Change.
4. Add-ons-Tab: Kauf + Buchung/Chat-Settings behalten; für Galerie/Menü/Preisliste → Studio-Link.
5. Settings-Tab: Kontaktdaten + Branding behalten; SEO/Leistungen/Impressum → Studio-Link.

**Zwei Voraussetzungen:** (a) `customer.updateWebsiteContent` guarden bzw. löschen (§4.6), (b) Studio-Checkout für verkaufte Seiten sperren.

---

## 6. Admin-Seiten mit v1-Abhängigkeit

| Fläche | Datei / Zeilen | LOC | Verdikt |
|---|---|---|---|
| Layout-Katalog | `client/src/pages/LayoutOverviewPage.tsx` + Route `App.tsx:119` + Nav `DashboardLayout.tsx:40` | 330 | **DEL** |
| Layout-Vollansicht | `client/src/pages/LayoutPreviewStandalone.tsx` + Route `App.tsx:230` | 227 | **DEL** (Ersatz `/dev/site-preview`) |
| Template-Uploads (UI) | `client/src/pages/TemplatesPage.tsx` — **nicht geroutet** | 871 | **DEAD → DEL** |
| Template-Uploads (API) | `routers.ts:4289–4513` + `server/templateSelector.ts` + 2× `templates.json` + Build-Copy | ~490 | **DEL** |
| Admin-Generierung | `routers.ts:3042–3405` (`website.generate`), Client `WebsitesPage.tsx:88` | 364 | **DEL/REW** |
| Admin-Regenerierung | `routers.ts:3407–3757` (`website.regenerate`), Client `WebsitesPage.tsx:733` | 351 | **DEL/REW → `runWebsiteGenerationV2Job`** |
| Outreach-Pipeline | `server/outreachPipeline.ts:425–461` + `server/pipelineGenerationBridge.ts` + `routers.ts:4085–4138` | ~110 | **REW auf v2** |
| Funnel-Events | `onboarding.getStepEvents` in `WebsitesPage.tsx:1135`, `LeadsPage.tsx:396` | – | KEEP, aber Quelle (`onboarding.logStep`) stirbt → v2-Events nachziehen |
| Stats nach `layoutStyle` | `client/src/pages/StatsPage.tsx` (137 LOC) | – | **keine `layoutStyle`-Referenz gefunden** — Stats sind v1-neutral |

Übrige Admin-Seiten (`Home`, `SearchPage`, `WebsitesPage`, `OutreachPage`, `LeadsPage`, `BusinessesPage`, `UsersPage`, `PipelinePage`, `SupportChatsPage`, `ErrorsPage`, `LifecyclePage`) enthalten **keine** Layout-/`layoutStyle`-Referenzen.

---

## 7. DB-Spalten

> Empfehlung generell: **Spalten stehen lassen** (MySQL-`DROP COLUMN` ist irreversibel, null zahlende Kunden ⇒ kein Nutzen), nur den *Code* entfernen. Ein optionaler Aufräum-Migrationsschritt kann später folgen. Die Tabelle listet, wer heute noch liest/schreibt.

### 7.1 `generated_websites` (`drizzle/schema.ts:69–146`)

| Spalte | Wer liest/schreibt heute | Empfehlung |
|---|---|---|
| `layoutStyle` (`:86`, default `"classic"`) | v1-Generierung, `customer.changeLayout`, `WebsiteRenderer` v1, `SitePage:124`, `PreviewPage:218`, `outreachPipeline:443` | **v1-only** — nach Cutover ungenutzt. *keep (ungenutzt)*, optional DROP |
| `layoutVersion` (`:87`, default 1) | `WebsiteRenderer:173`, `CURRENT_LAYOUT_VERSION` | **v1-only** → keep/DROP |
| `colorScheme` (`:77`) | v1 überall; v2 nutzt Pack-Palette | **v1-only** — aber `LegalPage:66` liest es noch für die Akzentfarbe → erst nach LegalPage-REW ungenutzt |
| `heroImageUrl` / `aboutImageUrl` (`:84/:85`) | v1-Renderer, `VariantPreviewPage:95–97`, `PreviewPage`, `outreachPipeline:442`; v2 nutzt `doc.sections[].imageUrl` | **v1-only** → keep/DROP |
| `addOnTeamData` (`:127`) | `customer.saveTeamMembers` (v1-Form) | v1-only, aber Team-Panel im Studio ist „deferred" → **keep**, bis das v2-Team-Panel entscheidet |
| `contactFormFields` (`:116`) | `ContactFormEditor`, `PreviewPage`-Patch, `server/contactSubmit.ts` | **KEEP** — Feldkonfiguration ist formatunabhängig (v2-Insel `ContactFormIsland` liest sie) |
| `industry`, `previewToken`, `slug`, `formerSlug`, `status`, `stripe*`, `addons`, `addOnBooking/AiChat/Team/Calendly`, `calendlyUrl`, `chatWelcomeMessage`, `chatUsage*`, `showBranding`, `umamiWebsiteId`, `customerEmail`, `captureStatus`, `contactEmail`, `reservedUntil`, `extensionsUsed`, `marketingConsent*`, `requiresAgeGate`, `hasLegalPages`, `onboardingStatus`, `subscriptionStatus`, `source` | v1 **und** v2 | **KEEP** |

### 7.2 `onboarding_responses` (`drizzle/schema.ts:187–262`)

**KEEP — von v2 aktiv benutzt** (`shared/onboardingV2/checklist.ts`, `server/onboardingV2/*`):
`legalOwner`, `legalEmail`, `legalStreet`, `legalZip`, `legalCity`, `legalPhone`, `legalCountry`, `legalVatId`, `openingHours`, `photoUrls`, `studioProgress`, `stepCurrent`, `addOnContactForm`, `addOnGallery`, `addOnMenu`, `addOnPricelist`, `addOnBooking`, `addOnAiChat`, `addOnTeam`, `status`, `websiteId`, `completedAt`, `createdAt`.
Wahrscheinlich weiterhin gebraucht (nicht im v2-Code, aber rechtlich): `legalRegister`, `legalRegisterCourt`, `legalResponsible` (Impressum-Pflichtangaben — `server/legalGenerator.ts` prüfen).

**v1-only Inhaltsspalten (nach Chat-Löschung tot):**
`businessCategory`, `businessName`, `tagline`, `description`, `foundedYear`, `teamSize`, `usp`, `topServices`, `targetAudience`, `faqItems`, `heroPhotoUrl`, `aboutPhotoUrl`, `logoUrl`, `brandColor`, `brandSecondaryColor`, `colorScheme`, `headlineFont`, `sectionOrder`, `hiddenSections`, `addOnMenuData`, `addOnPricelistData`, `addOnSubpages`, `addOnCalendly`, `calendlyUrl`, `chatWelcomeMessage`, `chatUsageCount`, `chatUsageResetAt`, `addOnTeamData`, `contactFormFields`
→ **keep (ungenutzt)**; `sectionOrder`/`hiddenSections` haben v2-Pendants **im Dokument** (`schema.ts:223–225`), die Spalten braucht v2 nicht.
⚠️ `heroPhotoUrl`/`aboutPhotoUrl` werden noch von `PreviewPage:210–213` gelesen → erst nach PreviewPage-REW tot.

### 7.3 `template_uploads` (`drizzle/schema.ts:439–455`)

**Komplett v1-only.** Leser/Schreiber: nur der `templates`-Router (`routers.ts:4289–4513`) + `routers.ts:1738` (`listTemplateUploadsByPool` in der v1-Generierung). UI (`TemplatesPage.tsx`) ist nicht geroutet.
→ **Tabelle + 7 DB-Helper + Router löschen.** DROP TABLE optional.

### 7.4 `layout_counters` (`drizzle/schema.ts:459–464`)

**KEEP — von v2 benutzt.** `getNextLayoutForIndustry` (`server/db.ts:781–816`) rotiert für v1 Layoutnamen und für v2 **Pack-IDs** (`server/generationV2/selectPack.ts:15`). Nicht anfassen.

### 7.5 `generation_jobs` (`:468+`)

**KEEP** — von `runWebsiteGenerationV2Job` und `onboardingV2.ensureGeneration` genutzt.

---

## 8. Tests

### 8.1 Brechen / entfallen mit dem Cutover

| Test | LOC | Warum |
|---|---|---|
| `server/routers.v2Guards.test.ts` | 305 | Testet exakt die v1/v2-Doppelpfade (`generateInitialContent`-Guard, `selectWebsiteTemplate`-Picker, `customer.updateAddons`, `website.regenerate`). Nach Cutover gegenstandslos → **DEL** (Guard-Netz bleibt via `server/v2WriteGuard.test.ts`) |
| `server/routers.onboardingCompleteV2.test.ts` | 103 | Testet `onboarding.complete` (v1-Prozedur) mit stale v1-Sektionstypen → **DEL** |
| `server/saveStep.color.test.ts` | 79 | `onboarding.saveStep`-Farbsynchronisierung (v1) → **DEL** |
| `server/photo.color.test.ts` | 134 | v1-Sekundärfarbe/Foto-Persistenz über `brandColor`/`colorScheme` → **DEL** |
| `server/photo.colorpicker.test.ts` | 113 | repliziert die Frontend-Konstante `INDUSTRY_PHOTOS` (v1-Farbwähler) → **DEL** |
| `server/secondary.color.test.ts` | 128 | „repliziert die `DEFAULT_COLOR_SCHEMES`-Logik aus `WebsiteRenderer`" → **DEL** |
| `server/customer.dashboard.test.ts` | 139 | Dashboard-Mutationen — **REW** entlang §5.6 |
| `server/industry.mapping.test.ts` | 85 | `getIndustryProfile` — hält nur, wenn `shared/industryServices.ts` bleibt |
| `server/pageblitz.test.ts` | 214 | breiter Router-Test — **prüfen/REW** |
| `server/routers.saveCustomerEmail.test.ts` | 116 | hängt an `selfService.saveCustomerEmail`, das laut §4.3 entfällt → **REW auf `onboardingV2.setCustomerEmail`** |
| `server/contrast.test.ts` | 174 | `shared/colorContrast.ts` — v2 hat eigene Kontrast-Invarianten pro Pack; **prüfen**, ggf. KEEP |

### 8.2 Bleiben unverändert (v2-Sicherheitsnetz)

`tests/visual/packs.spec.ts` (84 Baselines) · `tests/visual/studio.spec.ts` (319) · `tests/visual/islands.spec.ts` (109) · alle `server/onboardingV2/*.test.ts` (~2.100) · `server/generationV2/*.test.ts` (527) · `server/ssr/*.test.ts(x)` (609) · `shared/siteContract/*.test.ts` · `shared/stylePacks/*.test.ts` (moduleParity, industryCoverage, registry, variantCandidates, toCssVars) · `shared/onboardingV2/*.test.ts` · `client/src/components/site/**` (14 Pack-Tests, SiteRenderer, engine, isV2, Islands) · `client/src/pages/onboarding-v2/**` · `server/v2WriteGuard.test.ts` · `server/legalGenerator.test.ts` · `server/contactSubmit.test.ts` · `server/stripeWebhookHandlers.test.ts` · `server/onboardingV2Patch.test.ts` · `shared/pricing.test.ts` · `server/seo.links.test.ts` · `server/linkSubscriptions.test.ts`.

**Bekannte env-bedingte Fehlschläge (unverändert, kein Produktcode-Fehler):** `server/resend.test.ts` ×2, `server/contrast.test.ts` ×4 sowie `server/auth.logout.test.ts` + `server/pageblitz.test.ts` (Import-Abbruch bei `new Stripe("")` ohne Key) — vgl. Flag-Doku §2.

---

## 9. Env, Flags, Doku

| Item | Ort | Aktion |
|---|---|---|
| `PB_LAYOUT_V2` | Code: `server/routers.ts:1677` (einzige Verzweigung); Kommentare `generationV2/runJob.ts:57,120`; VPS-`.env` | **Aus Code und `.env` entfernen** (Spec B §7.1 + §10) |
| `SSR_SITES` | `server/ssr/routes.ts:243` (`=== "off"` → `next()`), Tests `server/ssr/routes.test.ts:56–84`, Kommentar `WebsiteRenderer.tsx:57`, `_core/index.ts:504` | **KEEP als Notbremse** — aber der CSR-Fallback muss dann v2-fähig sein (R1/R2). Alternativ Flag streichen und SSR verpflichtend machen. |
| `PB_LLM_MOCK` | `playwright.config.ts:12`, `server/onboardingV2/aiEdit.ts` (non-production) | KEEP |
| `.env.example` | enthält **keinen** der beiden Flags | ggf. `SSR_SITES` dokumentieren |
| **`docs/superpowers/specs/2026-08-21-flag-aktivierung.md` §1–§5** | ganzes Dokument = Rollout-Runbook für `PB_LAYOUT_V2` | **wird mit dem Cutover obsolet.** §1–§5 (Voraussetzungen, lokale E2E-Probe, VPS-Aktivierung, „bekannte Grenzen der Übergangsphase", Verantwortlichkeit) beschreiben eine Übergangsphase, die es danach nicht mehr gibt. §4 Punkte 1/4/5/6 lösen sich durch B4 auf; §4 Punkt 2 (`prefersMenu`) und Punkt 3 (a11y-/Perf-Pass) sind **noch offen** und wandern nach Spec B §7.4. §6 (Studio-Vorbereitung) und §7 (Inseln/Add-on-Aktivierung, inkl. §7.5 „Deferred": Unterseiten-Add-on → **Plan B4**, Team-Panel) bleiben als Referenz relevant. → Empfehlung: §1–§5 als „historisch/obsolet" markieren (nicht löschen), §7.5-Deferred-Punkte in den B4-Plan übernehmen. |
| Weitere Doku-Treffer | `plans/2026-08-20-style-packs-b-leuchttuerme.md`, `…-c1-…`, `…-c2-…`, `…-onboarding-v2-b1-fundament.md` | Pläne sind historisch — nicht ändern |
| Build | `package.json:9` — `mkdir -p dist/template-library && cp template-library/templates.json …` | **entfernen** mit dem Template-Cluster |
| `server/_core/static.ts:63–70` | `SPA_ROUTES` | `/onboarding/:token` **ergänzen** (fehlt heute!); `layout-preview`, `variant-preview`, `preview/:token/onboarding`, `websites/:id/onboarding` entfernen |

---

## 10. Risiken für den Cutover (nach Priorität)

**R1 — SitePage-CSR-Fallback ist v1-verdrahtet (hoch).**
`SitePage.tsx` greift, wenn `SSR_SITES=off` oder die SSR-Middleware `next()` ruft (Slug nicht gefunden, Dokument nicht v2-valide, Pfad nicht in `SSR_ALLOWED_PATHNAMES = {"/", "/impressum", "/datenschutz"}`, `server/ssr/routes.ts:43`). Sie rendert `AgeGate`/`CookieBanner`/`ChatWidget`/`BookingWidget` — **die alten Widgets**, während SSR die Inseln (`site/islands/*`) hydratisiert: zwei parallele Implementierungen desselben Verhaltens. **Vor dem Löschen entscheiden:** (a) SitePage auf `SiteRenderer` + Inseln umstellen und die alten Widgets löschen, oder (b) `SSR_SITES` abschaffen und SitePage nur als 404/Redirect belassen.

**R2 — Rechtsseiten für v2 im SPA-Pfad leer (hoch, rechtlich relevant).**
`LegalPage.tsx:76–78` liest `websiteData.impressumHtml`/`.datenschutzHtml` (v1-Top-Level). v2 legt sie unter `websiteData.legal.*` ab (`schema.ts:237`, SSR `renderSite.tsx:213–227`). Solange SSR greift, unsichtbar — sobald `SSR_SITES=off`, ein Slug im Negative-Cache landet oder das Dokument kurz nicht parst, liefert `/site/:slug/impressum` **eine leere Impressumsseite**. Muss mit dem Cutover korrigiert werden.

**R3 — E-Mail- und Redirect-Links zeigen auf den gelöschten Chat (hoch).**
Alle auf `/preview/:token/onboarding` bzw. `/websites/:id/onboarding`:
`client/src/pages/StartPage.tsx:165` und `:208` (**Haupt-Funnel**) · `client/src/pages/PreviewPage.tsx:232` · `server/routers.ts:4007` (Magic-Link-Redirect nach Login) · `server/routers.ts:7929` (`sendLeadEmail`-Preview-URL) · `server/_core/index.ts:361` (Reservierungsverlängerung, CTA) · `server/_core/lifecycleScheduler.ts:76`, `:151`, `:475` (Lifecycle-E-Mails; **`:151` und `:475` benutzen `website.id` statt des Tokens — bereits heute defekt**) · `server/_core/email.ts:66/117/254` (Templates `onboardingStarted`, `onboardingCompleted`, Abandoned-Cart — bekommen `previewUrl` von den obigen Aufrufern).
→ Alle auf `/onboarding/:token` umstellen **und** eine Redirect-Route `/preview/:token/onboarding → /onboarding/:token` für bereits versendete E-Mails behalten.

**R4 — `customer.updateWebsiteContent` kann v2-Dokumente korrumpieren (hoch).** Siehe §4.6. Folge: Studio verweigert die Website (`hasLegacyDoc`), Kunde ausgesperrt. Vor dem Cutover schließen.

**R5 — Studio-Route liefert in Produktion HTTP 404 (mittel, trivial zu fixen).**
`server/_core/static.ts:63–70` kennt `/onboarding/:token` nicht → Direktaufruf/Reload/geteilter Link bekommt Status 404 (index.html wird zwar geliefert, aber Crawler und manche Clients sehen 404).

**R6 — `LandingPage.tsx` blockiert die Löschung von `layouts/` (mittel).**
~1.200 LOC Showcase auf 7 v1-Layouts (§2.4). Ohne Umbau auf Pack-Previews lässt sich `PremiumLayoutsV2.tsx` nicht entfernen.

**R7 — Outreach-Pipeline erzeugt weiter v1-Websites (mittel).**
`outreachPipeline.ts:425–461` + `pipelineGenerationBridge.ts` + `routers.ts:4085–4138`. Wird `runWebsiteGeneration` gelöscht, ohne die Bridge umzuhängen, bricht der Admin-Outreach (Spec B §9 nennt das explizit als Risiko).

**R8 — Funnel-Telemetrie verschwindet (mittel).**
`onboarding.logStep` stirbt mit dem Chat, aber `onboarding.getStepEvents` wird von `WebsitesPage.tsx:1135` und `LeadsPage.tsx:396` angezeigt. Ohne v2-Ersatz stehen die Admin-Lead-Ansichten leer da.

**R9 — Vorschau-/Outreach-Links `/preview/:token` (mittel).**
`PreviewPage.tsx` patcht v1-Onboarding-Antworten ins Dokument und zeigt eine **hartcodierte, von `shared/pricing.ts` abweichende Add-on-Preisliste** (`:24–51`). Nach dem Cutover entweder auf `/preview-ssr/:token` umleiten oder auf reines `SiteRenderer`-Rendering reduzieren.

**R10 — Umami/Analytics (niedrig).**
`SitePage.tsx:26–37` injiziert das Umami-Skript clientseitig. Prüfen, ob `server/ssr/renderSite.tsx` das Skript ebenfalls einbaut — sonst verlieren SSR-ausgelieferte Seiten ihr Tracking, sobald der CSR-Pfad wegfällt.

**R11 — SEO/Sitemap (niedrig).**
`server/_core/index.ts:416–448` (dynamische `sitemap.xml`) und `server/seo/landingPages.ts` (2.403 LOC, 37 Branchen × 45 Städte) sind **layout-neutral** — nur `landingPages.ts:2116` erwähnt „Layout" im Fließtext. Kein technisches Risiko.

**R12 — `getIndustryProfile` / `shared/industryServices.ts` (niedrig).**
Noch von `routers.ts` (2×) und `server/industry.mapping.test.ts` benutzt. v2 hat `server/onboardingV2/suggest.ts`. Prüfen, ob die Branchenprofile für den Studio-Angebots-Vorschlag gebraucht werden, bevor gelöscht wird.

---

## 11. Vorgeschlagene Löschreihenfolge (sicher, jeder Schritt einzeln testbar)

**Phase 0 — Vorarbeiten (kein Löschen, muss vorher grün sein)**
1. `customer.updateWebsiteContent` guarden bzw. löschen (R4).
2. `SPA_ROUTES` in `server/_core/static.ts` um `/onboarding/:token` ergänzen (R5).
3. `CheckoutBar`/`createCheckout` für `status !== "preview"` sperren (§5.5).
4. `LegalPage.tsx` auf `websiteData.legal.*` umstellen (R2).
5. `SitePage.tsx` auf `SiteRenderer` + Inseln umstellen — oder Entscheidung „SSR verpflichtend" (R1).
6. `LandingPage.tsx`-Showcase auf Pack-Previews (`/dev/site-preview?pack=…&fixture=full`) umbauen (R6).
7. `outreachPipeline.ts` + `pipelineGenerationBridge.ts` + `routers.ts:4085–4138` auf `runWebsiteGenerationV2Job` umhängen (R7).
8. v2-Ersatz für `onboarding.logStep`-Events oder Admin-Ansichten anpassen (R8).

**Phase 1 — Routen umschalten (reversibel, kein Code weg)**
9. `StartPage.tsx:165/208` → `/onboarding/:token`.
10. Alle Server-Links auf `/onboarding/:token` (R3), inkl. Fix `lifecycleScheduler.ts:151/475` (Token statt ID).
11. `App.tsx`: `/preview/:token/onboarding` und `/websites/:id/onboarding` → Redirect auf Studio (`OnboardingChat` bleibt vorerst importiert).
12. `PB_LAYOUT_V2`-Bedingung in `routers.ts:1677` entfernen → v2 ist der einzige Generierungspfad; Flag aus der VPS-`.env`. **→ E2E-Probe: StartPage → Studio → Checkout.**

**Phase 2 — totes Zeug (risikofrei, sofort möglich)**
13. `ComponentShowcase.tsx` (1.437), `CustomerProfilePage.tsx` (382), `OnboardingWizard.tsx` (588) + Import `App.tsx:31`, `TemplatesPage.tsx` (871).
14. `layouts/PremiumLayout.tsx`, `FreshLayout.tsx`, `CraftLayout.tsx`, `TrustLayout.tsx` (461).
15. `routers.ts`: `mapCategoryToIndustryKey` (89), `buildVerifiedStats` (53), `onboarding.findEmail` (94), `onboarding.uploadPhoto` (36), `selfService.testEmail` (40), `customer.getChatSettings`/`updateChatSettings`.
16. Dashboard-Leichen: `AiContentEditor`, `DesignEditor`, `LayoutSwitcherCard`, `ContentFieldsAccordion` (~600).
17. `LAYOUT_FALLBACK_IMAGES` in `shared/layoutConfig.ts`.

**Phase 3 — Chat-Cluster**
18. `client/src/pages/OnboardingChat.tsx` (10.130) + `MacbookMockup.tsx` (252) + Route/Import in `App.tsx`.
19. `routers.ts`: `onboarding.generateText`, `suggestServices`, `logStep`, `saveStep`, `uploadLogo`, `getGmbPhotos`; `selfService.generateWebsiteAsync`, `updateCaptureStatus`, `saveCustomerEmail`, `sendLeadEmail`, `generateInitialContent`, v1-Zweig von `selectWebsiteTemplate`; `onboarding.complete` v1-Fragmente (v2-Pfad in `onboardingV2/checkout.ts` konsolidieren).

**Phase 4 — Dashboard**
20. `ContentEditorSplitView.tsx` (1.015) + Tab; `DesignStudio`/`LogoUploadCard`/`StructureEditor`/`ServicesEditor`/`LegalEditor`/Bildpicker/`TeamAddonSection`; `@shared/layoutConfig`-Import und `LAYOUT_*_DASH`; „Im Studio bearbeiten"-Links setzen.
21. `routers.ts`: `customer.applyAiEdit`, `confirmAiEdit`, `changeLayout`; `updateServices`/`updateDesign`/`updateAddons`/`saveTeamMembers`/`uploadLogoForWebsite` auf v2-`applyPatch` umstellen (Spec B §7.3, DRY mit dem Studio) — Guard bleibt als Netz.

**Phase 5 — Renderer & Alt-Mappings**
22. `WebsiteRenderer.tsx` v1-Zweig raus → `parseV2` Pflicht, Aufrufer auf `SiteRenderer`.
23. `client/src/components/layouts/PremiumLayoutsV2.tsx` (4.891) + `LayoutPreviewStandalone.tsx` + `LayoutOverviewPage.tsx` + Route/Nav.
24. `VariantPreviewPage.tsx` reduzieren oder löschen; `PreviewPage.tsx` auf SSR/`SiteRenderer` reduzieren.
25. `shared/layoutConfig.ts` auf `withOnColors` (+`ColorScheme`) eindampfen; `server/industryImages.ts`: `VARIANT_FAMILY_RANKINGS`, `getLayoutPool`, `getLayoutStyle`, `getLayoutVariants`, `getIndustryColorScheme` raus (Bild-Helper behalten).
26. `routers.ts`: `DESIGN_ARCHETYPES`, `buildIndustryContext`, `buildPersonalityHint`, `buildEnhancedPrompt`, `buildProcessSection`, `getFallbackWebsiteData`, `runWebsiteGeneration` v1-Rumpf, `website.generate`, `website.regenerate`.
27. `shared/types.ts`: `WebsiteData`/`WebsiteSection`/`DesignTokens` (+ ggf. `Addon`/`AVAILABLE_ADDONS`) entfernen.

**Phase 6 — Templates & Aufräumen**
28. `templates`-Router, `server/templateSelector.ts`, beide `templates.json`, Build-Copy in `package.json:9`, `template_uploads`-DB-Helper.
29. Tests aus §8.1 löschen/umschreiben; `npx vitest run` + `pnpm test:visual` (84 Pack- + Studio- + Islands-Baselines) grün.
30. Doku: `PB_LAYOUT_V2` aus den Specs streichen bzw. `2026-08-21-flag-aktivierung.md` §1–§5 als obsolet markieren; offene Punkte (§4.2 `prefersMenu`, §4.3 a11y/Perf, §7.5 Unterseiten-Add-on + Team-Panel) in den B4-Plan übernehmen.
31. Optional: Migration mit `DROP COLUMN`/`DROP TABLE` für §7.

---

## 12. LOC-Schätzung des Wegfalls

| Bereich | LOC gelöscht | LOC umgeschrieben |
|---|---|---|
| `client/src/components/layouts/**` | **5.352** | – |
| `client/src/pages/OnboardingChat.tsx` | **10.130** | – |
| `client/src/components/ContentEditorSplitView.tsx` | 1.015 | – |
| `CustomerDashboard.tsx` (8.038 → ~3.350) | ~4.700 | ~500 |
| Tote Seiten (`ComponentShowcase` 1.437, `TemplatesPage` 871, `OnboardingWizard` 588, `CustomerProfilePage` 382) | 3.278 | – |
| `LayoutPreviewStandalone` 227 + `LayoutOverviewPage` 330 | 557 | – |
| `MacbookMockup.tsx` | 252 | – |
| `LandingPage.tsx`-Showcase | – | ~1.200 |
| `WebsiteRenderer.tsx` v1-Zweig | ~120 | ~30 |
| `PreviewPage` / `VariantPreviewPage` / `SitePage` / `LegalPage` | ~300 | ~500 |
| **Client gesamt** | **≈ 25.700** | **≈ 2.200** |
| `server/routers.ts` | **≈ 4.044** | 700–900 |
| `server/templateSelector.ts` + `template-library/*.json` | ~270 | – |
| `server/industryImages.ts` (v1-Teil) | ~130 | – |
| `shared/layoutConfig.ts` (675 → ~40) | ~635 | – |
| `shared/types.ts` (v1-Typen) | ~80 | – |
| `outreachPipeline.ts` + `pipelineGenerationBridge.ts` | ~50 | ~40 |
| **Server/Shared gesamt** | **≈ 5.200** | **≈ 800** |
| Tests aus §8.1 | ~950 | ~440 |
| **GESAMT** | **≈ 31.850 LOC** | **≈ 3.400 LOC** |

Zum Vergleich bleibt v2 stehen: `client/src/components/site/**` 9.528 · `client/src/pages/onboarding-v2/**` ~2.760 · `server/onboardingV2/**` 4.967 (inkl. Tests) · `server/generationV2/**` 1.239 · `server/ssr/**` 1.246 · `shared/siteContract` + `shared/stylePacks` + `shared/onboardingV2` ~4.900.

**Netto:** Das Repo verliert rund **32.000 Zeilen v1-Code**, wovon **≈ 4.300 LOC bereits heute unerreichbar** sind (tote Seiten, tote Helper, tote Dashboard-Komponenten, nicht geroutete Admin-UI).
