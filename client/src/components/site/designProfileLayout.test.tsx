import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { STYLE_PACKS } from "@shared/stylePacks";
import { PACK_IDS } from "@shared/siteContract/packIds";
import { getFixture } from "../../../../shared/siteContract/fixtures";
import type { DesignProfile } from "../../../../shared/siteContract/designProfile";
import type { PackId } from "../../../../shared/siteContract/types";
import { SiteRenderer } from "./SiteRenderer";
import { DESIGN_PROFILE_CSS } from "./designProfileCss";
import { packLayoutRules } from "./packLayoutCss";
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
    expect(DESIGN_PROFILE_CSS).toContain('[data-pb-hero="image-first"]');
    expect(DESIGN_PROFILE_CSS).toContain('[data-pb-hero-mobile="image-first"]');
  });

  test("persistiertes Mobil-Profil landet als eigenes Attribut", () => {
    const html = renderToStaticMarkup(
      <SiteRenderer
        data={{
          ...getFixture("werkbank", "full"),
          designProfile: {
            ...PROFILE,
            heroLayoutMobile: "image-first",
            servicesLayoutMobile: "list",
          },
        }}
      />
    );
    const root = html.match(/<div[^>]*class="pb-site[^>]*>/)?.[0] ?? "";
    expect(root).toContain('data-pb-hero="centered"');
    expect(root).toContain('data-pb-hero-mobile="image-first"');
    expect(root).toContain('data-pb-services-mobile="list"');
    expect(root).not.toContain("data-pb-about-mobile=");
  });

  test("jedes Pack hat Feinjustierung für centered und image-first", () => {
    for (const packId of PACK_IDS) {
      expect(DESIGN_PROFILE_CSS).toContain(
        `.pb-site.pb-${packId}[data-pb-hero="centered"] #start`
      );
      expect(DESIGN_PROFILE_CSS).toContain(
        `.pb-site.pb-${packId}[data-pb-hero="image-first"] #start`
      );
      expect(DESIGN_PROFILE_CSS).toContain(
        `.pb-site.pb-${packId}[data-pb-hero-mobile="centered"] #start`
      );
    }
  });

  test("Overlay-Packs ziehen Foto, Shade und Absolut-Ebenen in den Fluss", () => {
    expect(DESIGN_PROFILE_CSS).toContain(".pb-wb-photo");
    expect(DESIGN_PROFILE_CSS).toContain("clip-path:none");
    expect(DESIGN_PROFILE_CSS).toContain(".pb-gu-hero-shade");
    expect(DESIGN_PROFILE_CSS).toContain(".pb-fd-panel");
    expect(DESIGN_PROFILE_CSS).toContain(".pb-vv-ghost");
    expect(DESIGN_PROFILE_CSS).toContain(".pb-ml-blob");
    expect(DESIGN_PROFILE_CSS).toContain("display:contents");
    expect(DESIGN_PROFILE_CSS).toContain(".pb-lg-rows");
  });

  test("packLayoutRules unterscheidet Desktop-Attribut und Mobil-Fallback", () => {
    const desktop = packLayoutRules("desktop");
    const mobile = packLayoutRules("mobile");
    expect(desktop).toContain(
      '.pb-site.pb-werkbank[data-pb-hero="centered"] #start'
    );
    expect(desktop).not.toContain("data-pb-hero-mobile");
    expect(mobile).toContain(
      '.pb-site.pb-werkbank[data-pb-hero-mobile="centered"] #start'
    );
    expect(mobile).toContain(
      '.pb-site.pb-werkbank:not([data-pb-hero-mobile])[data-pb-hero="centered"] #start'
    );
  });
});
