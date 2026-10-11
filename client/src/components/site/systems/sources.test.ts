import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { DESIGN_SYSTEM_IDS } from "../../../../../shared/designSystems/types";
import { SYSTEMS_WITH_MOTION } from "../../../../../shared/designSystems/registry";

/**
 * Quelltext-Prüfungen für die Designsysteme (2026-10-11).
 */

const ROOT = resolve(__dirname, "../../../../..");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)
      ? [path]
      : [];
  });
}

describe("Designsysteme: Quelltext", () => {
  test("kein Regex-Lookbehind — der Studio-Chunk muss in Safari < 16.4 parsen", () => {
    const files = [
      ...sourceFiles(resolve(ROOT, "client/src/components/site/systems")),
      ...sourceFiles(resolve(ROOT, "shared/designSystems")),
    ];
    expect(files.length).toBeGreaterThan(10);
    const offenders = files.filter(f =>
      /\(\?<[=!]/.test(readFileSync(f, "utf8"))
    );
    expect(offenders).toEqual([]);
  });

  test("Motion-Bundle bindet genau die Systeme aus SYSTEMS_WITH_MOTION ein", () => {
    const src = readFileSync(
      resolve(ROOT, "client/src/site-islands/motion.ts"),
      "utf8"
    );
    const mounted = Array.from(
      src.matchAll(/["']\.pb-([a-z-]+)["']/g),
      m => m[1]
    ).filter(id => (DESIGN_SYSTEM_IDS as readonly string[]).includes(id));
    expect([...mounted].sort()).toEqual([...SYSTEMS_WITH_MOTION].sort());
  });
});
