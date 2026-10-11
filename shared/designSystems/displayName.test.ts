import { describe, expect, test } from "vitest";
import { displayName } from "./displayName";

describe("displayName", () => {
  test.each([
    ["Hairlounge Hachtkemper GmbH", "Hairlounge Hachtkemper"],
    ["Müller & Söhne GmbH & Co. KG", "Müller & Söhne"],
    ["Müller & Söhne GmbH & Co KG", "Müller & Söhne"],
    ["Bau Schulte GmbH & Co. KGaA", "Bau Schulte"],
    ["Salon e.K.", "Salon"],
    ["Salon e. K.", "Salon"],
    ["Blumen Meyer e.Kfm.", "Blumen Meyer"],
    ["Blumen Meyer e.Kfr.", "Blumen Meyer"],
    ["Kosmetik Lena UG (haftungsbeschränkt)", "Kosmetik Lena"],
    ["Kosmetik Lena UG (Haftungsbeschränkt) & Co. KG", "Kosmetik Lena"],
    ["Kosmetik Lena UG", "Kosmetik Lena"],
    ["Werkstatt Becker KG", "Werkstatt Becker"],
    ["Becker & Partner OHG", "Becker & Partner"],
    ["Praxis Nord GbR", "Praxis Nord"],
    ["Stadtwerke Beispiel AG", "Stadtwerke Beispiel"],
    ["Lebenshilfe Nord gGmbH", "Lebenshilfe Nord"],
    ["Tischlerei Holz mbH", "Tischlerei Holz"],
    ["Tischlerei Holz, GmbH", "Tischlerei Holz"],
    ["Tischlerei Holz GMBH", "Tischlerei Holz"],
    ["Tischlerei Holz gmbh.", "Tischlerei Holz"],
    ["Haarem Inh. Maria Müller", "Haarem"],
    ["Haarem - Inh. Maria Müller", "Haarem"],
    ["Haarem, Inhaberin Maria Müller", "Haarem"],
    ["Haarem GmbH, Inh. Maria Müller", "Haarem"],
    ["  Hairlounge Hachtkemper GmbH  ", "Hairlounge Hachtkemper"],
  ])("%s → %s", (input, expected) => {
    expect(displayName(input)).toBe(expected);
  });

  test.each([
    "AG Friseure",
    "GmbH",
    "KG",
    "Inh. Maria",
    "NOIR Haarstudio",
    "Agnes Haarstudio",
    "Salon Kagel",
    "Studio Gbrand",
    "Haus Ugarte",
    "Café Ohgott",
  ])("%s bleibt unverändert", name => {
    expect(displayName(name)).toBe(name);
  });

  test("nie leer oder kürzer als zwei Zeichen", () => {
    expect(displayName("X GmbH")).toBe("X GmbH");
    expect(displayName("AB GmbH")).toBe("AB");
    expect(displayName("")).toBe("");
  });
});
