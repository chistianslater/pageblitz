import { describe, expect, test } from "vitest";
import {
  AddonsPatchSchema,
  ImagesPatchSchema,
  LegalPatchSchema,
  OfferPatchSchema,
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
    const result = TextsPatchSchema.safeParse({ headline: "Neu", seoTitle: "SEO" });
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
