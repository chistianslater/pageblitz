# Flag-Aktivierungs-Checkliste: PB_LAYOUT_V2

**Datum:** 2026-08-21
**Status:** Abnahmebereit — Freigabe durch User steht aus (CHECKPOINT nach diesem Dokument)
**Bezug:** Spec [`2026-08-20-style-packs-design.md`](2026-08-20-style-packs-design.md), Plan `docs/superpowers/plans/2026-08-21-style-packs-c1-seam-und-packs.md` + `docs/superpowers/plans/2026-08-21-style-packs-c2-packs-und-aktivierung.md`
**Branch:** `style-packs-v2`

Diese Checkliste beschreibt die Aktivierung des Vorlagen-Systems v2 („Style Packs") auf dem
Produktions-VPS über das Flag `PB_LAYOUT_V2`. Sie gilt für die **Übergangsphase**: v1 (Alt-Layouts)
und v2 (Style Packs) laufen nebeneinander, der Flag steuert pro Prozess, welcher Generierungspfad
für **neue** Website-Generierungen greift (`server/routers.ts:1799`, `PB_LAYOUT_V2 === "1"`).
Bestehende v1-Websites sind davon nicht betroffen — `WebsiteRenderer` unterscheidet pro Dokument
per `parseV2(websiteData)`, nicht global.

> **Erledigt/obsolet seit Cutover (Plan B4a, 2026-08-22).** §1–§5 beschreiben die
> Übergangsphase mit dem Flag `PB_LAYOUT_V2` — die App läuft seitdem ausschließlich
> auf v2, das Flag existiert im Code nicht mehr (siehe Spec
> `docs/superpowers/specs/2026-08-22-cutover-design.md`, Plan
> `docs/superpowers/plans/2026-08-22-onboarding-v2-b4a-umschalten.md`, Task 3).
> §1–§5 bleiben unverändert als historisches Protokoll der Aktivierung stehen.
> §6 (Studio-Vorbereitung) und §7 (Inseln & Add-on-Aktivierung) sind weiterhin
> aktuell und gelten unverändert.

---

## 1. Voraussetzungen (alle erfüllt)

| Voraussetzung | Nachweis | Commit(s) |
|---|---|---|
| Seam-Fixes: v2-sichere Onboarding-Patches, Branchen-Matching, deterministischer Fakten-Merge | Plan-C1-Task-0, Review Approved | `91a47ce` (chore), `1ab50d3` (fix) |
| Alle 14 Style Packs registriert + Client-Modul + Fixtures + Baselines | `moduleParity.test.ts` 14/14 grün, 84 Playwright-Baselines eingecheckt | Plan-C1-Task-1..4 + Plan-C2-Task-1..5, zuletzt `6fbd4a4` (fundament, „ALLE 14 PACKS KOMPLETT") |
| Branchen-Abdeckung: alle 37 SEO-Branchen haben Primär-Pack + klarwerk-Fallback, Variant-Picker liest aus Registry | `industryCoverage.test.ts` 36/36 unabhängig nachgerechnet, `packOverride`-Guard verifiziert | `0f1741f` (feat), `2074fce` (fix Pack-Override Variant-Preview) |
| `packOverride`-Prop sauber typisiert (kein `as any` an der v1/v2-Grenze) | `client/` Vitest-Suite grün | `40ea838` (Pre-Fix dieses Tasks) |

Die 3 Aktivierungs-Blocker aus Plan B (siehe C1-Ledger, `FLAG-STATUS`-Eintrag nach Task 0) sind
damit geschlossen. `PB_LAYOUT_V2=1` ist technisch aktivierbar.

### 1a. Final-Review-Fixwelle (Plan C1+C2, 2026-08-21) — behoben

Der Whole-Branch-Finalreview über C1+C2 fand drei Critical- und drei Important-Findings zur
v2-Schreib-Invariante. Alle in einer Welle behoben, Commit `9354460`
(`fix: v2-Schreib-Invariante — generateInitialContent-Guard, Picker-Persistenz, zentraler
Write-Guard, Legal-v2, Complete-Hardening`):

| Finding | Befund | Fix |
|---|---|---|
| C-1 (Critical) | `selfService.generateInitialContent` hatte keinen v2-Guard und spreadete v1-Feldnamen/-Sektionstypen in v2-Dokumente bei jedem GMB-Business im Du/Sie-Schritt | Early-return-Guard analog `saveStep` (`server/routers.ts`) — v2: kein Schreiben, keine layoutStyle-Rotation, Antwort-Shape unverändert |
| C-2 (Critical) | `selfService.selectWebsiteTemplate` schrieb nur die Legacy-Spalte `layoutStyle` — Picker-Bestätigung war für v2 wirkungslos | v2-Zweig validiert Pack-ID gegen `PACK_IDS`, setzt `websiteData.stylePackId`, re-parsed mit `WebsiteDataV2Schema`, persistiert, `invalidateSsrCache(slug)` |
| C-3 (Critical) | Sieben Einzel-Schreibpfade konnten v2-Dokumente in einen invaliden Zustand bringen (kein zentraler Schutz) | NEU `server/v2WriteGuard.ts` (`assertV2SafeWrite`), vor allen sieben `updateWebsite`-Aufrufen (`regenerateLegalPages`, `generateLegalPages`, `updateLegalData`, `uploadLogoForWebsite`, `saveTeamMembers`, `applyAiEdit`, `confirmAiEdit`); die drei Legal-Schreiber zusätzlich v2-fähig gemacht (schreiben bei v2 nach `websiteData.legal.*` statt top-level, danach `invalidateSsrCache`) |
| I-1 (Important) | `onboarding.complete` konnte bei stale v1-Sektionstypen (z. B. `"process"`, `"features"`) in `hiddenSections`/`sectionOrder` mit ZodError hart abbrechen | Unbekannte Werte werden vor `applyOnboardingToV2` gegen `SECTION_TYPES` gefiltert statt geworfen; verbleibende ZodError wird als `TRPCError(BAD_REQUEST)` mit deutscher Meldung übersetzt |
| I-2 (Important) | Das LLM konnte im v2-Generierungspfad Öffnungszeiten erfinden (`facts.contact` lieferte bislang keine echten) | `runWebsiteGenerationV2` befüllt `facts.contact.openingHours` jetzt aus `business.openingHours` (GMB `weekday_text`, gemappt auf `{day, hours}`); Prompt-Verbotszeile erweitert; `mergeFacts` strippt vom LLM erfundene Öffnungszeiten, wenn facts keine liefern |
| I-3 (Important) | Diese Aktivierungs-Doku war nach der Fixwelle veraltet | Dieser Abschnitt + §4 (bekannte Grenzen) + Prüfschritt in §3 — separater docs-Commit direkt nach `9354460` |

Tests: `server/v2WriteGuard.test.ts`, `server/routers.v2Guards.test.ts` (C-1/C-2/C-3),
`server/routers.onboardingCompleteV2.test.ts` (I-1), `server/generationV2/generateSiteContent.test.ts`
+ `contentPrompt.test.ts` (I-2, aktualisiert). Gesamtsuite weiterhin grün (siehe §2-Update unten).

**Nachtrag (2026-08-21, Restlücken-Fix):** Der C-3-Guard deckte zunächst sieben Schreibpfade ab.
Eine gezielte Nachprüfung fand vier weitere `updateWebsite`-Aufrufe ohne `assertV2SafeWrite`:
`customer.updateServices`, `customer.updateDesign`, `customer.updateAddons` und `website.regenerate`
(Admin-Regenerierung). Alle vier sind jetzt ebenfalls unmittelbar vor dem Persist geguardet —
**Gesamtabdeckung: elf geschützte Schreibpfade (7+4)**. `website.regenerate` lehnt die Regenerierung
eines gespeicherten v2-Dokuments mit der Guard-Fehlermeldung ab, da die LLM-Ausgabe des
Regenerierungspfads v1-förmig ist und nicht gegen `WebsiteDataV2Schema` besteht. v1-Verhalten bleibt
für alle vier Pfade byte-identisch (Guard ist bei v1-Dokumenten ein No-Op). Tests: zwei neue Fälle in
`server/routers.v2Guards.test.ts` (`customer.updateAddons`, `website.regenerate`, jeweils gespeichertes
v2-Dokument + korrumpierender Payload → `TRPCError`, kein `updateWebsite`-Aufruf). Siehe auch §4
Punkt 6 (korrigierte Menü/Preisliste-Aussage).

## 2. Lokale E2E-Probe (dieser Task, 2026-08-21)

Verifikation vor der VPS-Freigabe — Dev-Server `PORT=3005 npm run dev`, danach per PID gestoppt
(Playwright startet für `pnpm test:visual` seinen eigenen Server, `reuseExistingServer: false`).

**Curl-Probe `/dev/site-preview?pack=<id>&fixture=full`** — je Pack: Sektions-Anker
(`leistungen`/`speisekarte`), `LocalBusiness`-JSON-LD, `fonts.googleapis`-Link, alle ≥ 1 Treffer:

| Pack | HTTP | Anker | LocalBusiness | Fonts |
|---|---|---|---|---|
| werkbank | 200 | 2 | 1 | 2 |
| kanzlei | 200 | 2 | 1 | 2 |
| morgenlicht | 200 | 2 | 1 | 2 |
| gusto | 200 | 2 | 1 | 2 |
| patina | 200 | 2 | 1 | 2 |
| salon-noir | 200 | 3 | 1 | 2 |
| marktplatz | 200 | 2 | 1 | 2 |
| landgut | 200 | 2 | 1 | 2 |
| atelier | 200 | 2 | 1 | 2 |
| klarwerk | 200 | 3 | 1 | 2 |
| verve | 200 | 2 | 1 | 2 |
| zunft | 200 | 2 | 1 | 2 |
| schimmer | 200 | 3 | 1 | 2 |
| fundament | 200 | 2 | 1 | 2 |

14/14 Packs bestehen.

**Gesamtsuite** `npx vitest run`: 313 grün, 6 bekannte env-bedingte Fehlschläge (kein lokaler
`RESEND_API_KEY`/`STRIPE_SECRET_KEY`: `server/resend.test.ts` × 2, `server/contrast.test.ts` × 4;
zusätzlich brechen `server/auth.logout.test.ts` und `server/pageblitz.test.ts` bereits beim Import
von `server/routers.ts` ab, weil `new Stripe("")` ohne Key wirft — 0 Tests, kein Produktcode-Fehler).
Keine dieser 6 Fehlschläge betrifft Style-Pack-Code.

**Update nach Final-Review-Fixwelle (§1a):** `pnpm vitest run server/ shared/ client/` weiterhin
grün bei denselben 6 bekannten env-Fehlschlägen (unverändert, DB/Resend/Stripe-Konfiguration —
nicht mit dieser Fixwelle verbunden); zusätzlich 6 neue Tests aus §1a grün
(`v2WriteGuard.test.ts`, `routers.v2Guards.test.ts`, `routers.onboardingCompleteV2.test.ts`).
`pnpm test:visual` unverändert 84/84 (Fixwelle berührt keine Rendering-/CSS-Pfade).

**Visuelle Regression** `pnpm test:visual`: zweimal hintereinander ausgeführt, beide Male
**84/84 grün** (14 Packs × 2 Fixtures × 3 Breakpoints) — bestätigt deterministische Baselines
(Ruling aus C1: schimmer nutzt bewusst Flat-Orbs statt Gradient dafür).

## 3. VPS-Aktivierung

Voraussetzung: Zugriff wie in `HOSTINGER-SETUP.md` beschrieben (`ssh -i ~/.ssh/claude_pageblitz
root@76.13.147.95`, App-Pfad `/root/pageblitz`).

1. **Deploy per bestehendem Verfahren** (Code-Stand `style-packs-v2` bzw. der gemergte Zielbranch):
   ```bash
   ssh -i ~/.ssh/claude_pageblitz root@76.13.147.95
   cd /root/pageblitz
   git fetch origin && git reset --hard origin/main
   npm run build
   pm2 restart pageblitz
   ```
   An dieser Stelle läuft die App noch mit `PB_LAYOUT_V2` unset → v1-Pfad unverändert aktiv.
   Regressionscheck: bestehende Kundenseite laden, unverändertes Verhalten bestätigen.

2. **Flag setzen.** Der Server lädt Umgebungsvariablen über `dotenv/config` aus der `.env`-Datei
   im App-Verzeichnis (nicht aus PM2s eigenem Environment-Snapshot) — also in `.env` eintragen,
   nicht nur exportieren:
   ```bash
   nano /root/pageblitz/.env
   # Zeile hinzufügen/ändern:
   PB_LAYOUT_V2=1
   ```
   Danach neu starten, damit der Prozess die Datei erneut einliest:
   ```bash
   pm2 restart pageblitz
   ```

3. **Testgenerierung mit echtem GMB-Business.** Über das Admin-Panel eine echte GMB-Suche +
   Generierung für ein reales Unternehmen durchführen (nicht nur eine Fixture). Prüfen:
   - Generierung läuft ohne Fehler durch (`runWebsiteGenerationV2`-Pfad, siehe `pm2 logs pageblitz`).
   - Das gewählte Pack passt zur Branche (kein klarwerk-Fallback bei einer der 37 abgedeckten
     Branchen — Fallback ist für Rest-Branchen korrektes Verhalten, kein Bug).
   - Variant-Picker im Onboarding zeigt unterschiedliche Packs pro Kachel (nicht denselben Pack
     mehrfach — das wäre der `packOverride`-Regressionsfall aus Task 6/Pre-Fix).
   - **Gewähltes Pack wird nach Confirm gerendert:** im Picker ein anderes Pack als das
     Rotations-Ergebnis auswählen und bestätigen, danach die Vorschau/Live-Seite neu laden —
     `websiteData.stylePackId` muss dem gewählten Pack entsprechen (Regressionscheck für C-2,
     siehe §1a). Vor dem Fix blieb die Bestätigung wirkungslos (nur die Legacy-Spalte
     `layoutStyle` wurde geschrieben, v2-Renderer liest aber `stylePackId`).

4. **Live-Check der generierten Seite:**
   ```bash
   curl -s "https://<slug>.pageblitz.de" | grep -o '"@type":"LocalBusiness"'
   curl -s "https://<slug>.pageblitz.de" | grep -o 'fonts.googleapis[^"]*' | head -1
   ```
   Erwartet: mindestens ein `LocalBusiness`-Treffer (Schema.org-JSON-LD im SSR-HTML) und ein
   `fonts.googleapis`-Link. Zusätzlich im Browser: Seite lädt, Hero + Abschnitte rendern, keine
   Konsolenfehler.

5. **Rollback**, falls nötig — Flag entfernen (nicht auf `0` setzen, der Code prüft nur auf den
   String `"1"`, ein anderer Wert wäre zwar ebenfalls harmlos, aber das Entfernen macht die Absicht
   im `.env`-Diff eindeutig) + Neustart:
   ```bash
   nano /root/pageblitz/.env   # Zeile PB_LAYOUT_V2=1 entfernen
   pm2 restart pageblitz
   ```
   Bereits generierte v2-Websites bleiben unberührt und funktionsfähig (`WebsiteRenderer`
   entscheidet pro Dokument, nicht global) — Rollback betrifft ausschließlich **neue**
   Generierungen, die danach wieder über den v1-Pfad laufen.

## 4. Bekannte Grenzen der Übergangsphase

Diese Punkte sind bewusst nicht Teil dieses Tasks — sie werden mit **Teilprojekt B**
(neuer Onboarding-Flow) adressiert und hier dokumentiert, damit die Aktivierung nicht versehentlich
als „fertig" missverstanden wird:

1. **Alter Onboarding-Chat patcht `websiteData` erst beim Complete.** Die Seam-Fixes aus C1-Task-0
   machen den Alt-Chat v2-*sicher* (keine v1-Struktur-Sideeffects mehr während des Chats), aber
   die Live-Vorschau im Chat zeigt weiterhin den Stand **nach der letzten Generierung**, nicht
   live mitgepatchte Zwischenstände. Erst `applyOnboardingToV2` beim Complete-Schritt schreibt die
   Chat-Antworten strukturiert in `websiteData` zurück. Für Nutzer bedeutet das: Änderungen im
   Chat (z. B. Öffnungszeiten, Zusatzleistungen) werden erst nach Abschluss des gesamten Chats in
   der Vorschau sichtbar, nicht Schritt für Schritt.
2. **`gusto`-Menü-Hardcode / `prefersMenu`-Flag fehlt.** `resolveSections` behandelt die
   Sektionsart „menu" aktuell mit einer festen Zuordnung auf das Pack `gusto`; ein generisches
   `prefersMenu`-Flag (das auch andere Packs mit Speisekarten-Bedarf abdecken würde) ist noch
   nicht gebaut. `zunft` umgeht das bereits über `pricelist` statt `menu` — betroffen sind also nur
   hypothetische zukünftige Gastro-nahe Packs außerhalb von gusto, kein akuter Bug.
3. **A11y- und Performance-Pass ausstehend (Spec §8.4/§8.5).** Der axe-Check pro Pack und das
   Performance-Budget (< 30 kB JS ohne Inseln, LCP-Bildmaße/`fetchpriority`) sind in der Spec als
   eigene Teststufen vorgesehen, aber noch nicht als CI-Gate verdrahtet. Bekannte offene
   Kontrast-Minor-Findings aus den Pack-Reviews (z. B. Rosé-CTA ~3,1:1 bei schimmer, CTA-Kontrast
   bei einzelnen Packs unter WCAG-AA) sind einzeln in den C1/C2-Ledgern vermerkt und werden im
   familienweiten a11y-Pass von Teilprojekt B behoben statt einzeln nachgezogen.
4. **Altsystem-Löschung (Spec §7) folgt erst nach Teilprojekt B.** `client/src/components/layouts/`
   (inkl. `PremiumLayoutsV2.tsx`), der v1-Zweig in `WebsiteRenderer`, `VARIANT_FAMILY_RANKINGS`,
   `getLayoutKeyByIndustry`, `getLayoutPool` und die Alt-Font-/Farb-Mechanik in
   `shared/layoutConfig.ts` bleiben bewusst bestehen, bis der neue Onboarding-Flow (Teilprojekt B)
   steht — der alte Chat schreibt noch v1-Pfade und braucht sie als Fallback während der
   Übergangsphase. Erst danach ist der ersatzlose Löschschritt aus Spec §7 sicher.
5. **Im alten Chat nie angewendete v2-Antworten.** Der C-1-Guard (§1a) verhindert zwar, dass der
   Alt-Chat v2-Dokumente korrumpiert, aber er lässt die betroffenen Chat-Schritte für v2-Websites
   funktional wirkungslos: Beschreibung-/USP-/Leistungs-Texte aus `generateInitialContent` werden
   nicht mehr ins Dokument geschrieben, ebenso wenig die Hero-/About-Foto-Wahl und die Team-Daten aus
   dem Team-Schritt (`customer.saveTeamMembers`, seit C-3 geguardet). Für v2-Websites bleiben diese
   Inhalte auf dem Stand der Erstgenerierung (`runWebsiteGenerationV2`), bis der neue Onboarding-Flow
   aus Teilprojekt B sie mit v2-nativen Schreibpfaden ersetzt.
6. **Dashboard-Guard meldet sauberen Fehler statt still zu korrumpieren.** Sieben
   Dashboard-Funktionen unterstützen v2-Websites fachlich noch nicht: die vier aus der C-3-Fixwelle
   (`customer.uploadLogoForWebsite`, `customer.saveTeamMembers`, `customer.applyAiEdit`,
   `customer.confirmAiEdit`) sowie drei weitere aus dem Restlücken-Fix im Nachtrag oben
   (`customer.updateServices`, `customer.updateDesign`, `customer.updateAddons`). Ihre
   v1-Feldnamen/-Sektionsformen (z. B. `logoImageUrl`/`teamMembers`, oder bei `updateAddons` das
   Menü-/Preislisten-Sektionsformat mit `mode`/`albums`/`items` statt `categories`) passen nicht ins
   strikte `WebsiteDataV2Schema`. Alle sieben werfen bei einer v2-Website `TRPCError(BAD_REQUEST)`
   mit der Meldung „Diese Funktion unterstützt das neue Website-Format noch nicht." statt das
   Dokument still zu korrumpieren (`server/v2WriteGuard.ts`). Konkret bedeutet das: **Menü- und
   Preislisten-Bearbeitung über `customer.updateAddons` ist für v2-Kunden im Dashboard aktuell
   funktional gesperrt** (sauberer Fehler statt stiller Korruption) — nicht bereits unterstützt, wie
   eine frühere Fassung dieses Dokuments an dieser Stelle fälschlich suggerierte. Der achte im
   Nachtrag geguardete Pfad, `website.regenerate`, ist keine Dashboard-, sondern eine
   Admin-Funktion (Vorschau-Regenerierung im Admin-Panel) — für eine gespeicherte v2-Website lehnt
   sie die Regenerierung mit derselben Guard-Fehlermeldung ab, statt das Dokument mit v1-förmiger
   LLM-Ausgabe zu überschreiben. Bis Teilprojekt B diese acht Schreibpfade v2-nativ nachrüstet (inkl.
   Add-on-Bearbeitung für v2), bleiben sie für v2-Dokumente funktional gesperrt, nicht fehlerfrei
   nutzbar.

## 5. Verantwortlichkeit für den nächsten Schritt

Dieses Dokument macht die Aktivierung möglich, führt sie aber nicht selbstständig aus. Nächster
Schritt laut Plan: dem User die Desktop-PNGs der 10 in Plan C1+C2 neu gebauten Packs (patina,
salon-noir, marktplatz, landgut, atelier, klarwerk, verve, zunft, schimmer, fundament — zusätzlich
zu den 4 Leuchtturm-Packs werkbank, kanzlei, morgenlicht, gusto aus Plan A) zeigen und die
Merge-Freigabe einholen — Abnahme vor Beginn von Teilprojekt B.

## 6. Onboarding v2 (Studio) — Vorbereitung

Teilprojekt B (Plan B1 „Studio-Fundament") führt eine neue Studio-Oberfläche unter
`/onboarding/:token` ein (`client/src/pages/onboarding-v2/`). Sie ist bewusst **nicht** an das
`PB_LAYOUT_V2`-Flag aus §1–§5 gekoppelt — dieses steuert nur, welcher Generierungspfad neue
v2-Websites erzeugt, nicht welche Onboarding-Oberfläche der Kunde sieht. Vor der VPS-Aktivierung
des Studios sind folgende Punkte zu beachten:

1. **DB-Migration `drizzle/0025_studio_progress.sql`.** Handgeschrieben, wie 0013–0024 (kein
   `drizzle-kit generate`, siehe §1). Fügt `onboarding_responses.studioProgress` (JSON) hinzu —
   die Bestätigungs-Flags (`styleConfirmed`, `textsReviewed`, `addonsReviewed`), die sich nicht
   aus `websiteData` ableiten lassen (siehe `shared/onboardingV2/checklist.ts`). Auf dem VPS wie
   die übrigen `NNNN_*.sql`-Dateien manuell per `mysql` einspielen:
   ```bash
   ssh -i ~/.ssh/claude_pageblitz root@76.13.147.95
   mysql -u <user> -p <db> < /root/pageblitz/drizzle/0025_studio_progress.sql
   ```
   Ohne diese Spalte schlägt jeder Studio-Aufruf beim Lesen/Schreiben des Fortschritts fehl.

2. **Route `/preview-ssr/:token` ist öffentlich erreichbar.** Kein Auth-Check — das Token selbst
   ist das Geheimnis (32 Zeichen, `nanoid(32)`). Die Route liefert serverseitig gerendertes HTML
   (auch für die Mini-Preview-iframes im Stil-Panel, per `?pack=<id>`-Override) und muss `noindex`
   sowie `Cache-Control: no-store` setzen — die Seite darf weder in Suchmaschinen landen noch
   veraltete Zwischenstände aus einem Cache/CDN ausliefern, während der Kunde im Studio aktiv
   Änderungen vornimmt.

3. **`/dev/studio-seed` existiert nur außerhalb production.** Die Route prüft
   `process.env.NODE_ENV === "production"` und antwortet dann mit `404` (siehe
   `server/onboardingV2/devSeed.ts`). Auf dem VPS ist sie damit automatisch deaktiviert, solange
   `NODE_ENV=production` gesetzt ist — kein zusätzlicher Schritt nötig, aber vor jedem Deploy
   gegenprüfen, dass diese Variable tatsächlich gesetzt ist (sonst wäre die Seed-Route, die
   Websites ohne Bezahlvorgang anlegt, öffentlich erreichbar).

4. **StartPage führt bis Plan B3 weiter in den alten Chat.** Der bestehende Funnel
   (Landing → StartPage → `OnboardingChat.tsx`) bleibt unverändert aktiv; das Studio ist bis zum
   Abschluss von Plan B3 ausschließlich per Direktlink `/onboarding/:token` erreichbar (z. B. für
   internes Testing oder gezielt verschickte Links), nicht über einen regulären Nutzerpfad. Erst
   Plan B3 verdrahtet StartPage/Checkout mit dem neuen Studio-Flow.

5. **Lokale Entwicklung braucht eine erreichbare MySQL.** Der Dev-Server (`npm run dev`) verbindet
   sich beim Start mit der DB; ohne sie schlägt bereits `/dev/studio-seed` fehl. Lokal z. B. per
   Docker:
   ```bash
   docker run -d --name pageblitz-mysql -p 3306:3306 \
     -e MYSQL_ROOT_PASSWORD=<aus .env> -e MYSQL_DATABASE=<aus .env> \
     mysql:8.4
   npx drizzle-kit push
   ```
   `npx drizzle-kit push` spiegelt das aktuelle Schema (inkl. `studioProgress`) direkt in die neue
   Instanz — Alternative zum manuellen Abspielen aller `NNNN_*.sql`-Dateien für lokale Zwecke.

6. **Studio-Checkout nutzt denselben Webhook wie der alte Funnel.** `createStudioCheckoutSession`
   (`server/onboardingV2/checkout.ts`) baut dieselben Stripe-Metadaten (`websiteId`, `userId`,
   `billingInterval`, `addOns` als JSON, `totalAmount`) wie das bestehende
   `checkout.createSession` in `server/routers.ts`. Seit Plan B3 (Task 2) normalisiert der Webhook
   (`server/stripeWebhookHandlers.ts`, `handleCheckoutCompleted`) alle 7 Add-on-Keys und schaltet
   sie nach Zahlung frei — sowohl als Website-Flags (`addOnAiChat`/`addOnBooking`/`addOnTeam`) als
   auch, für v2-Dokumente, als `features` im Dokument. Von den Add-ons ist im Studio nur `team`
   nicht buchbar (`BOOKABLE_ADDON_KEYS` in `shared/pricing.ts` enthält seitdem auch `aiChat` und
   `booking`); `team` gilt weiterhin als "Coming Soon" (`COMING_SOON_KEYS` in
   `client/src/pages/onboarding-v2/panels/AddonsPanel.tsx`, clientseitig gesperrt, da das
   Team-Panel noch fehlt). Serverseitig ist das seit dem Final-Review-Fix (Finding I1,
   `server/onboardingV2/routerCommerce.ts`) hart
   erzwungen: `updateAddons` lehnt jeden Request mit `team` auf `true` mit
   `BAD_REQUEST` ab (kein Write), und `createCheckout` schickt `sanitizeAddOns(state.addOns)` an
   Stripe — eine veraltete DB-Zeile mit z. B. `addOnTeam=true` kann sich also nicht mehr in Preis
   oder Metadaten einschleichen.

   **E-Mail-Dedupe (Finding I3).** `setCustomerEmail` verschickt die Willkommens-/Lifecycle-Mails
   nur, wenn sich die E-Mail gegenüber dem gespeicherten Stand tatsächlich ändert (normalisiert
   über lowercase/trim) — ein erneuter Aufruf mit derselben Adresse (Reload, Doppelklick) löst
   keinen zweiten Mailversand mehr aus.

   **Upload-Obergrenze (Finding I4).** `uploadPhoto` (`server/onboardingV2/routerContent.ts`) lehnt
   ab dem 31. eigenen Foto pro Website mit `BAD_REQUEST` ab (`MAX_UPLOADED_PHOTOS = 30`);
   `PhotosPanel.tsx` sperrt den Upload-Button clientseitig bereits vorher.

7. **KI-Vorschläge sind pro Website rate-limitiert.** `assertSuggestQuota`
   (`server/onboardingV2/suggest.ts`) erlaubt maximal 30 Vorschlags-Aufrufe pro Website und
   rollierender Stunde, rein prozesslokal (`Map` im Speicher, kein Redis) — ein
   Instanz-Neustart oder ein zweiter PM2-Prozess setzt das Limit zurück bzw. verdoppelt es
   effektiv. Für einen einzelnen Kunden im Studio reicht das; bei horizontaler Skalierung
   müsste das Limit auf einen gemeinsamen Store (z. B. Redis) verlegt werden.

8. **Fotos-Uploads laufen über den bestehenden Storage-Pfad.** `PhotosPanel` lädt Dateien über
   `onboardingV2.uploadPhoto` hoch, das intern `uploadPhotoToStorage`
   (`server/onboardingUpload.ts` → `storagePut`) verwendet — denselben S3/R2-Pfad wie der alte
   Chat, inklusive Kompression (`sharp`) und dem serverseitigen 8-MB-Limit auf die base64-Data-URL
   (`ImagesPatchSchema`/`uploadPhoto`-Input; client-seitig auf 5 MB begrenzt, siehe
   `PhotosPanel.tsx`). Kein neuer Storage-Mechanismus, keine zusätzliche VPS-Konfiguration nötig.

9. **`legalGenerator` escaped jetzt alle Nutzerwerte.** Commit `5a019fa` hat einen Stored-XSS
   über Impressum/Datenschutz geschlossen: alle interpolierten Felder (`businessName`,
   `legalOwner`, `legalStreet`, `legalZip`, `legalCity`, `legalCountry`, `legalEmail`,
   `legalPhone`, `legalVatId`, `legalRegister`, `legalRegisterCourt`, `legalResponsible`,
   `websiteUrl`) laufen durch eine `esc()`-Hilfsfunktion, bevor sie in generiertes HTML
   eingebettet werden. `legalGenerator.ts` wird von beiden Onboarding-Pfaden genutzt — der Fix
   gilt also gleichermaßen für das neue Studio-Rechtliches-Panel wie für den alten
   `OnboardingChat.tsx`-Impressum-Schritt, ohne dass an letzterem etwas geändert werden musste.

## 7. Inseln & Add-on-Aktivierung (Plan B3)

Diese Zusammenfassung bildet ab, wie Kundenseiten-Features (Kontaktformular, KI-Chat, Terminbuchung)
als Hydration-„Inseln" ausgeliefert werden und wie Add-on-Freischaltung über den Stripe-Webhook
erfolgt. Neu geschrieben nach der Final-Review-Fixwelle (Finding I2) — nur noch verifizierte Fakten
mit den tatsächlichen Symbolnamen, keine Zeilenangaben (die veralten bei jeder Änderung).

### 7.1 Build & Deployment: Islands-Bundle

1. **Build-Reihenfolge (Finding C1):** `npm run build` (`package.json`) führt zuerst `vite build`
   aus (leert `dist/public/` per `emptyOutDir`) und **danach** `npm run build:islands` — vorher lief
   es umgekehrt und Vite löschte das gerade gebaute Inseln-Bundle wieder. Ein Vitest
   (`server/ssr/buildOrder.test.ts`) prüft diese Reihenfolge per String-Index-Vergleich in
   `package.json`, damit sie nicht unbemerkt wieder vertauscht wird.
2. **Gehashter Dateiname (Finding M1):** `scripts/build-islands.mjs` baut
   `client/src/site-islands/main.tsx` per esbuild zu `dist/public/islands/site-islands.<hash>.js`
   (Content-Hash, esbuild `entryNames`) und schreibt `dist/public/islands/manifest.json`
   (`{ "file": "site-islands.<hash>.js" }`) daneben.
3. **Pfadauflösung zur Laufzeit:** `server/ssr/islandsBundle.ts` (`getIslandsBundlePath()`) liest das
   Manifest einmal pro Prozess (gecacht) und liefert `/islands/<name>.<hash>.js`. Ohne lesbares
   Manifest (z. B. Dev-Server ohne vorherigen `build:islands`, Tests) fällt der Pfad auf den
   ungehashten Namen `site-islands.js` zurück. `server/ssr/renderSite.tsx` bindet diesen Pfad als
   `<script type="module" src="…" defer>` ein.
4. **Server-Auslieferung:** `server/_core/index.ts` mountet `/islands` via `express.static(...)` mit
   `maxAge: "365d", immutable: true` — sicher, weil der Dateiname bei jedem neuen Build seinen Hash
   wechselt, alte URLs also nie versehentlich neuen Inhalt ausliefern.
5. **Lokale Entwicklung:** Der Dev-Server (`npm run dev`) baut das Inseln-Bundle NICHT automatisch.
   Vor Playwright-Läufen oder manuellem Testen einmalig `npm run build:islands` ausführen, sonst
   laden Kundenseiten-Vorschauen ein veraltetes/fehlendes Bundle.

### 7.2 Inseln auf Kundenseiten

Jede v2-Website rendert unter ihrer Pfadform (`/site/<slug>` auf pageblitz.de) und ihrer Subdomain
(`<slug>.pageblitz.de`) bis zu drei optionale Inseln, sofern die entsprechenden `features`-Flags im
v2-Dokument aktiv sind (`hasActiveFeatures`, `client/src/components/site/islands/SiteIslands.tsx`).
Alle Inseln sind No-JS-fähig, wo ein Formular beteiligt ist:

1. **Kontaktformular** (`features.contactForm === true`):
   - Rendert als `<form method="POST" action="/api/site/:slug/contact">` (kein Token-Feld — nur
     Name/E-Mail/Telefon/Nachricht + Honeypot-Feld `website_url`, siehe `ContactFormIsland.tsx`).
   - No-JS-Fallback: echter Formular-POST → HTTP-303-Redirect mit `?kontakt=gesendet` bzw.
     `?kontakt=fehler#kontakt`. Mit JS: Fetch-Submit ohne Seitenreload.
   - Rate-Limit: 5 Einreichungen pro IP pro Stunde (`server/contactSubmit.ts`).
   - **Finding I3 (Gate):** `submitContactRequest()` prüft vor jeder Einreichung, ob das Add-on
     tatsächlich aktiv ist — v2: `features.contactForm === true`; v1 (kein v2-Dokument):
     `onboarding_responses.addOnContactForm === true`. Sonst `NOT_FOUND` „Kontaktformular nicht
     aktiv". Im `status: "preview"` (noch nicht verkauft) wird die Einreichung gespeichert, aber
     **keine** Owner-Mail verschickt.
   - Endpoint: `POST /api/site/:slug/contact` (`server/contactSubmit.ts`).

2. **KI-Chat-Widget** (`features.aiChat === true`):
   - Endpoint: `POST /api/chat/:slug/message` (`server/_core/chatRoutes.ts`).
   - Einfacher Fetch/JSON-Request-Response-Zyklus, **kein** Streaming.
   - Rate-Limit: 10 Anfragen pro IP pro Tag (`checkIpLimit`, prozesslokaler In-Memory-Zähler),
     zusätzlich ein monatliches Nutzungslimit pro Website (`chatUsageCount`-Spalte).

3. **Terminbuchung** (`features.booking === true`):
   - Read: `GET /api/booking/:slug/settings`, `GET /api/booking/:slug/slots`.
   - Write: `POST /api/booking/:slug/book`, `GET /api/booking/:slug/cancel/:token`.
   - Endpoints in `server/_core/bookingRoutes.ts`.

**Preview-Modus (`islandsMode`):** Dashboard, Editor und Studio-Vorschauen rendern dieselben
Komponenten mit der Prop `islandsMode="preview"` (durchgereicht `WebsiteRenderer` → `SiteRenderer`
→ `SiteIslands` als `mode`). Im Preview-Modus sind die Inseln nicht interaktiv (read-only
Schnappschuss) — nur echtes SSR über `renderSiteHtml()`/`islandsMode` default `"live"` hydratisiert
tatsächlich.

### 7.3 Webhook & Add-on-Aktivierung

Der Stripe-Webhook (`server/stripeWebhookHandlers.ts`, Funktion `handleCheckoutCompleted`) läuft bei
`checkout.session.completed`:

1. **Normalisiert alle 7 Add-on-Keys** (`normalizeAddOns`): akzeptiert sowohl das alte
   `{ features: {…} }`-Metadatenformat als auch das aktuelle flache Format; Default `false`.
   **Finding M5:** das `JSON.parse` der `addOns`-Metadaten steht in try/catch mit Fallback `{}` —
   kaputte/manipulierte Metadaten lassen den Webhook nicht mehr mit 500 abbrechen (sonst würde
   Stripe retryen und `createSubscription` liefe ein zweites Mal, nicht idempotent).
2. **Schreibt drei Website-Spalten** (v1 + v2 gleichermaßen): `addOnAiChat`, `addOnBooking`,
   `addOnTeam`.
3. **Spiegelt freischaltbare Extras in v2-`features`** (nur wenn `websiteData` ein valides
   v2-Dokument ist): `features.contactForm`, `features.aiChat`, `features.booking`.
4. **Speichert `subscriptions.checkoutEmail`** (Finding I1, Migration
   `drizzle/0026_subscription_checkout_email.sql`):
   `session.customer_details?.email ?? session.customer_email`,
   lowercase/getrimmt, **einmalig und danach unveränderlich**. Ersetzt
   `generatedWebsites.customerEmail` als Quelle für den Orphan-Claim — jenes Feld bleibt vor dem
   Kauf frei schreibbar (`selfService.saveCustomerEmail`/`onboardingV2.setCustomerEmail`) und wäre
   sonst ein Account-Takeover-Vektor. Beide Prozeduren lehnen Schreibversuche nach dem Kauf
   (`website.status !== "preview"`) jetzt mit `BAD_REQUEST` ab.
5. **Bindet verwaiste Abos** (`server/linkSubscriptions.ts`, `linkOrphanSubscriptionsToUser`):
   entstehen Abos mit `userId = 0` (Webhook konnte keinen Nutzer zuordnen), sucht
   `db.listOrphanSubscriptionsByCheckoutEmail(email)` nach dem Login/Registrieren passende Abos über
   `subscriptions.checkoutEmail` (case-insensitiv/getrimmt, **kein** Fallback auf
   `generatedWebsites.customerEmail`) und bindet sie. `server/onboardingV2/ownership.ts`
   (`loadStudioWebsite`, `isOrphanClaim`) nutzt denselben Vergleich für den Studio-Zugriff.
   Idempotent: nach dem Binden ist `userId ≠ 0`, ein erneuter Aufruf ist ein No-Op.

### 7.4 KI-Chat im Studio (`onboardingV2.aiEdit`)

Der KI-Chat im Studio (`/onboarding/:token`, „Was soll anders sein?") läuft über die
`onboardingV2`-Prozeduren in `server/onboardingV2/routerAi.ts`, die auf
`server/onboardingV2/aiEdit.ts` aufbauen:

1. **Zwei-Schritt-Fluss, nie automatisch gespeichert:** `onboardingV2.aiEdit` ruft
   `proposeAiEdit()` auf, das bei einem Inhalts-Vorschlag ein neues, bereits fakten-restauriertes
   Dokument samt Diff liefert — zwischengespeichert nur im Prozess-Memory
   (`server/onboardingV2/aiEdit.ts`, `proposals`-Map, TTL 10 Minuten). Erst
   `onboardingV2.applyAiEdit` (mit `proposalId`) schreibt über `persistDoc` tatsächlich in DB/
   `websiteData`. `onboardingV2.discardAiEdit` verwirft einen Vorschlag explizit; ein abgelaufener/
   unbekannter Vorschlag bei `applyAiEdit` liefert `BAD_REQUEST`.
2. **Drei mögliche Ergebnisse** (`ProposeAiEditResult`): `kind: "content"` (Text-/Sektionsänderung
   mit Diff), `kind: "style"` (Stil-Pack-Wechsel-Vorschlag statt Farb-/Font-Patch) oder
   `kind: "reject"` (z. B. bei einem Fakten-Wunsch, den die KI nicht erfüllen darf).
3. **Fakten-Garantie** (`server/onboardingV2/aiEditFacts.ts`): `assertSameSectionTypeSet` lehnt
   erfundene/entfernte Sektionstypen ab (löst einen Retry aus); `restoreFacts` kopiert Fakten
   (u. a. `imageUrl`/`ctaHref` je Sektion, die komplette `contact`-Sektion) aus dem Original-Dokument
   zurück in den KI-Kandidaten, bevor er als Vorschlag gespeichert wird — die KI kann Bilder, Links
   und Kontaktdaten also nicht verändern, selbst wenn sie es versucht.
4. **Retry:** genau ein Wiederholungsversuch bei einem fehlgeschlagenen/ungültigen LLM-Aufruf
   (`MAX_AI_EDIT_ATTEMPTS = 2`), danach `INTERNAL_SERVER_ERROR` mit deutscher Fehlermeldung.
5. **Quota:** 20 Anfragen pro Website und rollierender Stunde (`assertAiEditQuota`, eigener Bucket
   `"aiEdit"` in der generalisierten `assertQuota()` aus `server/onboardingV2/suggest.ts` — dieselbe
   Funktion zählt für die Panel-Vorschläge dort separat unter dem Bucket `"suggest"`, 30/h).
   Prozesslokal (In-Memory-Map) heißt: bei mehreren PM2-Prozessen zählt jeder Prozess einzeln — für
   die Beta ausreichend, bei horizontaler Skalierung würde ein gemeinsamer Speicher (z. B. Redis)
   nötig.
6. **LLM-Mocking:** `PB_LLM_MOCK=1` aktiviert `mockAiEditResponse()` (deterministischer
   Inhalts-Vorschlag ohne echten LLM-Aufruf, hängt der Hero-Headline ein „✓" an) — nur wirksam bei
   `process.env.NODE_ENV !== "production"` (`isLlmMockEnabled()` in `aiEdit.ts`). Playwright setzt
   das Flag über `playwright.config.ts` (`webServer.command`); auf dem VPS mit
   `NODE_ENV=production` bleibt es automatisch inaktiv.

### 7.5 Deferred (nach Plan B3)

Folgende Features sind bewusst ausgelagert und folgen in späteren Plänen:

- **Unterseiten-Add-on** (separate Seite pro Add-on): verschoben nach Plan B4.
- **Team-Panel im Studio:** Team-Verwaltung ist im Checkout noch nicht buchbar (`COMING_SOON_KEYS`
  in `AddonsPanel.tsx`). Das Team-Panel UI und die vollständige Team-Verwaltung im Studio folgen
  in Plan B3+ oder später.
