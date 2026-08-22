import { expect, test, type Page } from "@playwright/test";

// Konsistent mit client/src/lib/consent.ts (CONSENT_KEY) und dem gleichnamigen
// Helfer in studio.spec.ts — ohne gespeicherte Einwilligung legt sich der
// Cookie-Banner über die Landingpage und würde die Showcase-Baseline
// verdecken. Ausnahme von der "kein localStorage"-Regel: das ist reiner
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

test("Landingpage: Style-Pack-Showcase zeigt geladene Demo-iframes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  // Deterministische Baseline: PackShowcase überspringt die framer-motion
  // Fade-in-Animation der Karten komplett, wenn reduced motion aktiv ist
  // (siehe PackShowcase.tsx `animate`) — kein Timing-abhängiges Warten nötig.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await skipCookieBanner(page);

  await page.goto("/");

  const showcase = page.locator("#showcase");

  // Mindestens ein Pack-Demo-iframe (loading="lazy") muss tatsächlich geladen
  // haben, bevor der Screenshot entsteht — sonst zeigt die Baseline leere/
  // teilweise geladene Karten je nach Netzwerk-Timing. Der Waiter muss VOR
  // dem Scroll registriert werden (Promise.all), sonst kann die Antwort
  // bereits durch sein, bevor wir zu horchen beginnen (Race, siehe
  // studio.spec.ts für dasselbe Muster).
  await Promise.all([
    page.waitForResponse(res => res.url().includes("/demo/") && res.ok()),
    showcase.scrollIntoViewIfNeeded(),
  ]);

  await expect(showcase).toHaveScreenshot("pack-showcase.png");
});
