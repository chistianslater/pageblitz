import { describe, expect, test, vi } from "vitest";
import { getConstitution } from "@shared/stylePacks";

describe("packFontHrefs", () => {
  test("liefert eine Google-Fonts-URL mit allen Familien einer echten Verfassung (werkbank)", async () => {
    const { packFontHrefs } = await import("./packFonts");
    const constitution = getConstitution("werkbank");
    const hrefs = packFontHrefs("werkbank");

    expect(hrefs).toHaveLength(1);
    expect(hrefs[0]).toContain("https://fonts.googleapis.com/css2?");
    expect(hrefs[0]).toContain(`family=${constitution.type.display.googleCss}`);
    expect(hrefs[0]).toContain(`family=${constitution.type.body.googleCss}`);
    if (constitution.type.utility) {
      expect(hrefs[0]).toContain(
        `family=${constitution.type.utility.googleCss}`
      );
    }
    expect(hrefs[0]).toContain("&display=swap");
  });

  test("dedupliziert identische googleCss-Werte über display/body/utility hinweg", async () => {
    vi.resetModules();
    vi.doMock("@shared/stylePacks", () => ({
      getConstitution: () => ({
        id: "werkbank",
        type: {
          display: {
            family: "Inter Tight",
            weights: [700],
            fallback: "sans-serif",
            googleCss: "Inter+Tight:wght@700",
          },
          body: {
            family: "Inter Tight",
            weights: [700],
            fallback: "sans-serif",
            googleCss: "Inter+Tight:wght@700",
          },
          utility: {
            family: "Space Mono",
            weights: [400],
            fallback: "monospace",
            googleCss: "Space+Mono",
          },
        },
      }),
    }));
    const { packFontHrefs } = await import("./packFonts");

    const hrefs = packFontHrefs("werkbank");
    expect(hrefs).toHaveLength(1);
    const familyOccurrences =
      hrefs[0].split("family=Inter+Tight:wght@700").length - 1;
    expect(familyOccurrences).toBe(1);
    expect(hrefs[0]).toContain("family=Space+Mono");

    vi.doUnmock("@shared/stylePacks");
    vi.resetModules();
  });

  test("Verfassung ohne utility-Font liefert trotzdem eine gültige URL mit display+body", async () => {
    vi.resetModules();
    vi.doMock("@shared/stylePacks", () => ({
      getConstitution: () => ({
        id: "werkbank",
        type: {
          display: {
            family: "A",
            weights: [400],
            fallback: "serif",
            googleCss: "A:wght@400",
          },
          body: {
            family: "B",
            weights: [400],
            fallback: "sans-serif",
            googleCss: "B:wght@400",
          },
        },
      }),
    }));
    const { packFontHrefs } = await import("./packFonts");

    const hrefs = packFontHrefs("werkbank");
    expect(hrefs).toHaveLength(1);
    expect(hrefs[0]).toContain("family=A:wght@400");
    expect(hrefs[0]).toContain("family=B:wght@400");

    vi.doUnmock("@shared/stylePacks");
    vi.resetModules();
  });
});
