import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AiDiffList, AiStyleCard } from "./aiChatParts";

describe("AiDiffList", () => {
  test("rendert je Eintrag Label, vorher und nachher", () => {
    const html = renderToStaticMarkup(
      <AiDiffList
        diff={[
          {
            path: "sections.hero.headline",
            label: "Hero – Überschrift",
            before: "Willkommen",
            after: "Willkommen bei uns",
          },
          {
            path: "seo.title",
            label: "SEO – Titel",
            before: "Alt",
            after: "Neu",
          },
        ]}
      />
    );
    expect(html).toContain("Hero – Überschrift");
    expect(html).toContain("Willkommen");
    expect(html).toContain("Willkommen bei uns");
    expect(html).toContain("SEO – Titel");
    expect(html).toContain("Alt");
    expect(html).toContain("Neu");
  });

  test("zeigt bei leerer Liste einen Hinweis statt einer leeren Liste", () => {
    const html = renderToStaticMarkup(<AiDiffList diff={[]} />);
    expect(html).toContain("Keine Änderungen erkannt.");
    expect(html).not.toContain("<ul");
  });
});

describe("AiStyleCard", () => {
  test("zeigt Name, Begründung und einen Ansehen-Button", () => {
    const html = renderToStaticMarkup(
      <AiStyleCard
        name="Werkbank"
        reason="Passt besser zu einem Handwerksbetrieb."
        onView={() => {}}
      />
    );
    expect(html).toContain("Stil-Vorschlag");
    expect(html).toContain("Werkbank");
    expect(html).toContain("Passt besser zu einem Handwerksbetrieb.");
    expect(html).toContain(">Ansehen<");
  });
});
