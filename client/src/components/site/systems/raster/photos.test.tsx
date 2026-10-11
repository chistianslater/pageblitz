import { describe, expect, test } from "vitest";
import type { SystemSection } from "../shared";
import { claimPhotos } from "./photos";
import { patchSection, render, sectionHtml, werkstattDoc } from "./testkit";

const url = (n: number | string) => `https://images.example.org/foto-${n}.jpg`;
const img = (n: number | string) => ({ url: url(n), alt: `Foto ${n}` });

const services = (n: number): SystemSection => ({
  type: "services",
  headline: "Leistungen",
  items: Array.from({ length: n }, (_, i) => ({ title: `Leistung ${i + 1}` })),
});
const hero = (imageUrl?: string): SystemSection =>
  ({ type: "hero", headline: "Kopf", imageUrl }) as SystemSection;
const about = (imageUrl?: string): SystemSection => ({
  type: "about",
  headline: "Über uns",
  body: "Text.",
  imageUrl,
});
const gallery = (...images: ReturnType<typeof img>[]): SystemSection => ({
  type: "gallery",
  images,
});

const galleryUrls = (list: readonly SystemSection[]) =>
  list.flatMap(s => (s.type === "gallery" ? s.images.map(i => i.url) : []));
const aboutUrl = (list: readonly SystemSection[]) =>
  list.find(s => s.type === "about")?.type === "about"
    ? (list.find(s => s.type === "about") as { imageUrl?: string }).imageUrl
    : undefined;

describe("claimPhotos: jedes Foto höchstens einmal je Seite", () => {
  test("Einstieg = Über uns = Galeriefoto: nur der Einstieg behält es", () => {
    const { list, bandPhotos } = claimPhotos(
      [hero(url("x")), services(2), about(url("x")), gallery(img("x"), img(1), img(2), img(3))],
      []
    );
    // Bänder überspringen das Einstiegsfoto
    expect(bandPhotos).toEqual([url(1), url(2)]);
    expect(aboutUrl(list)).toBeUndefined();
    expect(galleryUrls(list)).toEqual([url(3)]);
  });

  test("doppelte URLs in der Galerie zählen einmal", () => {
    const { list, bandPhotos } = claimPhotos(
      [hero(), services(3), gallery(img(1), img(1), img(2), img(2), img(3))],
      []
    );
    expect(bandPhotos).toEqual([url(1), url(2), url(3)]);
    expect(list.some(s => s.type === "gallery")).toBe(false);
  });

  test("zu wenige freie Fotos für alle Bänder: keine Bandfotos, Galerie bleibt (ohne Doppel)", () => {
    const { list, bandPhotos } = claimPhotos(
      [hero(url(1)), services(3), gallery(img(1), img(2), img(2), img(3))],
      []
    );
    expect(bandPhotos).toBeUndefined();
    expect(galleryUrls(list)).toEqual([url(2), url(3)]);
  });

  test("Über-uns-Foto, das ein Band trägt, entfällt; eigenes bleibt und wird gezählt", () => {
    const taken = claimPhotos([services(1), about(url(1)), gallery(img(1), img(2))], []);
    expect(taken.bandPhotos).toEqual([url(1)]);
    expect(aboutUrl(taken.list)).toBeUndefined();
    // Reihenfolge laut Entscheid: Einstieg → Bänder → Über uns → Galerie
    const own = claimPhotos([services(1), about(url(8)), gallery(img(9), img(8), img(1))], []);
    expect(own.bandPhotos).toEqual([url(9)]);
    expect(aboutUrl(own.list)).toBe(url(8));
    expect(galleryUrls(own.list)).toEqual([url(1)]);
  });

  test("ausgeblendete Bilder beanspruchen nichts", () => {
    const { list } = claimPhotos(
      [hero(url(1)), about(url(2)), gallery(img(1), img(2), img(3))],
      ["hero-media", "about-media"]
    );
    expect(galleryUrls(list)).toEqual([url(1), url(2), url(3)]);
  });

  test("Liste bleibt unverändert, wenn nichts doppelt ist", () => {
    const input = [hero(url(1)), about(url(2)), gallery(img(3))];
    expect(claimPhotos(input, []).list).toEqual(input);
  });
});

describe("Raster: Seite zeigt kein Foto zweimal", () => {
  test("Werkstatt: Einstieg, Über uns und Galerie teilen kein Foto, Abb. lückenlos", () => {
    const base = werkstattDoc();
    const hero = base.sections.find(s => s.type === "hero")!;
    const shared = (hero as { imageUrl?: string }).imageUrl!;
    const doc = patchSection(
      patchSection(base, "about", a => ({ ...a, imageUrl: shared })),
      "gallery",
      g => ({ ...g, images: [{ url: shared, alt: "Motor" }, img(1), img(1), img(2)] })
    );
    const html = render(doc);
    const srcs = [...html.matchAll(/<img[^>]*src="([^"]+)"/g)].map(m => m[1]);
    expect(srcs.length).toBe(new Set(srcs).size);
    expect(sectionHtml(html, "about")).not.toContain("<img");
    const abb = [...sectionHtml(html, "gallery").matchAll(/Abb\. (\d+)/g)].map(m => Number(m[1]));
    expect(abb).toEqual([1, 2]);
  });
});
