import { describe, expect, test } from "vitest";
import { WebsiteDataV2Schema } from "./schema";
import { getFixture } from "./fixtures";

const base = getFixture("salon-noir", "full");

describe("Seitenvertrag rev 3", () => {
  test("akzeptiert rev 3 mit System und Palette", () => {
    const r = WebsiteDataV2Schema.safeParse({
      ...base, designRevision: 3, system: "journal", palette: "papier",
    });
    expect(r.success).toBe(true);
  });
  test("lehnt unbekanntes System ab", () => {
    const r = WebsiteDataV2Schema.safeParse({
      ...base, designRevision: 3, system: "barock", palette: "papier",
    });
    expect(r.success).toBe(false);
  });
  test("lehnt Palette mit Sonderzeichen ab", () => {
    const r = WebsiteDataV2Schema.safeParse({
      ...base, designRevision: 3, system: "journal", palette: "x;color:red",
    });
    expect(r.success).toBe(false);
  });
  test("rev 3 ohne System ist ungültig", () => {
    expect(WebsiteDataV2Schema.safeParse({ ...base, designRevision: 3 }).success).toBe(false);
  });
  test("System ohne rev 3 ist ungültig", () => {
    expect(
      WebsiteDataV2Schema.safeParse({ ...base, designRevision: 2, system: "journal" }).success
    ).toBe(false);
  });
});

describe("designProfile.photoTreatment (Plakat-Fotos, 2026-10-13)", () => {
  const rev3 = { ...base, designRevision: 3, system: "plakat", palette: "kante" };
  const profile = {
    version: 1, heroLayout: "split", servicesLayout: "list", aboutLayout: "image-right",
    galleryLayout: "grid", density: "airy", imageTreatment: "natural", seed: 0,
  };
  test("alte Stände ohne Feld bleiben gültig", () => {
    expect(WebsiteDataV2Schema.safeParse({ ...rev3, designProfile: profile }).success).toBe(true);
  });
  test.each(["tinted", "original"])("%s ist gültig", value => {
    const r = WebsiteDataV2Schema.safeParse({
      ...rev3, designProfile: { ...profile, photoTreatment: value },
    });
    expect(r.success).toBe(true);
  });
  test("unbekannter Wert ist ungültig", () => {
    const r = WebsiteDataV2Schema.safeParse({
      ...rev3, designProfile: { ...profile, photoTreatment: "sepia" },
    });
    expect(r.success).toBe(false);
  });
});
