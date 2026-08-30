import { describe, expect, test } from "vitest";
import {
  isInlineLocked,
  normalizeInlineText,
  previewPath,
} from "./PreviewFrame";

describe("PreviewFrame helpers", () => {
  test("normalisiert Whitespace und Groß-/Kleinschreibung (text-transform) für DOM-Matching", () => {
    expect(normalizeInlineText("  Massarbeit\n aus   Holz.  ")).toBe(
      // Case-Fold: text-transform-feste Vergleiche (2026-08-30).
      "massarbeit aus holz."
    );
  });

  test("baut Startseiten- und Unterseitenpfad", () => {
    expect(previewPath("tok")).toBe("/preview-ssr/tok");
    expect(previewPath("tok", "leistungen")).toBe(
      "/preview-ssr/tok/leistungen"
    );
  });

  test("Google-Bewertungen hinter data-pb-readonly gelten als gesperrt", () => {
    expect(
      isInlineLocked({
        closest: (sel: string) =>
          sel === "[data-pb-readonly]" ? ({} as Element) : null,
      } as Element)
    ).toBe(true);
    expect(
      isInlineLocked({
        closest: () => null,
      } as unknown as Element)
    ).toBe(false);
  });
});
