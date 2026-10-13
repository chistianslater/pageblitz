import { describe, expect, test } from "vitest";
import { getFixture } from "../../../../shared/siteContract/fixtures";
import { withDesignSystem } from "../../../../shared/designSystems/apply";
import { parseV2 } from "./isV2";
import { SYSTEM_MODULES } from "./systems/registry";

describe("parseV2", () => {
  test("rev-3-Seite wird erkannt (dasselbe Dokument)", () => {
    const doc = withDesignSystem(getFixture("werkbank", "full"), "werkstoff", "kiefer");
    const parsed = parseV2(doc);
    expect(parsed).not.toBeNull();
    expect(parsed?.system).toBe("werkstoff");
    expect(parsed?.palette).toBe("kiefer");
  });
  test("rev-1-Dokument wird ein System-Dokument (Hauptsystem der Branche)", () => {
    const parsed = parseV2(getFixture("werkbank", "full"));
    expect(parsed?.designRevision).toBe(3);
    expect(parsed?.system).toBeTruthy();
    expect(parsed?.stylePackId).toBe("werkbank");
  });
  test("v1-Dokument (ohne version:2) → null", () => {
    expect(parseV2({ businessName: "Alt", sections: [] })).toBeNull();
  });
  test("kaputtes v2-Dokument → null (kein Throw im Renderer-Pfad)", () => {
    expect(parseV2({ version: 2, stylePackId: "werkbank" })).toBeNull();
  });
  test("System ohne registriertes Modul → null (Platzhalter statt weißer Screen)", () => {
    const doc = withDesignSystem(getFixture("werkbank", "full"), "werkstoff");
    const registered = SYSTEM_MODULES.werkstoff;
    expect(registered).toBeDefined();
    delete SYSTEM_MODULES.werkstoff;
    try {
      expect(parseV2(doc)).toBeNull();
    } finally {
      SYSTEM_MODULES.werkstoff = registered;
    }
  });
});
