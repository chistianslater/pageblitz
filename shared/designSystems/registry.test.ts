import { describe, expect, test } from "vitest";
import {
  RELEASED_SYSTEMS,
  getSystem,
  isReleased,
  systemHasMotion,
} from "./registry";

describe("Freischaltung der Designsysteme", () => {
  test("Journal ist abgenommen und freigeschaltet", () => {
    expect(RELEASED_SYSTEMS).toEqual([
      "journal",
      "raster",
      "werkstoff",
      "plakat",
      "klar",
      "nacht",
      "freundlich",
    ]);
    expect(isReleased("journal")).toBe(true);
    expect(getSystem("journal")).toBeDefined();
  });

  test("nur registrierte Systeme gelten als freigeschaltet", () => {
    for (const id of RELEASED_SYSTEMS) expect(getSystem(id)).toBeDefined();
  });
});

describe("Freundlich", () => {
  test("ist registriert und freigeschaltet", () => {
    expect(getSystem("freundlich")?.name).toBe("Freundlich");
    expect(isReleased("freundlich")).toBe(true);
    expect(RELEASED_SYSTEMS).toContain("freundlich");
    expect(systemHasMotion("freundlich")).toBe(true);
  });
});

describe("Nacht", () => {
  test("ist registriert und freigeschaltet", () => {
    expect(getSystem("nacht")?.name).toBe("Nacht");
    expect(isReleased("nacht")).toBe(true);
    expect(RELEASED_SYSTEMS).toContain("nacht");
    expect(systemHasMotion("nacht")).toBe(true);
  });
});

describe("Klar", () => {
  test("ist registriert und freigeschaltet", () => {
    expect(getSystem("klar")?.name).toBe("Klar");
    expect(isReleased("klar")).toBe(true);
    expect(RELEASED_SYSTEMS).toContain("klar");
  });
});

describe("Raster", () => {
  test("ist registriert und freigeschaltet", () => {
    expect(getSystem("raster")?.name).toBe("Raster");
    expect(isReleased("raster")).toBe(true);
    expect(RELEASED_SYSTEMS).toContain("raster");
  });
});

describe("Bewegung je System", () => {
  test("Journal und Raster haben Bewegung (R7)", () => {
    expect(systemHasMotion("journal")).toBe(true);
    expect(systemHasMotion("raster")).toBe(true);
  });
});

describe("Werkstoff", () => {
  test("ist registriert und freigeschaltet", () => {
    expect(getSystem("werkstoff")?.name).toBe("Werkstoff");
    expect(isReleased("werkstoff")).toBe(true);
    expect(RELEASED_SYSTEMS).toContain("werkstoff");
  });
});

describe("Plakat", () => {
  test("ist registriert und freigeschaltet", () => {
    expect(getSystem("plakat")?.name).toBe("Plakat");
    expect(isReleased("plakat")).toBe(true);
    expect(RELEASED_SYSTEMS).toContain("plakat");
  });
});
