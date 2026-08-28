import { describe, expect, test } from "vitest";
import {
  formatDistanceKm,
  haversineKm,
  isValidLatLng,
  originFromCoords,
  placesLocationParams,
  rankByDistance,
} from "./geo";

const DORTMUND = { lat: 51.5136, lng: 7.4653 };
const BOCHOLT = { lat: 51.8388, lng: 6.6153 };
const MUENCHEN = { lat: 48.1372, lng: 11.5755 };

describe("isValidLatLng", () => {
  test("akzeptiert reale DE-Koordinaten", () => {
    expect(isValidLatLng(DORTMUND.lat, DORTMUND.lng)).toBe(true);
  });

  test("lehnt fehlende, NaN- und Out-of-Range-Werte ab", () => {
    expect(isValidLatLng(undefined, 7)).toBe(false);
    expect(isValidLatLng(51, undefined)).toBe(false);
    expect(isValidLatLng(NaN, 7)).toBe(false);
    expect(isValidLatLng(51, Infinity)).toBe(false);
    expect(isValidLatLng(91, 7)).toBe(false);
    expect(isValidLatLng(51, 181)).toBe(false);
    expect(isValidLatLng("51" as unknown, 7)).toBe(false);
  });
});

describe("originFromCoords / placesLocationParams", () => {
  test("ohne Koordinaten → kein Places-Bias (Fallback auf Tipp-Suche)", () => {
    expect(originFromCoords()).toBeNull();
    expect(originFromCoords(undefined, 7)).toBeNull();
    expect(placesLocationParams()).toEqual({});
    expect(placesLocationParams(NaN, 7)).toEqual({});
  });

  test("mit Koordinaten → location + radius für Textsearch/Autocomplete", () => {
    expect(originFromCoords(DORTMUND.lat, DORTMUND.lng)).toEqual(DORTMUND);
    expect(placesLocationParams(DORTMUND.lat, DORTMUND.lng, 50_000)).toEqual({
      location: "51.5136,7.4653",
      radius: 50_000,
    });
  });
});

describe("haversineKm / rankByDistance", () => {
  test("Dortmund–Bocholt liegt im Umland, München weit weg", () => {
    const near = haversineKm(DORTMUND, BOCHOLT);
    const far = haversineKm(DORTMUND, MUENCHEN);
    expect(near).toBeGreaterThan(40);
    expect(near).toBeLessThan(80);
    expect(far).toBeGreaterThan(400);
  });

  test("ohne Ursprung bleibt die ursprüngliche Reihenfolge", () => {
    const items = [
      { name: "München", loc: MUENCHEN },
      { name: "Bocholt", loc: BOCHOLT },
    ];
    expect(rankByDistance(items, null, i => i.loc).map(i => i.name)).toEqual([
      "München",
      "Bocholt",
    ]);
    expect(
      rankByDistance(items, undefined, i => i.loc).map(i => i.name)
    ).toEqual(["München", "Bocholt"]);
  });

  test("sortiert Nearby-Treffer vor fernen, Einträge ohne Coords zuletzt", () => {
    const items = [
      { name: "München", loc: MUENCHEN },
      { name: "Unbekannt", loc: null },
      { name: "Bocholt", loc: BOCHOLT },
    ];
    expect(
      rankByDistance(items, DORTMUND, i => i.loc).map(i => i.name)
    ).toEqual(["Bocholt", "München", "Unbekannt"]);
  });

  test("stabile Sortierung bei gleicher Distanz", () => {
    const same = { lat: 51.5, lng: 7.5 };
    const items = [
      { name: "A", loc: same },
      { name: "B", loc: same },
    ];
    expect(rankByDistance(items, same, i => i.loc).map(i => i.name)).toEqual([
      "A",
      "B",
    ]);
  });
});

describe("formatDistanceKm", () => {
  test("Meter unter 1 km, Komma-km darunter, gerundete km darüber", () => {
    expect(formatDistanceKm(0.25)).toBe("250 m");
    expect(formatDistanceKm(0.0004)).toBe("1 m");
    expect(formatDistanceKm(1.2)).toBe("1,2 km");
    expect(formatDistanceKm(15.4)).toBe("15 km");
  });

  test("ungültige Distanz → leer (kein Label)", () => {
    expect(formatDistanceKm(NaN)).toBe("");
    expect(formatDistanceKm(-1)).toBe("");
  });
});
