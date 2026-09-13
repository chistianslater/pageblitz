import { expect, test } from "@playwright/test";

for (const pack of ["salon-noir", "gusto", "werkbank"]) {
  for (const width of [390, 1440]) {
    test(`${pack} ${width}: anchor navigation never restores the faded entrance state`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(`/design-system?frame=1&pack=${pack}`);
      const heading = page.locator(".pb-art-copy h1");
      await expect(heading).toBeVisible();
      // Deliberately let the from-tween finish: the regression happened when
      // focus subsequently advanced completed GSAP start-state helpers.
      await page.waitForTimeout(1500);
      for (let i = 0; i < 2; i++) {
        if (width < 840) await page.locator(".pb-mnav summary").first().click();
        await page.locator('nav a[href="#kontakt"]:visible').first().click();
        await page.waitForTimeout(1300);
        await page.mouse.wheel(0, -10000);
        await page.waitForTimeout(1200);
        await expect(heading).toHaveCSS("opacity", "1");
        await expect(page.locator(".pb-art-media")).toHaveCSS("opacity", "1");
        const stuck = await page
          .locator(".pb-site [style]")
          .evaluateAll(elements =>
            elements
              .filter(el => {
                const style = (el as HTMLElement).style;
                return (
                  style.opacity !== "" &&
                  Number(style.opacity) < 1 &&
                  el.getClientRects().length > 0
                );
              })
              .map(el => el.className)
          );
        expect(stuck).toEqual([]);
        // Native mobile navigation may remain open after following its link.
        await page
          .locator(".pb-mnav")
          .evaluateAll(elements =>
            elements.forEach(el => el.removeAttribute("open"))
          );
      }
    });
  }
}
