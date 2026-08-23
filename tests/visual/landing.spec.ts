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
  // Deterministische Baseline: Die Landingpage nutzt kein framer-motion mehr
  // (B6 Task 8); verbleibende CSS-Transitions/-Animationen werden über die
  // globale `prefers-reduced-motion`-Regel (`.lp *`, client/src/index.css)
  // auf 0,01 ms gekürzt — kein Timing-abhängiges Warten nötig.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await skipCookieBanner(page);

  await page.goto("/");

  // Blendet die sticky Navigation (client/src/components/landing/
  // LandingNav.tsx, `<header className="sticky top-0 ...">`) und — als
  // Absicherung, falls die Einwilligung aus skipCookieBanner() doch nicht
  // greift — das Cookie-Banner (`PageblitzCookieBanner`, `fixed bottom-0 ...`)
  // aus, bevor der Screenshot entsteht: beide liegen über dem Inhalt und
  // würden sonst je nach Scroll-/Render-Timing über die Showcase-Baseline
  // ragen.
  await page.addStyleTag({
    content:
      "header, nav, .fixed.top-0, .fixed.bottom-0 { visibility: hidden !important; }",
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
      .querySelectorAll<HTMLImageElement>(
        '#showcase img[src^="/pack-previews/"]'
      )
      .forEach(img => {
        img.loading = "eager";
      });
  });

  // Alle 14 statischen Pack-Vorschaubilder der Sektion müssen tatsächlich
  // fertig geladen sein, bevor der Screenshot entsteht (auf `#showcase`
  // eingegrenzt: der Hero-Studio-Rahmen zeigt ebenfalls ein
  // `/pack-previews/`-Bild, das hier nicht mitzählt) (complete + naturalWidth >
  // 0 statt nur `complete`, da ein Bild mit 404 ebenfalls "complete" wird,
  // aber naturalWidth 0 behält).
  await page.waitForFunction(
    () => {
      const images = Array.from(
        document.querySelectorAll<HTMLImageElement>(
          '#showcase img[src^="/pack-previews/"]'
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

test("Landingpage: Klick auf den Backdrop schließt das Modal", async ({
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

  // Backdrop ist der äußere fixed inset-0-Container (bg-black/70); das
  // `onMouseDown`-Handling in PackShowcase.tsx schließt nur, wenn
  // `event.target === event.currentTarget` gilt, also der Klick den
  // Backdrop selbst trifft statt (per Bubbling) das Dialog-Panel. (10, 10)
  // liegt bei einer 1280x900-Viewport außerhalb des zentrierten Panels
  // (max-w-5xl, Höhe min(85vh, 720px)) und damit sicher auf dem Backdrop.
  await page.mouse.click(10, 10);
  await expect(dialog).not.toBeVisible();
});

test("Landingpage: Tab-Fokusfalle im Modal springt vom letzten zum ersten fokussierbaren Element (und mit Shift+Tab zurück)", async ({
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

  // FOCUSABLE_SELECTOR in PackShowcase.tsx erfasst Dokumentreihenfolge:
  // Link "In neuem Tab öffnen" (erstes fokussierbares Element) → Button
  // "Vorschau schließen" → iframe (letztes fokussierbares Element).
  const firstFocusable = dialog.getByRole("link", {
    name: "In neuem Tab öffnen",
  });
  const lastFocusable = dialog.locator("iframe");

  // Fokus wird per JS gesetzt und der Tab-Keydown direkt auf `window`
  // dispatcht statt per echtem Tastaturdruck: ein realer Tab-Druck auf ein
  // <iframe>-Element verschiebt die Tastaturfokussierung in dessen eigenen
  // Browsing-Kontext (Inhalt der Demo-Seite) — der `window`-`keydown`-
  // Listener der Fokusfalle im Elterndokument (PackShowcase.tsx) würde den
  // Tastendruck dann gar nicht mehr sehen. Das direkte Dispatchen prüft die
  // Wrap-Logik selbst deterministisch, unabhängig von diesem Cross-Frame-
  // Verhalten.
  await lastFocusable.evaluate(el => (el as HTMLElement).focus());
  await expect(lastFocusable).toBeFocused();

  await page.evaluate(() => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      })
    );
  });
  await expect(firstFocusable).toBeFocused();

  await page.evaluate(() => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      })
    );
  });
  await expect(lastFocusable).toBeFocused();
});
