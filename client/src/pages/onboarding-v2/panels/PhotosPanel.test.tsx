import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PhotoGrid, PhotoTargetPicker } from "./photoParts";

describe("PhotoGrid", () => {
  test("rendert Buttons mit aria-pressed für ausgewählte Fotos", () => {
    const html = renderToStaticMarkup(
      <PhotoGrid
        photos={["https://example.com/a.jpg", "https://example.com/b.jpg"]}
        selected={["https://example.com/b.jpg"]}
        onPick={() => {}}
        emptyText="Keine Fotos gefunden."
      />
    );
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain("https://example.com/a.jpg");
    expect(html).toContain("https://example.com/b.jpg");
    expect(html).not.toContain("Keine Fotos gefunden.");
  });

  test("zeigt emptyText, wenn keine Fotos vorhanden sind", () => {
    const html = renderToStaticMarkup(
      <PhotoGrid
        photos={[]}
        selected={[]}
        onPick={() => {}}
        emptyText="Keine Fotos gefunden."
      />
    );
    expect(html).toContain("Keine Fotos gefunden.");
  });
});

describe("PhotoTargetPicker", () => {
  test("zeigt Hero, Über uns und Galerie, wenn hasAbout true ist", () => {
    const html = renderToStaticMarkup(
      <PhotoTargetPicker target="hero" onTarget={() => {}} hasAbout={true} />
    );
    expect(html).toContain("Hero");
    expect(html).toContain("Über uns");
    expect(html).toContain("Galerie");
  });

  test("blendet Über-uns-Option aus, wenn hasAbout false ist", () => {
    const html = renderToStaticMarkup(
      <PhotoTargetPicker target="hero" onTarget={() => {}} hasAbout={false} />
    );
    expect(html).not.toContain("Über uns");
    expect(html).toContain("Hero");
    expect(html).toContain("Galerie");
  });
});
