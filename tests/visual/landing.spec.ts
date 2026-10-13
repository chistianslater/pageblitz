import { expect, test, type Page } from "@playwright/test";

// Konsistent mit client/src/lib/consent.ts (CONSENT_KEY) und dem gleichnamigen
// Helfer in studio.spec.ts — ohne gespeicherte Einwilligung legt sich der
// Cookie-Banner über die Landingpage und würde Menü und CTAs verdecken. Ausnahme von der "kein localStorage"-Regel: das ist reiner
// Test-Consent-Setup für die Marketing-Site, nicht Onboarding-/Studio-Zustand.
const CONSENT_KEY = "pageblitz_site_consent_v1";

async function skipCookieBanner(page: Page): Promise<void> {
  await page.addInitScript(
    ({ key }) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          analytics: false,
          marketing: false,
          timestamp: Date.now(),
        })
      );
    },
    { key: CONSENT_KEY }
  );
}

test("Landingpage mobil: Burger-Menü öffnet als viewport-festes Dialog-Portal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await skipCookieBanner(page);
  await page.goto("/");

  await page.getByRole("button", { name: "Menü öffnen" }).click();
  const menu = page.getByRole("dialog", { name: "Navigation" });
  await expect(menu).toBeVisible();
  // Close sitzt im Overlay (nicht im sticky Header) und bekommt den Fokus,
  // ohne dass iOS die Seite zum ersten Link scrollt.
  await expect(
    menu.getByRole("button", { name: "Menü schließen" })
  ).toBeFocused();

  const box = await menu.boundingBox();
  expect(box?.x).toBe(0);
  expect(box?.y).toBe(0);
  expect(box?.width).toBe(390);
  expect(box?.height).toBe(844);

  await menu.getByRole("button", { name: "Menü schließen" }).click();
  await expect(menu).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Menü öffnen" })).toBeFocused();
});

test("Landingpage mobil: Overlay hat horizontales Padding und Abstand zur CTA", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await skipCookieBanner(page);
  await page.goto("/");

  await page.getByRole("button", { name: "Menü öffnen" }).click();
  const menu = page.getByRole("dialog", { name: "Navigation" });
  await expect(menu).toBeVisible();

  const gutters = menu.locator(".lp-mobile-menu-gutter");
  await expect(gutters).toHaveCount(2);

  for (let i = 0; i < 2; i++) {
    const pads = await gutters.nth(i).evaluate(el => {
      const style = getComputedStyle(el);
      return {
        left: parseFloat(style.paddingLeft),
        right: parseFloat(style.paddingRight),
      };
    });
    expect(pads.left, `gutter ${i} padding-left`).toBeGreaterThanOrEqual(24);
    expect(pads.right, `gutter ${i} padding-right`).toBeGreaterThanOrEqual(24);
  }

  const wordmark = await menu
    .getByRole("link", { name: "Pageblitz – Startseite" })
    .boundingBox();
  expect(wordmark?.x).toBeGreaterThanOrEqual(20);

  const firstLink = menu.getByRole("link", { name: "Design" });
  const firstBox = await firstLink.boundingBox();
  expect(firstBox?.x).toBeGreaterThanOrEqual(20);

  const headerBox = await gutters.first().boundingBox();
  expect(firstBox && headerBox).toBeTruthy();
  expect(firstBox!.y - (headerBox!.y + headerBox!.height)).toBeGreaterThanOrEqual(
    20
  );

  const closeBox = await menu
    .getByRole("button", { name: "Menü schließen" })
    .boundingBox();
  expect(closeBox).toBeTruthy();
  expect(closeBox!.x + closeBox!.width).toBeLessThanOrEqual(390 - 16);

  const loginBox = await menu.getByRole("link", { name: "Anmelden" }).boundingBox();
  const ctaBox = await menu
    .getByRole("button", { name: "Website kostenlos erstellen" })
    .boundingBox();
  expect(loginBox && ctaBox).toBeTruthy();
  expect(ctaBox!.y - (loginBox!.y + loginBox!.height)).toBeGreaterThanOrEqual(32);
});

test("Landingpage mobil: Menü schließt nach Scrollen, per Link, Escape und gibt Scroll frei", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await skipCookieBanner(page);
  await page.goto("/");

  // Reproduktion: nach dem Scrollen hebt overflow:hidden am Body
  // position:sticky auf — das Header-X lag dann außerhalb des Viewports.
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.getByRole("button", { name: "Menü öffnen" }).click();
  const menu = page.getByRole("dialog", { name: "Navigation" });
  await expect(menu).toBeVisible();
  await expect(
    menu.getByRole("button", { name: "Menü schließen" })
  ).toBeVisible();

  await menu.getByRole("link", { name: "Preise" }).click();
  await expect(menu).toHaveCount(0);
  await expect(page.locator("#pricing")).toBeInViewport();

  await page.getByRole("button", { name: "Menü öffnen" }).click();
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);

  const bodyLocked = await page.evaluate(
    () => document.body.style.position === "fixed"
  );
  expect(bodyLocked).toBe(false);
  const navOpenClass = await page.evaluate(() =>
    document.documentElement.classList.contains("lp-nav-open")
  );
  expect(navOpenClass).toBe(false);

  await page.getByRole("button", { name: "Menü öffnen" }).click();
  await expect(menu).toBeVisible();
  await menu.getByRole("button", { name: "Menü schließen" }).click();
  await expect(menu).toHaveCount(0);

  // Leere Fläche unter den Links (kein Kind-Target) schließt wie ein Backdrop.
  await page.getByRole("button", { name: "Menü öffnen" }).click();
  await expect(menu).toBeVisible();
  await page.mouse.click(195, 780);
  await expect(menu).toHaveCount(0);
});

test("Landingpage mobil: Sticky-CTA verschwindet vollständig am Schluss-CTA", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await skipCookieBanner(page);
  await page.goto("/");

  const stickyCta = page.locator(".lp-sticky-cta");
  await page.locator("#pricing").scrollIntoViewIfNeeded();
  await expect(stickyCta).toHaveClass(/lp-sticky-cta--on/);
  await expect(stickyCta).toHaveCSS("visibility", "visible");

  await page.locator("#lp-final-heading").scrollIntoViewIfNeeded();
  await expect(stickyCta).not.toHaveClass(/lp-sticky-cta--on/);
  await expect(stickyCta).toHaveCSS("visibility", "hidden");
  await expect(stickyCta).toHaveCSS("pointer-events", "none");
});
