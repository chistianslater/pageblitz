import { chromium, devices } from "@playwright/test";

const TOKEN = process.argv[2];
const DIR = process.argv[3];
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["iPhone 14"] });
const page = await ctx.newPage();

async function overflow(p, label) {
  const data = await p.evaluate(() => {
    const de = document.documentElement;
    const vw = de.clientWidth;
    const over = [];
    for (const el of Array.from(document.querySelectorAll("body *"))) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > vw + 1) {
        over.push({
          sel: (el.tagName + "." + String(el.className || "").split(" ").filter(Boolean).slice(0, 2).join(".")).slice(0, 70),
          right: Math.round(r.right),
          w: Math.round(r.width),
          pos: getComputedStyle(el).position,
        });
      }
    }
    return { vw, scrollW: de.scrollWidth, bodyScrollW: document.body.scrollWidth, over: over.slice(0, 10) };
  });
  console.log(label, JSON.stringify(data, null, 1));
}

await page.goto(`http://localhost:3000/onboarding/${TOKEN}`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(6000);
await overflow(page, "STUDIO");
await page.screenshot({ path: `${DIR}/m-studio.png` });

const tab = page.getByRole("button", { name: /Vorschau/ });
if (await tab.count()) {
  await tab.first().dispatchEvent("click");
  await page.waitForTimeout(3500);
  await overflow(page, "STUDIO-VORSCHAU-TAB");
  await page.screenshot({ path: `${DIR}/m-preview-tab.png` });
}

const frame = page.frames().find(f => f.url().includes("/preview-ssr/"));
if (frame) {
  await overflow(frame, "IFRAME-INHALT");
  const box = await page.evaluate(() => {
    const f = document.querySelector("iframe");
    if (!f) return null;
    const r = f.getBoundingClientRect();
    const cs = getComputedStyle(f);
    return { w: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right), transform: cs.transform, cssWidth: cs.width, parentW: Math.round(f.parentElement.getBoundingClientRect().width) };
  });
  console.log("IFRAME-BOX", JSON.stringify(box));
} else {
  console.log("IFRAME-INHALT: kein preview-ssr-Frame gefunden", page.frames().map(f => f.url()));
}

await page.goto(`http://localhost:3000/preview-ssr/${TOKEN}`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(3000);
await overflow(page, "SSR-DIREKT");
await page.screenshot({ path: `${DIR}/m-ssr.png` });

await browser.close();
