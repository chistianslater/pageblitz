import { describe, expect, test } from "vitest";
import {
  RELEASED_SYSTEMS,
  getSystem,
  isReleased,
  systemHasMotion,
} from "./registry";

describe("Freischaltung der Designsysteme", () => {
  test("Journal ist abgenommen und freigeschaltet", () => {
    expect(RELEASED_SYSTEMS).toEqual(["journal", "raster", "werkstoff"]);
    expect(isReleased("journal")).toBe(true);
    expect(getSystem("journal")).toBeDefined();
  });

  test("nur registrierte Systeme gelten als freigeschaltet", () => {
    for (const id of RELEASED_SYSTEMS) expect(getSystem(id)).toBeDefined();
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
  test("ist registriert, aber nicht freigeschaltet", () => {
    expect(getSystem("plakat")?.name).toBe("Plakat");
    expect(isReleased("plakat")).toBe(false);
    expect(RELEASED_SYSTEMS).not.toContain("plakat");
  });
});
