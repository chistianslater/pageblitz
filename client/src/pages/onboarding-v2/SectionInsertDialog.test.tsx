import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { WebsiteDataV2 } from "@shared/siteContract/types";
import { SectionInsertChoices } from "./SectionInsertDialog";

const doc: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Brandt",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "H" },
    { type: "quote", text: "Z" },
    { type: "contact" },
  ],
};

describe("SectionInsertChoices (Plus-Zonen, 2026-09-03)", () => {
  test("zeigt sechs Sektionstypen, nennt die Position und sperrt vorhandene", () => {
    const html = renderToStaticMarkup(
      <SectionInsertChoices
        doc={doc}
        afterType="hero"
        onPick={() => {}}
        pending={null}
      />
    );
    expect(html.match(/class="pb-insert-choice"/g)).toHaveLength(6);
    expect(html).toContain("nach „Hero“");
    expect(html).toMatch(
      /disabled=""[^>]*>[\s\S]*?Zitat[\s\S]*?schon vorhanden/
    );
    expect(html).toContain("Ablauf");
  });

  test("laufender Einfügevorgang markiert die gewählte Kachel", () => {
    const html = renderToStaticMarkup(
      <SectionInsertChoices
        doc={doc}
        afterType="hero"
        onPick={() => {}}
        pending="process"
      />
    );
    expect(html).toMatch(/aria-busy="true"[^>]*>[\s\S]*?Ablauf/);
  });
});
