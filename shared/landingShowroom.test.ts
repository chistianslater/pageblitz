import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { getSystem } from "./designSystems/registry";
import { LANDING_SHOWROOM } from "./landingShowroom";
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
