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
  (`runWebsiteGenerationV2Job`). `runWebsiteGeneration` (v1) in
  `server/routers.ts` ist nur noch ein schmaler Wrapper (`V1_BODY_DISABLED =
  true`), der sofort an `runWebsiteGenerationV2Job` delegiert — der v1-Rumpf
  läuft nie mehr und wird in Plan B4b gelöscht.
- **`PB_LAYOUT_V2` existiert im Code nicht mehr** (Flag entfernt, Cutover
  Task 3).

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
  esbuild-Bundle des Servers nach `dist/`.
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
  - `/preview/:token` → serverseitig 302 auf `/preview-ssr/:token`.
  - `/preview/:token/onboarding` → SPA-Redirect auf `/onboarding/:token`.
  - `/websites/:id/onboarding` → `LegacyWebsiteRedirect`-Komponente lädt
    `website.get({id})` und leitet auf `/onboarding/<previewToken>` um
    (Fehlerfall → `/my-website`).
- **Demo-Route**: `/demo/:pack` (Regex `[a-z0-9-]+`, nur bekannte Pack-IDs),
  rendert Fixture `"full"` des Packs, `X-Robots-Tag: noindex, nofollow`,
  `Cache-Control: public, max-age=3600`; `/demo/:pack/impressum|datenschutz`
  matcht die Route nicht (fällt auf SPA/404 durch — laut Spec ok).
- **Dev-Vorschau**: `/dev/site-preview?pack=&fixture=full|minimal|features` —
  nur außerhalb `production` (404 sonst).
- **Kunden-Sites**: `/site/:slug` (Pfadform) und Subdomain
  `<slug>.pageblitz.de` (`getCustomerSubdomainFromHost`) — beide über
  `handleCustomerSiteSsr` in `server/ssr/routes.ts`.
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

- `npx vitest run` — Stand dieses Dokuments: 4 Testdateien schlagen fehl,
  bekannte Env-Abhängigkeiten, kein Produktcode-Fehler:
  - `server/contrast.test.ts` — 4 Fälle (Kontrastfarb-Erwartungen
    weichen lokal ab).
  - `server/resend.test.ts` — 2 Fälle (kein `RESEND_API_KEY` gesetzt).
  - `server/auth.logout.test.ts`, `server/pageblitz.test.ts` — je 0 Tests,
    Suite bricht beim Import ab (`new Stripe(...)` ohne
    `STRIPE_SECRET_KEY` in `server/onboardingV2/checkout.ts`).
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

**Plan B4b** löscht den toten v1-Code auf Basis des Inventars
(`.superpowers/b4-inventar.md`) — u. a. den deaktivierten v1-Rumpf von
`runWebsiteGeneration`; danach **Plan B4c** (Politur).
