import { describe, expect, it } from "vitest";
import { blueprintFor, withBlueprint } from "./blueprints";
import { getFixture } from "../siteContract/fixtures";
import { renderSiteHtml } from "../../server/ssr/renderSite";
import { withEntryComposition } from "./artDirection";
import { DEFAULT_DESIGN_PROFILE } from "../siteContract/designProfile";

describe("blueprintFor", () => {
  it("erkennt Friseure, Barbiere und Kosmetik als eine Gruppe", () => {
    for (const category of [
      "Friseursalon",
      "Barbershop",
      "Barbier",
      "Kosmetikstudio",
      "Nagelstudio",
      "Schönheitssalon",
    ])
      expect(blueprintFor(category).id).toBe("beauty");
    expect(blueprintFor(undefined).id).toBe("standard");
    expect(blueprintFor("Naturschutzbund").id).toBe("standard");
  });

  it("schärft die Unterart über den Namen", () => {
    expect(blueprintFor("Friseursalon", "H&B Barber").headlines.about).toBe(
      "Über den Laden"
    );
    expect(
      blueprintFor("Schönheitssalon", "BeautyCase - Elite Cosmetics").headlines
        .about
    ).toBe("Über das Studio");
    expect(blueprintFor("Friseursalon", "Haarem").headlines.about).toBe(
      "Über den Salon"
    );
  });
});

describe("Bauplan Handwerk", () => {
  it("erkennt Gewerke über Kategorie oder Name", () => {
    for (const category of [
      "Tischlerei",
      "Elektriker",
      "Malerbetrieb",
      "Sanitär- und Heizungsinstallateur",
      "Dachdecker",
    ])
      expect(blueprintFor(category).id).toBe("trade");
    // Google führt die Tischlerei Klähn als „Hersteller"
    expect(blueprintFor("Hersteller", "Tischlerei Klähn").id).toBe("trade");
    expect(blueprintFor("Hersteller", "Brotfabrik").id).toBe("industry");
  });

  it("schreibt einen Ablauf und fragt Angebote an", () => {
    const trade = blueprintFor("Tischlerei");
    expect(trade.extraSections).toEqual(["process"]);
    expect(trade.contactMode).toBe("inquiry");
    expect(trade.ctaText).toBe("Angebot anfragen");
    expect(trade.promptLines.join(" ")).not.toContain("Notdienst");
    expect(blueprintFor("Elektriker").promptLines.join(" ")).toContain(
      "Notdienst"
    );
  });
});

describe("withBlueprint", () => {
  it("setzt Überschriften der Branche statt Pack-Vokabular", () => {
    const doc = getFixture("patina", "full");
    const next = withBlueprint(
      {
        ...doc,
        sections: doc.sections.map(s =>
          s.type === "about" ? { ...s, headline: "Das Handwerk im Journal" } : s
        ),
      },
      blueprintFor("Barbershop")
    );
    const about = next.sections.find(s => s.type === "about");
    expect(about && "headline" in about && about.headline).toBe(
      "Über den Laden"
    );
  });

  it("lässt Standard-Branchen unverändert", () => {
    const doc = getFixture("werkbank", "full");
    expect(withBlueprint(doc, blueprintFor("Naturschutzbund"))).toBe(doc);
  });

  it("sortiert Handwerk: Referenzen und Ablauf vor dem Betrieb", () => {
    const doc = getFixture("werkbank", "full");
    const next = withBlueprint(doc, blueprintFor("Tischlerei"));
    const types = next.sections.map(s => s.type);
    expect(types[0]).toBe("hero");
    expect(types.indexOf("gallery")).toBeLessThan(types.indexOf("about"));
    expect(types.indexOf("contact")).toBeGreaterThan(types.indexOf("faq"));
  });
});

describe("Platzhalter für Preise und Team", () => {
  const doc = (() => {
    const base = getFixture("morgenlicht", "full");
    return {
      ...base,
      businessCategory: "Friseursalon",
      designRevision: 2 as const,
      designProfile: withEntryComposition(
        { ...DEFAULT_DESIGN_PROFILE, composition: "portrait" },
        {
          heroLandscape: false,
          extraPhotos: 3,
        }
      ),
      sections: base.sections.filter(
        s => s.type !== "pricelist" && s.type !== "team"
      ),
    };
  })();

  it("zeigt sie in der Vorschau", () => {
    const { html } = renderSiteHtml(doc, {
      origin: "https://pageblitz.de",
      slug: "test",
      islandsMode: "preview",
    });
    expect(html).toContain("Deine Preise");
    expect(html).toContain("Euer Team");
    expect(html).toContain('id="kontakt"');
    expect(html).toContain('data-pb-slot="gallery-items"');
  });

  it("zeigt sie nie auf der Live-Seite", () => {
    const { html } = renderSiteHtml(doc, {
      origin: "https://pageblitz.de",
      slug: "test",
    });
    expect(html).not.toContain("Nur in deiner Vorschau");
    expect(html).not.toContain("Deine Preise");
  });
});

describe("Handwerk-Seite", () => {
  const base = getFixture("werkbank", "full");
  const doc = {
    ...base,
    businessName: "Tischlermeister Klähn",
    businessCategory: "Tischlerei",
    designRevision: 2 as const,
    designProfile: withEntryComposition(
      { ...DEFAULT_DESIGN_PROFILE, composition: "portrait" },
      { heroLandscape: false, extraPhotos: 3 }
    ),
    sections: [
      ...base.sections.filter(s => s.type !== "team"),
      {
        type: "process" as const,
        headline: "So läuft's ab",
        steps: [
          { title: "Anfrage", text: "Sie schildern Ihr Vorhaben." },
          { title: "Termin vor Ort", text: "Wir messen auf." },
        ],
      },
    ],
  };
  const render = (preview: boolean) =>
    renderSiteHtml(doc as typeof base, {
      origin: "https://pageblitz.de",
      slug: "test",
      ...(preview ? { islandsMode: "preview" as const } : {}),
    }).html;

  it("zeigt Vertrauensleiste, Ablauf und Anfrage statt Besuch", () => {
    const html = render(false);
    expect(html).toContain("pb-entry-trust");
    expect(html).toContain("Meisterbetrieb");
    expect(html).toContain("pb-entry-steps");
    expect(html).toContain('data-mode="inquiry"');
    expect(html).toContain("Angebot anfragen");
  });

  it("zeigt den Team-Platzhalter nur in der Vorschau", () => {
    expect(render(true)).toContain("Euer Team");
    expect(render(false)).not.toContain("Euer Team");
  });
});

describe("Bauplan Gastro", () => {
  it("erkennt Restaurant, Imbiss und Café/Bäckerei", () => {
    expect(blueprintFor("Restaurant").gastroKind).toBe("restaurant");
    expect(blueprintFor("Pizzeria").gastroKind).toBe("restaurant");
    expect(blueprintFor("Imbiss").gastroKind).toBe("imbiss");
    expect(blueprintFor("Restaurant", "Döner Haus").gastroKind).toBe("imbiss");
    expect(blueprintFor("Café").gastroKind).toBe("cafe");
    expect(blueprintFor("Bäckerei").gastroKind).toBe("cafe");
    expect(blueprintFor("Friseursalon").id).toBe("beauty");
  });

  it("verwirft die vom Modell erfundene Speisekarte samt Extra", () => {
    const base = getFixture("gusto", "full");
    const doc = {
      ...base,
      addOns: { ...(base.addOns ?? {}), menu: true },
      sections: base.sections.some(s => s.type === "menu")
        ? base.sections
        : [
            ...base.sections,
            {
              type: "menu" as const,
              categories: [
                {
                  name: "Pizza",
                  items: [{ name: "Margherita", price: "9 €" }],
                },
              ],
            },
          ],
    };
    const next = withBlueprint(doc, blueprintFor("Restaurant"));
    expect(next.sections.some(s => s.type === "menu")).toBe(false);
    expect(next.addOns?.menu).not.toBe(true);
  });

  it("setzt die Hauptaktion fest: Restaurant ruft an, Café zeigt die Route", () => {
    const base = getFixture("gusto", "full");
    const withPhone = {
      ...base,
      sections: base.sections.map(s =>
        s.type === "contact"
          ? { ...s, phone: "02871 488882", zip: "46395", city: "Bocholt" }
          : s
      ),
    };
    const hero = (d: typeof base) =>
      d.sections.find(s => s.type === "hero") as {
        ctaText?: string;
        ctaHref?: string;
      };
    const restaurant = hero(
      withBlueprint(withPhone, blueprintFor("Restaurant"))
    );
    expect(restaurant.ctaText).toBe("Tisch reservieren");
    expect(restaurant.ctaHref).toBe("tel:02871488882");
    const cafe = hero(withBlueprint(withPhone, blueprintFor("Café")));
    expect(cafe.ctaText).toBe("Route planen");
    expect(cafe.ctaHref).toMatch(/^https:\/\/www\.google\.com\/maps/);
  });

  it("zeigt den Karten-Platzhalter nur in der Vorschau, Google-Angaben in der Leiste", () => {
    const base = getFixture("gusto", "full");
    const doc = {
      ...base,
      businessCategory: "Restaurant",
      amenities: { reservable: true, takeout: true, vegetarian: true },
      addOns: { ...(base.addOns ?? {}), menu: false },
      designRevision: 2 as const,
      designProfile: withEntryComposition(
        { ...DEFAULT_DESIGN_PROFILE, composition: "portrait" },
        { heroLandscape: false, extraPhotos: 3 }
      ),
    };
    const render = (preview: boolean) =>
      renderSiteHtml(doc as typeof base, {
        origin: "https://pageblitz.de",
        slug: "test",
        ...(preview ? { islandsMode: "preview" as const } : {}),
      }).html;
    expect(render(true)).toContain('data-placeholder="yes"');
    expect(render(false)).not.toContain('data-placeholder="yes"');
    expect(render(false)).toContain("Reservierung");
    expect(render(false)).toContain("Zum Mitnehmen");
  });
});

describe("Branchenfamilien", () => {
  it("ordnet typische Google-Kategorien ihrer Familie zu", () => {
    const cases: Record<string, string> = {
      Zahnarztpraxis: "health",
      Physiotherapeut: "health",
      Tierarzt: "health",
      Steuerberater: "advice",
      Rechtsanwalt: "advice",
      Immobilienmakler: "advice",
      Blumengeschäft: "retail",
      Optiker: "retail",
      Autowerkstatt: "auto",
      Reifenhändler: "auto",
      Fitnessstudio: "courses",
      Fahrschule: "courses",
      Hotel: "stay",
      Ferienwohnung: "stay",
      Fotograf: "creative",
      Tattoostudio: "creative",
      Taxiunternehmen: "urgent",
      Schlüsseldienst: "urgent",
      Gebäudereinigung: "trade",
      Elektronikgeschäft: "retail",
    };
    for (const [category, family] of Object.entries(cases))
      expect([category, blueprintFor(category).id]).toEqual([category, family]);
  });

  it("nimmt die gespeicherte Familie vor den Stichwörtern", () => {
    expect(blueprintFor("Holzhaus", "", "trade").id).toBe("trade");
    expect(blueprintFor("Holzhaus").id).toBe("standard");
  });

  it("verbietet Heilversprechen im Bauplan Gesundheit", () => {
    expect(blueprintFor("Physiotherapeut").promptLines.join(" ")).toContain(
      "Heilversprechen"
    );
    expect(blueprintFor("Zahnarztpraxis").ctaText).toBe("Termin vereinbaren");
  });
});
