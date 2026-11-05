import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { PublishTeaser } from "./PublishPanel";

describe("PublishTeaser", () => {
  test("bietet vor der E-Mail-Erfassung zuerst die kostenlose Sicherung an", () => {
    const html = renderToStaticMarkup(
      <PublishTeaser hasEmail={false} onOpen={() => {}} />
    );
    expect(html).toContain("Entwurf per E-Mail sichern");
    expect(html).toContain("persönlichen Link");
    expect(html).toContain("Kostenlos");
  });

  test("wird nach der Sicherung wieder zum Freischalten-Schritt", () => {
    const html = renderToStaticMarkup(
      <PublishTeaser hasEmail onOpen={() => {}} />
    );
    expect(html).toContain("Website freischalten");
    expect(html).toContain("Zum Schluss");
  });
});
