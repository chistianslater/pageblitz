import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import "../../packs";
import "../registry";
import { SiteRenderer } from "../../SiteRenderer";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { withDesignSystem } from "../../../../../../shared/designSystems/apply";
import { RELEASED_SYSTEMS } from "../../../../../../shared/designSystems/registry";
import {
  SHOWCASES,
  systemShowcaseDoc,
} from "../../../../../../shared/stylePacks/blueprintShowcase";
import { isMapsHref, mapsHref, newTabIfMaps } from "./contact";

/**
 * Nacht N0: Google-Maps-Links öffnen in allen Systemen einheitlich einen
 * neuen Tab (`target="_blank" rel="noopener noreferrer"`) — vorher je nach
 * System und Stelle mal ja, mal nein (Klar-Endprüfung).
 */
const NOW = new Date("2026-10-13T10:00:00+02:00");
const render = (
  data: Parameters<typeof SiteRenderer>[0]["data"],
  pathname?: string
) =>
  renderToStaticMarkup(
    <SiteRenderer
      data={data}
      slug=""
      basePath=""
      islandsMode="live"
      preview={false}
      pathname={pathname}
      now={NOW}
    />
  );

const MAPS_ANCHOR =
  /<a\b[^>]*href="https:\/\/www\.google\.com\/maps\/[^"]*"[^>]*>/g;

describe("Helfer", () => {
  it("erkennt Maps-Links und gibt nur ihnen neue-Tab-Attribute", () => {
    expect(isMapsHref(mapsHref("Markt 1, 48143 Münster"))).toBe(true);
    expect(newTabIfMaps(mapsHref("Markt 1"))).toEqual({
      target: "_blank",
      rel: "noopener noreferrer",
    });
    for (const href of [
      "tel:+495551234",
      "#kontakt",
      "mailto:a@b.example",
      "https://buchen.example/x",
    ])
      expect(newTabIfMaps(href), href).toEqual({});
  });
});

describe.each(RELEASED_SYSTEMS)("Maps-Links in %s", system => {
  it("öffnen auf allen Beispielseiten in neuem Tab", () => {
    let count = 0;
    for (const showcase of SHOWCASES) {
      const html = render(systemShowcaseDoc(showcase, system));
      for (const tag of html.match(MAPS_ANCHOR) ?? []) {
        count++;
        expect(tag, `${showcase.id}: ${tag}`).toContain('target="_blank"');
        expect(tag, `${showcase.id}: ${tag}`).toContain(
          'rel="noopener noreferrer"'
        );
      }
    }
    // Mindestens Anfahrt/Route kommt in jedem System vor.
    expect(count).toBeGreaterThan(0);
  });

  it("öffnen auch auf Fixture-Seiten und Unterseiten in neuem Tab", () => {
    for (const kind of ["full", "minimal", "features"] as const) {
      const doc = withDesignSystem(getFixture("werkbank", kind), system);
      const paths = [
        undefined,
        ...(doc.pages ?? []).map(p => `/${p.slug}`),
        "/impressum",
      ];
      for (const pathname of paths) {
        const html = render(doc, pathname);
        for (const tag of html.match(MAPS_ANCHOR) ?? []) {
          expect(tag, `${kind} ${pathname}: ${tag}`).toContain(
            'target="_blank"'
          );
          expect(tag, `${kind} ${pathname}: ${tag}`).toContain(
            'rel="noopener noreferrer"'
          );
        }
      }
    }
  });
});
