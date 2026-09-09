import { describe, expect, test } from "vitest";
import { googleMapsUrl } from "./mapsLink";

describe("googleMapsUrl", () => {
  test("baut eine Suche aus Strasse, PLZ und Ort", () => {
    expect(googleMapsUrl("Osterstraße 25", "46397", "Bocholt")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Osterstra%C3%9Fe%2025%2C%2046397%20Bocholt"
    );
  });

  test("kommt ohne Strasse aus — Ort allein ist noch auffindbar", () => {
    expect(googleMapsUrl(undefined, "46397", "Bocholt")).toBe(
      "https://www.google.com/maps/search/?api=1&query=46397%20Bocholt"
    );
  });

  test("ohne jede Ortsangabe gibt es keinen Link", () => {
    // Lieber gar kein Link als einer, der auf eine leere Suche fuehrt.
    expect(googleMapsUrl(undefined, undefined, undefined)).toBeNull();
    expect(googleMapsUrl("", "", "")).toBeNull();
  });

  test("eine Strasse allein reicht nicht", () => {
    // "Hauptstraße 1" ohne Ort trifft irgendeine Hauptstrasse in Deutschland.
    expect(googleMapsUrl("Hauptstraße 1", undefined, undefined)).toBeNull();
  });
});
