import { describe, expect, test } from "vitest";
import { getFixture } from "../../../../shared/siteContract/fixtures";
import { parseV2 } from "./isV2";
import { PACK_MODULES } from "./packRegistry";
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

  describe("valide stylePackId ohne registriertes Client-Modul", () => {
    // Seit Plan-C2 (14/14 Packs) hat jede reale Schema-PackId ein
    // PACK_MODULES-Modul (siehe moduleParity.test.ts) — eine einfache
    // unbekannte stylePackId würde daher gar nicht erst die WebsiteDataV2Schema-
    // Prüfung überstehen und den eigentlichen PACK_MODULES-Guard (isV2.ts
    // Zeile "if (!PACK_MODULES[...]) return null;") NICHT mehr auslösen. Um
    // genau diesen Zustand ("Schema akzeptiert die ID, aber kein Client-Modul
    // registriert") weiterhin real zu testen, entfernen wir hier gezielt ein
    // tatsächlich registriertes Modul aus PACK_MODULES und stellen es danach
    // wieder her — kein Abschwächen des Guard-Tests, sondern eine Simulation
    // des Zustands, den es im echten Rollout-Fenster (Schema deployed, Client-
    // Bundle noch nicht) tatsächlich gibt. Das Modul wird im finally-Block
    // wiederhergestellt, damit nachfolgende Tests/Dateien nicht beeinflusst
    // werden.
    test("→ null (v1-Fallback statt weißer Screen)", () => {
      const doc = getFixture("werkbank", "full");
      const registered = PACK_MODULES.werkbank;
      expect(registered).toBeDefined(); // Vorbedingung: Modul war wirklich registriert
      delete PACK_MODULES.werkbank;
      try {
        expect(parseV2(doc)).toBeNull();
      } finally {
        PACK_MODULES.werkbank = registered;
      }
    });
  });
});
