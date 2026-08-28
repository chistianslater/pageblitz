import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { STYLE_PACKS } from "@shared/stylePacks";
import { getFixture } from "../../../../shared/siteContract/fixtures";
import type { DesignProfile } from "../../../../shared/siteContract/designProfile";
import type { PackId } from "../../../../shared/siteContract/types";
import { SiteRenderer } from "./SiteRenderer";
import { DESIGN_PROFILE_CSS } from "./designProfileCss";
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

  test("About-Grid-CSS greift nur mit data-pb-about, damit Pack-Defaults im Overlay bleiben", () => {
    expect(DESIGN_PROFILE_CSS).toContain(
      '.pb-site[data-pb-about] [data-pb-slot="about-grid"]'
    );
    expect(DESIGN_PROFILE_CSS).not.toContain(
      '.pb-site [data-pb-slot="about-grid"]'
    );
  });

  test("Desktop- und Mobil-Layouts sind getrennte Media-Queries", () => {
    expect(DESIGN_PROFILE_CSS).toContain("@media(min-width:721px)");
    expect(DESIGN_PROFILE_CSS).toContain("@media(max-width:720px)");
    expect(DESIGN_PROFILE_CSS).toContain('[data-pb-hero-mobile="centered"]');
    expect(DESIGN_PROFILE_CSS).toContain(
      ":not([data-pb-hero-mobile])[data-pb-hero="
    );
  });

  test("persistiertes Mobil-Profil landet als eigenes Attribut", () => {
    const html = renderToStaticMarkup(
      <SiteRenderer
        data={{
          ...getFixture("werkbank", "full"),
          designProfile: {
            ...PROFILE,
            heroLayoutMobile: "compact",
            servicesLayoutMobile: "list",
          },
        }}
      />
    );
    const root = html.match(/<div[^>]*class="pb-site[^>]*>/)?.[0] ?? "";
    expect(root).toContain('data-pb-hero="centered"');
    expect(root).toContain('data-pb-hero-mobile="compact"');
    expect(root).toContain('data-pb-services-mobile="list"');
    expect(root).not.toContain("data-pb-about-mobile=");
  });
});
