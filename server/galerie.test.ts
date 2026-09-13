import { describe, expect, test } from "vitest";
import { galerieBereinigen, type GalerieBild } from "./galerie";

const U = (id: string, groesse: number) =>
  `https://images.unsplash.com/photo-${id}?w=${groesse}&q=80&auto=format&fit=crop`;

const bild = (id: string, groesse: number, nr: number): GalerieBild => ({
  url: U(id, groesse),
  alt: `Salon Beispiel – Eindruck ${nr}`,
});

describe("galerieBereinigen", () => {
  test("wirft dasselbe Motiv in zwei Größen raus", () => {
    // Der Fall von der Seite Iris Klautke: sieben Bilder, zwei Motive doppelt.
    const galerie = [
      bild("aaa", 800, 1),
      bild("bbb", 800, 2),
      bild("ccc", 800, 3),
      bild("ddd", 800, 4),
      bild("ccc", 1400, 5),
      bild("ddd", 1400, 6),
      bild("eee", 1400, 7),
    ];
    const { bilder, entfernt, ergaenzt } = galerieBereinigen(galerie);
    expect(entfernt).toBe(2);
    expect(ergaenzt).toBe(0);
    expect(bilder.map(b => b.url)).toEqual([
      U("aaa", 800),
      U("bbb", 800),
      U("ccc", 800),
      U("ddd", 800),
      U("eee", 1400),
    ]);
  });

  test("füllt aus dem Stock nach, statt eine dünne Galerie zu lassen", () => {
    // Betreiber-Entscheidung 2026-09-13: lieber Stockfotos als zu wenig Bilder.
    const galerie = [bild("aaa", 800, 1), bild("aaa", 1400, 2)];
    const { bilder, entfernt, ergaenzt } = galerieBereinigen(galerie, [
      U("neu1", 800),
      U("neu2", 800),
    ]);
    expect(entfernt).toBe(1);
    expect(ergaenzt).toBe(2);
    expect(bilder).toHaveLength(3);
    expect(new Set(bilder.map(b => b.url)).size).toBe(3);
    expect(bilder[2].alt).toBe("Salon Beispiel – Eindruck 3");
  });

  test("legt kein Motiv nach, das schon im Hero oder Über-uns steckt", () => {
    const galerie = [bild("aaa", 800, 1), bild("aaa", 1400, 2)];
    const { bilder } = galerieBereinigen(
      galerie,
      [U("hero", 800), U("frei", 800)],
      [U("hero", 1400)]
    );
    expect(bilder.map(b => b.url)).not.toContain(U("hero", 800));
    expect(bilder.map(b => b.url)).toContain(U("frei", 800));
  });

  test("lässt eine saubere Galerie unangetastet", () => {
    const galerie = [
      bild("aaa", 800, 1),
      bild("bbb", 800, 2),
      bild("ccc", 800, 3),
    ];
    const { bilder, entfernt, ergaenzt } = galerieBereinigen(galerie, [
      U("zzz", 800),
    ]);
    expect(entfernt).toBe(0);
    expect(ergaenzt).toBe(0);
    expect(bilder).toEqual(galerie);
  });

  test("bläht eine große Galerie nicht über acht Bilder auf", () => {
    const galerie = Array.from({ length: 9 }, (_, i) =>
      bild(`m${i}`, 800, i + 1)
    );
    const { bilder, ergaenzt } = galerieBereinigen(galerie, [U("extra", 800)]);
    expect(ergaenzt).toBe(0);
    expect(bilder).toHaveLength(9);
  });
});
