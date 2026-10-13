import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

/**
 * Wächter (Preismodell 2026-10-13): Basispreise stehen NUR in
 * shared/pricing*.ts. Jede andere Quelldatei, die „19,90", „24,90",
 * „238,80", „19.90", „24.90" oder die Cent-Werte 1990/2490 enthält, ist ein
 * Preis an der Quelle vorbei — er läuft beim nächsten Preiswechsel
 * auseinander (so entstanden ~90 SEO-Texte ohne Laufzeit und ein Konto, das
 * immer 19,90 zeigte).
 *
 * Ausgenommen per Regel:
 * - shared/pricing*.ts (die Quelle selbst inkl. Text- und Laufzeitmodul),
 * - Testdateien (*.test.ts/tsx) — sie prüfen die gerenderten Texte,
 * - Doku (*.md) und Binärdateien (nicht gescannt).
 *
 * ALLOWLIST: nur Fundstellen, die nachweislich NICHT der Pageblitz-Preis
 * sind (z. B. ein Blogsatz über den Preis eines anderen Anbieters). Jeder
 * Eintrag braucht Datei, exakten Zeilenausschnitt und Begründung — aktuell
 * leer.
 */
const ROOT = path.resolve(import.meta.dirname, "..");
const SCAN_DIRS = ["client", "server", "shared", "scripts", "drizzle"];
const SCAN_FILES = ["vite.config.ts"];
const EXTENSIONS = /\.(ts|tsx|js|mjs|cjs|html|css|json|sql)$/;
const SKIP_DIRS = new Set(["node_modules", "dist", ".git"]);

const PRICE_LITERAL =
  /19,90|24,90|238,80|19\.90|24\.90|(?:^|[^0-9.,])(?:1990|2490)(?![0-9])/;

const ALLOWLIST: ReadonlyArray<{
  file: string;
  snippet: string;
  reason: string;
}> = [];

function isExempt(rel: string): boolean {
  return (
    /^shared\/pricing[^/]*\.ts$/.test(rel) || /\.test\.(ts|tsx)$/.test(rel)
  );
}

function walk(dir: string, out: string[]): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXTENSIONS.test(entry.name)) out.push(full);
  }
}

function sourceFiles(): string[] {
  const files: string[] = [];
  for (const dir of SCAN_DIRS) {
    const full = path.join(ROOT, dir);
    if (fs.existsSync(full)) walk(full, files);
  }
  for (const file of SCAN_FILES) files.push(path.join(ROOT, file));
  return files
    .map(f => path.relative(ROOT, f).split(path.sep).join("/"))
    .filter(rel => !isExempt(rel));
}

describe("Preis-Literale nur in shared/pricing*.ts", () => {
  test("keine Basispreise außerhalb der Preisquelle", () => {
    const hits: string[] = [];
    for (const rel of sourceFiles()) {
      const lines = fs.readFileSync(path.join(ROOT, rel), "utf-8").split("\n");
      lines.forEach((line, i) => {
        if (!PRICE_LITERAL.test(line)) return;
        const allowed = ALLOWLIST.some(
          a => a.file === rel && line.includes(a.snippet)
        );
        if (!allowed) hits.push(`${rel}:${i + 1}: ${line.trim().slice(0, 140)}`);
      });
    }
    expect(hits, hits.join("\n")).toEqual([]);
  });

  test("das Muster erkennt Preise, aber keine Jahreszahlen-Teile von IDs", () => {
    expect(PRICE_LITERAL.test("ab 19,90 €")).toBe(true);
    expect(PRICE_LITERAL.test('"price": "24.90"')).toBe(true);
    expect(PRICE_LITERAL.test("unit_amount: 1990,")).toBe(true);
    expect(PRICE_LITERAL.test("photo-1509440159596-0249088772ff")).toBe(false);
    expect(PRICE_LITERAL.test("2 × 238,80 €")).toBe(true);
  });

  test("jeder Allowlist-Eintrag trifft noch eine Zeile (keine Altlasten)", () => {
    for (const entry of ALLOWLIST) {
      const content = fs.readFileSync(path.join(ROOT, entry.file), "utf-8");
      expect(content, `${entry.file}: ${entry.reason}`).toContain(entry.snippet);
    }
  });
});
