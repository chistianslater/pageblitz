# Spec: Onboarding v2 — „Studio" (Teilprojekt B)

**Datum:** 2026-08-21
**Status:** Entwurf zur Freigabe
**Baut auf:** Teilprojekt A (Spec `2026-08-20-style-packs-design.md`, vollständig in `main`): WebsiteDataV2-Vertrag, 14 Style Packs, SSR, Generierung v2, v2-Write-Guard, Picker-Persistenz, Aktivierungs-Doku `2026-08-21-flag-aktivierung.md`.
**Scope:** Kompletter Ersatz des Onboarding-Chats durch ein Studio mit Instant-Preview, Checkliste und KI-Chat; anschließend Cutover inkl. Löschung des Altsystems (§7 aus Spec A wird hier eingelöst).

---

## 1. Kontext & Ziele

**Ist-Zustand:** `client/src/pages/OnboardingChat.tsx` (7.277 Zeilen, 26 Schritte, Chat-Paradigma). Drei parallele Zustandsspeicher (DB `onboarding_responses`, localStorage-Schrittindex, Events), zwei inkompatible Index-Systeme (`STEP_ORDER` vs. `dynamicStepOrder`) → bekannter Reload-Bug. Der Chat schreibt v1-Strukturen (`saveStep`-Sideeffects, `generateInitialContent`, `complete`-Patches); für v2 sind diese Pfade seit Plan C nur geguarded, nicht nativ. Antworten zu Fotos, Texten und Add-ons werden für v2 bisher nicht angewendet.

**Ziele (aus dem Brainstorming, vom User festgelegt):**
1. **Instant-Preview zuerst:** GMB-Auswahl → nach ~60 s steht die komplette Website → Wow-Moment vor allen Pflichtangaben.
2. **Verfeinerung = geführte Checkliste + freier KI-Chat** (Kombi): Checkliste als Rückgrat (Pflichtteile), KI-Textfeld für Wünsche.
3. **Kürzer:** ~6 Checklisten-Punkte statt 26 Schritte; Pflichtangaben nach hinten.
4. **Technisch sauber:** Zustand ausschließlich server-seitig (kein localStorage-Index), jede Mutation ein schema-validierter v2-Patch hinter dem Write-Guard, kleine Dateien (< 400 Zeilen typisch).
5. **Cutover:** alter Chat, v1-Layouts und alle v1-Mappings werden gelöscht; `PB_LAYOUT_V2` entfällt (v2 ist der einzige Weg). Null zahlende Kunden → kein Migrationspfad.

---

## 2. Architektur-Überblick

```
client/src/pages/onboarding-v2/
  StudioPage.tsx              ← Route /onboarding/:token  (Layout: Checkliste | Preview)
  GenerationScreen.tsx        ← Zustand "generiert" (Polling getGenerationStatus)
  Checklist.tsx               ← 6 Punkte, Fortschritt, öffnet Panels
  PreviewFrame.tsx            ← iframe auf /preview/:token (SSR) + Cache-Bust-Reload
  panels/StylePanel.tsx       ← Pack-Wahl (Kandidaten aus Registry, Mini-Previews)
  panels/PhotosPanel.tsx      ← Hero/About/Galerie: GMB-Fotos, Stock-Suche, Upload
  panels/TextsPanel.tsx       ← Headline/Sub/About/SEO, KI-Vorschlag je Feld
  panels/OfferPanel.tsx       ← Leistungen ODER Speisekarte/Preisliste (pack-/branchenabhängig)
  panels/LegalPanel.tsx       ← Impressum-Daten (E-Mail vorbelegt), Öffnungszeiten
  panels/AddonsPanel.tsx      ← Add-ons mit Live-Preissumme
  AiChat.tsx                  ← „Was soll anders sein?" → Diff-Vorschau → Übernehmen
  CheckoutBar.tsx             ← Fortschritt, Preis, „Website freischalten"

shared/onboardingV2/
  checklist.ts                ← Punkt-Definitionen + deriveChecklistState(doc, answers)
  patches.ts                  ← Zod-Schemas der Patch-Payloads je Panel
  aiEdit.ts                   ← Zod-Schema der LLM-Patch-Antwort (Subset von seo/sections)

server/onboardingV2/
  router.ts                   ← tRPC-Router `onboardingV2.*` (alle Mutationen)
  applyPatch.ts               ← pure: (doc, patch) → neues validiertes Dokument
  aiEdit.ts                   ← Prompt-Bau, LLM-Aufruf, Whitelist+Validierung, Diff
  ownership.ts                ← Token-/User-Ownership-Prüfung (auch für selectWebsiteTemplate)
```

**Prinzipien:** Studio = dünner Client über `onboardingV2.*`; jede Prozedur lädt das Dokument, wendet einen puren Patch an, validiert mit `WebsiteDataV2Schema`, schreibt via Write-Guard, invalidiert den SSR-Cache, gibt das neue Dokument zurück. Preview-Wahrheit = SSR (`/preview/:token`), nie ein zweiter Renderpfad.

---

## 3. Flow

**3.1 Einstieg.** StartPage bleibt (GMB-Suche mit Stadt-Autocomplete als Folge-Task; manuell). `selfService.start` erzeugt Business + Website + startet **immer** die v2-Generierung (kein Flag mehr). Weiterleitung auf `/onboarding/:token`.

**3.2 Generierung (≈60 s).** `GenerationScreen` pollt `getGenerationStatus`; zeigt Fortschritt (Pack gewählt → Texte → Bilder) und den Namen des gewählten Style Packs. Bilder kommen deterministisch aus der bestehenden Pipeline (GMB-Fotos zuerst, dann Branchen-Stock), nie aus dem LLM. Fehler → verständliche Meldung + „Erneut versuchen" (Job-Retry).

**3.3 Studio.** Zwei Spalten (≥ 1024 px): links Checkliste + KI-Chat + Checkout-Leiste, rechts Preview (Desktop/Mobil-Umschalter). Darunter (< 1024 px): Tabs „Bearbeiten | Vorschau". Jeder Checklisten-Punkt öffnet sein Panel in der linken Spalte; Speichern aktualisiert Dokument + Preview.

**3.4 Checkout.** `CheckoutBar` zeigt Pflichtstatus (Rechtliches + E-Mail) und Preis (Basis + Add-ons). „Website freischalten" → bestehender `onboarding.complete`-v2-Pfad (`applyOnboardingToV2`) → Stripe-Checkout wie heute. Post-Checkout-Setup (Subdomain-Wahl) unverändert.

---

## 4. Die sechs Checklisten-Punkte

| # | Punkt | Panel-Inhalt | Patch (alles zod-validiert) | „Erledigt" wenn |
|---|---|---|---|---|
| 1 | **Stil** | 2–4 Pack-Kandidaten aus `getV2VariantCandidates(category)` als Mini-Previews (iframe mit `packOverride`), „Andere zeigen" rotiert; aktueller Pack markiert | `selectStylePack(packId)` → `stylePackId` (+ Ownership-Check) | Nutzer hat bestätigt ODER bewusst übersprungen |
| 2 | **Fotos** | Hero-, Über-uns-, Galerie-Bilder: GMB-Fotos (Default, bleiben erhalten), Stock-Suche, Upload | `setImages({hero?, about?, gallery?})` → `hero.imageUrl`, `about.imageUrl`, `gallery.images` | Hero-Bild vorhanden |
| 3 | **Texte** | Headline, Subheadline, Über-uns-Text, SEO-Titel/-Beschreibung; je Feld „KI-Vorschlag" (3 Varianten) | `updateTexts({...})` → hero/about/seo-Felder | Nutzer hat Texte gesichtet (Panel geöffnet + gespeichert/bestätigt) |
| 4 | **Angebot** | Leistungen (Titel/Beschreibung/Preis) ODER Speisekarte/Preisliste (Kategorien/Positionen) — Modus aus Dokument (menu/pricelist-Sektion vorhanden?) bzw. Pack-Hinweis (`prefersMenu`-Flag in der Verfassung, neu) | `updateOffer(...)` → services / menu / pricelist | ≥ 1 Position vorhanden |
| 5 | **Rechtliches** | Name/Firma, Straße, PLZ/Ort, Telefon, E-Mail (vorbelegt aus Registrierung), USt-ID optional, Öffnungszeiten (GMB-Vorbelegung) | `updateLegal(...)` → legalGenerator → `legal.*` + contact-Sektion (Logik aus `applyOnboardingToV2` wiederverwendet) | Pflichtfelder vollständig (**Pflicht für Checkout**) |
| 6 | **Add-ons** | Kontaktformular, Galerie, Speisekarte, Preisliste, KI-Chat-Widget, Buchung, Unterseiten — mit Preis je Add-on und Live-Summe | `updateAddons(...)` → Sektionen (gallery/menu/pricelist) bzw. Feature-Flags (`features: {contactForm, aiChat, booking, subpages[]}` — **neues optionales Vertragsfeld**, SSR-Inseln lesen es) | immer „erledigt" (Default: keine Add-ons) |

Zusätzlich oben im Studio: **E-Mail/Registrierung** (Pflicht vor Checkout, wie heute via Magic-Link-Mechanik) — kein eigener Checklisten-Punkt, sondern Teil der Checkout-Leiste.

**Fortschritt** wird NICHT gespeichert, sondern aus Dokument + `onboarding_responses` abgeleitet (`deriveChecklistState`) — Reload-sicher per Konstruktion.

---

## 5. KI-Chat („Was soll anders sein?")

- Prozedur `onboardingV2.aiEdit({ token, message })`: lädt Dokument, baut Prompt aus Verfassung (`essence`, `llmHints`) + aktuellem `seo`/`sections` + Nutzerwunsch; LLM liefert **nur geänderte Felder** als Teilobjekt `{ seo?, sections? }` (Schema `shared/onboardingV2/aiEdit.ts`); Server merged (Envelope-Whitelist wie Generierung), validiert das Ergebnis-Dokument, **persistiert nicht**, sondern liefert `{ proposal, diff }` zurück.
- Client zeigt Diff (vorher/nachher je Feld) + „Übernehmen / Verwerfen"; Übernehmen = `applyAiEdit(proposalId)` (server-seitig zwischengespeichert, TTL 10 min) → Write-Guard → Cache-Invalidierung.
- **Design-Intents** („dunkler", „moderner", „eleganter") → kein Farb-/Font-Patch, sondern Pack-Vorschlag: Server mappt Intent auf Kandidaten aus `getV2VariantCandidates`/Verfassungs-`essence` und antwortet mit „Stil-Vorschlag: Salon Noir — übernehmen?" (öffnet Stil-Panel mit Vorauswahl). Anti-Baukasten-Garantie bleibt.
- **Grenzen:** keine URLs, keine Kontaktdaten (Fakten nur über Panels), keine Rechtstexte; max. 20 Anfragen pro Session (Kostenschutz), Rate-Limit pro Token.

---

## 6. Zustand, Robustheit, Sicherheit

- **Server-only State:** Dokument (`websiteData`) + `onboarding_responses` (Legal-/Registrierungsdaten) + Generierungs-Job. Reload lädt `onboardingV2.getState({token})` → Dokument, Checklist-State, Job-Status. Kein localStorage.
- **Ownership:** Self-Service-Zugriff über `previewToken` (nanoid 32); jede Mutation prüft Token↔Website; eingeloggte Nutzer zusätzlich `userId`. `selfService.selectWebsiteTemplate` wird in `onboardingV2.selectStylePack` überführt (mit Ownership) und der alte publicProcedure-Pfad entfernt (Security-Fund aus Plan C).
- **Schreib-Invariante:** ausnahmslos über `assertV2SafeWrite`; Patches sind pure Funktionen (`server/onboardingV2/applyPatch.ts`) mit eigenen Tests.
- **Fehler:** jede Prozedur wirft TRPCError mit deutscher Meldung; Client zeigt sie inline am Panel; keine stillen Fallbacks.

---

## 7. Cutover & Löschung (löst Spec A §7.3 ein)

Nach Abnahme des Studios, in dieser Reihenfolge:
1. Route-Umstellung: `/preview/:token/onboarding` und `/websites/:id/onboarding` → Studio. `selfService.start` ohne Flag immer v2; `PB_LAYOUT_V2` aus Code und Doku entfernt.
2. Löschen: `client/src/pages/OnboardingChat.tsx`, `client/src/components/layouts/` (inkl. `PremiumLayoutsV2.tsx`, V1-Dateien), v1-Pfad in `WebsiteRenderer.tsx` (→ `SiteRenderer` einziger Renderer; `parseV2` wird Pflicht), `VariantPreviewPage` v1-Zweig, `VARIANT_FAMILY_RANKINGS`, `getLayoutKeyByIndustry`/`LayoutEngine`, `getLayoutPool`, `DESIGN_ARCHETYPES`, `getLLMFontPrompt`/`FORBIDDEN_BODY_FONTS`, v1-Zweige in `saveStep`/`complete`/`generateInitialContent`/`admin.regenerate` (→ v2), `DEFAULT_LAYOUT_COLOR_SCHEMES`; `shared/layoutConfig.ts` schrumpft auf das, was StartPage/Studio noch brauchen.
3. Dashboard (`customer.*`): die per Write-Guard blockierten Funktionen (updateServices/Design/Addons/Legal/Logo/Team/AI-Edit) werden auf v2-Patches umgestellt — sie teilen sich die `applyPatch`-Funktionen mit dem Studio (DRY), der Guard bleibt als Netz.
4. Familien-Aufräumer: `prefersMenu`-Flag in die Verfassungen; a11y-Pass (§8.4: axe pro Pack, CTA-Kontraste marktplatz/schimmer ≥ 4,5:1 durch Ton-Anpassung innerhalb des Packs), Perf-Budget-Check (§8.5), og:image im SSR-Head.

---

## 8. Tests

1. **E2E-Funnel (Playwright):** StartPage → Generierung (LLM gemockt, deterministisches Dokument) → Studio: Stil wechseln (Preview zeigt anderes Pack), Foto setzen, Text ändern, Rechtliches ausfüllen, Add-on buchen → Checkout-Session erzeugt (Stripe gemockt). Reload mitten im Studio → identischer Zustand.
2. **Unit:** `applyPatch` je Panel (gültig/ungültig/Fremdfeld-Abwehr), `deriveChecklistState`, `aiEdit`-Whitelist+Validierung (inkl. Design-Intent → Pack-Vorschlag), Ownership (fremder Token → FORBIDDEN).
3. **Visuelle Regression:** bestehende 84 Pack-Baselines bleiben; + Studio-Screenshots (3 Breakpoints, Zustand „Checkliste offen", „Panel offen", „Diff-Vorschau").
4. **A11y:** axe auf Studio + je Pack-Demo; Tastaturbedienung der Checkliste/Panels.

---

## 9. Risiken & Entscheidungen

| Risiko | Entscheidung |
|---|---|
| Add-ons wie Buchung/KI-Chat/Unterseiten haben im v2-Vertrag kein Zuhause | neues optionales Feld `features` im Vertrag (additiv, strict); SSR-Inseln lesen es; Unterseiten = Plan-Inhalt mit eigener Route im SSR (`/site/:slug/:page`) |
| KI-Chat-Kosten/Missbrauch | Vorschlag-Modus ohne Persistenz, 20 Anfragen/Session, Rate-Limit, Whitelist |
| Großer Cutover bricht Admin-Outreach-Pipeline (`server/outreachPipeline.ts` nutzt Generierung) | Outreach auf `runWebsiteGenerationV2` umstellen (Teil von §7 Schritt 2); Test mit gemockter Pipeline |
| Studio-UI wirkt generisch | eigene Design-Richtung für das Studio (nicht Pack-gebunden): ruhiges Arbeits-UI, Preview steht im Mittelpunkt; vor Implementierung ein Mockup-Checkpoint beim User |

## 10. Erfolgskriterien

- Neuer Nutzer sieht ≤ 90 s nach GMB-Auswahl seine fertige Website; bis Checkout ≤ 6 Checklisten-Punkte.
- Reload an jeder Stelle stellt exakt denselben Zustand her (E2E-Test).
- Kein v1-Code mehr im Repo (`layouts/`, OnboardingChat, Alt-Mappings gelöscht), `PB_LAYOUT_V2` existiert nicht mehr.
- Jede Studio-Mutation ist ein validierter v2-Patch; Ownership überall geprüft.
- Alle 14 Packs bestehen axe-Check + CTA-Kontrast ≥ 4,5:1.
