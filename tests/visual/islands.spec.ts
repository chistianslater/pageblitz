import { expect, test, type Page } from "@playwright/test";

/**
 * Playwright-Voraussetzung: `npm run build:islands` muss VOR diesem Lauf
 * ausgeführt worden sein — `dist/public/islands/site-islands.js` wird von
 * `playwright.config.ts` (webServer.command) automatisch vorab gebaut, aber
 * bei einem manuellen `npx playwright test` gegen einen bereits laufenden
 * Server (reuseExistingServer) fehlt der Schritt sonst und die Inseln
 * bleiben unhydratisiert (Buttons ohne `onClick`, `data-island` verschiebt
 * sich nicht nach `#kontakt`).
 */

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobil: { width: 320, height: 900 },
} as const;

/**
 * Wartet, bis die Kontaktformular-Insel nach der Hydration tatsächlich in
 * die Kontakt-Sektion verschoben wurde (`client/src/site-islands/main.tsx`
 * `hydrateContactIslands`) — vorher steht sie noch außerhalb von `#kontakt`
 * im statischen SSR-Markup (`SiteIslands.tsx`), ein reines `networkidle` ist
 * kein verlässliches Signal für den Hydration-Zeitpunkt.
 */
async function waitForContactIslandMounted(page: Page): Promise<void> {
  await expect(page.locator("#kontakt [data-island='contact']")).toBeVisible();
}

test.describe("Kundenseiten-Inseln (Kontaktformular, KI-Chat, Terminbuchung)", () => {
  for (const [name, vp] of Object.entries(VIEWPORTS)) {
    test(`Dev-Preview mit Features ${name}`, async ({ page }) => {
      await page.setViewportSize(vp);
      // Reveal-Script (siteEnhancer.ts) über reduced-motion deterministisch
      // aus — sonst blieben Sektionen unterhalb des Folds im fullPage-
      // Screenshot unsichtbar.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/dev/site-preview?pack=werkbank&fixture=features");
      await page.waitForLoadState("networkidle");
      await waitForContactIslandMounted(page);
      await expect(page.getByRole("button", { name: "Chat" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Termin" })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(
        `islands-werkbank-features-${name}.png`,
        { fullPage: true, animations: "disabled" }
      );
    });
  }

  test("FAB „Termin“ öffnet Dialog mit Freischaltungs-Hinweis (Demo-Slug ohne echte Website)", async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/dev/site-preview?pack=werkbank&fixture=features");
    await page.waitForLoadState("networkidle");
    await waitForContactIslandMounted(page);

    await page.getByRole("button", { name: "Termin" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // Demo-Slug „demo“ hat keine echte Website in der DB → die Terminbuchung
    // liefert 404 auf /api/booking/demo/settings → BOOKING_ERROR_LOCKED
    // (bookingHelpers.ts). Erwartetes Verhalten, kein Fehler im Test.
    await expect(dialog).toContainText(/nach der Freischaltung/);
    await page.evaluate(() => document.fonts.ready);
    await expect(dialog).toHaveScreenshot(
      "islands-werkbank-features-termin-dialog.png"
    );
  });

  test("Kontaktformular ausfüllen + absenden (echte Website via Studio-Seed)", async ({
    page,
    request,
  }) => {
    // Der Demo-Slug „demo“ (dev/site-preview) hat keine echte Website in der
    // DB — ein Submit dort würde immer den generischen Fehler zeigen. Für
    // den Erfolgsfall seeden wir eine echte Website (fixture=features) und
    // nutzen die Studio-Live-Preview (/preview-ssr/:token), deren Slug
    // tatsächlich existiert (server/onboardingV2/devSeed.ts).
    const seed = await request.get(
      "/dev/studio-seed?pack=werkbank&fixture=features&json=1"
    );
    const { token } = (await seed.json()) as { token: string };
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto(`/preview-ssr/${token}`);
    await page.waitForLoadState("networkidle");
    await waitForContactIslandMounted(page);

    const form = page.locator("#kontakt [data-island='contact'] form");
    await form.getByLabel("Name").fill("Erika Musterfrau");
    await form.getByLabel("E-Mail").fill("erika@example.com");
    await form.getByLabel("Nachricht").fill("Ich hätte gern ein Angebot.");
    // Finding F2: /api/site/:slug/contact hat ein globales IP-Rate-Limit
    // (5 Einreichungen/h, siehe server/contactSubmit.ts) — bei wiederholten
    // Läufen in kurzer Zeit (lokal oder CI, jeweils dieselbe IP) kann dieses
    // Limit greifen, ohne dass am Feature selbst etwas kaputt ist. Statt
    // dann mit einem irreführenden Fehlschlag zu enden, wird der Test bei
    // 429 übersprungen.
    const [response] = await Promise.all([
      page.waitForResponse(
        res =>
          res.url().includes("/contact") && res.request().method() === "POST"
      ),
      form.getByRole("button", { name: "Nachricht senden" }).click(),
    ]);
    if (response.status() === 429) {
      test.skip(true, "IP-Limit erreicht");
    }
    await expect(
      page.getByText("Danke — wir melden uns zeitnah.")
    ).toBeVisible();
  });
});
