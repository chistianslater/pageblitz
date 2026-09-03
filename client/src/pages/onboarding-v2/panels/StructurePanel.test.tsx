import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "@shared/siteContract/types";
import { orderForSave, rowsFromDoc } from "./StructurePanel";

function doc(
  types: string[],
  extra: Partial<WebsiteDataV2> = {}
): WebsiteDataV2 {
  return {
    version: 2,
    stylePackId: "werkbank",
    businessName: "Brandt",
    seo: { title: "t", description: "d" },
    sections: types.map(type => ({ type }) as never),
    ...extra,
  } as WebsiteDataV2;
}

describe("StructurePanel: Hinweis-Banner verwalten (Befund 2026-09-03)", () => {
  test("der Hinweis-Banner erscheint als eigene Zeile, festgepinnt und nicht verschiebbar", () => {
    const rows = rowsFromDoc(doc(["notice", "hero", "services", "contact"]));
    expect(rows.map(r => r.type)).toEqual([
      "notice",
      "hero",
      "services",
      "contact",
    ]);
    expect(rows[0]).toMatchObject({ type: "notice", pinned: true });
    expect(rows[1]).toMatchObject({ type: "hero", pinned: true });
    expect(rows[2].pinned).toBe(false);
  });

  test("ohne Banner bleibt die Liste wie bisher", () => {
    expect(rowsFromDoc(doc(["hero", "services", "contact"])).map(r => r.type)).toEqual(
      ["hero", "services", "contact"]
    );
  });

  test("eigene Reihenfolge wird beachtet, der Banner bleibt trotzdem vorn", () => {
    const rows = rowsFromDoc(
      doc(["hero", "services", "notice", "about", "contact"], {
        sectionOrder: ["hero", "about", "services", "notice", "contact"] as never,
      })
    );
    expect(rows.map(r => r.type)).toEqual([
      "notice",
      "hero",
      "about",
      "services",
      "contact",
    ]);
  });

  test("Speichern schreibt den Banner zuerst und listet jede Sektion genau einmal", () => {
    const rows = rowsFromDoc(doc(["notice", "hero", "services", "contact"]));
    const order = orderForSave(rows);
    expect(order).toEqual(["notice", "hero", "services", "contact"]);
    expect(new Set(order).size).toBe(order.length);
  });

  test("ausgeblendeter Banner wird als versteckt gelesen", () => {
    const rows = rowsFromDoc(
      doc(["notice", "hero", "contact"], { hiddenSections: ["notice"] as never })
    );
    expect(rows.find(r => r.type === "notice")?.hidden).toBe(true);
  });
});
