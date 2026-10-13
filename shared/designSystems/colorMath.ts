/**
 * Reine Farbmathematik für Farbwelten & Kontrast-Guard (P10, 2026-08-30).
 *
 * Alles arbeitet auf 6-stelligen Hex-Farben. `mix` entspricht CSS
 * `color-mix(in srgb, …)` (gamma-kodierter Kanal-Lerp), damit in JS
 * berechnete Töne exakt zu bestehenden CSS-Mischungen passen.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): Rgb {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map(ch => ch + ch)
          .join("")
      : value;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** CSS-color-mix-Äquivalent: `mix(a, b, 0.3)` = 30 % a + 70 % b (in srgb). */
export function mix(a: string, b: string, weightA: number): string {
  const wa = Math.max(0, Math.min(1, weightA));
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex({
    r: ca.r * wa + cb.r * (1 - wa),
    g: ca.g * wa + cb.g * (1 - wa),
    b: ca.b * wa + cb.b * (1 - wa),
  });
}

/** WCAG-Relativluminanz (0…1). */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG-Kontrastverhältnis (1…21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export function hexToHsl(hex: string): Hsl {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h, s, l };
}

export function hslToHex({ h, s, l }: Hsl): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  if (s === 0) {
    const v = l * 255;
    return rgbToHex({ r: v, g: v, b: v });
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return rgbToHex({
    r: hue2rgb(p, q, h + 1 / 3) * 255,
    g: hue2rgb(p, q, h) * 255,
    b: hue2rgb(p, q, h - 1 / 3) * 255,
  });
}

/** Sättigung/Helligkeit begrenzen — zähmt „wilde" Kundenfarben für Flächen. */
export function clampChroma(
  hex: string,
  maxS: number,
  minL: number,
  maxL: number
): string {
  const hsl = hexToHsl(hex);
  return hslToHex({
    h: hsl.h,
    s: Math.min(hsl.s, maxS),
    l: Math.max(minL, Math.min(maxL, hsl.l)),
  });
}

/**
 * Schiebt `fg` (Text) in Richtung Schwarz oder Weiß, bis das
 * Kontrastverhältnis zu `bg` erreicht ist. Richtung: von der helleren
 * Fläche weg zu Dunkel, von der dunklen zu Hell. Konvergiert immer
 * (Extrem = Schwarz/Weiß).
 */
export function ensureTextContrast(
  fg: string,
  bg: string,
  minRatio: number
): string {
  if (contrastRatio(fg, bg) >= minRatio) return fg;
  // Richtung nach ERREICHBAREM Kontrast wählen — eine Luminanz-Schwelle
  // schickt mittelhelle Flächen sonst zur falschen Seite (Weiß maxt dort
  // bei ~3:1, Schwarz erreicht 7:1).
  const target =
    contrastRatio("#000000", bg) >= contrastRatio("#ffffff", bg)
      ? "#000000"
      : "#ffffff";
  if (contrastRatio(target, bg) < minRatio) return target;
  let lo = 0;
  let hi = 1;
  // Binäre Suche über den Mischanteil Richtung Ziel (14 Schritte ≈ exakt).
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    if (contrastRatio(mix(target, fg, mid), bg) >= minRatio) hi = mid;
    else lo = mid;
  }
  return mix(target, fg, hi);
}

/** Beste Textfarbe AUF einer Fläche: dunkle Tinte oder Weiß, was stärker kontrastiert. */
export function bestTextOn(bg: string, darkInk = "#111111"): string {
  return contrastRatio(darkInk, bg) >= contrastRatio("#ffffff", bg)
    ? darkInk
    : "#ffffff";
}
