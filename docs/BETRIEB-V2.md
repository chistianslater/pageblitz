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
- `npm run test:visual` / `test:visual:update` — Playwright (Projekt `dev`,
  Server auf 3005).
- `npm run test:prod` — Playwright-Smoke gegen den echten Produktions-Build
  (Projekt `prod`, Server auf 3012) — Details §8.
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

**Damals bewusst NICHT gedroppt, seit Migration 0028 erledigt:**
`onboarding_responses.addOnTeamData` — zum Zeitpunkt von 0027 war das
Team-Panel im Studio auf Plan B5 verschoben (Add-on `team` im Kaufprozess
gesperrt), die Spalte wurde noch gebraucht. Mit Plan B5 (Team-Add-on
buchbar, Inhalt lebt als Sektion `team` im v2-Dokument statt in der Spalte)
ist auch diese Spalte überflüssig geworden und wurde mit Migration 0028
(siehe unten) gedroppt — `onboarding_responses.addOnTeamData` existiert
nicht mehr. Alle übrigen `addOn*`-, `legal*`-, `chat*`-, `photoUrls`-,
`openingHours`- und `headlineFont`-Spalten sowie `businessName`/
`businessCategory`/`studioProgress` bleiben unverändert (Behalten-Liste, s.
Plan `2026-08-23-onboarding-v2-b4c-polish.md`).

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

### Migration 0028 — `onboarding_responses.addOnTeamData` entfernt (B5 Task 1, destruktiv)

`drizzle/0028_drop_addon_team_data.sql` droppt die letzte verbliebene
`addOnTeamData`-Spalte (`generated_websites.addOnTeamData` wurde bereits mit
0027 gedroppt, `onboarding_responses.addOnTeamData` war zu dem Zeitpunkt
bewusst noch behalten worden, siehe 0027-Kommentar oben). Grund: Team-Inhalt
lebt seit Plan B5 als Sektion `team` im v2-Dokument
(`websiteData.sections`, `server/onboardingV2/applyPatch.ts` `applyTeam`),
nicht mehr in einer eigenen DB-Spalte. Referenz-Check bestätigt keine
verbleibenden Lese-/Schreibstellen (`grep -rn addOnTeamData client server
shared` → 0 Treffer außerhalb der Migration selbst). Lokal eingespielt und
verifiziert (`SHOW COLUMNS` → Spalte weg, `addOnTeam`-Flag-Spalte bleibt).

Prod-Ablauf (nach Merge, mit Nutzer-Freigabe, **nicht** eigenständig
ausführen) — dieselbe Expand/Contract-Reihenfolge wie bei 0027: erst der
neue Code deployen (schreibt/liest `addOnTeamData` bereits nicht mehr, die
Spalte darf also noch existieren), erst danach Backup und Drop:

```bash
ssh -i ~/.ssh/claude_pageblitz root@76.13.147.95
cd /root/pageblitz

# 1) Neuer Code zuerst - verträgt die Spalte noch (liest/schreibt sie nicht mehr)
git fetch origin && git reset --hard origin/main && npm run build && pm2 restart pageblitz

# 2) Backup danach - erst wenn der neue Code läuft
mysqldump -u<user> -p<pw> pageblitz onboarding_responses \
  > backup-0028-$(date +%F).sql

# 3) Migration zuletzt
mysql -u<user> -p<pw> pageblitz < drizzle/0028_drop_addon_team_data.sql
```

Rollback: `backup-0028-<datum>.sql` enthält einen Voll-Dump von
`onboarding_responses` zum Backup-Zeitpunkt; ein Rückspielen überschreibt
damit — wie bei 0027 — jede Zeile, die zwischen Backup und Rückspielung neu
angelegt oder geändert wurde. Ohne Backup ist die Migration nicht reversibel.

**Stand:** Migration ist zum Zeitpunkt dieses Dokuments **noch nicht** in
Prod ausgeführt — offen bis Merge + Freigabe (siehe
`docs/superpowers/specs/2026-08-23-b5-ergebnis.md`).

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
- **Dev-Seeds** (beide nur außerhalb `production`, 404 sonst — legen keine
  Zeilen in Prod an):
  - `/dev/studio-seed?pack=&fixture=full|minimal|features[&json=1]`
    (`server/onboardingV2/devSeed.ts`) — legt eine v2-Preview-Website aus
    einer Fixture an (oder setzt sie zurück, Slug `studio-seed-<pack>-<fixture>`
    ist idempotent) und leitet ins Studio (`/onboarding/<token>`); `json=1`
    liefert `{ token, websiteId }` statt Redirect. Macht Studio-Checkliste
    und -Panels ohne LLM-Lauf testbar (`tests/visual/studio.spec.ts`,
    `a11y.spec.ts`).
  - `/dev/dashboard-seed?pack=&fixture=full|minimal|features[&json=1]`
    (`server/onboardingV2/devDashboardSeed.ts`) — legt einen Kunden
    (`dev-dashboard@example.test`) mit aktiver Website (Slug
    `dev-dashboard-<pack>`) und aktivem Abo an (beides idempotent: ein
    zweiter Aufruf findet User per E-Mail und Website per Slug wieder statt
    Duplikate anzulegen) und setzt das Session-Cookie über denselben Helfer
    wie der Magic-Link-Verify (`issueSessionCookie`, geteilt in
    `server/_core/magicLinkAuth.ts`); leitet auf `/my-website`, `json=1`
    liefert `{ websiteId, slug, previewToken }`. Einziger Weg, das
    Dashboard (`CustomerRoute`-geschützt) ohne echten Stripe-Checkout und
    Magic-Link-Mailversand aus Playwright heraus zu erreichen
    (`a11y.spec.ts` deckt Übersicht, Add-ons-Tab, Anfragen-Tab ab).
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
  `menu`, `pricelist`, `aiChat`, `booking`, `team` (`ADDON_KEYS`). Seit Plan
  B5 sind **alle sieben** Keys buchbar (`BOOKABLE_ADDON_KEYS` = `ADDON_KEYS`,
  kein gesperrter Key mehr).

### Add-ons: Team (seit Plan B5)

- Preis 3,90 €/Monat, wie Galerie/Menü/Preisliste (`shared/pricing.ts`,
  `ADDON_PRICES.team`).
- Inhalt lebt als Sektion `team` im v2-Dokument (`TeamSchema`,
  `shared/siteContract/schema.ts`; `members[{name, role?, imageUrl?}]`, max.
  12), nicht als eigene DB-Spalte — `onboarding_responses.addOnTeamData` ist
  seit Migration 0028 (§3) gedroppt.
- Pflege im Studio-Extras-Panel (`AddonsPanel.tsx`): Schalter wie die
  anderen Add-ons, bei aktivem Team erscheint sofort (schon bei aktivem
  lokalen Toggle-Entwurf, nicht erst nach "Speichern") der Unterbereich
  "Team pflegen" (`TeamEditor.tsx`) — Mitglieder hinzufügen/entfernen/
  sortieren, Foto über denselben Upload-/Stockfoto-Weg wie das Fotos-Panel.
  Eigene Mutation `onboardingV2.updateTeam`, unabhängig von der
  Add-on-Flag-Mutation `onboardingV2.updateAddons`.
- **Abschalt-Verhalten weicht bewusst von der Galerie ab:** Wird das
  Team-Add-on in `updateAddons` deaktiviert, entfernt der Server aktiv die
  `team`-Sektion aus dem Dokument (`applyTeam(doc, { members: [] })`) —
  sonst bliebe eine gebuchte, aber nicht mehr abgerechnete Team-Sektion auf
  der Live-Website sichtbar. Die **Galerie** macht das nicht: ihre Sektion
  wird ausschließlich über das Fotos-Panel verwaltet und bleibt beim
  Abschalten des `gallery`-Add-ons unverändert im Dokument stehen (Pack
  rendert `case "gallery"` unabhängig vom Flag). Diese Inkonsistenz ist
  bekannt und bewusst nicht in B5 vereinheitlicht (siehe §9, B6-Liste).
- Dashboard-Add-ons-Tab (`AddonsTab.tsx`) zeigt Team wie Galerie
  (Kauf-/Aktiv-Zustand, Link ins Studio-Extras-Panel).

## 7. Fonts & Performance

- **v1-Font-Rest entfernt (B5 Task 5):** `client/src/index.css` importierte
  bis dahin 23 Google-Font-Familien (`@import url(...)`, v1-Layout-Rest,
  render-blocking) sowie vier tote `.font-clash`/`.font-satoshi`/
  `.font-outfit`/`.font-tenor`-Klassen mit 0 Verwendungen im Repo — beides
  entfernt. v2 braucht sitewide nur Inter (Body) und Space Grotesk
  (Überschriften), im Studio zusätzlich Fraunces und Instrument Sans.
- **Ladestrategie `client/index.html`:** Inter + Plus Jakarta Sans bleiben
  blockierend (App-Shell-First-Paint). Space Grotesk, Fraunces und
  Instrument Sans laufen als async Preload (`preload as=style` +
  `onload`-Swap + `noscript`-Fallback) — **bewusst nicht blockierend**:
  ein erster Versuch, Space Grotesk in die blockierende Zeile zu legen,
  zeigte in Lighthouse (Lantern-Simulation) eine LCP-Regression von 3,1 s
  auf 6,4 s, obwohl die reale Trace-Insight nur ~1,3 s bis zum
  LCP-Element zeigte — Lighthouses simulierte Lantern-Metrik behandelt
  eine früh im `<head>` entdeckte Font-Datei offenbar als Teil des
  kritischen Pfads, auch mit `font-display: swap`. **Merksatz:**
  blockierende Font-Links früh im `<head>` verschlechtern die simulierte
  LCP-Messung überproportional — neue Studio-/Pack-Fonts async laden, nicht
  blockierend, sofern sie nicht Body-Text auf der Landingpage selbst
  betreffen. Konsequenz akzeptiert: Fraunces/Instrument Sans im Studio
  können kurz als Fallback-Font aufblitzen, bis der async Preload greift
  (FOUT) — bewusst in Kauf genommen, da das Studio ein interner
  Editor-Kontext ist (kein LCP-kritischer erster Eindruck wie die
  Landingpage) und die Alternative (blockierend) die gemessene Regression
  oben verursacht.
- **CSR-Fallback (`client/src/pages/SitePage.tsx`):** lädt die Pack-Fonts
  der jeweiligen Website zur Laufzeit aus der Pack-Verfassung
  (`packFontHrefs(packId)` in `client/src/lib/packFonts.ts`, Pendant zu
  `buildFontsUrl` im SSR-Head `server/ssr/renderSite.tsx` — zwei
  unabhängige kleine Implementierungen statt eines Server-Imports im
  Client-Bundle). Betrifft nur den reinen CSR-Pfad (`WebsiteRenderer` ohne
  SSR); `/preview-ssr/:token` und `/demo/:pack` bringen ihre Pack-Fonts
  bereits über den SSR-Head mit.
  - **Bekannter Doppel-Request:** Bei einer Client-Navigation zwischen zwei
    Websites mit teils überlappenden Pack-Fonts (z. B. klarwerk → patina
    über `AccountPage`) fordert der CSR-Fallback dieselbe Google-Fonts-
    Familie zweimal an (kein Abgleich mit bereits im Head vorhandenen
    `<link>`s). Kein Regressionsrisiko (Browser-Cache greift), aber
    unnötiger Request — offen für B6 (siehe §9).
- **Chunking (B5 Task 6):** `LandingPage` bleibt **eager** in
  `client/src/App.tsx` (ein `lazy()`-Versuch zeigte eine LCP-Regression von
  3,2 s auf 5,6 s — die zusätzliche Netzwerk-Rundreise für den
  Chunk-`import()` kostet auf `/` mehr, als das kleinere Entry-Bundle
  einspart, da `/` den Landing-Chunk ohnehin sofort braucht); `StartPage`,
  `SitePage`, `LegalPage` sind lazy. `TooltipProvider` wurde **ersatzlos aus
  `App.tsx` entfernt** (nicht verschoben) — einziger Konsument ist
  `client/src/components/ui/sidebar.tsx`, das bereits einen eigenen
  `TooltipProvider` mitbringt; der App-Root-Provider war vollständig
  redundant. `vite.config.ts` trennt `vendor-tanstack` von `vendor-radix`
  (`manualChunks`); framer-motion läuft über `LazyMotion`/`m` statt
  `motion.*` in Landing/PackShowcase (Feature-Set wird noch synchron
  importiert, kein Async-Loader — nächster möglicher Hebel, siehe §9).
- **Lighthouse mobil `/` (Produktions-Build, Port 3011, `throttlingMethod:
  simulate`) — Gesamtverlauf über B5:**

  | Metrik | vor B5 (Task 5 Start) | nach Task 5 (Fonts) | nach Task 6 (Chunking) |
  |---|---|---|---|
  | JS auf `/` (gzip) | 306 kB | 306 kB (unverändert, Task-5-Scope) | ~245 kB |
  | LCP | 3,1 s | 3,2 s | 2,7–3,0 s |
  | Performance-Score | 0,84 | 0,79–0,84 | 0,89–0,92 |

  **Budgets weiterhin verfehlt** (LCP mobil < 2,5 s, JS auf `/` < 150 kB
  gzip) — dokumentierte Restursachen: `vendor-react` (~61 kB gzip, nicht
  ohne React-Alternative reduzierbar), `vendor-motion` (~43 kB gzip, echter
  Async-Loader für `LazyMotion` wäre der nächste Schritt), `vendor-radix`
  (~38 kB gzip, hängt ausschließlich an `Button`s `Slot`-Nutzung — ein
  Slot-freier Button würde das vollständig aus dem Landing-Pfad lösen,
  siehe §9), sowie Third-Party-Skripte außerhalb des App-Bundles (Google
  Tag Manager ~185 KB Transfer, Rybbit-Analytics ~11,7 KB) und
  render-blocking Haupt-CSS-Bundle + Inter/Plus-Jakarta-Fonts-Link.

## 8. Tests & Gates

- `npx vitest run` — Stand dieses Dokuments (821 grün + bekannte Fails,
  keine neuen gegenüber der vorherigen Baseline):
  - `server/resend.test.ts` — 2 Fälle (kein `RESEND_API_KEY` gesetzt, echter
    Env-Fail).
  - Zwei Suiten ohne `STRIPE_SECRET_KEY` (`server/auth.logout.test.ts`,
    `server/pageblitz.test.ts`) brechen beim Import ab (`new Stripe(...)` in
    `server/onboardingV2/checkout.ts`) — abhängig von der lokalen
    Umgebung, in manchen Setups (Secret gesetzt) grün.
  - `server/contrast.test.ts` gibt es nicht mehr (B4c Task 2 —
    `shared/colorContrast.ts` mit der gesamten v1-Farbkette gelöscht, siehe
    §9) — die Env-Fail-Liste ist dadurch gegenüber dem Stand vor B4c um 4
    Fälle geschrumpft.
- `npm run check` (`tsc --noEmit`) — Stand dieses Dokuments **0 Fehler**
  (seit B4c-Abschluss durchgehend, siehe §9; Baseline zu Beginn von B4c war
  21, vor B4a 73). Gate bleibt trotzdem "keine neuen Fehler" statt eines
  festen Sollwerts — vor jedem Merge gegen den Stand auf `main` vergleichen.
- `npm run build` — grün (Stand dieses Dokuments).
- Playwright-Specs unter `tests/visual/`: `packs.spec.ts` (98/98),
  `studio.spec.ts` (9/9, +1 seit B5 Task 2 — Team-Add-on-Szenario),
  `islands.spec.ts` (4/4), `landing.spec.ts` (4/4), `startpage-to-studio.spec.ts`
  (1/1), `a11y.spec.ts` (29/29, +5 seit B4c — Dashboard + Dark-Mode, siehe
  unten). Baselines liegen als `tests/visual/<spec>-snapshots/*.png`
  daneben. Läuft auf `PORT=3005`, nie auf Port 3000. Vor dem Lauf `npm run
  build:islands` (Inseln-Bundle wird nicht automatisch gebaut).
  - `a11y.spec.ts` prüft mit `@axe-core/playwright` gegen `/`
    (Desktop/Mobile/Cookie-Banner-Variante, **plus seit B5 Task 4 je eine
    Dark-Mode-Variante Desktop/Mobile** über `localStorage["lp-theme"] =
    "dark"`), `/demo/:pack` für alle 14 Style Packs, die Studio-Checkliste
    und alle 6 Panels, **sowie seit B5 Task 4 das eingeloggte Dashboard**
    (Übersicht, Add-ons-Tab, Anfragen-Tab, Login über
    `/dev/dashboard-seed`, §5) — **0 `critical`/`serious`**-Funde
    (Spec §2.7/§4), **keine Skips mehr**.
  - `packs.spec.ts` — Toleranz/Farbassertion siehe `packs.spec.ts` selbst
    (der pauschale Pixel-Diff-Schwellenwert bildet nicht jede
    Palette-Änderung zuverlässig ab; Details im Testfile-Kommentar statt
    hier dupliziert).
- **Prod-Smoke-Gate (seit Plan B6 Task 1)** — `npm run test:prod`
  (= `PW_PROJECT=prod playwright test --project=prod`), Spec:
  `tests/prod/smoke.spec.ts`. Warum: Hotfix 9875dd9 (eigene
  Radix/TanStack-Chunks im Rollup-Chunking → zirkuläre Chunk-Abhängigkeit →
  `Cannot read properties of undefined (reading 'forwardRef')`, schwarze
  Seite auf `/start`, `/onboarding/:token`, `/my-website`) wäre von KEINEM
  `tests/visual/*`-Spec gefangen worden — die laufen alle gegen Vite Dev
  (kein Rollup-Chunking, kein `vite build`). Der Prod-Smoke baut stattdessen
  echt (`npm run build`) und startet `dist/index.js` mit
  `NODE_ENV=production` auf **Port 3012** (nie 3000/3005), lädt `/`,
  `/start`, `/my-website`, `/demo/werkbank`, `/onboarding/<ungültiger
  Token>` und `/site/does-not-exist` und prüft je Seite: keine `pageerror`,
  keine unerwarteten `console.error` (Drittanbieter/Font-Domains und
  generische Ressourcen-404s außer Scripts sind erlaubt — siehe
  `ALLOWED_CONSOLE_ERROR_PATTERNS` im Spec), `document.body.innerText` nicht
  leer (fängt genau die „schwarze Seite"), kein unersetztes `%VITE_` im
  ausgelieferten HTML, und jeder im HTML deklarierte
  `<script type="module">`/`<link rel="modulepreload">`-Chunk antwortet mit
  200.
  - **Playwright-Projekte**: `playwright.config.ts` definiert seit Task 1
    zwei Projekte, `dev` (`tests/visual/**`, Server auf 3005, bisheriges
    Verhalten unverändert) und `prod` (`tests/prod/**`, Server auf 3012) —
    aber Playwright startet grundsätzlich **jeden** `webServer`-Eintrag bei
    **jedem** Lauf, unabhängig vom gewählten `--project`. Damit
    `npx playwright test tests/visual/x.spec.ts` (und `npm run test:visual`)
    nicht bei jedem Aufruf zusätzlich den kompletten Prod-Build anstößt,
    schaltet die Env-Variable `PW_PROJECT=prod` beides um: nur dann wird das
    `prod`-Projekt + der Prod-`webServer` in die Config aufgenommen; ohne die
    Variable (Default) bleibt es beim bisherigen `dev`-Projekt + Dev-Server.
    `npm run test:prod` setzt `PW_PROJECT=prod` automatisch. Snapshot-Pfade
    bleiben dabei unverändert (`snapshotPathTemplate` ohne Projektnamen-
    Segment), damit bestehende `tests/visual/*-snapshots/*.png`-Baselines
    durch die Einführung der `projects`-Konfiguration nicht ungültig werden.

## 9. Offen / Nächste Schritte

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

**Plan B5 ist erledigt** (Stand `df1dd88` + Fixwelle/Fixwelle 2, siehe
`docs/superpowers/specs/2026-08-23-b5-ergebnis.md`) — Team-Add-on buchbar
und im Studio pflegbar (§Add-ons, §3 Migration 0028), Admin-Website-Liste
zeigt Pack + Studio-Link, veralteter 79-€-`CheckoutDialog` entfernt,
Dev-Dashboard-Seed + a11y-Abdeckung für Dashboard und Dark-Mode (§5, §8),
v1-Font-Rest entfernt, Landing-Chunking (§7). **Nicht erreicht:**
Kundenstatistik liefert weiterhin keine echten Werte (siehe B6-Liste
unten), Lighthouse-Budgets (LCP < 2,5 s, JS < 150 kB gzip) bleiben verfehlt
(§7 — deutliche Verbesserung, aber kein Zielerreichen).

**Offene Punkte → Plan B6:**
- **Unterseiten-Add-on** (`pages[]` im Vertrag, SSR `/site/:slug/:page`,
  Navigation in allen 14 Packs, Panel, Preis) — größter Einzelposten,
  bewusst aus B5 ausgeschlossen (eigene Spec).
- **Kundenstatistik liefert weiterhin `null` (Erfolgskriterium NICHT
  erfüllt):** B5 Task 3 hat nur den `umamiWebsiteId as any`-Cast in
  `server/routers.ts` entfernt (Lesezugriff war schon immer typkorrekt
  möglich) — geschrieben wird die Spalte im v2-Pfad aber **nirgends**.
  `registerUmamiWebsite` existierte nur in den v1-Prozeduren und wurde mit
  diesen in Plan B4b gelöscht; `server/umami.ts` exportiert seither nur noch
  `getUmamiStats` (liest), keine Registrierungsfunktion mehr. `customer.
  getAnalytics` liefert für jede v2-Website also weiterhin `null`, nicht weil
  der Typ falsch war, sondern weil `umamiWebsiteId` nie gesetzt wird. Für B6:
  Umami-Provisionierung im v2-Pfad ergänzen (z. B. im Stripe-Webhook bei
  Aktivierung, analog zur alten v1-Registrierung).
- **Add-on-Konsistenz über drei Quellen:** `onboarding_responses.addOn*`,
  `subscriptions.addOns` (JSON) und `generatedWebsites.addOn*` können
  auseinanderlaufen — ein Studio-Toggle nach Checkout (`updateAddons`)
  ändert nur die DB-Flags, berührt aber nicht das Stripe-Abo (keine
  Preis-/Rechnungsänderung). Modell/Ablauf für B6 klären (welche Quelle ist
  maßgeblich, wann synchronisieren).
- **Galerie-Abschalt-Inkonsistenz** (§Add-ons oben): Team entfernt seine
  Sektion beim Abschalten aktiv, die Galerie nicht — Designfrage
  hide-vs-remove für B6 einheitlich klären; `PhotosPanel.tsx` erlaubt
  Galerie-Pflege unabhängig vom Add-on-Flag.
- **gusto-Generierung erzeugt Speisekarte ohne Add-on:** das `gusto`-Pack
  legt bei der Website-Generierung offenbar eine `menu`-Sektion an, ohne
  dass `addOnMenu` gebucht/gesetzt ist — dieselbe Flag-vs-Sektion-Klasse von
  Bug wie beim Team-Ruling, noch nicht systematisch für alle Packs/Add-ons
  geprüft.
- **Perf-Hebel aus B5 Task 6, nicht umgesetzt** (Details/Zahlen §7):
  - Slot-freier `Button` (eigene `asChild`-Implementierung statt
    `@radix-ui/react-slot`) — einziger Grund, warum `vendor-radix`
    (~38 kB gzip) weiterhin auf `/` lädt.
  - `LazyMotion` mit echtem Async-Loader (`features={() =>
    import('framer-motion').then(m => m.domAnimation)}`) statt des aktuell
    synchron importierten Feature-Sets.
  - `modulepreload` für den Landing-Chunk als Alternative zu `LandingPage`
    eager im Entry — könnte die Rundreise vermeiden, die einen `lazy()`-
    Versuch in Task 6 scheitern ließ (LCP-Regression 3,2 s → 5,6 s), ohne
    den vollen Entry-Bundle-Nachteil zu behalten; nicht in B5 untersucht.
  - Self-hosted/Subset-Fonts statt Google-Fonts-CDN-Requests.
  - Third-Party-Skripte (Google Tag Manager ~185 KB, Rybbit-Analytics
    ~11,7 KB) — größter Einzelposten der Gesamt-Seitenlast, außerhalb des
    App-Bundles.
  - Doppel-Request für Pack-Fonts im CSR-Fallback bei Website-Wechsel ohne
    vollen Reload (§7).
- **Pack-Identität** (werkbank/marktplatz/schimmer, Ruling B5 Task 6: keine
  Rückänderung, siehe `2026-08-23-b5-ergebnis.md`): eine zweite
  Palettenfarbe `accent-text` (getrennt vom CTA-Hintergrund-Akzent) wäre
  die saubere Lösung, um Original-Signalfarben für CTAs zurückzuholen, ohne
  die bestehenden Text-auf-Hell-Stellen (Preis, Akzentwort, Zitat-Autor
  u. a.) unter 4,5:1 zu drücken — Schema-Änderung an `PackConstitution`
  über alle 14 Packs, nicht in B5 umgesetzt.
- `client/src/pages/admin/websitesPageLogic.ts` (`packNameFor`) schlägt
  aktuell direkt in `STYLE_PACKS` nach (volles Verfassungs-Modul) statt in
  der schlanken `shared/stylePacks/summary.ts` (`PACK_SUMMARY`, seit B5
  Task 6 für den Landing-Pfad eingeführt) — für die Admin-Seite unkritisch
  (kein Bundle-Budget dort), aber inkonsistent mit dem neuen Muster; bei
  Gelegenheit angleichen.
- `packs/zunft/css.ts` `.pb-zf-price` nutzt die Rolle "Siegelgold" entgegen
  dem eigenen Verfassungskommentar ("nie als Textfläche") als Textfarbe
  (Kontrast seit B4c Task 7 behoben, Rollen-Doku/Verwendung laufen aber
  auseinander).
- `server/contrast.test.ts` existiert nicht mehr (Farbkette komplett entfernt
  in B4c Task 2) — der ursprüngliche Punkt "Testerwartungen korrigieren" ist
  damit gegenstandslos.
- **Admin:** keine offenen B6-Punkte aus B5 (Pack-Anzeige/Studio-Link/
  CheckoutDialog-Entfernung erledigt; Statistik-Punkt siehe oben, dort unter
  "Kundenstatistik" statt hier separat geführt).
