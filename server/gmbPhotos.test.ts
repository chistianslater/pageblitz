import { describe, expect, test, vi } from "vitest";
import { mirrorGmbPhotosToR2 } from "./gmbPhotos";

const GOOGLE_URL_1 =
  "https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=ref1&key=SECRET";
const GOOGLE_URL_2 =
  "https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=ref2&key=SECRET";
const GOOGLE_URL_3 =
  "https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=ref3&key=SECRET";

function okImageResponse(): Response {
  return new Response(new Uint8Array([1, 2, 3]), {
    status: 200,
    headers: { "content-type": "image/jpeg" },
  });
}

function makeDeps(
  overrides: Partial<Parameters<typeof mirrorGmbPhotosToR2>[3]> = {}
) {
  let n = 0;
  return {
    getPhotos: vi
      .fn()
      .mockResolvedValue([GOOGLE_URL_1, GOOGLE_URL_2, GOOGLE_URL_3]),
    fetchImpl: vi.fn(async () => okImageResponse()) as unknown as typeof fetch,
    upload: vi.fn(async () => ({
      url: `https://media.pageblitz.de/website-42/gmb-${++n}.jpg`,
      key: `website-42/gmb-${n}.jpg`,
    })),
    ...overrides,
  };
}

describe("mirrorGmbPhotosToR2", () => {
  test("lädt jedes GMB-Foto serverseitig und liefert NUR R2-URLs (kein key=, kein maps.googleapis.com)", async () => {
    const deps = makeDeps();
    const urls = await mirrorGmbPhotosToR2("ChIJabc", 42, 8, deps);
    expect(urls).toHaveLength(3);
    for (const url of urls) {
      expect(url).not.toContain("key=");
      expect(url).not.toContain("maps.googleapis.com");
      expect(url).toMatch(/^https:\/\/media\.pageblitz\.de\//);
    }
    // Die Google-URL (mit Key) wird nur serverseitig gefetcht, nie zurückgegeben.
    expect(deps.fetchImpl).toHaveBeenCalledTimes(3);
    expect(deps.upload).toHaveBeenCalledTimes(3);
  });

  test("Reihenfolge der Fotos bleibt erhalten (Foto 1 → erste R2-URL)", async () => {
    let n = 0;
    const seen: string[] = [];
    const deps = makeDeps({
      fetchImpl: vi.fn(async (url: string) => {
        seen.push(url);
        return okImageResponse();
      }) as unknown as typeof fetch,
      upload: vi.fn(async () => ({
        url: `https://media.pageblitz.de/website-42/gmb-${++n}.jpg`,
        key: "k",
      })),
    });
    const urls = await mirrorGmbPhotosToR2("ChIJabc", 42, 8, deps);
    expect(seen).toEqual([GOOGLE_URL_1, GOOGLE_URL_2, GOOGLE_URL_3]);
    expect(urls).toEqual([
      "https://media.pageblitz.de/website-42/gmb-1.jpg",
      "https://media.pageblitz.de/website-42/gmb-2.jpg",
      "https://media.pageblitz.de/website-42/gmb-3.jpg",
    ]);
  });

  test("einzelnes Foto schlägt fehl (fetch) → wird übersprungen, Rest kommt durch", async () => {
    const deps = makeDeps({
      fetchImpl: vi
        .fn()
        .mockResolvedValueOnce(okImageResponse())
        .mockRejectedValueOnce(new Error("network"))
        .mockResolvedValueOnce(okImageResponse()) as unknown as typeof fetch,
    });
    const urls = await mirrorGmbPhotosToR2("ChIJabc", 42, 8, deps);
    expect(urls).toHaveLength(2);
  });

  test("einzelner R2-Upload schlägt fehl → Foto überspringen, kein Throw", async () => {
    const deps = makeDeps({
      upload: vi
        .fn()
        .mockRejectedValueOnce(new Error("R2 down"))
        .mockResolvedValue({
          url: "https://media.pageblitz.de/ok.jpg",
          key: "k",
        }),
    });
    await expect(
      mirrorGmbPhotosToR2("ChIJabc", 42, 8, deps)
    ).resolves.toHaveLength(2);
  });

  test("HTTP-Fehler und Nicht-Bild-Antworten werden übersprungen", async () => {
    const deps = makeDeps({
      fetchImpl: vi
        .fn()
        .mockResolvedValueOnce(new Response("nope", { status: 403 }))
        .mockResolvedValueOnce(
          new Response("<html>Fehler</html>", {
            status: 200,
            headers: { "content-type": "text/html" },
          })
        )
        .mockResolvedValueOnce(okImageResponse()) as unknown as typeof fetch,
    });
    const urls = await mirrorGmbPhotosToR2("ChIJabc", 42, 8, deps);
    expect(urls).toHaveLength(1);
  });

  test("Foto-Abruf der Referenzen schlägt komplett fehl → leeres Array, kein Throw", async () => {
    const deps = makeDeps({
      getPhotos: vi.fn().mockRejectedValue(new Error("Places down")),
    });
    await expect(mirrorGmbPhotosToR2("ChIJabc", 42, 8, deps)).resolves.toEqual(
      []
    );
  });

  test("keine Fotos beim Place → leeres Array ohne fetch/upload", async () => {
    const deps = makeDeps({ getPhotos: vi.fn().mockResolvedValue([]) });
    await expect(mirrorGmbPhotosToR2("ChIJabc", 42, 8, deps)).resolves.toEqual(
      []
    );
    expect(deps.fetchImpl).not.toHaveBeenCalled();
    expect(deps.upload).not.toHaveBeenCalled();
  });
});
