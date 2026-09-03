import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { WebsiteDataV2 } from "../../../../../shared/siteContract/types";
import { CollagePicker, nextCollageSelection } from "./CollagePicker";

const PROFILE = {
  version: 1,
  heroLayout: "collage",
  servicesLayout: "list",
  aboutLayout: "image-right",
  galleryLayout: "grid",
  density: "airy",
  imageTreatment: "natural",
  seed: 3,
} as const;

const doc = (over: Partial<WebsiteDataV2> = {}): WebsiteDataV2 => ({
  version: 2,
  stylePackId: "werkbank",
  businessName: "Test",
  seo: { title: "t", description: "d" },
  designProfile: { ...PROFILE },
  sections: [
    { type: "hero", headline: "H", imageUrl: "https://x/hero.jpg" },
    {
      type: "gallery",
      images: [
        { url: "https://x/g1.jpg", alt: "" },
        { url: "https://x/g2.jpg", alt: "" },
        { url: "https://x/g3.jpg", alt: "" },
      ],
    },
    { type: "about", headline: "Ü", body: "B", imageUrl: "https://x/ab.jpg" },
  ],
  ...over,
});

const html = (d: WebsiteDataV2, error: string | null = null) =>
  renderToStaticMarkup(
    <CollagePicker doc={d} onChange={() => {}} busy={false} error={error} />
  );

describe("nextCollageSelection", () => {
  test("ein noch freier Platz nimmt das Foto zusätzlich auf", () => {
    expect(nextCollageSelection(["a"], "b")).toEqual(["a", "b"]);
  });

  test("ein bereits gewähltes Foto wird abgewählt", () => {
    expect(nextCollageSelection(["a", "b"], "a")).toEqual(["b"]);
  });

  test("bei voller Auswahl weicht das älteste Foto", () => {
    expect(nextCollageSelection(["a", "b"], "c")).toEqual(["b", "c"]);
  });

  test("aus leerer Auswahl wird eine einelementige", () => {
    expect(nextCollageSelection([], "a")).toEqual(["a"]);
  });
});

describe("CollagePicker", () => {
  test("zeigt nichts, wenn das Hero-Layout keine Collage ist", () => {
    expect(
      html(doc({ designProfile: { ...PROFILE, heroLayout: "split" } }))
    ).toBe("");
  });

  test("mobiles Collage-Layout genügt ebenfalls", () => {
    const markup = html(
      doc({
        designProfile: {
          ...PROFILE,
          heroLayout: "split",
          heroLayoutMobile: "collage",
        },
      })
    );
    expect(markup).toContain('aria-label="Collage-Fotos"');
  });

  test("ohne eigene Wahl sind die automatisch genutzten Fotos markiert", () => {
    const markup = html(doc());
    expect(markup.match(/aria-pressed="true"/g)).toHaveLength(2);
    expect(markup).toMatch(
      /aria-pressed="true"[^>]*aria-label="Foto 1"[\s\S]*?aria-pressed="true"[^>]*aria-label="Foto 2"/
    );
    expect(markup).toMatch(/aria-pressed="false"[^>]*aria-label="Foto 3"/);
  });

  test("eigene Wahl schlägt die automatische", () => {
    const markup = html(
      doc({
        designProfile: {
          ...PROFILE,
          heroCollageImages: ["https://x/g3.jpg"],
        },
      })
    );
    expect(markup.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(markup).toMatch(/aria-pressed="true"[^>]*aria-label="Foto 3"/);
  });

  test("Automatisch ist ohne eigene Wahl gesperrt und mit Wahl anklickbar", () => {
    expect(html(doc())).toMatch(/Automatisch/);
    expect(html(doc())).toMatch(/disabled=""[^>]*>\s*Automatisch|Automatisch/);
    const own = html(
      doc({
        designProfile: {
          ...PROFILE,
          heroCollageImages: ["https://x/g1.jpg"],
        },
      })
    );
    // Genau ein disabled-Attribut weniger als im Automatik-Fall.
    const countDisabled = (s: string) => (s.match(/disabled=""/g) ?? []).length;
    expect(countDisabled(own)).toBe(countDisabled(html(doc())) - 1);
  });

  test("ohne Zusatzfotos erklärt es, woher die Fotos kommen", () => {
    const d = doc();
    d.sections = [d.sections[0]];
    const markup = html(d);
    expect(markup).toContain("Galerie");
    expect(markup).not.toContain('aria-label="Foto 1"');
  });

  test("Fehlermeldung wird angezeigt", () => {
    expect(html(doc(), "Ging nicht")).toContain("Ging nicht");
  });
});
