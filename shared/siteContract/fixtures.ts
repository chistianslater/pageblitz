import type { PackId, WebsiteDataV2 } from "./types";

/**
 * Deterministische Demo-Datensätze pro Style Pack.
 *
 * Plan A deckt nur "werkbank" ab. Weitere Packs werden nachgezogen,
 * sobald ihre Kompositionen existieren (siehe getFixture-Fehlermeldung).
 */
type FixtureKind = "full" | "minimal";
type FixtureSet = Record<FixtureKind, WebsiteDataV2>;

const WERKBANK_FULL: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Schreinerei Brandt",
  slug: "schreinerei-brandt-dortmund",
  businessCategory: "Schreinerei",
  tagline: "Massarbeit aus Holz. Punkt.",
  logo: { kind: "font", font: "Brandt" },
  sections: [
    {
      type: "hero",
      headline: "Massarbeit aus Holz. Punkt.",
      subheadline:
        "Schreinerei Brandt fertigt Möbel, Einbauten und Restaurierungen in Dortmund — von Hand, auf Maß, für die Ewigkeit gedacht.",
      ctaText: "Projekt anfragen",
      ctaHref: "#kontakt",
      imageUrl: "/demo/werkbank-hero.jpg",
    },
    {
      type: "services",
      headline: "Leistungen",
      intro:
        "Vier Kernbereiche, ein Anspruch: sauber gearbeitet, lange haltbar.",
      items: [
        {
          title: "Möbelbau",
          description:
            "Einzelstücke nach Maß — vom Küchentisch bis zum Bücherregal.",
          price: "ab 890 €",
        },
        {
          title: "Innenausbau",
          description:
            "Einbauschränke, Türen und Verkleidungen passgenau eingepasst.",
          price: "auf Anfrage",
        },
        {
          title: "Restaurierung",
          description: "Alte Möbelstücke aufgearbeitet statt weggeworfen.",
          price: "ab 350 €",
        },
        {
          title: "Fenster & Türen",
          description:
            "Holzfenster und Türen gefertigt, montiert und gewartet.",
          price: "auf Anfrage",
        },
      ],
    },
    {
      type: "about",
      headline: "Über uns",
      body: "Seit 2004 fertigt die Schreinerei Brandt in Dortmund Möbel und Einbauten aus massivem Holz. Was als Zwei-Mann-Werkstatt begann, ist heute ein Team aus fünf Handwerkern mit eigener Lehrwerkstatt für den Nachwuchs. Wir arbeiten mit heimischen Hölzern, planen jedes Stück gemeinsam mit dem Kunden vor Ort und liefern nur, was wir selbst in unserem eigenen Zuhause stehen hätten. Kein Katalog, keine Massenware, kein Ablauf von der Stange — jedes Projekt beginnt mit einem persönlichen Vor-Ort-Termin und endet mit einem Stück, das Generationen überstehen soll.",
      imageUrl: "/demo/werkbank-about.jpg",
    },
    {
      type: "gallery",
      headline: "Projekte",
      images: [
        {
          url: "/demo/werkbank-gallery-1.jpg",
          alt: "Massivholztisch in einer Dortmunder Altbauwohnung",
        },
        {
          url: "/demo/werkbank-gallery-2.jpg",
          alt: "Maßgefertigter Einbauschrank aus Eiche",
        },
        {
          url: "/demo/werkbank-gallery-3.jpg",
          alt: "Restauriertes Sideboard aus den 1960ern",
        },
      ],
    },
    {
      type: "testimonials",
      headline: "Was Kunden sagen",
      items: [
        {
          author: "Martina Kessler",
          text: "Der Einbauschrank passt auf den Millimeter. Beratung, Termine, Umsetzung — alles ohne Reibung.",
          rating: 5,
        },
        {
          author: "Jonas Wieland",
          text: "Unseren alten Esstisch vom Großvater hat Brandt wieder zum Leben erweckt. Sieht aus wie neu, fühlt sich an wie alt.",
          rating: 5,
        },
        {
          author: "Petra Sommer",
          text: "Schnelle Rückmeldung, fairer Preis, saubere Arbeit. Genau das, was man sich von einem Handwerksbetrieb wünscht.",
          rating: 4,
        },
      ],
    },
    {
      type: "contact",
      headline: "Kontakt",
      phone: "0231 555 4471",
      email: "info@schreinerei-brandt-dortmund.de",
      street: "Huckarder Straße 21",
      zip: "44147",
      city: "Dortmund",
      openingHours: [
        { day: "Montag", hours: "7:00 – 17:00" },
        { day: "Dienstag", hours: "7:00 – 17:00" },
        { day: "Mittwoch", hours: "7:00 – 17:00" },
        { day: "Donnerstag", hours: "7:00 – 17:00" },
        { day: "Freitag", hours: "7:00 – 17:00" },
      ],
    },
  ],
  seo: {
    title: "Schreinerei Brandt Dortmund — Möbelbau, Innenausbau, Restaurierung",
    description:
      "Massarbeit aus Holz seit 2004: Schreinerei Brandt in Dortmund fertigt Möbel, Einbauten und restauriert Altbestand — persönlich beraten, sauber gearbeitet.",
  },
  footerNote: "Schreinerei Brandt · Dortmund · seit 2004",
  google: { rating: 4.9, reviewCount: 87 },
};

const WERKBANK_MINIMAL: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Schreinerei Brandt",
  slug: "schreinerei-brandt-dortmund",
  businessCategory: "Schreinerei",
  tagline: "Massarbeit aus Holz. Punkt.",
  logo: { kind: "font", font: "Brandt" },
  sections: [
    {
      type: "hero",
      headline: "Massarbeit aus Holz. Punkt.",
      subheadline:
        "Schreinerei Brandt fertigt Möbel und Einbauten in Dortmund — auf Maß, von Hand.",
      ctaText: "Projekt anfragen",
      ctaHref: "#kontakt",
      imageUrl: "/demo/werkbank-hero.jpg",
    },
    {
      type: "services",
      headline: "Leistungen",
      items: [
        { title: "Möbelbau", description: "Einzelstücke nach Maß." },
        {
          title: "Innenausbau",
          description: "Einbauschränke und Verkleidungen passgenau eingepasst.",
        },
      ],
    },
    {
      type: "contact",
      headline: "Kontakt",
      phone: "0231 555 4471",
      email: "info@schreinerei-brandt-dortmund.de",
      street: "Huckarder Straße 21",
      zip: "44147",
      city: "Dortmund",
      openingHours: [{ day: "Mo–Fr", hours: "7:00 – 17:00" }],
    },
  ],
  seo: {
    title: "Schreinerei Brandt Dortmund — Möbelbau & Innenausbau",
    description:
      "Massarbeit aus Holz seit 2004: Schreinerei Brandt in Dortmund fertigt Möbel und Einbauten auf Maß.",
  },
  footerNote: "Schreinerei Brandt · Dortmund · seit 2004",
  google: { rating: 4.9, reviewCount: 87 },
};

const FIXTURES: Partial<Record<PackId, FixtureSet>> = {
  werkbank: { full: WERKBANK_FULL, minimal: WERKBANK_MINIMAL },
};

export function getFixture(packId: PackId, kind: FixtureKind): WebsiteDataV2 {
  const set = FIXTURES[packId];
  if (!set) {
    throw new Error(`Fixture fehlt für Pack: ${packId}`);
  }
  return set[kind];
}
