# Landing-Relaunch „Nachtschicht" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Landingpage `/` komplett auf die Nachtschicht-Welt umbauen (Kohle/Volt, Space Grotesk + JetBrains Mono, 10 Sektionen, neue CSS/JS-Hero-Animation, Remotion raus).

**Architecture:** Token-Flip zuerst (`.lp`-Block in index.css), dann Komponente für Komponente in Seitenreihenfolge umbauen; jede Task hält `LandingPage.tsx` kompilierbar (Imports in derselben Task anpassen). Neue Hero-Animation als reine CSS-Phasen + JS-Timer-Timeline. Am Ende SEO-Prerender-Sync + Cleanup + QA.

**Tech Stack:** React 19, Vite 7, TailwindCSS 4 (Tokens via CSS Custom Properties in `.lp`-Scope), Vitest + Testing Library, Wouter.

**Spec:** `docs/superpowers/specs/2026-08-29-landing-relaunch-dark-volt-design.md` — Copy, Tokens und Prinzipien dort sind verbindlich; dieser Plan wiederholt alle verbatim benötigten Werte.

## Global Constraints

- Tokens exakt aus Spec §2: bg `#0b0b0d`, panel `#131316`, panel-2 `#1a1a1e`, ink `#f2f1ee`, muted `#a4a39d`, faint `#7c7b76`, line `rgba(255,255,255,.09)`, volt `#ccff00`, volt-ink `#0b0b0d`, live `#22c55e`, glow `rgba(204,255,0,.08)`, shadow-heavy `0 40px 90px -30px rgba(0,0,0,.9)`.
- Space Grotesk max. Gewicht 700. JetBrains Mono nur 400/500, nur für Kicker/Labels/URLs/Badges — nie Fließtext.
- Eine Akzentfarbe (Volt). `--lp-live` nur für Live-/Erfolgspunkte. Keine zweite Dekorfarbe.
- Elevation: Hairline ODER Schatten, nie beides. `--lp-shadow-heavy` genau 2×: Hero-Bühne, Preis-Karte.
- Kein Kicker-Element über dem Hero-H1. Keine Echo-/Billboard-Doppeltitel.
- Preise ausschließlich aus `shared/pricing.ts` (`PRICE_YEARLY`, `PRICE_MONTHLY`, `addonPrice`, `formatEuro`).
- Studio-Scope nicht anfassen: Änderungen nur in `.lp`-CSS + `client/src/components/landing/` + `client/src/pages/LandingPage.tsx` + `server/seo/homePage.ts`.
- `prefers-reduced-motion: reduce` → statisch, Hero zeigt Phase 4.
- Jede Task endet mit `npx vitest run <betroffene Tests>` grün + eigenem Commit.
- Copy exakt wie Spec §4 (H1/H2/Subs/Risk-Lines dort verbatim).

---

### Task 1: Fundament — Tokens, Fonts, Primitives, Logo

**Files:**
- Modify: `client/src/index.css:483-619` (`.lp`-Block + Dayos-Utilities)
- Modify: `client/index.html` (Font-Link um JetBrains Mono erweitern)
- Create: `client/src/assets/pageblitz-mark.svg`
- Modify: `client/src/components/landing/primitives.tsx`

**Interfaces:**
- Produces: `BrandMark({ className })` (SVG-Zeichen, `fill=currentColor`), `Wordmark({ className })` (BrandMark in Volt + „Pageblitz"), `Kicker` (Mono-Label, Volt), `SectionHead({ kicker?, title, text?, id?, className? })` (ohne `billboard`/`echo`-Props!), `pillPrimary`/`pillGhost` (Volt-/Ghost-Pille), `textLink`, `PRICE_YEARLY`, `PRICE_MONTHLY`, `startHref(billingYearly)` — alle Folge-Tasks importieren NUR diese Namen.

- [ ] **Step 1: JetBrains Mono in `client/index.html` laden** — bestehenden Google-Fonts-Link um `&family=JetBrains+Mono:wght@400;500` erweitern (gleiches `<link>`, `display=swap` bleibt).

- [ ] **Step 2: `.lp`-Token-Block ersetzen** (index.css:483-503) durch:

```css
.lp {
  --lp-bg: #0b0b0d;
  --lp-panel: #131316;
  --lp-panel-2: #1a1a1e;
  --lp-ink: #f2f1ee;
  --lp-muted: #a4a39d;
  --lp-faint: #7c7b76;
  --lp-line: rgba(255, 255, 255, 0.09);
  --lp-volt: #ccff00;
  --lp-volt-ink: #0b0b0d;
  --lp-live: #22c55e;
  --lp-glow: rgba(204, 255, 0, 0.08);
  --lp-shadow-heavy: 0 40px 90px -30px rgba(0, 0, 0, 0.9);
  --lp-display: "Space Grotesk", system-ui, sans-serif;
  --lp-mono: "JetBrains Mono", ui-monospace, monospace;
  --lp-section: clamp(4.5rem, 3.2rem + 6vw, 9rem);
  --lp-ease: cubic-bezier(0.16, 1, 0.3, 1);
  font-family: var(--lp-display);
  background: var(--lp-bg);
  color: var(--lp-ink);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  accent-color: var(--lp-volt);
  caret-color: var(--lp-volt);
}
.lp ::selection { background: var(--lp-volt); color: var(--lp-volt-ink); }
.lp :focus-visible { outline: 2px solid var(--lp-volt); outline-offset: 3px; }
```

Alte Aliase weiter bedienen: direkt danach `--lp-canvas: var(--lp-bg); --lp-surface: var(--lp-panel); --lp-accent: var(--lp-volt); --lp-accent-ink: var(--lp-volt-ink);` in den `.lp`-Block aufnehmen (Kompilierbarkeit der noch nicht umgebauten Komponenten). Die Tailwind-Brücke (`--color-lp-*` um Zeile 132-142) auf die neuen Variablen prüfen — sie referenziert `var(--lp-*)` und bleibt unverändert gültig; fehlende Brücken (`--color-lp-panel`, `--color-lp-volt-ink`, `--color-lp-faint`) ergänzen.

- [ ] **Step 3: Dayos-Utilities neutralisieren** — `.lp-kicker` (Zeile 535-549) ersetzen durch Mono-Label:

```css
.lp-kicker {
  display: inline-flex; align-items: center; width: fit-content; margin: 0;
  font-family: var(--lp-mono);
  font-size: 0.72rem; font-weight: 500;
  letter-spacing: 0.07em; text-transform: uppercase;
  color: var(--lp-volt);
}
```

`.lp-echo`, `.lp-h2--billboard`, `.lp-manifesto`, `.lp-pillar` bleiben vorerst stehen (werden in Task 10 gelöscht, wenn kein Nutzer mehr existiert). Alle `var(--lp-mint)`-Vorkommen im `.lp`-Scope auf `var(--lp-volt)` umstellen.

- [ ] **Step 4: `pageblitz-mark.svg` anlegen** — Inhalt: das gelieferte SVG ohne weißes Hintergrund-`<path>`, Wurzel `<svg viewBox="480 380 1060 1360" xmlns="…">`, einziger Pfad mit `fill="currentColor"`. Pfaddaten identisch aus `~/Downloads/magnific_keep-the-core-concept-of-_VXtcgrIMMU.svg` übernehmen (der `M 889.39 448.271 … z`-Pfad; das Mockup-Fragment `scratchpad/part4.html` der Session enthält ihn bereits fertig zugeschnitten).

- [ ] **Step 5: `primitives.tsx` umbauen** — `BlitzMark` ersetzen durch:

```tsx
/** Neues Blitz-Zeichen (2026-08). Farbe via currentColor. */
export function BrandMark({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="480 380 1060 1360" aria-hidden="true" className={className}>
      <path fill="currentColor" d="M 889.39 448.271 …(kompletter Pfad aus Step 4)… z" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <BrandMark className="h-6 w-auto text-lp-volt" />
      <span className="text-[1.08rem] font-bold tracking-[-0.01em] text-lp-ink">Pageblitz</span>
    </span>
  );
}
```

`SectionHead`: Props `billboard`/`echo` entfernen, Body auf schlichten Kopf reduzieren (Kicker optional, `lp-h2`, Text `text-lp-muted`). Pillen:

```tsx
const PILL = "lp-press inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-[0.95rem] font-bold disabled:opacity-50 transition-transform";
export const pillPrimary = `${PILL} bg-lp-volt text-lp-volt-ink shadow-[0_0_32px_-6px_rgba(204,255,0,.4)] hover:-translate-y-px`;
export const pillGhost = `${PILL} border border-lp-line bg-transparent text-lp-ink hover:border-lp-volt`;
export const pillInk = pillPrimary; // Alias für bestehende Importe
export const textLink = "inline-flex items-center gap-1 font-medium text-lp-ink underline decoration-[var(--lp-volt)] decoration-2 underline-offset-[0.22em] hover:text-lp-volt";
```

Ein `grep -rn "billboard\|echo=" client/src/components/landing client/src/pages/LandingPage.tsx` — alle Aufrufer der entfernten Props in dieser Task mit-fixen (Props einfach weglassen).

- [ ] **Step 6: Build + Tests laufen lassen** — `npx vitest run client/src/components/landing` und `npm run build`. Erwartung: grün/erfolgreich (visuell darf es zerrupft aussehen — Folgetasks). Scheitert ein bestehender Test nur an Farb-/Klassen-Assertions, in dieser Task anpassen.

- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat(landing): Nachtschicht-Tokens, Mono-Kicker, BrandMark-Logo, Volt-Pillen"`

---

### Task 2: HeroBuildLive — neue Hero-Animation (TDD)

**Files:**
- Create: `client/src/components/landing/HeroBuildLive.tsx`
- Create: `client/src/components/landing/HeroBuildLive.test.tsx`
- Modify: `client/src/index.css` (neuer `.lpb`-Block, alten ersetzen)
- Delete: `client/src/components/landing/hero-film/` (6 Dateien), `client/src/components/landing/HeroBuild.tsx`
- Modify: `client/src/components/landing/LandingHero.tsx` (Import `HeroBuild` → `HeroBuildLive`)
- Modify: `package.json`, `vite.config.ts` (Remotion-Reste)

**Interfaces:**
- Produces: `HeroBuildLive()` — parameterlose Komponente, rendert `role="img"` mit `aria-label` und `data-phase`; exportiert zusätzlich `DEMO_NAME = "Schreinerei Brandt"` und `phaseSchedule(nameLength: number): { phase2: number; phase3: number; phase4: number; loop: number }` (reine Funktion, Millisekunden ab Zyklusstart) für Tests.

- [ ] **Step 1: Failing Test schreiben** (`HeroBuildLive.test.tsx`):

```tsx
import { describe, expect, it, vi, afterEach } from "vitest";
import { cleanup, render, screen, act } from "@testing-library/react";
import { HeroBuildLive, DEMO_NAME, phaseSchedule } from "./HeroBuildLive";

afterEach(cleanup);

describe("phaseSchedule", () => {
  it("ordnet die Phasen streng aufsteigend an", () => {
    const s = phaseSchedule(DEMO_NAME.length);
    expect(s.phase2).toBeGreaterThan(0);
    expect(s.phase3).toBeGreaterThan(s.phase2);
    expect(s.phase4).toBeGreaterThan(s.phase3);
    expect(s.loop).toBeGreaterThan(s.phase4);
  });
});

describe("HeroBuildLive", () => {
  it("durchläuft die Phasen 1→2→3→4 und tippt den Demo-Namen", () => {
    vi.useFakeTimers();
    render(<HeroBuildLive />);
    const root = screen.getByRole("img");
    expect(root.dataset.phase).toBe("1");
    const s = phaseSchedule(DEMO_NAME.length);
    act(() => vi.advanceTimersByTime(s.phase2 + 10));
    expect(root.dataset.phase).toBe("2");
    expect(root.textContent).toContain(DEMO_NAME);
    act(() => vi.advanceTimersByTime(s.phase4 - s.phase2));
    expect(root.dataset.phase).toBe("4");
    act(() => vi.advanceTimersByTime(s.loop - s.phase4 + 100));
    expect(root.dataset.phase).toBe("1"); // Loop neu gestartet
    vi.useRealTimers();
  });

  it("räumt Timer beim Unmount ab", () => {
    vi.useFakeTimers();
    const { unmount } = render(<HeroBuildLive />);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });
});
```

Hinweis: `matchMedia` wird im jsdom-Setup ggf. gemockt — vorhandenes Test-Setup (vitest.config bzw. Setup-Datei) prüfen und dasselbe Muster wie bestehende Komponententests nutzen. Reduced-Motion-Pfad (`data-phase="4"`, keine Timer) als dritten `it`-Fall ergänzen, indem der matchMedia-Mock `matches: true` liefert.

- [ ] **Step 2: Test rot laufen lassen** — `npx vitest run client/src/components/landing/HeroBuildLive.test.tsx` → FAIL (Modul existiert nicht).

- [ ] **Step 3: Komponente implementieren** — Struktur = Demo-Anatomie aus dem Mockup (`.d-*`-Klassen als `lpb-*`), Timeline:

```tsx
export const DEMO_NAME = "Schreinerei Brandt";
const TYPE_START = 420, TYPE_MS = 55;
export function phaseSchedule(nameLength: number) {
  const typed = TYPE_START + nameLength * TYPE_MS;
  return { phase2: typed + 350, phase3: typed + 2350, phase4: typed + 4950, loop: typed + 7750 };
}
```

Komponente: `useState<string>` für getippten Text, `useRef<number[]>` für Timer-IDs, `useEffect` startet Zyklus (Funktion `cycle()` setzt `data-phase` via State, Timer-Kette gemäß `phaseSchedule`, Schleife durch erneutes `cycle()` bei `loop`); Cleanup cleart alle Timer. Reduced Motion (`window.matchMedia("(prefers-reduced-motion: reduce)").matches`): sofort Phase 4 + voller Name, keine Timer. Zusätzlich IntersectionObserver: außerhalb des Viewports Timer stoppen, beim Wiedereintritt Zyklus neu starten (Feature-Detect `if ("IntersectionObserver" in window)` — jsdom-Tests bleiben unberührt).

Markup (`role="img"`, deutsches aria-label „Animation: Aus dem Google-Profil der Schreinerei Brandt entsteht Schritt für Schritt eine fertige Website — bis sie live ist.", innen alles `aria-hidden`): Chrome-Bar (3 Punkte + URL `pageblitz.de/studio` → Phase 4 `brandt-schreinerei.pageblitz.de`), Suchfeld mit getipptem Text + Caret, 4 Chips („★ 4,9 · 127 Bewertungen", „12 Fotos", „Öffnungszeiten", „Adresse & Karte"), Frame mit Skeleton (4 Shimmer-Balken), Site-Nav („BRANDT." + Arbeit/Werkstatt/Kontakt), H1-Zeilen „MASSARBEIT/AUS HOLZ./PUNKT." (dritte Zeile `#e05e1b`), Holz-Gradient-Fläche, CTA „PROJEKT ANFRAGEN", Sterne „★★★★★ 4,9 bei Google", Volt-Badge „● LIVE".

- [ ] **Step 4: `.lpb`-CSS ersetzen** — alten `.lpb`-Block in index.css suchen (`grep -n "lpb" client/src/index.css`) und komplett durch die Nachtschicht-Fassung ersetzen: die Regeln aus dem Mockup (`part1.html` GEMEINSAM-Block + `part4.html` `.vd .d-*`-Skin) 1:1 portieren, Klassen `d-` → `lpb-`, Farben auf Tokens (`var(--lp-panel)` statt `#131316` usw.), `@media (prefers-reduced-motion: reduce)`-Block inklusive. Frame-Schatten = `var(--lp-shadow-heavy), 0 0 70px -30px rgba(204,255,0,.22)` (erste erlaubte Heavy-Shadow-Stelle).

- [ ] **Step 5: Tests grün** — `npx vitest run client/src/components/landing/HeroBuildLive.test.tsx` → PASS.

- [ ] **Step 6: Alt-Code entfernen** — `hero-film/`-Ordner + `HeroBuild.tsx` löschen; `LandingHero.tsx` importiert `HeroBuildLive`; `grep -rn "remotion\|hero-film\|HeroBuild\b" client server vite.config.ts package.json` → Treffer in `vite.config.ts` (Chunk-/Alias-Konfig) und `package.json` (dependency) entfernen, dann `npx -y pnpm@9.15.9 install` (Lockfile-Update) und `npm run build` + `npm run build:islands` als Gegenprobe.

- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat(landing): HeroBuildLive ersetzt Remotion-Hero — CSS/JS-Phasenanimation, Remotion entfernt"`

---

### Task 3: Hero-Sektion (Copy + Layout)

**Files:**
- Modify: `client/src/components/landing/LandingHero.tsx`
- Modify: `client/src/pages/LandingPage.tsx` (nur falls Props sich ändern — Formular-Logik bleibt)

**Interfaces:**
- Consumes: `HeroBuildLive`, `pillPrimary`, `PRICE_YEARLY` aus Task 1/2. `HeroForm`-Props (`value/onChange/onSubmit/idPrefix/size/layout`) bleiben unverändert — `LandingFooter.FinalCta` nutzt sie weiter.

- [ ] **Step 1: Hero umbauen** — Kicker-Zeile ersatzlos streichen. H1: `Die fertige Website für deinen Betrieb — <em>in 3&nbsp;Minuten.</em>` (`em` als `not-italic text-lp-volt`). Sub exakt Spec §4.2. Grid `lg:grid-cols-12`, Copy `lg:col-span-5`, Bühne `lg:col-span-7`; Bühnen-Wrapper mit `relative`-Panel-Fläche, die rechts ausläuft (eigene CSS-Klasse `.lp-hero-stage` analog Mockup `.vd .stage`: `::before` mit `inset: 0 -100vw 0 0`, Panel-Verlauf, `border-radius: 24px 0 0 24px`, Hairline), Glow als Radial oben rechts (`--lp-glow`). `HeroForm`-Texte: Placeholder „Wie heißt dein Betrieb?", Button „Meine Website ansehen", Reibungszeile darunter ersetzen durch Mono-Risk-Line: `Kostenlos ansehen · keine Kreditkarte · monatlich kündbar` (`font-[family-name:var(--lp-mono)] text-[0.74rem] uppercase tracking-[0.02em] text-lp-faint`, „Kostenlos ansehen" in `text-lp-volt`). `TrustLine`-Aufzählung im Hero entfernen; Export `TrustLine` nur behalten, wenn `grep -rn "TrustLine" client/` weitere Nutzer zeigt, sonst löschen.

- [ ] **Step 2: Sichtprüfung** — `npm run dev`, `/` bei 1440 und 375 px: Copy links, Animation rechts läuft, keine horizontale Scrollbar (`document.documentElement.scrollWidth === innerWidth` in der Konsole).

- [ ] **Step 3: Tests + Commit** — `npx vitest run client/src/components/landing` → grün. `git add -A && git commit -m "feat(landing): Hero Nachtschicht — neue Copy, asymmetrische Bühne, Risk-Line"`

---

### Task 4: Beweis-Streifen (ProofBar ersetzen)

**Files:**
- Modify: `client/src/components/landing/ProofBar.tsx` (Inhalt komplett ersetzen)
- Modify: `client/src/components/landing/ProofBar.test.ts` → umbenennen zu `ProofBar.test.tsx`, neue Assertions

**Interfaces:**
- Produces: `ProofBar()` parameterlos (wie bisher, LandingPage-Import bleibt).

- [ ] **Step 1: Failing Test** — neue Datei-Inhalte: rendert `<ProofBar />`, erwartet Texte „Statt Agentur", „19,90 €/Monat", „3 Minuten", „0 €" und dass die durchgestrichenen Anker als `<s>` mit `aria-label` erscheinen (z. B. `screen.getByLabelText(/statt 2\.000 bis 8\.000 Euro/i)`). Rot laufen lassen.

- [ ] **Step 2: Implementieren** — 3 Spalten (`grid md:grid-cols-3`, Hairline-Divider `divide-y md:divide-y-0 md:divide-x divide-[var(--lp-line)] border-y border-[var(--lp-line)]`), pro Spalte: Mono-Kicker (Volt), Wert-Zeile `text-[1.5rem] font-bold` mit `<s className="mr-2 font-medium text-lp-faint" aria-label="statt 2.000 bis 8.000 Euro">2.000–8.000 €</s>{PRICE_YEARLY}/Monat`, Beschreibungssatz `text-lp-muted`. Inhalte der drei Spalten exakt Spec §4.3. Preis aus `PRICE_YEARLY`, nicht hartcodiert (die Anker „2.000–8.000 €", „4–12 Wochen" sind bewusst Text).

- [ ] **Step 3: Grün + Commit** — `npx vitest run client/src/components/landing/ProofBar.test.tsx` → PASS. `git add -A && git commit -m "feat(landing): Beweis-Streifen mit Preis-/Zeitanker und Risikoumkehr"`

---

### Task 5: Problem-Sektion (+ ManifestoBand löschen)

**Files:**
- Modify: `client/src/components/landing/ProblemSection.tsx`
- Delete: `client/src/components/landing/ManifestoBand.tsx`
- Modify: `client/src/pages/LandingPage.tsx` (Import + `<ManifestoBand />` entfernen)

**Interfaces:**
- Consumes: `ProblemSection({ billingYearly })` — Prop bleibt (CTA-Href via `startHref(billingYearly)`).

- [ ] **Step 1: Umbau** — H2 „Jeden Tag suchen Kunden — und wählen einen anderen." (einfacher `SectionHead`, kein Echo). Drei Punkte als Hairline-Karten (`rounded-2xl border border-[var(--lp-line)] p-6`, Titel `font-bold text-lp-ink`, Text `text-lp-muted`): 1 „Kunden suchen — und finden dich nicht" / 2 „Deine Bewertungen arbeiten nicht für dich" / 3 „Der Mitbewerber mit Website bekommt den Auftrag" (Beschreibungstexte aus Bestand kürzen, je ≤ 2 Sätze). Schlusszeile groß (`lp-h2`-Größe, `max-w-[38rem]`): `Nicht weil deine Arbeit schlechter ist. Sondern weil man sie <em className="not-italic text-lp-volt">online nicht sieht.</em>` Danach `pillPrimary`-CTA „Website kostenlos erstellen" → `startHref(billingYearly)`.

- [ ] **Step 2: ManifestoBand löschen**, Import/JSX aus `LandingPage.tsx` entfernen. `grep -rn "ManifestoBand" client/` → 0 Treffer.

- [ ] **Step 3: Tests + Commit** — `npx vitest run client/src/components/landing && npm run build` → grün. `git add -A && git commit -m "feat(landing): Problem-Sektion mit Verlustaversion, ManifestoBand aufgelöst"`

---

### Task 6: Ablauf-Sektion (HowItWorks + StudioProof verschmelzen)

**Files:**
- Modify: `client/src/components/landing/HowItWorks.tsx`
- Delete: `client/src/components/landing/StudioProof.tsx`
- Modify: `client/src/pages/LandingPage.tsx`

**Interfaces:**
- Produces: `HowItWorks()` parameterlos (wie bisher).

- [ ] **Step 1: Umbau** — H2 „Vier Schritte. Keine Technik." Sub: „Das Studio führt dich in der Reihenfolge, in der auch eine Agentur arbeiten würde — nur in Minuten statt Wochen." 4 Schritte als 2×2-Grid (mobil 1-spaltig), Nummerierung `01–04` in Mono-Volt (echte Sequenz → erlaubt). Jeder Schritt: Mini-Visual oben (fixe Höhe ~120px, `rounded-xl border border-[var(--lp-line)] bg-lp-panel`, Inhalt reine CSS/SVG-Andeutung), Titel, 1 Satz. Visuals: 1 = Suchfeld-Balken + G-Punkt; 2 = drei kleine Farbkarten (eine mit Volt-Rahmen als „gewählt"); 3 = Checkliste (3 Zeilen, 2 abgehakt) neben Mini-Browserfenster (das StudioProof-Motiv „links Checkliste, rechts live"); 4 = Toggle-Pille + Live-Punkt (`--lp-live`). Copy der 4 Schritte aus Bestand übernehmen (Titel: „Firmenname eingeben – oder Google-Profil übernehmen" / „Designrichtung bestimmen" / „Texte und Bilder prüfen" / „Freischalten – und live").

- [ ] **Step 2: StudioProof löschen**, LandingPage bereinigen, `grep -rn "StudioProof" client/` → 0.

- [ ] **Step 3: Tests + Commit** — Suite grün. `git add -A && git commit -m "feat(landing): Ablauf-Sektion mit Mini-Visuals, StudioProof verschmolzen"`

---

### Task 7: Designrichtungen-Karussell (+ ForWhom löschen)

**Files:**
- Modify: `client/src/components/landing/PackShowcase.tsx`, `PackShowcase.test.tsx`
- Delete: `client/src/components/landing/ForWhom.tsx`
- Modify: `client/src/pages/LandingPage.tsx`

**Interfaces:**
- Consumes: `PACK_SUMMARY` aus `@shared/stylePacks/summary` (`{ id, name, essence, accent }`).
- Produces: `PackShowcase()` parameterlos; neue lokale Konstante `PACK_INDUSTRIES: Record<PackId, string>`.

- [ ] **Step 1: Failing Test erweitern** — `PackShowcase.test.tsx`: zusätzlich erwarten, dass jede Karte eine Branchen-Zeile rendert (`expect(screen.getByText("Schreinerei, Zimmerei, Metallbau")).toBeInTheDocument()` für werkbank), ein „Ansehen"-Link auf `/demo/werkbank` zeigt, und `PACK_SUMMARY.every(p => Boolean(PACK_INDUSTRIES[p.id]))`. Rot laufen lassen.

- [ ] **Step 2: Implementieren** — Karte um Branchen-Zeile (`text-[0.8rem] text-lp-faint`) erweitern; Mapping (Ids vorher gegen `shared/siteContract/packIds.ts` prüfen und Schreibweise exakt übernehmen):

```ts
export const PACK_INDUSTRIES: Record<string, string> = {
  werkbank: "Schreinerei, Zimmerei, Metallbau",
  patina: "Café, Vintage-Laden, Concept Store",
  kanzlei: "Anwalt, Steuerberatung, Notariat",
  "salon-noir": "Friseur, Barbershop, Beauty",
  morgenlicht: "Praxis, Physiotherapie, Wellness",
  marktplatz: "Bäckerei, Eisdiele, Familiengeschäft",
  gusto: "Restaurant, Weinbar, Bistro",
  landgut: "Gärtnerei, Hofladen, Floristik",
  atelier: "Fotografie, Design, Kreativstudio",
  klarwerk: "Ingenieurbüro, IT-Service, Architektur",
  verve: "Fitnessstudio, Tanzschule, Coaching",
  zunft: "Metzgerei, Brauerei, Traditionsbetrieb",
  lichtlabor: "Kosmetik, Ästhetik, Hautpflege",
  fundament: "Bauunternehmen, Immobilien, Hausverwaltung",
};
```

H2/Sub gemäß Spec §4.6, Karussell-Mechanik des Bestands (Scroll-Snap) beibehalten, Chrome auf Panel/Hairline umfärben, aktiver Pfeil/Hover Volt. Unter dem Karussell `textLink` „Alle Branchen ansehen" auf denselben Href, den heute ForWhom nutzt (aus `ForWhom.tsx` kopieren, dann Datei löschen).

- [ ] **Step 3: ForWhom löschen**, LandingPage bereinigen (`<ForWhom />` raus), `grep -rn "ForWhom" client/` → 0.

- [ ] **Step 4: Grün + Commit** — `npx vitest run client/src/components/landing/PackShowcase.test.tsx` → PASS. `git add -A && git commit -m "feat(landing): Pack-Karussell mit Branchenzeilen ersetzt ForWhom"`

---

### Task 8: Extras + Preis + Anker

**Files:**
- Modify: `client/src/components/landing/FeatureShowcase.tsx`
- Modify: `client/src/components/landing/Pricing.tsx`

**Interfaces:**
- Consumes: `Pricing({ billingYearly, onBillingChange })` — Props unverändert; `addonPrice`, `ADDON_NAMES`, `formatEuro`, `FEATURE_ADDON_KEYS` aus `@shared/pricing`.

- [ ] **Step 1: FeatureShowcase dunkel** — Struktur/Inhalte (Chat/Galerie/Terminbuchung-Minidemos) beibehalten, Flächen auf `bg-lp-panel`/Hairlines, Akzente Volt, H2 „Deine Website ist kein Plakat. Sie arbeitet.". Jede Demo bekommt Mono-Badge `EXTRA · + {formatEuro(addonPrice(key))}` (Keys für Chat/Galerie/Buchung aus `FEATURE_ADDON_KEYS`/`ADDON_KEYS` nachschlagen, nicht raten). Demo-Chrome darf `--lp-shadow-heavy` NICHT verwenden (Budget: nur Hero + Preis-Karte) — Hairlines reichen.

- [ ] **Step 2: Pricing umbauen** — Die Vergleichs-Sektion („Der Vergleich"-Tabelle; per `grep -rn "Vergleich" client/src/components/landing/*.tsx` lokalisieren) ersetzen durch kompakten Anker-Block neben der Preis-Karte (`lg:grid-cols-[3fr_2fr]`): 3 Mono-gekickerte Zeilen (Einmalig: Agentur 2.000–8.000 € / Pageblitz 0 € · Monatlich: 50–150 € / ab {PRICE_YEARLY} · Zeit: 4–12 Wochen / 3 Minuten) + Schlusszeile „Ersparnis im ersten Jahr: bis zu 8.000 €." Preis-Karte: `bg-lp-panel`, `shadow-[var(--lp-shadow-heavy)]` (zweiter erlaubter Einsatz, dann OHNE Hairline-Border), Toggle-Pille Volt-aktiv, Inklusiv-Liste + Extras-Grid + CTA/Einwandzeile wie Bestand (Copy Spec §4.8).

- [ ] **Step 3: Tests + Commit** — Suite + Build grün, Sichtprüfung 375px (Anker-Block rutscht unter die Karte). `git add -A && git commit -m "feat(landing): Extras-Demos dunkel, Preis mit integriertem Agentur-Anker"`

---

### Task 9: Nav, Vertrauen, FAQ, Footer, StickyCta, Testimonials (Restyle-Sammeltask)

**Files:**
- Modify: `LandingNav.tsx`, `LandingNav.test.tsx`, `TrustSection.tsx`, `Faq.tsx`, `LandingFooter.tsx`, `StickyCta.tsx`, `Testimonials.tsx`

**Interfaces:**
- Consumes: alles aus Task 1. Keine Prop-Änderungen an diesen Komponenten.

- [ ] **Step 1: LandingNav → Glas** — Wrapper: `sticky top-0 z-40` außen, innen schwebende Leiste `mx-4 mt-3 rounded-2xl border border-[var(--lp-line)] bg-[rgba(20,20,23,.6)] backdrop-blur-xl` (Fallback: `@supports not (backdrop-filter: blur(1px))` → `bg-lp-panel`). `Wordmark` links, Links `text-lp-muted hover:text-lp-ink`, CTA `pillPrimary` kompakt (`h-10 px-5`). Burger-Menü-Flyout auf Panel-Farben. `LandingNav.test.tsx`-Assertions (Texte/Hrefs) prüfen und nur bei Farb-/Klassenbezug anpassen.
- [ ] **Step 2: TrustSection** — H2 „In sicheren Händen — ohne Kleingedrucktes.", 4 Hairline-Karten, Mono-Kicker (RECHT/HOSTING/INHALTE/VERTRAG), Copy unverändert aus Bestand.
- [ ] **Step 3: Faq** — Akkordeon: Hairline-Trenner, Frage `text-lp-ink font-medium`, Antwort `text-lp-muted`, Chevron Volt bei offen. Inhalte unverändert (`shared/faq.ts`).
- [ ] **Step 4: FinalCta (in LandingFooter.tsx)** — Volt-Bühne: Container `rounded-3xl bg-lp-volt text-lp-volt-ink`, H2 „Sehen kostet nichts.", `HeroForm` mit `idPrefix="final"` (Feldvariante auf Volt-Grund: Input `border-lp-volt-ink/30 bg-white/85 text-lp-volt-ink`, Button `bg-lp-volt-ink text-lp-volt`), Risk-Line in `text-lp-volt-ink/70`. Footer + IndustryLinks: `bg-lp-bg`, Hairlines, Links `text-lp-muted hover:text-lp-ink`.
- [ ] **Step 5: StickyCta** — mobile Leiste `border-t border-[var(--lp-line)] bg-lp-panel/90 backdrop-blur`, Button `pillPrimary`.
- [ ] **Step 6: Testimonials** — leer-rendernde Logik unangetastet; nur die (bei leerem Array unsichtbaren) Stilklassen auf Panel/Hairline aktualisieren.
- [ ] **Step 7: Tests + Commit** — `npx vitest run client/src/components/landing && npm run build`. `git add -A && git commit -m "feat(landing): Nav/Trust/FAQ/Footer/StickyCta in Nachtschicht-Welt"`

---

### Task 10: LandingPage-Reihenfolge + toter Code + Scroll-Reveal

**Files:**
- Modify: `client/src/pages/LandingPage.tsx`
- Modify: `client/src/index.css` (tote Klassen)

- [ ] **Step 1: Sektionsreihenfolge final** — `LandingHero → ProofBar → ProblemSection → HowItWorks → PackShowcase → FeatureShowcase → Pricing → TrustSection → Testimonials → IndustryLinks → Faq → FinalCta` (+ Nav/Footer/StickyCta/DeferredChatWidget wie gehabt). Kommentarblock im Kopf der Datei auf die neue Dramaturgie aktualisieren (Spec-Referenz nennen). Scroll-Reveal-Effekt (IntersectionObserver, `lp-reveal-on`) behalten; Reveal-Transition in index.css auf `500ms var(--lp-ease)` + 12px Versatz stellen.
- [ ] **Step 2: Tote CSS-Klassen löschen** — `grep`-verifiziert entfernen: `.lp-echo`, `.lp-h2--billboard`, `.lp-manifesto`, `.lp-pillar`, alle verbliebenen `--lp-mint`-Definitionen, Alias-Tokens aus Task 1 Step 2 (`--lp-canvas/--lp-surface/--lp-accent/--lp-accent-ink`), sobald `grep -rn "lp-mint\|lp-canvas\|lp-surface\|lp-accent\|lp-echo\|billboard\|lp-manifesto\|lp-pillar" client/src` nur noch CSS-Definitionen zeigt (Tailwind-Brücke `--color-lp-*` mitziehen).
- [ ] **Step 3: Tests + Build + Commit** — komplette Suite `npx vitest run` + `npm run build`. `git add -A && git commit -m "refactor(landing): finale Sektionsreihenfolge, tote Dayos-Klassen entfernt"`

---

### Task 11: SEO-Prerender synchronisieren

**Files:**
- Modify: `server/seo/homePage.ts` (+ zugehöriger Test, falls vorhanden: `grep -rln "homePage" server --include="*.test.ts"`)

- [ ] **Step 1: Crawler-HTML aktualisieren** — H1 auf „Die fertige Website für deinen Betrieb — in 3 Minuten.", Sektionstitel auf die neuen H2 (Spec §4.3–4.10), Inhalte gestrichener Sektionen (Manifesto, ForWhom, Vergleichstabelle, StudioProof) entfernen bzw. in die verschmolzenen Abschnitte überführen. FAQ-Schema-Quelle (`shared/faq.ts`) unverändert. Branchen-Aufzählung der ForWhom-Sektion in den Karussell-Abschnitt übernehmen (SEO-Keywords behalten!).
- [ ] **Step 2: Verifizieren** — `npm run dev`, dann `curl -A "Googlebot" http://localhost:3000/ | grep -o "<h1>[^<]*</h1>"` → neuer H1; `curl -A "Googlebot" http://localhost:3000/ | grep -c "Werkbank"` ≥ 1. Bestehende Server-Tests laufen lassen.
- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat(seo): Prerender der Startseite auf Nachtschicht-Copy synchronisiert"`

---

### Task 12: QA-Schlusspass

- [ ] **Step 1: Volle Suite + Build** — `npx vitest run` und `npm run build` grün; `ls dist/public/assets | grep -i remotion` → leer.
- [ ] **Step 2: Visuelle Prüfung** — Browser-Pane/Playwright: Screenshots 320/375/768/1024/1440 von `/`; prüfen: kein horizontaler Overflow, Hero-Animation läuft und pausiert außerhalb des Viewports, Karussell scrollt per Touch/Drag, Preis-Anker bricht sauber um, FinalCta-Volt-Bühne lesbar, Fokusringe sichtbar (Tab-Reihenfolge Nav → Hero-Form).
- [ ] **Step 3: Reduced Motion** — Emulation `prefers-reduced-motion: reduce`: Hero statisch in Phase 4, keine Reveals.
- [ ] **Step 4: Bundle-Budget** — Vite-Build-Report der Landing-Chunks < 150 kB gzip; Lighthouse mobil auf `/` (Ziel ≥ 90, Ergebnis dokumentieren).
- [ ] **Step 5: Befund-Commit** — etwaige Fixes einzeln committen; abschließend `git commit --allow-empty -m "chore(landing): QA-Pass Nachtschicht-Relaunch"` mit Befundliste im Body.

---

## Self-Review (erledigt)

- Spec-Abdeckung: §2 → Task 1, §3 → Task 2, §4.1 → Task 9, §4.2 → Task 3, §4.3 → Task 4, §4.4 → Task 5, §4.5 → Task 6, §4.6 → Task 7, §4.7/4.8 → Task 8, §4.9/4.10 → Task 9, §5 komplett über Tasks 2/5/6/7, §6 → Tasks 1/2/10/11, §7 → Tasks 2/4/7/12, §8 dokumentiert (OG/Favicon explizit out of scope).
- Typkonsistenz: `BrandMark/Wordmark/Kicker/SectionHead/pillPrimary/pillGhost/pillInk/textLink/PRICE_YEARLY/startHref` (Task 1) werden in Tasks 3–9 mit exakt diesen Namen konsumiert; `HeroBuildLive/DEMO_NAME/phaseSchedule` nur in Task 2/3; `PACK_INDUSTRIES` nur in Task 7.
- Platzhalter: Der SVG-Pfad in Task 1 Step 5 ist mit „…" abgekürzt — Quelle eindeutig (Step 4 + Session-Scratchpad `part4.html`); Pack-Id-Schreibweisen werden in Task 7 explizit gegen `packIds.ts` verifiziert statt geraten.
