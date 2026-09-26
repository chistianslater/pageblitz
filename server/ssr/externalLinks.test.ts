import { describe, expect, test } from "vitest";
import { openExternalLinksInNewTab } from "./externalLinks";

describe("openExternalLinksInNewTab", () => {
  test("externe Links bekommen neuen Tab", () => {
    expect(
      openExternalLinksInNewTab(
        '<a class="pb-cta" href="https://dicle.nexorder.de">Jetzt bestellen</a>'
      )
    ).toBe(
      '<a class="pb-cta" href="https://dicle.nexorder.de" target="_blank" rel="noopener noreferrer">Jetzt bestellen</a>'
    );
  });
  test("Anker, Telefon und relative Links bleiben", () => {
    const html =
      '<a href="#kontakt">K</a><a href="tel:+4928711">T</a><a href="/impressum">I</a>';
    expect(openExternalLinksInNewTab(html)).toBe(html);
  });
  test("vorhandenes rel wird nicht doppelt gesetzt", () => {
    expect(
      openExternalLinksInNewTab('<a href="https://a.de" rel="nofollow">A</a>')
    ).toBe('<a href="https://a.de" rel="nofollow" target="_blank">A</a>');
  });
  test("vorhandenes target bleibt unangetastet", () => {
    const html = '<a href="https://a.de" target="_self">A</a>';
    expect(openExternalLinksInNewTab(html)).toBe(html);
  });
  test("href in JSON-Skripten (escapte Anführungszeichen) bleibt", () => {
    const html = '<script>{"x":"<a href=\\"https://a.de\\">"}</script>';
    expect(openExternalLinksInNewTab(html)).toBe(html);
  });
});
