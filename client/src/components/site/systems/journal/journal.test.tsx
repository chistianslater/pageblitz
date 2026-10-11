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
import { JournalChapter } from "./sections";
import { JOURNAL_CSS } from "./css";
import { entryLine, nameFitClasses, ratingLine } from "./Entry";
import { brandClasses } from "./Chrome";
import { PLACEHOLDER_OPENING_HOURS } from "../../../../../../shared/onboardingV2/openingHours";
import { isPlaceholderHours } from "../../artDirection/heroFacts";

/** [ids, Klassen/Attribute/Pseudoklassen, Elemente] eines einfachen Selektors. */
function specificityOf(selector: string): [number, number, number] {
  const ids = (selector.match(/#[\w-]+/g) ?? []).length;
  const classes = (selector.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) ?? [])
    .length;
  const elements = (selector.match(/(^|[\s>+~])[a-z][\w-]*/gi) ?? []).length;
  return [ids, classes, elements];
}
function compareSpecificity(a: number[], b: number[]): number {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

export { journalDoc, render } from "./testkit";
import { journalDoc, render } from "./testkit";

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
  // chapterIndex: Tests in ../shared/helpers.test.ts

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
    html.slice(
      html.indexOf('<section id="start"'),
      html.indexOf("</section>", html.indexOf('<section id="start"'))
    );
  const withHero = (patch: Record<string, unknown>, d = journalDoc()) => ({
    ...d,
    sections: d.sections.map(s => (s.type === "hero" ? { ...s, ...patch } : s)),
  });

  test("mit Foto: Kicker, Name als h1, kursive Zeile, Bild, Abb. 1, Faktenzeilen", () => {
    const entry = entryOf(render());
    expect(entry).toMatch(/<section id="start" class="jr-entry"/);
    expect(entry).toMatch(
      /class="jr-kicker jr-entry-kicker">Friseursalon in München-Maxvorstadt</
    );
    expect(entry).toMatch(
      /<h1 class="jr-entry-name[^"]*">NOIR Haarstudio<\/h1>/
    );
    expect(entry).toContain('<p class="jr-entry-line">Handwerk für Haar.</p>');
    expect(entry).toContain('src="/demo/salon-noir-hero.webp"');
    expect(entry).toContain("Abb. 1");
    expect(entry).toContain('class="jr-entry-facts"');
  });

  test("Faktenzeilen: heute geöffnet, Adresse — Google steht nicht mehr darin", () => {
    const entry = entryOf(render());
    // 13.10.2026 ist ein Dienstag, Di–Sa 9:00 – 19:00
    expect(entry).toMatch(
      /Heute geöffnet<\/span><span class="jr-entry-fact-note">9 bis 19 Uhr/
    );
    expect(entry).toMatch(
      /Türkenstraße 42<\/span><span class="jr-entry-fact-note">80799 München-Maxvorstadt/
    );
    expect(entry).not.toMatch(/jr-entry-fact"><span>[^<]*bei Google/);
    expect((entry.match(/class="jr-entry-fact"/g) ?? []).length).toBe(2);
  });

  test("Bewertungszeile direkt unter der kursiven Zeile, vor dem Foto", () => {
    const entry = entryOf(render());
    expect(entry).toContain(
      '<p class="jr-entry-line">Handwerk für Haar.</p><p class="jr-entry-rating">4,8 bei Google · 167 Bewertungen</p>'
    );
    expect(entry.indexOf("jr-entry-rating")).toBeLessThan(
      entry.indexOf("jr-entry-photo")
    );
    expect((entry.match(/bei Google/g) ?? []).length).toBe(1);
  });

  test("Bewertungszeile auch in der Typo-Fassung", () => {
    const entry = entryOf(render(withHero({ imageUrl: undefined })));
    expect(entry).toContain(
      '<p class="jr-entry-rating">4,8 bei Google · 167 Bewertungen</p>'
    );
    expect(entry.indexOf("jr-entry-rating")).toBeGreaterThan(
      entry.indexOf("jr-entry-line")
    );
  });

  test("ratingLine: Einzahl, Tausender, nur mit Bewertungen", () => {
    expect(ratingLine({ rating: 5, reviewCount: 1 })).toBe(
      "5,0 bei Google · 1 Bewertung"
    );
    expect(ratingLine({ rating: 4.75, reviewCount: 1234 })).toBe(
      "4,8 bei Google · 1.234 Bewertungen"
    );
    expect(ratingLine({ rating: 4.8, reviewCount: 0 })).toBeUndefined();
    expect(ratingLine(undefined)).toBeUndefined();
  });

  test("CSS: Bewertungszeile klein und gedämpft", () => {
    expect(JOURNAL_CSS).toMatch(
      /\.jr-entry-rating\{[^}]*color:var\(--sys-muted\)/
    );
    expect(JOURNAL_CSS).toMatch(/\.jr-entry-rating\{[^}]*--sys-small-size/);
  });

  test("Rechtsform fällt im Namen und im Kopf weg, Fuß und Rechtliches behalten sie", () => {
    const d = journalDoc();
    const html = render({ ...d, businessName: "Hairlounge Hachtkemper GmbH" });
    const entry = entryOf(html);
    expect(entry).toMatch(
      /<h1 class="jr-entry-name[^"]*">Hairlounge Hachtkemper<\/h1>/
    );
    expect(entry).not.toContain("GmbH");
    expect(html).toMatch(/class="jr-brand[^"]*"[^>]*>Hairlounge Hachtkemper</);
    expect(html).toMatch(/class="jr-nav-home"[^>]*>Hairlounge Hachtkemper</);
    const foot = html.slice(html.indexOf('<footer class="jr-foot"'));
    expect(foot).toContain("Hairlounge Hachtkemper GmbH");
    // Größenstufe aus dem Anzeigenamen (22 Zeichen → nicht --long).
    expect(nameFitClasses("Hairlounge Hachtkemper")).not.toContain("--long");
    expect(entry).not.toContain("jr-entry-name--long");
  });

  test("keine Google-Zeile ohne Bewertungen, keine Platzhalter-Zeiten", () => {
    const d = journalDoc();
    const html = render({
      ...d,
      google: { rating: 5, reviewCount: 0 },
      sections: d.sections.map(s =>
        s.type === "contact"
          ? {
              ...s,
              openingHours: PLACEHOLDER_OPENING_HOURS.map(h => ({ ...h })),
            }
          : s
      ),
    });
    const entry = entryOf(html);
    // 13.10.2026 ist Dienstag — echte Mo–Fr-Zeiten ergäben eine Heute-Zeile.
    expect(isPlaceholderHours(PLACEHOLDER_OPENING_HOURS)).toBe(true);
    expect(entry).not.toContain("bei Google");
    expect(entry).not.toContain("jr-entry-rating");
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
      expect(at, sel).toBeGreaterThan(
        JOURNAL_CSS.indexOf(".pb-journal .jr-entry h1{")
      );
      expect(JOURNAL_CSS.slice(at, JOURNAL_CSS.indexOf("}", at))).toContain(
        "--jr-name-size:"
      );
      expect(compareSpecificity(specificityOf(sel), base), sel).toBeGreaterThan(
        0
      );
    }
    // Typo-Fassung lang muss nach der allgemeinen --long-Regel stehen (gleiche Spezifität).
    expect(
      JOURNAL_CSS.indexOf(".pb-journal .jr-entry--type .jr-entry-name--long{")
    ).toBeGreaterThan(
      JOURNAL_CSS.indexOf(".pb-journal .jr-entry .jr-entry-name--long{")
    );
  });

  test("ohne Foto: Typo-Einstieg mit Knopf und Route, kein leeres Bildfeld", () => {
    const html = render(withHero({ imageUrl: undefined }));
    const entry = entryOf(html);
    expect(entry).toContain("jr-entry--type");
    expect(entry).not.toContain("Abb. 1");
    expect(entry).not.toContain("<img");
    expect(entry).toMatch(
      /class="jr-pill jr-pill--ghost" href="#leistungen">Leistungen ansehen</
    );
    expect(entry).toMatch(
      /class="jr-link" href="https:\/\/www.google.com\/maps[^"]*">Route planen</
    );
  });

  test("Foto aussortiert (hiddenElements) → Typo-Einstieg", () => {
    const d = journalDoc();
    const html = render({
      ...d,
      designProfile: {
        ...(d.designProfile ?? {}),
        hiddenElements: ["hero-media"],
      },
    } as typeof d);
    expect(entryOf(html)).toContain("jr-entry--type");
  });

  test("lange Modell-Überschrift → Tagline, sonst keine kursive Zeile", () => {
    const long =
      "Handwerk für Haar, mitten in der Maxvorstadt und mit viel Liebe zum Detail gemacht.";
    expect(
      entryLine(
        { headline: long, subheadline: "Kurz und gut." } as never,
        "Tagline."
      )
    ).toBe("Tagline.");
    expect(entryLine({ headline: long } as never, undefined)).toBeUndefined();
    expect(
      entryLine(
        { headline: "Schnitt, **Farbe** & gute Laune." } as never,
        undefined
      )
    ).toBe("Schnitt, Farbe & gute Laune.");
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
    expect(
      (render(withHero({ imageUrl: undefined })).match(/<h1/g) ?? []).length
    ).toBe(1);
  });
});

describe("Journal: Marke im Kopf", () => {
  test("Längenklasse aus dem Namen", () => {
    expect(brandClasses("Lindner")).toBe("jr-brand");
    expect(brandClasses("NOIR Haarstudio")).toBe("jr-brand jr-brand--long");
    expect(
      brandClasses("Friseursalon Haarmonie & Kosmetikstudio Lindner-Bramhoff")
    ).toBe("jr-brand jr-brand--xlong");
  });
  test("Kopf trägt die Klasse; CSS kann nicht überlaufen", () => {
    const d = journalDoc();
    const html = render({
      ...d,
      businessName: "Friseursalon Haarmonie & Kosmetikstudio Lindner-Bramhoff",
    });
    expect(html).toMatch(/<a class="jr-brand jr-brand--xlong" href="#start">/);
    expect(render()).toMatch(
      /<a class="jr-brand jr-brand--long" href="#start">/
    );
    expect(JOURNAL_CSS).toMatch(
      /\.jr-brand\{[^}]*min-width:0[^}]*overflow-wrap:anywhere/
    );
    expect(JOURNAL_CSS).toMatch(/\.jr-brand--xlong\{[^}]*text-transform:none/);
  });
});

/** Abschnitte eines Dokuments ersetzen/entfernen (Typ-sicher genug für Tests). */
const withSections = (
  d: ReturnType<typeof journalDoc>,
  map: (s: SectionV2) => SectionV2 | undefined
) => ({
  ...d,
  sections: d.sections.map(map).filter((s): s is SectionV2 => Boolean(s)),
});
const esc = (t: string) => t.replace(/&/g, "&amp;");
const sectionHtml = (html: string, cls: string) => {
  const start = html.lastIndexOf(
    "<section",
    html.indexOf(`class="jr-section jr-${cls}`)
  );
  if (!html.includes(`class="jr-section jr-${cls}`)) return "";
  if (start === -1) return "";
  return html.slice(start, html.indexOf("</section>", start));
};

describe("Journal: Angebot", () => {
  test("Leistungen als Kapitel 02 mit allen Titeln, Anker aus SECTION_ANCHORS", () => {
    const data = journalDoc();
    const html = render(data);
    const services = data.sections.find(s => s.type === "services")!;
    expect(html).toMatch(
      /<section id="leistungen" class="jr-section jr-services/
    );
    if (services.type !== "services") throw new Error();
    for (const item of services.items) expect(html).toContain(esc(item.title));
    expect(sectionHtml(html, "services")).toMatch(/jr-chapter-no[^>]*>02</);
  });

  test("Preis nur, wenn vorhanden; nackte Preise bekommen €", () => {
    const html = sectionHtml(render(), "services");
    expect(html).toContain("ab 45 €");
    expect(html).toContain('class="jr-price"');
  });

  test("keine erfundenen Preise", () => {
    const data = withSections(journalDoc(), s =>
      s.type === "pricelist"
        ? undefined
        : s.type === "services"
          ? { ...s, items: s.items.map(i => ({ title: i.title })) }
          : s
    );
    const html = render(data);
    expect(html).not.toMatch(/€/);
    expect(html).not.toContain('class="jr-price"');
  });

  test("Label doppelt nicht die Überschrift: nur Nummer, wenn gleich", () => {
    const html = sectionHtml(render(), "services");
    expect(html).toMatch(
      /<p class="jr-kicker jr-chapter-label"><span class="jr-chapter-no"[^>]*>02<\/span><\/p>/
    );
  });

  test("„Alle Leistungen“ nur mit Link im Dokument", () => {
    expect(sectionHtml(render(), "services")).not.toContain("jr-link");
    const data = withSections(journalDoc(), s =>
      s.type === "services"
        ? {
            ...s,
            link: {
              text: "Alle Leistungen",
              href: "https://example.org/preise",
            },
          }
        : s
    );
    expect(sectionHtml(render(data), "services")).toMatch(
      /<a class="jr-link" href="https:\/\/example.org\/preise">Alle Leistungen<\/a>/
    );
  });

  test("Preisliste mit Gruppen-Kicker, Haarlinien-Zeilen und €", () => {
    const html = sectionHtml(render(), "pricelist");
    expect(html).toMatch(/<section id="preise" class="jr-section jr-pricelist/);
    expect(html).toMatch(/class="jr-kicker jr-group"[^>]*>Damen</);
    expect(html).toContain("Balayage komplett");
    expect(html).toContain("165 €");
  });

  test("Preis-Platzhalter nur in der Vorschau, nie live", () => {
    const data = withSections(journalDoc(), s =>
      s.type === "pricelist" ? undefined : s
    );
    expect(render(data, true)).toContain("Nur in deiner Vorschau");
    expect(render(data, false)).not.toContain("Nur in deiner Vorschau");
  });

  test("Team-Platzhalter in der Vorschau ohne Nummer", () => {
    const html = render(journalDoc(), true);
    const slot = html.slice(html.indexOf('id="team"'));
    expect(slot).toContain("Nur in deiner Vorschau");
    expect(slot.slice(0, slot.indexOf("</section>"))).not.toContain(
      "jr-chapter-no"
    );
    expect(render(journalDoc(), false)).not.toContain('id="team"');
  });

  test("Team mit echten Mitgliedern: Porträt, Name als h3, Rolle", () => {
    const d = journalDoc();
    const data = {
      ...d,
      sections: [
        ...d.sections,
        {
          type: "team" as const,
          headline: "Das Team",
          members: [
            { name: "Mara Noir", role: "Inhaberin", imageUrl: "/demo/a.webp" },
            { name: "Leo Brandt", role: "Colorist", imageUrl: "/demo/b.webp" },
          ],
        },
      ],
    };
    const html = sectionHtml(render(data), "team");
    expect(html).toMatch(/<h3>Mara Noir<\/h3>/);
    expect(html).toContain("Colorist");
    expect(html).toMatch(/<img[^>]*loading="lazy"[^>]*>/);
    expect(html).not.toContain("Nur in deiner Vorschau");
  });

  test("Ablauf: nummerierte Schritte mit großer Ziffer", () => {
    const d = journalDoc();
    const data = {
      ...d,
      sections: [
        ...d.sections,
        {
          type: "process" as const,
          headline: "So läuft dein Termin",
          steps: [
            { title: "Termin anfragen", text: "Online oder per Anruf." },
            { title: "Beratung am Platz" },
          ],
        },
      ],
    };
    const html = sectionHtml(render(data), "process");
    expect(html).toMatch(/<section id="ablauf" class="jr-section jr-process/);
    expect(html).toMatch(/<ol class="jr-steps"/);
    expect(html).toMatch(/class="jr-step-no"[^>]*>1</);
    expect(html).toContain("Beratung am Platz");
  });

  test("Speisekarte mit Gruppen; Platzhalter nur in der Vorschau", () => {
    const d = journalDoc();
    const menu = {
      type: "menu" as const,
      headline: "Karte",
      categories: [
        { name: "Vorspeisen", items: [{ name: "Burrata", price: "12,50" }] },
      ],
    };
    const html = sectionHtml(
      render({ ...d, sections: [...d.sections, menu] }),
      "speisekarte"
    );
    expect(html).toMatch(
      /<section id="speisekarte" class="jr-section jr-speisekarte/
    );
    expect(html).toContain("12,50 €");
    // Abschnittsklasse kollidiert nicht mit dem Kopf-Menü (.jr-menu)
    expect(
      render({ ...d, sections: [...d.sections, menu] }).match(
        /class="jr-menu[ "]/g
      )
    ).toHaveLength(1);
  });

  test("minimal rendert ohne Fehler", () => {
    expect(() => render(journalDoc("minimal"))).not.toThrow();
    expect(() => render(journalDoc("minimal"), true)).not.toThrow();
  });
});

describe("Journal: Geschichte", () => {
  // figureNumbers: Tests in ../shared/helpers.test.ts

  test("Über uns: Kapitel 03 auf hellem Band, Foto mit Abb. 2, Fließtext", () => {
    const html = render();
    const about = sectionHtml(html, "about");
    expect(about).toMatch(
      /<section id="ueber-uns" class="jr-section jr-about jr-section--raised"/
    );
    expect(about).toMatch(/jr-chapter-no[^>]*>03</);
    expect(about).toMatch(/<img[^>]*loading="lazy"/);
    expect(about).toMatch(/<img[^>]*width="\d+"[^>]*height="\d+"/);
    expect(about).toMatch(/class="jr-abb"[^>]*>Abb. 2</);
    expect(about).toContain("Maxvorstadt gegründet");
  });

  test("Über uns ohne Foto: erster Satz groß, kein leeres Bildfeld", () => {
    const data = withSections(journalDoc(), s =>
      s.type === "gallery"
        ? undefined
        : s.type === "about"
          ? { ...s, imageUrl: undefined }
          : s
    );
    const about = sectionHtml(render(data), "about");
    expect(about).not.toContain("<img");
    expect(about).toMatch(
      /<p class="jr-about-lede">NOIR Haarstudio wurde 2016/
    );
  });

  test("Über uns verlinkt das Team nur, wenn es einen Team-Abschnitt gibt", () => {
    expect(sectionHtml(render(), "about")).not.toContain('href="#team"');
  });

  test("Galerie: Einblicke, Abb. fortlaufend ab 3, Wischstreifen mit Bereich", () => {
    const html = render();
    const gallery = sectionHtml(html, "gallery");
    expect(gallery).toMatch(
      /<section id="galerie" class="jr-section jr-gallery/
    );
    expect(gallery).toMatch(/jr-chapter-no[^>]*>04<\/span>Einblicke/);
    expect(gallery).toContain("Abb. 3");
    expect(gallery).toContain("Abb. 4");
    expect(gallery).toContain("Abb. 3 bis 4");
    expect(gallery).toContain("Wischen für mehr");
    expect(gallery).toContain("Die Stylingplätze des NOIR Haarstudios");
    expect(gallery).toMatch(/<img[^>]*alt="Glänzendes Balayage-Ergebnis/);
    expect(gallery).toMatch(/<img[^>]*loading="lazy"/);
  });

  test("Stimmen: eine große kursive Stimme, Autor, Quelle, Sterne nur bei 5", () => {
    const html = render();
    const reviews = sectionHtml(html, "reviews");
    expect(reviews).toMatch(
      /<section id="bewertungen" class="jr-section jr-reviews/
    );
    expect(reviews).toMatch(/<blockquote class="jr-quote"/);
    expect(reviews).toMatch(/class="jr-stars"/);
    expect(reviews.match(/<blockquote/g)).toHaveLength(1);
    expect(reviews).toContain("Google-Bewertung");
    // Kein Link ohne Google-Adresse im Dokument
    expect(reviews).not.toContain("auf Google</a>");
  });

  test("Stimmen ohne Sternwert: keine Sterne", () => {
    const data = withSections(journalDoc(), s =>
      s.type === "testimonials"
        ? { ...s, items: s.items.map(({ rating: _r, ...i }) => i) }
        : s
    );
    const reviews = sectionHtml(render(data), "reviews");
    expect(reviews).toMatch(/<blockquote class="jr-quote"/);
    expect(reviews).not.toContain("jr-stars");
  });

  test("ohne Bewertungen kein Stimmen-Abschnitt und lückenlose Kapitel ab 02", () => {
    const data = withSections(journalDoc(), s =>
      s.type === "testimonials" ? undefined : s
    );
    const html = render(data);
    expect(html).not.toContain('class="jr-section jr-reviews');
    const nos = [...html.matchAll(/jr-chapter-no[^>]*>(\d\d)</g)].map(m =>
      Number(m[1])
    );
    expect(nos.length).toBeGreaterThan(2);
    expect(nos).toEqual(nos.map((_, i) => i + 2));
  });

  test("nur nicht zitierfähige Stimmen: Abschnitt entfällt, Nummern lückenlos", () => {
    const data = withSections(journalDoc(), s =>
      s.type === "testimonials"
        ? { ...s, items: [{ author: "X", text: "Ok.", rating: 3 }] }
        : s
    );
    const html = render(data);
    expect(html).not.toContain('class="jr-section jr-reviews');
    const nos = [...html.matchAll(/jr-chapter-no[^>]*>(\d\d)</g)].map(m =>
      Number(m[1])
    );
    expect(nos).toEqual(nos.map((_, i) => i + 2));
  });

  test("minimal rendert ohne Fehler", () => {
    expect(() => render(journalDoc("minimal"))).not.toThrow();
  });
});

describe("Journal: Nachbesserung Task 9/10", () => {
  test("keine Navigation zu Stimmen, die Journal nicht zeigt (Kopf und Menü)", () => {
    const data = withSections(journalDoc(), s =>
      s.type === "testimonials"
        ? { ...s, items: [{ author: "X", text: "Ok.", rating: 3 }] }
        : s
    );
    const html = render(data);
    expect(html).not.toContain('href="#bewertungen"');
    expect(html).toContain('href="#leistungen"');
    expect(render()).toContain('href="#bewertungen"');
  });

  const gastro = () => ({ ...journalDoc(), businessCategory: "Restaurant" });

  test("Speisekarten-Platzhalter in der Vorschau auch ohne Leistungen, nie live", () => {
    const data = withSections(gastro(), s =>
      s.type === "services" ? undefined : s
    );
    const preview = render(data, true);
    const slot = preview.slice(preview.indexOf('id="speisekarte"'));
    expect(preview).toContain('id="speisekarte"');
    expect(slot).toContain("Nur in deiner Vorschau");
    expect(render(data, false)).not.toContain('id="speisekarte"');
  });

  test("leere Speisekarte: kein nummeriertes Kapitel, Platzhalter nur in der Vorschau", () => {
    const d = gastro();
    const data = {
      ...d,
      addOns: { ...d.addOns, menu: true },
      sections: [
        ...d.sections,
        { type: "menu" as const, categories: [{ name: "Leer", items: [] }] },
      ],
    } as typeof d;
    const preview = render(data, true);
    expect(preview).not.toContain("jr-section jr-speisekarte");
    expect(preview).toContain('id="speisekarte"');
    expect(preview).toContain("Nur in deiner Vorschau");
    const live = render(data, false);
    expect(live).not.toContain('id="speisekarte"');
  });

  test("Team-Platzhalter auch ohne Über uns und Galerie (nur Vorschau)", () => {
    const data = withSections(journalDoc(), s =>
      s.type === "about" || s.type === "gallery" ? undefined : s
    );
    const preview = render(data, true);
    const slot = preview.slice(preview.indexOf('id="team"'));
    expect(preview).toContain('id="team"');
    expect(slot).toContain("Nur in deiner Vorschau");
    expect(render(data, false)).not.toContain('id="team"');
  });

  test("Galerie-Streifen ist eine benannte Region", () => {
    expect(sectionHtml(render(), "gallery")).toMatch(
      /class="jr-strip"[^>]*role="region"[^>]*aria-label="Einblicke, seitlich wischen"/
    );
  });

  test("Abschnitts-CSS ohne freie Maße (ch, feste Zeilenhöhen, em-Sperrung)", () => {
    const css = render().match(/<style>([\s\S]*?)<\/style>/)![1];
    const part = css.slice(
      css.indexOf("/* Abschnitte: helles Band"),
      css.indexOf("/* ende journal */")
    );
    expect(part.length).toBeGreaterThan(100);
    expect(part).not.toMatch(/\d+ch\b/);
    expect(part).not.toMatch(/line-height:[\d.]+[;}]/);
    expect(part).not.toMatch(/letter-spacing:[\d.]+em/);
  });
});
