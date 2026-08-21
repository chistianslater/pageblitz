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

## 5. Verantwortlichkeit für den nächsten Schritt

Dieses Dokument macht die Aktivierung möglich, führt sie aber nicht selbstständig aus. Nächster
Schritt laut Plan: dem User die Desktop-PNGs der 10 in Plan C1+C2 neu gebauten Packs (patina,
salon-noir, marktplatz, landgut, atelier, klarwerk, verve, zunft, schimmer, fundament — zusätzlich
zu den 4 Leuchtturm-Packs werkbank, kanzlei, morgenlicht, gusto aus Plan A) zeigen und die
Merge-Freigabe einholen — Abnahme vor Beginn von Teilprojekt B.
