import { expect, test, type Page } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobil", width: 320, height: 900 },
  { name: "tablet", width: 768, height: 1000 },
  { name: "desktop", width: 1440, height: 900 },
];

// Konsistent mit client/src/lib/consent.ts (CONSENT_KEY). Ohne gespeicherte
// Einwilligung zeigt PageblitzCookieBanner sich selbst über der App und
// verdeckt Studio/Preview in den Baselines (Finding #8). Ausnahme von der
// "kein localStorage für Onboarding-Zustand"-Regel: hier geht es nur um den
// Consent-Banner der Marketing-Site, nicht um Studio-Zustand, und die Regel
// nennt Test-Consent-Setup ausdrücklich als Ausnahme.
const CONSENT_KEY = "pageblitz_site_consent_v1";

async function skipCookieBanner(page: Page): Promise<void> {
  await page.addInitScript(
    ({ key }) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({ analytics: false, marketing: false, timestamp: Date.now() })
      );
    },
    { key: CONSENT_KEY }
  );
}

/**
 * Wartet, bis alle Stil-Kandidaten-Mini-Previews (iframe, loading="eager")
 * tatsächlich geladen sind. Robuster als ein reines networkidle-Warten bei
 * lazy loading: statt auf Intersection-Observer-Timing zu vertrauen (das im
 * Headless-CI je nach Layout-Timing flackern kann), lädt das Panel die
 * iframes eager und wir warten hier explizit auf deren load-Event bzw. auf
 * bereits fertig geladene Frames (Finding #7).
 */
async function waitForStyleThumbnails(page: Page): Promise<void> {
  await page.locator(".pb-studio-thumb iframe").evaluateAll(frames =>
    Promise.all(
      frames.map(
        frame =>
          new Promise<void>(resolve => {
            const iframe = frame as HTMLIFrameElement;
            const doc = iframe.contentDocument;
            if (doc && doc.readyState === "complete" && doc.body?.children.length > 0) {
              resolve();
            } else {
              iframe.addEventListener("load", () => resolve(), { once: true });
            }
          })
      )
    )
  );
}

test.describe("Studio", () => {
  for (const vp of VIEWPORTS) {
    test(`Checkliste + Preview ${vp.name}`, async ({ page, request }) => {
      await skipCookieBanner(page);
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
    await skipCookieBanner(page);
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
    await waitForStyleThumbnails(page);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".pb-studio-rail")).toHaveScreenshot(
      "studio-style-panel-desktop.png",
      { animations: "disabled" }
    );
  });
});
