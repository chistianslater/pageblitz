import { describe, expect, it } from "vitest";
import {
  DE_CITIES,
  SEO_INDUSTRIES,
  generateLandingPageHTML,
  generateOverviewHTML,
} from "./landingPages";
import { generateHomePrerender } from "./homePage";
import { escapeHtml } from "./metaInjection";
import {
  PRICE_FAQ_ANSWER,
  PRICE_FOOTNOTE,
  PRICE_FROM_INLINE,
  PRICE_FULL,
  TERM_COMPARISON,
  trialThenText,
} from "../../shared/pricingText";

/**
 * Preis-Texte der SEO-Seiten (Betreiber-Entscheidung 2026-10-13): kein
 * „2 Monate gratis", kein „/Jahr"-Gesamtbetrag (monatliche Abbuchung), kein
 * „jederzeit kündbar"/„keine Mindestlaufzeit" mehr, jedes Sternchen hat
 * eine Fußnote auf derselben Seite.
 */
const pages = (): Array<[string, string]> => [
  ["Branche", generateLandingPageHTML(SEO_INDUSTRIES.friseur)],
  ["Branche+Stadt", generateLandingPageHTML(SEO_INDUSTRIES.handwerk, DE_CITIES[0])],
  ["Übersicht", generateOverviewHTML()],
  ["Startseite (Prerender)", generateHomePrerender()],
];

describe("SEO-Preistexte", () => {
  it.each(pages())("%s: keine falschen Versprechen", (_name, html) => {
    expect(html).not.toMatch(/Monate gratis|Monate gespart/);
    expect(html).not.toMatch(/€\/Jahr/);
    expect(html).not.toMatch(/[Jj]ederzeit kündbar/);
    expect(html).not.toMatch(/Mindestlaufzeit|Mindestvertragsdauer/);
  });

  it("Branchenseite: Laufzeit, MwSt. und echte Fußnote zum Sternchen", () => {
    const html = generateLandingPageHTML(SEO_INDUSTRIES.friseur);
    expect(html).toContain(escapeHtml(PRICE_FOOTNOTE));
    expect(html).toContain(escapeHtml(TERM_COMPARISON));
    expect(html).toContain(escapeHtml(trialThenText("yearly")));
    expect(html).toContain(escapeHtml(trialThenText("monthly")));
    expect(html).toContain(escapeHtml(PRICE_FAQ_ANSWER));
    expect(html).toContain("12 Monaten Laufzeit");
    expect(html).toContain("inkl. 19 % MwSt.");
  });

  it("Meta-Description nennt die Laufzeit", () => {
    const html = generateLandingPageHTML(SEO_INDUSTRIES.friseur);
    const meta = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
    expect(meta).toContain(escapeHtml(PRICE_FROM_INLINE));
  });

  it("Startseite: Prerender zeigt die vollständigen Bedingungen", () => {
    expect(generateHomePrerender()).toContain(escapeHtml(PRICE_FULL));
  });
});
