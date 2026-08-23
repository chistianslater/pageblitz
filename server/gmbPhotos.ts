import { makeRequest } from "./_core/map";
import { ENV } from "./_core/env";
import { uploadImageToR2 } from "./r2Upload";

/**
 * Fetch photos from Google My Business (Places API) for a given placeId.
 * Returns an array of photo URLs (up to maxPhotos), or empty array on failure.
 */
export async function getGmbPhotos(
  placeId: string,
  maxPhotos = 6
): Promise<string[]> {
  try {
    const details = await makeRequest<any>("/maps/api/place/details/json", {
      place_id: placeId,
      fields: "photos",
      language: "de",
    });
    const photos: Array<{
      photo_reference: string;
      width: number;
      height: number;
    }> = details?.result?.photos || [];

    if (!photos.length) return [];
    // Build photo URLs – direct Google API or Forge proxy
    const isDirectGoogle = !!ENV.googlePlacesApiKey;
    const baseUrl = isDirectGoogle
      ? "https://maps.googleapis.com"
      : (ENV.forgeApiUrl || "").replace(/\/+$/, "");
    const apiKey = isDirectGoogle
      ? ENV.googlePlacesApiKey
      : ENV.forgeApiKey || "";
    if (!baseUrl || !apiKey) return [];
    const photoPath = isDirectGoogle
      ? "/maps/api/place/photo"
      : "/v1/maps/proxy/maps/api/place/photo";
    return photos.slice(0, maxPhotos).map(p => {
      const url = new URL(`${baseUrl}${photoPath}`);
      url.searchParams.set("maxwidth", "1600");
      url.searchParams.set("photo_reference", p.photo_reference);
      url.searchParams.set("key", apiKey);
      return url.toString();
    });
  } catch {
    return [];
  }
}

/** Obergrenze pro gespiegeltem Foto (Google liefert bei maxwidth=1600 deutlich weniger). */
const MAX_MIRRORED_PHOTO_BYTES = 10 * 1024 * 1024;
/** Timeout pro Foto-Download (Muster wie server/gmb/siteCrawl.ts) — hängende Google-Antworten überspringen das Foto statt den Job zu blockieren. */
const PHOTO_FETCH_TIMEOUT_MS = 12_000;
/** Max. gleichzeitige Foto-Spiegelungen — begrenzt parallel statt sequentiell, damit der Zeitmaschinen-Zwischenstand nicht auf 8 serielle Downloads wartet. */
const MIRROR_CONCURRENCY = 3;

export type MirrorGmbPhotosDeps = {
  /** Foto-URL-Beschaffung (Default: `getGmbPhotos`) — in Tests mocken. */
  getPhotos?: (placeId: string, maxPhotos?: number) => Promise<string[]>;
  /** HTTP-Client für den serverseitigen Foto-Download (Default: globales `fetch`). */
  fetchImpl?: typeof fetch;
  /** R2-Upload (Default: `uploadImageToR2`). */
  upload?: typeof uploadImageToR2;
};

/**
 * Spiegelt GMB-Fotos nach R2 (Plan B7 Task 3, Key-Leak schließen):
 * Die Google-Photo-URL enthält den Places-API-Key (`key=…`) und darf deshalb
 * NIE in einem Website-Dokument landen — sie wird hier ausschließlich
 * serverseitig gefetcht, das Bild nach R2 hochgeladen und nur die R2-URL
 * zurückgegeben. Fehler bei einzelnen Fotos (Netzwerk, HTTP, Nicht-Bild,
 * R2-Upload) überspringen NUR das Foto — die Funktion wirft nie und bricht
 * den Generierungs-Job nie ab. Ohne R2-Konfiguration schlägt jeder Upload
 * fehl → leeres Ergebnis → der Aufrufer fällt auf Branchen-Stockbilder
 * zurück (statt jemals eine Key-URL zu verwenden).
 *
 * Begrenzte Parallelität (MIRROR_CONCURRENCY) statt sequentiell: die
 * Bild-Phase des Jobs verzögert sonst den Zeitmaschinen-Zwischenstand um
 * 8 serielle Downloads. Die Ergebnis-Reihenfolge bleibt trotzdem stabil
 * (Foto 1 = Hero, Foto 2 = Über uns): jedes Ergebnis landet an seiner
 * Eingabe-Position, übersprungene Fotos werden erst am Ende herausgefiltert.
 */
export async function mirrorGmbPhotosToR2(
  placeId: string,
  websiteId: number,
  maxPhotos = 8,
  deps: MirrorGmbPhotosDeps = {}
): Promise<string[]> {
  const getPhotos = deps.getPhotos ?? getGmbPhotos;
  const fetchImpl = deps.fetchImpl ?? fetch;
  const upload = deps.upload ?? uploadImageToR2;

  let googleUrls: string[];
  try {
    googleUrls = await getPhotos(placeId, maxPhotos);
  } catch (err) {
    console.warn(
      `[GMB Fotos] Foto-Referenzen nicht abrufbar (${placeId}):`,
      err
    );
    return [];
  }

  /** Spiegelt genau EIN Foto — `null` = überspringen (Fehler/Timeout/Nicht-Bild), wirft nie. */
  const mirrorOne = async (googleUrl: string): Promise<string | null> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PHOTO_FETCH_TIMEOUT_MS);
    try {
      const response = await fetchImpl(googleUrl, {
        signal: controller.signal,
      });
      if (!response.ok) return null;
      const mime =
        response.headers.get("content-type")?.split(";")[0]?.trim() ||
        "image/jpeg";
      if (!mime.startsWith("image/")) return null;
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length === 0 || buffer.length > MAX_MIRRORED_PHOTO_BYTES)
        return null;
      const { url } = await upload(
        buffer.toString("base64"),
        mime,
        websiteId,
        "gmb"
      );
      return url;
    } catch (err) {
      console.warn(
        `[GMB Fotos] Spiegelung eines Fotos übersprungen (Website ${websiteId}):`,
        err
      );
      return null;
    } finally {
      clearTimeout(timer);
    }
  };

  // Worker-Pool: max. MIRROR_CONCURRENCY Fotos gleichzeitig, Ergebnis je
  // Eingabe-Position — Reihenfolge unabhängig von der Fertigstellung.
  const results: (string | null)[] = new Array(googleUrls.length).fill(null);
  let nextIndex = 0;
  const workers = Array.from(
    { length: Math.min(MIRROR_CONCURRENCY, googleUrls.length) },
    async () => {
      for (;;) {
        const index = nextIndex++;
        if (index >= googleUrls.length) return;
        results[index] = await mirrorOne(googleUrls[index]);
      }
    }
  );
  await Promise.all(workers);
  return results.filter((url): url is string => url !== null);
}
