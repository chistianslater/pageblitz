import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { withDesignSystem } from "../../../../../../shared/designSystems/apply";
import { JOURNAL } from "../../../../../../shared/designSystems/journal";
import { RASTER } from "../../../../../../shared/designSystems/raster";
import { WERKSTOFF } from "../../../../../../shared/designSystems/werkstoff";
import { PLAKAT } from "../../../../../../shared/designSystems/plakat";
import type { SectionV2 } from "../../../../../../shared/siteContract/types";
import { blueprintFor } from "../../../../../../shared/stylePacks/blueprints";
import { SECTION_ANCHORS, type NavItem } from "../../engine";
import {
  addressLine,
  chapterIndex,
  figureNumbers,
  mailHref,
  mapsHref,
  previewSlotAnchors,
  primaryAction,
  shownNavItems,
  systemFontFaces,
  systemShows,
} from ".";

const doc = (kind: "full" | "minimal" = "full") =>
  withDesignSystem(getFixture("salon-noir", kind), "journal");
const of = (...types: string[]) =>
  types.map(type => ({ type })) as unknown as SectionV2[];

describe("Systeme: Kontakt-Helfer", () => {
  test("addressLine und mapsHref", () => {
    expect(addressLine(undefined)).toBe("");
    expect(
      addressLine({
        type: "contact",
        street: "Hammer Straße 41",
        zip: "48153",
        city: "Münster",
      } as never)
    ).toBe("Hammer Straße 41, 48153 Münster");
    expect(mapsHref("A & B")).toBe(
      "https://www.google.com/maps/search/?api=1&query=A%20%26%20B"
    );
  });

  test("mailHref nimmt nur eine plausible Adresse und kodiert den Betreff", () => {
    expect(mailHref("termin@noir.de")).toBe("mailto:termin@noir.de");
    expect(mailHref(" termin@noir.de ")).toBe("mailto:termin@noir.de");
    expect(mailHref("a@b.de?bcc=x@y.de")).toBeUndefined();
    expect(mailHref("a@b.de,c@d.de")).toBeUndefined();
    expect(mailHref("javascript:alert(1)")).toBeUndefined();
    expect(mailHref("keine adresse")).toBeUndefined();
    expect(mailHref("a@b.de", "Anfrage & Termin")).toBe(
      "mailto:a@b.de?subject=Anfrage%20%26%20Termin"
    );
  });

  test("primaryAction: Anruf, Route, sonst Sprung zum Kontakt mit Präfix", () => {
    const bp = blueprintFor("Friseur");
    const data = {
      ...doc(),
      sections: [
        { type: "hero", headline: "x", ctaText: "Termin" },
        {
          type: "contact",
          phone: "0251 123",
          street: "Weg 1",
          zip: "48153",
          city: "Münster",
        },
      ],
    } as never;
    expect(primaryAction(data, { ...bp, ctaAction: "tel" }).href).toMatch(
      /^tel:/
    );
    expect(primaryAction(data, { ...bp, ctaAction: "route" })).toEqual({
      label: "Termin",
      href: mapsHref("Weg 1, 48153 Münster"),
    });
    expect(primaryAction(data, { ...bp, ctaAction: undefined }, "/x")).toEqual({
      label: "Termin",
      href: `/x#${SECTION_ANCHORS.contact}`,
    });
  });
});

describe("Systeme: Kapitel und Abbildungen", () => {
  test("chapterIndex: Einstieg ist 01, Inhalt ab 02, Besuch zählt mit", () => {
    const sections = of(
      "hero",
      "services",
      "about",
      "testimonials",
      "faq",
      "contact"
    );
    expect(chapterIndex(sections, "hero")).toBe(0);
    expect(chapterIndex(sections, "services")).toBe(2);
    expect(chapterIndex(sections, "about")).toBe(3);
    expect(chapterIndex(sections, "testimonials")).toBe(4);
    expect(chapterIndex(sections, "faq")).toBe(5);
    expect(chapterIndex(sections, "contact")).toBe(6);
  });

  test("chapterIndex bleibt ohne Stimmen lückenlos", () => {
    const sections = of("hero", "services", "about", "faq", "contact");
    expect(chapterIndex(sections, "faq")).toBe(4);
    expect(chapterIndex(sections, "contact")).toBe(5);
    expect(chapterIndex(sections, "testimonials")).toBe(0);
  });

  test("figureNumbers: Einstieg 1, Über uns 2, Galerie ab 3 in Renderreihenfolge", () => {
    expect(figureNumbers(doc().sections)).toEqual({
      hero: 1,
      about: 2,
      gallery: 3,
      galleryLast: 4,
    });
  });

  test("figureNumbers: ausgeblendetes Einstiegsfoto zählt nicht", () => {
    const d = doc();
    expect(figureNumbers(d.sections, ["hero-media"])).toEqual({
      about: 1,
      gallery: 2,
      galleryLast: 3,
    });
    const noAbout = d.sections.filter(s => s.type !== "about");
    expect(figureNumbers(noAbout).gallery).toBe(2);
  });
});

describe("Systeme: sichtbare Abschnitte und Navigation", () => {
  test("systemShows: Stimmen ohne zitierfähige Bewertung und leere Karten entfallen", () => {
    expect(systemShows({ type: "testimonials", items: [] } as never)).toBe(
      false
    );
    expect(
      systemShows({
        type: "menu",
        categories: [{ name: "x", items: [] }],
      } as never)
    ).toBe(false);
    expect(systemShows({ type: "services", items: [] } as never)).toBe(true);
  });

  test("shownNavItems streicht Anker auf nicht gezeigte Abschnitte", () => {
    const items: NavItem[] = [
      {
        key: "a",
        label: "Leistungen",
        href: "#leistungen",
        sectionType: "services",
      },
      {
        key: "b",
        label: "Stimmen",
        href: "#stimmen",
        sectionType: "testimonials",
      },
      { key: "c", label: "Seite", href: "/seite" },
    ] as NavItem[];
    const home = [
      { type: "services", items: [] },
      { type: "testimonials", items: [] },
    ] as unknown as SectionV2[];
    expect(shownNavItems(items, home).map(i => i.key)).toEqual(["a", "c"]);
  });

  test("previewSlotAnchors: Speisekarte nach Leistungen, Team nach Über uns bzw. vor Besuch", () => {
    expect(
      previewSlotAnchors(of("hero", "services", "about", "contact"))
    ).toEqual({
      menu: 1,
      team: 2,
    });
    expect(previewSlotAnchors(of("hero", "faq", "contact"))).toEqual({
      menu: 0,
      team: 1,
    });
  });
});

describe("Systeme: @font-face", () => {
  test("Journal: drei Dateien, je eine Regel", () => {
    const css = systemFontFaces(JOURNAL);
    expect(css.match(/@font-face/g)).toHaveLength(3);
  });

  test("Raster: Geist für display und text nur einmal", () => {
    const css = systemFontFaces(RASTER);
    expect(css.match(/@font-face/g)).toHaveLength(1);
    expect(css).toContain('font-family:"Geist"');
    expect(css).toContain("url(/fonts/systems/geist-latin-wght.woff2)");
    expect(css).toContain("font-weight:100 900");
    expect(css).toContain("font-display:swap");
  });

  test("Werkstoff: drei Dateien inkl. DM Mono, je eine Regel", () => {
    const css = systemFontFaces(WERKSTOFF);
    expect(css.match(/@font-face/g)).toHaveLength(3);
    expect(css).toContain('font-family:"Zilla Slab"');
    expect(css).toContain('font-family:"Karla"');
    expect(css).toContain('font-family:"DM Mono"');
    expect(css).toContain("url(/fonts/systems/dm-mono-latin-500.woff2)");
    expect(css).toContain("font-weight:200 800");
  });

  test("Plakat: League Gothic mit Breitenbereich, Hanken Grotesk ohne", () => {
    const css = systemFontFaces(PLAKAT);
    const rules = css.split("\n");
    expect(rules).toHaveLength(5);
    const [gothic, gothicExt, hanken, hankenExt, arrow] = rules;
    expect(gothic).toContain('font-family:"League Gothic"');
    expect(gothic).toContain("url(/fonts/systems/league-gothic-latin-wdth.woff2)");
    // Bereich aus den genutzten Stufen (figure 82 % … mark 100 %), damit
    // font-stretch die wdth-Achse ansteuert statt zu synthetisieren.
    expect(gothic).toContain("font-stretch:82% 100%");
    expect(hanken).toContain('font-family:"Hanken Grotesk"');
    expect(hanken).toContain("font-weight:100 900");
    expect(hanken).not.toContain("font-stretch");
    // Grundschnitte ohne Bereich (wie bisher), Ergänzungen nur mit Bereich.
    expect(gothic).not.toContain("unicode-range");
    expect(hanken).not.toContain("unicode-range");
    expect(gothicExt).toContain("url(/fonts/systems/league-gothic-latin-ext-wdth.woff2)");
    expect(gothicExt).toContain("font-stretch:82% 100%");
    expect(gothicExt).toContain("unicode-range:U+0100-02BA");
    expect(hankenExt).toContain("url(/fonts/systems/hanken-grotesk-latin-ext-wght.woff2)");
    expect(hankenExt).toContain("unicode-range:U+0100-02BA");
    expect(arrow).toContain("url(/fonts/systems/hanken-grotesk-arrow-wght.woff2)");
    expect(arrow).toContain("unicode-range:U+2192;");
  });

  test("Plakat: Ergänzungsdateien liegen bei und werden nie vorgeladen", () => {
    const extra = [...PLAKAT.fonts.display.files, ...PLAKAT.fonts.text.files].filter(
      f => f.unicodeRange
    );
    expect(extra.map(f => f.file)).toEqual([
      "league-gothic-latin-ext-wdth.woff2",
      "hanken-grotesk-latin-ext-wght.woff2",
      "hanken-grotesk-arrow-wght.woff2",
    ]);
    for (const f of extra) {
      expect(PLAKAT.preload).not.toContain(f.file);
      expect(
        existsSync(resolve(__dirname, "../../../../../public/fonts/systems", f.file)),
        f.file
      ).toBe(true);
    }
    expect(PLAKAT.preload).toHaveLength(2);
  });

  test.each([JOURNAL, RASTER, WERKSTOFF])("$id: kein unicode-range (unverändert)", def => {
    expect(systemFontFaces(def)).not.toContain("unicode-range");
  });

  test.each([JOURNAL, RASTER, WERKSTOFF])("$id: kein font-stretch", def => {
    expect(systemFontFaces(def)).not.toContain("font-stretch");
  });
});
