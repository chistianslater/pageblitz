import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LiveCard } from "./LiveCard";

describe("LiveCard", () => {
  test("status=active: zeigt Live-Hinweis, öffentliche URL und Dashboard-Link", () => {
    const html = renderToStaticMarkup(
      <LiveCard slug="schreinerei-brandt" status="active" />
    );
    expect(html).toContain("Deine Website ist live");
    expect(html).toContain("https://schreinerei-brandt.pageblitz.de");
    expect(html).toContain('href="https://schreinerei-brandt.pageblitz.de"');
    expect(html).toContain('rel="noreferrer"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('href="/my-website"');
    expect(html).toContain("Zum Dashboard");
  });

  test("status=sold: zeigt Einrichtungshinweis ohne Live-Link, nur Dashboard-Link", () => {
    const html = renderToStaticMarkup(
      <LiveCard slug="schreinerei-brandt" status="sold" />
    );
    expect(html).toContain("Freigeschaltet");
    expect(html).not.toContain("https://schreinerei-brandt.pageblitz.de");
    expect(html).not.toContain("Deine Website ist live");
    expect(html).toContain('href="/my-website"');
    expect(html).toContain("Zum Dashboard");
  });

  test("status=inactive: zeigt Pausiert-Hinweis, keinen Live-Link, nur Dashboard-Link", () => {
    const html = renderToStaticMarkup(
      <LiveCard slug="schreinerei-brandt" status="inactive" />
    );
    expect(html).toContain("Deine Website ist pausiert");
    expect(html).not.toContain("https://schreinerei-brandt.pageblitz.de");
    expect(html).toContain('href="/my-website"');
    expect(html).toContain("Zum Dashboard");
  });
});
