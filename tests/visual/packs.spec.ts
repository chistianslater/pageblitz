import { expect, test } from "@playwright/test";
import { getConstitution } from "@shared/stylePacks";
import type { PackId } from "@shared/siteContract/types";

const PACKS = [
  "werkbank",
  "kanzlei",
  "morgenlicht",
  "gusto",
  "patina",
  "salon-noir",
  "marktplatz",
  "landgut",
  "atelier",
  "klarwerk",
  "verve",
  "zunft",
  "schimmer",
  "fundament",
] as const; // Plan B/C erweitern diese Liste
const FIXTURES = ["full", "minimal"] as const;
const VIEWPORTS = [
  { name: "mobil", width: 320, height: 900 },
  { name: "tablet", width: 768, height: 900 },
  { name: "desktop", width: 1440, height: 900 },
];

// maxDiffPixelRatio enger als der globale Default (playwright.config.ts:
// 0.01) — der 1%-Wert verschluckte 5 von 6 Farbfixes aus B4c Task 7 (siehe
// Task-7-Bericht "Important"). 0.003 ist datei-spezifisch (nur hier per
// Options-Objekt, nicht global), weil studio.spec.ts/landing.spec.ts mit
// dem globalen Wert weiterlaufen sollen (Live-Preview-iframes/Fokus-Ringe
// dort brauchen mehr Toleranz).
const PACKS_MAX_DIFF_PIXEL_RATIO = 0.003;

for (const pack of PACKS)
  for (const fixture of FIXTURES)
    for (const vp of VIEWPORTS) {
      test(`${pack} ${fixture} ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(`/dev/site-preview?pack=${pack}&fixture=${fixture}`);
        await page.waitForLoadState("networkidle"); // Fonts geladen
        await expect(page).toHaveScreenshot(
          `${pack}-${fixture}-${vp.name}.png`,
          { fullPage: true, maxDiffPixelRatio: PACKS_MAX_DIFF_PIXEL_RATIO }
        );
      });
    }

/**
 * Deterministische Farbassertion je Pack (B4c Final-Review-Fixwelle 2):
 * Screenshot-Diffs allein verschlucken Farbabweichungen unterhalb der
 * Pixel-Ratio-Schwelle (siehe Task-7-Bericht). Diese Tests prüfen den
 * computed style des primären Hero-CTAs direkt gegen die Verfassung
 * (`getConstitution(pack).palette`) — unabhängig vom Diff-Schwellenwert.
 *
 * Selektor + CSS-Eigenschaft je Pack aus dem jeweiligen `css.ts` ermittelt
 * (siehe `client/src/components/site/packs/<pack>/css.ts`):
 * - Die meisten Packs rendern den Hero-CTA als gefüllten Button
 *   (`background:var(--pb-accent)`) → `background-color` gegen `accent`.
 * - `kanzlei` und `salon-noir` rendern den CTA als reinen Textlink/Outline
 *   mit `color:var(--pb-accent)` im Ruhezustand → `color` gegen `accent`.
 * - `atelier` und `fundament` färben den CTA im Ruhezustand NICHT mit
 *   `accent`, sondern mit `ink` (atelier: `.pb-at-lnk` erbt `color` von
 *   `.pb-atelier{color:var(--pb-ink)}` und hat `border-bottom:var(--pb-ink)`;
 *   fundament: `.pb-fd-cta{background:var(--pb-ink)}`) — hier wird explizit
 *   gegen den `ink`-Paletteneintrag geprüft, nicht gegen `accent`.
 */
const CTA_COLOR_CHECKS: Record<
  PackId,
  {
    selector: string;
    prop: "background-color" | "color";
    role: "accent" | "ink";
  }
> = {
  werkbank: {
    selector: "a.pb-wb-cta",
    prop: "background-color",
    role: "accent",
  },
  kanzlei: { selector: "a.pb-kz-link", prop: "color", role: "accent" },
  morgenlicht: {
    selector: "a.pb-ml-cta",
    prop: "background-color",
    role: "accent",
  },
  gusto: { selector: "a.pb-gu-cta", prop: "background-color", role: "accent" },
  patina: { selector: "a.pb-pa-cta", prop: "background-color", role: "accent" },
  "salon-noir": { selector: "a.pb-sn-cta", prop: "color", role: "accent" },
  marktplatz: {
    selector: "a.pb-mp-cta",
    prop: "background-color",
    role: "accent",
  },
  landgut: {
    selector: "a.pb-lg-cta",
    prop: "background-color",
    role: "accent",
  },
  atelier: { selector: "a.pb-at-lnk", prop: "color", role: "ink" },
  klarwerk: {
    selector: "a.pb-kw-hero-cta",
    prop: "background-color",
    role: "accent",
  },
  verve: { selector: "a.pb-vv-cta", prop: "background-color", role: "accent" },
  zunft: { selector: "a.pb-zf-cta", prop: "background-color", role: "accent" },
  schimmer: {
    selector: "a.pb-sc-cta",
    prop: "background-color",
    role: "accent",
  },
  fundament: { selector: "a.pb-fd-cta", prop: "background-color", role: "ink" },
};

/** "rgb(r, g, b)" / "rgba(r, g, b, a)" → "#rrggbb" (lowercase). */
function rgbStringToHex(rgb: string): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) throw new Error(`Kein rgb()-Farbwert: "${rgb}"`);
  const [, r, g, b] = match;
  return (
    "#" +
    [r, g, b]
      .map(n => Number(n).toString(16).padStart(2, "0"))
      .join("")
      .toLowerCase()
  );
}

for (const pack of PACKS) {
  const check = CTA_COLOR_CHECKS[pack];
  test(`${pack}: Hero-CTA-Farbe entspricht Verfassung (${check.role})`, async ({
    page,
  }) => {
    await page.goto(`/dev/site-preview?pack=${pack}&fixture=full`);
    await page.waitForLoadState("networkidle");

    const constitution = getConstitution(pack);
    const paletteEntry = constitution.palette.find(p => p.role === check.role);
    if (!paletteEntry)
      throw new Error(
        `Pack "${pack}" hat keinen Paletteneintrag mit role "${check.role}"`
      );

    const cta = page.locator(check.selector).first();
    await expect(cta).toBeVisible();
    const computed = await cta.evaluate(
      (el, prop) => getComputedStyle(el).getPropertyValue(prop),
      check.prop
    );

    expect(rgbStringToHex(computed)).toBe(paletteEntry.hex.toLowerCase());
  });
}
