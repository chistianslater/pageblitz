import React from "react";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import "../../packs";
import "../registry";
import { SiteRenderer } from "../../SiteRenderer";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { withDesignSystem } from "../../../../../../shared/designSystems/apply";
import { deriveArtDirectedProfile } from "../../../../../../shared/stylePacks/artDirection";
import type { SectionV2 } from "../../../../../../shared/siteContract/types";
import { JournalChapter, chapterIndex } from "./sections";
import { JOURNAL_CSS } from "./css";
import { entryLine, nameFitClasses } from "./Entry";
import { brandClasses } from "./Chrome";
import { PLACEHOLDER_OPENING_HOURS } from "../../../../../../shared/onboardingV2/openingHours";
import { isPlaceholderHours } from "../../artDirection/heroFacts";

/** [ids, Klassen/Attribute/Pseudoklassen, Elemente] eines einfachen Selektors. */
function specificityOf(selector: string): [number, number, number] {
  const ids = (selector.match(/#[\w-]+/g) ?? []).length;
  const classes = (selector.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) ?? []).length;
  const elements = (selector.match(/(^|[\s>+~])[a-z][\w-]*/gi) ?? []).length;
  return [ids, classes, elements];
}
function compareSpecificity(a: number[], b: number[]): number {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

export const journalDoc = (
  kind: "full" | "minimal" | "features" = "full",
  palette?: string
) => withDesignSystem(getFixture("salon-noir", kind), "journal", palette);

export const render = (data = journalDoc(), preview = false, basePath = "") =>
  renderToStaticMarkup(
    <SiteRenderer
      data={data}
      basePath={basePath}
      islandsMode={preview ? "preview" : "live"}
      preview={preview}
      now={new Date("2026-10-13T10:00:00+02:00")}
    />
  );

describe("Journal: Grundgerüst", () => {
  test("rendert mit System-Attributen und System-Variablen", () => {
    const html = render(journalDoc("full", "salbei"));
    expect(html).toContain('data-pb-system="journal"');
    expect(html).toContain('data-pb-palette="salbei"');
    expect(html).toContain('class="pb-site pb-journal"');
    expect(html).toContain("--sys-paper:#eef0ea");
    expect(html).toContain("@font-face");
    expect(html).toContain("/fonts/systems/newsreader-latin-o36-wght.woff2");
    expect(html).toContain(
      "/fonts/systems/newsreader-latin-o36-wght-italic.woff2"
    );
    expect(html).toContain("/fonts/systems/source-sans-3-latin-wght.woff2");
  });

  test("kein Pack- oder rev-2-CSS", () => {
    const html = render();
    expect(html).not.toContain("pb-salon-noir");
    expect(html).not.toContain("pb-art-hero");
    expect(html).not.toContain("pb-entry-");
  });

  test("keine Pack-Layout-Attribute, obwohl designProfile mitreist", () => {
    const base = getFixture("salon-noir", "full");
    const withProfile = {
      ...base,
      designRevision: 2 as const,
      designProfile: {
        ...deriveArtDirectedProfile(base),
        hiddenElements: ["hero-media" as const],
      },
    };
    const doc = withDesignSystem(withProfile, "journal");
    expect(doc.designProfile).toBeDefined();
    const html = render(doc);
    expect(html).not.toMatch(
      /data-pb-(hero|services|about|gallery|deco|density|image|he)=/
    );
    expect(html).not.toContain("data-pb-slot");
  });

  test("packOverride wirkt bei rev 3 nicht", () => {
    const html = renderToStaticMarkup(
      <SiteRenderer
        data={journalDoc()}
        packOverride="werkbank"
        now={new Date()}
      />
    );
    expect(html).toContain('data-pb-system="journal"');
    expect(html).not.toContain("pb-werkbank");
  });

  test("Kopfzeile mit Betriebsname und Navigation, Fuß mit Adresse", () => {
    const data = journalDoc();
    const html = render(data);
    expect(html).toContain('class="jr-head"');
    expect(html).toContain(data.businessName);
    expect(html).toContain('class="jr-foot"');
    expect(html).toContain("Türkenstraße 42, 80799 München-Maxvorstadt");
  });

  test("Kopf: Menü links, Marke, Anrufen als Textlink, Navigation", () => {
    const html = render();
    expect(html).toMatch(/<summary[^>]*class="jr-menu-toggle"[^>]*>.*Menü/);
    expect(html).toMatch(/class="jr-brand[^"]*"[^>]*>NOIR Haarstudio</);
    expect(html).toContain(
      '<a class="jr-link jr-head-call" href="tel:089551792">Anrufen</a>'
    );
    expect(html).toMatch(/<nav class="jr-nav" aria-label="Hauptnavigation">/);
    expect(html).toContain('href="#leistungen"');
  });

  test("Kopf ohne Telefon: Hauptaktion statt Anrufen", () => {
    const d = journalDoc();
    const data = {
      ...d,
      sections: d.sections.map(s =>
        s.type === "contact" ? { ...s, phone: undefined } : s
      ),
    };
    const html = render(data);
    expect(html).not.toContain(">Anrufen<");
    expect(html).toContain('class="jr-link jr-head-call"');
  });

  test("Fuß: Marke, Telefon, Mail, Rechtslinks mit basePath, Jahr", () => {
    const html = render(journalDoc(), false, "/site/noir");
    const foot = html.slice(html.indexOf('class="jr-foot"'));
    expect(foot).toMatch(/class="jr-mark"[^>]*>NOIR Haarstudio</);
    expect(foot).toContain('href="tel:089551792"');
    expect(foot).toContain('href="mailto:termin@noir-haarstudio.de"');
    expect(foot).toContain('href="/site/noir/impressum"');
    expect(foot).toContain('href="/site/noir/datenschutz"');
    expect(foot).toContain("© 2026");
  });

  test("CSS nutzt nur System-Variablen, keine Pack-Variablen", () => {
    const html = render();
    const css = html.match(/<style>([\s\S]*?)<\/style>/)![1];
    const journalPart = css.slice(
      css.indexOf(".pb-journal"),
      css.indexOf("/* ende journal */")
    );
    expect(journalPart.length).toBeGreaterThan(100);
    expect(journalPart).not.toMatch(/var\(--pb-/);
  });
});

describe("Journal: Pack-Aliase für geteilte Bausteine", () => {
  test("--pb-* tragen die Palette (Salbei)", () => {
    const html = render(journalDoc("full", "salbei"));
    const style = html.match(
      /<div[^>]*class="pb-site pb-journal"[^>]*style="([^"]*)"/
    )![1];
    expect(style).toContain("--pb-accent:#4a6545");
    expect(style).toContain("--pb-canvas:#eef0ea");
    expect(style).toContain("--pb-ink:#232924");
    expect(style).toContain("--pb-muted:#556057");
    expect(style).toContain("--pb-line:#d2d8cd");
    expect(style).toContain("--pb-accent-contrast:#eef0ea");
    expect(style).toMatch(/--pb-font-body:&quot;Source Sans 3&quot;/);
    expect(style).not.toContain("--pb-radius");
  });
});

describe("Journal: Kapitel", () => {
  const of = (...types: string[]) =>
    types.map(type => ({ type })) as unknown as SectionV2[];

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

  test("JournalChapter: kursive Nummer und Label über der Serifen-H2", () => {
    const html = renderToStaticMarkup(
      <JournalChapter
        id="leistungen"
        index={2}
        label="Leistungen"
        title="Was wir für dich tun"
        intro="Kurz"
      />
    );
    expect(html).toMatch(
      /<p class="jr-kicker jr-chapter-label"><span class="jr-chapter-no"[^>]*>02<\/span>Leistungen<\/p>/
    );
    expect(html).toContain(
      '<h2 id="leistungen-titel">Was wir für dich tun</h2>'
    );
    expect(html).toContain('class="jr-chapter-intro"');
  });
});

describe("Journal: Knopf und Bewegung", () => {
  const css = () => render().match(/<style>([\s\S]*?)<\/style>/)![1];
  test("jr-pill hat gestaltete Hover- und Fokus-Zustände", () => {
    expect(css()).toMatch(
      /\.jr-pill:hover\{background:color-mix\(in srgb,var\(--sys-deep\)/
    );
    expect(css()).toMatch(/\.jr-pill:focus-visible\{outline:/);
  });
  test("reduzierte Bewegung erfasst auch Pseudo-Elemente", () => {
    expect(css()).toContain(
      ".pb-journal *::before,.pb-journal *::after{transition:none!important"
    );
  });
});

describe("Journal: Einstieg", () => {
  const entryOf = (html: string) =>
    html.slice(html.indexOf('<section id="start"'), html.indexOf("</section>", html.indexOf('<section id="start"')));
  const withHero = (patch: Record<string, unknown>, d = journalDoc()) => ({
    ...d,
    sections: d.sections.map(s => (s.type === "hero" ? { ...s, ...patch } : s)),
  });

  test("mit Foto: Kicker, Name als h1, kursive Zeile, Bild, Abb. 1, Faktenzeilen", () => {
    const entry = entryOf(render());
    expect(entry).toMatch(/<section id="start" class="jr-entry"/);
    expect(entry).toMatch(/class="jr-kicker jr-entry-kicker">Friseursalon in München-Maxvorstadt</);
    expect(entry).toMatch(/<h1 class="jr-entry-name[^"]*">NOIR Haarstudio<\/h1>/);
    expect(entry).toContain('<p class="jr-entry-line">Handwerk für Haar.</p>');
    expect(entry).toContain('src="/demo/salon-noir-hero.webp"');
    expect(entry).toContain("Abb. 1");
    expect(entry).toContain('class="jr-entry-facts"');
  });

  test("Faktenzeilen: heute geöffnet, Google, Adresse — höchstens drei", () => {
    const entry = entryOf(render());
    // 13.10.2026 ist ein Dienstag, Di–Sa 9:00 – 19:00
    expect(entry).toMatch(/Heute geöffnet<\/span><span class="jr-entry-fact-note">9 bis 19 Uhr/);
    expect(entry).toMatch(/4,8 bei Google<\/span><span class="jr-entry-fact-note">167 Bewertungen/);
    expect(entry).toMatch(/Türkenstraße 42<\/span><span class="jr-entry-fact-note">80799 München-Maxvorstadt/);
    expect((entry.match(/class="jr-entry-fact"/g) ?? []).length).toBe(3);
  });

  test("keine Google-Zeile ohne Bewertungen, keine Platzhalter-Zeiten", () => {
    const d = journalDoc();
    const html = render({
      ...d,
      google: { rating: 5, reviewCount: 0 },
      sections: d.sections.map(s =>
        s.type === "contact"
          ? { ...s, openingHours: PLACEHOLDER_OPENING_HOURS.map(h => ({ ...h })) }
          : s
      ),
    });
    const entry = entryOf(html);
    // 13.10.2026 ist Dienstag — echte Mo–Fr-Zeiten ergäben eine Heute-Zeile.
    expect(isPlaceholderHours(PLACEHOLDER_OPENING_HOURS)).toBe(true);
    expect(entry).not.toContain("bei Google");
    expect(entry).not.toContain("Heute");
    expect((entry.match(/class="jr-entry-fact"/g) ?? []).length).toBe(1);
  });

  test("Bildunterschrift: Abb. 1 als gestalteter span, kein <i>", () => {
    const entry = entryOf(render());
    expect(entry).toContain('<span class="jr-entry-abb">Abb. 1</span>');
    expect(entry).not.toContain("<i>");
  });

  test("CSS: Längenstufen schlagen die Grundregel des Namens", () => {
    const base = specificityOf(".pb-journal .jr-entry h1");
    for (const sel of [
      ".pb-journal .jr-entry .jr-entry-name--long",
      ".pb-journal .jr-entry .jr-entry-name--xlong",
      ".pb-journal .jr-entry--type .jr-entry-name--long",
    ]) {
      const at = JOURNAL_CSS.indexOf(`${sel}{`);
      expect(at, sel).toBeGreaterThan(JOURNAL_CSS.indexOf(".pb-journal .jr-entry h1{"));
      expect(JOURNAL_CSS.slice(at, JOURNAL_CSS.indexOf("}", at))).toContain("--jr-name-size:");
      expect(compareSpecificity(specificityOf(sel), base), sel).toBeGreaterThan(0);
    }
    // Typo-Fassung lang muss nach der allgemeinen --long-Regel stehen (gleiche Spezifität).
    expect(JOURNAL_CSS.indexOf(".pb-journal .jr-entry--type .jr-entry-name--long{")).toBeGreaterThan(
      JOURNAL_CSS.indexOf(".pb-journal .jr-entry .jr-entry-name--long{")
    );
  });

  test("ohne Foto: Typo-Einstieg mit Knopf und Route, kein leeres Bildfeld", () => {
    const html = render(withHero({ imageUrl: undefined }));
    const entry = entryOf(html);
    expect(entry).toContain("jr-entry--type");
    expect(entry).not.toContain("Abb. 1");
    expect(entry).not.toContain("<img");
    expect(entry).toMatch(/class="jr-pill jr-pill--ghost" href="#leistungen">Leistungen ansehen</);
    expect(entry).toMatch(/class="jr-link" href="https:\/\/www.google.com\/maps[^"]*">Route planen</);
  });

  test("Foto aussortiert (hiddenElements) → Typo-Einstieg", () => {
    const d = journalDoc();
    const html = render({
      ...d,
      designProfile: { ...(d.designProfile ?? {}), hiddenElements: ["hero-media"] },
    } as typeof d);
    expect(entryOf(html)).toContain("jr-entry--type");
  });

  test("lange Modell-Überschrift → Tagline, sonst keine kursive Zeile", () => {
    const long = "Handwerk für Haar, mitten in der Maxvorstadt und mit viel Liebe zum Detail gemacht.";
    expect(entryLine({ headline: long, subheadline: "Kurz und gut." } as never, "Tagline.")).toBe("Tagline.");
    expect(entryLine({ headline: long } as never, undefined)).toBeUndefined();
    expect(entryLine({ headline: "Schnitt, **Farbe** & gute Laune." } as never, undefined)).toBe(
      "Schnitt, Farbe & gute Laune."
    );
  });

  test("langer Name: Größe stuft ab, Trennung erlaubt, kein nowrap", () => {
    const d = journalDoc();
    const name = "Friseursalon Haarmonie & Kosmetikstudio Lindner-Bramhoff";
    const html = render({ ...d, businessName: name });
    expect(html).toContain("Friseursalon Haarmonie");
    expect(nameFitClasses(name)).toContain("jr-entry-name--xlong");
    expect(nameFitClasses("NOIR Haarstudio")).not.toContain("--long");
    expect(nameFitClasses("NOIR Haarstudio")).toContain("jr-fit-11");
    expect(JOURNAL_CSS).toMatch(/\.jr-entry h1\{[^}]*overflow-wrap:anywhere/);
    expect(JOURNAL_CSS).toMatch(/\.jr-entry h1\{[^}]*hyphens:auto/);
    expect(JOURNAL_CSS).not.toMatch(/\.jr-entry h1\{[^}]*white-space:nowrap/);
  });

  test("genau ein h1", () => {
    expect((render().match(/<h1/g) ?? []).length).toBe(1);
    expect((render(withHero({ imageUrl: undefined })).match(/<h1/g) ?? []).length).toBe(1);
  });
});

describe("Journal: Marke im Kopf", () => {
  test("Längenklasse aus dem Namen", () => {
    expect(brandClasses("Lindner")).toBe("jr-brand");
    expect(brandClasses("NOIR Haarstudio")).toBe("jr-brand jr-brand--long");
    expect(brandClasses("Friseursalon Haarmonie & Kosmetikstudio Lindner-Bramhoff")).toBe(
      "jr-brand jr-brand--xlong"
    );
  });
  test("Kopf trägt die Klasse; CSS kann nicht überlaufen", () => {
    const d = journalDoc();
    const html = render({ ...d, businessName: "Friseursalon Haarmonie & Kosmetikstudio Lindner-Bramhoff" });
    expect(html).toMatch(/<a class="jr-brand jr-brand--xlong" href="#start">/);
    expect(render()).toMatch(/<a class="jr-brand jr-brand--long" href="#start">/);
    expect(JOURNAL_CSS).toMatch(/\.jr-brand\{[^}]*min-width:0[^}]*overflow-wrap:anywhere/);
    expect(JOURNAL_CSS).toMatch(/\.jr-brand--xlong\{[^}]*text-transform:none/);
  });
});
