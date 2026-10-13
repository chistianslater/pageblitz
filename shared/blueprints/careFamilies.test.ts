import { describe, expect, test } from "vitest";
import { blueprintFor, keywordFamily } from "./blueprints";
import {
  careFamily,
  isIceCream,
  isKidsLessons,
  isKidsPhoto,
  isPediatric,
  petKind,
} from "./careWords";
import { resolveIndustryFamily } from "../../server/generationV2/industryFamily";
import { systemsFor, systemsForDoc } from "../designSystems/assignment";
import { withPrimarySystem } from "../designSystems/apply";
import { isReleased } from "../designSystems/registry";
import type { DesignSystemId } from "../designSystems/types";
import { getFixture } from "../siteContract/fixtures";
import { WebsiteDataV2Schema } from "../siteContract/schema";

/**
 * Freundlich-Zuordnung (2026-10-13): Zielbranchen landen in den neuen
 * Familien bzw. in freundlichen Unterarten — Nachbarn (Arzt, Hotel,
 * Pension, Café, Kurse, Zahnarzt) bleiben, wo sie waren.
 */
const triple = (businessCategory: string, businessName = "Muster") =>
  systemsForDoc({ businessCategory, businessName });

describe("Familie Kinder & Familie", () => {
  test.each([
    "Kita",
    "Kindertagesstätte",
    "Kindergarten",
    "Waldkindergarten",
    "Kinderkrippe",
    "Krippe",
    "Tagesmutter",
    "Kindertagespflege",
    "Großtagespflege",
    "Kinderbetreuung",
    "Hebamme",
    "Hebammenpraxis",
    "Geburtshaus",
    "preschool",
    "child_care_agency",
    "day care center",
    "midwife",
  ])("%s → family, Freundlich vorn", category => {
    expect(keywordFamily(category)).toBe("family");
    expect(resolveIndustryFamily(category)).toBe("family");
    expect(blueprintFor(category).id).toBe("family");
    expect(triple(category)[0]).toBe("freundlich");
  });

  test("Kita: Betreuungszeiten, Kennenlernen, Team-Platzhalter; Hebamme: eigene Zeilen", () => {
    const kita = blueprintFor("Kita", "Kita Pusteblume");
    expect(kita.hoursLabel).toBe("Betreuungszeiten");
    expect(kita.ctaText).toBe("Kennenlernen anfragen");
    expect(kita.placeholders).toEqual(["team"]);
    expect(kita.promptLines.join("\n")).toMatch(/Kita\/Kindergarten\/Krippe/);
    expect(blueprintFor("Tagesmutter").headlines.about).toBe("Über mich");
    const hebamme = blueprintFor("Hebamme", "Hebammenpraxis Mondschein");
    expect(hebamme.promptLines.join("\n")).toMatch(/Heilmittelwerberecht/);
    expect(hebamme.ctaText).toBe("Begleitung anfragen");
    // Kategorie vor Name: eine Kita bleibt Kita, auch mit „Hebamme" im Namen.
    expect(blueprintFor("Kita", "Hebammen-Kita").ctaText).toBe(
      "Kennenlernen anfragen"
    );
  });

  test("Reihenfolge ohne neue Datenfelder (Gesundheit-Reihe)", () => {
    expect(blueprintFor("Kita").order).toEqual(blueprintFor("Zahnarzt").order);
    expect(blueprintFor("Kita").extraSections).toBeUndefined();
  });

  test.each([
    "Tagespflege",
    "Tagespflege für Senioren",
    "adult day care center",
    "dog day care center",
    "Kinderarzt",
    "Kinderheim",
    "Kindermode",
    "Grundschule",
    "school",
    "Krippenbau",
  ])("%s ist keine Kita/Hebamme", category => {
    expect(careFamily(category)).not.toBe("family");
  });
});

describe("Familie Tiere", () => {
  test.each([
    ["Tierarzt", "vet"],
    ["Tierärztin", "vet"],
    ["Tierarztpraxis", "vet"],
    ["Tierärztliche Praxis", "vet"],
    ["Kleintierpraxis", "vet"],
    ["Tierklinik", "vet"],
    ["veterinary_care", "vet"],
    ["Veterinarian", "vet"],
    ["Hundesalon", "grooming"],
    ["Hundefriseur", "grooming"],
    ["Tierfriseur", "grooming"],
    ["dog groomer", "grooming"],
    ["Hundeschule", "school"],
    ["Hundetrainer", "school"],
    ["Tierbedarf", "shop"],
    ["Zoohandlung", "shop"],
    ["Zoofachhandel", "shop"],
    ["pet_store", "shop"],
    ["Tierfuttergeschäft", "shop"],
  ] as const)("%s → pets/%s, Freundlich vorn", (category, kind) => {
    expect(petKind(category)).toBe(kind);
    expect(keywordFamily(category)).toBe("pets");
    expect(resolveIndustryFamily(category)).toBe("pets");
    expect(blueprintFor(category).id).toBe("pets");
    expect(triple(category)[0]).toBe("freundlich");
  });

  test("Tierarzt ≠ Arzt: Arzt, Hausarzt, Zahnarzt, Kinderarzt bleiben Gesundheit/Klar", () => {
    for (const category of [
      "Arzt",
      "Hausarzt",
      "Zahnarzt",
      "Zahnarztpraxis",
      "Kinderarzt",
      "Arztpraxis",
    ]) {
      expect(careFamily(category), category).toBeUndefined();
      expect(resolveIndustryFamily(category), category).toBe("health");
      expect(triple(category)[0], category).toBe("klar");
    }
    expect(triple("Zahnarzt")).toEqual(["klar", "journal", "raster"]);
  });

  test("Tierarzt übernimmt die Tierarzt-Zeilen der Gesundheit (Sprechzeiten, Heilmittelwerberecht)", () => {
    const vet = blueprintFor("Tierarztpraxis", "Praxis am Deich");
    expect(vet.hoursLabel).toBe("Sprechzeiten");
    expect(vet.headlines.testimonials).toBe(
      "Das sagen Tierhalterinnen und Tierhalter"
    );
    expect(vet.promptLines.join("\n")).toMatch(
      /Tierarztpraxis \(Tierarztpraxis\)/
    );
    expect(vet.promptLines.join("\n")).toMatch(/Heilmittelwerberecht/);
  });

  test("Hundesalon: eigener Bauplan statt Friseur-Zeilen", () => {
    const salon = blueprintFor("Hundesalon", "Fellfreunde");
    expect(salon.promptLines.join("\n")).toMatch(/Hundesalon\/Hundefriseur/);
    expect(salon.promptLines.join("\n")).not.toMatch(
      /Damenschnitt|Friseursalon/
    );
    expect(salon.placeholders).toEqual(["pricelist"]);
  });

  test("Hundeschule: Kurse-Bauplan mit Tierhalter-Stimmen", () => {
    const school = blueprintFor("Hundeschule", "Pfotenschule");
    expect(school.ctaText).toBe("Probestunde vereinbaren");
    expect(school.headlines.testimonials).toBe(
      "Das sagen Tierhalterinnen und Tierhalter"
    );
  });

  test("Tierbedarf: Handel-Bauplan (Route, Sortiment)", () => {
    const shop = blueprintFor("Tierbedarf", "Napf & Co");
    expect(shop.ctaAction).toBe("route");
    expect(shop.headlines.services).toBe("Sortiment");
  });

  test.each([
    "Hundepension",
    "Tierpension",
    "Hunde-Pension",
    "Hundehotel",
    "Pension",
  ])("%s bleibt Unterkunft (wie vorher)", category => {
    expect(careFamily(category)).toBeUndefined();
    expect(keywordFamily(category)).toBe("stay");
  });

  test.each([
    "Tierheim",
    "Hundepark",
    "Hundezüchter",
    "Hunde Café",
    "Zoo",
    "Tierpark",
  ])("%s wird nicht Tiere-Familie", category => {
    expect(careFamily(category)).toBeUndefined();
  });
});

describe("Freundliche Unterarten bestehender Familien", () => {
  test("Eiscafé vs. Café: Café bleibt Werkstoff, Eisdiele geht zu Freundlich (dahinter Werkstoff)", () => {
    expect(triple("Café", "Café Muster")).toEqual([
      "werkstoff",
      "journal",
      "plakat",
    ]);
    for (const category of [
      "Eiscafé",
      "Eisdiele",
      "Gelateria",
      "Eissalon",
      "ice_cream_shop",
      "ice cream shop",
    ]) {
      expect(isIceCream(category), category).toBe(true);
      expect(blueprintFor(category).id, category).toBe("gastro");
      expect(blueprintFor(category).gastroKind, category).toBe("cafe");
      expect(triple(category), category).toEqual([
        "freundlich",
        "werkstoff",
        "journal",
      ]);
    }
    // Nur die Kategorie zählt (Review F1): ein Café mit „Eiscafé" im Namen
    // bleibt Café-Reihe.
    expect(triple("Café", "Eiscafé Venezia")[0]).toBe("werkstoff");
    expect(triple("Café", "Café Eisberg")[0]).toBe("werkstoff");
    expect(resolveIndustryFamily("ice cream shop")).toBe("gastro");
    expect(resolveIndustryFamily("Gelateria")).toBe("gastro");
  });

  test("Musikschule vs. Kurse: Musik, Nachhilfe, Kinderkurse Freundlich; Fitness, Tanz, Fahrschule Plakat", () => {
    for (const category of [
      "Musikschule",
      "Musikunterricht",
      "Nachhilfe",
      "Nachhilfeinstitut",
      "Lernstudio",
      "tutoring service",
      "music school",
      "Babyschwimmen",
      "Kinderturnen",
    ]) {
      expect(isKidsLessons(category), category).toBe(true);
      expect(blueprintFor(category).id, category).toBe("courses");
      expect(triple(category), category).toEqual([
        "freundlich",
        "plakat",
        "klar",
      ]);
    }
    for (const category of [
      "Fitnessstudio",
      "Tanzschule",
      "Fahrschule",
      "Yoga",
      "Kampfsport",
      "Sprachschule",
      "Kampfsport für Kinder",
    ]) {
      expect(isKidsLessons(category), category).toBe(false);
      expect(triple(category), category).toEqual(["plakat", "klar", "raster"]);
    }
  });

  test("Kinderfotografie: Freundlich vorn, jeder andere Fotograf bleibt Journal", () => {
    for (const category of [
      "Kinderfotografie",
      "Babyfotografin",
      "Neugeborenenfotograf",
      "Familienfotografie",
      "newborn photographer",
    ]) {
      expect(isKidsPhoto(category), category).toBe(true);
      expect(blueprintFor(category).id, category).toBe("creative");
      expect(triple(category), category).toEqual([
        "freundlich",
        "journal",
        "raster",
      ]);
    }
    for (const category of [
      "Fotograf",
      "Hochzeitsfotograf",
      "Fotostudio",
      "Tattoostudio",
    ])
      expect(triple(category)[0], category).toBe("journal");
  });

  test("Kinderarzt bleibt Klar, Freundlich nur als erste Alternative", () => {
    for (const category of [
      "Kinderarzt",
      "Kinderärztin",
      "Kinder- und Jugendarzt",
      "Kinderzahnarzt",
      "pediatrician",
    ]) {
      expect(isPediatric(category), category).toBe(true);
      expect(blueprintFor(category).id, category).toBe("health");
      expect(triple(category), category).toEqual([
        "klar",
        "freundlich",
        "journal",
      ]);
    }
    expect(isPediatric("Zahnarzt")).toBe(false);
    expect(isPediatric("Arzt")).toBe(false);
  });

  test("Bestand mit gespeicherter alter Familie: Freundlich vorn, dahinter das bisherige Hauptsystem", () => {
    const stored = (
      blueprintFamily: "health" | "beauty" | "courses" | "retail",
      businessCategory: string
    ) =>
      systemsForDoc({
        businessCategory,
        businessName: "Muster",
        blueprintFamily,
      });
    expect(stored("health", "Tierarzt")).toEqual([
      "freundlich",
      "klar",
      "journal",
    ]);
    expect(stored("health", "Hebamme")).toEqual([
      "freundlich",
      "klar",
      "journal",
    ]);
    expect(stored("beauty", "Hundesalon")).toEqual([
      "freundlich",
      "journal",
      "werkstoff",
    ]);
    expect(stored("courses", "Hundeschule")).toEqual([
      "freundlich",
      "plakat",
      "klar",
    ]);
    expect(stored("retail", "Zoohandlung")).toEqual([
      "freundlich",
      "werkstoff",
      "journal",
    ]);
    // Die Nachbarn mit gespeicherter Familie bleiben unverändert.
    expect(stored("health", "Zahnarzt")).toEqual(["klar", "journal", "raster"]);
    expect(stored("beauty", "Friseursalon")).toEqual([
      "journal",
      "nacht",
      "plakat",
    ]);
    expect(stored("retail", "Blumenladen")).toEqual([
      "werkstoff",
      "journal",
      "plakat",
    ]);
  });

  test("alle Freundlich-Reihen: drei verschiedene Systeme", () => {
    const subs = [
      systemsFor("family"),
      systemsFor("pets"),
      ...(["vet", "grooming", "school", "shop"] as const).map(k =>
        systemsFor("pets", { petKind: k })
      ),
      ...(
        ["health", "beauty", "courses", "retail", "gastro", "creative"] as const
      ).map(f => systemsFor(f, { friendly: true })),
      systemsFor("health", { pediatric: true }),
    ];
    for (const t of subs) expect(new Set(t).size).toBe(3);
  });
});

describe("withPrimarySystem: Freundlich freigeschaltet (Rückfall ohne Freundlich: nächstes System der Reihe)", () => {
  const base = getFixture("werkbank", "full");
  const doc = (businessCategory: string, businessName: string) =>
    ({
      ...base,
      businessCategory,
      businessName,
      blueprintFamily: undefined,
      designRevision: 2,
    }) as typeof base;
  const cases: Array<[string, string, DesignSystemId]> = [
    ["Kita", "Kita Pusteblume", "klar"],
    ["Hebamme", "Hebamme Lind", "klar"],
    ["Tierarzt", "Praxis am Deich", "klar"],
    ["Hundesalon", "Fellfreunde", "journal"],
    ["Hundeschule", "Pfotenschule", "plakat"],
    ["Zoohandlung", "Napf & Co", "werkstoff"],
    ["Eisdiele", "Gelato Mio", "werkstoff"],
    ["Musikschule", "Tonleiter", "plakat"],
    ["Kinderfotografie", "Kleine Momente", "journal"],
    ["Kinderarzt", "Dr. Weber", "klar"],
  ];
  const withoutFreundlich = (id: DesignSystemId) =>
    id !== "freundlich" && isReleased(id);
  test("Freundlich ist freigeschaltet", () => {
    expect(isReleased("freundlich")).toBe(true);
  });
  test.each(cases)(
    "%s → %s (ohne Freundlich: %s)",
    (category, name, fallback) => {
      const out = withPrimarySystem(doc(category, name), withoutFreundlich);
      expect(out.system).toBe(fallback);
      expect(out.designRevision).toBe(3);
      expect(WebsiteDataV2Schema.safeParse(out).success).toBe(true);
    }
  );
  test.each(cases.filter(([c]) => c !== "Kinderarzt"))(
    "%s → Freundlich (freigeschaltet)",
    (category, name) => {
      const out = withPrimarySystem(doc(category, name));
      expect(out.system).toBe("freundlich");
      expect(out.designRevision).toBe(3);
      expect(WebsiteDataV2Schema.safeParse(out).success).toBe(true);
    }
  );
  test("Kinderarzt behält Klar als Hauptsystem", () => {
    expect(withPrimarySystem(doc("Kinderarzt", "Dr. Weber")).system).toBe("klar");
  });
  test("Familie im Dokument wird vom Schema angenommen", () => {
    for (const blueprintFamily of ["family", "pets"] as const)
      expect(
        WebsiteDataV2Schema.safeParse({
          ...withPrimarySystem(doc("Kita", "Pusteblume")),
          blueprintFamily,
        }).success
      ).toBe(true);
  });
});

/**
 * Review F1 (2026-10-13): Der Name entscheidet nie über Freundlich — nur die
 * Kategorie. Erwartungen = Stand vor Freundlich (BASE 45687514, Probe
 * scratchpad/f1/probe2.mts): Reihe mit gespeicherter Familie und erstes
 * freigeschaltetes System ohne Familie.
 */
describe("Review F1: Name schaltet keine freundliche Unterart", () => {
  const firstReleased = (t: readonly DesignSystemId[]) => t.find(id => isReleased(id));
  test.each([
    ["Italienisches Restaurant", "Ristorante Gelateria Da Mario", "nacht,journal,werkstoff", "nacht"],
    ["Restaurant", "Gelato & Caffè", "nacht,journal,werkstoff", "nacht"],
    ["Pizzeria", "Pizzeria Gelato", "nacht,journal,werkstoff", "nacht"],
    ["Imbiss", "Döner & Gelato", "plakat,werkstoff,raster", "plakat"],
    ["Arzt", "Dr. Tierarzt", "klar,journal,raster", "klar"],
    ["Fitnessstudio", "Kinderturnen & Fitness", "plakat,klar,raster", "plakat"],
    ["Fahrschule", "Fahrschule & Nachhilfe Meyer", "plakat,klar,raster", "plakat"],
    ["Tanzschule", "Kindertanz Ballerina", "plakat,klar,raster", "plakat"],
    ["Heilpraktiker", "Tierheilpraktikerin Lea", "klar,journal,raster", "klar"],
    ["Fotograf", "Hochzeits- und Familienfotografie Lena", "journal,raster,plakat", "journal"],
    ["Pizzeria", "Pizzeria & Eiscafé Venezia", "werkstoff,journal,plakat", "werkstoff"],
    ["adult day care center", "Muster", "klar,journal,raster", "raster"],
    ["dog day care center", "Muster", "plakat,klar,raster", "raster"],
    ["Seniorenheim", "Tagespflege & Day Care", "journal,nacht,werkstoff", "raster"],
    ["carpet store", "Muster", "werkstoff,journal,plakat", "werkstoff"],
    ["Teppichhandel", "Carpet Shop Orient", "werkstoff,journal,plakat", "werkstoff"],
    ["Bekleidungsgeschäft", "Kinderhaus Mode", "werkstoff,journal,plakat", "werkstoff"],
    ["Gaststätte", "Zur Krippe", "nacht,journal,werkstoff", "nacht"],
    ["Weihnachtsmarkt", "Krippe", "werkstoff,journal,plakat", "werkstoff"],
    ["ice cream equipment supplier", "Muster", "nacht,journal,werkstoff", "raster"],
  ])("%s / %s → unverändert (%s; ohne Familie %s)", (businessCategory, businessName, expected, noFam) => {
    const blueprintFamily = resolveIndustryFamily(businessCategory, businessName);
    expect(systemsForDoc({ businessCategory, businessName, blueprintFamily }).join(",")).toBe(expected);
    expect(firstReleased(systemsForDoc({ businessCategory, businessName }))).toBe(noFam);
    expect(systemsForDoc({ businessCategory, businessName, blueprintFamily })).not.toContain("freundlich");
  });

  test("Eis hinter Freundlich behält die Reihe seiner Gastro-Art", () => {
    expect(systemsFor("gastro", { gastroKind: "cafe", friendly: true })).toEqual(["freundlich", "werkstoff", "journal"]);
    expect(systemsFor("gastro", { gastroKind: "restaurant", friendly: true })).toEqual(["freundlich", "nacht", "journal"]);
    expect(systemsFor("gastro", { gastroKind: "imbiss", friendly: true })).toEqual(["freundlich", "plakat", "werkstoff"]);
  });

  test("Freundlich-Familie nie über den Namen allein", () => {
    expect(keywordFamily("Dienstleistung", "Hundesalon Struppi")).toBeUndefined();
    expect(keywordFamily("Seniorenheim", "Tagespflege & Day Care")).not.toBe("family");
  });

  test("ice cream equipment supplier ist kein Eis-Betrieb (B2B)", () => {
    expect(isIceCream("ice cream equipment supplier")).toBe(false);
    expect(isIceCream("Eismaschinen Großhandel")).toBe(false);
    expect(blueprintFor("ice cream equipment supplier").gastroKind).not.toBe("cafe");
  });
});

describe("Review F1: Erkennungslücken", () => {
  test.each(["Pferdeklinik", "Hundephysiotherapie", "Hunde-Physiotherapie", "Pferdephysiotherapie", "Pferde Physiotherapie"])(
    "%s → Tierarzt-Unterart",
    category => {
      expect(petKind(category)).toBe("vet");
      expect(blueprintFor(category).id).toBe("pets");
      expect(blueprintFor(category).hoursLabel).toBe("Sprechzeiten");
    }
  );
  test.each(["Hundefutter", "Tiernahrung", "Katzenfutter"])("%s → Tierbedarf", category => {
    expect(petKind(category)).toBe("shop");
  });
  test.each(["Krabbelgruppe", "Babymassage"])("%s → Kinder & Familie", category => {
    expect(careFamily(category)).toBe("family");
  });
  test("Physiotherapie ohne Tier bleibt Gesundheit", () => {
    expect(petKind("Physiotherapie")).toBeUndefined();
    expect(blueprintFor("Physiotherapie").id).toBe("health");
  });
  test("Tierarzt-Bauplan ohne Namens-Trick: Prompt nennt nur die Kategorie", () => {
    const vet = blueprintFor("Tierphysiotherapie", "Lea Sommer");
    expect(vet.promptLines.join("\n")).toMatch(/Branche: Tierarztpraxis \(Tierphysiotherapie\)/);
  });
});
