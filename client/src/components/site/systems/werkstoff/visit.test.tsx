import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { SiteRenderer } from "../../SiteRenderer";
import type { SectionV2 } from "../../../../../../shared/siteContract/types";
import { SECTION_TYPES } from "../../../../../../shared/siteContract/schema";
import { PLACEHOLDER_OPENING_HOURS } from "../../../../../../shared/onboardingV2/openingHours";
import { WERKSTOFF } from "../../../../../../shared/designSystems/werkstoff";
import {
  contrastRatio,
  mix,
} from "../../../../../../shared/stylePacks/colorMath";
import { SECTION_ANCHORS } from "../../engine";
import { WERKSTOFF_CSS } from "./css";
import {
  holtkampDoc,
  ladenDoc,
  render,
  sectionHtml,
  TEST_NOW,
  werkstoffFixture,
  withContact,
} from "./testkit";

type Doc = ReturnType<typeof holtkampDoc>;
const count = (html: string, needle: string) => html.split(needle).length - 1;

const withFaq = (doc: Doc): Doc => ({
  ...doc,
  sections: [
    ...doc.sections,
    {
      type: "faq",
      items: [
        {
          question: "Was kostet ein Möbel nach Maß?",
          answer: "Nach dem Aufmaß gibt es einen Festpreis.",
        },
        { question: "Kommt ihr ins Umland?", answer: "Ja." },
      ],
    },
  ],
});

describe("Werkstoff: Gut zu wissen", () => {
  test("<details>, erste offen, eckiges Plus versteckt, Anruf-Link mit echter Nummer", () => {
    const s = sectionHtml(render(withFaq(holtkampDoc())), "faq");
    expect(count(s, "<details")).toBe(2);
    expect(count(s, '<details class="ws-faq-item" open')).toBe(1);
    expect(s).toContain('<span class="ws-faq-sign" aria-hidden="true"></span>');
    expect(s).toMatch(
      /<a class="ws-link" href="tel:\d+">0251 555 0147 anrufen<\/a>/
    );
  });

  test("ohne Telefon kein Anruf-Link", () => {
    const s = sectionHtml(
      render(withContact(withFaq(holtkampDoc()), { phone: undefined })),
      "faq"
    );
    expect(s).not.toContain("anrufen");
  });
});

describe("Werkstoff: Besuch", () => {
  test("Zeiten-Karte: Stand in Klartext, Heute-Zeile (Dienstag fällt in Mo–Do)", () => {
    const s = sectionHtml(render(holtkampDoc()), "contact");
    expect(s).toContain('<div class="ws-hours-card">');
    expect(s).toMatch(
      /<p class="ws-hours-status"><span class="ws-dot" aria-hidden="true"><\/span>Heute geöffnet bis 17:00<\/p>/
    );
    expect(count(s, "ws-hours-row--today")).toBe(1);
    expect(s).toContain('<dt>Mo–Do<span class="ws-today"> heute</span></dt>');
  });

  test("Platzhalter-Zeiten erscheinen nie", () => {
    const s = sectionHtml(
      render(
        withContact(holtkampDoc(), { openingHours: PLACEHOLDER_OPENING_HOURS })
      ),
      "contact"
    );
    expect(s).not.toContain("ws-hours");
  });

  test("Kartenfläche ohne Einbettung, ein Tab-Halt; ohne Adresse keine Karte", () => {
    const s = sectionHtml(render(holtkampDoc()), "contact");
    expect(count(s, 'class="ws-map"')).toBe(1);
    expect(s).toMatch(
      /<a class="ws-map" href="https:\/\/www\.google\.com\/maps[^"]*" aria-label="[^"]+: Am Kanal 41, 48155 Münster"/
    );
    expect(s).not.toContain("<iframe");
    const none = sectionHtml(
      render(
        withContact(holtkampDoc(), {
          street: undefined,
          zip: undefined,
          city: undefined,
        })
      ),
      "contact"
    );
    expect(none).not.toContain("ws-map");
  });

  test("Formular-Titel nur, wenn die Kontakt-Insel wirklich rendert", () => {
    const features = { ...holtkampDoc(), features: { contactForm: true } };
    expect(sectionHtml(render(holtkampDoc()), "contact")).not.toContain(
      "ws-form-title"
    );
    expect(sectionHtml(render(features), "contact")).not.toContain(
      "ws-form-title"
    );
    const html = render(features, false, "", undefined, "holtkamp");
    expect(sectionHtml(html, "contact")).toContain("ws-form-title");
    expect(html).toContain('data-island="contact"');
  });
});

const EXTRAS: SectionV2[] = [
  { type: "team", members: [{ name: "Bernd Holtkamp", role: "Meister" }] },
  {
    type: "cta",
    headline: "Aufmaß ausmachen?",
    ctaText: "Termin anfragen",
    ctaHref: "#kontakt",
  },
  {
    type: "story",
    headline: "Wie alles begann",
    body: "Erster Absatz.\n\nZweiter Absatz.",
  },
  {
    type: "usp",
    headline: "Worauf du dich verlassen kannst",
    items: [
      { title: "Festpreis", text: "Vor dem Bau." },
      { title: "Eigene Werkstatt" },
    ],
  },
  { type: "notice", text: "Vom 24. bis 26.12. geschlossen." },
  {
    type: "stats",
    items: [
      { value: "12", label: "Jahre am Ort" },
      { value: "3", label: "Hobelbänke" },
    ],
  },
  { type: "quote", text: "„Ehrlich gebaut.“", author: "Bernd Holtkamp" },
  {
    type: "faq",
    items: [{ question: "Wie lange dauert es?", answer: "Meist vier Wochen." }],
  },
  {
    type: "menu",
    categories: [
      { name: "Kaffee", items: [{ name: "Espresso", price: "2,40" }] },
    ],
  },
  {
    type: "pricelist",
    categories: [{ name: "Service", items: [{ name: "Aufmaß", price: "0" }] }],
  },
  {
    type: "partners",
    headline: "Partner",
    items: [
      {
        imageUrl: "https://example.org/logo.png",
        name: "Innung",
        url: "https://example.org",
      },
      { imageUrl: "https://example.org/l2.png", name: "HWK" },
    ],
  },
];

const allTypes = (): Doc => {
  const d = holtkampDoc();
  const c = d.sections.filter(s => s.type === "contact");
  return {
    ...d,
    features: { ...(d.features ?? {}), menu: true },
    sections: [
      ...d.sections.filter(s => s.type !== "contact"),
      ...EXTRAS,
      ...c,
    ],
  } as Doc;
};

describe("Werkstoff: alle Abschnittstypen", () => {
  test("jeder Startseiten-Typ außer notice rendert eigenes Markup mit Anker, ein h1", () => {
    const html = render(allTypes());
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    for (const t of SECTION_TYPES.filter(
      t => t !== "notice" && t !== "pageHeader"
    ))
      expect(html, t).toContain(`id="${SECTION_ANCHORS[t]}"`);
    for (const t of ["cta", "stats", "usp", "story", "motto", "partners"])
      expect(html, t).toContain(`ws-${t}`);
    // Keine vorläufige Grundform mehr
    expect(html).not.toContain("ws-rows");
  });

  test("Aufruf bleibt hell: Tinte-Linie, Signal-Knopf", () => {
    const s = sectionHtml(render(allTypes()), "cta");
    expect(s).toContain(
      '<h2 class="ws-title" id="anfrage-titel">Aufmaß ausmachen?</h2>'
    );
    expect(s).toContain(
      '<a class="ws-btn" href="#kontakt">Termin anfragen</a>'
    );
    expect(WERKSTOFF_CSS).not.toMatch(
      /\.ws-cta[^{]*\{[^}]*background:var\(--sys-deep\)/
    );
  });

  test("Zitat ohne doppelte Anführung", () => {
    const html = render(allTypes());
    expect(html).toContain("„Ehrlich gebaut.“");
    expect(html).not.toMatch(/„„|““/);
  });
});

describe("Werkstoff: Unterseiten und Rechtsseiten", () => {
  test("Unterseite: genau ein h1, Anker zeigen auf die Startseite", () => {
    const html = render(
      werkstoffFixture("full"),
      false,
      "/site/brandt",
      "/leistungen-im-detail"
    );
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain('class="ws-page-head"');
    expect(html).not.toContain('class="ws-entry');
    expect(html).toMatch(/href="\/site\/brandt#kontakt"/);
  });

  test("Rechtsseite: ein h1, Mono-Kicker, Generator-Stil fällt weg", () => {
    const html = renderToStaticMarkup(
      <SiteRenderer
        data={ladenDoc()}
        basePath="/site/laden"
        now={TEST_NOW}
        legal={{
          title: "Impressum",
          html: '<style>body{max-width:800px}</style><h1>Impressum</h1><h2>Angaben gemäß § 5 DDG</h2><p>Heike Wiewel</p><a class="back-link" href="/">Zurück</a>',
        }}
      />
    );
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain(
      '<p class="ws-page-kicker">Laden am Markt · Rechtliches</p>'
    );
    expect(html).toContain('class="ws-wrap ws-legal"');
    expect(html).not.toMatch(/<style>[^<]*max-width:\s*800px/);
    expect(html).toMatch(/href="\/site\/laden#kontakt"/);
    // Inline-Grau des Generators (#9ca3af) wird gedämpft in Tokens.
    expect(WERKSTOFF_CSS).toMatch(
      /\.ws-legal \[style\*="color"\]\{color:var\(--sys-muted\)!important\}/
    );
  });
});

describe("Werkstoff: Laden-Beispiel", () => {
  test("Texte passen zum Schreibwarenladen, fiktive Kontaktdaten", () => {
    const html = render(ladenDoc());
    expect(html).not.toMatch(/Trauring|Goldschmied|Gold\b|Gravur|Hartung|Lübeck/);
    expect(html).toContain("hallo@laden-am-markt.example");
    expect(html).toContain("02581 555 0388");
  });
});

describe("Werkstoff: Paletten für Insel, Banner, Tafel, Bildnachweis", () => {
  // Erhabene Fläche = Papier 34 % mit Weiß (RAISED).
  const raised = (paper: string) => mix(paper, "#ffffff", 0.34);
  test.each(WERKSTOFF.palettes.map(p => [p.id, p] as const))(
    "%s: AA",
    (_id, p) => {
      const onSignal = p.onSignal ?? p.onDeep;
      const signal = p.signal ?? p.accent;
      // Banner, Tafel, Absenden-Knopf: onSignal auf Signal
      expect(contrastRatio(onSignal, signal)).toBeGreaterThanOrEqual(4.5);
      // Heute-Zeile der Tafel: Signal mit 22 % Tinte
      expect(
        contrastRatio(onSignal, mix(p.ink, signal, 0.22))
      ).toBeGreaterThanOrEqual(4.5);
      // Insel-Labels und Feldtext auf erhabener Fläche
      expect(contrastRatio(p.muted, raised(p.paper))).toBeGreaterThanOrEqual(
        4.5
      );
      expect(contrastRatio(p.ink, raised(p.paper))).toBeGreaterThanOrEqual(7);
      // „heute" in Akzent auf der Heute-Zeile (Signal 7 % auf erhabener Fläche)
      expect(
        contrastRatio(p.accent, mix(signal, raised(p.paper), 0.07))
      ).toBeGreaterThanOrEqual(4.5);
      // Bildnachweis: gedämpft auf deep
      expect(
        contrastRatio(mix(p.onDeep, p.deep, 0.66), p.deep)
      ).toBeGreaterThanOrEqual(4.5);
    }
  );

  test("Banner und Insel nutzen nur Tokens", () => {
    expect(WERKSTOFF_CSS).toMatch(
      /\.pb-notice\{background:var\(--sys-signal\);color:var\(--sys-on-signal\)/
    );
    expect(WERKSTOFF_CSS).toMatch(
      /\.pb-island-submit\{[^}]*background:var\(--sys-signal\);color:var\(--sys-on-signal\)/
    );
  });
});
