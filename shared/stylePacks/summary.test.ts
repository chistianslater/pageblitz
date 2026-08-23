import { describe, expect, test } from "vitest";
import { PACK_IDS } from "../siteContract/types";
import { getConstitution, STYLE_PACKS } from "./index";
import { PACK_SUMMARY } from "./summary";

describe("PACK_SUMMARY", () => {
  test("enthält genau alle registrierten Packs, Reihenfolge = PACK_IDS", () => {
    expect(PACK_SUMMARY.map(p => p.id)).toEqual(PACK_IDS);
  });

  test("jeder Eintrag stimmt mit STYLE_PACKS/getConstitution überein", () => {
    for (const summary of PACK_SUMMARY) {
      const constitution = getConstitution(summary.id);
      expect(summary.name).toBe(constitution.name);
      expect(summary.essence).toBe(constitution.essence);
      const accent = constitution.palette.find(p => p.role === "accent")?.hex;
      expect(summary.accent).toBe(accent);
    }
  });

  test("deckt jedes registrierte Pack ab (kein Pack fehlt in STYLE_PACKS)", () => {
    expect(PACK_SUMMARY.length).toBe(Object.keys(STYLE_PACKS).length);
  });
});
