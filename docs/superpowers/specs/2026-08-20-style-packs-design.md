# Spec: Vorlagen-System v2 — „Style Packs" (Teilprojekt A)

**Datum:** 2026-08-20
**Status:** Entwurf zur Freigabe
**Scope:** Komplett neues Vorlagen-/Rendering-System für Pageblitz-Kundenseiten.
**Nicht in diesem Spec:** Der neue Onboarding-Flow (Teilprojekt B, eigenes Spec). Er setzt auf diesem System auf.

---

## 1. Kontext & Ziele

Der Ist-Zustand hat vier strukturelle Probleme:

1. **Baukasten-Optik.** 18 Layouts in `PremiumLayoutsV2.tsx` (4.891 Zeilen) teilen sich ein Skelett; Unterschiede sind im Kern Fonts + Farben. Ergebnis wirkt austauschbar.
2. **Kein Vertrag.** Alle Layout-Komponenten haben `(props: any)`. Felder wie `heroImage`, `logoFont`, `hiddenSections` sind nirgends deklariert und werden ad-hoc angehängt.
3. **Drei divergierende Zuordnungen.** Branche→Layout existiert dreifach (`getLayoutPool` server, `VARIANT_FAMILY_RANKINGS` client, `getLayoutKeyByIndustry` client) und muss manuell synchron gehalten werden.
4. **Kein SSR.** Kundenseiten sind reines Client-SPA; SEO-Tags entstehen per JS im Browser. Crawler ohne JS sehen nichts.

**Ziele von v2:**

- 14 stark eigenständige Stilrichtungen („Style Packs"), jede mit eigener **struktureller Signatur** — nicht nur Tokens (Katalog-Referenz: Artifact „Pageblitz Stilkatalog", Runde 2, vom User freigegeben).
- Ein typisierter, zod-validierter Datenvertrag zwischen Generierung und Rendering.
- Eine einzige geteilte Pack-Registry für Server und Client.
- Serverseitig gerendertes HTML für alle Kundenseiten („SEO inklusive" als Verkaufsargument).
- Harter Schnitt: keine Bestandskunden (Stand 2026-08-20: null zahlende Kunden) → kein Migrationspfad, Alt-Code wird ersatzlos gelöscht.

---

## 2. Architektur-Überblick

```
shared/stylePacks/            ← Registry + Verfassungen (Server UND Client)
  index.ts                    ← STYLE_PACKS Registry, Branchen-Zuordnung, Rotation-Helper
  types.ts                    ← PackConstitution, PackId, Zod-Schemas
  werkbank.ts … fundament.ts  ← 14 Verfassungen (reine Daten, kein JSX)

shared/siteContract/          ← Datenvertrag v2
  types.ts                    ← WebsiteDataV2, SectionV2 (discriminated union)
  schema.ts                   ← Zod-Schemas (validiert auch LLM-Ausgabe)

client/src/components/site/   ← Sektions-Engine (ersetzt layouts/)
  SiteRenderer.tsx            ← Dispatcher: stylePackId → Pack-Modul
  sections/                   ← neutrale Bausteine (Datenzugriff, A11y, Struktur)
  packs/<packId>/             ← 14 Pack-Module (je eigener Ordner)
    index.tsx                 ← Pack-Definition: Hero, Sektions-Varianten, Seitenrahmen
    decor.tsx                 ← Dekor-Komponenten des Packs
    image.ts                  ← Bild-Behandlung (Duotone, Masken, Overlays)

server/ssr/                   ← SSR für Kundenseiten
  renderSite.tsx              ← renderToString + HTML-Shell + Meta/Schema.org
  islands.ts                  ← Manifest interaktiver Inseln
```

Gelöscht werden nach Fertigstellung: `client/src/components/layouts/` (komplett, inkl. `PremiumLayoutsV2.tsx` und der vier toten V1-Dateien), `VARIANT_FAMILY_RANKINGS`, `getLayoutKeyByIndustry`/`LayoutEngine`, `getLayoutPool`, `DESIGN_ARCHETYPES`, `LAYOUT_FONTS`/`FORBIDDEN_BODY_FONTS`-Mechanik.

---

## 3. Pack-Verfassung (Constitution)

Jedes Pack ist ein reines Datenobjekt (`shared/stylePacks/<id>.ts`) nach dem Vorbild der Refero-„DESIGN.md"-Struktur:

```ts
type PackConstitution = {
  id: PackId;                      // "werkbank" | "patina" | …
  name: string;                    // "Werkbank"
  essence: string;                 // Ein-Satz-Charakter (für UI + LLM-Kontext)
  industries: string[];            // GMB-Kategorie-Schlüssel, primäre Zielbranchen
  theme: "light" | "dark";
  palette: {                       // benannte Farben MIT Verwendungsregel
    name: string; hex: string; role: PaletteRole; usage: string;
  }[];
  type: {
    display: FontSpec;             // Google-Fonts-Name, Gewichte, Fallback-Stack
    body: FontSpec;
    utility?: FontSpec;            // Mono/Labels, optional
    scale: TypeScale;              // Basisgröße, Ratio, Hero-Clamp
  };
  shape: { radius: RadiusSet; buttonStyle: string; density: "airy"|"normal"|"dense" };
  signature: {                     // die strukturelle DNA — Pflicht, macht den Unterschied
    hero: string;                  // z. B. "vertical-rail + outline-line + diagonal-photo + marquee"
    decor: string[];               // z. B. ["marquee", "vertical-rail", "diagonal-clip"]
    imageTreatment: string;        // z. B. "hard-crop, warm duotone, 8px accent border"
  };
  llmHints: { do: string[]; dont: string[] };  // fließen in den Content-Prompt ein
};
```

**Regel:** Die Verfassung enthält alles, was Server (Prompt-Bau, Rotation, Farb-Persistenz) und Client (Rendering) wissen müssen. JSX lebt ausschließlich im Pack-Modul unter `client/…/packs/<id>/`.

### 3.1 Die 14 Packs (vom User freigegeben, Katalog Runde 2)

| # | ID | Essenz | Primärbranchen | Kernfarben | Display/Body | Strukturelle Signatur |
|---|---|---|---|---|---|---|
| 01 | `werkbank` | Beton, Stahl, Signalfarbe | Schreinerei, Bau, Elektro, KFZ, Metallbau | `#191919` `#FF4D00` `#E8E6E1` | Archivo Black / Inter | Vertikal-Rail, Outline-Zeile, Diagonal-Foto, Marquee-Band |
| 02 | `patina` | Pergament-Journal mit Terrakotta | Heilpraktik, Naturkosmetik, Yoga, Hofladen | `#FBF4E7` `#B05A36` `#2B2620` | Fraunces / Karla | Initial-Wasserzeichen, Doppel-Bogen-Bilder, Randnotiz |
| 03 | `kanzlei` | Schweizer Strenge, tiefes Blau | Steuerberatung, Recht, Beratung, Finanzen | `#F7F7F4` `#101012` `#1D3FBF` | Inter Tight / Inter Tight + IBM Plex Mono | Sichtbares Raster, Mono-Index, §-Wasserzeichen |
| 04 | `salon-noir` | Dark Luxury, Champagner | Friseur, Barbier, Tattoo, Fotografie | `#121110` `#C8A96A` `#F4EDE3` | Cormorant Garamond / Jost | Passepartout-Goldrahmen, Bild-Overlap, Vertikal-Label |
| 05 | `morgenlicht` | Salbeigrün, runde Ruhe | Zahnarzt, Physio, Therapie, Pflege | `#F4F8F7` `#2E7E78` `#1C2B29` | Plus Jakarta Sans / Plus Jakarta Sans | Bild-Blob, Schwebekarten, Wellen-Übergang |
| 06 | `marktplatz` | Bonbonfarben, Sticker | Kita, Musikschule, Hundeschule, Eisdiele | `#FFF8EC` `#FF6B57` `#FFC838` `#262133` | Baloo 2 / Nunito | Konfetti-Grund, gekippte Karte, Sticker, Kritzel-Linie, Bogenkante |
| 07 | `gusto` | Espresso-Dunkel, Gold | Restaurant, Weinbar, Catering | `#16110D` `#C99B4A` `#F3E9DB` | Playfair Display / Lato | Menükarten-Doppelrahmen, Teller-Overlap, Punktlinien-Menü |
| 08 | `landgut` | Leinen, Blattgrün, organisch | Gärtnerei, Florist, Ferienhof, Imkerei | `#F6F3EA` `#4A6741` `#2E2A20` | Lora / Karla | Pflanzreihen-Bögen, Saison-Ticker |
| 09 | `atelier` | Magazin-Editorial, Signalrot | Fotografie, Design, Architektur | `#FFFFFF` `#0F0F0F` `#E0301E` | Instrument Serif / Inter + Space Mono | Zeitungs-Masthead, Meta-Zeile, Cover-Bild + Caption-Spalte |
| 10 | `klarwerk` | Weiß, Geometrie, Elektroblau | IT-Service, Agentur, Ingenieurbüro | `#FFFFFF` `#14171C` `#3B5BFD` | Space Grotesk / Inter | Unregelmäßiges Bento, Terminal-Zelle, Live-Status |
| 11 | `verve` | Kondensiert, Volt, Schräglauf | Fitness, Personal Training, Tanz | `#101114` `#D4F542` `#F5F5F2` | Bebas Neue / Inter | Outline-Riesenwort, Skew-Panel, Volt-Tape |
| 12 | `zunft` | Bordeaux, Siegel, Erbe | Bäckerei, Metzgerei, Brauerei, Weingut | `#F5EFE2` `#5E1F22` `#B98A2F` | Crimson Pro / Karla | Ornament-Bordüre, kippender Stempel, Punktlinien-Preistafel |
| 13 | `schimmer` | Perlmutt-Verläufe, leicht | Kosmetik, Ästhetik, Wellness | `#FDF7FA` `#E8A0BF` `#B69CFF` | Outfit / Outfit | Glaskarte über Orbs, Zierringe, Glas-Chips |
| 14 | `fundament` | Marineblau gegen Weiß | Immobilien, Versicherung, Finanzberatung | `#14263F` `#FFFFFF` `#A8894C` | Source Serif 4 / Inter | Grenzüberschreitende Elemente, Katasterraster, Messing-Kursive |

Die vollständigen Verfassungen (komplette Palette mit Regeln, Typo-Skala, Do/Don'ts) werden pro Pack während der Implementierung ausgearbeitet — der Katalog (Runde 2) ist die verbindliche visuelle Referenz.

**Abdeckung:** Jede der 37 SEO-Branchen wird in der Registry genau einem Primär-Pack und 2–3 Alternativ-Packs zugeordnet (für Variant-Picker und Rotation). Fallback für unbekannte Kategorien: `klarwerk`.

---

## 4. Sektions-Engine & Datenvertrag v2

### 4.1 Vertrag

`WebsiteDataV2` ersetzt das heutige lose `WebsiteData` + ad-hoc-Felder. Kernpunkte:

- **Discriminated Union** pro Sektionstyp (`hero | services | about | gallery | testimonials | contact | faq | menu | pricelist | team | cta`) mit typspezifischen Feldern statt des heutigen Universal-`items[]`.
- Alle heute „angehängten" Felder (`heroImage`, `aboutImageUrl`, `logoImageUrl`, `logoFont`, `hiddenSections`, `sectionOrder`, `slug`, `businessCategory`, Impressum/Datenschutz-HTML) werden deklarierte Felder.
- `stylePackId: PackId` und `layoutVersion: 2` sind Teil des Dokuments.
- Zod-Schema in `shared/siteContract/schema.ts` validiert (a) LLM-Ausgabe bei Generierung, (b) Persistenz-Lesepfad. Validierungsfehler bei Generierung → gezielter Retry, kein stiller Fallback.

### 4.2 Engine vs. Pack — die Arbeitsteilung

**Engine (`sections/`)** liefert pro Sektionstyp die Logik: Datenzugriff, Reihenfolge (`sectionOrder`), Sichtbarkeit (`hiddenSections`), semantisches HTML, A11y, Anker-IDs (stabil, deutsch: `#leistungen`, `#ueber-uns`, …).

**Pack (`packs/<id>/`)** liefert das Gesicht:
- **Pflicht:** eigene Hero-Komposition (JSX), Seitenrahmen (Nav-Behandlung, Seitendekor wie Rahmen/Rails/Bordüren), Bild-Behandlung.
- **Pro Sektionstyp:** entweder eigene Komposition oder Auswahl + Styling einer Engine-Basisvariante.
- **Dekor-Komponenten** (Marquee, Stempel, Sticker, Orbs, …) leben im Pack; kein Pack importiert Dekor eines anderen.

**Anti-Baukasten-Regel (verbindlich):** Ein Pack darf nicht ausschließlich aus Token-Overrides bestehen. Jedes Pack hat mindestens: eigene Hero-Struktur, eine eigenwillige Nav-Behandlung und zwei Dekor-Elemente, die Sektionsgrenzen oder Rasterlinien brechen.

### 4.3 Design-Tokens zur Laufzeit

Die Verfassung wird zu CSS Custom Properties (`--pb-*`) auf dem Seiten-Root kompiliert (eine Funktion, `shared/stylePacks/toCssVars.ts`). Packs stylen ausschließlich über diese Variablen + eigene Klassen. Der heutige Doppelweg (CSS-Vars UND direkte `cs.*`-Inline-Styles) entfällt.

Nutzerspezifische Overrides (eigene Markenfarbe, Logo) bleiben möglich: Sie überschreiben gezielt einzelne Variablen, die Verfassung definiert dafür pro Farbe, ob sie override-fähig ist (`locked: true` für z. B. Zunft-Bordeaux, wo Fremdfarben den Stil zerstören würden → Overrides werden dann in die nächstliegende stilkonforme Nuance gemappt).

---

## 5. SSR für Kundenseiten

- **Pfad:** Express-Middleware vor dem SPA-Fallback für: Subdomain-Hosts (`<slug>.pageblitz.de`), `/site/:slug`, `/preview/:token` sowie deren `/impressum`, `/datenschutz`.
- **Rendering:** `renderToString(<SiteRenderer data={…}/>)` in eine HTML-Shell: Title/Meta/OG/Canonical, `LocalBusiness`-Schema.org (aus Business-Daten), Google-Fonts-Links des Packs (nur benötigte Gewichte, `display=swap`), kritisches CSS.
- **Inseln statt Voll-Hydration:** Die Seite selbst ist statisches HTML. Interaktiv sind nur: Kontaktformular, Buchungs-Widget, KI-Chat, Cookie-Banner, Galerie-Lightbox, Mobile-Nav. Diese mounten als kleine Client-Bundles auf markierte Container (`data-island="…"`) — kein Framework-Wechsel, kein Full-Page-React im Kundenkontext.
- **Caching:** Gerendertes HTML pro Website im Speicher-Cache mit Invalidierung bei `websiteData`-Änderung (Publish/Save). Kein Build-Schritt.
- **Onboarding-Preview nutzt denselben Renderer** (im iframe wie heute), damit Preview = Live-Ergebnis garantiert ist.
- Admin-Panel, Landing/SEO-Pages und Onboarding bleiben unverändert SPA bzw. bestehendes SSR.

---

## 6. Generierung: LLM liefert Inhalte, nie Design

- Der Content-Prompt erhält: Business-Daten (GMB), Pack-`essence` + `llmHints`, gewünschte Sektionsliste. Er liefert ausschließlich `WebsiteDataV2`-Inhaltsfelder (zod-validiert).
- Farben, Fonts, Formen, Bild-Behandlung kommen deterministisch aus der Verfassung. Damit entfallen: `DESIGN_ARCHETYPES`-Personas, `getLLMFontPrompt`, `FORBIDDEN_BODY_FONTS`, die dreifache Kontrast-Reparatur.
- Pack-Wahl bei Generierung: Registry-Lookup Branche→Pack-Pool + bestehende `layoutCounters`-Rotation (Tabelle bleibt, Werte werden Pack-IDs).
- Variant-Picker zeigt künftig 2 Packs aus dem Pool desselben Business (bestehender Flow, neue Quelle).

---

## 7. Cutover & Aufräumen

Kein einziger zahlender Kunde (Stand heute) → **kein Migrationspfad**:

1. v2 wird hinter `layoutVersion: 2` aufgebaut; bestehende Test-/Preview-Websites bleiben währenddessen auf v1 lauffähig.
2. Sobald alle 14 Packs den visuellen Abnahme-Check bestehen: Neugenerierung erzwingt v2, Admin-Regenerierung vorhandener Demos auf v2.
3. Danach ersatzloses Löschen: `client/src/components/layouts/`, `WebsiteRenderer`-Dispatch v1, `VARIANT_FAMILY_RANKINGS`, `getLayoutKeyByIndustry`, `getLayoutPool`, `DESIGN_ARCHETYPES`, Alt-Font-/Farb-Mechanik in `shared/layoutConfig.ts` (die Datei schrumpft auf das, was Onboarding-Picker noch brauchen, bzw. geht in die Registry auf).

---

## 8. Teststrategie

1. **Visuelle Regression (primär):** Playwright-Screenshots — 14 Packs × 2 Beispieldatensätze (voll bestückt / minimal) × Breakpoints 320/768/1440, gegen eingecheckte Baselines. Läuft gegen den SSR-Endpoint (testet damit SSR gleich mit).
2. **Vertragstests:** Zod-Schema-Tests (gültige/ungültige LLM-Ausgaben, Rückwärtslesen persistierter Dokumente), Registry-Invarianten (jede der 37 Branchen hat Primär-Pack + Alternativen; jede Pack-ID hat ein Client-Modul).
3. **SSR-Smoke:** HTML enthält Title/Meta/Schema.org und Sektions-Anker ohne JS; Inseln mounten fehlerfrei.
4. **A11y:** axe-Check pro Pack auf der Beispielseite; Kontrast-Invariante wird pro Verfassung statisch geprüft (Test rechnet alle Text/Grund-Paare der Palette durch).
5. **Performance-Budget:** Kundenseite ohne Inseln < 30 kb JS; LCP-relevantes Hero-Bild mit `fetchpriority="high"`, explizite Bildmaße (CLS ≈ 0).

---

## 9. Risiken & Entscheidungen

| Risiko | Entscheidung |
|---|---|
| 14 Packs × eigene Kompositionen = viel Fläche | Packs werden seriell in Qualitätsstufen gebaut (erst 4 „Leuchtturm-Packs" für die häufigsten Branchen: werkbank, morgenlicht, gusto, kanzlei — dann Rest); Engine + Vertrag entstehen mit den ersten vier. |
| SSR-Regression im Express-Setup | SSR-Middleware ist additiv vor dem SPA-Fallback; Flag `SSR_SITES=off` schaltet auf SPA-Auslieferung zurück. |
| User-Farb-Overrides zerstören Pack-Ästhetik | `locked`-Farben + Nuancen-Mapping (Abschnitt 4.3). |
| Google-Fonts-Ladezeit bei ausgefallenen Fonts | Pro Pack max. 2 Familien + Utility, Subset `latin`, nur benötigte Gewichte, `display=swap`, Preload des Display-Fonts. |

## 10. Erfolgskriterien

- Eine generierte Seite ist auf den ersten Blick ihrem Pack zuzuordnen und ist **nicht** als Baukasten-Ergebnis erkennbar (Abnahme durch User pro Pack anhand von Demo-Businesses).
- `curl` auf eine Kundenseite liefert vollständiges HTML mit Inhalten, Meta und Schema.org.
- Kein `any` an Layout-/Sektions-Grenzen; LLM-Ausgabe wird validiert.
- `PremiumLayoutsV2.tsx` und alle Alt-Mappings sind gelöscht.
