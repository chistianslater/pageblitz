# Spec: Plan B4c — Polish & Konsolidierung nach dem Cutover

**Datum:** 2026-08-23 · **Status:** verbindlich (freigegeben 2026-08-23, alle vier Entscheidungen §5 wie empfohlen) · **Grundlage:** Cutover-Spec §2.8 (aufgeschobene Punkte), B4b-Ergebnis (`2026-08-23-b4b-ergebnis.md` inkl. Nachtrag), Spec B §7.4/§8.4/§8.5/§9.

## 1. Ziel
Das v2-System nach der Löschung (main 0b1257f) technisch sauber ziehen: letzte v1-Reste (Farbkette, DB-Spalten, tote Dateien) weg, bekannte Lücken schließen (Rechtsseiten-Auth, Test-Erwartungen, SSR-Pfade), a11y/Perf auf ein messbares Niveau bringen. **Keine neuen Produkt-Features** — Team-Panel, Unterseiten-Add-on und Dashboard-Redesign bekommen einen eigenen Plan (B5), weil sie Produktentscheidungen brauchen (siehe §3/§5).

## 2. Umfang (verbindlich, in dieser Reihenfolge)

### 2.1 Farbkette auf Pack-Palette (ersetzt `colorScheme`)
- `LegalPage` (CSR-Rechtsseiten) liest die Primärfarbe aus `getConstitution(doc.stylePackId).palette` (Akzent, wie `PackShowcase.getAccentColor`) statt aus `generatedWebsites.colorScheme`.
- Danach entfernen: colorScheme-Auto-Migration in `customer.getMyWebsites`, `getIndustryColorScheme`, `INDUSTRY_COLORS` (`shared/industryImages.ts`), `withOnColors`/`shared/layoutConfig.ts` (Datei), `ColorScheme`-Typ (`shared/types.ts`), `shared/colorContrast.ts` + `server/contrast.test.ts` — **sofern** kein v2-Konsument bleibt (grep in `server/ssr`, `client/src/components/site`; falls `colorContrast.ts` von v2 genutzt wird, bleibt es und der Test bekommt korrigierte Erwartungen).
- `website.get` liefert `colorScheme` dann nicht mehr; Spalte wird in §2.2 gedroppt.

### 2.2 DB-Drops (handgeschriebene Migration `drizzle/0027_drop_v1_columns.sql`, Schema + Helfer nachziehen)
- `generated_websites`: `hero_image_url`, `about_image_url`, `add_on_team_data`, `contact_form_fields`, `color_scheme` (nach §2.1), `layout_style`, `layout_version` (vorher Schreibstellen entfernen: `server/onboardingV2/router.ts` Pack-Spiegel, `server/onboardingV2/devSeed.ts`; Admin-Listen lesen den Pack aus `websiteData.stylePackId`).
- Tabelle `template_uploads` droppen.
- `onboarding_responses`: v1-Inhaltsspalten (`tagline`, `description`, `founded_year`, `team_size`, `usp`, `top_services`, `target_audience`, `faq_items`, `hero_photo_url`, `about_photo_url`, `logo_url`, `brand_color`, `brand_secondary_color`, `section_order`, `hidden_sections`) — Spread in `db.createOnboarding` entfernen, dann droppen. **Behalten:** `business_name`, `business_category`, `studio_progress`, alle Kontakt-/Rechts-/E-Mail-Felder, die `regenerateLegalPages`/`lifecycleScheduler`/Admin lesen (je Spalte grep vor dem Drop).
- Prod-Hinweis: Migration ist destruktiv → erst Backup (`mysqldump` der beiden Tabellen), Doku in `BETRIEB-V2.md`.

### 2.3 Rechtsseiten-Regenerierung absichern
- `onboarding.regenerateLegalPages`: nur Besitzer (Studio-Ownership über Token oder eingeloggter Abo-Inhaber) oder Admin; Rückgabe `{ regenerated: true }`; `LegalPage` wertet das aus (tsc-Altfehler `LegalPage.tsx:27/31` verschwinden).

### 2.4 Toter Code (einmalig `npx knip` ausführen, Ergebnis als Liste im Plan)
- Bekannt: `GoogleRatingBadge.tsx`, `IndustryIcon.tsx` + `shared/industryIcons.ts`, `ManusDialog.tsx`, `Map.tsx`, `hooks/useAnimations.ts`, `lib/industryStats.ts`, `server/_core/dataApi.ts`, `server/_core/voiceTranscription.ts`, `server/legalGenerator.ts patchWebsiteData`, `lifecycle.resolveSeedByPreviewToken`, `server/industryImages.ts getContrastColor`, ungenutzte Importe (`countBusinesses`, `like`/Typen in `db.ts`). Behalten-Liste aus B4b gilt weiter.

### 2.5 SSR/CSR-Konsistenz
- `SSR_ALLOWED_PATHNAMES` (`server/ssr/routes.ts`): `/site/:slug/<unbekannt>` liefert SSR-404 (HTML, `noindex`) statt SPA-Fallback; `SitePage` bleibt CSR-Notbremse für `SSR_SITES=off`.
- Demo-Rechtsseiten: `/demo/:pack/impressum|datenschutz` rendern die Fixture-Rechtsseiten (Links in den Demo-Footern funktionieren; `noindex, nofollow`).
- `og:image` im SSR-Head (Hero-Bild der Seite), Meta-Description aus `seo.description`.

### 2.6 Landingpage-Performance
- `PackShowcase`: statt 14 sofort geladener iframes zunächst statische Vorschaubilder (14 PNGs, SSR-seitig per Playwright-Skript unter `scripts/` erzeugt und im Repo abgelegt, ~60 KB je Bild) mit Klick → iframe/neuer Tab; LCP/INP der Landingpage mit Lighthouse vorher/nachher dokumentieren (Budget: LCP < 2,5 s mobil simuliert, JS < 150 kB gzip für `/`).

### 2.7 A11y-Pass (messbar)
- Playwright + `@axe-core/playwright` auf Studio (Checkliste, jedes Panel), `/demo/:pack` für alle 14 Packs, Landingpage, Dashboard-Übersicht: **0 critical/serious**; CTA-Kontraste `marktplatz`/`schimmer` ≥ 4,5:1 per Ton-Anpassung innerhalb der Verfassung (Baselines neu). Tastaturbedienung Checkliste/Panels/Inseln (Fokusfalle im Panel).
- `prefersMenu`-Flag in die Verfassungen der Gastro-Packs → Angebot-Panel startet im Speisekarten-Modus.

### 2.8 Abschluss
- Gates wie B4a/B4b (vitest, tsc — Ziel ≤ 10 Altfehler —, build, Playwright alle Specs + neue axe-Spec), `BETRIEB-V2.md` (Migration 0027, Backup-Hinweis), Ergebnis-Doku.

## 3. Nicht im Umfang (→ Plan B5 „Features")
- **Team-Panel** (Add-on `team` buchbar machen: Panel im Studio, Sektion `team` im Vertrag rendern, Preis) — Produktfrage: Preis, ob Fotos Pflicht, Reihenfolge in der Checkliste.
- **Unterseiten-Add-on** (`features.subpages[]`, SSR-Route `/site/:slug/:page`, Panel) — Produktfrage: welche Seitentypen (Leistungen-Detail, Über uns, Galerie?), Preis, Navigation.
- **Dashboard-Redesign** (Optik/IA des schlanken Dashboards) — erst nach ersten zahlenden Kunden.
- Outreach-Pipeline-Feinschliff, GMB-Kategorien, Stadt-Autocomplete (Memory-Backlog).

## 4. Erfolgskriterien
- `grep -rn "colorScheme\|layoutStyle\|layoutVersion\|heroImageUrl\|aboutImageUrl\|contactFormFields\|addOnTeamData\|template_uploads" client server shared` → 0 Treffer außerhalb Migrationsdateien; Schema entspricht der DB.
- `npx knip` ohne Befunde in `client/src`, `server`, `shared` (oder dokumentierte Ausnahmen).
- axe: 0 critical/serious auf allen geprüften Seiten; Lighthouse `/` mobil: LCP < 2,5 s, JS < 150 kB gzip.
- Alle bestehenden Playwright-Baselines grün (Kontrast-Anpassungen mit neuen Baselines).
- tsc ≤ 10 Altfehler.

**Stand B4c, `e0da646`+:** grep-Kriterium ✅ (Ausnahme `addOnTeamData`
bewusst, Team-Panel → B5); knip ✅ mit dokumentierten Ausnahmen; axe ✅ (0
critical/serious, Dashboard `test.skip`); Lighthouse ❌ (LCP 3,1 s statt
< 2,5 s, JS ~306 kB statt < 150 kB gzip, pre-existing/App.tsx-Chunking →
B5); Playwright-Baselines ✅; tsc ✅ **0** (deutlich unter dem Ziel ≤ 10).
Details, Messwerte und Rulings: `docs/superpowers/specs/2026-08-23-b4c-ergebnis.md`.

## 5. Offene Entscheidungen (bitte absegnen)
1. B4c ohne Team-Panel/Unterseiten — beides nach B5 (Empfehlung: ja, sonst vermischt sich Aufräumen mit Produktdesign).
2. DB-Drops in B4c tatsächlich ausführen (inkl. Prod-Migration mit Backup) oder nur Code-seitig vorbereiten und Drop bis nach den ersten Kunden warten? Empfehlung: ausführen — null zahlende Kunden, Backup reicht.
3. Landingpage-Showcase: statische Vorschaubilder + Klick (Empfehlung) oder iframes behalten und nur lazy-Verhalten verbessern?
4. `prefersMenu`: nur `gusto` oder alle Packs mit Gastro-Branchenprofil (Vorschlag: alle Gastro-Packs)?
