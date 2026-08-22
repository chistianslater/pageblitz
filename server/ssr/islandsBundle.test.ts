import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import fs from "node:fs";

/**
 * NODE_ENV ist unter Vitest weder "development" noch gebündelt — die
 * Pfadauflösung in islandsBundle.ts landet für den Fallback-Test also
 * automatisch bei einem Manifest-Pfad, den es im Repo nicht gibt
 * (server/ssr/public/islands/manifest.json), ohne dass echte Build-Artefakte
 * (dist/public/islands/) angefasst werden müssen. Für den
 * "Manifest vorhanden"-Fall wird fs.readFileSync direkt gemockt, statt
 * echte Dateien neben dem Source-Baum zu erzeugen.
 */
describe("getIslandsBundlePath", () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("Fallback: kein Manifest lesbar → ungehashter Standardname", async () => {
    const { getIslandsBundlePath } = await import("./islandsBundle");
    expect(getIslandsBundlePath()).toBe("/islands/site-islands.js");
  });

  test("Manifest vorhanden → gehashter Dateiname aus manifest.json", async () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue(
      JSON.stringify({ file: "site-islands.abcd1234.js" })
    );
    const { getIslandsBundlePath } = await import("./islandsBundle");
    expect(getIslandsBundlePath()).toBe("/islands/site-islands.abcd1234.js");
  });

  test("Manifest mit leerem/fehlendem file-Feld → Fallback auf Standardname", async () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify({}));
    const { getIslandsBundlePath } = await import("./islandsBundle");
    expect(getIslandsBundlePath()).toBe("/islands/site-islands.js");
  });

  test("Kaputtes JSON im Manifest → Fallback statt Absturz", async () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue("{nicht json");
    const { getIslandsBundlePath } = await import("./islandsBundle");
    expect(getIslandsBundlePath()).toBe("/islands/site-islands.js");
  });

  test("Cache: zweiter Aufruf liest die Datei nicht erneut (gleicher Prozess)", async () => {
    const readSpy = vi
      .spyOn(fs, "readFileSync")
      .mockReturnValue(JSON.stringify({ file: "site-islands.deadbeef.js" }));
    const { getIslandsBundlePath } = await import("./islandsBundle");

    getIslandsBundlePath();
    const callsAfterFirst = readSpy.mock.calls.length;
    getIslandsBundlePath();

    expect(readSpy.mock.calls.length).toBe(callsAfterFirst);
  });
});
