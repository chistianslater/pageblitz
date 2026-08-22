import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LiveCard } from "./LiveCard";

describe("LiveCard", () => {
  test("zeigt Live-Hinweis, öffentliche URL und Dashboard-Link", () => {
    const html = renderToStaticMarkup(<LiveCard slug="schreinerei-brandt" />);
    expect(html).toContain("Deine Website ist live");
    expect(html).toContain("https://schreinerei-brandt.pageblitz.de");
    expect(html).toContain('href="https://schreinerei-brandt.pageblitz.de"');
    expect(html).toContain('rel="noreferrer"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('href="/my-website"');
    expect(html).toContain("Zum Dashboard");
  });
});
