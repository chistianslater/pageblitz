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
 * Bewusst sequentiell: erhält die GMB-Foto-Reihenfolge (Foto 1 = Hero,
 * Foto 2 = Über uns) deterministisch und schont Google-/R2-Limits.
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

  const mirrored: string[] = [];
  for (const googleUrl of googleUrls) {
    try {
      const response = await fetchImpl(googleUrl);
      if (!response.ok) continue;
      const mime =
        response.headers.get("content-type")?.split(";")[0]?.trim() ||
        "image/jpeg";
      if (!mime.startsWith("image/")) continue;
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length === 0 || buffer.length > MAX_MIRRORED_PHOTO_BYTES)
        continue;
      const { url } = await upload(
        buffer.toString("base64"),
        mime,
        websiteId,
        "gmb"
      );
      mirrored.push(url);
    } catch (err) {
      console.warn(
        `[GMB Fotos] Spiegelung eines Fotos übersprungen (Website ${websiteId}):`,
        err
      );
    }
  }
  return mirrored;
}
