import { describe, expect, test, vi } from "vitest";
import {
  reverseGeocodeCity,
  searchAutocompleteCity,
  searchGmbPublic,
} from "./startSearch";
import type { PlacesSearchResult } from "./_core/map";

const DORTMUND = { lat: 51.5136, lng: 7.4653 };
const BOCHOLT = { lat: 51.8388, lng: 6.6153 };
const MUENCHEN = { lat: 48.1372, lng: 11.5755 };

function place(
  id: string,
  name: string,
  loc: { lat: number; lng: number },
  address: string
): PlacesSearchResult["results"][number] {
  return {
    place_id: id,
    name,
    formatted_address: address,
    geometry: { location: loc },
    types: ["establishment"],
    rating: 4.5,
    user_ratings_total: 10,
  };
}

describe("searchGmbPublic", () => {
  test("ohne Koordinaten: kein location-Bias, Google-Reihenfolge bleibt", async () => {
    const request = vi.fn(async () => ({
      status: "OK",
      results: [
        place("m", "Filiale München", MUENCHEN, "München"),
        place("b", "Filiale Bocholt", BOCHOLT, "Bocholt"),
      ],
    }));
    const res = await searchGmbPublic(
      { query: "Muster GmbH" },
      { request, fetchDetails: async () => null }
    );
    expect(request).toHaveBeenCalledWith("/maps/api/place/textsearch/json", {
      query: "Muster GmbH",
      language: "de",
    });
    expect(res.results.map(r => r.placeId)).toEqual(["m", "b"]);
    expect(res.results.every(r => r.distanceKm === null)).toBe(true);
  });

  test("ungültige Coords werden ignoriert (Tipp-Suche bleibt)", async () => {
    const request = vi.fn(async () => ({
      status: "OK",
      results: [place("m", "Filiale München", MUENCHEN, "München")],
    }));
    await searchGmbPublic(
      { query: "Muster", lat: Number.NaN, lng: 7 },
      { request, fetchDetails: async () => null }
    );
    const params = request.mock.calls[0][1] as Record<string, unknown>;
    expect(params.location).toBeUndefined();
    expect(params.radius).toBeUndefined();
  });

  test("mit lat/lng: location+radius und Nearby-Ranking vor fernen Treffern", async () => {
    const request = vi.fn(async () => ({
      status: "OK",
      results: [
        place("m", "Filiale München", MUENCHEN, "München"),
        place("b", "Filiale Bocholt", BOCHOLT, "Bocholt"),
      ],
    }));
    const res = await searchGmbPublic(
      { query: "Muster GmbH", region: "Dortmund", ...DORTMUND },
      { request, fetchDetails: async () => null }
    );
    expect(request).toHaveBeenCalledWith("/maps/api/place/textsearch/json", {
      query: "Muster GmbH in Dortmund",
      language: "de",
      location: "51.5136,7.4653",
      radius: 50_000,
    });
    expect(res.results.map(r => r.placeId)).toEqual(["b", "m"]);
    expect(res.results[0].distanceKm).toBeGreaterThan(0);
    expect(res.results[0].distanceKm).toBeLessThan(res.results[1].distanceKm!);
  });

  test("ZERO_RESULTS → leere Liste, Flow nicht blockiert", async () => {
    const request = vi.fn(async () => ({
      status: "ZERO_RESULTS",
      results: [],
    }));
    const res = await searchGmbPublic(
      { query: "xyz", ...DORTMUND },
      { request, fetchDetails: async () => null }
    );
    expect(res).toEqual({ results: [], total: 0 });
  });
});

describe("searchAutocompleteCity", () => {
  test("ohne Coords: bisherige Autocomplete-Parameter", async () => {
    const request = vi.fn(async () => ({
      status: "OK",
      predictions: [{ description: "Dortmund, Deutschland", place_id: "c1" }],
    }));
    const res = await searchAutocompleteCity({ input: "do" }, { request });
    expect(request).toHaveBeenCalledWith(
      "/maps/api/place/autocomplete/json",
      expect.objectContaining({
        input: "do",
        types: "(cities)",
        language: "de",
      })
    );
    const params = request.mock.calls[0][1] as Record<string, unknown>;
    expect(params.location).toBeUndefined();
    expect(res.suggestions).toEqual([
      { label: "Dortmund, Deutschland", placeId: "c1" },
    ]);
  });

  test("mit lat/lng: locationbias-Radius für Städte im Umkreis", async () => {
    const request = vi.fn(async () => ({
      status: "OK",
      predictions: [{ description: "Bocholt, Deutschland", place_id: "c2" }],
    }));
    await searchAutocompleteCity({ input: "bo", ...DORTMUND }, { request });
    expect(request).toHaveBeenCalledWith(
      "/maps/api/place/autocomplete/json",
      expect.objectContaining({
        input: "bo",
        location: "51.5136,7.4653",
        radius: 80_000,
      })
    );
  });
});

describe("reverseGeocodeCity", () => {
  test("zieht locality aus Geocode-Komponenten", async () => {
    const request = vi.fn(async () => ({
      status: "OK",
      results: [
        {
          types: ["street_address"],
          formatted_address: "Musterstr. 1, 44137 Dortmund, Deutschland",
          address_components: [
            {
              long_name: "Musterstr. 1",
              short_name: "Musterstr. 1",
              types: ["route"],
            },
          ],
          geometry: {
            location: DORTMUND,
            location_type: "ROOFTOP",
            viewport: { northeast: DORTMUND, southwest: DORTMUND },
          },
          place_id: "x",
        },
        {
          types: ["locality", "political"],
          formatted_address: "Dortmund, Deutschland",
          address_components: [
            {
              long_name: "Dortmund",
              short_name: "DO",
              types: ["locality", "political"],
            },
          ],
          geometry: {
            location: DORTMUND,
            location_type: "APPROXIMATE",
            viewport: { northeast: DORTMUND, southwest: DORTMUND },
          },
          place_id: "city",
        },
      ],
    }));
    const res = await reverseGeocodeCity(DORTMUND, { request });
    expect(request).toHaveBeenCalledWith("/maps/api/geocode/json", {
      latlng: "51.5136,7.4653",
      language: "de",
    });
    expect(res).toEqual({
      city: "Dortmund",
      label: "Dortmund, Deutschland",
    });
  });

  test("ungültige Coords / leere API → null, kein Throw", async () => {
    expect(await reverseGeocodeCity({ lat: 99, lng: 0 })).toEqual({
      city: null,
      label: null,
    });
    const request = vi.fn(async () => ({
      status: "ZERO_RESULTS",
      results: [],
    }));
    expect(await reverseGeocodeCity(DORTMUND, { request })).toEqual({
      city: null,
      label: null,
    });
  });
});
