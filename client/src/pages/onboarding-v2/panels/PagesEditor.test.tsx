import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Page, WebsiteDataV2 } from "@shared/siteContract/types";
import { PagesEditor } from "./PagesEditor";

const doc: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Schreinerei Brandt",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "H" },
    { type: "contact", phone: "0231 1" },
  ],
};

const twoPages: Page[] = [
  {
    slug: "leistungen-im-detail",
    title: "Leistungen im Detail",
    navLabel: "Leistungen",
    seo: { title: "Leistungen im Detail", description: "Alles im Überblick." },
    sections: [
      { type: "pageHeader", title: "Leistungen im Detail", intro: "Intro." },
      {
        type: "services",
        headline: "Leistungen",
        items: [
          { title: "Möbelbau", description: "Nach Maß", price: "ab 900 €" },
        ],
      },
      { type: "contact", headline: "Kontakt" },
    ],
  },
  {
    slug: "ueber-uns",
    title: "Über uns",
    seo: { title: "Über uns", description: "" },
    sections: [
      { type: "pageHeader", title: "Über uns" },
      { type: "about", headline: "Wer wir sind", body: "Seit 1990." },
      { type: "faq", items: [{ question: "Wann?", answer: "Immer." }] },
      { type: "gallery", images: [{ url: "/g.jpg", alt: "Bild" }] },
    ],
  },
];

function render(pages: Page[]): string {
  return renderToStaticMarkup(
    <PagesEditor value={pages} onChange={() => {}} doc={doc} />
  );
}

describe("PagesEditor", () => {
  test("ohne Seiten: Leerzustand + Feld und Button zum Anlegen", () => {
    const html = render([]);
    expect(html).toContain("Noch keine Unterseite");
    expect(html).toContain('aria-label="Titel der neuen Seite"');
    expect(html).toContain(">Seite anlegen<");
  });

  test("rendert Titel, Pfad, Navigationsname und SEO-Felder je Seite mit nummerierten Labels", () => {
    const html = render(twoPages);
    expect(html).toContain('aria-label="Seitentitel Seite 1"');
    expect(html).toContain('value="Leistungen im Detail"');
    expect(html).toContain('aria-label="Pfad Seite 1"');
    expect(html).toContain('value="leistungen-im-detail"');
    expect(html).toContain('aria-label="Navigationsname Seite 1 (optional)"');
    expect(html).toContain('value="Leistungen"');
    expect(html).toContain('aria-label="SEO-Titel Seite 1"');
    expect(html).toContain('aria-label="SEO-Beschreibung Seite 1"');
    expect(html).toContain('aria-label="Seitentitel Seite 2"');
    expect(html).toContain('value="ueber-uns"');
  });

  test("Seiten-Aktionen: nach oben/unten verschieben (Rand deaktiviert) und entfernen, mit Seitenbezug im Label", () => {
    const html = render(twoPages);
    expect(html).toContain(
      'aria-label="Seite ‚Leistungen im Detail‘ nach oben verschieben"'
    );
    expect(html).toContain(
      'aria-label="Seite ‚Leistungen im Detail‘ nach unten verschieben"'
    );
    expect(html).toContain(
      'aria-label="Seite ‚Leistungen im Detail‘ entfernen"'
    );
    // Erste Seite: „nach oben“ deaktiviert; letzte Seite: „nach unten“ deaktiviert.
    expect(html).toMatch(
      /aria-label="Seite ‚Leistungen im Detail‘ nach oben verschieben" disabled=""/
    );
    expect(html).toMatch(
      /aria-label="Seite ‚Über uns‘ nach unten verschieben" disabled=""/
    );
  });

  test("Mini-Editoren je Sektionstyp: pageHeader, services, about, faq; contact/gallery als Hinweis", () => {
    const html = render(twoPages);
    // pageHeader (Seite 1, Sektion 1)
    expect(html).toContain('aria-label="Titel Sektion 1 Seite 1"');
    expect(html).toContain(
      'aria-label="Einleitung Sektion 1 Seite 1 (optional)"'
    );
    expect(html).toContain(">Intro.</textarea>");
    // services (Seite 1, Sektion 2)
    expect(html).toContain('aria-label="Überschrift Sektion 2 Seite 1"');
    expect(html).toContain('aria-label="Titel Zeile 1 Sektion 2 Seite 1"');
    expect(html).toContain(
      'aria-label="Beschreibung Zeile 1 Sektion 2 Seite 1 (optional)"'
    );
    expect(html).toContain(
      'aria-label="Preis Zeile 1 Sektion 2 Seite 1 (optional)"'
    );
    expect(html).toContain('value="ab 900 €"');
    // contact (Seite 1, Sektion 3) → Hinweis, kein Eingabefeld
    expect(html).toContain("übernimmt die Kontaktdaten");
    // about (Seite 2, Sektion 2)
    expect(html).toContain('aria-label="Überschrift Sektion 2 Seite 2"');
    expect(html).toContain('aria-label="Text Sektion 2 Seite 2"');
    expect(html).toContain(">Seit 1990.</textarea>");
    // faq (Seite 2, Sektion 3)
    expect(html).toContain('aria-label="Frage Zeile 1 Sektion 3 Seite 2"');
    expect(html).toContain('aria-label="Antwort Zeile 1 Sektion 3 Seite 2"');
    // gallery (Seite 2, Sektion 4) → Hinweis
    expect(html).toContain("nutzt die Galerie-Bilder");
  });

  test("Sektions-Aktionen und Vorlagen-Auswahl je Seite", () => {
    const html = render(twoPages);
    expect(html).toContain(
      'aria-label="Sektion 2 Seite 1 nach oben verschieben"'
    );
    expect(html).toContain(
      'aria-label="Sektion 2 Seite 1 nach unten verschieben"'
    );
    expect(html).toContain('aria-label="Sektion 2 Seite 1 entfernen"');
    expect(html).toContain('aria-label="Vorlage Seite 1"');
    expect(html).toContain(">Leistungen</option>");
    expect(html).toContain(">Über uns</option>");
    expect(html).toContain(">Galerie</option>");
    expect(html).toContain(">FAQ</option>");
    expect(html).toContain(">Kontakt</option>");
    expect(html).toContain(">Sektion hinzufügen<");
  });

  test("Validierungsfehler erscheinen als role=alert-Liste", () => {
    const broken: Page[] = [{ ...twoPages[0], title: "" }];
    const html = render(broken);
    expect(html).toContain('role="alert"');
    expect(html).toContain("Titel fehlt bei Seite 1.");
  });

  test("Limit: bei 5 Seiten ist „Seite anlegen“ deaktiviert", () => {
    const five = ["a1", "a2", "a3", "a4", "a5"].map<Page>(slug => ({
      slug,
      title: slug,
      seo: { title: slug, description: "" },
      sections: [{ type: "pageHeader", title: slug }],
    }));
    const html = render(five);
    expect(html).toMatch(
      /<button[^>]*disabled=""[^>]*>Seite anlegen<\/button>/
    );
  });
});
