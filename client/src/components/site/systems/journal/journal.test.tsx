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
    expect(html).toMatch(/class="jr-brand"[^>]*>NOIR Haarstudio</);
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

describe("Journal: Kapitel", () => {
  const sections = [
    { type: "hero" },
    { type: "services" },
    { type: "contact" },
    { type: "about" },
    { type: "faq" },
  ] as unknown as SectionV2[];

  test("chapterIndex zählt nur Inhaltsabschnitte lückenlos ab 1", () => {
    expect(chapterIndex(sections, "services")).toBe(1);
    expect(chapterIndex(sections, "about")).toBe(2);
    expect(chapterIndex(sections, "faq")).toBe(3);
    expect(chapterIndex(sections, "contact")).toBe(0);
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
