import { describe, expect, test } from "vitest";
import { normalizeInlineText, previewPath } from "./PreviewFrame";

describe("PreviewFrame helpers", () => {
  test("normalisiert Zeilenumbrüche und Mehrfach-Leerzeichen für DOM-Matching", () => {
    expect(normalizeInlineText("  Massarbeit\n aus   Holz.  ")).toBe(
      "Massarbeit aus Holz."
    );
  });

  test("baut Startseiten- und Unterseitenpfad", () => {
    expect(previewPath("tok")).toBe("/preview-ssr/tok");
    expect(previewPath("tok", "leistungen")).toBe(
      "/preview-ssr/tok/leistungen"
    );
  });
});
