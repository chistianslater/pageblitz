import { describe, expect, test } from "vitest";
import { PACK_IDS } from "../siteContract/packIds";
import { pickArtTheme } from "./artThemes";
import { PACK_FONT_PAIRS } from "./packVariants";
import { getConstitution, toCssVars } from "./index";
import { contrastRatio } from "./colorMath";
describe("customer art themes", () => {
  test.each(PACK_IDS)(
    "%s varies color and curated type with readable final tokens",
    pack => {
      const colors = new Set<string>();
      const fonts = new Set<string>();
      for (let i = 0; i < 40; i++) {
        const theme = pickArtTheme(pack, `Kunde ${i}`);
        expect(pickArtTheme(pack, `Kunde ${i}`)).toEqual(theme);
        expect(PACK_FONT_PAIRS[pack]).toContain(theme.fontPairId);
        colors.add(JSON.stringify(theme.colorOverrides));
        fonts.add(theme.fontPairId);
        const vars = toCssVars(getConstitution(pack), theme.colorOverrides);
        for (const background of ["--pb-canvas", "--pb-surface"]) {
          expect(
            contrastRatio(vars["--pb-ink"], vars[background])
          ).toBeGreaterThanOrEqual(4.49);
          expect(
            contrastRatio(vars["--pb-muted"], vars[background])
          ).toBeGreaterThanOrEqual(4.49);
        }
        expect(
          contrastRatio(vars["--pb-accent-contrast"], vars["--pb-accent"])
        ).toBeGreaterThanOrEqual(4.49);
      }
      expect(colors.size).toBeGreaterThanOrEqual(4);
      expect(fonts.size).toBe(3);
    }
  );
});
