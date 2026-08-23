import { describe, expect, it } from "vitest";
import { parseGmbAddress } from "./address";

describe("parseGmbAddress", () => {
  it("bevorzugt address_components (Straße, PLZ, Stadt)", () => {
    const result = parseGmbAddress(
      [
        { long_name: "19", short_name: "19", types: ["street_number"] },
        {
          long_name: "Zum Waldschlösschen",
          short_name: "Zum Waldschlösschen",
          types: ["route"],
        },
        {
          long_name: "Bocholt",
          short_name: "Bocholt",
          types: ["locality", "political"],
        },
        {
          long_name: "46395",
          short_name: "46395",
          types: ["postal_code"],
        },
        {
          long_name: "Deutschland",
          short_name: "DE",
          types: ["country", "political"],
        },
      ],
      "Zum Waldschlösschen 19, 46395 Bocholt, Deutschland"
    );
    expect(result).toEqual({
      street: "Zum Waldschlösschen 19",
      zip: "46395",
      city: "Bocholt",
    });
  });

  it("fällt auf den formatted_address-Regex zurück", () => {
    expect(
      parseGmbAddress(
        undefined,
        "Zum Waldschlösschen 19, 46395 Bocholt, Deutschland"
      )
    ).toEqual({
      street: "Zum Waldschlösschen 19",
      zip: "46395",
      city: "Bocholt",
    });
  });

  it("liefert Teilergebnisse, wenn Komponenten fehlen", () => {
    const result = parseGmbAddress([
      {
        long_name: "Bocholt",
        short_name: "Bocholt",
        types: ["locality", "political"],
      },
    ]);
    expect(result).toEqual({ city: "Bocholt" });
  });

  it("liefert leeres Objekt bei unparsebarer Adresse", () => {
    expect(parseGmbAddress(undefined, "Irgendwo im Nirgendwo")).toEqual({});
    expect(parseGmbAddress()).toEqual({});
  });

  it("nutzt postal_town/sublocality als Stadt-Fallback", () => {
    const result = parseGmbAddress([
      {
        long_name: "Hamburg",
        short_name: "Hamburg",
        types: ["postal_town"],
      },
    ]);
    expect(result).toEqual({ city: "Hamburg" });
  });
});
