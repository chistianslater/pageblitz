import { chromium, devices } from "@playwright/test";
import fs from "fs";

const CSV = process.argv[2];
const DIR = process.argv[3];
const rows = fs.readFileSync(CSV, "utf8").trim().split("\n").slice(1)
  .map(l => l.split(";"))
  .map(f => ({ name: f[0], url: f[6] }));

const browser = await chromium.launch();
for (const [i, r] of rows.entries()) {
  const token = r.url.split("/").pop();
  const ctx = await browser.newContext({ ...devices["iPhone 14"] });
  const page = await ctx.newPage();
  const fehler = [];
  page.on("console", m => { if (m.type() === "error") fehler.push(m.text().slice(0, 120)); });
  const res = await page.goto(`https://pageblitz.de/preview-ssr/${token}`, { waitUntil: "load", timeout: 45000 }).catch(e => ({ status: () => "ERR " + e.message.slice(0, 60) }));
  await page.waitForTimeout(2500);
  const d = await page.evaluate(() => {
    const de = document.documentElement;
    const text = document.body.innerText;
    const imgs = Array.from(document.images);
    return {
      hoehe: de.scrollHeight,
      ueberstand: de.scrollWidth - de.clientWidth,
      sektionen: document.querySelectorAll(".pb-site section").length,
      h1: (document.querySelector("h1")?.innerText ?? "").slice(0, 60),
      bilderKaputt: imgs.filter(x => x.complete && x.naturalWidth === 0).length,
      bilder: imgs.length,
      platzhalter: /undefined|\[object|null|Lorem|TODO|\{\{/.test(text),
      leer: text.trim().length < 200,
      textLen: text.trim().length,
    };
  }).catch(e => ({ fehler: e.message.slice(0, 80) }));
  console.log(`${String(i + 1).padStart(2)}. ${r.name.padEnd(30)} ${res.status()} ${JSON.stringify(d)}${fehler.length ? " KONSOLE:" + fehler.length : ""}`);
  await page.screenshot({ path: `${DIR}/seite-${i + 1}.png` });
  await ctx.close();
}
await browser.close();
