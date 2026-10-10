import { describe, expect, test } from "vitest";
import { SECTION_TYPES } from "../../../../../../shared/siteContract/schema";
import type { SectionV2 } from "../../../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "../../engine";
import { journalDoc, render, sectionHtml } from "./testkit";

type Doc = ReturnType<typeof journalDoc>;

/** Ein Abschnitt je Startseiten-Typ, mit minimal gültigen Daten. */
const EXTRAS: SectionV2[] = [
  { type: "faq", items: [{ question: "Parken?", answer: "Vor dem Haus." }] },
  {
    type: "menu",
    categories: [
      { name: "Kaffee", items: [{ name: "Espresso", price: "2,50" }] },
    ],
  },
  { type: "team", members: [{ name: "Mara Noir", role: "Inhaberin" }] },
  {
    type: "cta",
    headline: "Lust auf einen neuen Schnitt?",
    ctaText: "Termin buchen",
    ctaHref: "#kontakt",
  },
  {
    type: "story",
    headline: "Wie alles begann",
    body: "Erster Absatz.\n\nZweiter Absatz.",
  },
  {
    type: "usp",
    headline: "Was uns ausmacht",
    items: [
      { title: "Beratung vorher", text: "Fünf Minuten am Platz." },
      { title: "Preise vorher" },
    ],
  },
  { type: "notice", text: "Vom 12. bis 26.8. Betriebsurlaub." },
  {
    type: "stats",
    items: [
      { value: "12", label: "Jahre in der Maxvorstadt" },
      { value: "4,9", label: "bei Google" },
    ],
  },
  { type: "process", steps: [{ title: "Anfragen" }, { title: "Beraten" }] },
  {
    type: "quote",
    text: "Ein guter Schnitt wächst schön heraus.",
    author: "Mara Noir",
  },
  {
    type: "partners",
    headline: "Partner",
    items: [
      {
        imageUrl: "https://example.org/logo.png",
        name: "Davines",
        url: "https://davines.com",
      },
      { imageUrl: "https://example.org/l2.png", name: "Olaplex" },
    ],
  },
];

const allTypes = (): Doc => {
  const d = journalDoc();
  const contact = d.sections.filter(s => s.type === "contact");
  return {
    ...d,
    sections: [
      ...d.sections.filter(s => s.type !== "contact"),
      ...EXTRAS,
      ...contact,
    ],
  };
};

describe("Journal: alle Abschnittstypen", () => {
  test("jeder Startseiten-Typ außer notice erzeugt Journal-Markup mit Anker", () => {
    const html = render(allTypes());
    const types = SECTION_TYPES.filter(
      t => t !== "notice" && t !== "pageHeader"
    );
    for (const t of types)
      expect(html, t).toContain(`id="${SECTION_ANCHORS[t]}"`);
    for (const t of ["cta", "stats", "usp", "story", "quote", "partners"])
      expect(html, t).toContain(`jr-${t}`);
  });

  test("notice erscheint einmal zentral als Banner, nicht als Abschnitt", () => {
    const html = render(allTypes());
    expect(html.match(/Betriebsurlaub/g)).toHaveLength(1);
    expect(html.match(/id="hinweis"/g)).toHaveLength(1);
    expect(html).toContain('id="hinweis" class="pb-notice"');
  });

  test("jeder Navigations-Anker hat ein Ziel", () => {
    const html = render(allTypes());
    const head = html.slice(
      html.indexOf('class="jr-head"'),
      html.indexOf("</header>")
    );
    const anchors = [...head.matchAll(/href="#([\w-]+)"/g)].map(m => m[1]);
    expect(anchors.length).toBeGreaterThan(5);
    for (const a of new Set(anchors)) expect(html, a).toContain(`id="${a}"`);
  });

  test("Geschichte: nummeriertes Kapitel, Absätze getrennt", () => {
    const html = sectionHtml(render(allTypes()), "story");
    expect(html).toMatch(/jr-chapter-no[^>]*>\d\d<\/span>Geschichte/);
    expect(html).toContain(">Wie alles begann</h2>");
    expect(html.match(/<p>(Erster|Zweiter) Absatz\.<\/p>/g)).toHaveLength(2);
  });

  test("Vorteile: Kapitel mit Punkten, Text nur wenn vorhanden", () => {
    const html = sectionHtml(render(allTypes()), "usp");
    expect(html).toMatch(/jr-chapter-no[^>]*>\d\d</);
    expect(html).toContain(">Beratung vorher</h3>");
    expect(html).toContain(">Preise vorher</h3>");
    expect(html.match(/<p>Fünf Minuten am Platz\.<\/p>/g)).toHaveLength(1);
  });

  test("Zahlen: Wert kursiv groß, Bezeichnung darunter", () => {
    const html = render(allTypes());
    const stats = html.slice(html.indexOf('id="zahlen"'));
    expect(stats).toMatch(/class="jr-stat-value">12</);
    expect(stats).toContain("Jahre in der Maxvorstadt");
    const css = html.match(/<style>([\s\S]*?)<\/style>/)![1];
    expect(css).toMatch(/\.jr-stat-value\{[^}]*font-style:italic/);
  });

  test("Aufruf: dunkles Band mit h2 und Knopf", () => {
    const html = render(allTypes());
    const cta = html.slice(
      html.indexOf('id="anfrage"'),
      html.indexOf("</section>", html.indexOf('id="anfrage"'))
    );
    expect(cta).toContain("jr-cta");
    expect(cta).toMatch(/<h2[^>]*>Lust auf einen neuen Schnitt\?<\/h2>/);
    expect(cta).toMatch(
      /class="jr-pill jr-pill--light" href="#kontakt">Termin buchen</
    );
  });

  test("Zitat mit Urheber, Partner mit Logo und optionalem Link", () => {
    const html = render(allTypes());
    expect(html).toMatch(
      /<blockquote[^>]*>[\s\S]*Ein guter Schnitt wächst schön heraus\.[\s\S]*<\/blockquote>/
    );
    expect(html).toMatch(/jr-quote-author[^>]*>Mara Noir</);
    expect(html).toMatch(
      /<a href="https:\/\/davines\.com"[^>]*><img[^>]*alt="Davines"/
    );
    expect(html).toMatch(/<img[^>]*alt="Olaplex"/);
  });

  test("Zusatzabschnitte verschieben die Kapitelnummern lückenlos", () => {
    const html = render(allTypes());
    const nos = [...html.matchAll(/class="jr-chapter-no"[^>]*>(\d\d)</g)].map(
      m => +m[1]
    );
    expect(nos).toEqual(nos.map((_, i) => i + 2));
  });
});

describe("Journal: Unterseiten", () => {
  const page = (d: Doc = journalDoc()) =>
    render(d, false, "", "/leistungen-im-detail");

  test("Typo-Kopf mit Betriebsname als Kicker und genau einem h1", () => {
    const html = page();
    expect(html).toContain('class="jr-page-head"');
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>Leistungen im Detail<\/h1>/);
    const head = html.slice(html.indexOf('class="jr-page-head"'));
    expect(head).toMatch(/class="jr-kicker[^"]*">NOIR Haarstudio</);
    expect(head).toContain("Ein genauerer Blick auf unser Angebot");
    expect(html).not.toContain('class="jr-entry');
    expect(html).not.toMatch(/<section[^>]*id="start"/);
  });

  test("ohne pageHeader-Abschnitt trägt der Seitentitel den Kopf", () => {
    const d = journalDoc();
    const data = {
      ...d,
      pages: d.pages!.map(p => ({
        ...p,
        sections: p.sections.filter(s => s.type !== "pageHeader"),
      })),
    };
    const html = page(data);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>Leistungen im Detail<\/h1>/);
  });

  test("Anker der Navigation zeigen auf die Startseite", () => {
    const html = page();
    const head = html.slice(
      html.indexOf('class="jr-head"'),
      html.indexOf("</header>")
    );
    expect(head).not.toMatch(/href="#/);
    expect(head).toContain('href="/#leistungen"');
    expect(head).toMatch(/href="\/leistungen-im-detail" aria-current="page"/);
  });

  test("Navigation auf Unterseiten prüft Stimmen an der Startseite", () => {
    const d = journalDoc();
    const data = {
      ...d,
      sections: d.sections.map(s =>
        s.type === "testimonials"
          ? { ...s, items: [{ author: "A", text: "ok", rating: 3 }] }
          : s
      ),
    };
    expect(page(data)).not.toContain("#bewertungen");
  });
});

describe("Journal: Zwischentöne", () => {
  test("liegen auf dem Band des vorangehenden Kapitels", () => {
    const d = journalDoc();
    const data: Doc = {
      ...d,
      sections: [
        ...d.sections.filter(s => s.type === "hero" || s.type === "services"),
        { type: "quote", text: "Motto." },
        ...d.sections.filter(s => s.type === "about"),
        {
          type: "stats",
          items: [
            { value: "1", label: "a" },
            { value: "2", label: "b" },
          ],
        },
      ],
    };
    const html = render(data);
    // Leistungen = 02 (Papier) → Zitat Papier; Über uns = 03 (hell) → Zahlen hell
    expect(html).toContain('class="jr-section jr-quote-band"');
    expect(html).toContain('class="jr-section jr-stats jr-section--raised"');
  });
});
