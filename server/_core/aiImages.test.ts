import { describe, expect, test } from "vitest";
import {
  AI_IMAGES_PER_HOUR,
  buildAiImagePrompt,
  consumeAiImageQuota,
  isAiImagesConfigured,
} from "./aiImages";

describe("buildAiImagePrompt", () => {
  test("rahmt die Nutzereingabe als fotorealistisches Website-Foto", () => {
    const prompt = buildAiImagePrompt("  Empfangsbereich mit Blumen  ");
    expect(prompt).toContain("Empfangsbereich mit Blumen");
    expect(prompt).toContain("Photorealistic");
    expect(prompt).toContain("no watermark");
  });
});

describe("consumeAiImageQuota", () => {
  test("erlaubt das Stundenlimit und blockt danach (pro Website)", () => {
    const websiteId = 999_001;
    for (let i = 0; i < AI_IMAGES_PER_HOUR; i++) {
      expect(consumeAiImageQuota(websiteId)).toBe(true);
    }
    expect(consumeAiImageQuota(websiteId)).toBe(false);
    // Andere Website bleibt unberührt.
    expect(consumeAiImageQuota(999_002)).toBe(true);
  });
});

describe("isAiImagesConfigured", () => {
  test("ist ohne CLOUDFLARE_API_TOKEN aus", () => {
    const prev = process.env.CLOUDFLARE_API_TOKEN;
    delete process.env.CLOUDFLARE_API_TOKEN;
    expect(isAiImagesConfigured()).toBe(false);
    if (prev !== undefined) process.env.CLOUDFLARE_API_TOKEN = prev;
  });
});
