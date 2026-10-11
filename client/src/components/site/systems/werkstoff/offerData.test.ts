import { describe, expect, test } from "vitest";
import type { SystemSection } from "../shared";
import {
  galleryGroups,
  processMode,
  processPhoto,
  stepTime,
  werkstoffPhotos,
} from "./offerData";

const steps = (...titles: string[]): SystemSection => ({
  type: "process",
  steps: titles.map(title => ({ title })),
});
const url = (n: number) => `https://images.example.org/f-${n}.jpg`;
const gallery = (...ns: number[]): SystemSection => ({
  type: "gallery",
  images: ns.map(n => ({ url: url(n), alt: "" })),
});
const hero = (n?: number): SystemSection =>
  ({ type: "hero", headline: "Kopf", imageUrl: n ? url(n) : undefined }) as SystemSection;

describe("Ablauf: Uhrzeit oder Ziffern", () => {
  test("Uhrzeit vorn wird erkannt und abgetrennt", () => {
    expect(stepTime("5:00 Teig")).toEqual({ time: "5:00", label: "Teig" });
    expect(stepTime("05:30 Uhr – Ofen")).toEqual({ time: "5:30", label: "Ofen" });
    expect(stepTime("6.00 Uhr: Laden auf")).toEqual({ time: "6:00", label: "Laden auf" });
    expect(stepTime("18:00")).toEqual({ time: "18:00", label: "" });
  });

  test("keine Uhrzeit: Mengen, falsche Minuten, Zahlen ohne Minuten", () => {
    expect(stepTime("Aufmaß")).toBeUndefined();
    expect(stepTime("1.500 Brötchen")).toBeUndefined();
    expect(stepTime("7:75 Teig")).toBeUndefined();
    expect(stepTime("25:00 Teig")).toBeUndefined();
    expect(stepTime("3 Schritte")).toBeUndefined();
  });

  test("Zeitleiste nur, wenn ALLE Schritte mit einer Uhrzeit beginnen", () => {
    expect(processMode(steps("3:30 Teig", "4:30 Ofen", "6:00 Laden auf") as never)).toBe("timeline");
    expect(processMode(steps("3:30 Teig", "Ofen", "6:00 Laden auf") as never)).toBe("numbers");
    expect(processMode(steps("Anfrage", "Angebot") as never)).toBe("numbers");
  });
});

describe("Foto am Ablauf (Ziffern)", () => {
  test("aus der Galerie, nur wenn danach noch zwei Fotos bleiben", () => {
    const list = [hero(1), steps("Anfrage", "Bau"), gallery(1, 2, 3, 4)];
    expect(processPhoto(list, new Set([url(1)]))).toEqual([url(2)]);
    // Nach dem Einstieg bleiben nur zwei → kein Foto am Ablauf.
    expect(processPhoto([hero(1), steps("A", "B"), gallery(1, 2, 3)], new Set([url(1)]))).toBeUndefined();
  });

  test("Zeitleiste und Seiten ohne Ablauf bekommen keins", () => {
    expect(processPhoto([steps("5:00 Teig", "6:00 Laden"), gallery(1, 2, 3, 4)], new Set())).toBeUndefined();
    expect(processPhoto([gallery(1, 2, 3, 4)], new Set())).toBeUndefined();
  });

  test("werkstoffPhotos: Foto nur einmal — Ablauf-Foto fehlt in der Galerie", () => {
    const { list, offerPhotos } = werkstoffPhotos(
      [hero(1), steps("A", "B"), gallery(1, 2, 3, 4)],
      []
    );
    expect(offerPhotos).toEqual([url(2)]);
    const g = list.find(s => s.type === "gallery") as { images: { url: string }[] };
    expect(g.images.map(i => i.url)).toEqual([url(3), url(4)]);
  });
});

describe("Werkbank-Raster: Gruppen", () => {
  test("2 bis 4 Fotos je Raster, nie ein einzelnes übrig", () => {
    expect(galleryGroups(1)).toEqual([1]);
    expect(galleryGroups(2)).toEqual([2]);
    expect(galleryGroups(4)).toEqual([4]);
    expect(galleryGroups(5)).toEqual([3, 2]);
    expect(galleryGroups(6)).toEqual([4, 2]);
    expect(galleryGroups(8)).toEqual([4, 4]);
    expect(galleryGroups(9)).toEqual([4, 3, 2]);
    for (let n = 2; n <= 24; n++) {
      const g = galleryGroups(n);
      expect(g.reduce((a, b) => a + b, 0)).toBe(n);
      expect(g.every(x => x >= 2 && x <= 4)).toBe(true);
    }
  });
});
