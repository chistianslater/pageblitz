import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "StartPage.tsx"),
  "utf8"
);

describe("StartPage Geolocation-Verdrahtung", () => {
  test("Standort-Prompt nur im GMB-/Stadt-Schritt, nicht auf der Landing-Choice", () => {
    const choiceStart = src.indexOf('{step === "choice"');
    const gmbStart = src.indexOf('{step === "gmb"');
    const standortUi = src.indexOf("<StandortControl");
    expect(choiceStart).toBeGreaterThan(0);
    expect(gmbStart).toBeGreaterThan(choiceStart);
    expect(standortUi).toBeGreaterThan(gmbStart);
    expect(src).toContain("<StandortControl");
  });

  test("Hero-Prefill sucht mit ensureLocationIfGranted (granted → nearby, sonst Tipp-Suche)", () => {
    expect(src).toContain("ensureLocationIfGranted");
    expect(src).toContain("handleUseStandort");
    expect(src).toContain("runGmbSearch");
  });
});
