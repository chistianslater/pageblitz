import { describe, expect, test } from "vitest";
import { WebsiteDataV2Schema } from "./schema";
import { getFixture } from "./fixtures";
import { PACK_IDS } from "./types";

describe("fixtures", () => {
  test("werkbank-full validiert gegen Schema und hat alle Kern-Sektionen", () => {
    const d = WebsiteDataV2Schema.parse(getFixture("werkbank", "full"));
    const types = d.sections.map(s => s.type);
    for (const t of ["hero", "services", "about", "testimonials", "contact"]) {
      expect(types).toContain(t);
    }
  });
  test("werkbank-minimal hat nur hero, services, contact", () => {
    const d = WebsiteDataV2Schema.parse(getFixture("werkbank", "minimal"));
    expect(d.sections.map(s => s.type).sort()).toEqual([
      "contact",
      "hero",
      "services",
    ]);
  });
  describe("Add-on-Gating (Plan B6 Task 6): jede Fixture bucht die Add-ons, deren Sektionen sie enthält", () => {
    const GATED: Record<string, "gallery" | "menu" | "pricelist" | "team"> = {
      gallery: "gallery",
      menu: "menu",
      pricelist: "pricelist",
      team: "team",
    };
    for (const packId of PACK_IDS) {
      for (const kind of ["full", "minimal"] as const) {
        test(`${packId}-${kind}: keine Sektion ohne gebuchtes Add-on (sonst würde sie nicht gerendert und Baselines kippen)`, () => {
          const d = getFixture(packId, kind);
          for (const s of d.sections) {
            const addOn = GATED[s.type];
            if (addOn) expect(d.addOns?.[addOn]).toBe(true);
          }
          if (d.pages && d.pages.length > 0) {
            expect(d.addOns?.subpages).toBe(true);
          }
        });
      }
    }
  });

  test("Pack ohne Fixture wirft", () => {
    // absichtlich ungültige ID, damit der Test auch nach Plan B/C stabil bleibt
    expect(() => getFixture("nicht-existent" as never, "full")).toThrow(
      /Fixture fehlt/
    );
  });

  describe("features-Fixture (full + alle Feature-Flags aktiv)", () => {
    for (const packId of PACK_IDS) {
      test(`${packId}-features validiert gegen Schema und hat alle vier Feature-Flags aktiv (inkl. subpages seit Plan B6)`, () => {
        const d = WebsiteDataV2Schema.parse(getFixture(packId, "features"));
        expect(d.features).toEqual({
          contactForm: true,
          aiChat: true,
          booking: true,
          subpages: true,
        });
      });
    }
  });

  describe("full-Fixture — Unterseiten-Add-on (Plan B6)", () => {
    for (const packId of PACK_IDS) {
      test(`${packId}-full hat eine Page "leistungen-im-detail" und alle Sektions-Add-ons aktiv`, () => {
        const d = WebsiteDataV2Schema.parse(getFixture(packId, "full"));
        expect(d.pages?.map(p => p.slug)).toEqual(["leistungen-im-detail"]);
        expect(d.addOns).toEqual({
          gallery: true,
          menu: true,
          pricelist: true,
          team: true,
          subpages: true,
        });
      });
    }
  });
});
