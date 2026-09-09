import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
const seed = await page.request.get("http://localhost:3000/dev/studio-seed?pack=werkbank&fixture=full&json=1");
const { token } = await seed.json();
await page.goto(`http://localhost:3000/preview-ssr/${token}`, { waitUntil: "domcontentloaded" });
await page.evaluate(async (tok) => {
  await fetch("/api/trpc/onboardingV2.updateTheme?batch=1", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ 0: { json: { token: tok, designProfile: { version: 1, heroLayout: "collage", servicesLayout: "list",
      aboutLayout: "image-right", galleryLayout: "grid", density: "airy", imageTreatment: "natural", seed: 5 } } } }) });
}, token);
await page.goto(`http://localhost:3000/preview-ssr/${token}`, { waitUntil: "load" });
await page.waitForTimeout(2500);
const info = await page.evaluate(() => {
  const wrap = document.querySelector(".pb-hero-extras");
  if (!wrap) return { wrap: null };
  const cs = getComputedStyle(wrap);
  return {
    wrap: wrap.getBoundingClientRect(),
    display: cs.display, opacity: cs.opacity, position: cs.position, zIndex: cs.zIndex,
    imgs: Array.from(wrap.querySelectorAll("img")).map(i => {
      const r = i.getBoundingClientRect();
      return { src: i.getAttribute("src"), w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y), complete: i.complete, natural: i.naturalWidth };
    }),
  };
});
console.log(JSON.stringify(info, null, 1));
await page.locator("#start").screenshot({ path: process.argv[2] + "/collage-hero.png" });
await browser.close();
