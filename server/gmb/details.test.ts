import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetGmbV1FeatureDetection,
  fetchGmbDetails,
  persistGmbDetails,
  type GmbDetails,
} from "./details";

const LEGACY_RESULT = {
  status: "OK",
  result: {
    place_id: "ChIJ255gMPZ9uEcRX0-LHl2mTl8",
    name: "SCHAU & HORCH",
    formatted_address: "Zum Waldschlösschen 19, 46395 Bocholt, Deutschland",
    address_components: [
      { long_name: "19", short_name: "19", types: ["street_number"] },
      {
        long_name: "Zum Waldschlösschen",
        short_name: "Zum Waldschlösschen",
        types: ["route"],
      },
      { long_name: "Bocholt", short_name: "Bocholt", types: ["locality"] },
      { long_name: "46395", short_name: "46395", types: ["postal_code"] },
    ],
    formatted_phone_number: "02871 123456",
    website: "https://schau-horch.example",
    rating: 5,
    user_ratings_total: 13,
    types: ["point_of_interest", "establishment", "store"],
    opening_hours: {
      open_now: true,
      weekday_text: ["Montag: 09:00–17:00 Uhr", "Dienstag: 09:00–17:00 Uhr"],
    },
    editorial_summary: {
      language: "de",
      overview: "Werbeagentur mit Fokus auf Markenstrategie.",
    },
    reviews: Array.from({ length: 10 }, (_, i) => ({
      author_name: `Rezensent ${i + 1}`,
      rating: 5,
      text: `Review ${i + 1}`,
      time: 1700000000 + i,
    })),
    photos: Array.from({ length: 10 }, (_, i) => ({
      photo_reference: `photo-ref-${i + 1}`,
      width: 1600,
      height: 1200,
    })),
  },
};

function v1Ok(body: unknown): typeof fetch {
  return vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => body,
  })) as unknown as typeof fetch;
}

function v1Fail(status = 403): typeof fetch {
  return vi.fn(async () => ({
    ok: false,
    status,
    json: async () => ({}),
    text: async () => "PERMISSION_DENIED",
  })) as unknown as typeof fetch;
}

describe("fetchGmbDetails", () => {
  beforeEach(() => {
    __resetGmbV1FeatureDetection();
  });

  it("fragt Legacy-Details mit allen Tiefen-Feldern ab und normalisiert", async () => {
    const request = vi.fn(async () => LEGACY_RESULT);
    const details = await fetchGmbDetails("ChIJ255gMPZ9uEcRX0-LHl2mTl8", {
      request,
      fetchImpl: v1Fail(),
      apiKey: "test-key",
    });

    expect(request).toHaveBeenCalledWith(
      "/maps/api/place/details/json",
      expect.objectContaining({
        place_id: "ChIJ255gMPZ9uEcRX0-LHl2mTl8",
        language: "de",
      })
    );
    const fields = (request.mock.calls[0] as any)[1].fields as string;
    for (const f of [
      "name",
      "formatted_address",
      "address_components",
      "formatted_phone_number",
      "website",
      "rating",
      "user_ratings_total",
      "types",
      "opening_hours",
      "editorial_summary",
      "reviews",
      "photos",
    ]) {
      expect(fields).toContain(f);
    }

    expect(details).not.toBeNull();
    expect(details!.name).toBe("SCHAU & HORCH");
    expect(details!.website).toBe("https://schau-horch.example");
    expect(details!.phone).toBe("02871 123456");
    expect(details!.rating).toBe(5);
    expect(details!.reviewCount).toBe(13);
    expect(details!.openingHours).toEqual([
      "Montag: 09:00–17:00 Uhr",
      "Dienstag: 09:00–17:00 Uhr",
    ]);
    expect(details!.editorialSummary).toBe(
      "Werbeagentur mit Fokus auf Markenstrategie."
    );
    expect(details!.reviews).toHaveLength(8); // max 8
    expect(details!.photoReferences).toHaveLength(8);
    expect(details!.addressComponents?.length).toBe(4);
  });

  it("nutzt v1-primaryTypeDisplayName für die Kategorie, wenn verfügbar", async () => {
    const request = vi.fn(async () => LEGACY_RESULT);
    const fetchImpl = v1Ok({
      primaryTypeDisplayName: { text: "Werbeagentur", languageCode: "de" },
    });
    const details = await fetchGmbDetails("ChIJ255gMPZ9uEcRX0-LHl2mTl8", {
      request,
      fetchImpl,
      apiKey: "test-key",
    });
    expect(details!.primaryTypeDisplayName).toBe("Werbeagentur");
    expect(details!.category).toBe("Werbeagentur");
    const url = (fetchImpl as any).mock.calls[0][0] as string;
    expect(url).toContain(
      "places.googleapis.com/v1/places/ChIJ255gMPZ9uEcRX0-LHl2mTl8"
    );
    expect(url).toContain("languageCode=de");
  });

  it("SCHAU-&-HORCH-Fall: v1 nicht verfügbar + nur generische Types → category null", async () => {
    const request = vi.fn(async () => LEGACY_RESULT);
    const details = await fetchGmbDetails("ChIJ255gMPZ9uEcRX0-LHl2mTl8", {
      request,
      fetchImpl: v1Fail(),
      apiKey: "test-key",
    });
    expect(details!.category).toBeNull();
    expect(details!.name).toBe("SCHAU & HORCH"); // Name bleibt Name, nie Kategorie
  });

  it("Feature-Detection: nach erstem v1-Fehlschlag keine weiteren v1-Calls", async () => {
    const request = vi.fn(async () => LEGACY_RESULT);
    const fetchImpl = v1Fail();
    await fetchGmbDetails("place-1", {
      request,
      fetchImpl,
      apiKey: "test-key",
    });
    await fetchGmbDetails("place-2", {
      request,
      fetchImpl,
      apiKey: "test-key",
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("ohne API-Key (Forge-Proxy) wird v1 gar nicht versucht", async () => {
    const request = vi.fn(async () => LEGACY_RESULT);
    const fetchImpl = v1Ok({});
    await fetchGmbDetails("place-1", { request, fetchImpl, apiKey: "" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("liefert null für Platzhalter-PlaceIds und bei Legacy-Fehlern", async () => {
    const request = vi.fn(async () => LEGACY_RESULT);
    expect(await fetchGmbDetails("self-abc123", { request })).toBeNull();
    expect(await fetchGmbDetails("email-abc123", { request })).toBeNull();
    expect(await fetchGmbDetails("", { request })).toBeNull();
    expect(request).not.toHaveBeenCalled();

    const failing = vi.fn(async () => {
      throw new Error("quota");
    });
    expect(
      await fetchGmbDetails("place-1", {
        request: failing,
        fetchImpl: v1Fail(),
        apiKey: "k",
      })
    ).toBeNull();
  });
});

describe("persistGmbDetails", () => {
  const baseDetails: GmbDetails = {
    placeId: "place-1",
    name: "SCHAU & HORCH",
    formattedAddress: "Zum Waldschlösschen 19, 46395 Bocholt, Deutschland",
    addressComponents: null,
    phone: "02871 123456",
    website: "https://schau-horch.example",
    rating: 5,
    reviewCount: 13,
    types: ["point_of_interest", "establishment"],
    openingHours: ["Montag: 09:00–17:00 Uhr"],
    editorialSummary: "Werbeagentur mit Fokus auf Markenstrategie.",
    reviews: [
      { author_name: "Anna B.", rating: 5, text: "Top!", time: 1700000000 },
    ],
    photoReferences: ["photo-ref-1"],
    primaryTypeDisplayName: "Werbeagentur",
    category: "Werbeagentur",
  };

  it("schreibt Tiefen-Daten in das Business", async () => {
    const getBusiness = vi.fn(async () => ({
      id: 7,
      website: null,
      openingHours: null,
      googleReviews: null,
      editorialSummary: null,
      category: "schau & horch",
      phone: null,
      address: null,
      rating: null,
      reviewCount: 0,
    }));
    const update = vi.fn(async () => {});
    await persistGmbDetails(7, baseDetails, { getBusiness, update });

    expect(update).toHaveBeenCalledTimes(1);
    const [id, data] = update.mock.calls[0] as unknown[] as [number, any];
    expect(id).toBe(7);
    expect(data.website).toBe("https://schau-horch.example");
    expect(data.openingHours).toEqual(["Montag: 09:00–17:00 Uhr"]);
    expect(data.googleReviews).toEqual(baseDetails.reviews);
    expect(data.editorialSummary).toBe(
      "Werbeagentur mit Fokus auf Markenstrategie."
    );
    // Bessere Kategorie überschreibt den alten Firmenname-Müll
    expect(data.category).toBe("Werbeagentur");
    expect(data.phone).toBe("02871 123456");
  });

  it("überschreibt vorhandene Werte nie mit NULL/leer", async () => {
    const getBusiness = vi.fn(async () => ({
      id: 7,
      website: "https://bestehend.example",
      openingHours: ["Montag: 08:00–12:00 Uhr"],
      googleReviews: [{ author_name: "Alt", rating: 4, text: "x", time: 1 }],
      editorialSummary: "Bestehender Text",
      category: "Werbeagentur",
      phone: "02871 999",
      address: "Bestehende Adresse 1",
      rating: "4.5",
      reviewCount: 4,
    }));
    const update = vi.fn(async () => {});
    const emptyDetails: GmbDetails = {
      ...baseDetails,
      website: null,
      openingHours: null,
      editorialSummary: null,
      reviews: [],
      category: null,
      phone: null,
      formattedAddress: null,
      rating: null,
      reviewCount: null,
    };
    await persistGmbDetails(7, emptyDetails, { getBusiness, update });
    expect(update).not.toHaveBeenCalled();
  });

  it("füllt phone/address/rating nur, wenn sie leer sind (kein Überschreiben)", async () => {
    const getBusiness = vi.fn(async () => ({
      id: 7,
      website: null,
      openingHours: null,
      googleReviews: null,
      editorialSummary: null,
      category: null,
      phone: "bestehende Nummer",
      address: "Bestehende Adresse 1",
      rating: "4.0",
      reviewCount: 4,
    }));
    const update = vi.fn(async () => {});
    await persistGmbDetails(7, baseDetails, { getBusiness, update });
    const data = (update.mock.calls[0] as unknown[])[1] as any;
    expect(data.phone).toBeUndefined();
    expect(data.address).toBeUndefined();
    // Frische GMB-Werte für rating/reviewCount dürfen aktualisieren
    expect(data.rating).toBe("5");
    expect(data.reviewCount).toBe(13);
  });

  it("tut nichts, wenn das Business nicht existiert", async () => {
    const getBusiness = vi.fn(async () => undefined);
    const update = vi.fn(async () => {});
    await persistGmbDetails(99, baseDetails, { getBusiness, update });
    expect(update).not.toHaveBeenCalled();
  });
});
