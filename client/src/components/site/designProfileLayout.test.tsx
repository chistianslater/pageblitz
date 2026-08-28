import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { STYLE_PACKS } from "@shared/stylePacks";
import { getFixture } from "../../../../shared/siteContract/fixtures";
import type { DesignProfile } from "../../../../shared/siteContract/designProfile";
import type { PackId } from "../../../../shared/siteContract/types";
import { SiteRenderer } from "./SiteRenderer";
import "./packs/index";

const PROFILE: DesignProfile = {
  version: 1,
  heroLayout: "centered",
  servicesLayout: "grid",
  aboutLayout: "image-left",
  galleryLayout: "filmstrip",
  density: "compact",
  imageTreatment: "framed",
  seed: 7,
};

describe("Designprofil-Layout in allen Packs", () => {
  const packIds = Object.keys(STYLE_PACKS) as PackId[];

  test("Registry ist vollständig (sonst wäre die Suite trivial)", () => {
    expect(packIds.length).toBeGreaterThanOrEqual(14);
  });

  test.each(packIds)(
    "%s: Profil-CSS wird injiziert und Layout-Slots sitzen an Hero/Leistungen/About/Galerie",
    packId => {
      const fixture = getFixture(packId, "full");
      const html = renderToStaticMarkup(
        <SiteRenderer data={{ ...fixture, designProfile: PROFILE }} />
      );
      expect(html).toContain('data-pb-hero="centered"');
      expect(html).toContain('data-pb-services="grid"');
      expect(html).toContain('[data-pb-slot="services-items"]');
      expect(html).toContain('data-pb-slot="services-items"');
      if (fixture.sections.some(s => s.type === "about")) {
        expect(html).toContain('data-pb-slot="about-grid"');
      }
      if (fixture.sections.some(s => s.type === "gallery")) {
        expect(html).toContain('data-pb-slot="gallery-items"');
      }
    }
  );

  test("ohne Profil bleibt die Pack-Komposition unangetastet (keine Varianten-CSS)", () => {
    const html = renderToStaticMarkup(
      <SiteRenderer data={getFixture("werkbank", "full")} />
    );
    expect(html).not.toContain("data-pb-hero=");
    expect(html).not.toContain("[data-pb-services=");
  });
});
