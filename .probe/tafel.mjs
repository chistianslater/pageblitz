import { chromium } from "@playwright/test";
import fs from "fs";
const rows = JSON.parse(fs.readFileSync("/tmp/tafel.json", "utf8"));
const html = `<style>
body{font:12px/1.4 -apple-system,sans-serif;background:#fafafa;margin:20px;color:#111}
.pack{display:flex;align-items:center;gap:14px;margin-bottom:9px}
.kopf{width:150px;flex:none}
.id{font-weight:600;font-size:13px}
.br{font-size:10px;color:#777;margin-top:2px}
.buehne{display:flex;gap:8px;padding:11px 13px;border-radius:8px;flex:1}
.ton{width:78px}
.punkt{height:40px;border-radius:5px}
.h{font:10px ui-monospace,monospace;margin-top:4px;opacity:.75}
.titel{font-size:16px;font-weight:600;margin:0 0 4px}
.sub{font-size:11px;color:#666;margin-bottom:16px}
</style>
<div class="titel">Akzent-Tafel — 20 Packs, je fünf Töne</div>
<div class="sub">Jeder Ton auf dem echten Grund seines Packs. Ganz links steht der bisherige Original-Akzent.</div>
${rows.map(r => `
<div class="pack">
  <div class="kopf"><div class="id">${r.id}</div><div class="br">${r.branchen}</div></div>
  <div class="buehne" style="background:${r.canvas}">
    ${r.toene.map((t,i) => `<div class="ton">
      <div class="punkt" style="background:${t}${i===0?";outline:2px solid "+r.ink+"33;outline-offset:2px":""}"></div>
      <div class="h" style="color:${r.ink}">${t}</div>
    </div>`).join("")}
  </div>
</div>`).join("")}`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 880, height: 700 } });
await p.setContent(html);
await p.screenshot({ path: "/tmp/tafel.png", fullPage: true });
await b.close();
