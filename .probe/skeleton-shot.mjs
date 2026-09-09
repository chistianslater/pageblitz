import { chromium } from "@playwright/test";
const TOKEN = process.argv[2];
const OUT = process.argv[3] ?? "/tmp/skeleton.png";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
const log = [];
page.on("console", m => { if (m.type() === "error") log.push("console:" + m.text().slice(0, 120)); });
await page.goto(`http://localhost:3000/onboarding/${TOKEN}`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(3000);
// Zone anklicken (im iframe), Typ wählen
const frame = page.frameLocator("iframe").first();
const zones = await page.locator("iframe").first().contentFrame().locator(".pb-preview-insert button").count();
log.push("zonen:" + zones);
await page.locator("iframe").first().contentFrame().locator('.pb-preview-insert[data-pb-after="services"] button').dispatchEvent("click");
await page.waitForTimeout(800);
await page.locator(".pb-insert-choice", { hasText: "Ablauf" }).first().dispatchEvent("click");
await page.waitForTimeout(2500);
const sk = page.locator("iframe").first().contentFrame().locator(".pb-preview-skeleton");
log.push("skelett im DOM:" + (await sk.count()));
if (await sk.count()) {
  log.push("sichtbar:" + (await sk.isVisible()));
  log.push("box:" + JSON.stringify(await sk.boundingBox()));
  await sk.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(600);
}
log.push("hinweis:" + (await page.locator(".pb-studio-pending").count()));
await page.screenshot({ path: OUT, fullPage: false });
console.log(log.join("\n"));
await browser.close();
