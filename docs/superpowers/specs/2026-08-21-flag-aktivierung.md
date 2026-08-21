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
   nicht mehr ins Dokument geschrieben, ebenso wenig die Hero-/About-Foto-Wahl und Add-on-Daten aus
   Menü-, Preislisten- und Team-Schritten (Guard aus C-3 blockiert deren `updateWebsite`-Aufrufe für
   v2 mit einer sauberen Fehlermeldung statt stiller Korruption). Für v2-Websites bleiben diese
   Inhalte auf dem Stand der Erstgenerierung (`runWebsiteGenerationV2`), bis der neue Onboarding-Flow
   aus Teilprojekt B sie mit v2-nativen Schreibpfaden ersetzt.
6. **Dashboard-Guard meldet sauberen Fehler statt still zu korrumpieren.** Die vier
   Dashboard-Funktionen `customer.uploadLogoForWebsite`, `customer.saveTeamMembers`,
   `customer.applyAiEdit` und `customer.confirmAiEdit` unterstützen v2-Websites fachlich noch nicht
   (v1-Feldnamen wie `logoImageUrl`/`teamMembers` passen nicht ins strikte `WebsiteDataV2Schema`).
   Seit der Fixwelle in §1a werfen sie bei einer v2-Website `TRPCError(BAD_REQUEST)` mit der
   Meldung „Diese Funktion unterstützt das neue Website-Format noch nicht." statt das Dokument
   still zu korrumpieren (`server/v2WriteGuard.ts`). Bis Teilprojekt B diese Funktionen v2-nativ
   nachrüstet, sind sie für v2-Kunden im Dashboard funktional gesperrt, nicht fehlerfrei nutzbar.

## 5. Verantwortlichkeit für den nächsten Schritt

Dieses Dokument macht die Aktivierung möglich, führt sie aber nicht selbstständig aus. Nächster
Schritt laut Plan: dem User die Desktop-PNGs der 10 in Plan C1+C2 neu gebauten Packs (patina,
salon-noir, marktplatz, landgut, atelier, klarwerk, verve, zunft, schimmer, fundament — zusätzlich
zu den 4 Leuchtturm-Packs werkbank, kanzlei, morgenlicht, gusto aus Plan A) zeigen und die
Merge-Freigabe einholen — Abnahme vor Beginn von Teilprojekt B.
