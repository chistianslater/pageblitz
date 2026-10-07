import { describe, expect, it, vi } from "vitest";
import { unsplashFill, unsplashQuery } from "./unsplashFill";
import type { StockPhoto } from "../_core/stockPhotos";

const photo = (id: string, width: number, height: number): StockPhoto => ({
  id,
  url: "",
  thumb: "",
  photographer: `Foto ${id}`,
  photographerUrl: `https://unsplash.com/@${id}?utm_source=pageblitz&utm_medium=referral`,
  width,
  height,
  raw: `https://images.unsplash.com/photo-${id}?ixid=abc`,
  downloadLocation: `https://api.unsplash.com/photos/${id}/download`,
});

describe("unsplashQuery", () => {
  it("übersetzt die Kategorie und schärft die Szene je Familie", () => {
    expect(unsplashQuery("Schreinerei", "trade")).toBe("carpentry workshop");
    expect(unsplashQuery("Zahnarzt", "health")).toBe("dentist clinic");
    expect(unsplashQuery("Friseursalon", "beauty")).toBe("hair salon");
  });
});

describe("unsplashFill", () => {
  it("nimmt nur große Querformate, meldet die Nutzung und liefert den Nachweis", async () => {
    const search = vi.fn().mockResolvedValue({
      photos: [
        photo("a", 6000, 4000),
        photo("klein", 1200, 800),
        photo("hoch", 3000, 4500),
        photo("b", 5000, 3300),
      ],
      total: 4,
      totalPages: 1,
    });
    const track = vi.fn();
    const fill = await unsplashFill("Schreinerei", "trade", 5, {
      search,
      track,
    });
    expect(search).toHaveBeenCalledWith("carpentry workshop", 1, 30, "high");
    expect(fill.urls).toHaveLength(2);
    expect(fill.urls[0]).toContain("w=1800");
    expect(fill.credits.map(c => c.name)).toEqual(["Foto a", "Foto b"]);
    expect(fill.credits[0].match).toBe("https://images.unsplash.com/photo-a");
    expect(track).toHaveBeenCalledTimes(2);
  });

  it("bleibt leer, wenn nichts gesucht werden soll oder die Suche nichts liefert", async () => {
    const search = vi
      .fn()
      .mockResolvedValue({ photos: [], total: 0, totalPages: 0 });
    expect(
      (await unsplashFill("Schreinerei", "trade", 0, { search })).urls
    ).toEqual([]);
    expect(
      (await unsplashFill("Schreinerei", "trade", 5, { search })).urls
    ).toEqual([]);
  });
});
