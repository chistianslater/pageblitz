import { expect, test } from "@playwright/test";
const url = "/";
for (const width of [390, 1440])
  test(`Compact build story and manual features at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(url);
    await expect(page.locator(".build-story")).toHaveAttribute(
      "data-progress",
      "100"
    );
    const positions = await page.evaluate(() => {
      const a = document
          .querySelector(".build-chapters")!
          .getBoundingClientRect(),
        b = document.querySelector(".build-stage")!.getBoundingClientRect();
      return {
        left: a.left,
        right: a.right,
        top: a.top,
        stageLeft: b.left,
        stageTop: b.top,
        height: document.querySelector("#ablauf")!.getBoundingClientRect()
          .height,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    expect(positions.overflow).toBe(false);
    if (width > 760) {
      expect(positions.stageLeft).toBeGreaterThan(positions.right);
      expect(Math.abs(positions.stageTop - positions.top)).toBeLessThan(120);
      expect(positions.height).toBeLessThan(730);
    }
    await expect(
      page.locator(".cf-demo-pointer,.cf-motion-toggle,.cf-auto-lightbox")
    ).toHaveCount(0);
    await expect(
      page.locator(".cf-section>.lc-width .cf-copy>.lc-eyebrow")
    ).toHaveCount(8);
    await page
      .locator(".cf-feature-picker button")
      .filter({ hasText: "Terminbuchung" })
      .click();
    await page.getByRole("button", { name: "14:00", exact: true }).click();
    await expect(page.locator(".cf-confirm")).toContainText("14:00");
    await page
      .locator(".cf-feature-picker button")
      .filter({ hasText: "Speisekarte" })
      .click();
    await page.getByRole("button", { name: "Getränke", exact: true }).click();
    await expect(page.locator(".cf-menu")).toContainText("Espresso");
    await page.locator(".cf-feature-picker button").last().click();
    await page
      .getByRole("button", { name: "Unser Studio", exact: true })
      .click();
    await expect(page.locator(".flow-page-stack .is-front")).toContainText(
      "Hier bist du richtig."
    );
    await page.locator(".cf-feature-picker button").first().click();
    await page
      .getByRole("button", { name: "Galeriebild 1 in Großansicht öffnen" })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page
      .getByRole("button", { name: "Nächstes Bild", exact: true })
      .click();
    await expect(page.locator(".cf-lightbox>img")).toHaveAttribute(
      "src",
      "/demo/salon-noir-detail-1.webp"
    );
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page
      .locator(".cf-feature-picker button")
      .filter({ hasText: "Kontaktformular" })
      .click();
    await page.getByLabel("Dein Name", { exact: true }).fill("Test");
    await page
      .getByLabel("Deine E-Mail-Adresse", { exact: true })
      .fill("test@example.com");
    await page.getByLabel("Was hast du vor?", { exact: true }).fill("Demo");
    await page
      .getByRole("button", { name: "Beispiel-Anfrage ausprobieren" })
      .click();
    await expect(page.getByRole("status")).toContainText("nicht versendet");
    if (width > 760) {
      await page
        .locator(".cf-feature-picker button")
        .filter({ hasText: "Speisekarte" })
        .click();
      const x = await page
        .locator("#feature-menu")
        .evaluate(el =>
          [
            el.querySelector(".cf-copy")!,
            el.querySelector(".cf-menu>div")!,
          ].map(n => n.getBoundingClientRect().left)
        );
      expect(Math.abs(x[0] - x[1])).toBeLessThan(1);
    }
  });
test("Reveal advances on animation frames and preserves pause/replay", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(url);
  await page.locator("#ablauf").scrollIntoViewIfNeeded();
  const before = await page
    .locator(".build-window")
    .evaluate(el => el.getBoundingClientRect().height);
  await expect(page.locator(".build-story")).toHaveAttribute("data-step", "1", {
    timeout: 6500,
  });
  expect(
    await page
      .locator(".build-window")
      .evaluate(el => el.getBoundingClientRect().height)
  ).toBe(before);
  const frames = await page.evaluate(
    () =>
      new Promise<number>(resolve => {
        const values = new Set<string>();
        const end = performance.now() + 350;
        function sample() {
          values.add(
            getComputedStyle(document.querySelector(".build-site-image")!)
              .clipPath
          );
          if (performance.now() < end) requestAnimationFrame(sample);
          else resolve(values.size);
        }
        requestAnimationFrame(sample);
      })
  );
  expect(frames).toBeGreaterThan(5);
  await page
    .getByRole("button", { name: "Animation pausieren", exact: true })
    .click();
  const clip = await page
    .locator(".build-site-image")
    .evaluate(el => getComputedStyle(el).clipPath);
  await page.waitForTimeout(200);
  expect(
    await page
      .locator(".build-site-image")
      .evaluate(el => getComputedStyle(el).clipPath)
  ).toBe(clip);
  await page.getByRole("button", { name: "Fortsetzen", exact: true }).click();
  await expect(page.locator(".build-story")).toHaveAttribute(
    "data-progress",
    "100",
    { timeout: 10000 }
  );
  await page.getByRole("button", { name: "Noch einmal ansehen" }).click();
  await expect(page.locator(".build-story")).toHaveAttribute("data-step", "0");
});

test("Booking demonstration stops after personal selection", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(url);
  await page
    .locator(".cf-feature-picker button")
    .filter({ hasText: "Terminbuchung" })
    .click();
  await page.locator(".cf-book").scrollIntoViewIfNeeded();
  await expect(page.locator(".cf-days button").nth(3)).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await page.locator(".cf-days button").first().click();
  await page.getByRole("button", { name: "14:00", exact: true }).click();
  await page.waitForTimeout(2200);
  await expect(page.locator(".cf-days button").first()).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(
    page.getByRole("button", { name: "14:00", exact: true })
  ).toHaveAttribute("aria-pressed", "true");
});

test("Build loops and editing/chat examples complete", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(url);
  await page.locator("#ablauf").scrollIntoViewIfNeeded();
  await expect(page.locator(".build-story")).toHaveAttribute(
    "data-progress",
    "100",
    { timeout: 12000 }
  );
  await expect(page.locator(".build-google-hit")).toBeVisible();
  await expect(page.locator(".build-story")).toHaveAttribute("data-step", "0", {
    timeout: 4500,
  });
  await page.locator(".clear-edit-demo").scrollIntoViewIfNeeded();
  await expect(page.getByLabel("Öffnungszeiten", { exact: true })).toHaveValue(
    "Mo–Fr · 09:00–18:00",
    { timeout: 6500 }
  );
  await page
    .getByLabel("Öffnungszeiten", { exact: true })
    .fill("Samstag 10–14 Uhr");
  await expect(page.getByLabel("Öffnungszeiten", { exact: true })).toHaveValue(
    "Samstag 10–14 Uhr"
  );
  await page
    .locator(".cf-feature-picker button")
    .filter({ hasText: "KI-Chat" })
    .click();
  await page.locator(".cf-chat").scrollIntoViewIfNeeded();
  await expect(page.locator(".cf-chat .cf-answer")).toContainText(
    "passende Uhrzeit",
    { timeout: 6500 }
  );
});
