# B4c-Ergebnis: Polish & Konsolidierung

**Datum:** 2026-08-23 · **Plan:** `docs/superpowers/plans/2026-08-23-onboarding-v2-b4c-polish.md` · **Spec:** `docs/superpowers/specs/2026-08-23-b4c-polish-design.md` · **Basis:** B4b (main `0b1257f`) · **Endstand:** `onboarding-v2` `e0da646` (+ Fixwelle 2, siehe unten).

## Ziel und Umfang

Das v2-System nach der B4b-Löschung technisch sauber ziehen: letzte
v1-Reste (Farbkette, DB-Spalten, tote Dateien) weg, bekannte Lücken
schließen (Rechtsseiten-Auth, SSR-Pfade), a11y/Perf auf ein messbares
Niveau bringen — **ohne neue Produkt-Features**. Team-Panel, Unterseiten-
Add-on und Dashboard-Redesign sind bewusst auf Plan B5 verschoben (Spec §3,
§5 Entscheidung 1), weil sie Produktentscheidungen brauchen, die den
Polish-Charakter von B4c gesprengt hätten.

## Ergebnis je Task

| Task | Commit(s) | Kernumfang | LOC (Hauptcommit) |
|---|---|---|---|
| 1 — LegalPage-Farbe, Regenerierung absichern | `fb4b8ed` | `getPackAccent()` (`client/src/lib/packAccent.ts`) statt `colorScheme`; `regenerateLegalPages` nur Besitzer/Admin, `{ regenerated: true }` | 6 Dateien, +192/−39 |
| 2 — v1-Farbkette entfernt | `6a7704a` | `colorScheme`-Migration, `getIndustryColorScheme`, `shared/layoutConfig.ts`, `shared/colorContrast.ts`, `server/contrast.test.ts`, `ColorScheme`-Typ gelöscht | 7 Dateien, +1/−933 |
| 3 — Toter Code (knip) | `1a20965` | 44 Dateien gelöscht (u. a. `GoogleRatingBadge`, `IndustryIcon`, `ManusDialog`, `Map.tsx`, 32 ungenutzte shadcn-Primitive), ~53 Exporte, 34 Dependencies (`pnpm remove`) | 93 Dateien, +444/−9.438 |
| 4 — v1-DB-Spalten droppen | `5ff25ba` | Migration `drizzle/0027_drop_v1_columns.sql`, Schema + Schreibstellen (`onboardingV2/router.ts`, `devSeed.ts`, `db.ts createOnboarding`) bereinigt, lokal eingespielt | 15 Dateien, +86/−133 |
| 5 — SSR/CSR-Konsistenz | `ab183da` (+ Fix `625bf30`) | SSR-404 für unbekannte Kundenpfade, Demo-Rechtsseiten (`/demo/:pack/impressum|datenschutz`), `og:image`/`twitter:card` im SSR-Head | 6 Dateien, +317/−24 (+ 2 Dateien, +38/−4) |
| 6 — Landingpage-Performance | `3671c3d` | 14 statische WebP-Vorschauen (`scripts/build-pack-previews.mjs`) statt sofort geladener iframes, Klick öffnet Modal | 20 Dateien, +364/−61 |
| 7 — A11y-Pass | `4e27a50` | `tests/visual/a11y.spec.ts` (axe), 6 Packs umgefärbt, Landing-Kontrast, `usePanelFocus`, `prefersMenu` für Gastro-Packs | 30 Dateien, +452/−75 |
| 8 — Abschluss/Doku | dieser Commit | `BETRIEB-V2.md`, dieses Dokument | — |
| Fixwelle (Review-Nacharbeit) | `0eeb08b` | Modal-Tests (Backdrop/Tab-Wrap), Negativtest `regenerateLegalPages` „eingeloggt ohne Abo", tote `vite.config`-Chunk-Matcher, zunft-Kommentar | 5 Dateien, +135/−9 |
| Koordinator-Fix (tsc 17→0) | `e0da646` | `tsconfig target: ES2022` (10 Zielfehler), Booking-/Chat-Owner-Mail-Join-Bugfix (`subscriptions.websiteId` statt nicht existenter `generatedWebsites.subscriptionId`), Checkout-Default, `useAuth`-QueryClient, GMB-Typen | 7 Dateien, +22/−36 |
| Fixwelle 2 (Final-Review-Nacharbeit) | siehe `git log` (Hash trägt der Koordinator nach) | Pack-Vorschauen/Demo-SVGs/marktplatz-Shadow an Task-7-Farben angleichen, `prefersMenu` auf gusto/zunft korrigieren, `usePanelFocus` Esc-Verhalten (verwarf Entwürfe), `regenerateLegalPages`-Token-Pfad entfernt (Ownership-Check reicht), `packs.spec.ts`-Farbassertion ergänzt | — |
| Chores (Prettier-Sweeps) | `71ebf07`, `45d8bf8` | Formatierungs-Commits für Dateien, die der Hook außerhalb der eigentlichen Task-Edits reformatiert hatte (`LeadsPage.tsx`, `vite.config.ts`) | +219/−75, +26/−7 |

## Gates vorher/nachher

| Gate | Vor B4c (main `0b1257f`) | Nach B4c (`e0da646`+) |
|---|---|---|
| tsc-Fehler | 21 (Ziel ≤ 10) | **0** (Koordinator-Fix, s. o.) |
| vitest | 755 grün, 6 bekannte Fails (4× `contrast.test.ts`, 2× `resend.test.ts`) + 2 Stripe-Env-Suiten | **750 grün** + bekannte Fails (2× `resend.test.ts` ohne `RESEND_API_KEY`, 2 Stripe-Env-Suiten `auth.logout`/`pageblitz` ohne `STRIPE_SECRET_KEY`); `contrast.test.ts` existiert nicht mehr (Task 2) |
| Playwright | packs 84/84, studio 8/8, islands 4/4, landing 1/1, startpage 1/1 | packs 84/84, studio 8/8, islands 4/4, landing 4/4, startpage 1/1, **a11y 24/24** (+1 `test.skip` Dashboard, neue Spec) |
| Build | grün | grün, `dist/index.js` 1,0 MB (vor B4a 1,3 MB) |
| Lighthouse `/` mobil | 0,49 Score, LCP 7,8 s | **0,85 Score, LCP 3,1 s** (Budget < 2,5 s verfehlt) |
| Lighthouse `/` Desktop | 0,78 Score | **1,0 Score** |
| JS-Gewicht `/` | — (nicht gemessen) | ~306 KB gzip (Budget 150 KB verfehlt, pre-existing — siehe Rulings) |

## Erfolgskriterien (Spec §4) — Status

1. **`grep` v1-Reste → 0 Treffer außerhalb Migrationsdateien** — ✅, mit einer
   bewussten Ausnahme: `onboarding_responses.addOnTeamData` bleibt (Team-
   Panel → B5, siehe Behalten-Liste im Plan).
2. **`npx knip` ohne Befunde (oder dokumentierte Ausnahmen)** — ✅, mit
   dokumentierten Ausnahmen (Task-3-Report: `_core`-Scaffold-Typexporte,
   geschützte `drizzle/**`/`scripts/**`-Pfade, shadcn-Kit-Compound-Exporte,
   `shared/ageGate.ts getCategoryServiceHint` als Produktentscheidung
   offengelassen).
3. **axe: 0 critical/serious auf allen geprüften Seiten** — ✅ (24/24,
   Dashboard bewusst `test.skip`, Begründung siehe `a11y.spec.ts`).
   **Lighthouse `/` mobil: LCP < 2,5 s, JS < 150 kB gzip** — ❌. LCP 3,1 s
   (Ursache: render-blockierendes Google-Fonts-CSS + Haupt-CSS-Bundle,
   außerhalb des Task-6-Dateisatzes). JS ~306 KB gzip (Ursache:
   `LandingPage` wird in `App.tsx` eager statt `lazy()` importiert und zieht
   `vendor-ui`/`framer-motion` in den Entry-Chunk — pre-existing, nicht durch
   B4c verursacht, siehe B5-Liste unten).
4. **Alle Playwright-Baselines grün** — ✅ (siehe Gate-Tabelle).
5. **tsc ≤ 10 Altfehler** — ✅, deutlich übertroffen: **0**.

## Rulings / Abweichungen vom Plan

- **6 statt 2 Packs umgefärbt** (Brief nannte nur `marktplatz`/`schimmer`
  namentlich, „ggf. weitere Packs" traf zu): `werkbank`, `patina`,
  `marktplatz`, `schimmer`, `zunft`, `fundament` — jeweils reine
  Hex-Anpassungen der Akzent-/Muted-Rolle in der Verfassung, keine
  Modul-CSS-Änderungen. Bewusst nicht gewählte Alternative: „Ink-Text auf
  dem Original-Akzent" (dunkler Textton statt hellerer Hintergrundfarbe) —
  hätte die identitätsprägenden Töne (Signal-Orange, Koralle, Rosé) unangetastet
  gelassen, wurde aber verworfen, weil die Farbe selbst (nicht nur ihr Einsatz
  als Textfläche) an mehreren Stellen als Fläche/Rand verwendet wird und ein
  reiner Text-Fix die Flächenkontraste nicht behoben hätte.
- **Landing-Kontrast global auf `text-gray-600` gehoben** statt punktueller
  Fixes — ~40 Stellen in `LandingPage.tsx`/`PackShowcase.tsx` betroffen, der
  reale Seitenhintergrund (`#F3F4F6`) machte eine einheitliche Anhebung
  konsistenter als Einzelfälle.
- **Keine Fokusfalle in den Studio-Panels** (Abweichung vom Brief-Wortlaut):
  geprüft und bewusst nicht umgesetzt, weil die Panels kein echtes
  Overlay-Modal sind (Vorschau bleibt daneben sichtbar/bedienbar) — eine
  ARIA-Modal-Fokusfalle wäre hier semantisch falsch. Stattdessen:
  Fokus auf die Panel-Überschrift beim Öffnen, Fokus-Rückgabe zum
  auslösenden Checklisten-Eintrag beim Schließen (`usePanelFocus`).
- **Dashboard (`/my-website`) in `a11y.spec.ts` übersprungen** — kein
  Dev-Bypass für eine echte Kunden-Session vorhanden; Aufbau einer
  Test-Login-Infrastruktur wäre eine eigene Investition über den
  Polish-Rahmen hinaus (B5-Kandidat).
- **`onboarding_responses.addOnTeamData` bewusst NICHT gedroppt** (Team-Panel
  → B5), zusätzlich zur Vorlage aber `onboarding_responses.colorScheme` und
  `onboarding_responses.contactFormFields` gedroppt (Brief nannte nur
  `generated_websites` für diese beiden Spalten, waren aber auch in
  `onboarding_responses` unreferenziert und nicht durch die `addOn*`-
  Behalten-Regel geschützt).
- **Token-Pfad in `regenerateLegalPages` entfernt** (Fixwelle 2): der in
  Task 1 eingeführte `token`-Parameter (Studio-Kontext, anonym per
  `previewToken`) hatte keinen Client-Aufrufer und war strukturell schwächer
  als der Ownership-Check über den eingeloggten Abo-Inhaber — im
  Final-Review als unnötige Angriffsfläche markiert und entfernt.
- **`prefersMenu` nur `gusto`/`zunft`**: Task 7 hatte zusätzlich
  `marktplatz` gesetzt (enthält die Branche `eisdiele` neben
  Kita/Musikschule/Fahrschule); im Final-Review als falsch markiert
  (Pack ist überwiegend nicht gastronomisch) und in Fixwelle 2 zurückgenommen.
- **`packs.spec.ts`-Toleranz verschluckte 5 von 6 Farbfixes**: der
  pauschale Pixel-Diff-Schwellenwert (1 %) erkannte nur die
  `werkbank`-Änderung (großflächiges Signal-Orange in einem 80px-Hero-Wort)
  als Baseline-Abweichung — die übrigen 5 umgefärbten Packs blieben unter
  der Schwelle. Fixwelle 2 ergänzt eine gezielte Farbassertion in
  `packs.spec.ts`, damit zukünftige Palette-Änderungen nicht stillschweigend
  ungeprüft bleiben.

## Prozess

- **Commits ausschließlich mit explizitem Pathspec** (`git commit -m "…" --
  <pfade>`), nie `git add -A`/`-a`, kein `git stash` — auch bei mehreren
  parallel laufenden Task-Sessions im selben Arbeitsverzeichnis (Tasks 1/2/5
  und 4/6 liefen jeweils parallel; jeder Task-Report dokumentiert explizit,
  welche fremden Änderungen im Working Tree beim eigenen Commit unangetastet
  blieben).
- **Koordinator-Fix nach dem Gate für Task 8**: die tsc-Restliste (17 Fehler)
  wurde nicht Task-für-Task weitergereicht, sondern nach dem Vollgate in
  einem eigenen Commit (`e0da646`) auf 0 gebracht — u. a. durch einen echten
  Bugfix (Booking-/Chat-Owner-Mail-Join nutzte eine nicht existente Spalte
  `generatedWebsites.subscriptionId`, jetzt korrekt über
  `subscriptions.websiteId`), nicht nur Typ-Kosmetik.
- **Final-Review vor dem Merge** deckte 6 Punkte auf (Migrationsreihenfolge
  in `BETRIEB-V2.md`, veraltete Pack-Vorschauen/Demo-SVGs, falsches
  `prefersMenu` bei `marktplatz`, Esc-Verhalten in `usePanelFocus`, der
  unnötige Token-Pfad in `regenerateLegalPages`, der Booking/Chat-Join-Bug)
  — Punkt 6 war zu dem Zeitpunkt bereits durch den Koordinator-Fix erledigt,
  die übrigen 5 laufen als **Fixwelle 2** parallel zu dieser Doku-Session.

## Prod-Migration

**Nicht ausgeführt.** Migration 0027 wurde ausschließlich lokal eingespielt
(Docker-DB, siehe Task-4-Report). Der Ablauf für die Produktions-Einspielung
(Expand/Contract-Reihenfolge: erst Deploy des neuen Codes, dann Backup, dann
Migration) ist in `docs/BETRIEB-V2.md` §3 dokumentiert und wird **erst nach
dem Merge dieses Branches, mit expliziter Nutzer-Freigabe**, ausgeführt.

## Offene Punkte → Plan B5

- Team-Panel (Add-on `team` buchbar machen), Unterseiten-Add-on
  (`features.subpages[]`) — Produktentscheidungen, bewusst nicht in B4c.
- Admin `WebsitesPage.tsx` zeigt den Pack der Website nicht an; veralteter
  `AdminCheckoutDialog` mit 79-€-Pricing, zählt keine Unterseiten.
- Test-Login-Infrastruktur für Dashboard-E2E/a11y (`/my-website`).
- Dark-Mode-a11y der Landingpage (`/`) — axe prüft bisher nur Light-Default.
- JS-Budget von `/` (~306 KB gzip, Budget 150 KB): `TooltipProvider`/Radix
  aus dem App-Root-Entry lösen, `LandingPage`/`StartPage`/`SitePage`/
  `LegalPage` per `lazy()` laden, `framer-motion` über `LazyMotion` statt
  voller Bundle-Variante. Größter LCP-Hebel: `client/src/index.css:38` bindet
  25 Google-Font-Familien render-blocking ein (v1-Rest) — auf die tatsächlich
  genutzten Familien reduzieren.
- `umamiWebsiteId as any` in `server/routers.ts` (~Z. 2716) — Admin-Statistik
  liefert aktuell `null` statt echter Umami-Daten.
- `packs/zunft/css.ts` `.pb-zf-price`: nutzt „Siegelgold" entgegen dem
  eigenen Verfassungskommentar als Textfläche (Kontrast behoben, Rollen-Doku
  und Verwendung laufen auseinander).
