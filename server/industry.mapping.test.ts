import { describe, it, expect } from "vitest";
import { getIndustryProfile, getIndustryServicesSeed, INDUSTRY_PROFILES } from "@shared/industryServices";

describe("getIndustryProfile", () => {
  it("returns correct profile for exact key match", () => {
    const profile = getIndustryProfile("friseur");
    expect(profile).not.toBeNull();
    expect(profile?.label).toBe("Friseur");
    expect(profile?.services.length).toBeGreaterThanOrEqual(4);
    expect(profile?.ctaText).toBe("Termin buchen");
  });

  it("returns correct profile for case-insensitive match", () => {
    const profile = getIndustryProfile("RESTAURANT");
    expect(profile).not.toBeNull();
    expect(profile?.label).toBe("Restaurant");
  });

  it("returns correct profile for partial match (label contains category)", () => {
    const profile = getIndustryProfile("Arzt");
    expect(profile).not.toBeNull();
    expect(profile?.label).toBe("Arzt / Zahnarzt");
  });

  it("returns correct profile for partial match (category contains key)", () => {
    const profile = getIndustryProfile("Fitness-Studio München");
    expect(profile).not.toBeNull();
    expect(profile?.label).toBe("Fitness-Studio");
  });

  it("returns null for unknown category", () => {
    const profile = getIndustryProfile("Mondkolonie");
    expect(profile).toBeNull();
  });

  it("returns null for empty string", () => {
    const profile = getIndustryProfile("");
    expect(profile).toBeNull();
  });

  it("all profiles have at least 4 services", () => {
    for (const profile of INDUSTRY_PROFILES) {
      expect(profile.services.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("all profiles have required fields", () => {
    for (const profile of INDUSTRY_PROFILES) {
      expect(profile.key).toBeTruthy();
      expect(profile.label).toBeTruthy();
      expect(profile.ctaText).toBeTruthy();
      expect(profile.heroHint).toBeTruthy();
      expect(profile.aboutFocus).toBeTruthy();
      expect(profile.features.length).toBeGreaterThan(0);
    }
  });
});

describe("getIndustryServicesSeed", () => {
  it("returns non-empty seed for known category", () => {
    const seed = getIndustryServicesSeed("restaurant");
    expect(seed).toContain("BRANCHENSPEZIFISCHE LEISTUNGEN");
    expect(seed).toContain("RESTAURANT");
    expect(seed).toContain("Mittagsmenü");
  });

  it("returns empty string for unknown category", () => {
    const seed = getIndustryServicesSeed("Mondkolonie");
    expect(seed).toBe("");
  });

  it("includes features and CTA hint", () => {
    const seed = getIndustryServicesSeed("friseur");
    expect(seed).toContain("Termin buchen");
    expect(seed).toContain("Haarschnitt");
  });

  it("works for all 16 industry profiles", () => {
    for (const profile of INDUSTRY_PROFILES) {
      const seed = getIndustryServicesSeed(profile.key);
      expect(seed.length).toBeGreaterThan(100);
      expect(seed).toContain(profile.label.toUpperCase());
    }
  });
});
