import fs from "node:fs";
import path from "node:path";

/**
 * Ungehashter Fallback-Dateiname — greift, wenn kein Manifest existiert
 * (Tests, Dev-Server ohne vorherigen `npm run build:islands`) oder das
 * Manifest kaputt/leer ist. `scripts/build-islands.mjs` schreibt normalerweise
 * `site-islands.<contenthash8>.js` + `manifest.json` daneben (Finding M1).
 */
const DEFAULT_BUNDLE_FILE = "site-islands.js";

/** Spiegelt den dev/prod-Pfadaufbau aus server/_core/index.ts (Static-Mount) und server/_core/static.ts. */
function resolveIslandsDir(): string {
  return process.env.NODE_ENV === "development"
    ? path.resolve(import.meta.dirname, "..", "..", "dist", "public", "islands")
    : path.resolve(import.meta.dirname, "public", "islands");
}

// Prozessweiter Cache: das Manifest ändert sich nur bei einem neuen
// Build/Deploy (= neuer Prozess), ein wiederholtes fs.readFileSync pro
// Request lohnt sich nicht.
let cachedFileName: string | null = null;

/**
 * Liefert den `/islands/...`-Pfad des Inseln-Bundles für den `<script src>`-
 * Tag in `renderSiteHtml`. Liest `manifest.json` einmal pro Prozess; ohne
 * lesbares/valides Manifest fällt der Pfad auf den ungehashten Dateinamen
 * zurück (Fallback), damit ein fehlender Build den Server nicht crasht,
 * sondern höchstens eine 404 auf die Bundle-Datei verursacht.
 */
export function getIslandsBundlePath(): string {
  if (!cachedFileName) {
    cachedFileName = readManifestFileName();
  }
  return `/islands/${cachedFileName}`;
}

function readManifestFileName(): string {
  const manifestPath = path.join(resolveIslandsDir(), "manifest.json");
  try {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(raw) as { file?: unknown };
    if (typeof manifest.file === "string" && manifest.file.length > 0) {
      return manifest.file;
    }
    return DEFAULT_BUNDLE_FILE;
  } catch {
    return DEFAULT_BUNDLE_FILE;
  }
}

/** Nur für Tests: setzt den Prozess-Cache zurück, damit ein Test ein frisches Manifest lesen kann. */
export function __resetIslandsBundleCacheForTests(): void {
  cachedFileName = null;
}
