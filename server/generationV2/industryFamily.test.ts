import { describe, expect, it } from "vitest";
import { categoryKey, resolveIndustryFamily } from "./industryFamily";
import { CATEGORY_FAMILIES } from "./categoryFamilies";

describe("resolveIndustryFamily", () => {
  it("kennt die Google-Kategorien aus der Tabelle (deutsch und englisch)", () => {
    expect(Object.keys(CATEGORY_FAMILIES).length).toBeGreaterThan(6000);
    expect(resolveIndustryFamily("Daihatsu-Autohaus")).toBe("auto");
    expect(resolveIndustryFamily("car dealer")).toBe("auto");
    expect(resolveIndustryFamily("Kieferorthopäde")).toBe("health");
  });

  it("fällt auf Stichwörter und dann auf den KI-Branchenschlüssel zurück", () => {
    expect(resolveIndustryFamily("Allgemeinmediziner")).toBe("health");
    expect(resolveIndustryFamily("Holzhaus")).toBe("standard");
    expect(resolveIndustryFamily("Holzhaus", "", "handwerk")).toBe("trade");
    expect(resolveIndustryFamily("", "", "fitness")).toBe("courses");
  });

  it("normalisiert Schreibweisen", () => {
    expect(categoryKey("  Kfz-Werkstatt ")).toBe("kfz werkstatt");
  });
});

describe("Betrieb & Industrie", () => {
  it("ordnet Hersteller und Großhandel zu, ohne Handwerker zu verlieren", () => {
    expect(resolveIndustryFamily("Getränkegroßhandel")).toBe("industry");
    expect(resolveIndustryFamily("furniture manufacturer")).toBe("industry");
    expect(resolveIndustryFamily("Hersteller", "Tischlerei Klähn")).toBe(
      "trade"
    );
    expect(resolveIndustryFamily("Anlagenservice")).toBe("industry");
  });
});
