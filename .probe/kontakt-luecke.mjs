import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://pageblitz.de/preview-ssr/c7lXkJpxJBMl6MBQyEhZWHV6bf-Ejo0y", { waitUntil: "networkidle", timeout: 60000 });
await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
const r = await page.evaluate(() => {
  const sek = document.querySelector("#kontakt") || [...document.querySelectorAll("section")].find(s => s.id === "kontakt");
  if (!sek) return { fehler: "keine Kontakt-Sektion" };
  const cs = getComputedStyle(sek);
  const baum = (el, tiefe) => {
    if (tiefe > 3) return [];
    return [...el.children].filter(c => {
      const s = getComputedStyle(c), q = c.getBoundingClientRect();
      return s.display !== "none" && q.height > 0;
    }).map(c => {
      const q = c.getBoundingClientRect(), s = getComputedStyle(c);
      return {
        tag: c.tagName, klasse: String(c.className).slice(0, 34),
        h: Math.round(q.height), display: s.display, gap: s.gap, minH: s.minHeight,
        padY: `${s.paddingTop}/${s.paddingBottom}`, alignItems: s.alignItems,
        kinder: baum(c, tiefe + 1),
      };
    });
  };
  return { sektionH: Math.round(sek.getBoundingClientRect().height), display: cs.display,
    gridRows: cs.gridTemplateRows, gap: cs.gap, minH: cs.minHeight, alignItems: cs.alignItems,
    padY: `${cs.paddingTop}/${cs.paddingBottom}`, kinder: baum(sek, 0) };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
