import { test, expect, type Page } from "@playwright/test";

/**
 * Lazy-Bilder (Galerie-Karussell, Über-uns, Leistungsbilder) laden in einem
 * fullPage-Screenshot sonst nicht deterministisch — v. a. die waagrecht
 * gescrollten Karussell-Bilder liegen außerhalb des Viewports. Hier alle
 * Bilder auf eager stellen und auf decode() warten, bevor verglichen wird.
 */
async function settleImages(page: Page): Promise<void> {
  await page.evaluate(async () => {
    // Bilder ohne Quelle (z. B. leere Platzhalter-<img> aus Inseln) melden
    // weder load noch error — die werden übersprungen.
    const imgs = [...document.images].filter(img => img.getAttribute("src"));
    for (const img of imgs) img.loading = "eager";
    await Promise.all(
      imgs.map(img =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>(resolve => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            })
      )
    );
    await Promise.all(imgs.map(img => img.decode().catch(() => undefined)));
  });
}

// Bildvergleich Designsystem Journal (Plan 2026-10-10, Task 17): alle drei
// Farbstimmungen × zwei Inhaltsstände × fünf Breiten. Zusätzlich hart:
// kein waagrechter Überlauf (scrollWidth ≤ innerWidth) auf jeder Breite.
const PALETTES = ["papier", "salbei", "ton"] as const;
const FIXTURES = ["full", "minimal"] as const;
const WIDTHS = [320, 375, 768, 1024, 1440] as const;

for (const palette of PALETTES) {
  for (const fixture of FIXTURES) {
    for (const width of WIDTHS) {
      test(`journal ${palette} ${fixture} ${width}`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.setViewportSize({ width, height: 900 });
        await page.goto(
          `/dev/site-preview?system=journal&palette=${palette}&fixture=${fixture}`
        );
        await page.evaluate(() => document.fonts.ready);
        await settleImages(page);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        );
        expect(overflow).toBeLessThanOrEqual(0);
        await expect(page).toHaveScreenshot(
          `journal-${palette}-${fixture}-${width}.png`,
          { fullPage: true, maxDiffPixelRatio: 0.003 }
        );
      });
    }
  }
}

test("Schriften werden geladen (keine Fallback-Schrift)", async ({ page }) => {
  await page.goto("/dev/site-preview?system=journal&fixture=full");
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() =>
    [...document.fonts].filter(f => f.status === "loaded").map(f => f.family)
  );
  // Journal-Tokens (shared/designSystems/journal.ts): Newsreader (Anzeige +
  // Fließtext) und Source Sans 3 (Auszeichnung, Links, Kicker).
  expect(loaded.join(",")).toMatch(/Newsreader/);
  expect(loaded.join(",")).toMatch(/Source Sans 3/);
});

test("Tastatur: Navigation und FAQ erreichbar, Fokus sichtbar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dev/site-preview?system=journal&fixture=full");
  await page.keyboard.press("Tab");
  const outline = await page.evaluate(
    () => getComputedStyle(document.activeElement!).outlineStyle
  );
  expect(outline).not.toBe("none");
});

// Bildvergleich Designsystem Raster (Plan 2026-10-11, Task R8): drei
// Paletten × zwei Inhaltsstände × fünf Breiten, gleiche Regeln wie Journal
// (kein waagrechter Überlauf). Die Handy-Leiste ist `position: fixed` und
// liegt im ganzseitigen Bild an ihrer Stelle im ersten Bildschirm.
const RASTER_PALETTES = ["papier", "werk", "kohle"] as const;

for (const palette of RASTER_PALETTES) {
  for (const fixture of FIXTURES) {
    for (const width of WIDTHS) {
      test(`raster ${palette} ${fixture} ${width}`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.setViewportSize({ width, height: 900 });
        await page.goto(
          `/dev/site-preview?system=raster&palette=${palette}&fixture=${fixture}`
        );
        await page.evaluate(() => document.fonts.ready);
        await settleImages(page);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        );
        expect(overflow).toBeLessThanOrEqual(0);
        await expect(page).toHaveScreenshot(
          `raster-${palette}-${fixture}-${width}.png`,
          { fullPage: true, maxDiffPixelRatio: 0.003 }
        );
      });
    }
  }
}

test("Raster: Geist wird geladen (keine Fallback-Schrift)", async ({
  page,
}) => {
  await page.goto("/dev/site-preview?system=raster&fixture=full");
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() =>
    [...document.fonts].filter(f => f.status === "loaded").map(f => f.family)
  );
  // Raster-Tokens (shared/designSystems/raster.ts): eine Datei, Geist 100–900.
  expect(loaded.join(",")).toMatch(/Geist/);
  const family = await page.evaluate(
    () => getComputedStyle(document.querySelector("h1")!).fontFamily
  );
  expect(family).toMatch(/^"?Geist/);
});

test("Raster: Tastatur — Fokusring 2 px sichtbar", async ({ page }) => {
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/dev/site-preview?system=raster&fixture=full");
    await page.keyboard.press("Tab");
    const ring = await page.evaluate(() => {
      const s = getComputedStyle(document.activeElement!);
      return { style: s.outlineStyle, width: s.outlineWidth };
    });
    expect(ring.style).not.toBe("none");
    expect(ring.width).toBe("2px");
  }
});

// Bildvergleich Designsystem Werkstoff (Plan 2026-10-11, Task W8): drei
// Paletten × zwei Inhaltsstände × fünf Breiten, gleiche Regeln wie Journal
// und Raster (kein waagrechter Überlauf). Die Handy-Leiste ist
// `position: fixed` und liegt im ganzseitigen Bild im ersten Bildschirm.
const WERKSTOFF_PALETTES = ["kiefer", "leinen", "ton"] as const;

for (const palette of WERKSTOFF_PALETTES) {
  for (const fixture of FIXTURES) {
    for (const width of WIDTHS) {
      test(`werkstoff ${palette} ${fixture} ${width}`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.setViewportSize({ width, height: 900 });
        await page.goto(
          `/dev/site-preview?system=werkstoff&palette=${palette}&fixture=${fixture}`
        );
        await page.evaluate(() => document.fonts.ready);
        await settleImages(page);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        );
        expect(overflow).toBeLessThanOrEqual(0);
        await expect(page).toHaveScreenshot(
          `werkstoff-${palette}-${fixture}-${width}.png`,
          { fullPage: true, maxDiffPixelRatio: 0.003 }
        );
      });
    }
  }
}

test("Werkstoff: Zilla Slab, Karla und DM Mono werden geladen", async ({
  page,
}) => {
  await page.goto("/dev/site-preview?system=werkstoff&fixture=full");
  await page.evaluate(() => document.fonts.ready);
  // DM Mono wird nachgeladen (nicht vorgeladen): auf den Zettel warten.
  await page.evaluate(() => document.fonts.load('500 1rem "DM Mono"'));
  const loaded = await page.evaluate(() =>
    [...document.fonts].filter(f => f.status === "loaded").map(f => f.family)
  );
  const families = loaded.join(",");
  expect(families).toMatch(/Zilla Slab/);
  expect(families).toMatch(/Karla/);
  expect(families).toMatch(/DM Mono/);
  const fonts = await page.evaluate(() => ({
    head: getComputedStyle(document.querySelector(".ws-entry-head, .ws-entry-fit")!)
      .fontFamily,
    body: getComputedStyle(document.body.querySelector(".pb-werkstoff")!)
      .fontFamily,
  }));
  expect(fonts.head).toMatch(/^"?Zilla Slab/);
  expect(fonts.body).toMatch(/^"?Karla/);
});

test("Werkstoff: Tastatur — Fokusring 2 px sichtbar", async ({ page }) => {
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/dev/site-preview?system=werkstoff&fixture=full");
    await page.keyboard.press("Tab");
    const ring = await page.evaluate(() => {
      const s = getComputedStyle(document.activeElement!);
      return { style: s.outlineStyle, width: s.outlineWidth };
    });
    expect(ring.style).not.toBe("none");
    expect(ring.width).toBe("2px");
  }
});

// Fuß-Wortmarke (Abnahme-Befund 504 „Pageblitz Demo-Werkstatt"): lange
// Namen werden nie rechts abgeschnitten — gemessen an den Text-Rechtecken
// der Glyphen, nicht am (überlaufenden) Kasten.
for (const name of [
  "Pageblitz Demo-Werkstatt",
  "Tischlerei und Innenausbau Westerhoff",
  "Donaudampfschifffahrtsgesellschaft",
]) {
  for (const width of [320, 390, 1440]) {
    test(`Werkstoff: Fuß-Wortmarke ohne Abschneiden — ${name} ${width}`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width, height: 900 });
      await page.goto(
        `/dev/site-preview?system=werkstoff&fixture=full&name=${encodeURIComponent(name)}`
      );
      await page.evaluate(() => document.fonts.ready);
      const box = await page.evaluate(() => {
        const word = document.querySelector<HTMLElement>(".ws-foot-word")!;
        const wrap = word.parentElement!.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(word);
        const rects = [...range.getClientRects()];
        return {
          text: word.textContent,
          right: Math.max(...rects.map(r => r.right)),
          left: Math.min(...rects.map(r => r.left)),
          limit: wrap.right,
          start: wrap.left,
          overflow: document.documentElement.scrollWidth - window.innerWidth,
        };
      });
      expect(box.text?.replace(/\s/g, "")).toBe(name.replace(/\s/g, ""));
      expect(box.left).toBeGreaterThanOrEqual(box.start - 1);
      expect(box.right).toBeLessThanOrEqual(box.limit + 1);
      expect(box.overflow).toBeLessThanOrEqual(0);
    });
  }
}

// Bildvergleich Designsystem Plakat (Plan 2026-10-12, Task P8): drei
// Paletten × zwei Inhaltsstände × fünf Breiten, gleiche Regeln wie Journal,
// Raster, Werkstoff (kein waagrechter Überlauf; reduzierte Bewegung = Laufband
// still, keine Startzustände). Das Dock ist `position: fixed` und liegt im
// ganzseitigen Bild im ersten Bildschirm.
const PLAKAT_PALETTES = ["kante", "senf", "puls"] as const;

for (const palette of PLAKAT_PALETTES) {
  for (const fixture of FIXTURES) {
    for (const width of WIDTHS) {
      test(`plakat ${palette} ${fixture} ${width}`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.setViewportSize({ width, height: 900 });
        await page.goto(
          `/dev/site-preview?system=plakat&palette=${palette}&fixture=${fixture}`
        );
        await page.evaluate(() => document.fonts.ready);
        await settleImages(page);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        );
        expect(overflow).toBeLessThanOrEqual(0);
        await expect(page).toHaveScreenshot(
          `plakat-${palette}-${fixture}-${width}.png`,
          { fullPage: true, maxDiffPixelRatio: 0.003 }
        );
      });
    }
  }
}

test("Plakat: League Gothic und Hanken Grotesk werden geladen", async ({
  page,
}) => {
  await page.goto("/dev/site-preview?system=plakat&fixture=full");
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() =>
    [...document.fonts].filter(f => f.status === "loaded").map(f => f.family)
  );
  const families = loaded.join(",");
  expect(families).toMatch(/League Gothic/);
  expect(families).toMatch(/Hanken Grotesk/);
  const fonts = await page.evaluate(() => ({
    display: getComputedStyle(document.querySelector(".pk-display")!)
      .fontFamily,
    body: getComputedStyle(document.body.querySelector(".pb-plakat")!)
      .fontFamily,
  }));
  expect(fonts.display).toMatch(/^"?League Gothic/);
  expect(fonts.body).toMatch(/^"?Hanken Grotesk/);
});

test("Plakat: Tastatur — Fokusring 2 px sichtbar", async ({ page }) => {
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/dev/site-preview?system=plakat&fixture=full");
    await page.keyboard.press("Tab");
    const ring = await page.evaluate(() => {
      const s = getComputedStyle(document.activeElement!);
      return { style: s.outlineStyle, width: s.outlineWidth };
    });
    expect(ring.style).not.toBe("none");
    expect(ring.width).toBe("2px");
  }
});

test("Plakat: Laufband läuft mit Script, Pause-Knopf hält es an", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo/system/plakat/barbier?palette=kante&live=1");
  const toggle = page.locator(".pk-tick-toggle");
  await expect(toggle).toBeVisible();
  const box = await toggle.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  const state = () =>
    page.evaluate(
      () =>
        getComputedStyle(document.querySelector(".pk-tick-track")!)
          .animationPlayState
    );
  expect(await state()).toBe("running");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toHaveAccessibleName("Laufband anhalten");
  expect(await state()).toBe("paused");
  // Reduzierte Bewegung: Band steht, Knopf unsichtbar.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(toggle).toBeHidden();
});
