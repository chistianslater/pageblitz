import { describe, expect, test } from "vitest";
import { getFixture } from "../../../../shared/siteContract/fixtures";
import { parseV2 } from "./isV2";

describe("parseV2", () => {
  test("gültiges v2-Dokument wird erkannt", () => {
    expect(parseV2(getFixture("werkbank", "full"))?.stylePackId).toBe(
      "werkbank"
    );
  });
  test("v1-Dokument (ohne version:2) → null", () => {
    expect(parseV2({ businessName: "Alt", sections: [] })).toBeNull();
  });
  test("kaputtes v2-Dokument → null (kein Throw im Renderer-Pfad)", () => {
    expect(parseV2({ version: 2, stylePackId: "werkbank" })).toBeNull();
  });
});
