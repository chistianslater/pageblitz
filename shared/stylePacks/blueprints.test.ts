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
    expect(blueprintFor("Tischlerei").id).toBe("standard");
    expect(blueprintFor(undefined).id).toBe("standard");
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
    expect(withBlueprint(doc, blueprintFor("Tischlerei"))).toBe(doc);
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
