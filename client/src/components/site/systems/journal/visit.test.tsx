import { describe, expect, test } from "vitest";
import type {
  SectionOf,
  SectionV2,
} from "../../../../../../shared/siteContract/types";
import { PLACEHOLDER_OPENING_HOURS } from "../../../../../../shared/onboardingV2/openingHours";
import { journalDoc, render, sectionHtml } from "./testkit";

type Doc = ReturnType<typeof journalDoc>;

const withContact = (d: Doc, patch: Partial<SectionOf<"contact">>): Doc => ({
  ...d,
  sections: d.sections.map(s =>
    s.type === "contact" ? { ...s, ...patch } : s
  ),
});

const withoutType = (d: Doc, type: string): Doc => ({
  ...d,
  sections: d.sections.filter(s => s.type !== type),
});

const dock = (html: string) => {
  const at = html.indexOf('class="jr-dock"');
  return at === -1 ? "" : html.slice(at, html.indexOf("</nav>", at));
};

const withFaq = (d: Doc): Doc => ({
  ...d,
  sections: d.sections.flatMap((s): SectionV2[] =>
    s.type === "contact"
      ? [
          {
            type: "faq" as const,
            items: [
              {
                question: "Kann ich ohne Termin kommen?",
                answer: "Meistens ja.",
              },
              { question: "Kann ich mit Karte zahlen?", answer: "Ja." },
            ],
          },
          s,
        ]
      : [s]
  ),
});

describe("Journal: Gut zu wissen", () => {
  test("FAQ als details mit Haarlinien-Liste, erste Frage offen", () => {
    const html = sectionHtml(render(withFaq(journalDoc())), "faq");
    expect(html).toContain('id="faq"');
    expect(html).toContain('<details class="jr-faq-item" open=""');
    expect(html.match(/<details class="jr-faq-item"/g)!.length).toBe(
      (html.match(/<summary/g) ?? []).length
    );
    expect(html).toMatch(/class="jr-faq-sign" aria-hidden="true"/);
    expect(html).toMatch(/jr-chapter-no[^>]*>\d\d</);
    expect(html).toContain(">Häufige Fragen</h2>");
    expect(html.match(/<details/g)).toHaveLength(2);
    expect(html.match(/ open=""/g)).toHaveLength(1);
  });

  test("Kapitelkopf links, Liste rechts (jr-split)", () => {
    const html = sectionHtml(render(withFaq(journalDoc())), "faq");
    expect(html).toContain('class="jr-split-body jr-faq-list"');
    // Listenklasse kollidiert nicht mit der Abschnittsklasse jr-faq
    const css = render().match(/<style>([\s\S]*?)<\/style>/)![1];
    expect(css).not.toMatch(/\.jr-faq\{/);
  });
});

describe("Journal: Besuch", () => {
  test("Kontakt mit Name, Adresse, Route und Telefon", () => {
    const html = sectionHtml(render(), "contact");
    expect(html).toContain('class="jr-section jr-contact');
    expect(html).toContain('id="kontakt"');
    expect(html).toContain("NOIR Haarstudio");
    expect(html).toContain("Türkenstraße 42");
    expect(html).toContain("80799 München-Maxvorstadt");
    expect(html).toContain("google.com/maps/search/?api=1&amp;query=");
    expect(html).toContain(">Route planen<");
    expect(html).toContain('href="tel:089551792"');
    expect(html).toContain('href="mailto:termin@noir-haarstudio.de"');
  });

  test("Kapitel „Besuch“ mit Überschrift „Öffnungszeiten und Weg“ statt „Kontakt“", () => {
    const html = sectionHtml(render(), "contact");
    expect(html).toMatch(/jr-chapter-no[^>]*>\d\d<\/span>Besuch/);
    expect(html).toContain(">Öffnungszeiten und Weg</h2>");
  });

  test("eigene Überschrift bleibt", () => {
    const html = sectionHtml(
      render(withContact(journalDoc(), { headline: "So kommst du zu uns" })),
      "contact"
    );
    expect(html).toContain(">So kommst du zu uns</h2>");
  });

  test("Öffnungszeiten mit heutigem Tag markiert (Dienstag)", () => {
    const d = withContact(journalDoc(), {
      openingHours: [
        { day: "Montag", hours: "geschlossen" },
        { day: "Di–Fr", hours: "09:00–18:00 Uhr" },
        { day: "Samstag", hours: "09:00–14:00" },
      ],
    });
    const html = sectionHtml(render(d), "contact");
    expect(html).toMatch(
      /<div class="jr-hours-row"><dt>Montag<\/dt><dd class="jr-hours-closed">geschlossen<\/dd>/
    );
    expect(html).toMatch(
      /<div class="jr-hours-row" data-today="yes"><dt>Di–Fr<em class="jr-today">heute<\/em><\/dt><dd>9–18 Uhr<\/dd>/
    );
    expect(html).toContain("<dd>9–14 Uhr</dd>");
    expect(html.match(/data-today/g)).toHaveLength(1);
  });

  test("Platzhalter-Öffnungszeiten werden nie gezeigt", () => {
    const d = withContact(journalDoc(), {
      openingHours: PLACEHOLDER_OPENING_HOURS.map(h => ({ ...h })),
    });
    const html = render(d);
    expect(sectionHtml(html, "contact")).not.toContain("jr-hours");
    expect(html).not.toContain("9–17 Uhr");
    // Ohne Zeiten keine Zeiten-Überschrift
    expect(sectionHtml(html, "contact")).toContain(">Adresse und Weg</h2>");
  });

  test("Sprechzeiten-Bauplan (Praxis) benennt die Zeiten", () => {
    const d = {
      ...journalDoc(),
      businessCategory: "Zahnarzt",
      businessName: "Zahnarztpraxis Dr. Berg",
    };
    expect(sectionHtml(render(d), "contact")).toContain(
      ">Sprechzeiten und Weg</h2>"
    );
  });

  test("Karte ist ein ruhiger Platzhalter ohne Drittanbieter", () => {
    const html = render();
    const contact = sectionHtml(html, "contact");
    expect(contact).toMatch(
      /<a class="jr-map"[^>]*href="https:\/\/www\.google\.com\/maps\/search\//
    );
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("maps.googleapis");
  });

  test("ohne Adresse: keine Karte, keine Route", () => {
    const d = withContact(journalDoc(), {
      street: undefined,
      zip: undefined,
      city: undefined,
    });
    const contact = sectionHtml(render(d), "contact");
    expect(contact).not.toContain("jr-map");
    expect(contact).not.toContain("Route planen");
  });

  test("Handwerk (Anfrage): Bauplan-Label, Anfrage-Knopf, „Anfahrt“", () => {
    const d = {
      ...journalDoc(),
      businessCategory: "Tischlerei",
      businessName: "Tischlerei Klähn",
    };
    const contact = sectionHtml(render(d), "contact");
    expect(contact).toMatch(/jr-chapter-no[^>]*>\d\d<\/span>Anfrage/);
    expect(contact).toContain(">Kontakt und Anfahrt</h2>");
    expect(contact).toMatch(
      /class="jr-pill" href="mailto:termin@noir-haarstudio\.de\?subject=/
    );
    expect(contact).toContain(">Anfahrt<");
    expect(contact).not.toContain(">Route planen<");
  });

  test("Kontaktformular nur mit aktivem Feature: Bereich vorbereitet, Insel unverändert", () => {
    expect(sectionHtml(render(), "contact")).not.toContain("jr-contact-form");
    // Feature aktiv, aber ohne Slug rendert SiteIslands kein Formular —
    // dann auch kein verwaister Formular-Titel.
    const noSlug = render(journalDoc("features"));
    expect(sectionHtml(noSlug, "contact")).not.toContain("jr-contact-form");
    expect(noSlug).not.toContain('data-island="contact"');
    const html = render(journalDoc("features"), false, "", undefined, "noir");
    expect(sectionHtml(html, "contact")).toContain("jr-contact-form");
    expect(html).toContain('data-island="contact"');
  });
});

describe("Journal: E-Mail-Links aus Kundendaten", () => {
  // mailHref selbst: ../shared/helpers.test.ts
  test("ungültige Adresse: kein mailto-Link in Besuch und Fuß", () => {
    const html = render(withContact(journalDoc(), { email: "a@b.de?bcc=x@y.de" }));
    expect(html).not.toContain("mailto:");
  });
});

describe("Journal: Handy-Dock", () => {
  test("Dock mit Hauptaktion und Anruf-Link", () => {
    const html = render();
    expect(html).toMatch(/class="jr-dock"[\s\S]*href="tel:/);
    const d = dock(html);
    expect(d).toMatch(
      /<a class="jr-dock-main" href="#kontakt">Termin buchen<\/a>/
    );
    expect(d).toMatch(
      /class="jr-dock-icon" href="tel:089551792" aria-label="Anrufen"/
    );
  });

  test("ohne Telefon: Route als Zweitaktion", () => {
    const d = dock(render(withContact(journalDoc(), { phone: undefined })));
    expect(d).not.toContain("tel:");
    expect(d).toMatch(
      /class="jr-dock-icon" href="https:\/\/www\.google\.com\/maps/
    );
    expect(d).toContain('aria-label="Route planen"');
  });

  test("ohne Telefon und Adresse: nur die Hauptaktion", () => {
    const d = dock(
      render(
        withContact(journalDoc(), {
          phone: undefined,
          street: undefined,
          zip: undefined,
          city: undefined,
        })
      )
    );
    expect(d).toContain("jr-dock-main");
    expect(d).not.toContain("jr-dock-icon");
  });

  test("Seite bekommt unten Platz für das Dock, nur auf dem Handy", () => {
    const css = render().match(/<style>([\s\S]*?)<\/style>/)![1];
    expect(css).toMatch(
      /@media \(max-width:47\.99rem\)\{[^}]*\.pb-journal\{[^}]*padding-bottom:var\(--jr-dock-space\)/
    );
    expect(css).toMatch(
      /@media \(min-width:48rem\)\{\.pb-journal \.jr-dock\{display:none\}/
    );
  });

  test("Dock ohne Kontakt-Abschnitt bleibt bedienbar", () => {
    const html = render(withoutType(journalDoc(), "contact"));
    expect(dock(html)).toContain("jr-dock-main");
  });
});
