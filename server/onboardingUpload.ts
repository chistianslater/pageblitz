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
