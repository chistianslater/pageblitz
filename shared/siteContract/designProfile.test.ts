import { describe, expect, test } from "vitest";
import {
  DEFAULT_DESIGN_PROFILE,
  deriveDesignProfile,
  deriveDistinctDesignProfile,
  designFingerprint,
  designSeed,
} from "./designProfile";

const BASE = {
  businessName: "Schreinerei Brandt",
  businessCategory: "Schreinerei",
  sections: [
    {
      type: "hero",
      headline: "Massarbeit aus Holz. Punkt.",
      imageUrl: "https://example.com/hero.jpg",
    },
    {
      type: "services",
      items: Array.from({ length: 6 }, (_, i) => ({ title: `Leistung ${i}` })),
    },
    { type: "about", imageUrl: "https://example.com/about.jpg" },
    {
      type: "gallery",
      images: Array.from({ length: 6 }, (_, i) => ({ url: `${i}.jpg` })),
    },
    { type: "contact" },
    { type: "testimonials" },
    { type: "faq" },
  ],
};

describe("DesignProfile", () => {
  test("Default erhält bestehende Websites beim bisherigen Aufbau", () => {
    expect(DEFAULT_DESIGN_PROFILE).toEqual({
      version: 1,
      heroLayout: "split",
      servicesLayout: "list",
      aboutLayout: "image-right",
      galleryLayout: "grid",
      density: "airy",
      imageTreatment: "natural",
      seed: 0,
    });
  });

  test("Ableitung ist deterministisch und inhaltsbasiert", () => {
    const a = deriveDesignProfile(BASE);
    const b = deriveDesignProfile(BASE);
    expect(a).toEqual(b);
    expect(a.servicesLayout).toBe("grid"); // 6 Leistungen
    expect(a.galleryLayout).toBe("mosaic"); // 6 Bilder
    expect(a.density).toBe("compact"); // 7 Sektionen
  });

  test("Hero ohne Bild wird zentriert, kleine Leistungsliste hervorgehoben", () => {
    const profile = deriveDesignProfile({
      businessName: "Beratung Klar",
      sections: [
        { type: "hero", headline: "Klar beraten." },
        { type: "services", items: [{}, {}, {}] },
      ],
    });
    expect(profile.heroLayout).toBe("centered");
    expect(profile.servicesLayout).toBe("featured");
    expect(profile.imageTreatment).toBe("natural");
  });

  test("Kollisionsschutz probiert einen anderen Salt", () => {
    const first = deriveDesignProfile(BASE, 0);
    const occupied = new Set([
      designFingerprint({ stylePackId: "werkbank", profile: first }),
    ]);
    const next = deriveDistinctDesignProfile(
      { ...BASE, stylePackId: "werkbank" },
      occupied
    );
    expect(
      designFingerprint({ stylePackId: "werkbank", profile: next })
    ).not.toBe(
      designFingerprint({ stylePackId: "werkbank", profile: first })
    );
  });

  test("Hash ist stabil und Fingerprint ignoriert den reinen Seed", () => {
    expect(designSeed("Pageblitz")).toBe(designSeed("Pageblitz"));
    const a = { ...DEFAULT_DESIGN_PROFILE, seed: 1 };
    const b = { ...DEFAULT_DESIGN_PROFILE, seed: 999 };
    expect(designFingerprint({ stylePackId: "werkbank", profile: a })).toBe(
      designFingerprint({ stylePackId: "werkbank", profile: b })
    );
  });
});
