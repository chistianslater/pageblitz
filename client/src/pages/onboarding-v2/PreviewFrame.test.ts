// @vitest-environment jsdom
import { describe, expect, test } from "vitest";
import {
  isInlineLocked,
  normalizeInlineText,
  previewPath,
  buildPreviewSrc,
  photoClickTargetOf,
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

  test("buildPreviewSrc hängt ?version= für einen Verlaufs-Stand an (2026-09-03)", () => {
    expect(buildPreviewSrc({ token: "tok", version: 3 })).toBe(
      "/preview-ssr/tok?v=3"
    );
    expect(buildPreviewSrc({ token: "tok", version: 3, versionId: 17 })).toBe(
      "/preview-ssr/tok?version=17&v=3"
    );
    expect(
      buildPreviewSrc({
        token: "tok",
        version: 1,
        pageSlug: "leistungen",
        packOverride: "kanzlei",
        reveal: true,
      })
    ).toBe("/preview-ssr/tok/leistungen?pack=kanzlei&reveal=1&v=1");
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

describe("photoClickTargetOf", () => {
  const build = (sectionId: string) => {
    const section = document.createElement("section");
    section.id = sectionId;
    const img = document.createElement("img");
    section.appendChild(img);
    document.body.appendChild(section);
    return img;
  };

  test("ordnet Bilder ihrer Sektion zu", () => {
    expect(photoClickTargetOf(build("start"))).toBe("hero");
    expect(photoClickTargetOf(build("ueber-uns"))).toBe("about");
    expect(photoClickTargetOf(build("galerie"))).toBe("gallery");
  });

  test("Bilder außerhalb der Foto-Sektionen liefern null", () => {
    expect(photoClickTargetOf(build("bewertungen"))).toBeNull();
  });
});
