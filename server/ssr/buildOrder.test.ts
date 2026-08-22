import { describe, expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Finding C1: `vite build` läuft mit `emptyOutDir` (Default) und leert
 * `dist/public/` komplett — läuft `build:islands` VOR `vite build`, löscht
 * Vite das gerade gebaute Inseln-Bundle wieder. Dieser Test liest
 * `package.json` und prüft per String-Index-Vergleich, dass `build:islands`
 * im "build"-Skript NACH `vite build` steht, damit diese Reihenfolge nicht
 * unbemerkt wieder vertauscht wird.
 */
describe("package.json build-Skript — Reihenfolge", () => {
  test("vite build steht vor build:islands", () => {
    const pkgPath = path.resolve(
      import.meta.dirname,
      "..",
      "..",
      "package.json"
    );
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as {
      scripts: Record<string, string>;
    };
    const buildScript = pkg.scripts.build;
    expect(buildScript).toBeTruthy();

    const viteIndex = buildScript.indexOf("vite build");
    const islandsIndex = buildScript.indexOf("build:islands");

    expect(viteIndex).toBeGreaterThan(-1);
    expect(islandsIndex).toBeGreaterThan(-1);
    expect(islandsIndex).toBeGreaterThan(viteIndex);
  });
});
