import { chromium } from "@playwright/test";
const tokens = ["HTZLyCxq59IJhxcvyoq8dzhDoB31ffzy","c7lXkJpxJBMl6MBQyEhZWHV6bf-Ejo0y","rsAAkT_wZZEZpxC40X5VYFvUUyJ1lYy_","DQcA_O6sHzErMuLxsN9kPutWDegjFs2Y","1tSJIE5gnC3q-7bChWSYxsUh17YJZHn0","KnGt3nkNGnj1QKQ-Rup5BoVBnCxE_i0P","EDOZ8ghEvPCf5HxBMKldHm2gLTVH46j-","w9HVHgYbNYLR7VczTzM_Cl-eLEh9m5d0","KYSbZzc9cqEvFzRxJrzgJf7JedMSqVfS","OUJvn4qc6wuBhxy1qnsPSYZ4uiFdIwj-"];
const vorher = {HTZLy:610, c7lXk:539, rsAAk:545, DQcA_:610, "1tSJI":539, KnGt3:545, EDOZ8:539, w9HVH:539, KYSbZ:545, OUJvn:610};
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
let sV = 0, sN = 0;
for (const t of tokens) {
  await page.goto(`https://pageblitz.de/preview-ssr/${t}`, { waitUntil: "networkidle", timeout: 60000 });
  const r = await page.evaluate(() => {
    const s = document.querySelector("#kontakt");
    if (!s) return null;
    const zeilen = s.querySelectorAll("tr, li");
    return { h: Math.round(s.getBoundingClientRect().height), zeilen: zeilen.length,
      text: (s.innerText || "").replace(/\s+/g, " ").slice(0, 90) };
  });
  const k = t.slice(0, 5);
  console.log(k, "vorher", String(vorher[k] ?? "?").padStart(4), "→ nachher", String(r.h).padStart(4), "| Zeilen", r.zeilen, "|", r.text.slice(0, 60));
  sV += vorher[k] ?? 0; sN += r.h;
}
console.log("Summe vorher", sV, "→ nachher", sN, "| Ersparnis", Math.round((1 - sN / sV) * 100) + "%");
await browser.close();
