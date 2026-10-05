import { describe, expect, it } from "vitest";
import { pickStagePhoto, withStagePhoto, type MeasureDeps } from "./heroPhoto";
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
    const next = { ...DEFAULT_DESIGN_PROFILE, composition: "editorial" as const };
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
