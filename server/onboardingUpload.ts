/**
 * Onboarding Upload Handler
 * Compresses and uploads logo/photos to S3 during onboarding.
 */
import sharp from "sharp";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

const MAX_PHOTO_WIDTH = 1920;
const MAX_PHOTO_HEIGHT = 1080;
const JPEG_QUALITY = 82;

export interface UploadResult {
  url: string;
  key: string;
  width: number;
  height: number;
  sizeBytes: number;
}

/**
 * Compresses and uploads a photo.
 * Accepts base64-encoded image data.
 */
export async function uploadPhoto(
  base64Data: string,
  mimeType: string,
  websiteId: number,
  index: number
): Promise<UploadResult> {
  const buffer = Buffer.from(
    base64Data.replace(/^data:[^;]+;base64,/, ""),
    "base64"
  );

  const processed = await sharp(buffer)
    .resize(MAX_PHOTO_WIDTH, MAX_PHOTO_HEIGHT, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY, progressive: true })
    .toBuffer();

  const metadata = await sharp(processed).metadata();
  const key = `onboarding/${websiteId}/photo-${index}-${nanoid(8)}.jpg`;
  const { url } = await storagePut(key, processed, "image/jpeg");

  return {
    url,
    key,
    width: metadata.width || 0,
    height: metadata.height || 0,
    sizeBytes: processed.length,
  };
}

const MAX_LOGO_WIDTH = 480;
const MAX_LOGO_HEIGHT = 240;

/**
 * Partner-/Zertifikats-Logo (2026-08-31): anders als uploadPhoto bleibt
 * die Transparenz erhalten — WebP mit Alpha statt JPEG, klein skaliert
 * (Logos rendern max. 64px hoch, siehe partnersSection.tsx).
 */
export async function uploadLogo(
  base64Data: string,
  mimeType: string,
  websiteId: number
): Promise<UploadResult> {
  const buffer = Buffer.from(
    base64Data.replace(/^data:[^;]+;base64,/, ""),
    "base64"
  );
  return storeLogoBuffer(buffer, websiteId);
}

/** Marken-Import (2026-09-03): höchstens 2 MB Logo von der Kunden-Website. */
const MAX_REMOTE_LOGO_BYTES = 2 * 1024 * 1024;

/**
 * Logo von einer URL übernehmen (Marken-Import Scheibe 1). Die URL stammt
 * ausschließlich aus `crawlSiteBranding` und ist damit same-origin zur
 * Betriebs-Website; hier wird zusätzlich Inhaltstyp und Größe geprüft.
 * Jeder Fehler → null, der Import läuft ohne Logo weiter.
 */
export async function uploadLogoFromUrl(
  url: string,
  websiteId: number,
  fetchImpl: typeof fetch = fetch
): Promise<UploadResult | null> {
  try {
    const response = await fetchImpl(url, {
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    if (!response.ok) return null;
    const type = response.headers.get("content-type") ?? "";
    if (!/^image\/(png|jpe?g|webp|svg\+xml)/i.test(type)) return null;
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_REMOTE_LOGO_BYTES) {
      return null;
    }
    return await storeLogoBuffer(Buffer.from(bytes), websiteId);
  } catch {
    return null;
  }
}

/** Gemeinsame Verarbeitung: WebP mit Alpha, klein skaliert, Ablage in R2. */
async function storeLogoBuffer(
  buffer: Buffer,
  websiteId: number
): Promise<UploadResult> {
  const processed = await sharp(buffer)
    .resize(MAX_LOGO_WIDTH, MAX_LOGO_HEIGHT, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 88 })
    .toBuffer();

  const metadata = await sharp(processed).metadata();
  const key = `onboarding/${websiteId}/logo-${nanoid(8)}.webp`;
  const { url } = await storagePut(key, processed, "image/webp");

  return {
    url,
    key,
    width: metadata.width || 0,
    height: metadata.height || 0,
    sizeBytes: processed.length,
  };
}
