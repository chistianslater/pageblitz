// Preconfigured storage helpers for Manus WebDev templates
// Uses R2 if configured, otherwise falls back to the Biz-provided storage proxy

import { ENV } from './_core/env';
import { uploadImageToR2 } from './r2Upload';

type StorageConfig = { baseUrl: string; apiKey: string };

function getStorageConfig(): StorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

// Check if R2 is configured
function isR2Configured(): boolean {
  return !!(ENV.r2AccountId && ENV.r2AccessKeyId && ENV.r2SecretAccessKey);
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  // Remove trailing v1/ from baseUrl if present to avoid double v1/v1/
  const cleanBaseUrl = baseUrl.replace(/\/v1\/?$/, "");
  const url = new URL("v1/storage/upload", ensureTrailingSlash(cleanBaseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string
): Promise<string> {
  // Remove trailing v1/ from baseUrl if present to avoid double v1/v1/
  const cleanBaseUrl = baseUrl.replace(/\/v1\/?$/, "");
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(cleanBaseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey),
  });
  return (await response.json()).url;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  // Prefer R2 if configured
  if (isR2Configured()) {
    try {
      console.log("[Storage] Using R2 for upload");
      // Extract websiteId from relKey (e.g., "onboarding/123/photo-xxx.jpg")
      const match = relKey.match(/onboarding\/(\d+)\//);
      const websiteId = match ? parseInt(match[1], 10) : 0;
      const prefix = relKey.includes("logo") ? "logo" : "gallery";

      const result = await uploadImageToR2(
        typeof data === "string" ? data : data.toString("base64"),
        contentType,
        websiteId,
        prefix
      );
      console.log("[Storage] R2 upload successful:", result.url);
      return result;
    } catch (error) {
      console.error("[Storage] R2 upload failed, falling back to proxy:", error);
      // Fall through to proxy upload
    }
  }

  // Fallback to proxy storage
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);

  console.log("[Storage] Uploading to:", uploadUrl.toString());
  console.log("[Storage] Base URL was:", baseUrl);

  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    console.error("[Storage] Upload failed:", response.status, message);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  console.log("[Storage] Upload successful:", url);
  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey),
  };
}
