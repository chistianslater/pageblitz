import { describe, expect, test } from "vitest";
import { offerForPreview, teamForPreview } from "./offerPreview";

describe("offerForPreview — halbfertige Entwürfe vorschautauglich machen", () => {
  test("leere Zeilen fallen weg, fehlender Preis wird Platzhalter", () => {
    const result = offerForPreview({
      mode: "menu",
      categories: [
        {
          name: "Döner",
          items: [
            { name: "Döner im Brot", price: "" },
            { name: "", price: "" },
          ],
        },
        { name: "", items: [{ name: "", price: "" }] },
      ],
    });
    expect(result).toEqual({
      mode: "menu",
      categories: [
        { name: "Döner", items: [{ name: "Döner im Brot", price: "…" }] },
      ],
    });
  });

  test("Kategorie ohne Namen bekommt Platzhalter, wenn Gerichte da sind", () => {
    const result = offerForPreview({
      mode: "menu",
      categories: [{ name: " ", items: [{ name: "Pommes", price: "3,50" }] }],
    });
    expect(result?.mode === "menu" && result.categories[0].name).toBe("…");
  });

  test("ganz leerer Entwurf → null", () => {
    expect(
      offerForPreview({
        mode: "menu",
        categories: [{ name: "", items: [{ name: "", price: "" }] }],
      })
    ).toBeNull();
  });

  test("fertiger Button bleibt, unfertiger fällt weg", () => {
    const base = {
      mode: "menu" as const,
      categories: [{ name: "Döner", items: [{ name: "Dürüm", price: "8" }] }],
    };
    expect(
      offerForPreview({
        ...base,
        link: { text: "Online bestellen", href: "https://a.de" },
      })?.link
    ).toEqual({ text: "Online bestellen", href: "https://a.de" });
    expect(
      offerForPreview({
        ...base,
        link: { text: "Online bestellen", href: "dicle" },
      })?.link
    ).toBeUndefined();
  });

  test("Leistungen ohne Überschrift bekommen den Standardtitel", () => {
    expect(
      offerForPreview({
        mode: "services",
        headline: "",
        items: [{ title: "Beratung" }, { title: "" }],
      })
    ).toEqual({
      mode: "services",
      headline: "Leistungen",
      items: [{ title: "Beratung" }],
    });
  });

  test("Unsinn → null", () => {
    expect(offerForPreview(null)).toBeNull();
    expect(offerForPreview({ mode: "disco" })).toBeNull();
  });
});

describe("teamForPreview", () => {
  test("Mitglieder ohne Namen fallen weg, Rolle und Foto bleiben", () => {
    expect(
      teamForPreview({
        headline: "Unser Team",
        members: [
          { name: "Mehmet", role: "Inhaber", imageUrl: "https://a.de/m.jpg" },
          { name: " ", role: "Koch" },
        ],
      })
    ).toEqual({
      headline: "Unser Team",
      members: [
        { name: "Mehmet", role: "Inhaber", imageUrl: "https://a.de/m.jpg" },
      ],
    });
  });
  test("unsichere Foto-Adresse fällt weg", () => {
    expect(
      teamForPreview({ members: [{ name: "A", imageUrl: "javascript:x" }] })
    ).toEqual({ members: [{ name: "A" }] });
  });
  test("keine Mitglieder → leere Liste (Sektion verschwindet)", () => {
    expect(teamForPreview({ members: [] })).toEqual({ members: [] });
    expect(teamForPreview("quatsch")).toBeNull();
  });
});
