# Betrieb v2 (Stand: Cutover, August 2026)

Kurzreferenz für Build, Deploy, Migrationen und Routen, nachdem Onboarding v2
Standard wurde (Plan B4a). Details siehe die verlinkten Specs; dieses Dokument
ersetzt keine davon.

## 1. Cutover-Stand

Das Produkt läuft vollständig auf v2 — es gibt keinen Flag-Zweig mehr:

- **Style Packs (14)**: `shared/stylePacks/` (`werkbank`, `patina`, `kanzlei`,
  `salon-noir`, `morgenlicht`, `marktplatz`, `gusto`, `landgut`, `atelier`,
  `klarwerk`, `verve`, `zunft`, `schimmer`, `fundament` — Liste in
  `shared/siteContract/schema.ts`, `PACK_IDS`).
- **Site-Contract (strict)**: `shared/siteContract/schema.ts`
  (`WebsiteDataV2Schema`, Zod, `.strict()`).
- **SSR**: `server/ssr/` (`renderSite.tsx`, `routes.ts`, `islandsBundle.ts`).
- **Studio**: Kunden-Editor unter `/onboarding/:token` —
  `client/src/pages/onboarding-v2/` (Client), `server/onboardingV2/` (Server:
  `router.ts`, `routerAi.ts`, `routerCommerce.ts`, `routerContent.ts`,
  `state.ts`, `checkout.ts`, `aiEdit.ts`, `suggest.ts`, `ownership.ts`).
- **Generierung v2**: `server/generationV2/runJob.ts`
  (`runWebsiteGenerationV2Job`). `runWebsiteGeneration` (v1) existiert seit
  Plan B4b **nicht mehr** — alle Aufrufer (`website.generate`,
  `outreach.queueBusinesses`, `server/outreachPipeline.ts`,
  `onboardingV2.ensureGeneration`) rufen `runWebsiteGenerationV2Job` direkt
  auf; der alte v1-Prompt-Rumpf (`DESIGN_ARCHETYPES`, `buildEnhancedPrompt`
  usw.) ist gelöscht.
- **`PB_LAYOUT_V2` existiert im Code nicht mehr** (Flag entfernt, Cutover
  Task 3).
- **`website.generate` (Admin) ist asynchron**: legt Website (`status:
  "preview"`, `websiteData: null`) + `generation_jobs`-Eintrag an und stößt
  `runWebsiteGenerationV2Job(jobId, websiteId)` fire-and-forget an —
  Rückgabe `{ websiteId, jobId, previewToken, slug }` sofort, ohne auf die
  Generierung zu warten (vorher: synchroner v1-LLM-Aufruf im Request).

**Plan B4b (Löschung des v1-Systems) ist abgeschlossen** (Stand `f74f700`):
Chat (`OnboardingChat.tsx`), v1-Layouts/-Renderer
(`client/src/components/layouts/`), v1-Generierungsrumpf, `templates`-Router
+ `server/templateSelector.ts`, v1-`onboarding.*`/`selfService.*`-Prozeduren
sind gelöscht. Details, Gates und offene Reste: Ergebnis-Dokument
`docs/superpowers/specs/2026-08-23-b4b-ergebnis.md`.

Specs: `docs/superpowers/specs/2026-08-21-onboarding-v2-design.md`,
`docs/superpowers/specs/2026-08-22-cutover-design.md`,
`docs/superpowers/specs/2026-08-21-flag-aktivierung.md` §6/§7 (Studio- bzw.
Inseln-/Add-on-Vorbereitung, weiterhin aktuell; §1–§5 sind historisches
Protokoll der PB_LAYOUT_V2-Übergangsphase).

## 2. Build & Start

- `npm run dev` — Dev-Server (`tsx watch server/_core/index.ts`).
- `npm run build` — `vite build` (leert `dist/public/`) → **danach**
  `npm run build:islands` (Reihenfolge ist bewusst so, sonst löscht Vite das
  Inseln-Bundle wieder; abgesichert durch `server/ssr/buildOrder.test.ts`) →
  esbuild-Bundle des Servers nach `dist/`. Seit Plan B4b (Templates-Cluster
  entfernt) kopiert der Build kein `template-library/templates.json` mehr
  nach `dist/` — der Schritt ist ersatzlos aus dem `build`-Skript raus.
- `npm run build:islands` — `node scripts/build-islands.mjs`: baut
  `client/src/site-islands/main.tsx` per esbuild zu
  `dist/public/islands/site-islands.<hash>.js` (Content-Hash) + schreibt
  `dist/public/islands/manifest.json`. `server/ssr/islandsBundle.ts`
  (`getIslandsBundlePath()`) liest das Manifest gecacht; ohne lesbares
  Manifest (Dev ohne vorherigen `build:islands`, Tests) Fallback auf den
  ungehashten Namen `site-islands.js`.
- `npm run check` — `tsc --noEmit`.
- `npm run test` — `vitest run`.
- `npm run test:visual` / `test:visual:update` — Playwright.
- Lokaler Dev-Server baut das Inseln-Bundle **nicht** automatisch — vor
  Playwright-Läufen oder manuellem Testen der Kundenseiten-Vorschau einmal
  `npm run build:islands` ausführen.
- Deploy: PM2 + Nginx auf dem Hostinger-VPS, `npm run build && pm2 restart
  pageblitz` — Details in `HOSTINGER-SETUP.md` / `VPS-MIGRATION.md`.

## 3. Datenbank / Migrationen

- Handgeschriebene SQL-Migrationen sind Konvention seit `0013_*` (aktuell bis
  `0026_subscription_checkout_email.sql`, davor `0025_studio_progress.sql`).
  Es gibt **kein** `drizzle/README`; `npx drizzle-kit generate` **nicht**
  verwenden — das Journal (`drizzle/meta/_journal.json`) ist seit `0012` nicht
  fortgeschrieben, ein `generate`-Lauf würde gegen einen veralteten Snapshot
  diffen.
- `package.json`-Skript `db:push` (`drizzle-kit generate && drizzle-kit
  migrate`) spiegelt diese Konvention aktuell **nicht** exakt — für neue
  Migrationen von Hand eine `NNNN_beschreibung.sql`-Datei anlegen und
  committen, keinen Generator laufen lassen.
- VPS-Einspielung: keine Automatisierung, manuell per `mysql`-Client
  (`ssh -i ~/.ssh/claude_pageblitz root@76.13.147.95`, dann `mysql -u <user>
  -p <db> < /root/pageblitz/drizzle/NNNN_*.sql`).
- Lokale Dev-DB: Docker-Container `pageblitz-mysql` (Image `mysql:8.4`,
  Runtime Colima — `colima start`, dann `docker start pageblitz-mysql` falls
  gestoppt). Schema-Abgleich lokal per `npx drizzle-kit push --force`
  (spiegelt das aktuelle `drizzle/schema.ts` direkt, unabhängig vom
  veralteten Journal — Alternative zum Abspielen aller `NNNN_*.sql` von Hand).

## 4. Umgebungsvariablen & Mock-Flags

`PB_LLM_MOCK=1` (nur wenn zusätzlich `NODE_ENV !== "production"`): überspringt
den LLM-Aufruf und liefert deterministische Fixtures.
- `server/generationV2/generateSiteContent.ts` — Generierung liefert ein
  festes Dokument statt eines LLM-Aufrufs.
- `server/onboardingV2/aiEdit.ts` — Studio-KI-Chat/Edit liefert ein
  deterministisches Ergebnis statt eines LLM-Aufrufs.

`PB_LAYOUT_V2` existiert nicht mehr.

Weitere relevante Env-Vars (Namen + Zweck, keine Werte hier — siehe
`.env.example` für den bekannten Kern-Satz, weitere s. u.):

| Var | Zweck |
|---|---|
| `DATABASE_URL` | MySQL-Verbindung |
| `JWT_SECRET` | Session-/Token-Signierung |
| `APP_BASE_URL` / `APP_URL` / `BASE_URL` | Basis-URL für Links (E-Mails, Redirects) |
| `STRIPE_SECRET_KEY` | Stripe-API |
| `STRIPE_WEBHOOK_SECRET` | Signaturprüfung `handleCheckoutCompleted` |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Transaktions-/Lifecycle-Mails |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` / `R2_PUBLIC_URL` | Objekt-Storage (Cloudflare R2, S3-kompatibel — nicht AWS S3) |
| `GOOGLE_PLACES_API_KEY` | GMB-Suche / Orts-Autocomplete |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` | Google OAuth |
| `HUNTER_API_KEY` | E-Mail-Recherche (Outreach) |
| `UNSPLASH_ACCESS_KEY` | Stock-Bilder |
| `SSR_SITES` | `"off"` deaktiviert Kundenseiten-SSR (Client rendert dann selbst) |
| `UMAMI_URL` / `UMAMI_USERNAME` / `UMAMI_PASSWORD` | Analytics |
| `BACKUP_API_URL` / `BACKUP_API_KEY` | Backup-Trigger |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `OWNER_OPEN_ID` | Admin-Zugang |
| `OAUTH_SERVER_URL` / `VITE_APP_ID` / `BUILT_IN_FORGE_API_URL` / `BUILT_IN_FORGE_API_KEY` | Plattform-/Build-Infrastruktur |

`.env.example` im Repo-Root führt nur einen Teilsatz davon; die Tabelle oben
ist aus `process.env.*`-Vorkommen in `server/` und `shared/` erhoben.

## 5. URLs / Routen

- **Studio**: `/onboarding/:token` (+ `?panel=<ChecklistItemId>`, IDs aus
  `shared/onboardingV2/checklist.ts`: `style`, `photos`, `texts`, `offer`,
  `legal`, `addons`).
- **SSR-Vorschau**: `/preview-ssr/:token` — öffentlich, ohne Auth (Token ist
  das Geheimnis, `nanoid(32)`), `noindex` + `Cache-Control: no-store`.
- **Legacy-Redirects** (`server/ssr/routes.ts`, `client/src/App.tsx`):
  - `/preview/:token` → serverseitig 302 auf `/onboarding/:token` (Studio,
    nicht `/preview-ssr/:token` — die reine SSR-Vorschau hat keinen CTA, das
    Studio zeigt Vorschau + CheckoutBar bzw. bei v1-Dokument die LegacyCard
    „Website neu erstellen").
  - `/preview/:token/onboarding` → SPA-Redirect auf `/onboarding/:token`.
  - `/websites/:id/onboarding` → `LegacyWebsiteRedirect`-Komponente lädt
    `website.get({id})` und leitet auf `/onboarding/<previewToken>` um
    (Fehlerfall → `/my-website`).
- **Demo-Route**: `/demo/:pack` (Regex `[a-z0-9-]+`, nur bekannte Pack-IDs),
  rendert Fixture `"full"` des Packs, `X-Robots-Tag: noindex, nofollow`,
  `Cache-Control: public, max-age=3600`; `/demo/:pack/impressum|datenschutz`
  rendert dieselbe Fixture mit einem festen Platzhalter-Rechtstext
  (`DEMO_LEGAL_NOTICE` in `server/ssr/routes.ts`, Fixtures haben kein
  `legal`-Feld) — gleiches `noindex, nofollow`/`Cache-Control` wie `/demo/:pack`.
- **Dev-Vorschau**: `/dev/site-preview?pack=&fixture=full|minimal|features` —
  nur außerhalb `production` (404 sonst).
- **Kunden-Sites**: `/site/:slug` (Pfadform) und Subdomain
  `<slug>.pageblitz.de` (`getCustomerSubdomainFromHost`) — beide über
  `handleCustomerSiteSsr` in `server/ssr/routes.ts`. Startseite + Rechtsseiten
  (`SSR_ALLOWED_PATHNAMES`: `/`, `/impressum`, `/datenschutz`) werden voll
  gerendert; jeder andere Unterpfad einer bekannten v2-Site liefert ein
  eigenes SSR-404 (`server/ssr/notFoundPage.ts`, `X-Robots-Tag: noindex`) statt
  des SPA-Fallbacks — nur Asset-artige Pfade (Dateiendung, Regex
  `/\.[a-z0-9]+$/i`) und unbekannte Slugs gehen weiterhin an `next()`
  (Static-Middleware/SPA).
- **Inseln-Endpunkte**:
  - Kontakt: `POST /api/site/:slug/contact` (`server/contactSubmit.ts`).
  - KI-Chat: `POST /api/chat/:slug/message` (`server/_core/chatRoutes.ts`).
  - Buchung: `GET /api/booking/:slug/settings`, `GET
    /api/booking/:slug/slots`, `POST /api/booking/:slug/book`, `GET
    /api/booking/:slug/cancel/:token` (`server/_core/bookingRoutes.ts`).

## 6. Inseln (Islands)

Bis zu drei optionale Hydration-Inseln pro v2-Website, gesteuert über
`websiteData.features` im Dokument (`hasActiveFeatures`,
`client/src/components/site/islands/SiteIslands.tsx`):

- Kontaktformular (`ContactFormIsland.tsx`), KI-Chat (`ChatIsland.tsx`),
  Terminbuchung (`BookingIsland.tsx`) — alle unter
  `client/src/components/site/islands/`.
- `islandsMode`: `"live"` (Default, echtes SSR über `renderSiteHtml()`,
  interaktiv) vs. `"preview"` (Dashboard/Studio-Vorschauen, read-only
  Schnappschuss, keine Hydration).
- Freischaltung über den Stripe-Webhook: `server/stripeWebhookHandlers.ts`,
  `handleCheckoutCompleted` normalisiert alle 7 Add-on-Keys
  (`normalizeAddOns`) und spiegelt die freischaltbaren Extras in
  `websiteData.features` (`contactForm`, `aiChat`, `booking`), sofern das
  Dokument ein valides v2-Dokument ist.
- Add-on-Keys: `shared/pricing.ts`, `AddOnKey` = `contactForm`, `gallery`,
  `menu`, `pricelist`, `aiChat`, `booking`, `team` (`ADDON_KEYS`). Buchbar
  sind aktuell alle außer `team` (`BOOKABLE_ADDON_KEYS`); `team` gilt als
  "Coming Soon".

## 7. Tests & Gates

- `npx vitest run` — Stand dieses Dokuments (755 grün, 6 bekannte Fails):
  - `server/contrast.test.ts` — 4 Fälle. **Keine Env-Abhängigkeit**, sondern
    eine echte Wertabweichung: `getContrastColor()` (`shared/colorContrast.ts`,
    genutzt von `server/industryImages.ts` `getIndustryColorScheme`) liefert
    Slate-Töne (`#0f172a`/`#f8fafc`), der Test erwartet reines
    `#000000`/`#ffffff`. Vorbestehend, unabhängig von Plan B4b entstanden —
    Korrektur der Testerwartungen ist B4c-Kandidat (s. u.).
  - `server/resend.test.ts` — 2 Fälle (kein `RESEND_API_KEY` gesetzt, echter
    Env-Fail).
  - Zwei Suiten ohne `STRIPE_SECRET_KEY` (`server/auth.logout.test.ts`,
    `server/pageblitz.test.ts`) brechen beim Import ab (`new Stripe(...)` in
    `server/onboardingV2/checkout.ts`) — abhängig von der lokalen
    Umgebung, in manchen Setups (Secret gesetzt) grün.
- `npm run check` (`tsc --noEmit`) — hat pre-existing Fehler unabhängig von
  diesem Plan; Gate ist "keine neuen Fehler", nicht "null Fehler". Zahl hier
  bewusst nicht als Sollwert festgeschrieben (verändert sich mit jedem
  Commit) — vor jedem Merge gegen den Stand auf `main` vergleichen.
- Playwright-Specs unter `tests/visual/`: `packs.spec.ts`, `studio.spec.ts`,
  `islands.spec.ts`, `landing.spec.ts`, `startpage-to-studio.spec.ts`.
  Baselines liegen als `tests/visual/<spec>-snapshots/*.png` daneben
  (`packs.spec.ts-snapshots/`, `studio.spec.ts-snapshots/`,
  `islands.spec.ts-snapshots/` sind zum Zeitpunkt dieses Dokuments befüllt;
  `landing.spec.ts` und `startpage-to-studio.spec.ts` sind neu aus diesem
  Plan und brauchen ggf. einen `--update-snapshots`-Lauf, falls ihre
  Snapshot-Ordner noch fehlen). Läuft auf `PORT=3005`, nie auf Port 3000.
  Vor dem Lauf `npm run build:islands` (Inseln-Bundle wird nicht automatisch
  gebaut).

## 8. Offen / Nächste Schritte

**Plan B4b ist erledigt** (siehe §1) — der v1-Code laut Inventar
(`.superpowers/b4-inventar.md`) ist entfernt: Chat, v1-Layouts/-Renderer,
v1-Generierungsrumpf, Templates-Cluster, v1-`onboarding.*`/`selfService.*`.
Details: `docs/superpowers/specs/2026-08-23-b4b-ergebnis.md`.

**Plan B4c (Politur, offen):**
- DB-Spalten-Drops (siehe `docs/superpowers/specs/2026-08-23-b4b-ergebnis.md`
  für den aktuellen Referenz-Stand je Spalte): `generatedWebsites.layoutStyle`
  und `.layoutVersion` werden weiterhin aktiv von `server/onboardingV2/devSeed.ts`
  (Dev/Test-Seed) und `.layoutStyle` zusätzlich als Admin-Listen-Kompatibilitäts-
  spiegel von `server/onboardingV2/router.ts` geschrieben — vor einem Drop
  prüfen, ob diese Schreibpfade noch gebraucht werden. `.aboutImageUrl` hat
  aktuell 0 Referenzen außerhalb des Schemas und könnte ohne weitere
  Vorarbeit gedroppt werden. `.colorScheme` ist load-bearing für
  `LegalPage.tsx` (liest die Akzentfarbe) und den Auto-Migrationspfad in
  `customer.getMyWebsites` (`server/routers.ts`) — Drop erst nach Umstellung
  der LegalPage-Farbe auf die v2-Pack-Palette möglich (s. u.).
  `template_uploads` ist komplett unreferenziert und droppbar.
- LegalPage-Akzentfarbe aus der v2-Pack-Palette statt aus der
  `colorScheme`-Spalte ableiten; danach `customer.getMyWebsites`-
  Migrationsblock, `getIndustryColorScheme` (`server/industryImages.ts`) und
  `withOnColors`/`ColorScheme` (`shared/layoutConfig.ts`) entfernen.
- ~~`SSR_ALLOWED_PATHNAMES` (o. ä. Allowlist für Unterseiten) prüfen, ob
  zusätzliche v2-Unterseiten-Pfade fehlen.~~ Erledigt (B4c Task 5): unbekannte
  Unterpfade einer bekannten v2-Site liefern jetzt ein eigenes SSR-404 statt
  des SPA-Fallbacks, siehe §5.
- Landing-Perf: `/demo/:pack`-Showcase lädt 14 Packs als iframes — Ladezeit-
  Optimierung offen.
- ~~Demo-Rechtsseiten (`/demo/:pack/impressum|datenschutz`) fallen aktuell auf
  SPA/404 durch — laut Spec akzeptiert, aber als offener Punkt vermerkt.~~
  Erledigt (B4c Task 5): eigene Route mit Platzhalter-Rechtstext, siehe §5.
- a11y-/Perf-Pass (Studio, Kundenseiten).
- `prefersMenu`, Team-Panel (`addOnTeamData`-Spalte bleibt bis dahin),
  Unterseiten-Add-on — laut Spec §2.8 aufgeschoben.
- `server/contrast.test.ts`-Erwartungen an `getContrastColor()` korrigieren
  (§7).
