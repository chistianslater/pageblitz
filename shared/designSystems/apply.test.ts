import { describe, expect, test } from "vitest";
import { getFixture } from "../siteContract/fixtures";
import { WebsiteDataV2Schema } from "../siteContract/schema";
import { DEFAULT_DESIGN_PROFILE } from "../siteContract/designProfile";
import { BLUEPRINT_IDS } from "../blueprints/blueprints";
import { asSystemDoc, defaultPalette, withDesignSystem, withPrimarySystem } from "./apply";
import { systemsForDoc } from "./assignment";
import { getSystem } from "./registry";

/** Gespeicherter Pack-Stand (rev 2) mit Profil, wie im Verlauf. */
const rev2 = {
  ...getFixture("salon-noir", "full"),
  designRevision: 2 as const,
  designProfile: { ...DEFAULT_DESIGN_PROFILE, composition: "portrait" as const, seed: 7 },
};

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
    // Seit Nacht N1 sind alle sechs IDs registriert — eine unbekannte prüfen.
    expect(() =>
      withDesignSystem(rev2, "gibtsnicht" as Parameters<typeof withDesignSystem>[1])
    ).toThrow(/nicht vorhanden/);
  });
});

describe("Standard-Farbstimmung [E3]", () => {
  const journal = getSystem("journal")!;
  const plain = (businessName: string, businessCategory?: string) => ({
    businessName,
    businessCategory,
  });
  test("ohne Akzent deterministisch je Betrieb (Name + Kategorie)", () => {
    const a = defaultPalette(journal, plain("Salon Lindner", "Friseursalon"));
    expect(defaultPalette(journal, plain("Salon Lindner", "Friseursalon"))).toBe(a);
    const { colorOverrides: _c, ...noAccent } = rev2;
    expect(withDesignSystem(noAccent, "journal").palette).toBe(
      defaultPalette(journal, noAccent).id
    );
  });
  test("verteilt neue Seiten etwa zu gleichen Teilen auf die drei Stimmungen", () => {
    const counts = new Map<string, number>();
    for (let i = 0; i < 600; i += 1) {
      const id = defaultPalette(journal, plain(`Betrieb ${i}`, "Friseursalon")).id;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    expect([...counts.keys()].sort()).toEqual(journal.palettes.map(p => p.id).sort());
    for (const n of counts.values()) expect(n).toBeGreaterThan(150);
  });
  test("vorhandene Akzentfarbe gewinnt (Bestand)", () => {
    expect(
      defaultPalette(journal, { ...plain("X"), colorOverrides: { accent: "#9a4630" } }).id
    ).toBe("ton");
  });
});

describe("withPrimarySystem (Raster, Werkstoff, Plakat, Klar, Nacht und Freundlich freigeschaltet)", () => {
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

  test("Restaurant (Gastro) bekommt Nacht (rev 3)", () => {
    const doc = withPrimarySystem({
      ...rev2,
      businessCategory: "Restaurant",
      businessName: "Weinberg",
      blueprintFamily: "gastro",
    } as typeof rev2);
    expect(doc.system).toBe("nacht");
    expect(doc.designRevision).toBe(3);
  });

  test.each(["beauty", "stay", "creative", "trade", "retail", "auto"])(
    "Familie %s bekommt nicht Nacht als Hauptsystem",
    family => {
      expect(withFamily(family).system).not.toBe("nacht");
    }
  );

  test("Beauty behält Journal als Hauptsystem", () => {
    expect(withFamily("beauty").system).toBe("journal");
  });

  test.each(["family", "pets"])("Familie %s bekommt Freundlich (rev 3)", family => {
    const doc = withFamily(family);
    expect(doc.system).toBe("freundlich");
    expect(doc.designRevision).toBe(3);
  });

  test.each([
    ["Eisdiele", "Gelato Mio", "gastro"],
    ["Musikschule", "Tonleiter", "courses"],
    ["Kinderfotografie", "Kleine Momente", "creative"],
    ["Hebamme", "Hebamme Lind", "health"],
  ])("%s (Familie %s im Dokument) bekommt Freundlich", (businessCategory, businessName, blueprintFamily) => {
    const doc = withPrimarySystem({ ...rev2, businessCategory, businessName, blueprintFamily } as typeof rev2);
    expect(doc.system).toBe("freundlich");
    expect(doc.designRevision).toBe(3);
  });

  test.each(["beauty", "trade", "health", "advice", "retail", "auto", "courses", "stay", "creative", "urgent", "industry", "standard"])(
    "Familie %s ohne Kinder-/Tier-Bezug bekommt nicht Freundlich",
    family => {
      expect(withFamily(family).system).not.toBe("freundlich");
    }
  );
});

describe("withPrimarySystem ist total (Packs entfernen, Task 2)", () => {
  const base = getFixture("werkbank", "full");
  const cases: Array<[string, Partial<typeof base>]> = [];
  for (const family of BLUEPRINT_IDS) {
    cases.push([`${family}`, { blueprintFamily: family, businessCategory: "Unternehmen", businessName: "Muster GmbH" }]);
  }
  cases.push(
    ["beauty + Barbier", { blueprintFamily: "beauty", businessCategory: "Friseursalon", businessName: "Kante Barbershop" }],
    ["beauty ohne Barbier", { blueprintFamily: "beauty", businessCategory: "Friseursalon", businessName: "Salon Lindner" }],
    ["gastro Restaurant", { blueprintFamily: "gastro", businessCategory: "Restaurant", businessName: "Weinberg" }],
    ["gastro Imbiss", { blueprintFamily: "gastro", businessCategory: "Imbiss", businessName: "Imbiss Muster" }],
    ["gastro Café", { blueprintFamily: "gastro", businessCategory: "Café", businessName: "Café Muster" }],
    ["gastro ohne Art", { blueprintFamily: "gastro", businessCategory: "Gastronomie", businessName: "Zur Post" }],
    ["gastro Eisdiele", { blueprintFamily: "gastro", businessCategory: "Eisdiele", businessName: "Gelato Mio" }],
    ["Kinderarzt", { blueprintFamily: undefined, businessCategory: "Kinderarzt", businessName: "Dr. Weber" }],
    ["Tierarzt", { blueprintFamily: undefined, businessCategory: "Tierarzt", businessName: "Praxis am Deich" }],
    ["Familie leer", { blueprintFamily: undefined, businessCategory: "Schreinerei", businessName: "Brandt" }],
    ["standard", { blueprintFamily: "standard", businessCategory: "Unternehmen", businessName: "Muster" }],
    ["unbekannte Kategorie", { blueprintFamily: undefined, businessCategory: "Xyzzy Quatsch", businessName: "Foo" }],
    ["ohne Kategorie", { blueprintFamily: undefined, businessCategory: undefined, businessName: "Foo" }]
  );
  test.each(cases)("%s → rev 3, System aus dem Tripel", (_label, patch) => {
    const doc = { ...base, ...patch } as typeof base;
    const out = withPrimarySystem(doc);
    expect(out.designRevision).toBe(3);
    expect(systemsForDoc(doc)).toContain(out.system);
    expect(out.palette).toBeTruthy();
    expect(WebsiteDataV2Schema.safeParse(out).success).toBe(true);
  });
  test("nimmt das erste freigeschaltete System des Tripels", () => {
    const doc = { ...base, blueprintFamily: "trade" } as typeof base;
    const [first, second] = systemsForDoc(doc);
    expect(withPrimarySystem(doc, id => id !== first).system).toBe(second);
  });
  test("wirft nur, wenn keins freigeschaltet ist", () => {
    expect(() => withPrimarySystem(base, () => false)).toThrow(/freigeschaltet/);
  });
});

describe("asSystemDoc", () => {
  const rev3 = withDesignSystem(getFixture("werkbank", "full"), "klar", "wasser");
  test("rev 3 mit System → dasselbe Objekt", () => {
    expect(asSystemDoc(rev3)).toBe(rev3);
    expect(asSystemDoc(rev3, withDesignSystem(rev3, "raster"))).toBe(rev3);
  });
  test.each([
    ["rev 1", { ...getFixture("salon-noir", "full"), designRevision: 1 as const }],
    ["rev 2", rev2],
    ["ohne Revision", (() => { const { designRevision: _r, ...d } = getFixture("gusto", "full"); return d; })()],
  ])("%s ohne current → Hauptsystem, rev 3", (_l, doc) => {
    const out = asSystemDoc({ ...doc, fontPairId: "modern" });
    expect(out.designRevision).toBe(3);
    expect(out.system).toBe(systemsForDoc(doc)[0]);
    expect(out.fontPairId).toBeUndefined();
    expect(out.sections).toEqual(doc.sections);
    expect(out.stylePackId).toBe(doc.stylePackId);
    expect(out.designProfile).toEqual(doc.designProfile);
    expect(WebsiteDataV2Schema.safeParse(out).success).toBe(true);
  });
  test("mit rev-3-current → System und Palette des aktuellen Stands", () => {
    const out = asSystemDoc(rev2, rev3);
    expect(out.designRevision).toBe(3);
    expect(out.system).toBe("klar");
    expect(out.palette).toBe(rev3.palette);
    expect(out.sections).toEqual(rev2.sections);
    expect(out.businessName).toBe(rev2.businessName);
  });
  test("current ohne System → Hauptsystem", () => {
    expect(asSystemDoc(rev2, rev2).system).toBe(systemsForDoc(rev2)[0]);
  });
});
