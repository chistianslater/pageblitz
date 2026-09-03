/**
 * Marken-Erkennung aus der bestehenden Betriebs-Website (2026-09-03,
 * Übernahme aus vite-deploy-studio „analyze-website", aber ohne LLM):
 * Logo, Markenfarbe und Schriften werden deterministisch aus HTML und
 * eigenen Stylesheets gelesen. Reine Parser ohne I/O — den Abruf mit allen
 * SSRF-/Größen-Schranken macht `crawlSiteBranding` in siteCrawl.ts.
 *
 * Erkenntnis aus dem Altprojekt: rohe Scrape-Farben ergeben chaotische
 * Paletten. Deshalb bleibt nur EINE Markenfarbe übrig — Weiß, Schwarz,
 * Graustufen und Neon werden verworfen.
 */

export interface BrandingSignals {
  logoUrl: string | null;
  accent: string | null;
  fonts: string[];
}

const GENERIC_FONTS = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-sans-serif",
  "ui-serif",
  "ui-monospace",
  "ui-rounded",
  "inherit",
  "initial",
  "unset",
  "arial",
  "helvetica",
  "helvetica neue",
  "times",
  "times new roman",
  "georgia",
  "verdana",
  "tahoma",
  "courier",
  "courier new",
  "segoe ui",
  "roboto",
  "apple-system",
  "-apple-system",
  "blinkmacsystemfont",
  "emoji",
  "math",
]);

const LOGO_HINT = /logo|wortmarke|brandmark|signet/i;
const ALLOWED_LOGO_EXT = /\.(svg|png|jpe?g|webp)(\?|#|$)/i;

/** Absolute URL derselben Herkunft, sonst null (kein Fremd-CDN als Logo). */
function sameOriginUrl(raw: string, origin: string): string | null {
  try {
    const url = new URL(raw, origin);
    if (url.origin !== new URL(origin).origin) return null;
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function attr(tag: string, name: string): string | null {
  const match = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i").exec(
    tag
  );
  return match ? (match[2] ?? match[3] ?? null) : null;
}

/**
 * Logo: erstes Bild in Header/Nav, dessen Quelle, Alt-Text oder Klasse auf
 * ein Logo hindeutet; sonst apple-touch-icon, sonst ein icon-Link.
 * `.ico` wird übersprungen (nicht als Website-Logo brauchbar).
 */
export function pickLogoUrl(html: string, origin: string): string | null {
  const chrome = html.match(/<(header|nav)\b[\s\S]*?<\/\1\s*>/gi);
  for (const block of chrome ?? []) {
    for (const tag of block.match(/<img\b[^>]*>/gi) ?? []) {
      const src = attr(tag, "src") ?? attr(tag, "data-src");
      if (!src || !ALLOWED_LOGO_EXT.test(src)) continue;
      const hint = `${src} ${attr(tag, "alt") ?? ""} ${attr(tag, "class") ?? ""}`;
      if (!LOGO_HINT.test(hint)) continue;
      const resolved = sameOriginUrl(src, origin);
      if (resolved) return resolved;
    }
  }
  for (const rel of ["apple-touch-icon", "icon"]) {
    for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
      const relValue = (attr(tag, "rel") ?? "").toLowerCase();
      if (!relValue.split(/\s+/).includes(rel)) continue;
      const href = attr(tag, "href");
      if (!href || !ALLOWED_LOGO_EXT.test(href)) continue;
      const resolved = sameOriginUrl(href, origin);
      if (resolved) return resolved;
    }
  }
  return null;
}

function expandHex(hex: string): string {
  const value = hex.replace("#", "").toLowerCase();
  if (value.length === 3) {
    return `#${value[0]}${value[0]}${value[1]}${value[1]}${value[2]}${value[2]}`;
  }
  return `#${value.slice(0, 6)}`;
}

/** Alle Farbwerte aus HTML (inkl. theme-color) und CSS, gezählt nach Häufigkeit. */
export function parseColorTokens(
  html: string,
  css: string
): Map<string, number> {
  const counts = new Map<string, number>();
  const add = (hex: string) => {
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  };
  const source = `${html}\n${css}`;
  for (const match of source.matchAll(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g)) {
    add(expandHex(match[0]));
  }
  for (const match of source.matchAll(
    /rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})/g
  )) {
    const hex = [match[1], match[2], match[3]]
      .map(part => Math.min(255, Number(part)).toString(16).padStart(2, "0"))
      .join("");
    add(`#${hex}`);
  }
  return counts;
}

/**
 * Von Build-Werkzeugen erzeugte Familiennamen zurückführen: Next.js
 * schreibt `__Inter_7748ca` bzw. `__Inter_Fallback_7748ca` ins CSS
 * (Befund 2026-09-03 an einer echten Kundenseite). Ohne diese
 * Normalisierung wäre der Name für die Zuordnung auf ein Schriftpaar
 * wertlos; bleibt nichts Lesbares übrig, fällt er weg.
 */
export function normalizeFamilyName(raw: string): string {
  if (!raw.startsWith("__")) return raw;
  const core = raw
    .replace(/^_+/, "")
    .replace(/_Fallback.*$/i, "")
    .replace(/_[0-9a-f]{4,}$/i, "")
    .replace(/_+/g, " ")
    .trim();
  // Reiner Hash (nach dem Abschneiden bleibt nur Hex übrig) ist kein Name.
  if (/^[0-9a-f]{4,}$/i.test(core)) return "";
  return /[A-Za-z]{2}/.test(core) ? core : "";
}

function saturationOf(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

/**
 * Häufigste brauchbare Farbe als Markenfarbe. Verworfen werden Weiß,
 * Schwarz und Graustufen (Sättigung < 0,15) sowie Neon (> 0,95) — genau
 * die Harmonisierung, die im Altprojekt chaotische Paletten verhindert hat.
 */
export function pickAccentColor(tokens: Map<string, number>): string | null {
  let best: { hex: string; count: number } | null = null;
  for (const [hex, count] of tokens) {
    const saturation = saturationOf(hex);
    if (saturation < 0.15 || saturation > 0.95) continue;
    if (!best || count > best.count) best = { hex, count };
  }
  return best?.hex ?? null;
}

/** Bis zu zwei echte Schriftfamilien (häufigste zuerst), ohne Generika. */
export function parseFontFamilies(html: string, css: string): string[] {
  const counts = new Map<string, number>();
  const add = (raw: string) => {
    const family = normalizeFamilyName(
      raw
        .trim()
        .replace(/^["']|["']$/g, "")
        .trim()
    );
    if (!family || GENERIC_FONTS.has(family.toLowerCase())) return;
    if (family.length > 40 || /[{}();]/.test(family)) return;
    counts.set(family, (counts.get(family) ?? 0) + 1);
  };
  const source = `${html}\n${css}`;
  // Zeichenklasse OHNE Ausschluss von Anführungszeichen: sonst bricht die
  // Erfassung bei `font-family:"Playfair Display",…` sofort ab und die
  // charakteristische Schrift der Seite fehlt (Befund 2026-09-03).
  for (const match of source.matchAll(/font-family\s*:\s*([^;}]+)/gi)) {
    for (const part of match[1].split(",")) add(part);
  }
  for (const match of source.matchAll(/family=([^&"'>);]+)/g)) {
    for (const part of match[1].split("&family=")) {
      add(decodeURIComponent(part.split(":")[0]).replace(/\+/g, " "));
    }
  }
  // Überschriften-Schrift zuerst: sie ist die charakteristische Schrift der
  // Marke und wird beim Zuordnen auf ein Schriftpaar als Display gelesen.
  const headingFamilies = new Set<string>();
  for (const rule of source.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    if (!/\bh[1-3]\b/i.test(rule[1])) continue;
    const declaration = /font-family\s*:\s*([^;}]+)/i.exec(rule[2]);
    if (!declaration) continue;
    const first = normalizeFamilyName(
      declaration[1]
        .split(",")[0]
        .trim()
        .replace(/^["']|["']$/g, "")
    );
    if (first && !GENERIC_FONTS.has(first.toLowerCase())) {
      headingFamilies.add(first);
    }
  }
  const rank = (family: string) => (headingFamilies.has(family) ? 1 : 0);
  return [...counts.entries()]
    .sort(
      (a, b) =>
        rank(b[0]) - rank(a[0]) || b[1] - a[1] || a[0].localeCompare(b[0])
    )
    .slice(0, 2)
    .map(([family]) => family);
}

export function extractBrandingSignals(
  html: string,
  origin: string,
  stylesheets: string[]
): BrandingSignals {
  const css = stylesheets.join("\n");
  return {
    logoUrl: pickLogoUrl(html, origin),
    accent: pickAccentColor(parseColorTokens(html, css)),
    fonts: parseFontFamilies(html, css),
  };
}
