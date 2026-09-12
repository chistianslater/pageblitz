import { chromium } from "@playwright/test";
import fs from "node:fs";

const ZIEL = "/tmp/demo-roh";
fs.rmSync(ZIEL, { recursive: true, force: true });

const browser = await chromium.launch();
// Frischer Kontext: kein Login, keine Cookies — so sieht es ein Fremder.
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: ZIEL, size: { width: 1440, height: 900 } },
  locale: "de-DE",
});
const page = await ctx.newPage();
const warte = ms => page.waitForTimeout(ms);

await page.goto("https://pageblitz.de/start", { waitUntil: "networkidle" });
await warte(1200);

const cookies = page.getByRole("button", { name: /Nur notwendige/i });
if (await cookies.count()) { await cookies.first().click(); await warte(600); }

await page.getByText("Mit Google My Business starten").click();
await warte(1000);

// Tippen mit Verzoegerung, damit es im Video nach Mensch aussieht.
await page.getByPlaceholder("Unternehmensname").type("Haar Mode", { delay: 90 });
await warte(300);
await page.getByPlaceholder("Stadt (optional)").type("Coesfeld", { delay: 90 });
await warte(500);
await page.getByRole("button", { name: "Suchen" }).click();

await page.locator("button", { hasText: "Haar Mode" }).first().waitFor({ timeout: 30000 });
await warte(1500);
await page.locator("button", { hasText: "Haar Mode" }).first().click();
await warte(1200);

const start = page.getByRole("button", { name: /Jetzt starten/i });
if (await start.count()) { await start.first().click(); await warte(1500); }

// Branchen-Bestaetigung: eigener Schritt vor der Generierung.
const branche = page.getByRole("button", { name: /Branche bestätigen/i });
try {
  await branche.first().waitFor({ timeout: 20000 });
  await warte(1800);
  await branche.first().click();
} catch { console.log("Hinweis: Branchen-Schritt nicht erschienen."); }

const t0 = Date.now();
const log = m => console.log(`  [${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);

// Reihenfolge ist entscheidend und war in drei Versuchen falsch:
// Erst auf das ERSCHEINEN des Fortschritts warten, dann auf sein Verschwinden.
// Wer sofort auf "nicht mehr da" prueft, bekommt sofort ein true — die Seite
// zeigt den Text zu dem Zeitpunkt naemlich noch gar nicht.
await page
  .waitForFunction(
    () => /Texte entstehen|Website entsteht/i.test(document.body.innerText),
    { timeout: 60000 }
  )
  .then(() => log("Generierung sichtbar"))
  .catch(() => log("Fortschritt nie erschienen"));

await page
  .waitForFunction(
    () => !/Texte entstehen|Website entsteht/i.test(document.body.innerText),
    { timeout: 300000 }
  )
  .then(() => log("Generierung fertig"))
  .catch(() => log("Textphase lief in den Timeout"));

await warte(5000);
await page.screenshot({ path: "/tmp/demo-endzustand.png" });

// Schluss: die Designrichtungen durchklicken statt zu scrollen. Das ist der
// eigentliche Moment — dieselbe Seite, drei Handschriften.
for (const richtung of ["Lichtlabor", "Patina", "Salon Noir"]) {
  const karte = page.getByText(richtung, { exact: true }).first();
  if (await karte.count()) {
    await karte.click().catch(() => {});
    await warte(2200);
  }
}
await warte(1500);

await ctx.close();
await browser.close();
const datei = fs.readdirSync(ZIEL).find(f => f.endsWith(".webm"));
console.log("Rohvideo:", `${ZIEL}/${datei}`);
