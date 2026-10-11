import { describe, expect, test } from "vitest";
import { RELEASED_SYSTEMS, getSystem, isReleased } from "./registry";

describe("Freischaltung der Designsysteme", () => {
  test("Journal ist abgenommen und freigeschaltet", () => {
    expect(RELEASED_SYSTEMS).toEqual(["journal"]);
    expect(isReleased("journal")).toBe(true);
    expect(getSystem("journal")).toBeDefined();
  });

  test("nur registrierte Systeme gelten als freigeschaltet", () => {
    for (const id of RELEASED_SYSTEMS) expect(getSystem(id)).toBeDefined();
  });
});
