# Spec: Plan B5 — Team-Add-on, Admin-Reste, Performance-Hebel

**Datum:** 2026-08-23 · **Status:** verbindlich (freigegeben 2026-08-23, Entscheidungen §5 wie empfohlen) · **Grundlage:** B4c-Ergebnis (`2026-08-23-b4c-ergebnis.md`, B5-Liste), B4c-Spec §3, Spec B §4/§9 (Team-Sektion, Add-ons), `shared/pricing.ts`.

## 1. Ziel
Das v2-Produkt um das bereits im Vertrag und in allen 14 Packs vorhandene **Team-Add-on** vervollständigen (Studio-Panel, buchbar, Webhook), die letzten **Admin-Altlasten** bereinigen (Pack-Anzeige, veralteter 79-€-CheckoutDialog, Statistik-Bug) und die in B4c gemessenen **Performance-Hebel** der Landingpage ziehen (Fonts, Chunking), plus die kleinen Nachzügler aus den Reviews. **Unterseiten-Add-on** ist bewusst **nicht** enthalten (eigene Spec B6 — Vertragsänderung `pages[]`, SSR-Routen, Navigation in 14 Packs, Preis/Seitentypen).

## 2. Umfang

### 2.1 Team-Add-on buchbar machen
- Stand: `TeamSchema` (`shared/siteContract/schema.ts`, Sektion `team` mit `members[{name, role?, imageUrl?}]`) existiert, alle Packs rendern `case "team"`; `shared/pricing.ts` führt `team` als Standard-Add-on (3,90 €/Monat), aber `BOOKABLE_ADDON_KEYS` schließt es aus; AddonsPanel zeigt „bald verfügbar".
- Neu: `team` in `BOOKABLE_ADDON_KEYS` aufnehmen; `onboardingV2.updateAddons`/`applyFeatureFlags`/Webhook behandeln `team` wie `gallery` (Sektion anlegen/entfernen, Spalten-Flag `addOnTeam`); **Team-Panel** im Studio als Unterbereich des Extras-Panels (kein neuer Checklisten-Punkt): Mitglieder hinzufügen/entfernen/sortieren (Name Pflicht, Rolle optional, Foto optional über den vorhandenen Upload-/Stockfoto-Weg aus dem Fotos-Panel, max. 12), Vorschau aktualisiert live; Dashboard-Add-ons-Tab zeigt Team wie Galerie (Kauf/Link ins Studio). Preis bleibt 3,90 €.
- Daten: `onboarding_responses.addOnTeamData` wird NICHT mehr gebraucht (Inhalt lebt in `websiteData.sections[team]`) → Spalte mit Migration 0028 droppen (nach Code-Umstellung).
- Tests: Schema-Patch (`applyPatch`), Router (`updateAddons` team), Panel-Komponententest, Playwright `studio.spec` +1 (Team anlegen → Vorschau zeigt Mitglied), Webhook-Test `team`-Flag.

### 2.2 Admin-Altlasten
- `client/src/pages/WebsitesPage.tsx`: Pack-Spalte (`websiteData.stylePackId` → Pack-Name, Fallback „v1/—"), Link „Im Studio öffnen" (`/onboarding/<token>`), `CheckoutDialog` mit 79-€-Pricing **entfernen** (Aktivierung läuft über den Stripe-Checkout des Kunden; manuelle Aktivierung über bestehendes `website.updateStatus`) — Preise nur noch aus `shared/pricing.ts`.
- `server/routers.ts` ~`umamiWebsiteId as any` (~Z. 2716): Statistik-Query liefert für v2 immer `null` → Spalte korrekt lesen, Test.
- `shared/stylePacks/zunft.ts` `.pb-zf-price`: Preis-Text auf `ink`/`accent` mit ≥ 4,5:1 umstellen und Rollenkommentar passend; Baseline.
- Dev-/Test-Login für das Dashboard: Dev-Route `/dev/dashboard-seed` (nur `NODE_ENV !== "production"`, analog `/dev/studio-seed`) erzeugt Kunde + Abo + Website und loggt per Magic-Link-Cookie ein → ermöglicht `a11y.spec` und E2E fürs Dashboard (Skip in `a11y.spec.ts` entfernen, Dashboard-Übersicht/Add-ons/Anfragen prüfen).

### 2.3 Performance-Hebel Landingpage (Ziel: LCP mobil < 2,5 s, JS auf `/` < 150 kB gzip)
- `client/src/index.css:~38`: Import von 25 Google-Font-Familien (v1-Rest) entfernen; Landing/Studio/Dashboard brauchen Inter/Plus Jakarta Sans/Space Grotesk (prüfen, was `index.html` schon preloaded); v2-Packs laden ihre Fonts im SSR-Head; CSR-Fallback `SitePage` lädt Pack-Fonts per `<link>` aus der Verfassung.
- Chunking (`vite.config.ts` manualChunks + `client/src/App.tsx`): `TooltipProvider`/Radix aus dem Entry (nur Dashboard/Admin), `LandingPage`/`StartPage`/`SitePage`/`LegalPage` lazy, framer-motion via `LazyMotion` + `m` (Landing/Studio), `shared/stylePacks` + `gmbCategories` aus dem Landing-Pfad (PackShowcase braucht nur id/name/essence/accent → generierte kleine Liste).
- Messung vorher/nachher mit Lighthouse (mobil + Desktop, Produktions-Build); Budget-Status ehrlich dokumentieren.

### 2.4 Pack-Identität (Ruling aus B4c)
- Für `werkbank`, `marktplatz`, `schimmer` prüfen, ob „dunkler Text (`ink`) auf Original-Akzent" den Kontrast ≥ 4,5:1 erfüllt **und** die ursprüngliche Signalfarbe zurückbringt; wenn ja → Akzent zurück auf Original, CTA-Textfarbe je Pack in der Verfassung/CSS festlegen; Baselines + Farbassertion (`packs.spec`) + Vorschauen/SVGs neu. Wenn nein → Stand bleibt, Ruling dokumentieren.

### 2.5 Dark-Mode-a11y der Landingpage
- `a11y.spec.ts`: Variante `/` mit `isDark` (Toggle oder `prefers-color-scheme: dark`) → 0 critical/serious; Kontrastfixes nur in den Dark-Klassen.

### 2.6 Abschluss
- Gates wie B4c (vitest, tsc 0, build, Playwright alle Specs inkl. a11y mit Dashboard), `BETRIEB-V2.md` (Migration 0028, Dev-Seeds), Ergebnis-Doku; Prod-Deploy + Migration 0028 nach Merge mit Freigabe.

## 3. Nicht im Umfang (→ B6)
- Unterseiten-Add-on (`pages[]` im Vertrag, SSR `/site/:slug/:page`, Navigation in allen Packs, Panel, Preis).
- Dashboard-Redesign; GMB-Kategorien/Stadt-Autocomplete (Memory-Backlog); Outreach-Feinschliff.

## 4. Erfolgskriterien
- Team-Add-on im Studio buchbar und pflegbar; nach Zahlung sichtbar (Webhook → Sektion + Flag); `addOnTeamData` gedroppt.
- Admin-Website-Liste zeigt Pack + Studio-Link; kein 79-€-Dialog; Kundenstatistik liefert Werte.
- Lighthouse mobil `/`: LCP < 2,5 s; JS auf `/` < 150 kB gzip (oder dokumentierte Restursache).
- `a11y.spec` deckt Dashboard + Dark-Mode ab, 0 critical/serious.
- Alle Gates grün, tsc 0.

## 5. Offene Entscheidungen (bitte absegnen)
1. Team als Unterbereich des Extras-Panels (Empfehlung) statt eigenem 7. Checklisten-Punkt.
2. Team-Preis 3,90 €/Monat (wie Galerie/Menü/Preisliste) — ok?
3. Unterseiten wirklich nach B6 (Empfehlung: ja — größter Einzelposten, eigene Spec).
4. Pack-Identität (2.4): zurück zur Original-Signalfarbe mit dunklem CTA-Text, wenn kontrastkonform (Empfehlung: ja für werkbank/marktplatz/schimmer).
5. Admin-CheckoutDialog ersatzlos entfernen (Empfehlung) oder an `shared/pricing.ts` anbinden?
