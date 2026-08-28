import { describe, expect, test } from "vitest";
import {
  isTrustedPlaceholderGallery,
  isTrustedPlaceholderImageUrl,
} from "./placeholderImages";

describe("isTrustedPlaceholderImageUrl", () => {
  test("erkennt Pack-Demo, Unsplash und Pageblitz-R2", () => {
    expect(isTrustedPlaceholderImageUrl("/demo/werkbank-hero.webp")).toBe(true);
    expect(
      isTrustedPlaceholderImageUrl(
        "https://images.unsplash.com/photo-1557683316-973673baf926?w=1400"
      )
    ).toBe(true);
    expect(
      isTrustedPlaceholderImageUrl(
        "https://media.pageblitz.de/website-1/gmb-1.jpg"
      )
    ).toBe(true);
  });

  test("lehnt LLM-Fantasie und javascript-URLs ab", () => {
    expect(
      isTrustedPlaceholderImageUrl("https://fantasie.example/x.jpg")
    ).toBe(false);
    expect(isTrustedPlaceholderImageUrl("javascript:alert(1)")).toBe(false);
    expect(isTrustedPlaceholderImageUrl("")).toBe(false);
  });
});

describe("isTrustedPlaceholderGallery", () => {
  test("leer oder gemischt mit Fremd-URL → false", () => {
    expect(isTrustedPlaceholderGallery([])).toBe(false);
    expect(
      isTrustedPlaceholderGallery([
        { url: "/demo/werkbank-hero.webp" },
        { url: "https://fantasie.example/x.jpg" },
      ])
    ).toBe(false);
  });

  test("nur Pack-/Stock-URLs → true", () => {
    expect(
      isTrustedPlaceholderGallery([
        { url: "/demo/werkbank-hero.webp" },
        { url: "https://images.unsplash.com/photo-1" },
      ])
    ).toBe(true);
  });
});
