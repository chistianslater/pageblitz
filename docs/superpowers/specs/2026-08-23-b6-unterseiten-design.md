# Spec: Plan B6 — Unterseiten-Add-on, Add-on-Konsistenz, Statistik, Perf-Rest

**Datum:** 2026-08-23 · **Status:** verbindlich (freigegeben 2026-08-23, Entscheidungen §5 wie empfohlen; zusätzlich: Prod-Build-Smoke-Spec als Gate) · **Grundlage:** B5-Ergebnis (`2026-08-23-b5-ergebnis.md`, B6-Liste), Spec B §4/§9 („Unterseiten = Plan-Inhalt mit eigener Route im SSR"), `shared/pricing.ts`, `shared/siteContract/schema.ts`, `server/ssr/routes.ts`, `client/src/components/site/engine.ts`.

## 1. Ziel
Das letzte angekündigte Add-on — **Unterseiten** — als echtes Produkt liefern (Vertrag, SSR-Routen, Navigation in allen 14 Packs, Studio-Panel, Preis), dabei die **Add-on-Logik auf eine Quelle der Wahrheit** bringen (Flag ⇔ Inhalt ⇔ Abrechnung; Galerie/Menü/Team gleich behandelt), die **Kundenstatistik** wieder zum Laufen bringen (Umami-Provisionierung im v2-Pfad) und die verbliebenen **Perf-Hebel** ziehen. Kein Dashboard-Redesign.

## 2. Umfang

### 2.1 Unterseiten-Add-on (`subpages`)
- **Vertrag** (`shared/siteContract/schema.ts`): neues optionales Feld `pages: Page[]` mit `Page = { slug: z.string().regex(/^[a-z0-9-]{2,40}$/), title: string ≤ 60, navLabel?: string ≤ 24, seo: { title, description }, sections: Section[] (min 1; erlaubt: neue Sektion `pageHeader` (Titel + Einleitung), `services`, `about`, `gallery`, `faq`, `contact`, `testimonials`, `pricelist`, `menu`) }`, max. 5 Pages; reservierte Slugs (`impressum`, `datenschutz`, `start`, `api`, …) verboten; `pages[].slug` unique. `assertV2SafeWrite` bleibt (Schreiben nur über Patches). `features.subpages: boolean` als Flag (wie aiChat/booking) + `ADDON_KEYS` erhält `subpages` (Preis: **3,90 €/Monat pauschal** für bis zu 5 Unterseiten — Entscheidung §5).
- **SSR** (`server/ssr/routes.ts`, `renderSite.tsx`): erlaubte Pfade dynamisch: `/`, `/impressum`, `/datenschutz` + `/<page.slug>` je Page im Dokument; Cache-Key enthält Pfad (bereits), `invalidateSsrCache(slug)` löscht alle Page-Pfade (Prefix-Scan über `siteHtmlCache` statt fester Liste); unbekannte Pfade → 404 wie heute; `renderSiteHtml` rendert für eine Page: Head (Page-SEO, canonical `…/<slug>`), Navigation mit Startseiten-Ankern **und** Page-Links, Page-Sektionen, Footer; Startseite erhält die Page-Links in der Nav. Demo-Route `/demo/:pack/:page` für Fixture-Pages (Fixture „full" bekommt 1–2 Beispielseiten).
- **Packs** (`client/src/components/site/packs/*/index.tsx`, `engine.ts`): Nav-Renderer bekommt `navItems: { href, label }[]` (Startseite: Anker über `SECTION_ANCHORS`; Unterseiten: Anker-Links zeigen auf `<basePath>/#anker`, Page-Links auf `<basePath>/<slug>`); neues Modul `pageHeader` je Pack (Titel + Einleitung in Pack-Typografie); 14 Packs × (Nav + pageHeader) — Playwright `packs.spec` erweitert (Fixture „full" mit Page, Desktop-Screenshot je Pack) + Farbassertion unverändert.
- **Studio**: Add-on `subpages` im Extras-Panel (Schalter + Preis); bei aktivem Flag Unterbereich „Unterseiten" (Entscheidung §5: kein 7. Checklisten-Punkt): Seite anlegen (Titel → Slug-Vorschlag, änderbar, max. 5), Sektionen aus Vorlagen hinzufügen (Leistungen-Detail, Über uns, Galerie, FAQ, Kontakt), Texte bearbeiten (bestehende Editoren der Texte-/Angebot-Panels wiederverwenden), Reihenfolge, löschen; Vorschau-iframe wechselt auf die Page (`/preview-ssr/<token>/<slug>`); KI-Chat darf Page-Texte ändern (`aiEdit`-Scope um `pages[i]` erweitern, gleiche Sicherheitsregeln). Patch `PagesPatchSchema` + `applyPages` + `onboardingV2.updatePages`.
- **Dashboard/CSR**: Add-ons-Tab zeigt `subpages` wie Galerie/Team; `SitePage`-CSR-Fallback Route `/site/:slug/:page` (lazy) rendert die Page über `SiteRenderer` mit `pageSlug`-Prop; SPA-Regex in `static.ts` entsprechend.
- **Generierung**: `generateSiteContent` erzeugt keine Pages (Add-on-Inhalt entsteht im Studio); Dokumente ohne `pages` bleiben gültig.

### 2.2 Add-on-Konsistenz (eine Quelle der Wahrheit)
- Quellen heute: `onboarding_responses.addOn*` (Studio-Toggle, Checkout-Summe), `subscriptions.addOns` (Stripe-Kauf), `generatedWebsites.addOn*` + `websiteData.features` (Rendering/Inseln). Ziel: **`websiteData.features` + `subscriptions.addOns` sind maßgeblich**; `onboarding_responses.addOn*` ist nur Entwurf vor dem Checkout. Nach Checkout löst ein Studio-Toggle den Stripe-Update aus (`subscriptions.addOns` + Stripe-Subscription-Items anpassen) — Entscheidung §5.
- **Galerie/Menü/Preisliste/Team/Unterseiten gleich**: nicht gebuchter Inhalt wird **nicht gerendert** (SSR + CSR prüfen das Flag; Sektion bleibt im Dokument → kein Datenverlust) — ersetzt „Sektion entfernen" (Team-Ruling B5) durch „ausblenden"; `PhotosPanel` pflegt Galerie nur bei aktivem Flag (sonst Hinweis + Schalter); Gastro-Generierung: Menü-Add-on für Gastro-Packs im Studio vorausgewählt (Preis sichtbar, abwählbar → dann Leistungen-Sektion aus dem Generator) — Entscheidung §5.
- Tests: Matrix Flag × Sektion × Renderer (SSR/CSR), Checkout-Summen, Webhook, Stripe-Update gemockt.

### 2.3 Kundenstatistik (Umami-Provisionierung)
- Beim Aktivwerden einer Website (Webhook/Setup-Flow) Umami-Website anlegen (`registerUmamiWebsite` aus der Git-Historie wiederherstellen, z. B. `git show 0b1257f^:server/umami.ts`), `generatedWebsites.umamiWebsiteId` schreiben; Umami-Script im SSR-Head nur für aktive Sites mit ID (cookielos → ohne Consent zulässig, Hinweis in der Datenschutz-Vorlage — Entscheidung §5); Dashboard-Statistik zeigt Werte; Test mit gemocktem Umami-Client.

### 2.4 Perf-Rest (Landingpage)
- Slot-freier `Button` für Landing-Komponenten (Radix raus aus `/`), `LazyMotion` mit async `features`-Loader, Inter/Plus Jakarta Sans self-hosted Subset-WOFF2 (`client/public/fonts`, `@font-face` `swap`, `preload as=font` nur Regular/Semibold; Google-Fonts-Link für die Landing entfernen), GTM/Rybbit erst nach Consent bzw. `requestIdleCallback`, `modulepreload` für den Landing-Chunk (LandingPage lazy + Preload) prüfen; Pack-Fonts im CSR-Fallback nicht doppelt anfordern. Ziel LCP < 2,5 s mobil, JS < 150 kB gzip — Messung vorher/nachher, ehrliche Doku.

### 2.5 Pack-Identität (`accent-text`)
- `PackConstitution.palette` erhält optional Rolle `accent-text` (dunkler Ton für Kleintext); `toCssVars` → `--pb-accent-text`; Module, die `var(--pb-accent)` als Kleintext nutzen, umstellen; danach werkbank/marktplatz/schimmer: Akzent zurück auf Original (CTA-Text `ink`), axe ≥ 4,5:1 überall, Baselines/Vorschauen/SVGs neu.

### 2.6 Abschluss
- Gates wie B5 (tsc 0, vitest, build, Playwright alle Specs + Page-Screenshots), `BETRIEB-V2.md` (Unterseiten, Add-on-Logik, Umami), Ergebnis-Doku; voraussichtlich keine DB-Migration (`pages` im JSON, `subscriptions.addOns` JSON).

## 3. Nicht im Umfang
- Dashboard-Redesign, Outreach-Feinschliff, GMB-Kategorien/Stadt-Autocomplete, Blog/SEO-Inhalte (Memory-Backlog).

## 4. Erfolgskriterien
- Kunde legt im Studio bis zu 5 Unterseiten an; sie erscheinen in der Navigation aller 14 Packs; SSR liefert `/site/:slug/:page` mit eigener SEO; Demo zeigt eine Beispielseite; Preis im Checkout; Webhook aktiviert.
- Nicht gebuchte Add-on-Inhalte werden nirgends gerendert; Studio/Dashboard/Stripe zeigen denselben Add-on-Stand.
- Dashboard-Statistik zeigt Besucherzahlen für aktive Sites.
- Lighthouse mobil `/`: LCP < 2,5 s, JS < 150 kB gzip (oder dokumentierte Restursache).
- tsc 0, alle Gates grün.

## 5. Offene Entscheidungen (bitte absegnen)
1. Unterseiten-Preis **3,90 €/Monat pauschal (bis 5 Seiten)** statt je Seite (Empfehlung: pauschal).
2. Unterseiten als **Unterbereich im Extras-Panel** (wie Team), Checkliste bleibt 6 Punkte (Empfehlung).
3. Add-ons nach Checkout: **Studio-Toggle löst Stripe-Update aus** (Empfehlung) oder nur Dashboard/Stripe-Portal?
4. Nicht gebuchte Sektionen **ausblenden statt löschen** (Empfehlung; Team-Verhalten angleichen).
5. Gastro-Packs: Menü-Add-on im Studio **vorausgewählt** statt Menü kostenlos (Empfehlung).
6. Umami cookielos **ohne Consent** einbinden, Hinweis in der Datenschutz-Vorlage (Empfehlung: ja).

---

**Stand B6, `8558a84`+:** Alle §2-Punkte umgesetzt, §5 wie empfohlen (1–6).
§4-Erfolgskriterien: Unterseiten ✅, Add-on-Konsistenz ✅ (dokumentierte
Lost-Update-Lücke, selbstheilend), Kundenstatistik ✅, Lighthouse mobil `/`
**LCP 1,8 s / JS ~134 kB gzip ✅** (erstmals beide Budgets), tsc 0 / alle
Gates grün ✅. Zusätzlich (Zuruf während der Ausführung): Landingpage-Neubau
im Studio-Look, Space Grotesk als einzige Systemschrift, 42 echte Bilder für
die 14 Demo-Packs. Details, Rulings, Prod-Deploy-Schritte:
`docs/superpowers/specs/2026-08-23-b6-ergebnis.md`.
