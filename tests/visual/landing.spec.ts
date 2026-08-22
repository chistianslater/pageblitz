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

  // Blendet die fixe Navbar (client/src/pages/LandingPage.tsx `Navbar`,
  // `<motion.nav className="fixed top-0 ...">`) und — als Absicherung, falls
  // die Einwilligung aus skipCookieBanner() doch nicht greift — das
  // Cookie-Banner (`PageblitzCookieBanner`, `fixed bottom-0 ...`) aus, bevor
  // der Screenshot entsteht: beide sind fixed-positioniert und würden sonst
  // je nach Scroll-/Render-Timing über die Showcase-Baseline ragen.
  await page.addStyleTag({
    content:
      "nav, .fixed.top-0, .fixed.bottom-0 { visibility: hidden !important; }",
  });

  const showcase = page.locator("#showcase");

  // Scrollt durch die GESAMTE Sektion (nicht nur deren Anfang in den
  // Viewport) — mit loading="lazy" auf 14 Karten über mehrere Reihen würde
  // ein reines "Sektion in den Viewport scrollen" nur die erste(n) Reihe(n)
  // zum Laden anstoßen, die unteren Karten blieben ungeladen.
  await showcase.scrollIntoViewIfNeeded();
  await showcase.locator("article").last().scrollIntoViewIfNeeded();
  // Zusätzlich alle Demo-iframes auf eager umstellen: der Lazy-Loading-
  // Schwellenwert des Browsers ist beim schnellen Durchscrollen nicht
  // garantiert für jede Karte ausgelöst worden — ohne das hing der Test
  // sporadisch im waitForFunction unten (Timeout statt Pixel-Diff).
  await page.evaluate(() => {
    document
      .querySelectorAll<HTMLIFrameElement>('iframe[src^="/demo/"]')
      .forEach(frame => {
        frame.loading = "eager";
      });
  });

  // Alle 14 Pack-Demo-iframes müssen tatsächlich fertig geladen sein, bevor
  // der Screenshot entsteht — sonst zeigt die Baseline leere/teilweise
  // geladene Karten je nach Netzwerk-Timing (ein einzelnes waitForResponse
  // auf "irgendein /demo/" reichte nicht: die ersten Karten sind meist
  // deutlich früher fertig als die letzten).
  await page.waitForFunction(
    () => {
      const frames = Array.from(
        document.querySelectorAll<HTMLIFrameElement>('iframe[src^="/demo/"]')
      );
      return (
        frames.length === 14 &&
        frames.every(
          frame =>
            frame.contentDocument?.readyState === "complete" &&
            (frame.contentDocument.body?.children.length ?? 0) > 0
        )
      );
    },
    undefined,
    // 14 SSR-Renderings auf dem tsx-Dev-Server (ohne Cache) brauchen auf
    // langsamen Maschinen deutlich länger als 20 s.
    { timeout: 60_000 }
  );

  await expect(showcase).toHaveScreenshot("pack-showcase.png");
});
