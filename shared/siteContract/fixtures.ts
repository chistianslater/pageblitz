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
      imageUrl: "/demo/werkbank-hero.svg",
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
          url: "/demo/werkbank-hero.svg",
          alt: "Massivholztisch in einer Dortmunder Altbauwohnung",
        },
        {
          url: "/demo/werkbank-detail-1.svg",
          alt: "Maßgefertigter Einbauschrank aus Eiche",
        },
        {
          url: "/demo/werkbank-detail-2.svg",
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
      imageUrl: "/demo/werkbank-hero.svg",
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

const KANZLEI_FULL: WebsiteDataV2 = {
  version: 2,
  stylePackId: "kanzlei",
  businessName: "Roth & Weber Steuerberater",
  slug: "roth-weber-steuerberater-koeln",
  businessCategory: "Steuerberater",
  tagline: "Klarheit in Zahlen.",
  logo: { kind: "font", font: "Roth & Weber" },
  sections: [
    {
      type: "hero",
      headline: "Klarheit in Zahlen.",
      subheadline:
        "Roth & Weber berät Unternehmen und Selbstständige in Köln seit 1998 — präzise, verbindlich, ohne Umwege.",
      ctaText: "Erstgespräch anfragen",
      ctaHref: "#kontakt",
    },
    {
      type: "services",
      headline: "Leistungen",
      items: [
        {
          title: "Jahresabschluss",
          description:
            "Bilanzierung und Gewinnermittlung fristgerecht und prüfsicher erstellt.",
        },
        {
          title: "Lohnbuchhaltung",
          description:
            "Monatliche Lohn- und Gehaltsabrechnung inklusive Meldewesen.",
        },
        {
          title: "Steuergestaltung",
          description:
            "Vorausschauende Planung zur Reduktion der Steuerlast im Rahmen des Zulässigen.",
        },
        {
          title: "Gründungsberatung",
          description:
            "Rechtsform, Finanzamt und Buchhaltung von der ersten Stunde an geregelt.",
        },
      ],
    },
    {
      type: "about",
      headline: "Über uns",
      body: "Roth & Weber berät seit 1998 mit Sitz in Köln Unternehmen, Freiberufler und Selbstständige in allen Fragen der Steuer- und Rechnungslegung. Vier Partner und ein zwölfköpfiges Team betreuen aktuell mehr als 250 laufende Mandate — von der Einzelfirma bis zum mittelständischen Betrieb. Der Anspruch bleibt über alle Mandate gleich: klare Fristen, nachvollziehbare Zahlen und ein fester Ansprechpartner statt wechselnder Sachbearbeiter. Digitale Belegerfassung und persönliche Beratung schließen sich dabei nicht aus, sondern ergänzen sich.",
    },
    {
      type: "testimonials",
      headline: "Was Mandanten sagen",
      items: [
        {
          author: "Sabine Höttges, Höttges GmbH",
          text: "Termine werden eingehalten, Rückfragen sind innerhalb eines Tages beantwortet. Genau das erwartet man von einer Steuerkanzlei.",
          rating: 5,
        },
        {
          author: "Markus Lindt, Einzelunternehmer",
          text: "Die Gründungsberatung hat mir Monate an Nacharbeit erspart. Alles war von Anfang an sauber aufgesetzt.",
          rating: 5,
        },
      ],
    },
    {
      type: "faq",
      headline: "Häufige Fragen",
      items: [
        {
          question: "Was kostet eine laufende Buchhaltung?",
          answer:
            "Die Vergütung richtet sich nach der Steuerberatervergütungsverordnung und dem Belegvolumen. Ein konkretes Angebot folgt nach dem Erstgespräch.",
        },
        {
          question: "Welche Unterlagen benötigen Sie zum Start?",
          answer:
            "Gründungsdokumente, den letzten Jahresabschluss (falls vorhanden) sowie Zugang zu laufenden Belegen — digital oder in Papierform.",
        },
        {
          question: "Wie werden Fristen eingehalten?",
          answer:
            "Jedes Mandat erhält einen festen Ansprechpartner und einen Fristenkalender, der Abgabetermine automatisch vorbereitet.",
        },
      ],
    },
    {
      type: "contact",
      headline: "Kontakt",
      phone: "0221 55 89 21",
      email: "kanzlei@roth-weber-koeln.de",
      street: "Hohenzollernring 42",
      zip: "50672",
      city: "Köln",
      openingHours: [
        { day: "Montag", hours: "8:00 – 17:00" },
        { day: "Dienstag", hours: "8:00 – 17:00" },
        { day: "Mittwoch", hours: "8:00 – 17:00" },
        { day: "Donnerstag", hours: "8:00 – 17:00" },
        { day: "Freitag", hours: "8:00 – 14:00" },
      ],
    },
  ],
  seo: {
    title: "Roth & Weber Steuerberater Köln — Jahresabschluss, Lohnbuchhaltung",
    description:
      "Steuerberatung in Köln seit 1998: Roth & Weber übernimmt Jahresabschluss, Lohnbuchhaltung, Steuergestaltung und Gründungsberatung.",
  },
  footerNote: "Roth & Weber Steuerberater · Köln · seit 1998",
  google: { rating: 4.8, reviewCount: 41 },
};

const KANZLEI_MINIMAL: WebsiteDataV2 = {
  version: 2,
  stylePackId: "kanzlei",
  businessName: "Roth & Weber Steuerberater",
  slug: "roth-weber-steuerberater-koeln",
  businessCategory: "Steuerberater",
  tagline: "Klarheit in Zahlen.",
  logo: { kind: "font", font: "Roth & Weber" },
  sections: [
    {
      type: "hero",
      headline: "Klarheit in Zahlen.",
      subheadline:
        "Roth & Weber berät Unternehmen und Selbstständige in Köln seit 1998.",
      ctaText: "Erstgespräch anfragen",
      ctaHref: "#kontakt",
    },
    {
      type: "services",
      headline: "Leistungen",
      items: [
        {
          title: "Jahresabschluss",
          description: "Bilanzierung fristgerecht erstellt.",
        },
        {
          title: "Lohnbuchhaltung",
          description: "Monatliche Abrechnung inklusive Meldewesen.",
        },
      ],
    },
    {
      type: "contact",
      headline: "Kontakt",
      phone: "0221 55 89 21",
      email: "kanzlei@roth-weber-koeln.de",
      street: "Hohenzollernring 42",
      zip: "50672",
      city: "Köln",
      openingHours: [{ day: "Mo–Do", hours: "8:00 – 17:00" }],
    },
  ],
  seo: {
    title: "Roth & Weber Steuerberater Köln",
    description:
      "Steuerberatung in Köln seit 1998: Roth & Weber übernimmt Jahresabschluss und Lohnbuchhaltung.",
  },
  footerNote: "Roth & Weber Steuerberater · Köln · seit 1998",
  google: { rating: 4.8, reviewCount: 41 },
};

const MORGENLICHT_FULL: WebsiteDataV2 = {
  version: 2,
  stylePackId: "morgenlicht",
  businessName: "Zahnarztpraxis Dr. Sommer",
  slug: "zahnarztpraxis-dr-sommer-hamburg-eppendorf",
  businessCategory: "Zahnarztpraxis",
  tagline: "Ein Lächeln beginnt mit Vertrauen.",
  logo: { kind: "font", font: "Dr. Sommer" },
  sections: [
    {
      type: "hero",
      headline: "Ein Lächeln beginnt mit Vertrauen.",
      subheadline:
        "Moderne Zahnmedizin in Hamburg-Eppendorf — gründlich erklärt, sanft behandelt.",
      ctaText: "Online Termin buchen",
      ctaHref: "#kontakt",
      imageUrl: "/demo/morgenlicht-hero.svg",
    },
    {
      type: "services",
      headline: "Leistungen",
      intro: "Vier Schwerpunkte, immer mit Zeit für Ihre Fragen.",
      items: [
        {
          title: "Prophylaxe",
          description:
            "Professionelle Zahnreinigung und Vorsorge — gründlich und schonend.",
          price: "ab 89 €",
        },
        {
          title: "Implantate",
          description:
            "Festsitzender Zahnersatz, individuell geplant und in Ruhe besprochen.",
          price: "auf Anfrage",
        },
        {
          title: "Kinderzahnheilkunde",
          description:
            "Erste Praxisbesuche spielerisch gestaltet — ohne Angst, mit viel Geduld.",
        },
        {
          title: "Angstpatienten-Sprechstunde",
          description:
            "Extra Zeit, ruhige Aufklärung und Behandlung im eigenen Tempo.",
        },
      ],
    },
    {
      type: "about",
      headline: "Über uns",
      body: "Die Praxis Dr. Sommer liegt seit 2011 mitten in Hamburg-Eppendorf und begleitet Familien über Generationen. Sechs Behandler und ein zehnköpfiges Team kümmern sich um Prophylaxe, Implantologie und Kinderzahnheilkunde — mit dem Anspruch, jede Behandlung verständlich zu erklären, bevor sie beginnt. Wer Angst vor dem Zahnarztbesuch hat, bekommt bei uns extra Zeit und eine eigene Sprechstunde. Digitale Röntgentechnik, moderne Materialien und ein helles, ruhiges Raumkonzept sorgen dafür, dass sich der Besuch nicht nach Praxis, sondern nach gutem Empfang anfühlt.",
    },
    {
      type: "testimonials",
      headline: "Was Patienten sagen",
      items: [
        {
          author: "Nadine Krüger",
          text: "Endlich eine Praxis, die mir als Angstpatientin wirklich zuhört. Jeder Schritt wurde vorher erklärt.",
          rating: 5,
        },
        {
          author: "Tobias Ahrens",
          text: "Mein Sohn geht mittlerweile gern zum Zahnarzt — das hätte ich vor der Implantation nicht gedacht.",
          rating: 5,
        },
        {
          author: "Familie Bergmann",
          text: "Kurze Wartezeiten, freundliches Team, transparente Kosten. Können wir nur empfehlen.",
          rating: 5,
        },
      ],
    },
    {
      type: "faq",
      headline: "Häufige Fragen",
      items: [
        {
          question: "Was kostet eine professionelle Zahnreinigung?",
          answer:
            "Die Prophylaxe startet bei 89 € und richtet sich nach Aufwand und Befund. Ein genaues Angebot erhalten Sie beim Termin.",
        },
        {
          question: "Ich habe Angst vor dem Zahnarzt — was hilft?",
          answer:
            "Unsere Angstpatienten-Sprechstunde nimmt sich bewusst mehr Zeit, erklärt jeden Schritt vorab und passt das Tempo an Sie an.",
        },
        {
          question: "Wie schnell bekomme ich einen Termin?",
          answer:
            "Für neue Patientinnen und Patienten finden sich meist innerhalb einer Woche freie Termine — online oder telefonisch buchbar.",
        },
      ],
    },
    {
      type: "contact",
      headline: "Kontakt",
      phone: "040 55 91 20",
      email: "praxis@dr-sommer-hamburg.de",
      street: "Eppendorfer Landstraße 54",
      zip: "20249",
      city: "Hamburg-Eppendorf",
      openingHours: [{ day: "Mo–Fr", hours: "8:00 – 18:00" }],
    },
  ],
  seo: {
    title:
      "Zahnarztpraxis Dr. Sommer Hamburg-Eppendorf — Prophylaxe, Implantate, Kinderzahnheilkunde",
    description:
      "Moderne Zahnmedizin in Hamburg-Eppendorf: Dr. Sommer betreut mit Prophylaxe, Implantologie, Kinderzahnheilkunde und einer eigenen Angstpatienten-Sprechstunde.",
  },
  footerNote: "Zahnarztpraxis Dr. Sommer · Hamburg-Eppendorf · seit 2011",
  google: { rating: 4.9, reviewCount: 128 },
};

const MORGENLICHT_MINIMAL: WebsiteDataV2 = {
  version: 2,
  stylePackId: "morgenlicht",
  businessName: "Zahnarztpraxis Dr. Sommer",
  slug: "zahnarztpraxis-dr-sommer-hamburg-eppendorf",
  businessCategory: "Zahnarztpraxis",
  tagline: "Ein Lächeln beginnt mit Vertrauen.",
  logo: { kind: "font", font: "Dr. Sommer" },
  sections: [
    {
      type: "hero",
      headline: "Ein Lächeln beginnt mit Vertrauen.",
      subheadline:
        "Moderne Zahnmedizin in Hamburg-Eppendorf — gründlich erklärt, sanft behandelt.",
      ctaText: "Online Termin buchen",
      ctaHref: "#kontakt",
      imageUrl: "/demo/morgenlicht-hero.svg",
    },
    {
      type: "services",
      headline: "Leistungen",
      items: [
        {
          title: "Prophylaxe",
          description: "Professionelle Zahnreinigung und Vorsorge.",
        },
        {
          title: "Implantate",
          description: "Festsitzender Zahnersatz, individuell geplant.",
        },
      ],
    },
    {
      type: "contact",
      headline: "Kontakt",
      phone: "040 55 91 20",
      email: "praxis@dr-sommer-hamburg.de",
      street: "Eppendorfer Landstraße 54",
      zip: "20249",
      city: "Hamburg-Eppendorf",
      openingHours: [{ day: "Mo–Fr", hours: "8:00 – 18:00" }],
    },
  ],
  seo: {
    title: "Zahnarztpraxis Dr. Sommer Hamburg-Eppendorf",
    description:
      "Moderne Zahnmedizin in Hamburg-Eppendorf: Dr. Sommer betreut mit Prophylaxe und Implantologie.",
  },
  footerNote: "Zahnarztpraxis Dr. Sommer · Hamburg-Eppendorf · seit 2011",
  google: { rating: 4.9, reviewCount: 128 },
};

const FIXTURES: Partial<Record<PackId, FixtureSet>> = {
  werkbank: { full: WERKBANK_FULL, minimal: WERKBANK_MINIMAL },
  kanzlei: { full: KANZLEI_FULL, minimal: KANZLEI_MINIMAL },
  morgenlicht: { full: MORGENLICHT_FULL, minimal: MORGENLICHT_MINIMAL },
};

export function getFixture(packId: PackId, kind: FixtureKind): WebsiteDataV2 {
  const set = FIXTURES[packId];
  if (!set) {
    throw new Error(`Fixture fehlt für Pack: ${packId}`);
  }
  return set[kind];
}
