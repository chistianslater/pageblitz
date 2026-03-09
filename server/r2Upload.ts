/**
 * R2 Storage Upload Handler
 * Uploads images to Cloudflare R2
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ENV } from "./_core/env";
import { nanoid } from "nanoid";

const MAX_PHOTO_WIDTH = 1920;
const MAX_PHOTO_HEIGHT = 1080;
const JPEG_QUALITY = 82;

// S3 Client für R2
function getS3Client(): S3Client {
  if (!ENV.r2AccountId || !ENV.r2AccessKeyId || !ENV.r2SecretAccessKey) {
    throw new Error("R2 credentials not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${ENV.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ENV.r2AccessKeyId,
      secretAccessKey: ENV.r2SecretAccessKey,
    },
  });
}

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Compress and upload image to R2
 * Accepts base64-encoded image data
 */
export async function uploadImageToR2(
  base64Data: string,
  mimeType: string,
  websiteId: number,
  prefix: string = "gallery"
): Promise<UploadResult> {
  const bucketName = ENV.r2BucketName || "pageblitz-media";

  // Remove data URL prefix if present
  const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(cleanBase64, "base64");

  // Generate unique key
  const key = `website-${websiteId}/${prefix}-${nanoid(8)}.jpg`;

  try {
    const s3Client = getS3Client();

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: "image/jpeg",
    });

    await s3Client.send(command);

    // Build public URL
    const publicUrl = ENV.r2PublicUrl
      ? `${ENV.r2PublicUrl.replace(/\/$/, "")}/${key}`
      : `https://${ENV.r2AccountId}.r2.cloudflarestorage.com/${bucketName}/${key}`;

    return {
      url: publicUrl,
      key,
    };
  } catch (error) {
    console.error("[R2 Upload] Failed:", error);
    throw new Error(`R2 upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
