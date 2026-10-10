import { test, expect, type Page } from "@playwright/test";

/**
 * Lazy-Bilder (Galerie-Karussell, Über-uns, Leistungsbilder) laden in einem
 * fullPage-Screenshot sonst nicht deterministisch — v. a. die waagrecht
 * gescrollten Karussell-Bilder liegen außerhalb des Viewports. Hier alle
 * Bilder auf eager stellen und auf decode() warten, bevor verglichen wird.
 */
async function settleImages(page: Page): Promise<void> {
  await page.evaluate(async () => {
    // Bilder ohne Quelle (z. B. leere Platzhalter-<img> aus Inseln) melden
    // weder load noch error — die werden übersprungen.
    const imgs = [...document.images].filter(img => img.getAttribute("src"));
    for (const img of imgs) img.loading = "eager";
    await Promise.all(
      imgs.map(img =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>(resolve => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            })
      )
    );
    await Promise.all(imgs.map(img => img.decode().catch(() => undefined)));
  });
}

// Bildvergleich Designsystem Journal (Plan 2026-10-10, Task 17): alle drei
// Farbstimmungen × zwei Inhaltsstände × fünf Breiten. Zusätzlich hart:
// kein waagrechter Überlauf (scrollWidth ≤ innerWidth) auf jeder Breite.
const PALETTES = ["papier", "salbei", "ton"] as const;
const FIXTURES = ["full", "minimal"] as const;
const WIDTHS = [320, 375, 768, 1024, 1440] as const;

for (const palette of PALETTES) {
  for (const fixture of FIXTURES) {
    for (const width of WIDTHS) {
      test(`journal ${palette} ${fixture} ${width}`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.setViewportSize({ width, height: 900 });
        await page.goto(
          `/dev/site-preview?system=journal&palette=${palette}&fixture=${fixture}`
        );
        await page.evaluate(() => document.fonts.ready);
        await settleImages(page);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        );
        expect(overflow).toBeLessThanOrEqual(0);
        await expect(page).toHaveScreenshot(
          `journal-${palette}-${fixture}-${width}.png`,
          { fullPage: true, maxDiffPixelRatio: 0.003 }
        );
      });
    }
  }
}

test("Schriften werden geladen (keine Fallback-Schrift)", async ({ page }) => {
  await page.goto("/dev/site-preview?system=journal&fixture=full");
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() =>
    [...document.fonts].filter(f => f.status === "loaded").map(f => f.family)
  );
  // Journal-Tokens (shared/designSystems/journal.ts): Newsreader (Anzeige +
  // Fließtext) und Source Sans 3 (Auszeichnung, Links, Kicker).
  expect(loaded.join(",")).toMatch(/Newsreader/);
  expect(loaded.join(",")).toMatch(/Source Sans 3/);
});

test("Tastatur: Navigation und FAQ erreichbar, Fokus sichtbar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dev/site-preview?system=journal&fixture=full");
  await page.keyboard.press("Tab");
  const outline = await page.evaluate(
    () => getComputedStyle(document.activeElement!).outlineStyle
  );
  expect(outline).not.toBe("none");
});
