import { chromium, devices } from "@playwright/test";
const alt = ["HTZLyCxq59IJhxcvyoq8dzhDoB31ffzy","c7lXkJpxJBMl6MBQyEhZWHV6bf-Ejo0y","rsAAkT_wZZEZpxC40X5VYFvUUyJ1lYy_","DQcA_O6sHzErMuLxsN9kPutWDegjFs2Y","1tSJIE5gnC3q-7bChWSYxsUh17YJZHn0"];
const neu = ["gPsZZ75ZcpYe1ajcMfc00ijric5Ygl7q","RnlW-joo11Q2Frz79cOg4EI18hRxNQ8T","kMNQg2pf6hitCvXE5hSvwrWEXbyxkjE7"];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
async function messen(token) {
  await page.goto(`https://pageblitz.de/preview-ssr/${token}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; document.getElementById("pb-preview-cta")?.remove(); });
  return page.evaluate(() => {
    const zaehl = t => { const s = (t || "").trim(); return s ? s.split(/\s+/).length : 0; };
    const sichtbar = el => { const c = getComputedStyle(el), r = el.getBoundingClientRect(); return c.display !== "none" && r.height > 1; };
    const sek = [...document.querySelectorAll(".pb-site section")].filter(sichtbar);
    const ueber = document.querySelector("#ueber-uns");
    const dienst = document.querySelector("#leistungen");
    const leer = sek.map(s => {
      const r = s.getBoundingClientRect();
      const bl = [...s.querySelectorAll("h1,h2,h3,p,li,a,button,img,figure")].filter(sichtbar);
      if (!bl.length) return 0;
      let o = Infinity, u = -Infinity;
      for (const n of bl) { const q = n.getBoundingClientRect(); o = Math.min(o, q.top); u = Math.max(u, q.bottom); }
      return Math.max(0, 1 - (u - o) / r.height);
    });
    return {
      titel: document.title.slice(0, 26),
      sektionen: sek.length,
      woerter: zaehl(document.querySelector(".pb-site")?.innerText),
      ueberUns: zaehl(ueber?.innerText),
      leistungen: zaehl(dienst?.innerText),
      leer: Math.round((leer.reduce((a, b) => a + b, 0) / (leer.length || 1)) * 100),
    };
  });
}
for (const [name, liste] of [["ALT (vor den Korrekturen)", alt], ["NEU (nach den Korrekturen)", neu]]) {
  console.log("\n" + name);
  const w = [];
  for (const t of liste) { const r = await messen(t); w.push(r);
    console.log(" ", r.titel.padEnd(27), "sek", r.sektionen, "| ges", String(r.woerter).padStart(4), "| über uns", String(r.ueberUns).padStart(3), "| leistungen", String(r.leistungen).padStart(3), "| leer", r.leer + "%"); }
  const m = k => Math.round(w.reduce((a, b) => a + b[k], 0) / w.length);
  console.log("   MITTEL:                    sek", m("sektionen"), "| ges", m("woerter"), "| über uns", m("ueberUns"), "| leistungen", m("leistungen"), "| leer", m("leer") + "%");
}
await browser.close();
