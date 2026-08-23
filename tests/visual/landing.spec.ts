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

test("Landingpage: Style-Pack-Showcase zeigt geladene statische Vorschaubilder", async ({
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
  // Zusätzlich alle Vorschaubilder auf eager umstellen: der Lazy-Loading-
  // Schwellenwert des Browsers ist beim schnellen Durchscrollen nicht
  // garantiert für jedes Bild ausgelöst worden — ohne das hing der Test
  // sporadisch im waitForFunction unten (Timeout statt Pixel-Diff).
  await page.evaluate(() => {
    document
      .querySelectorAll<HTMLImageElement>('img[src^="/pack-previews/"]')
      .forEach(img => {
        img.loading = "eager";
      });
  });

  // Alle 14 statischen Pack-Vorschaubilder müssen tatsächlich fertig
  // geladen sein, bevor der Screenshot entsteht (complete + naturalWidth >
  // 0 statt nur `complete`, da ein Bild mit 404 ebenfalls "complete" wird,
  // aber naturalWidth 0 behält).
  await page.waitForFunction(
    () => {
      const images = Array.from(
        document.querySelectorAll<HTMLImageElement>(
          'img[src^="/pack-previews/"]'
        )
      );
      return (
        images.length === 14 &&
        images.every(img => img.complete && img.naturalWidth > 0)
      );
    },
    undefined,
    { timeout: 30_000 }
  );

  await expect(showcase).toHaveScreenshot("pack-showcase.png");
});

test("Landingpage: Klick auf eine Pack-Karte öffnet die Live-Vorschau im Modal mit Fokusfalle", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await skipCookieBanner(page);

  await page.goto("/");

  const showcase = page.locator("#showcase");
  await showcase.scrollIntoViewIfNeeded();

  const firstCard = showcase.locator("article").first();
  await firstCard.getByRole("button", { name: "Ansehen" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  // Das iframe wird erst beim Öffnen des Modals geladen, nicht vorher.
  await expect(dialog.locator("iframe")).toHaveCount(1);

  // Fokus liegt beim Öffnen auf dem Schließen-Button (Anfang der Fokusfalle).
  await expect(
    page.getByRole("button", { name: "Vorschau schließen" })
  ).toBeFocused();

  // Esc schließt das Modal und gibt den Fokus an den Auslöser zurück.
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(
    firstCard.getByRole("button", { name: "Ansehen" })
  ).toBeFocused();
});
