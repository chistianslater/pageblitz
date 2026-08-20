/**
 * Erzeugt client/public/og-image.jpg (1200×630).
 *
 * Hintergrund: client/index.html verweist an drei Stellen auf
 * https://pageblitz.de/og-image.jpg – die Datei gab es aber nie. Der
 * SPA-Catch-All lieferte stattdessen index.html mit Status 200 und
 * Content-Type text/html aus. Jeder Link, der auf WhatsApp, LinkedIn,
 * Facebook oder Slack geteilt wurde, blieb deshalb ohne Vorschaubild.
 *
 * Ausführen nach Änderungen am Text:
 *   npx tsx scripts/generate-og-image.ts
 * Das Ergebnis wird eingecheckt – zur Laufzeit wird hier nichts generiert.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;
const OUT = path.resolve(import.meta.dirname, "..", "client", "public", "og-image.jpg");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="100%" stop-color="#18181b"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.18" r="0.55">
      <stop offset="0%" stop-color="#a3e635" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#a3e635" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#bef264"/>
      <stop offset="100%" stop-color="#facc15"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>

  <!-- Wortmarke -->
  <g transform="translate(80, 74)">
    <rect width="44" height="44" rx="13" fill="#ffffff"/>
    <path d="M25 9 L14 25 h8 l-3 12 11-16 h-8 z" fill="#0a0a0a"/>
    <text x="60" y="31" font-family="Plus Jakarta Sans, Inter, Helvetica, Arial, sans-serif"
          font-size="27" font-weight="700" fill="#ffffff" letter-spacing="-0.5">Pageblitz</text>
  </g>

  <!-- Headline -->
  <text x="80" y="284" font-family="Plus Jakarta Sans, Inter, Helvetica, Arial, sans-serif"
        font-size="70" font-weight="600" fill="#ffffff" letter-spacing="-2.4">Deine professionelle</text>
  <text x="80" y="366" font-family="Plus Jakarta Sans, Inter, Helvetica, Arial, sans-serif"
        font-size="70" font-weight="600" fill="url(#accent)" letter-spacing="-2.4">Website in 3 Minuten.</text>

  <!-- Subline -->
  <text x="80" y="432" font-family="Inter, Helvetica, Arial, sans-serif"
        font-size="27" font-weight="400" fill="#a1a1aa">Von der KI erstellt. Kein Webdesigner, kein Warten.</text>

  <!-- Fusszeile -->
  <g transform="translate(80, 508)">
    <rect width="243" height="54" rx="27" fill="#ffffff"/>
    <text x="121" y="34" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif"
          font-size="20" font-weight="600" fill="#0a0a0a">7 Tage gratis testen</text>
    <text x="273" y="34" font-family="Inter, Helvetica, Arial, sans-serif"
          font-size="20" font-weight="400" fill="#71717a">Danach ab 19,90 €/Monat</text>
  </g>

  <rect x="0" y="${HEIGHT - 7}" width="${WIDTH}" height="7" fill="url(#accent)"/>
</svg>`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
await sharp(Buffer.from(svg)).jpeg({ quality: 90, chromaSubsampling: "4:4:4" }).toFile(OUT);

const { size } = fs.statSync(OUT);
console.log(`og-image.jpg geschrieben: ${OUT} (${(size / 1024).toFixed(1)} KB, ${WIDTH}×${HEIGHT})`);
