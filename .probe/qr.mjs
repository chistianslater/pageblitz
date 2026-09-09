import { chromium } from "@playwright/test";
const [url, out] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 700, height: 700 } });
await page.setContent(`<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<style>html,body{margin:0}#q{width:600px;height:600px;background:#fff;padding:0}</style><div id="q"></div>`);
await page.waitForFunction(() => typeof window.QRCode === "function");
await page.evaluate(u => new window.QRCode(document.getElementById("q"), { text: u, width: 600, height: 600, colorDark: "#0b0b0d", colorLight: "#ffffff", correctLevel: window.QRCode.CorrectLevel.M }), url);
await page.waitForTimeout(400);
await page.locator("#q").screenshot({ path: out });
await browser.close();
