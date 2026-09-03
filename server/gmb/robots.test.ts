import { describe, expect, test } from "vitest";
import { isPathAllowed, parseRobotsRules } from "./siteCrawl";

const REAL = `User-Agent: *
Allow: /
Disallow: /*/danke
Disallow: /de/erfolgreich-angemeldet
Disallow: /api/
Disallow: /*/angebot/

User-Agent: GPTBot
Disallow: /
`;

describe("robots.txt: Platzhalter richtig auswerten (Befund 2026-09-03)", () => {
  test("Platzhalter-Regeln sperren nur ihr Muster, nicht die ganze Website", () => {
    const rules = parseRobotsRules(REAL);
    expect(isPathAllowed("/", rules)).toBe(true);
    expect(isPathAllowed("/de", rules)).toBe(true);
    expect(isPathAllowed("/de/leistungen", rules)).toBe(true);
    expect(isPathAllowed("/de/danke", rules)).toBe(false);
    expect(isPathAllowed("/en/danke", rules)).toBe(false);
    expect(isPathAllowed("/de/angebot/xy", rules)).toBe(false);
    expect(isPathAllowed("/api/kram", rules)).toBe(false);
    expect(isPathAllowed("/de/erfolgreich-angemeldet", rules)).toBe(false);
  });

  test("nur die Gruppe für * gilt, fremde Gruppen bleiben außen vor", () => {
    const rules = parseRobotsRules(REAL);
    // Die GPTBot-Gruppe verbietet alles — für uns irrelevant.
    expect(isPathAllowed("/irgendwas", rules)).toBe(true);
  });

  test("vollständige Sperre wird erkannt", () => {
    expect(
      isPathAllowed("/", parseRobotsRules("User-agent: *\nDisallow: /\n"))
    ).toBe(false);
  });

  test("Allow schlägt eine gleich lange Disallow-Regel, längeres Muster gewinnt", () => {
    const rules = parseRobotsRules(
      "User-agent: *\nDisallow: /shop\nAllow: /shop/angebote\n"
    );
    expect(isPathAllowed("/shop", rules)).toBe(false);
    expect(isPathAllowed("/shop/angebote", rules)).toBe(true);
  });

  test("$ verankert das Ende", () => {
    const rules = parseRobotsRules("User-agent: *\nDisallow: /*.pdf$\n");
    expect(isPathAllowed("/prospekt.pdf", rules)).toBe(false);
    expect(isPathAllowed("/prospekt.pdf.html", rules)).toBe(true);
  });

  test("leere robots.txt oder leerer Disallow erlaubt alles", () => {
    expect(isPathAllowed("/", parseRobotsRules(""))).toBe(true);
    expect(
      isPathAllowed("/", parseRobotsRules("User-agent: *\nDisallow:\n"))
    ).toBe(true);
  });

  test("Kommentare und Groß-/Kleinschreibung der Felder", () => {
    const rules = parseRobotsRules(
      "# Hinweis\nUSER-AGENT: *\nDISALLOW: /geheim # intern\n"
    );
    expect(isPathAllowed("/geheim/x", rules)).toBe(false);
    expect(isPathAllowed("/offen", rules)).toBe(true);
  });
});
