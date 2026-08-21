import { describe, expect, test } from "vitest";
import { getFixture } from "../../../../shared/siteContract/fixtures";
import { parseV2 } from "./isV2";
// Import-Nebenwirkung: registriert alle Pack-Module in PACK_MODULES, wie es
// jeder echte Aufrufer (z. B. WebsiteRenderer.tsx) auch tut.
import "./packs/index";

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
  test('valide stylePackId ohne registriertes Client-Modul (z. B. "fundament") → null (v1-Fallback statt weißer Screen)', () => {
    const doc = {
      ...getFixture("werkbank", "full"),
      stylePackId: "fundament",
    };
    expect(parseV2(doc)).toBeNull();
  });
});
