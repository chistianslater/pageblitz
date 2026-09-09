import { chromium } from "@playwright/test";
const TOKEN = process.argv[2];
const DIR = process.argv[3];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
await page.goto(`http://localhost:3000/onboarding/${TOKEN}`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(4000);
const inner = () => page.locator("iframe").first().contentFrame();
for (const layout of ["split", "centered", "image-first", "collage", "banner"]) {
  await inner().locator('.pb-preview-layout').first().locator(`[data-pb-layout-option="${layout}"]`).dispatchEvent("click");
  await page.waitForTimeout(3500);
  const hero = inner().locator("#start");
  const box = await hero.boundingBox().catch(() => null);
  const info = await hero.evaluate(el => {
    const img = el.querySelector("img");
    const h1 = el.querySelector("h1");
    const r = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    return { attr: el.closest(".pb-site")?.getAttribute("data-pb-hero"), hero: r(el), img: r(img), h1: r(h1), h1Size: h1 ? getComputedStyle(h1).fontSize : null, imgCount: el.querySelectorAll("img").length };
  });
  console.log(layout, JSON.stringify(info));
  await hero.screenshot({ path: `${DIR}/hero-${layout}.png` }).catch(e => console.log("shot fail", layout, e.message.slice(0,60)));
}
await browser.close();
