import React from "react";
import { describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const seen: string[][] = [];
vi.mock("./sections", async importOriginal => {
  const actual = await importOriginal<typeof import("./sections")>();
  return {
    ...actual,
    renderJournalSection: (
      section: { type: string },
      list: { type: string }[]
    ) => {
      if (section === list[0]) seen.push(list.map(s => s.type));
      return null;
    },
  };
});

import { SiteRenderer } from "../../SiteRenderer";
import "../registry";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { withDesignSystem } from "../../../../../../shared/designSystems/apply";

describe("Journal: Startseite rendert nur sichtbare Abschnitte", () => {
  test("hiddenSections und Reihenfolge greifen", () => {
    const doc = withDesignSystem(getFixture("salon-noir", "full"), "journal");
    expect(doc.sections.some(s => s.type === "testimonials")).toBe(true);
    seen.length = 0;
    renderToStaticMarkup(
      <SiteRenderer
        data={{ ...doc, hiddenSections: ["testimonials"] }}
        now={new Date()}
      />
    );
    expect(seen).toHaveLength(1);
    expect(seen[0]).not.toContain("testimonials");
    expect(seen[0]).toContain("services");
  });
});
