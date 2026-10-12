import { describe, expect, test } from "vitest";
import { getFixture } from "../siteContract/fixtures";
import { WebsiteDataV2Schema } from "../siteContract/schema";
import { withArtDirection } from "../stylePacks/artDirection";
import { withDesignSystem, withoutDesignSystem, withPrimarySystem } from "./apply";

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

describe("withPrimarySystem (Raster, Werkstoff, Plakat und Klar freigeschaltet)", () => {
  const withFamily = (blueprintFamily: string) =>
    withPrimarySystem({
      ...rev2,
      businessCategory: "Unternehmen",
      businessName: "Muster GmbH",
      blueprintFamily,
    } as typeof rev2);

  test.each(["advice", "auto", "urgent", "industry", "standard"])(
    "Familie %s bekommt Raster (rev 3)",
    family => {
      const doc = withFamily(family);
      expect(doc.system).toBe("raster");
      expect(doc.designRevision).toBe(3);
    }
  );

  test.each(["trade", "retail"])(
    "Familie %s bekommt Werkstoff (rev 3)",
    family => {
      const doc = withFamily(family);
      expect(doc.system).toBe("werkstoff");
      expect(doc.designRevision).toBe(3);
    }
  );

  test("Café (Gastro) bekommt Werkstoff", () => {
    const doc = withPrimarySystem({
      ...rev2,
      businessCategory: "Café",
      businessName: "Café Muster",
      blueprintFamily: "gastro",
    } as typeof rev2);
    expect(doc.system).toBe("werkstoff");
    expect(doc.designRevision).toBe(3);
  });

  test("Familie health bekommt Klar (rev 3)", () => {
    const doc = withFamily("health");
    expect(doc.system).toBe("klar");
    expect(doc.designRevision).toBe(3);
  });

  test("Familie courses bekommt Plakat (rev 3)", () => {
    const doc = withFamily("courses");
    expect(doc.system).toBe("plakat");
    expect(doc.designRevision).toBe(3);
  });

  test("Barbershop (Beauty + Barber im Namen) bekommt Plakat", () => {
    const doc = withPrimarySystem({
      ...rev2,
      businessCategory: "Friseursalon",
      businessName: "Kante Barbershop",
      blueprintFamily: "beauty",
    } as typeof rev2);
    expect(doc.system).toBe("plakat");
    expect(doc.designRevision).toBe(3);
  });

  test("Imbiss (Gastro) bekommt Plakat", () => {
    const doc = withPrimarySystem({
      ...rev2,
      businessCategory: "Imbiss",
      businessName: "Imbiss Muster",
      blueprintFamily: "gastro",
    } as typeof rev2);
    expect(doc.system).toBe("plakat");
    expect(doc.designRevision).toBe(3);
  });

  test("Beauty behält Journal als Hauptsystem", () => {
    expect(withFamily("beauty").system).toBe("journal");
  });
});
