// @vitest-environment jsdom
import { describe, expect, test } from "vitest";
import {
  isInlineLocked,
  normalizeInlineText,
  previewPath,
  buildPreviewSrc,
  photoClickTargetOf,
  previewScheme,
  shownPreviewSystem,
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

  test("Studio-iframe trägt ?studio=1, „In neuem Tab öffnen“ nicht (2026-10-13)", () => {
    expect(buildPreviewSrc({ token: "tok", version: 3 })).toContain(
      "studio=1"
    );
    expect(previewPath("tok")).not.toContain("studio");
    expect(previewPath("tok", "leistungen")).not.toContain("?");
  });

  test("buildPreviewSrc hängt ?version= für einen Verlaufs-Stand an (2026-09-03)", () => {
    expect(buildPreviewSrc({ token: "tok", version: 3 })).toBe(
      "/preview-ssr/tok?studio=1&v=3"
    );
    expect(buildPreviewSrc({ token: "tok", version: 3, versionId: 17 })).toBe(
      "/preview-ssr/tok?version=17&studio=1&v=3"
    );
    expect(
      buildPreviewSrc({
        token: "tok",
        version: 1,
        pageSlug: "leistungen",
        reveal: true,
      })
    ).toBe("/preview-ssr/tok/leistungen?reveal=1&studio=1&v=1");
  });

  test("buildPreviewSrc: nur noch ?system=&palette= als Override", () => {
    expect(
      buildPreviewSrc({
        token: "tok",
        version: 2,
        system: "journal",
        palette: "salbei",
      })
    ).toBe("/preview-ssr/tok?system=journal&palette=salbei&studio=1&v=2");
    expect(
      buildPreviewSrc({ token: "tok", version: 2, system: "journal" })
    ).toBe("/preview-ssr/tok?system=journal&studio=1&v=2");
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

test("non-text icon nodes do not abort inline editing", () => { expect(normalizeInlineText(undefined)).toBe(""); expect(normalizeInlineText(null)).toBe(""); });

describe("Vorschau-Rahmen: Farbschema", () => {
  test("dunkel nur bei Systemen mit dunklem Papier (Nacht)", () => {
    expect(previewScheme("nacht")).toBe("dark");
    for (const id of ["journal", "raster", "werkstoff", "plakat", "klar"] as const)
      expect(previewScheme(id)).toBeUndefined();
    expect(previewScheme(null)).toBeUndefined();
    expect(previewScheme(undefined)).toBeUndefined();
  });

  test("System-Override hat Vorrang vor dem System des Dokuments", () => {
    const scheme = (args: Parameters<typeof shownPreviewSystem>[0]) =>
      previewScheme(shownPreviewSystem(args));
    expect(scheme({ docSystem: "nacht" })).toBe("dark");
    expect(scheme({ docSystem: "klar", systemOverride: "nacht" })).toBe("dark");
    expect(scheme({ docSystem: "nacht", systemOverride: "klar" })).toBeUndefined();
    expect(shownPreviewSystem({ docSystem: "klar" })).toBe("klar");
  });
});
