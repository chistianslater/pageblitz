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

describe("SectionInsertChoices: kostenpflichtige Extras (2026-09-04)", () => {
  const render = (addOns = {}, addonPending: string | null = null) =>
    renderToStaticMarkup(
      <SectionInsertChoices
        doc={doc}
        afterType="hero"
        onPick={() => {}}
        pending={null}
        addOns={addOns}
        onPickAddon={() => {}}
        addonPending={addonPending as never}
      />
    );

  test("zeigt die vier Sektions-Extras mit Monatspreis", () => {
    const html = render();
    expect(html.match(/class="pb-insert-choice pb-insert-paid"/g)).toHaveLength(
      4
    );
    expect(html.match(/3,90 €/g)).toHaveLength(4);
    expect(html).toContain("Bildergalerie");
    expect(html).toContain("pro Monat");
  });

  test("gebuchte Extras erscheinen nicht noch einmal zum Buchen", () => {
    const html = render({ gallery: true, team: true });
    expect(html.match(/class="pb-insert-choice pb-insert-paid"/g)).toHaveLength(
      2
    );
    expect(html).not.toContain("Bildergalerie");
  });

  test("ohne Extras-Rückgabe bleibt der Dialog wie bisher", () => {
    const html = renderToStaticMarkup(
      <SectionInsertChoices
        doc={doc}
        afterType="hero"
        onPick={() => {}}
        pending={null}
      />
    );
    expect(html).not.toContain("pb-insert-paid");
  });

  test("das laufende Extra meldet sich, die anderen sind gesperrt", () => {
    const html = render({}, "team");
    expect(html).toContain("Wird eingeschaltet …");
    expect((html.match(/disabled=""/g) ?? []).length).toBeGreaterThan(3);
  });
});
