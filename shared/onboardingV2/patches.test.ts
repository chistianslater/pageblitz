import { describe, expect, test } from "vitest";
import {
  AddonsPatchSchema,
  ImagesPatchSchema,
  LegalPatchSchema,
  OfferPatchSchema,
  TeamPatchSchema,
  TextsPatchSchema,
} from "./patches";

describe("ImagesPatchSchema", () => {
  test("akzeptiert gültige http(s)-URLs", () => {
    const result = ImagesPatchSchema.safeParse({
      hero: "https://x/h.jpg",
      gallery: [{ url: "https://x/g.jpg", alt: "Werkstatt" }],
    });
    expect(result.success).toBe(true);
  });

  test("lehnt javascript:-URL ab", () => {
    const result = ImagesPatchSchema.safeParse({ hero: "javascript:alert(1)" });
    expect(result.success).toBe(false);
  });
});

describe("TextsPatchSchema", () => {
  test("akzeptiert Teilmenge gültiger Felder", () => {
    const result = TextsPatchSchema.safeParse({
      headline: "Neu",
      seoTitle: "SEO",
    });
    expect(result.success).toBe(true);
  });

  test("lehnt zu lange headline ab", () => {
    const result = TextsPatchSchema.safeParse({ headline: "x".repeat(121) });
    expect(result.success).toBe(false);
  });
});

describe("OfferPatchSchema", () => {
  test("akzeptiert services mit mindestens einem Item", () => {
    const result = OfferPatchSchema.safeParse({
      mode: "services",
      headline: "Leistungen",
      items: [{ title: "A" }],
    });
    expect(result.success).toBe(true);
  });

  test("lehnt services ohne items ab", () => {
    const result = OfferPatchSchema.safeParse({
      mode: "services",
      headline: "Leistungen",
      items: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("LegalPatchSchema", () => {
  test("akzeptiert vollständige, gültige Angaben", () => {
    const result = LegalPatchSchema.safeParse({
      legalOwner: "Max Mustermann",
      legalStreet: "Musterstraße 1",
      legalZip: "12345",
      legalCity: "Berlin",
      legalEmail: "max@example.com",
      legalPhone: "0123456789",
    });
    expect(result.success).toBe(true);
  });

  test("lehnt ungültige PLZ ab", () => {
    const result = LegalPatchSchema.safeParse({
      legalOwner: "Max Mustermann",
      legalStreet: "Musterstraße 1",
      legalZip: "1234",
      legalCity: "Berlin",
      legalEmail: "max@example.com",
      legalPhone: "0123456789",
    });
    expect(result.success).toBe(false);
  });
});

describe("TeamPatchSchema", () => {
  test("akzeptiert Mitglieder mit Name (Pflicht), Rolle/Foto optional", () => {
    const result = TeamPatchSchema.safeParse({
      headline: "Unser Team",
      members: [
        { name: "Anna Beispiel", role: "Meisterin" },
        { name: "Ben Beispiel", imageUrl: "https://x/b.jpg" },
      ],
    });
    expect(result.success).toBe(true);
  });

  test("akzeptiert leere Mitgliederliste (Sektion wird beim Anwenden entfernt)", () => {
    const result = TeamPatchSchema.safeParse({ members: [] });
    expect(result.success).toBe(true);
  });

  test("lehnt Mitglied ohne Namen ab", () => {
    const result = TeamPatchSchema.safeParse({
      members: [{ name: "" }],
    });
    expect(result.success).toBe(false);
  });

  test("lehnt mehr als 12 Mitglieder ab", () => {
    const result = TeamPatchSchema.safeParse({
      members: Array.from({ length: 13 }, (_, i) => ({ name: `M${i}` })),
    });
    expect(result.success).toBe(false);
  });

  test("lehnt javascript:-URL im Foto ab", () => {
    const result = TeamPatchSchema.safeParse({
      members: [{ name: "Anna", imageUrl: "javascript:alert(1)" }],
    });
    expect(result.success).toBe(false);
  });

  test("lehnt Fremdfeld ab (strict)", () => {
    const result = TeamPatchSchema.safeParse({
      members: [{ name: "Anna" }],
      extra: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("AddonsPatchSchema", () => {
  test("akzeptiert alle sieben bekannten Flags", () => {
    const result = AddonsPatchSchema.safeParse({
      contactForm: true,
      gallery: false,
      menu: false,
      pricelist: false,
      aiChat: true,
      booking: false,
      team: false,
    });
    expect(result.success).toBe(true);
  });

  test("lehnt Fremdfeld ab (strict)", () => {
    const result = AddonsPatchSchema.safeParse({
      contactForm: true,
      gallery: false,
      menu: false,
      pricelist: false,
      aiChat: true,
      booking: false,
      team: false,
      extra: true,
    });
    expect(result.success).toBe(false);
  });
});
