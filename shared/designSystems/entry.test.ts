import { describe, expect, test } from "vitest";
import { PACK_IDS } from "../siteContract/packIds";
import type { PackId } from "../siteContract/types";
import { DEFAULT_DESIGN_PROFILE } from "../siteContract/designProfile";
import { entryComposition, entryProfile } from "./entry";

/**
 * Altes Verhalten als Tabelle (berechnet mit den Einstiegs-Regeln der
 * Pack-Daten auf Stand 00cc7871, bevor sie entfielen): [Hero-Foto, Querformat, Zusatzfotos,
 * Komposition — einheitlich oder je Pack].
 */
type Old = string | Record<string, string>;
const OLD: Array<[boolean, boolean, number, Old]> = [
  [false, false, 0, "statement"],
  [false, false, 1, "statement"],
  [false, false, 3, "statement"],
  [false, true, 0, "statement"],
  [false, true, 1, "statement"],
  [false, true, 3, "statement"],
  [true, false, 0, {"werkbank":"editorial","patina":"panorama","kanzlei":"editorial","salon-noir":"portrait","morgenlicht":"portrait","marktplatz":"statement","gusto":"editorial","landgut":"panorama","atelier":"portrait","klarwerk":"editorial","verve":"statement","zunft":"editorial","schimmer":"portrait","fundament":"editorial","karat":"portrait","plakat":"statement","raster":"panorama","strom":"editorial","riviera":"panorama","ernte":"editorial"}],
  [true, false, 1, {"werkbank":"colorfield","patina":"colorfield","kanzlei":"colorfield","salon-noir":"colorfield","morgenlicht":"colorfield","marktplatz":"statement","gusto":"colorfield","landgut":"colorfield","atelier":"colorfield","klarwerk":"colorfield","verve":"statement","zunft":"colorfield","schimmer":"colorfield","fundament":"colorfield","karat":"colorfield","plakat":"statement","raster":"colorfield","strom":"colorfield","riviera":"colorfield","ernte":"colorfield"}],
  [true, false, 3, {"werkbank":"colorfield","patina":"colorfield","kanzlei":"colorfield","salon-noir":"colorfield","morgenlicht":"colorfield","marktplatz":"statement","gusto":"colorfield","landgut":"colorfield","atelier":"colorfield","klarwerk":"colorfield","verve":"statement","zunft":"colorfield","schimmer":"colorfield","fundament":"colorfield","karat":"colorfield","plakat":"statement","raster":"colorfield","strom":"colorfield","riviera":"colorfield","ernte":"colorfield"}],
  [true, true, 0, {"werkbank":"stage","patina":"stage","kanzlei":"stage","salon-noir":"stage","morgenlicht":"stage","marktplatz":"statement","gusto":"stage","landgut":"stage","atelier":"stage","klarwerk":"stage","verve":"statement","zunft":"stage","schimmer":"stage","fundament":"stage","karat":"stage","plakat":"statement","raster":"stage","strom":"stage","riviera":"stage","ernte":"stage"}],
  [true, true, 1, {"werkbank":"stage","patina":"stage","kanzlei":"stage","salon-noir":"stage","morgenlicht":"stage","marktplatz":"statement","gusto":"stage","landgut":"stage","atelier":"stage","klarwerk":"stage","verve":"statement","zunft":"stage","schimmer":"stage","fundament":"stage","karat":"stage","plakat":"statement","raster":"stage","strom":"stage","riviera":"stage","ernte":"stage"}],
  [true, true, 3, {"werkbank":"stage","patina":"stage","kanzlei":"stage","salon-noir":"stage","morgenlicht":"stage","marktplatz":"statement","gusto":"stage","landgut":"stage","atelier":"stage","klarwerk":"stage","verve":"statement","zunft":"stage","schimmer":"stage","fundament":"stage","karat":"stage","plakat":"statement","raster":"stage","strom":"stage","riviera":"stage","ernte":"stage"}],
];

/** Die Systeme unterscheiden nur „stage“ von allem anderen. */
const RENDER_SAME_AS_PORTRAIT = new Set(["editorial", "panorama", "portrait"]);

const input = (stylePackId: PackId, hero: boolean) => ({
  stylePackId,
  businessName: "X",
  businessCategory: "Y",
  sections: [
    { type: "hero", ...(hero ? { imageUrl: "https://x/h.jpg" } : {}) },
  ],
});

describe("entryProfile — Einstieg nach Fotomaterial", () => {
  for (const [hero, heroLandscape, extraPhotos, old] of OLD) {
    test(`Hero-Foto ${hero}, Querformat ${heroLandscape}, Zusatzfotos ${extraPhotos}: wie das alte Pack-Profil`, () => {
      for (const id of PACK_IDS) {
        const expected = typeof old === "string" ? old : old[id];
        const got = entryComposition(input(id, hero), {
          heroLandscape,
          extraPhotos,
        });
        if (RENDER_SAME_AS_PORTRAIT.has(expected)) {
          // Pack-eigene Namen ohne Wirkung im System → einheitlich „portrait“.
          expect(got, id).toBe("portrait");
        } else {
          expect(got, id).toBe(expected);
        }
      }
    });
  }

  test("Profil = Standard + Komposition + Seed, sonst nichts", () => {
    const profile = entryProfile(input("werkbank", true), {
      heroLandscape: true,
      extraPhotos: 2,
    });
    const { composition, seed, ...rest } = profile;
    const { seed: _s, ...defaults } = DEFAULT_DESIGN_PROFILE;
    expect(composition).toBe("stage");
    expect(rest).toEqual(defaults);
    expect(seed).toBeGreaterThan(0);
    expect(entryProfile(input("werkbank", true), { heroLandscape: true, extraPhotos: 2 }).seed).toBe(seed);
  });
});
