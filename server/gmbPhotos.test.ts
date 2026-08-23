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

  test("hängender Google-Download läuft nach 12 s in den Timeout → Foto überspringen, Rest kommt durch", async () => {
    vi.useFakeTimers();
    try {
      const deps = makeDeps({
        fetchImpl: vi.fn(
          (url: string, init?: RequestInit) =>
            new Promise<Response>((resolve, reject) => {
              if (url === GOOGLE_URL_2) {
                // Hängt für immer — nur der AbortController beendet den Fetch.
                init?.signal?.addEventListener("abort", () =>
                  reject(new DOMException("Aborted", "AbortError"))
                );
                return;
              }
              resolve(okImageResponse());
            })
        ) as unknown as typeof fetch,
      });
      const pending = mirrorGmbPhotosToR2("ChIJabc", 42, 8, deps);
      await vi.advanceTimersByTimeAsync(12_001);
      const urls = await pending;
      expect(urls).toHaveLength(2);
      expect(deps.upload).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  test("begrenzte Parallelität: max. 3 Downloads gleichzeitig, schneller als sequentiell, Reihenfolge stabil", async () => {
    vi.useFakeTimers();
    try {
      const sixUrls = Array.from(
        { length: 6 },
        (_, i) =>
          `https://maps.googleapis.com/maps/api/place/photo?photo_reference=r${i + 1}&key=SECRET`
      );
      let inFlight = 0;
      let maxInFlight = 0;
      const deps = makeDeps({
        getPhotos: vi.fn().mockResolvedValue(sixUrls),
        fetchImpl: vi.fn(
          (url: string) =>
            new Promise<Response>(resolve => {
              inFlight += 1;
              maxInFlight = Math.max(maxInFlight, inFlight);
              setTimeout(() => {
                inFlight -= 1;
                resolve(okImageResponse());
              }, 100);
            })
        ) as unknown as typeof fetch,
        upload: vi.fn(async (_data, _mime, _websiteId, _prefix) => {
          // R2-URL trägt die photo_reference des zuletzt gefetchten Fotos
          // nicht — Reihenfolge wird über die Upload-Aufrufsfolge geprüft.
          return {
            url: `https://media.pageblitz.de/website-42/gmb-slot.jpg`,
            key: "k",
          };
        }),
      });
      const pending = mirrorGmbPhotosToR2("ChIJabc", 42, 8, deps);
      // Sequentiell bräuchten 6 Fotos à 100 ms 600 ms — mit 3er-Pool reichen 200 ms.
      await vi.advanceTimersByTimeAsync(200);
      const urls = await pending;
      expect(urls).toHaveLength(6);
      expect(maxInFlight).toBe(3);
      // Downloads starten in Eingabe-Reihenfolge (Pool zieht Index für Index).
      const fetched = vi
        .mocked(deps.fetchImpl)
        .mock.calls.map(call => call[0] as string);
      expect(fetched).toEqual(sixUrls);
    } finally {
      vi.useRealTimers();
    }
  });

  test("Ergebnis-Reihenfolge folgt der Eingabe, auch wenn spätere Fotos früher fertig sind", async () => {
    vi.useFakeTimers();
    try {
      // Foto 1 braucht 300 ms, Foto 2/3 sind sofort fertig — die R2-URLs
      // müssen trotzdem in Eingabe-Reihenfolge zurückkommen (Foto 1 = Hero).
      const deps = makeDeps({
        fetchImpl: vi.fn(
          (url: string) =>
            new Promise<Response>(resolve => {
              const delay = url === GOOGLE_URL_1 ? 300 : 0;
              setTimeout(() => resolve(okImageResponse()), delay);
            })
        ) as unknown as typeof fetch,
        upload: vi.fn(async (base64: string) => {
          // Jeder Upload bekommt eine URL, die die Fertigstellungs-Nummer
          // trägt — würde die Reihenfolge kippen, stünde Foto 1 nicht vorn.
          const n = vi.mocked(deps.upload).mock.calls.length;
          return {
            url: `https://media.pageblitz.de/website-42/gmb-done-${n}.jpg`,
            key: "k",
          };
        }),
      });
      const pending = mirrorGmbPhotosToR2("ChIJabc", 42, 8, deps);
      await vi.advanceTimersByTimeAsync(301);
      const urls = await pending;
      // Fertigstellung: Foto 2 (done-1), Foto 3 (done-2), Foto 1 (done-3) —
      // Position 0 gehört trotzdem Foto 1.
      expect(urls).toEqual([
        "https://media.pageblitz.de/website-42/gmb-done-3.jpg",
        "https://media.pageblitz.de/website-42/gmb-done-1.jpg",
        "https://media.pageblitz.de/website-42/gmb-done-2.jpg",
      ]);
    } finally {
      vi.useRealTimers();
    }
  });
});
