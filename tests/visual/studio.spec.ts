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
  // Wizard-Autostart im Test aus (Studio-UI-Audit, 2026-08-24): Der
  // geführte Modus startet einmal pro Browser-Session automatisch und
  // öffnet das erste offene Panel — die Checklisten-Übersicht, auf die die
  // Panel-Klicks zielen, verschwindet dann. Ob der Klick die Übersicht noch
  // erwischt, war eine Race (flaky, Timeout bei /Rechtliches/ u. a.). Das
  // dismissed-Flag wird gesetzt, sobald die Token-URL feststeht
  // (addInitScript läuft vor dem ersten App-Script im Dokument).
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const m = window.location.pathname.match(/\/onboarding\/([^/]+)/);
      if (m) window.sessionStorage.setItem(`pb-wizard-dismissed:${m[1]}`, "1");
    });
    // Reveal-Script (siteEnhancer.ts) in den Vorschau-/Thumbnail-iframes
    // deterministisch aus — sonst hängt die Sichtbarkeit der Sektionen vom
    // IntersectionObserver-Timing ab (flaky Rail-Screenshots).
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

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
    await page
      .getByRole("button", { name: /Designrichtung/ })
      .first()
      .click();
    await expect(
      page.getByRole("group", { name: "Designrichtungen" })
    ).toBeVisible();
    await page.waitForLoadState("networkidle");
    await waitForStyleThumbnails(page);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".pb-studio-rail")).toHaveScreenshot(
      "studio-style-panel-desktop.png",
      { animations: "disabled" }
    );
  });

  test("Initialer Design-Gate: Richtung + Feinschliff bestätigen → Studio startet bei Fotos", async ({
    page,
    request,
  }) => {
    await skipCookieBanner(page);
    const seed = await request.get(
      "/dev/studio-seed?pack=werkbank&fixture=full&designGate=1&json=1"
    );
    const { token } = (await seed.json()) as { token: string };
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/onboarding/${token}`);
    // Globaler Test-beforeEach deaktiviert den Wizard für Screenshot-
    // Determinismus; dieser Flow-Test braucht bewusst den echten Erststart.
    await page.evaluate(
      key => sessionStorage.removeItem(key),
      `pb-wizard-dismissed:${token}`
    );

    await expect(
      page.getByRole("heading", { name: /Gefällt dir das Design/ })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /als Designrichtung verwenden/ })
    ).toHaveCount(2);
    await expect(page.getByText("Akzentfarbe", { exact: true })).toBeVisible();
    await expect(page.getByText("Schriften", { exact: true })).toBeVisible();
    await expect(page.getByText("Seitenaufbau", { exact: true })).toHaveCount(
      0
    );

    await Promise.all([
      page.waitForResponse(
        res =>
          res.url().includes("onboardingV2.selectStylePack") && res.ok()
      ),
      page.getByRole("button", { name: "Dieses Design verwenden" }).click(),
    ]);

    await expect(
      page.getByRole("heading", { name: /Gefällt dir das Design/ })
    ).toBeHidden();
    await expect(
      page.getByRole("region", { name: "Fotos wählen" })
    ).toBeVisible();
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

  test("KI-Chat Diff: Senden → Vorschlag → Übernehmen", async ({
    page,
    request,
  }) => {
    // PB_LLM_MOCK=1 (siehe playwright.config.ts webServer.command) macht
    // aiEdit ohne echten LLM-Aufruf deterministisch — mockAiEditResponse
    // (server/onboardingV2/aiEdit.ts) hängt der Hero-Headline ein "✓" an
    // und liefert dafür immer einen nicht-leeren Diff zurück, unabhängig
    // vom gesendeten Text.
    await skipCookieBanner(page);
    const seed = await request.get(
      "/dev/studio-seed?pack=werkbank&fixture=full&json=1"
    );
    const { token } = (await seed.json()) as { token: string };
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/onboarding/${token}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Auf den KI-Chat-Bereich scoped, statt einer globalen Rollen-Suche: die
    // Checkliste enthält Buttons mit langem, verkettetem Accessible-Namen
    // (Titel + Hinweistext, siehe Checklist.tsx) und ein `getByRole("button",
    // { name: "Senden" })` ohne Scope trifft dort per Substring-Match einen
    // Checklisten-Eintrag statt (nur) den KI-Chat-Button (strict-mode
    // violation).
    const aiChat = page.locator(".pb-studio-ai");
    await aiChat
      .getByLabel("Was soll anders sein?")
      .fill("Mach die Überschrift knackiger");
    await Promise.all([
      page.waitForResponse(
        res => res.url().includes("onboardingV2.aiEdit") && res.ok()
      ),
      aiChat.getByRole("button", { name: "Senden" }).click(),
    ]);

    const diffList = page.locator(".pb-studio-ai-diff");
    await expect(diffList).toBeVisible();

    await Promise.all([
      page.waitForResponse(
        res => res.url().includes("onboardingV2.applyAiEdit") && res.ok()
      ),
      aiChat.getByRole("button", { name: "Übernehmen" }).click(),
    ]);

    // Vorschlag ist übernommen: Diff-Karte verschwindet, keine Fehlermeldung
    // hängt vom vorherigen Senden/Übernehmen zurück (Review-Fund
    // Fix-Runde 1, siehe AiChat.tsx `busy`-Kommentar).
    await expect(diffList).toHaveCount(0);
    await expect(page.locator(".pb-studio-ai [role='alert']")).toHaveCount(0);

    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".pb-studio-rail")).toHaveScreenshot(
      "studio-ai-chat-desktop.png",
      { animations: "disabled" }
    );
  });

  test("Mobil: Vorschau-Tab bietet Rückweg zum Bearbeiten (2026-08-25)", async ({
    page,
    request,
  }) => {
    // Regression: Der Tab-Umschalter liegt in der Rail, die im Vorschau-
    // Tab komplett ausgeblendet wird — ohne die mobilebar kam man mobil
    // nicht mehr zu den Einstellungen zurück (Sackgasse).
    await skipCookieBanner(page);
    const seed = await request.get(
      "/dev/studio-seed?pack=werkbank&fixture=full&json=1"
    );
    const { token } = (await seed.json()) as { token: string };
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/onboarding/${token}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // In die Vorschau wechseln → Rail verschwindet, Rückweg erscheint.
    await page.getByRole("button", { name: "Vorschau" }).click();
    await expect(page.locator(".pb-studio-rail")).toBeHidden();
    const backButton = page.getByRole("button", { name: "‹ Bearbeiten" });
    await expect(backButton).toBeVisible();

    // Zurück → Rail mit Checkliste wieder da.
    await backButton.click();
    await expect(page.locator(".pb-studio-rail")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Designrichtung/ }).first()
    ).toBeVisible();
  });

  test("Texte: KI-Vorschlag liefert Chips und übernimmt ins Feld", async ({
    page,
    request,
  }) => {
    // PB_LLM_MOCK=1 (webServer.command) deckt seit 2026-08-25 auch
    // suggestTexts ab — deterministische Mock-Varianten statt echtem LLM.
    await skipCookieBanner(page);
    const seed = await request.get(
      "/dev/studio-seed?pack=werkbank&fixture=full&json=1"
    );
    const { token } = (await seed.json()) as { token: string };
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/onboarding/${token}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.getByRole("button", { name: /Texte/ }).first().click();
    const textsPanel = page.getByRole("region", { name: "Texte prüfen" });
    await expect(textsPanel).toBeVisible();

    // Erster „KI-Vorschlag"-Button gehört zur Überschrift (Feldreihenfolge
    // in textsParts.tsx FIELDS).
    await textsPanel
      .getByRole("button", { name: "KI-Vorschlag" })
      .first()
      .click();
    const chips = textsPanel.getByRole("group", {
      name: "Vorschläge für Überschrift",
    });
    await expect(chips.getByRole("button")).toHaveCount(3);

    await Promise.all([
      page.waitForResponse(
        res =>
          res.url().includes("onboardingV2.updateTexts") && res.ok()
      ),
      chips.getByRole("button").first().click(),
    ]);
    await expect(textsPanel.locator("#pb-texts-headline")).toHaveValue(
      "Mock-Vorschlag A für headline"
    );
    await expect(
      page.frameLocator(".pb-studio-device iframe").locator("#start h1")
    ).toContainText("Mock-Vorschlag A für headline");
  });

  test("Texte direkt in der Vorschau bearbeiten → Blur speichert und lädt Preview neu", async ({
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

    const preview = page.frameLocator(".pb-studio-device iframe");
    const headline = preview.locator("#start h1");
    await expect(headline).toHaveAttribute(
      "title",
      "Klicken und direkt bearbeiten"
    );
    await headline.fill("Direkt in der Vorschau geändert");

    await Promise.all([
      page.waitForResponse(
        res =>
          res.url().includes("onboardingV2.updateInlineText") && res.ok()
      ),
      // Klick außerhalb des iframes löst blur + Persistenz aus.
      page.getByRole("button", { name: "Desktop" }).click(),
    ]);

    // onApplied bumpPreview remountet das iframe; persistierter Text muss im
    // neuen SSR-Dokument wieder erscheinen.
    await expect(
      page
        .frameLocator(".pb-studio-device iframe")
        .locator("#start h1")
    ).toContainText("Direkt in der Vorschau geändert");
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
    // "Schließen" (PanelFrame-Footer, Ghost-Button) bringt uns zurück zur
    // Checkliste. (Hieß bis zum Wizard-Umbau "Fertig".)
    await legalPanel.getByRole("button", { name: "Schließen" }).click();

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

  test("Extras-Panel: Team einschalten → Mitglied anlegen → Übernehmen → Vorschau zeigt Mitglied", async ({
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

    await page
      .getByRole("button", { name: /Extras/ })
      .first()
      .click();
    const addonsPanel = page.getByRole("region", { name: "Extras wählen" });
    await expect(addonsPanel).toBeVisible();

    // Team-Extra einschalten (nur lokaler Entwurf — die eigentliche
    // Freischaltung des Abrechnungs-Flags läuft über den separaten
    // "Speichern"-Button, siehe AddonsPanel.tsx handleSave). Der
    // "Team pflegen"-Unterbereich blendet sich unabhängig davon sofort ein
    // (Finding: value.team steuert die Sichtbarkeit, nicht der persistierte
    // addOns-Stand).
    const teamRow = addonsPanel
      .locator(".pb-studio-addon-list li")
      .filter({ hasText: "Team" });
    await teamRow.getByRole("button", { name: "Hinzufügen" }).click();
    await expect(teamRow.getByRole("button", { name: "Aktiv" })).toBeVisible();

    await expect(
      addonsPanel.getByRole("heading", { name: "Team pflegen", level: 3 })
    ).toBeVisible();

    await addonsPanel
      .getByRole("button", { name: "Mitglied hinzufügen" })
      .click();
    await addonsPanel.getByLabel("Name Mitglied 1").fill("Anna Beispiel");
    await addonsPanel
      .getByLabel("Rolle Mitglied 1 (optional)")
      .fill("Meisterin");

    await Promise.all([
      page.waitForResponse(
        res => res.url().includes("onboardingV2.updateTeam") && res.ok()
      ),
      addonsPanel.getByRole("button", { name: "Übernehmen" }).click(),
    ]);

    const preview = page.frameLocator(
      'iframe[title="Live-Vorschau deiner Website"]'
    );
    await expect(preview.getByText("Anna Beispiel")).toBeVisible({
      timeout: 15000,
    });
  });

  test("Extras-Panel: Unterseiten einschalten → „Leistungen im Detail“ anlegen → Vorlage Leistungen → Übernehmen → Vorschau-Leiste zeigt Seite → iframe enthält Titel", async ({
    page,
    request,
  }) => {
    await skipCookieBanner(page);
    // fixture=minimal statt full: die "full"-Fixture bringt seit Plan B6
    // Task 2 bereits eine Demo-Unterseite mit genau diesem Slug mit
    // (leistungen-im-detail) — hier soll die Seite aber frisch angelegt
    // werden, wie der Plan es für diesen Test beschreibt. Eigener Seed-Slug
    // (studio-seed-werkbank-minimal), kollidiert nicht mit den übrigen Tests.
    const seed = await request.get(
      "/dev/studio-seed?pack=werkbank&fixture=minimal&json=1"
    );
    const { token } = (await seed.json()) as { token: string };
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/onboarding/${token}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Ohne aktives Unterseiten-Extra gibt es keine Vorschau-Leiste (Add-on-Inhalt).
    await expect(
      page.getByRole("group", { name: "Vorschau-Seite" })
    ).toHaveCount(0);

    await page
      .getByRole("button", { name: /Extras/ })
      .first()
      .click();
    const addonsPanel = page.getByRole("region", { name: "Extras wählen" });
    await expect(addonsPanel).toBeVisible();

    const subpagesRow = addonsPanel
      .locator(".pb-studio-addon-list li")
      .filter({ hasText: "Unterseiten" });
    await subpagesRow.getByRole("button", { name: "Hinzufügen" }).click();
    await expect(
      subpagesRow.getByRole("button", { name: "Aktiv" })
    ).toBeVisible();
    await expect(
      addonsPanel.getByRole("heading", {
        name: "Unterseiten pflegen",
        level: 3,
      })
    ).toBeVisible();

    await addonsPanel
      .getByLabel("Titel der neuen Seite")
      .fill("Leistungen im Detail");
    await addonsPanel.getByRole("button", { name: "Seite anlegen" }).click();
    // Slug-Vorschlag aus dem Titel (pagesLogic.slugFromTitle), editierbar.
    await expect(addonsPanel.getByLabel("Pfad Seite 1")).toHaveValue(
      "leistungen-im-detail"
    );

    await addonsPanel
      .getByLabel("Vorlage Seite 1")
      .selectOption("services-detail");
    await addonsPanel
      .getByRole("button", { name: "Sektion hinzufügen" })
      .click();
    // Die Vorlage startet mit einer leeren Leistungs-Zeile — Pflichtfeld
    // (validatePages), sonst bleibt "Übernehmen" gesperrt.
    await addonsPanel
      .getByLabel("Titel Zeile 1 Sektion 2 Seite 1")
      .fill("Erstberatung");

    await Promise.all([
      page.waitForResponse(
        res => res.url().includes("onboardingV2.updatePages") && res.ok()
      ),
      addonsPanel.getByRole("button", { name: "Übernehmen" }).click(),
    ]);

    // updatePages setzt addOnSubpages → Vorschau-Leiste „Startseite | Seite“
    // erscheint über dem iframe (StudioPage.tsx, derivePreviewTabs).
    const pagebar = page.getByRole("group", { name: "Vorschau-Seite" });
    await expect(pagebar).toBeVisible();
    await expect(
      pagebar.getByRole("button", { name: "Startseite" })
    ).toHaveAttribute("aria-pressed", "true");
    await pagebar.getByRole("button", { name: "Leistungen im Detail" }).click();

    const preview = page.frameLocator(
      'iframe[title="Live-Vorschau deiner Website"]'
    );
    await expect(
      preview.getByRole("heading", { level: 1, name: "Leistungen im Detail" })
    ).toBeVisible({ timeout: 15000 });
    await expect(preview.getByText("Erstberatung")).toBeVisible();
  });

  test("Kategorie-Rückfrage: Seed ohne Branche → „Was macht dein Betrieb?“ → Vorschlag wählen → Generierung startet → Studio (Task 5)", async ({
    page,
    request,
  }) => {
    // Der Test enthält eine echte v2-Generierung (mit PB_LLM_MOCK, aber
    // durch PB_V2_PHASE_DELAY_MS künstlich verlangsamt) — das Standard-
    // Timeout von 30 s ist dafür zu knapp bemessen.
    test.slow();
    await skipCookieBanner(page);
    // Eigener Seed-Slug (studio-seed-werkbank-nocategory) mit Website OHNE
    // Dokument und Business ohne Kategorie — der einzige Zustand, in dem die
    // Rückfrage erscheint (state.needsCategory, server/onboardingV2/state.ts).
    const seed = await request.get(
      "/dev/studio-seed?pack=werkbank&needsCategory=1&json=1"
    );
    const { token } = (await seed.json()) as { token: string };
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/onboarding/${token}`);

    // Der Schritt erscheint statt des Generierungs-Screens; ensureGeneration
    // wurde nicht gekickt (useStudioState prüft needsCategory).
    await expect(
      page.getByRole("heading", { level: 1, name: "Was macht dein Betrieb?" })
    ).toBeVisible();
    const input = page.getByRole("combobox", { name: "Branche" });
    const weiter = page.getByRole("button", { name: "Weiter" });
    await expect(weiter).toBeDisabled();

    // Tippen filtert die Vorschlagsliste (shared/gmbCategories.ts); Klick
    // übernimmt den Vorschlag ins Feld. "Schreiner" kommt in der Liste genau
    // einmal vor (wie im StartPage-Test) und ist als Mock-Generierungs-
    // Kategorie im E2E bereits erprobt (startpage-to-studio.spec.ts).
    await input.fill("Schreiner");
    await page.getByRole("option", { name: "Schreiner" }).click();
    await expect(input).toHaveValue("Schreiner");
    await weiter.click();

    // setCategory persistiert die Branche und startet den v2-Job — die
    // Zeitmaschine (Task 4) übernimmt, danach das fertige Studio (mit
    // PB_LLM_MOCK=1 + PB_V2_PHASE_DELAY_MS aus playwright.config.ts).
    await expect(page.getByText("Deine Website entsteht")).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByRole("button", { name: /Designrichtung/ }).first()
    ).toBeVisible({ timeout: 60_000 });
    await expect(
      page.locator('iframe[title="Live-Vorschau deiner Website"]')
    ).toBeVisible();
  });
});
