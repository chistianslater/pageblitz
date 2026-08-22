# Spec: Cutover auf v2 (Teilprojekt B, Abschluss)

**Datum:** 2026-08-22 · **Status:** verbindlich · **Grundlage:** Spec A §7, Spec B §7, Inventar `.superpowers/b4-inventar.md` (Stand 719f508).

## 1. Ziel
v2 (Style Packs, SSR, Studio, Inseln) wird der einzige Weg. Kein Flag, kein v1-Renderpfad, kein Chat. Null zahlende Kunden → keine Datenmigration; v1-Preview-Websites in Prod werden beim Öffnen des Studios neu (v2) generiert (`ensureGeneration` bei `legacy`).

## 2. Entscheidungen
1. **Studio = auch Post-Checkout-Editor.** Verkaufte Websites bearbeitet der Abo-Inhaber im Studio (`loadStudioWebsite` erlaubt das bereits). Studio bekommt Deep-Links (`?panel=<id>`) und einen „Live-Modus" (keine Checkout-Leiste, stattdessen „Website ist live · Zum Dashboard").
2. **Dashboard wird schlank:** bleibt für Domain/Slug, Live-Schalter, Branding, Kontaktformular-Konfiguration/Anfragen, Chat-Leads/-Einstellungen, Buchung/Termine, Statistiken, Abo/Billing, Add-on-Kauf; alle Inhalts-/Design-/Rechtstext-Editoren werden durch eine „Im Studio bearbeiten"-Karte ersetzt. v1-`customer.*`-Schreibprozeduren auf `websiteData` entfallen.
   > **Umsetzungsstand B4a (Ruling):** „Kontaktformular-Konfiguration" bedeutet im Dashboard nur noch Empfänger-E-Mail (`customer.updateContactEmail`) und die Anfragen-Liste; die v1-Kontaktdaten-Karte und die Feldkonfiguration (`contactFormFields`) wurden ersatzlos entfernt, weil die v2-Insel feste Felder hat und diese Spalten nie liest. Einen „Live-Schalter" gab es im Dashboard auch vorher nicht (Aktiv-Status entsteht über Checkout/Webhook und Setup-Flow).
3. **Generierung:** immer v2 (`runWebsiteGenerationV2Job`) — StartPage, Admin-Regenerate, Outreach-Pipeline. `PB_LAYOUT_V2` entfällt.
4. **Landingpage-Showcase:** zeigt die 14 Style Packs statt der 7 v1-Layouts — über eine öffentliche SSR-Demo-Route `/demo/:pack` (Fixture „full", noindex, gecacht) in iframes.
5. **Legacy-URLs:** `/preview/:token/onboarding` → 302 `/onboarding/:token`; `/websites/:id/onboarding` → Auflösung über Server → Studio; `/preview/:token` (v1 Preview-Page) → `/preview-ssr/:token` bzw. Studio; `/layout-preview/*`, `/variant-preview` entfallen.
6. **Rechtsseiten:** v2-Sites liefern Impressum/Datenschutz ausschließlich aus `websiteData.legal.*` (SSR + CSR-Fallback `LegalPage`).
7. **Löschung** in der Reihenfolge des Inventars §11; jeder Schritt einzeln testbar; `shared/layoutConfig.ts` schrumpft auf das, was v2 braucht (`withOnColors`, Schrift-Helfer, falls genutzt).
8. **Aufgeschoben (Plan B4c):** a11y-/Perf-Pass, `prefersMenu`, Team-Panel, Unterseiten-Add-on, DB-Spalten-Drops, Dashboard-Redesign.

## 3. Vorbedingungen (vor jeder Löschung)
- `customer.updateWebsiteContent` muss v2-sicher werden (kein In-Place-Mutieren, Guard) — bis zur Löschung: für v2-Dokumente BAD_REQUEST „Bitte im Studio bearbeiten".
- `/onboarding/:token` in `SPA_ROUTES` (heute Reload-404 in Prod).
- `LegalPage` liest `websiteData.legal.*` für v2.
- Lifecycle-Mail-Links (`lifecycleScheduler.ts`) auf `/onboarding/:token` mit echtem Token.

## 4. Erfolgskriterien
- StartPage → Studio in ≤ 90 s mit v2-Website; kein Code-Pfad erzeugt mehr v1-`websiteData`.
- `client/src/components/layouts/`, `OnboardingChat.tsx`, v1-Prozeduren, `PB_LAYOUT_V2` existieren nicht mehr; Vitest/Playwright grün; tsc-Baseline sinkt (v1-Altfehler verschwinden).
- Landingpage zeigt 14 Packs; Dashboard-Kernfunktionen (Domain, Inbox, Leads, Termine, Statistiken, Abo) unverändert nutzbar; Bearbeitung über Studio.
