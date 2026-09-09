import { chromium } from "@playwright/test";
const [token, dir] = process.argv.slice(2);
const browser = await chromium.launch();
for (const [name, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobil", { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport });
  await page.goto(`https://pageblitz.de/preview-ssr/${token}`, { waitUntil: "load", timeout: 45000 });
  await page.waitForTimeout(2500);
  const r = await page.evaluate(() => {
    const el = document.getElementById("pb-preview-cta");
    if (!el) return { da: false };
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return { da: true, hidden: el.hidden, display: cs.display, hoehe: Math.round(rect.height),
      unterkante: Math.round(window.innerHeight - rect.bottom), zIndex: cs.zIndex,
      sichtbarerPunkt: document.elementFromPoint(window.innerWidth - 90, window.innerHeight - 25)?.id || document.elementFromPoint(window.innerWidth - 90, window.innerHeight - 25)?.tagName };
  });
  console.log(name, JSON.stringify(r));
  await page.screenshot({ path: `${dir}/cta-${name}.png` });
  await page.close();
}
await browser.close();
