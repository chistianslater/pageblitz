import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { SEO_INDUSTRIES } from "../server/seo/landingPages";
import { systemsForDoc } from "./designSystems/assignment";
import { isReleased } from "./designSystems/registry";
import {
  SEO_SHOWCASES,
  seoShowcaseFor,
  showcaseImagePath,
} from "./seoShowcases";
import {
  findShowcase,
  showcasePrimarySystem,
} from "./showcases/blueprintShowcase";

const PUBLIC = path.resolve(__dirname, "../client/public");

describe("SEO_SHOWCASES", () => {
  it("deckt genau die SEO-Branchen ab", () => {
    expect(Object.keys(SEO_SHOWCASES).sort()).toEqual(
      Object.keys(SEO_INDUSTRIES).sort()
    );
  });

  for (const [slug, r] of Object.entries(SEO_SHOWCASES)) {
    if (!r) continue;
    it(`${slug}: System eines echten Betriebs = System des Beispiels`, () => {
      const showcase = findShowcase(r.showcase);
      expect(showcase, r.showcase).toBeDefined();
      const triple = systemsForDoc({
        businessCategory: r.category,
        businessName: `${SEO_INDUSTRIES[slug].displayName} Muster`,
      });
      expect(triple.find(isReleased)).toBe(r.system);
      expect(showcasePrimarySystem(showcase!)).toBe(r.system);
    });

    it(`${slug}: Bilder liegen in client/public`, () => {
      for (const mobile of [false, true]) {
        const file = path.join(PUBLIC, showcaseImagePath(r.showcase, mobile));
        expect(fs.existsSync(file), file).toBe(true);
      }
    });
  }

  it("seoShowcaseFor liefert Demo-Link und Bild, Unbekanntes bleibt Attrappe", () => {
    const f = seoShowcaseFor("friseur")!;
    expect(f.href).toBe("/demo/system/journal/friseur");
    expect(f.image).toBe("/showcases/friseur.webp");
    expect(f.imageMobile).toBe("/showcases/friseur-mobil.webp");
    expect(seoShowcaseFor("reisebuero")?.href).toBe(
      "/demo/system/raster/reisebuero"
    );
    expect(seoShowcaseFor("gibtsnicht")).toBeUndefined();
  });

  // Betreiber-Befund 2026-10-18: Die Gärtner-Seite zeigte die Schreinerei.
  // Ein Beispiel teilen sich nur Branchen, die fachlich dasselbe sind.
  it("keine Branchenseite leiht sich das Beispiel einer fremden Branche", () => {
    const geteilt: Record<string, string[]> = {
      schreinerei: ["handwerk"],
      steuerberater: ["buchhaltung", "steuerberater"],
      fotografie: ["fotograf", "fotostudio"],
    };
    const nachBeispiel = new Map<string, string[]>();
    for (const [slug, r] of Object.entries(SEO_SHOWCASES)) {
      if (!r) continue;
      nachBeispiel.set(r.showcase, [
        ...(nachBeispiel.get(r.showcase) ?? []),
        slug,
      ]);
    }
    for (const [showcase, slugs] of nachBeispiel) {
      if (slugs.length === 1 && !geteilt[showcase]) continue;
      expect(slugs.sort(), showcase).toEqual(geteilt[showcase] ?? [slugs[0]]);
    }
  });
});
