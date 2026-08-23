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
- `npm run build:previews` (`scripts/build-pack-previews.mjs`) — rendert
  `/demo/<pack>` für alle 14 Style Packs zu je einem statischen WebP unter
  `client/public/pack-previews/<pack>.webp` (~800×500, ≤ 80 KB), das
  `PackShowcase.tsx` auf der Landingpage statt eines sofort geladenen iframes
  zeigt (Live-Demo öffnet sich per Klick in einem Modal). Braucht einen
  laufenden Server unter `PREVIEW_BASE_URL` (Default `http://localhost:3005`)
  — startet selbst keinen, analog zu `build:islands`:
  ```bash
  PORT=3005 npm run dev   # Terminal 1
  npm run build:previews  # Terminal 2
  ```
  Nach jeder Änderung an einer Pack-Verfassung (Palette, Fixture-Daten) neu
  laufen lassen und die erzeugten WebPs mitcommitten — sonst zeigt die
  Landingpage veraltete Vorschaubilder.
- Lokaler Dev-Server baut das Inseln-Bundle **nicht** automatisch — vor
  Playwright-Läufen oder manuellem Testen der Kundenseiten-Vorschau einmal
  `npm run build:islands` ausführen.
- Deploy: PM2 + Nginx auf dem Hostinger-VPS, `npm run build && pm2 restart
  pageblitz` — Details in `HOSTINGER-SETUP.md` / `VPS-MIGRATION.md`.

## 3. Datenbank / Migrationen

- Handgeschriebene SQL-Migrationen sind Konvention seit `0013_*` (aktuell bis
  `0027_drop_v1_columns.sql`, davor `0026_subscription_checkout_email.sql`).
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
  Ohne lokalen `mysql`-Client: `docker exec -i pageblitz-mysql mysql -uroot
  -proot pageblitz < drizzle/NNNN_*.sql`.

### Migration 0027 — v1-Spalten/Tabellen entfernt (B4c Task 4, destruktiv)

`drizzle/0027_drop_v1_columns.sql` droppt die zuletzt nur noch von der v1-
Chat-Onboarding-Strecke geschriebenen Spalten (Referenz-Check: 0 Code-Treffer
außerhalb der Migration selbst, siehe Task-4-Report):

- `generated_websites`: `colorScheme`, `heroImageUrl`, `aboutImageUrl`,
  `layoutStyle`, `layoutVersion`, `contactFormFields`, `addOnTeamData`.
- `onboarding_responses`: `tagline`, `description`, `foundedYear`, `teamSize`,
  `usp`, `topServices`, `targetAudience`, `faqItems`, `logoUrl`,
  `heroPhotoUrl`, `aboutPhotoUrl`, `brandColor`, `brandSecondaryColor`,
  `sectionOrder`, `hiddenSections`, `colorScheme`, `contactFormFields`.
- Tabelle `template_uploads` komplett entfernt (Templates-Cluster war bereits
  in B4b tot, siehe `docs/superpowers/specs/2026-08-23-b4b-ergebnis.md`).

**Bewusst NICHT gedroppt:** `onboarding_responses.addOnTeamData` — Team-Panel
im Studio ist auf Plan B5 verschoben (Add-on `team` ist im Kaufprozess
gesperrt), die Spalte wird gebraucht, sobald das Panel gebaut wird. Alle
übrigen `addOn*`-, `legal*`-, `chat*`-, `photoUrls`-, `openingHours`- und
`headlineFont`-Spalten sowie `businessName`/`businessCategory`/
`studioProgress` bleiben unverändert (Behalten-Liste, s. Plan
`2026-08-23-onboarding-v2-b4c-polish.md`).

Prod-Ablauf (nach Merge, mit Nutzer-Freigabe, **nicht** eigenständig
ausführen) — **Expand/Contract-Reihenfolge, in dieser Abfolge**: erst der
neue Code (verträgt die alten Spalten noch, liest/schreibt sie aber nicht
mehr), erst danach das Backup und der Drop. Ein Drop vor dem Deploy würde den
noch laufenden alten Prozess brechen, falls der zwischen Backup und Migration
noch eine der Spalten anfasst; in dieser Reihenfolge ist der Code beim Drop
bereits spaltenunabhängig:

```bash
ssh -i ~/.ssh/claude_pageblitz root@76.13.147.95
cd /root/pageblitz

# 1) Neuer Code zuerst - verträgt die alten Spalten (liest/schreibt sie nicht mehr)
git fetch origin && git reset --hard origin/main && npm run build && pm2 restart pageblitz

# 2) Backup danach - erst wenn der neue Code läuft, nicht mehr während des alten
mysqldump -u<user> -p<pw> pageblitz generated_websites onboarding_responses template_uploads \
  > backup-0027-$(date +%F).sql

# 3) Migration zuletzt
mysql -u<user> -p<pw> pageblitz < drizzle/0027_drop_v1_columns.sql
```

Rollback: `backup-0027-<datum>.sql` enthält Voll-Dumps der drei Tabellen
(`CREATE TABLE`+`INSERT`, `template_uploads` komplett). Ein Rückspielen
(`mysql ... < backup-0027-<datum>.sql`) stellt die **ganzen Tabellen** aus
dem Dump-Zeitpunkt wieder her — nicht nur die gedroppten Spalten — und
**überschreibt damit jede Zeile, die zwischen Backup und Rückspielung neu
angelegt oder geändert wurde** (neue Websites/Onboarding-Antworten seit dem
Dump gehen verloren, sofern nicht vorher separat gesichert). Da Schritt 1 vor
dem Backup läuft, ist die Zeitspanne mit diesem Risiko auf "Backup bis
Migration" begrenzt, nicht "Deploy bis Migration". Ohne Backup ist die
Migration nicht reversibel (`DROP COLUMN`/`DROP TABLE`).

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

- `npx vitest run` — Stand dieses Dokuments (750 grün + bekannte Fails, keine
  neuen gegenüber der vorherigen Baseline):
  - `server/resend.test.ts` — 2 Fälle (kein `RESEND_API_KEY` gesetzt, echter
    Env-Fail).
  - Zwei Suiten ohne `STRIPE_SECRET_KEY` (`server/auth.logout.test.ts`,
    `server/pageblitz.test.ts`) brechen beim Import ab (`new Stripe(...)` in
    `server/onboardingV2/checkout.ts`) — abhängig von der lokalen
    Umgebung, in manchen Setups (Secret gesetzt) grün.
  - `server/contrast.test.ts` gibt es nicht mehr (B4c Task 2 —
    `shared/colorContrast.ts` mit der gesamten v1-Farbkette gelöscht, siehe
    §8) — die Env-Fail-Liste ist dadurch gegenüber dem Stand vor B4c um 4
    Fälle geschrumpft.
- `npm run check` (`tsc --noEmit`) — Stand dieses Dokuments **0 Fehler**
  (B4c-Abschluss, siehe §8; Baseline zu Beginn von B4c war 21, vor B4a 73).
  Gate bleibt trotzdem "keine neuen Fehler" statt eines festen Sollwerts —
  vor jedem Merge gegen den Stand auf `main` vergleichen.
- Playwright-Specs unter `tests/visual/`: `packs.spec.ts`, `studio.spec.ts`,
  `islands.spec.ts`, `landing.spec.ts`, `startpage-to-studio.spec.ts`,
  `a11y.spec.ts` (neu, B4c Task 7). Baselines liegen als
  `tests/visual/<spec>-snapshots/*.png` daneben. Läuft auf `PORT=3005`, nie
  auf Port 3000. Vor dem Lauf `npm run build:islands` (Inseln-Bundle wird
  nicht automatisch gebaut).
  - `a11y.spec.ts` prüft mit `@axe-core/playwright` gegen `/`
    (Desktop/Mobile/Cookie-Banner-Variante), `/demo/:pack` für alle 14 Style
    Packs sowie die Studio-Checkliste und alle 6 Panels: **0
    `critical`/`serious`**-Funde (Spec §2.7/§4). Das Dashboard
    (`/my-website`) ist bewusst `test.skip` — es hängt an einer echten
    Session (`CustomerRoute`), für die es keinen Dev-Bypass gibt; eine
    Test-Login-Infrastruktur dafür ist auf B5 verschoben (siehe §8).
  - `packs.spec.ts` — Toleranz/Farbassertion siehe `packs.spec.ts` selbst
    (der pauschale Pixel-Diff-Schwellenwert bildet nicht jede
    Palette-Änderung zuverlässig ab; Details im Testfile-Kommentar statt
    hier dupliziert).

## 8. Offen / Nächste Schritte

**Plan B4b ist erledigt** (siehe §1) — der v1-Code laut Inventar
(`.superpowers/b4-inventar.md`) ist entfernt: Chat, v1-Layouts/-Renderer,
v1-Generierungsrumpf, Templates-Cluster, v1-`onboarding.*`/`selfService.*`.
Details: `docs/superpowers/specs/2026-08-23-b4b-ergebnis.md`.

**Plan B4c ist erledigt** — v1-Farbkette (`colorScheme`, `layoutConfig`,
`colorContrast`) entfernt, v1-DB-Spalten + `template_uploads` gedroppt
(Migration 0027, siehe §3), Rechtsseiten-Regenerierung auf Besitzer/Admin
abgesichert, toter Code per `knip` entfernt, SSR-404 für unbekannte
Kundenpfade + Demo-Rechtsseiten + `og:image`, Landingpage-Showcase auf
statische Vorschaubilder umgestellt, a11y-Pass (axe) mit Kontrastfixes und
`prefersMenu` für die Gastro-Packs. tsc-Baseline von 21 (Start B4c) auf **0**
gebracht. Details, Messwerte und Rulings:
`docs/superpowers/specs/2026-08-23-b4c-ergebnis.md`.

**Offene Punkte → Plan B5 ("Features" + Politur-Rest):**
- Team-Panel (Add-on `team` buchbar machen — `onboarding_responses.addOnTeamData`
  bleibt bis dahin bestehen) und Unterseiten-Add-on (`features.subpages[]`) —
  bewusst nicht in B4c, brauchen Produktentscheidungen (Spec §3).
- Admin `WebsitesPage.tsx` zeigt den Pack der Website aktuell gar nicht an;
  `AdminCheckoutDialog` zeigt noch ein veraltetes 79-€-Pricing und zählt keine
  Unterseiten.
- Test-Login-Infrastruktur für das Dashboard (`/my-website`), damit
  `a11y.spec.ts`/E2E-Flows auch den eingeloggten Kundenbereich abdecken
  können (aktuell `test.skip`, siehe §7).
- Dark-Mode-a11y der Landingpage (`/`) — axe prüft bisher nur den
  Default-Light-Zustand.
- JS-Budget von `/` (~306 kB gzip, Budget 150 kB) ist weiterhin verfehlt.
  Größte Hebel laut Task-6-Analyse: `TooltipProvider`/Radix aus dem
  App-Root-Entry lösen; `LandingPage`/`StartPage`/`SitePage`/`LegalPage` per
  `lazy()`/Route-Split laden statt eager zu importieren; `framer-motion`
  über `LazyMotion` statt der vollen Bundle-Variante einbinden. Größter
  LCP-Hebel laut Lighthouse-Render-Blocking-Analyse: `client/src/index.css:38`
  bindet 25 Google-Font-Familien render-blocking ein (v1-Rest, v2 nutzt nur
  einen Bruchteil davon) — Aufräumen auf die tatsächlich genutzten Familien.
- `umamiWebsiteId as any` in `server/routers.ts` (~Z. 2716) — Admin-Statistik
  liefert aktuell `null` statt echter Umami-Daten.
- `packs/zunft/css.ts` `.pb-zf-price` nutzt die Rolle "Siegelgold" entgegen
  dem eigenen Verfassungskommentar ("nie als Textfläche") als Textfarbe
  (Kontrast seit B4c Task 7 behoben, Rollen-Doku/Verwendung laufen aber
  auseinander).
- `server/contrast.test.ts` existiert nicht mehr (Farbkette komplett entfernt
  in B4c Task 2) — der ursprüngliche Punkt "Testerwartungen korrigieren" ist
  damit gegenstandslos.
