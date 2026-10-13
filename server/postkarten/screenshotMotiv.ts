/**
 * Vorderseite für das Layout „screenshot" (Welle 2, Batch B, 2026-10-13).
 *
 * In der HeyMail-Vorlage B (`HEYMAIL_TEMPLATE_ID_SCREENSHOT`) liegt das
 * personalisierte Bild `{{bildUrl}}` als unterste Ebene über die GANZE
 * Vorderseite samt Beschnitt: DIN lang 210 × 105 mm + 2 mm je Seite =
 * 214 × 109 mm. Schlagzeile, Copy und Eyebrow hat die Vorlage nicht mehr —
 * die stehen jetzt in unserem Bild. Was die Vorlage behält, liegt OBEN auf
 * dem Bild: Preiszeile, QR, Pfeil, „scan mich" und der Kurz-Link (alle in
 * Lime auf dunklem Grund). Unser Bild ist also eine komplette Komposition:
 * schwarzer Grund wie in Welle 1, links Eyebrow und Schlagzeile, rechts der
 * Screenshot der eigenen Seite groß, und die Zonen der Vorlage bleiben frei.
 *
 * Maße in Millimetern ab der linken oberen Ecke des BESCHNITTS (wie im
 * HeyMail-Editor abgelesen, Controller 2026-10-13). Gerendert wird mit
 * 300 dpi → 2528 × 1287 px.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import type { AufnahmeFenster } from "./aufnahme";

export const DPI = 300;
export const PX_JE_MM = DPI / 25.4;

/** DIN lang quer + 2 mm Beschnitt je Seite. */
export const VORDERSEITE_MM = { breite: 214, hoehe: 109 } as const;
export const BESCHNITT_MM = 2;
/** Sicherheitsabstand innerhalb des Endformats. */
export const SICHER_MM = 5;

export const VORDERSEITE_PX = {
  breite: Math.round(VORDERSEITE_MM.breite * PX_JE_MM),
  hoehe: Math.round(VORDERSEITE_MM.hoehe * PX_JE_MM),
} as const;

export interface Feld {
  x: number;
  y: number;
  b: number;
  h: number;
}

/**
 * Was die Vorlage B über unser Bild legt — diese Flächen bleiben frei
 * (Vorgabe Controller, mit etwas Luft aufgerundet).
 */
export const FREIZONEN_MM: Record<string, Feld> = {
  /** Preiszeile, QR, Pfeil, „scan mich". */
  untenLinks: { x: 6, y: 64, b: 106, h: 42 },
  /** Kurz-Link unten rechts. */
  kurzlink: { x: 119, y: 92, b: 93, h: 9 },
};

/** Unsere Elemente. Der Screenshot beginnt rechts der Zone unten links. */
export const LAYOUT_MM = {
  eyebrow: { x: 9, y: 9, b: 98, h: 6 },
  headline: { x: 9, y: 17, b: 98, h: 23 },
  copy: { x: 9, y: 43, b: 92, h: 18 },
  screenshot: { x: 113, y: 8, b: 94, h: 80 },
} as const satisfies Record<string, Feld>;

/** Sicherer Bereich: Endformat minus Sicherheitsabstand. */
export const SICHER_FELD_MM: Feld = {
  x: BESCHNITT_MM + SICHER_MM,
  y: BESCHNITT_MM + SICHER_MM,
  b: VORDERSEITE_MM.breite - 2 * (BESCHNITT_MM + SICHER_MM),
  h: VORDERSEITE_MM.hoehe - 2 * (BESCHNITT_MM + SICHER_MM),
};

export function ueberschneiden(a: Feld, b: Feld): boolean {
  return a.x < b.x + b.b && b.x < a.x + a.b && a.y < b.y + b.h && b.y < a.y + a.h;
}

export function innerhalb(innen: Feld, aussen: Feld): boolean {
  return (
    innen.x >= aussen.x &&
    innen.y >= aussen.y &&
    innen.x + innen.b <= aussen.x + aussen.b &&
    innen.y + innen.h <= aussen.y + aussen.h
  );
}

/**
 * Browserfenster für die Aufnahme der Seite: Seitenverhältnis des
 * Screenshot-Felds, doppelte Dichte. Das Feld ist 94 mm ≈ 1110 px breit;
 * aufgenommen werden 2560 px — beim Verkleinern wird nichts weich.
 */
export function screenshotFenster(): AufnahmeFenster {
  const { b, h } = LAYOUT_MM.screenshot;
  return { breite: 1280, hoehe: Math.round((1280 * h) / b), dichte: 2 };
}

/** Farben wie Welle 1: schwarzer Grund, Lime-Akzent, weiße Schlagzeile. */
export const FARBEN = {
  grund: "#0b0b0b",
  akzent: "#d7ff3a",
  schrift: "#ffffff",
  leise: "rgba(255,255,255,0.72)",
} as const;

export interface VorderseiteText {
  /** „Für <Betrieb> in <Ort>" — dieselbe Kopfzeile wie `betrieb_ort`. */
  eyebrow: string;
  headline: string;
  copy: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const mm = (wert: number) => `${(wert * PX_JE_MM).toFixed(2)}px`;
const feldCss = (f: Feld) =>
  `left:${mm(f.x)};top:${mm(f.y)};width:${mm(f.b)};height:${mm(f.h)};`;

/** Schrift der Karte (JetBrains Mono, liegt im Repo) als Data-URL. */
export function schriftDataUrl(): string | null {
  const datei = path.resolve(
    process.cwd(),
    "client/public/fonts/jetbrains-mono-latin-wght.woff2"
  );
  try {
    return `data:font/woff2;base64,${fs.readFileSync(datei).toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Das HTML der Vorderseite, in Pixeln bei 300 dpi. Rein — gerendert wird
 * es in `vorderseiteRendern` über den Browser der Aufnahme.
 */
export function vorderseiteHtml(opts: {
  text: VorderseiteText;
  /** Screenshot der Seite als Data-URL. */
  screenshot: string;
  schrift?: string | null;
}): string {
  const { eyebrow, headline, copy } = opts.text;
  const L = LAYOUT_MM;
  const fontFace = opts.schrift
    ? `@font-face{font-family:"Karte";src:url("${opts.schrift}") format("woff2");font-weight:100 800;}`
    : "";
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${fontFace}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${VORDERSEITE_PX.breite}px;height:${VORDERSEITE_PX.hoehe}px;background:${FARBEN.grund};overflow:hidden}
body{position:relative;font-family:"Karte","JetBrains Mono",ui-monospace,monospace;-webkit-font-smoothing:antialiased}
.f{position:absolute}
.eyebrow{color:${FARBEN.akzent};font-size:${mm(3.4)};font-weight:500;letter-spacing:0.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.headline{color:${FARBEN.schrift};font-size:${mm(8.6)};font-weight:700;line-height:1.08;letter-spacing:-0.02em}
.copy{color:${FARBEN.leise};font-size:${mm(3.5)};font-weight:400;line-height:1.4}
.shot{border-radius:${mm(2.4)};overflow:hidden;background:#fff;box-shadow:0 0 0 ${mm(0.3)} rgba(255,255,255,0.22),0 ${mm(1.5)} ${mm(5)} rgba(0,0,0,0.6)}
.shot img{display:block;width:100%;height:100%;object-fit:cover;object-position:top center}
</style></head><body>
<div class="f eyebrow" style="${feldCss(L.eyebrow)}">${escapeHtml(eyebrow)}</div>
<div class="f headline" style="${feldCss(L.headline)}">${escapeHtml(headline)}</div>
<div class="f copy" style="${feldCss(L.copy)}">${escapeHtml(copy)}</div>
<div class="f shot" style="${feldCss(L.screenshot)}"><img src="${opts.screenshot}" alt=""></div>
</body></html>`;
}

/** Druckfertiges JPEG mit 300 dpi in den Metadaten. */
export async function alsDruckJpeg(png: Buffer): Promise<Buffer> {
  return sharp(png)
    .resize(VORDERSEITE_PX.breite, VORDERSEITE_PX.hoehe, { fit: "cover" })
    .flatten({ background: FARBEN.grund })
    .withMetadata({ density: DPI })
    .jpeg({ quality: 92 })
    .toBuffer();
}

/**
 * Passt das gespeicherte Motiv zum Layout der Karte? Erkennbar am Namen,
 * den `motivErzeugen` vergibt: `<code>-screenshot.jpg` für das neue
 * Layout, `<code>.png` (Laptop) bzw. `<code>.jpg` für den Standard.
 * (Gilt mit R2; der Rückfallweg ohne R2 würfelt Namen — nur lokal.)
 */
export function motivPasstZumLayout(
  layout: string | null | undefined,
  bildUrl: string | null | undefined
): boolean {
  if (!bildUrl) return false;
  const istScreenshot = /-screenshot\.jpe?g(\?|$)/i.test(bildUrl);
  return layout === "screenshot" ? istScreenshot : !istScreenshot;
}
