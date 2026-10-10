import { describe, expect, test } from "vitest";
import { getFixture } from "../siteContract/fixtures";
import { WebsiteDataV2Schema } from "../siteContract/schema";
import { withArtDirection } from "../stylePacks/artDirection";
import { withDesignSystem, withoutDesignSystem } from "./apply";

const rev2 = withArtDirection(getFixture("salon-noir", "full"));

describe("withDesignSystem", () => {
  test("setzt rev 3, System, Palette; entfernt Schriftpaar, behält Profil", () => {
    const doc = withDesignSystem({ ...rev2, fontPairId: "modern" }, "journal", "ton");
    expect(doc.designRevision).toBe(3);
    expect(doc.system).toBe("journal");
    expect(doc.palette).toBe("ton");
    expect(doc.fontPairId).toBeUndefined();
    expect(doc.designProfile).toEqual(rev2.designProfile);
    expect(WebsiteDataV2Schema.safeParse(doc).success).toBe(true);
  });
  test("ohne Palette: nach Akzentfarbe", () => {
    const doc = withDesignSystem({ ...rev2, colorOverrides: { accent: "#4f7048" } }, "journal");
    expect(doc.palette).toBe("salbei");
  });
  test("unbekannte Palette → erste Palette", () => {
    expect(withDesignSystem(rev2, "journal", "gibtsnicht").palette).toBe("papier");
  });
  test("nicht gebautes System wirft", () => {
    expect(() => withDesignSystem(rev2, "nacht")).toThrow(/nicht vorhanden/);
  });
  test("withoutDesignSystem kehrt zu rev 2 zurück", () => {
    const back = withoutDesignSystem(withDesignSystem(rev2, "journal"));
    expect(back.designRevision).toBe(2);
    expect(back.system).toBeUndefined();
    expect(back.palette).toBeUndefined();
    expect(WebsiteDataV2Schema.safeParse(back).success).toBe(true);
  });
});
