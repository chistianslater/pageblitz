import { describe, expect, it } from "vitest";
import { GENERIC_GMB_TYPES, resolveGmbCategory } from "./category";

describe("resolveGmbCategory", () => {
  it("nutzt primaryTypeDisplayName als beste Quelle", () => {
    expect(
      resolveGmbCategory({
        primaryTypeDisplayName: "Werbeagentur",
        types: ["advertising_agency", "point_of_interest", "establishment"],
      })
    ).toBe("Werbeagentur");
  });

  it("ignoriert generische primaryTypeDisplayName-Werte (z. B. »Services«)", () => {
    // Realer v1-Befund für ChIJ255gMPZ9uEcRX0-LHl2mTl8: primaryTypeDisplayName
    // = "Services" — generisch, darf die Kette nicht gewinnen.
    expect(
      resolveGmbCategory({
        primaryTypeDisplayName: "Services",
        types: ["consultant", "store", "point_of_interest", "establishment"],
      })
    ).toBe("Beratung");
    expect(
      resolveGmbCategory({
        primaryTypeDisplayName: "Dienstleistungen",
        types: ["point_of_interest", "establishment"],
      })
    ).toBeNull();
  });

  it("mappt spezifische Google-Types auf deutsche Kategorien", () => {
    expect(
      resolveGmbCategory({
        types: ["hair_care", "point_of_interest", "establishment"],
      })
    ).toBe("Friseursalon");
    expect(resolveGmbCategory({ types: ["plumber"] })).toBe(
      "Sanitär & Heizung"
    );
    expect(resolveGmbCategory({ types: ["bakery", "food", "store"] })).toBe(
      "Bäckerei"
    );
  });

  it("mappt Hotel- und Beherbergungs-Types, lodging hinter spezifischeren Types", () => {
    expect(resolveGmbCategory({ types: ["hotel"] })).toBe("Hotel");
    expect(resolveGmbCategory({ types: ["lodging"] })).toBe(
      "Hotel & Unterkunft"
    );
    expect(
      resolveGmbCategory({
        types: ["lodging", "hotel", "point_of_interest", "establishment"],
      })
    ).toBe("Hotel");
    expect(resolveGmbCategory({ types: ["bed_and_breakfast"] })).toBe(
      "Pension"
    );
    expect(resolveGmbCategory({ types: ["extended_stay_hotel"] })).toBe(
      "Boardinghouse"
    );
    expect(resolveGmbCategory({ types: ["guest_house"] })).toBe("Gästehaus");
  });

  it("überspringt unbekannte spezifische Types und nimmt den nächsten gemappten", () => {
    expect(
      resolveGmbCategory({
        types: ["obscure_unmapped_type", "restaurant", "establishment"],
      })
    ).toBe("Restaurant");
  });

  it("SCHAU-&-HORCH-Fall: nur generische Types + kein v1 → null (nie der Firmenname)", () => {
    expect(
      resolveGmbCategory({
        types: ["point_of_interest", "establishment", "store"],
        editorialSummary: "Werbeagentur in Bocholt",
      })
    ).toBeNull();
  });

  it("liefert null bei leeren/fehlenden Eingaben", () => {
    expect(resolveGmbCategory({})).toBeNull();
    expect(resolveGmbCategory({ types: [] })).toBeNull();
    expect(resolveGmbCategory({ primaryTypeDisplayName: "  " })).toBeNull();
  });

  it("bevorzugt spezifische Beherbergungs-Types vor generischem lodging", () => {
    expect(
      resolveGmbCategory({
        types: ["lodging", "hotel", "point_of_interest", "establishment"],
      })
    ).toBe("Hotel");
    expect(
      resolveGmbCategory({
        types: ["lodging", "bed_and_breakfast", "establishment"],
      })
    ).toBe("Pension");
    expect(resolveGmbCategory({ types: ["lodging"] })).toBe(
      "Hotel & Unterkunft"
    );
  });

  it("GENERIC_GMB_TYPES enthält die bekannten Catch-all-Types", () => {
    for (const t of ["establishment", "point_of_interest", "store", "food"]) {
      expect(GENERIC_GMB_TYPES.has(t)).toBe(true);
    }
    expect(GENERIC_GMB_TYPES.has("hair_care")).toBe(false);
  });
});
