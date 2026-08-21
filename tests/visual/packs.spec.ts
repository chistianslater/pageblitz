import { expect, test } from "@playwright/test";

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
] as const; // Plan B/C erweitern diese Liste
const FIXTURES = ["full", "minimal"] as const;
const VIEWPORTS = [
  { name: "mobil", width: 320, height: 900 },
  { name: "tablet", width: 768, height: 900 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const pack of PACKS)
  for (const fixture of FIXTURES)
    for (const vp of VIEWPORTS) {
      test(`${pack} ${fixture} ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(`/dev/site-preview?pack=${pack}&fixture=${fixture}`);
        await page.waitForLoadState("networkidle"); // Fonts geladen
        await expect(page).toHaveScreenshot(
          `${pack}-${fixture}-${vp.name}.png`,
          { fullPage: true }
        );
      });
    }
