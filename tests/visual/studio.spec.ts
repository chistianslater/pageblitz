import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobil", width: 320, height: 900 },
  { name: "tablet", width: 768, height: 1000 },
  { name: "desktop", width: 1440, height: 900 },
];

test.describe("Studio", () => {
  for (const vp of VIEWPORTS) {
    test(`Checkliste + Preview ${vp.name}`, async ({ page, request }) => {
      const seed = await request.get(
        "/dev/studio-seed?pack=werkbank&fixture=full&json=1"
      );
      const { token } = (await seed.json()) as { token: string };
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`/onboarding/${token}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`studio-checklist-${vp.name}.png`, {
        fullPage: true,
      });
    });
  }
  test("Stil-Panel desktop", async ({ page, request }) => {
    const seed = await request.get(
      "/dev/studio-seed?pack=werkbank&fixture=full&json=1"
    );
    const { token } = (await seed.json()) as { token: string };
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/onboarding/${token}`);
    await page.getByRole("button", { name: /Stil/ }).first().click();
    await expect(
      page.getByRole("group", { name: "Stil-Kandidaten" })
    ).toBeVisible();
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".pb-studio-rail")).toHaveScreenshot(
      "studio-style-panel-desktop.png",
      { animations: "disabled" }
    );
  });
});
