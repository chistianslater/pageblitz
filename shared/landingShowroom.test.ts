import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { RELEASED_SYSTEMS, getSystem } from "./designSystems/registry";
import {
  LANDING_DESIGN_COUNT_NOTE,
  LANDING_SHOWROOM,
  germanCount,
} from "./landingShowroom";
import {
  findShowcase,
  showcasePrimarySystem,
} from "./showcases/blueprintShowcase";

const PUBLIC = path.resolve(__dirname, "../client/public");

describe("LANDING_SHOWROOM", () => {
  it("zeigt drei Beispiele in drei verschiedenen Systemen", () => {
    expect(LANDING_SHOWROOM).toHaveLength(3);
    const systems = LANDING_SHOWROOM.map(i => i.href.split("/")[3]);
    expect(new Set(systems).size).toBe(3);
  });

  for (const item of LANDING_SHOWROOM) {
    it(`${item.showcase}: Name, System und Bild stimmen`, () => {
      const showcase = findShowcase(item.showcase);
      expect(showcase).toBeDefined();
      expect(showcase!.sample).toBe(item.name);
      const system = showcasePrimarySystem(showcase!);
      expect(item.href).toBe(`/demo/system/${system}/${item.showcase}`);
      expect(item.systemName).toBe(getSystem(system)?.name);
      expect(item.image).toBe(`/showcases/${item.showcase}.webp`);
      expect(fs.existsSync(path.join(PUBLIC, item.image)), item.image).toBe(
        true
      );
    });
  }
});

describe("Anzahl der Designs", () => {
  it("folgt den freigeschalteten Systemen", () => {
    expect(RELEASED_SYSTEMS).toHaveLength(7);
    expect(LANDING_DESIGN_COUNT_NOTE).toMatch(/^Sieben Designs mit je drei /);
  });

  it("je drei Farbstimmungen stimmt für jedes System", () => {
    for (const id of RELEASED_SYSTEMS)
      expect(getSystem(id)?.palettes, id).toHaveLength(3);
  });

  it("Zahlwort mit Ziffern-Rückfall", () => {
    expect(germanCount(6)).toBe("Sechs");
    expect(germanCount(12)).toBe("Zwölf");
    expect(germanCount(13)).toBe("13");
  });
});
