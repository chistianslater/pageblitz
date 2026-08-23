import { expect, test, type Page } from "@playwright/test";

/**
 * E2E: StartPage (manueller Start) → Studio (Task 3, Cutover).
 *
 * Ab dem Cutover führt der manuelle Start auf der StartPage direkt ins
 * Studio (`navigate(/onboarding/<previewToken>)`) statt in den alten Chat
 * (`/preview/:token/onboarding`). Das Studio startet die v2-Generierung
 * selbst (`ensureGeneration`), sobald kein Dokument vorliegt — dieser Test
 * deckt den kompletten Weg ab: StartPage-Formular → Navigation → sichtbarer
 * Generierungs-Screen → (mit PB_LLM_MOCK=1, siehe playwright.config.ts)
 * fertige Checkliste.
 */

// Konsistent mit client/src/lib/consent.ts (CONSENT_KEY) und
// tests/visual/studio.spec.ts — ohne gespeicherte Einwilligung deckt der
// Cookie-Banner der Marketing-Site die StartPage ab.
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

test.describe("StartPage → Studio", () => {
  test("manueller Start (Name + Branche) navigiert ins Studio und zeigt den Generierungs-Screen", async ({
    page,
  }) => {
    await skipCookieBanner(page);
    await page.goto("/start");

    // Schritt "choice" → "manual"
    await page
      .getByRole("button", { name: /Ohne Google My Business starten/ })
      .click();

    const businessName = `Testbetrieb ${Date.now()}`;
    await page.getByPlaceholder("Unternehmensname").fill(businessName);

    // Branche über die Suche eindeutig treffen (kein Accordion-Aufklappen
    // nötig) — "Schreiner" kommt in shared/gmbCategories.ts genau einmal vor.
    await page
      .getByPlaceholder("Branche suchen oder eintippen…")
      .fill("Schreiner");
    await page.getByRole("button", { name: "Schreiner", exact: true }).click();

    await page.getByRole("button", { name: /Jetzt starten/ }).click();

    // Navigation ins Studio: /onboarding/<previewToken>
    await page.waitForURL(/\/onboarding\/[^/]+$/, { timeout: 15_000 });

    // Zeitmaschine (Plan B7 Task 4), Zwischenassert VOR dem Warten auf den
    // Endzustand: Solange der Job den Zwischenstand noch nicht geschrieben
    // hat, zeigt der Vorschau-Bereich den Pack-Skeleton (schimmernde
    // Platzhalterblöcke). PB_V2_PHASE_DELAY_MS (playwright.config.ts)
    // verlangsamt die Job-Phasen, damit dieser Zustand deterministisch
    // sichtbar ist statt in Millisekunden vorbeizuhuschen.
    await expect(page.locator(".pb-studio-skeleton")).toBeVisible();

    // Generierungs-Screen (GenerationScreen.tsx): Kicker + Business-Name als
    // h1 + laufender Fortschrittsbalken.
    await expect(page.getByText("Deine Website entsteht")).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: businessName })
    ).toBeVisible();
    await expect(page.getByRole("progressbar")).toBeVisible();

    // Sobald der Job den Zwischenstand persistiert hat (nach der Bild-Phase),
    // lädt der Generierungs-Screen die echte Vorschau als iframe mit
    // Sektions-Einblendung (?reveal=1, server/ssr/renderSite.tsx).
    await expect(
      page.locator('iframe[title="Vorschau deiner entstehenden Website"]')
    ).toBeVisible({ timeout: 15_000 });

    // Mit PB_LLM_MOCK=1 (playwright.config.ts) läuft die v2-Generierung ohne
    // echten LLM-Aufruf durch (deterministisches Fixture-Dokument, siehe
    // server/generationV2/generateSiteContent.ts) — die Checkliste erscheint,
    // sobald der Job auf "completed" steht.
    await expect(
      page.getByRole("button", { name: /Stil/ }).first()
    ).toBeVisible({ timeout: 30_000 });

    // Endzustand: das Studio zeigt die fertige Vorschau (PreviewFrame).
    await expect(
      page.locator('iframe[title="Live-Vorschau deiner Website"]')
    ).toBeVisible();
  });
});
