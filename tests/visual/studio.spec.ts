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
            if (
              doc &&
              doc.readyState === "complete" &&
              doc.body?.children.length > 0
            ) {
              resolve();
            } else {
              iframe.addEventListener("load", () => resolve(), { once: true });
            }
          })
      )
    )
  );
}

/**
 * Wartet, bis das erste Stockbild im Fotos-Raster entweder geladen ist oder
 * (Netzwerkfehler) sein error-Event gefeuert hat. `.pb-studio-photo` hat ein
 * festes aspect-ratio unabhängig vom Bild-Ladezustand, ein reines
 * "visible"-Warten würde also vor dem Laden greifen und die Baseline
 * zwischen Läufen instabil machen (mal Bild, mal Leerzustand).
 */
async function waitForFirstStockPhoto(page: Page): Promise<void> {
  const first = page.locator(".pb-studio-photo-grid img").first();
  await first.waitFor({ state: "visible" });
  await first.evaluate(
    img =>
      new Promise<void>(resolve => {
        const el = img as HTMLImageElement;
        if (el.complete) {
          resolve();
          return;
        }
        const done = () => resolve();
        el.addEventListener("load", done, { once: true });
        el.addEventListener("error", done, { once: true });
      })
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

  test("Rechtliches-Panel desktop", async ({ page, request }) => {
    await skipCookieBanner(page);
    const seed = await request.get(
      "/dev/studio-seed?pack=werkbank&fixture=full&json=1"
    );
    const { token } = (await seed.json()) as { token: string };
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/onboarding/${token}`);
    await page
      .getByRole("button", { name: /Rechtliches/ })
      .first()
      .click();
    await expect(
      page.getByRole("region", { name: "Rechtliches" })
    ).toBeVisible();
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".pb-studio-rail")).toHaveScreenshot(
      "studio-legal-panel-desktop.png",
      { animations: "disabled" }
    );
  });

  test("Fotos-Panel desktop", async ({ page, request }) => {
    await skipCookieBanner(page);
    const seed = await request.get(
      "/dev/studio-seed?pack=werkbank&fixture=full&json=1"
    );
    const { token } = (await seed.json()) as { token: string };
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/onboarding/${token}`);
    await page.getByRole("button", { name: /Fotos/ }).first().click();
    await expect(
      page.getByRole("region", { name: "Fotos wählen" })
    ).toBeVisible();
    await page.getByRole("button", { name: "Stockbilder" }).click();
    await waitForFirstStockPhoto(page);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".pb-studio-rail")).toHaveScreenshot(
      "studio-photos-panel-desktop.png",
      { animations: "disabled" }
    );
  });

  test("Checkout-Flow: Rechtliches → Checkout-bereit → Reload", async ({
    page,
    request,
  }) => {
    await skipCookieBanner(page);
    const seed = await request.get(
      "/dev/studio-seed?pack=werkbank&fixture=full&json=1"
    );
    const { token } = (await seed.json()) as { token: string };
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/onboarding/${token}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Rechtliches-Panel öffnen und alle Pflichtfelder ausfüllen (Spec §4:
    // nur "legal" ist required, siehe deriveChecklistState/legalComplete).
    await page
      .getByRole("button", { name: /Rechtliches/ })
      .first()
      .click();
    const legalPanel = page.getByRole("region", { name: "Rechtliches" });
    await expect(legalPanel).toBeVisible();

    await legalPanel.getByLabel("Inhaber/Firma").fill("Café Sonnenblick GmbH");
    await legalPanel.getByLabel("Straße und Hausnummer").fill("Hauptstraße 12");
    await legalPanel.getByLabel("PLZ").fill("80331");
    await legalPanel.getByLabel("Ort").fill("München");
    await legalPanel
      .getByLabel("E-Mail (für das Impressum)")
      .fill("kontakt@sonnenblick-cafe.de");
    await legalPanel.getByLabel("Telefon").fill("089 1234567");

    await Promise.all([
      page.waitForResponse(
        res => res.url().includes("onboardingV2.updateLegal") && res.ok()
      ),
      legalPanel.getByRole("button", { name: "Speichern" }).click(),
    ]);

    // LegalPanel schließt sich nicht selbst (onApplied refetcht nur) —
    // "Fertig" bringt uns zurück zur Checkliste (Finding: StudioPage.tsx
    // ruft onClose nur explizit über den Fertig-Button auf).
    await legalPanel.getByRole("button", { name: "Fertig" }).click();

    const legalItem = page.getByRole("button", { name: /Rechtliches/ }).first();
    await expect(legalItem).toHaveAttribute("data-status", "done");
    await expect(legalItem.getByText("Erledigt")).toBeVisible();

    // Die Dev-Seed setzt customerEmail nicht zurück (siehe devSeed.ts) — bei
    // wiederholten Testläufen gegen dieselbe DB kann das E-Mail-Feld daher
    // schon befüllt sein. Test funktioniert in beiden Fällen.
    const checkoutBar = page.locator(".pb-studio-checkout");
    const emailInput = checkoutBar.getByLabel("E-Mail-Adresse");
    if (await emailInput.isVisible()) {
      // Domain example.com statt pageblitz.de (Finding I3): reserviert für
      // Doku/Tests (RFC 2606), damit kein echter Mailversand an eine
      // pageblitz.de-Adresse ausgelöst wird.
      await emailInput.fill("qa-onboarding-v2@example.com");
      await Promise.all([
        page.waitForResponse(
          res => res.url().includes("onboardingV2.setCustomerEmail") && res.ok()
        ),
        checkoutBar.getByRole("button", { name: "Speichern" }).click(),
      ]);
    }

    const checkoutButton = checkoutBar.getByRole("button", {
      name: "Website freischalten",
    });
    await expect(checkoutButton).toBeEnabled();

    // Reload-Garantie (Spec §8.1): Rechtliches-Status und Checkout-Bereitschaft
    // sind serverseitig abgeleitet (deriveChecklistState/isCheckoutReady),
    // nicht in localStorage — müssen also einen Reload überleben.
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const legalItemAfterReload = page
      .getByRole("button", { name: /Rechtliches/ })
      .first();
    await expect(legalItemAfterReload).toHaveAttribute("data-status", "done");
    await expect(legalItemAfterReload.getByText("Erledigt")).toBeVisible();
    await expect(
      page
        .locator(".pb-studio-checkout")
        .getByRole("button", { name: "Website freischalten" })
    ).toBeEnabled();
  });
});
