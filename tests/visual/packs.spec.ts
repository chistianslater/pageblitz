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
        // SITE_ENHANCER_JS (siteEnhancer.ts) versteckt Sektionen per
        // IntersectionObserver bis zum Hereinscrollen — fullPage-
        // Screenshots würden Sektionen unterhalb des Folds unsichtbar
        // einfangen. reduced-motion lässt das Script die versteckende
        // Klasse gar nicht erst setzen: alles statisch sichtbar.
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(`/dev/site-preview?pack=${pack}&fixture=${fixture}`);
        await page.waitForLoadState("networkidle"); // Fonts geladen
        await expect(page).toHaveScreenshot(
          `${pack}-${fixture}-${vp.name}.png`,
          {
            fullPage: true,
            maxDiffPixelRatio: PACKS_MAX_DIFF_PIXEL_RATIO,
            animations: "disabled",
          }
        );
      });
    }

/**
 * Unterseiten-Baselines (Plan B6, Task 4): je Pack ein Desktop-Screenshot
 * der Demo-Unterseite `/demo/<pack>/leistungen-im-detail` (Fixture "full",
 * Route seit Task 3 verfügbar — `handleDemoPageRoute`). Nur Desktop (nicht
 * alle drei Viewports wie oben), weil der Brief explizit "Desktop-
 * Screenshot" verlangt: die Unterseite teilt Nav/Footer/CSS 1:1 mit der
 * Startseite (dort bereits an allen drei Breakpoints abgedeckt), neu ist
 * hier nur der `pageHeader`-Block + der zusätzliche Seiten-Link mit
 * `aria-current` in der Nav — das reicht ein Breakpoint, um eine visuelle
 * Regression zu fangen.
 */
for (const pack of PACKS)
  test(`${pack} Unterseite "leistungen-im-detail" desktop`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    // Wie oben: Reveal-Script über reduced-motion deterministisch aus.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/demo/${pack}/leistungen-im-detail`);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(
      `${pack}-leistungen-im-detail-desktop.png`,
      {
        fullPage: true,
        maxDiffPixelRatio: PACKS_MAX_DIFF_PIXEL_RATIO,
        animations: "disabled",
      }
    );
  });

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
 * - `werkbank`, `marktplatz`, `schimmer` (B6 Task 9, `accent-text`): der
 *   Original-Flächen-Akzent ist zurück (CTA-Hintergrund = `accent`), der
 *   CTA-Text ist `ink` (≥ 4,5:1 auf dem Akzent; Weiß wäre < 3,4:1) —
 *   `textRole` prüft zusätzlich die `color` des CTAs gegen `ink`.
 */
const CTA_COLOR_CHECKS: Record<
  PackId,
  {
    selector: string;
    prop: "background-color" | "color";
    role: "accent" | "ink";
    /** Zusätzliche Prüfung der Textfarbe (`color`) des CTAs gegen diese Rolle. */
    textRole?: "ink";
  }
> = {
  werkbank: {
    selector: "a.pb-wb-cta",
    prop: "background-color",
    role: "accent",
    textRole: "ink",
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
    textRole: "ink",
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
    textRole: "ink",
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

    if (check.textRole) {
      const textEntry = constitution.palette.find(
        p => p.role === check.textRole
      );
      if (!textEntry)
        throw new Error(
          `Pack "${pack}" hat keinen Paletteneintrag mit role "${check.textRole}"`
        );
      const textColor = await cta.evaluate(el =>
        getComputedStyle(el).getPropertyValue("color")
      );
      expect(rgbStringToHex(textColor)).toBe(textEntry.hex.toLowerCase());
    }
  });
}

/**
 * Galerie-Lightbox (siteEnhancer.ts, 2026-08-25): Klick auf ein Galerie-
 * Bild öffnet die Großansicht (role=dialog), Pfeile blättern, Esc
 * schließt. reduced-motion nur, damit die Reveal-Logik die Galerie nicht
 * erst einblenden muss — die Lightbox selbst ist davon unabhängig.
 */
test("Galerie-Lightbox: öffnen, blättern, schließen", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/dev/site-preview?pack=werkbank&fixture=full");
  await page.waitForLoadState("networkidle");

  const firstImage = page.locator(".pb-site #galerie img").first();
  await firstImage.scrollIntoViewIfNeeded();
  await firstImage.click();

  const lightbox = page.getByRole("dialog", { name: "Bildansicht" });
  await expect(lightbox).toBeVisible();
  const firstSrc = await page.locator(".pb-lb-img").getAttribute("src");
  expect(firstSrc).toBeTruthy();

  await page.getByRole("button", { name: "Nächstes Bild" }).click();
  const secondSrc = await page.locator(".pb-lb-img").getAttribute("src");
  expect(secondSrc).not.toBe(firstSrc);

  await page.keyboard.press("Escape");
  await expect(lightbox).toBeHidden();
});
