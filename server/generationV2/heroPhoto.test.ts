import { describe, expect, it } from "vitest";
import {
  curateImages,
  parseVisionRatings,
  pickStagePhoto,
  withStagePhoto,
  type MeasureDeps,
  type PhotoCheck,
  type VisionRating,
} from "./heroPhoto";
import {
  keepEntryComposition,
  withEntryComposition,
} from "../../shared/stylePacks/artDirection";
import { DEFAULT_DESIGN_PROFILE } from "../../shared/siteContract/designProfile";

const SIZES: Record<string, [number, number]> = {
  "hoch.jpg": [1200, 1600],
  "quer.jpg": [1600, 1067],
  "klein-quer.jpg": [800, 500],
  "quadrat.jpg": [1200, 1200],
};

const deps: MeasureDeps = {
  fetchImpl: (async (url: string) =>
    SIZES[url]
      ? new Response(url)
      : new Response(null, { status: 404 })) as unknown as typeof fetch,
  readSize: async buffer => {
    const [width, height] = SIZES[buffer.toString()];
    return { width, height };
  },
};

describe("pickStagePhoto", () => {
  it("nimmt nur große Querformate", () => {
    expect(
      pickStagePhoto([
        { url: "a", width: 1200, height: 1600 },
        { url: "b", width: 800, height: 500 },
        { url: "c", width: 1200, height: 1200 },
      ])
    ).toBeUndefined();
    expect(
      pickStagePhoto([
        { url: "a", width: 1600, height: 1067 },
        { url: "b", width: 2400, height: 1600 },
      ])
    ).toBe("b");
  });
});

describe("withStagePhoto", () => {
  it("zieht ein Querformat aus der Galerie nach vorn", async () => {
    const result = await withStagePhoto(
      {
        hero: "hoch.jpg",
        about: "quadrat.jpg",
        gallery: ["hoch.jpg", "quer.jpg"],
      },
      deps
    );
    expect(result.hero).toBe("quer.jpg");
    expect(result.heroLandscape).toBe(true);
    expect(result.about).toBe("quadrat.jpg");
  });

  it("tauscht mit Über uns, wenn das Querformat dort lag", async () => {
    const result = await withStagePhoto(
      { hero: "hoch.jpg", about: "quer.jpg" },
      deps
    );
    expect(result).toMatchObject({
      hero: "quer.jpg",
      about: "hoch.jpg",
      heroLandscape: true,
    });
  });

  it("lässt Hochformate und kaputte Links unverändert", async () => {
    const result = await withStagePhoto(
      { hero: "hoch.jpg", gallery: ["klein-quer.jpg", "fehlt.jpg"] },
      deps
    );
    expect(result.hero).toBe("hoch.jpg");
    expect(result.heroLandscape).toBe(false);
  });
});

describe("keepEntryComposition", () => {
  it("behält den Einstieg beim Designwechsel", () => {
    const stage = withEntryComposition(
      { ...DEFAULT_DESIGN_PROFILE, composition: "portrait" },
      { heroLandscape: true, extraPhotos: 0 }
    );
    const next = {
      ...DEFAULT_DESIGN_PROFILE,
      composition: "editorial" as const,
    };
    expect(keepEntryComposition(stage, next)).toMatchObject({
      composition: "stage",
      heroLayout: "banner",
    });
    expect(keepEntryComposition(DEFAULT_DESIGN_PROFILE, next)).toBe(next);
  });
});

describe("withEntryComposition", () => {
  const base = { ...DEFAULT_DESIGN_PROFILE, composition: "portrait" as const };

  it("gibt Querformaten die Bühne", () => {
    expect(
      withEntryComposition(base, { heroLandscape: true, extraPhotos: 0 })
    ).toMatchObject({ composition: "stage", heroLayout: "banner" });
  });

  it("gibt Hochformaten mit weiteren Fotos die Farbfläche", () => {
    expect(
      withEntryComposition(base, { heroLandscape: false, extraPhotos: 2 })
    ).toMatchObject({ composition: "colorfield", heroLayout: "collage" });
  });

  it("lässt Seiten ohne Fotos und ohne Hero-Bild in Ruhe", () => {
    expect(
      withEntryComposition(base, { heroLandscape: false, extraPhotos: 0 })
    ).toBe(base);
    const statement = { ...base, composition: "statement" as const };
    expect(
      withEntryComposition(statement, { heroLandscape: true, extraPhotos: 3 })
    ).toBe(statement);
  });
});

describe("Fotoprüfung", () => {
  const check = (
    url: string,
    width: number,
    height: number,
    vision?: Partial<VisionRating>,
    mirrored = false
  ): PhotoCheck => ({
    url,
    width,
    height,
    mirrored,
    ...(vision
      ? {
          vision: {
            motiv: "innenraum",
            overlay: false,
            collage: false,
            quality: 4,
            heroScore: 4,
            ...vision,
          },
        }
      : {}),
  });

  it("liest die Modellantwort streng und verwirft Unbekanntes", () => {
    const parsed = parseVisionRatings(
      '```json\n{"photos":[{"i":1,"motiv":"arbeit","overlay":true,"collage":false,"qualitaet":9,"hero":"2"},{"i":7}]}\n```',
      2
    );
    expect(parsed?.[0]).toBeNull();
    expect(parsed?.[1]).toEqual({
      motiv: "arbeit",
      overlay: true,
      collage: false,
      quality: 5,
      heroScore: 2,
    });
    expect(parseVisionRatings("kein json", 2)).toBeNull();
  });

  it("sortiert Overlay, Collage und Spiegelung überall aus", () => {
    const result = curateImages(
      {
        hero: "insta.jpg",
        about: "collage.jpg",
        gallery: ["insta.jpg", "gut.jpg", "spiegel.jpg", "auch-gut.jpg"],
      },
      [
        check("insta.jpg", 1200, 1600, { overlay: true, heroScore: 5 }),
        check("collage.jpg", 1200, 1000, { collage: true }),
        check("gut.jpg", 1200, 1600, { heroScore: 5, quality: 5 }),
        check("spiegel.jpg", 1200, 1600, undefined, true),
        check("auch-gut.jpg", 1200, 1600, { heroScore: 3 }),
      ]
    );
    expect(result.hero).toBe("gut.jpg");
    expect(result.about).toBe("auch-gut.jpg");
    expect(result.gallery).toEqual(["gut.jpg", "auch-gut.jpg"]);
    expect(result.heroLandscape).toBe(false);
  });

  it("gibt dem Himmel keine Bühne, der Werkstatt schon", () => {
    const sky = curateImages(
      { hero: "himmel.jpg", gallery: ["werkstatt.jpg"] },
      [
        check("himmel.jpg", 2400, 1600, { motiv: "landschaft", heroScore: 2 }),
        check("werkstatt.jpg", 1200, 1600, { motiv: "arbeit", heroScore: 4 }),
      ]
    );
    expect(sky).toMatchObject({ hero: "werkstatt.jpg", heroLandscape: false });

    const shop = curateImages({ hero: "himmel.jpg", gallery: ["laden.jpg"] }, [
      check("himmel.jpg", 2400, 1600, { motiv: "landschaft", heroScore: 2 }),
      check("laden.jpg", 1600, 1000, { motiv: "innenraum", heroScore: 5 }),
    ]);
    expect(shop).toMatchObject({ hero: "laden.jpg", heroLandscape: true });
  });

  it("lässt alles stehen, wenn jedes Foto Mängel hat", () => {
    const images = { hero: "a.jpg", gallery: ["a.jpg"] };
    const result = curateImages(images, [
      check("a.jpg", 1200, 1600, { overlay: true }),
    ]);
    expect(result.hero).toBe("a.jpg");
    expect(result.gallery).toEqual(["a.jpg"]);
  });

  it("nutzt die Bewertung des Modells, wenn es erreichbar ist", async () => {
    const result = await withStagePhoto(
      { hero: "hoch.jpg", gallery: ["hoch.jpg", "quer.jpg", "quadrat.jpg"] },
      {
        ...deps,
        readMirror: async () => 60,
        makeThumb: async buffer => `thumb:${buffer.toString()}`,
        rate: async thumbs =>
          thumbs.map(t =>
            t === "thumb:quer.jpg"
              ? {
                  motiv: "aussen",
                  overlay: true,
                  collage: false,
                  quality: 4,
                  heroScore: 5,
                }
              : {
                  motiv: "ergebnis",
                  overlay: false,
                  collage: false,
                  quality: t === "thumb:quadrat.jpg" ? 5 : 3,
                  heroScore: 4,
                }
          ),
      },
      "Friseursalon"
    );
    expect(result.hero).toBe("quadrat.jpg");
    expect(result.heroLandscape).toBe(false);
    expect(result.gallery).toEqual(["hoch.jpg", "quadrat.jpg"]);
  });
});
