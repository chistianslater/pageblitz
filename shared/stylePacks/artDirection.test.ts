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
  test("recipe rotation varies the rhythm, never the silhouette", () => {
    // Betreiber-Befund 2026-09-13: Von einem Kampagnenstapel sah nur etwa
    // jede fuenfte Seite aus wie das Pack — der Rezept-Zaehler drehte auch
    // Komposition und Hero durch. Die Silhouette ist das, was die Postkarte
    // verspricht; variieren darf nur, was darunter liegt.
    for (const pack of ["salon-noir", "gusto", "raster"] as const) {
      const fixture = getFixture(pack, "full");
      const input = {
        stylePackId: fixture.stylePackId,
        businessName: fixture.businessName,
        businessCategory: fixture.businessCategory,
        sections: fixture.sections,
      };
      const master = withArtDirection(fixture).designProfile!;
      const rhythms: string[] = [];
      for (let offset = 0; offset < 12; offset++) {
        const profile = deriveArtDirectedProfile(input, new Set(), offset);
        for (const key of [
          "composition",
          "heroLayout",
          "imageTreatment",
          "aboutLayout",
          "density",
        ] as const) {
          expect(profile[key], `${pack} @ ${offset}: ${key}`).toBe(master[key]);
        }
        rhythms.push(`${profile.servicesLayout}/${profile.galleryLayout}`);
      }
      // Zehn Salons in einer Stadt sollen trotzdem nicht zehn gleiche Seiten
      // bekommen — und schon gar nicht zwei direkt hintereinander.
      expect(new Set(rhythms).size, pack).toBeGreaterThanOrEqual(5);
      expect(
        rhythms.some((r, i) => i > 0 && r === rhythms[i - 1]),
        `${pack}: direkte Wiederholung`
      ).toBe(false);
    }
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
