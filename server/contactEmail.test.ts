import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { CONTACT_EMAIL } from "../shared/const";
import { AGB_PROVIDER } from "../shared/agb";
import { generateHomePrerender } from "./seo/homePage";

/**
 * Wächter (2026-10-13): Pageblitz hat EINE öffentliche Kontaktadresse,
 * `hello@pageblitz.de` (shared/const.ts CONTACT_EMAIL). Früher standen
 * daneben `hallo@` (Landing-Fuß, JSON-LD) und `support@` (Chat-Rückfall).
 * Absender-Adressen (christian@, noreply@, kontakt@) sind keine
 * Kontaktadressen und hier nicht betroffen.
 */
const ROOT = path.resolve(import.meta.dirname, "..");
const SCAN_DIRS = ["client", "server", "shared"];
const EXTENSIONS = /\.(ts|tsx|html)$/;
const SKIP_DIRS = new Set(["node_modules", "dist", ".git"]);
const FORBIDDEN = /\b(hallo|support|info|kontakt-?formular)@pageblitz\.de\b/;

function walk(dir: string, out: string[]): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXTENSIONS.test(entry.name) && !entry.name.includes(".test."))
      out.push(full);
  }
}

describe("Kontaktadresse", () => {
  test("ist hello@pageblitz.de und steht so im Impressum und in den AGB", () => {
    expect(CONTACT_EMAIL).toBe("hello@pageblitz.de");
    expect(AGB_PROVIDER.email).toBe(CONTACT_EMAIL);
    const impressum = fs.readFileSync(
      path.join(ROOT, "client/src/pages/PageblitzImpressum.tsx"),
      "utf-8"
    );
    expect(impressum).toContain(`mailto:${CONTACT_EMAIL}`);
  });

  test("keine abweichenden Kontaktadressen im Quelltext", () => {
    const files: string[] = [];
    for (const dir of SCAN_DIRS) walk(path.join(ROOT, dir), files);
    const hits = files.flatMap(file =>
      fs
        .readFileSync(file, "utf-8")
        .split("\n")
        .map((line, i) => [line, i] as const)
        .filter(([line]) => FORBIDDEN.test(line))
        .map(([line, i]) => `${path.relative(ROOT, file)}:${i + 1}: ${line.trim()}`)
    );
    expect(hits, hits.join("\n")).toEqual([]);
  });

  test("JSON-LD in index.html und SEO-Startseite nennen die Kontaktadresse", () => {
    const indexHtml = fs.readFileSync(path.join(ROOT, "client/index.html"), "utf-8");
    expect(indexHtml).toContain(`"email": "${CONTACT_EMAIL}"`);
    expect(generateHomePrerender()).toContain(`mailto:${CONTACT_EMAIL}`);
  });
});
