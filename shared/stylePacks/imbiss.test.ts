import { describe, expect, test } from "vitest";
import { isImbissCategory } from "./imbiss";
import { pickArtTheme } from "./artThemes";
import { getConstitution, toCssVars } from "./index";
import { contrastRatio } from "./colorMath";

describe("Imbiss-Erkennung", () => {
  test.each([
    "Kebabimbiss",
    "Döner",
    "Dönerladen",
    "Burgerrestaurant",
    "Imbiss",
    "Asia-Imbiss",
    "Currywurstbude",
    "Pommesbude",
    "Falafel-Imbiss",
    "fast food restaurant",
    "meal takeaway",
    "Foodtruck",
    "Schnellrestaurant",
    "Pizzaservice",
  ])("%s ist Imbiss", kategorie => {
    expect(isImbissCategory(kategorie)).toBe(true);
  });

  test.each([
    "Restaurant",
    "Pizzeria",
    "Trattoria",
    "Café",
    "Weinbar",
    "Hotel",
    "Friseursalon",
    "",
    undefined,
  ])("%s ist kein Imbiss", kategorie => {
    expect(isImbissCategory(kategorie)).toBe(false);
  });
});

describe("Gusto-Imbiss-Farbwelt", () => {
  const KRAEFTIG = ["markant", "kraftvoll"];

  test("Imbiss bekommt kräftige Schrift und appetitliche Akzente, lesbar", () => {
    const akzente = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const theme = pickArtTheme("gusto", `Imbiss ${i}`, "Kebabimbiss");
      expect(pickArtTheme("gusto", `Imbiss ${i}`, "Kebabimbiss")).toEqual(
        theme
      );
      expect(KRAEFTIG).toContain(theme.fontPairId);
      akzente.add(theme.colorOverrides.accent);
      const vars = toCssVars(getConstitution("gusto"), theme.colorOverrides);
      for (const grund of ["--pb-canvas", "--pb-surface"]) {
        expect(
          contrastRatio(vars["--pb-ink"], vars[grund])
        ).toBeGreaterThanOrEqual(7);
        expect(
          contrastRatio(vars["--pb-muted"], vars[grund])
        ).toBeGreaterThanOrEqual(4.49);
      }
      expect(
        contrastRatio(vars["--pb-accent-contrast"], vars["--pb-accent"])
      ).toBeGreaterThanOrEqual(4.49);
    }
    expect(akzente.size).toBeGreaterThanOrEqual(3);
  });

  test("Restaurant bleibt bei der klassischen Gusto-Welt", () => {
    const restaurant = pickArtTheme("gusto", "Trattoria Roma", "Restaurant");
    expect(restaurant).toEqual(pickArtTheme("gusto", "Trattoria Roma"));
    expect(KRAEFTIG).not.toContain(restaurant.fontPairId);
  });

  test("andere Packs ignorieren die Kategorie", () => {
    expect(pickArtTheme("zunft", "Dicle", "Kebabimbiss")).toEqual(
      pickArtTheme("zunft", "Dicle")
    );
  });
});
