import { describe, expect, test } from "vitest";
import { getFixture } from "../siteContract/fixtures";
import { PACK_IDS, WebsiteDataV2Schema } from "../siteContract/schema";
import { getPackPool } from "./index";
import {
  ART_DIRECTIONS,
  compositionFingerprint,
  deriveArtDirectedProfile,
  rankArtDirections,
  withArtDirection,
} from "./artDirection";

describe("art-directed generation", () => {
  test("all 20 packs have explicit direction and schema-valid documents", () => {
    expect(Object.keys(ART_DIRECTIONS).sort()).toEqual([...PACK_IDS].sort());
    for (const id of PACK_IDS)
      expect(
        WebsiteDataV2Schema.safeParse(withArtDirection(getFixture(id, "full")))
          .success,
        id
      ).toBe(true);
  });
  test("twelve salons have twelve structural compositions, independent of colors/fonts", () => {
    const occupied = new Set<string>();
    const pool = getPackPool("Friseur");
    for (let i = 0; i < 12; i++) {
      const stylePackId = pool[i % pool.length];
      const input = {
        ...getFixture(stylePackId, "full"),
        businessName: `Salon ${i}`,
        businessCategory: "Friseur",
      };
      const profile = deriveArtDirectedProfile(input, occupied);
      const fingerprint = compositionFingerprint(stylePackId, profile);
      expect(occupied.has(fingerprint)).toBe(false);
      occupied.add(fingerprint);
    }
    expect(occupied.size).toBe(12);
  });
  test("no-image documents use typography, never empty photo scaffolding", () => {
    for (const id of PACK_IDS) {
      const input = {
        ...getFixture(id, "minimal"),
        sections: [{ type: "hero", headline: "A long but valid headline" }],
      };
      expect(deriveArtDirectedProfile(input).composition).toBe("statement");
    }
  });
  test("context narrows eligible directions without importing unrelated packs", () => {
    const pool = getPackPool("Friseur");
    expect(
      rankArtDirections(pool, "Exklusiver Boutique Salon mit Balayage")
    ).toEqual(["salon-noir"]);
    expect(rankArtDirections(pool, "Software und Technologie")).toEqual(pool);
  });
  test("upgrade does not rewrite facts, add-ons or source document", () => {
    const original = getFixture("gusto", "full");
    const before = JSON.stringify(original);
    const next = withArtDirection(original);
    expect(next.sections).toBe(original.sections);
    expect(next.addOns).toBe(original.addOns);
    expect(JSON.stringify(original)).toBe(before);
  });
});
