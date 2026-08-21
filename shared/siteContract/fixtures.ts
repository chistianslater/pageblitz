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

const GUSTO_FULL: WebsiteDataV2 = {
  version: 2,
  stylePackId: "gusto",
  businessName: "Trattoria Lucia",
  slug: "trattoria-lucia-berlin-charlottenburg",
  businessCategory: "Trattoria",
  tagline: "Ein Tisch. Ein Abend. Italien.",
  logo: { kind: "font", font: "Trattoria Lucia" },
  sections: [
    {
      type: "hero",
      headline: "Ein Tisch. Ein Abend. Italien.",
      subheadline:
        "Trattoria Lucia bringt Berlin-Charlottenburg seit 2013 Rezepte aus der Emilia-Romagna — hausgemachte Pasta, langsam geschmort, mit Herz serviert.",
      ctaText: "Tisch reservieren",
      ctaHref: "#kontakt",
      imageUrl: "/demo/gusto-hero.svg",
    },
    {
      type: "menu",
      headline: "Speisekarte",
      categories: [
        {
          name: "Antipasti & Primi",
          items: [
            {
              name: "Burrata al Pomodoro",
              description:
                "Cremige Burrata, confierte Kirschtomaten, Basilikum.",
              price: "14",
            },
            {
              name: "Tagliatelle al Ragù",
              description:
                "Hausgemachte Bandnudeln, 8-Stunden-Ragù aus der Emilia-Romagna.",
              price: "16,5",
            },
            {
              name: "Risotto ai Funghi",
              description: "Steinpilz-Risotto, Parmesan, Trüffelöl.",
              price: "18",
            },
          ],
        },
        {
          name: "Secondi & Dolci",
          items: [
            {
              name: "Osso Buco",
              description: "Geschmorte Kalbshaxe, Gremolata, Safranrisotto.",
              price: "28",
            },
            {
              name: "Branzino al Forno",
              description: "Ofen-Wolfsbarsch, Zitrone, Kräuter der Saison.",
              price: "26,5",
            },
            {
              name: "Tiramisù della Nonna",
              description:
                "Nonnas Original-Rezept, jeden Morgen frisch geschichtet.",
              price: "9",
            },
          ],
        },
      ],
    },
    {
      type: "about",
      headline: "Unsere Geschichte",
      body: "Trattoria Lucia trägt den Namen unserer Großmutter, die in Modena eine kleine Küche führte und niemanden ungegessen gehen ließ. 2013 haben wir ihre Rezepte mit nach Charlottenburg gebracht: Pasta von Hand gerollt, Ragù, das acht Stunden zieht, und ein Weinregal, das nur Betriebe aus der Emilia-Romagna führt. Geöffnet wird jeden Abend derselbe Anspruch — als säße Nonna Lucia selbst am Herd.",
      imageUrl: "/demo/gusto-hero.svg",
    },
    {
      type: "testimonials",
      headline: "Was Gäste sagen",
      items: [
        {
          author: "Sophie Adler",
          text: "Die Tagliatelle al Ragù schmecken, als wäre man selbst in Modena am Tisch gesessen. Absolute Empfehlung.",
          rating: 5,
        },
        {
          author: "Matteo Furlan",
          text: "Endlich eine Trattoria in Berlin, die keine Kompromisse macht — Pasta, Wein, Service, alles stimmt.",
          rating: 5,
        },
      ],
    },
    {
      type: "gallery",
      headline: "Impressionen",
      images: [
        {
          url: "/demo/gusto-hero.svg",
          alt: "Gedeckter Tisch im warmen Abendlicht der Trattoria",
        },
        {
          url: "/demo/gusto-detail-1.svg",
          alt: "Hausgemachte Tagliatelle mit Ragù",
        },
        {
          url: "/demo/gusto-detail-2.svg",
          alt: "Weinregal mit Flaschen aus der Emilia-Romagna",
        },
      ],
    },
    {
      type: "contact",
      headline: "Kontakt",
      phone: "030 55 17 92",
      email: "tavolo@trattoria-lucia-berlin.de",
      street: "Kantstraße 87",
      zip: "10627",
      city: "Berlin-Charlottenburg",
      openingHours: [{ day: "Di–So", hours: "17:00 – 23:00" }],
    },
  ],
  seo: {
    title:
      "Trattoria Lucia Berlin-Charlottenburg — Italienische Küche, hausgemachte Pasta",
    description:
      "Trattoria Lucia in Berlin-Charlottenburg serviert seit 2013 Rezepte aus der Emilia-Romagna: hausgemachte Pasta, langsam geschmorte Gerichte, ausgewählte Weine.",
  },
  footerNote: "Trattoria Lucia · Berlin-Charlottenburg · seit 2013",
  google: { rating: 4.7, reviewCount: 213 },
};

const GUSTO_MINIMAL: WebsiteDataV2 = {
  version: 2,
  stylePackId: "gusto",
  businessName: "Trattoria Lucia",
  slug: "trattoria-lucia-berlin-charlottenburg",
  businessCategory: "Trattoria",
  tagline: "Ein Tisch. Ein Abend. Italien.",
  logo: { kind: "font", font: "Trattoria Lucia" },
  sections: [
    {
      type: "hero",
      headline: "Ein Tisch. Ein Abend. Italien.",
      subheadline:
        "Trattoria Lucia bringt Berlin-Charlottenburg Rezepte aus der Emilia-Romagna.",
      ctaText: "Tisch reservieren",
      ctaHref: "#kontakt",
      imageUrl: "/demo/gusto-hero.svg",
    },
    {
      type: "menu",
      headline: "Speisekarte",
      categories: [
        {
          name: "Antipasti & Primi",
          items: [
            { name: "Burrata al Pomodoro", price: "14" },
            { name: "Tagliatelle al Ragù", price: "16,5" },
          ],
        },
        {
          name: "Secondi & Dolci",
          items: [
            { name: "Osso Buco", price: "28" },
            { name: "Tiramisù della Nonna", price: "9" },
          ],
        },
      ],
    },
    {
      type: "contact",
      headline: "Kontakt",
      phone: "030 55 17 92",
      email: "tavolo@trattoria-lucia-berlin.de",
      street: "Kantstraße 87",
      zip: "10627",
      city: "Berlin-Charlottenburg",
      openingHours: [{ day: "Di–So", hours: "17:00 – 23:00" }],
    },
  ],
  seo: {
    title: "Trattoria Lucia Berlin-Charlottenburg",
    description:
      "Trattoria Lucia in Berlin-Charlottenburg serviert Rezepte aus der Emilia-Romagna.",
  },
  footerNote: "Trattoria Lucia · Berlin-Charlottenburg · seit 2013",
  google: { rating: 4.7, reviewCount: 213 },
};

const PATINA_FULL: WebsiteDataV2 = {
  version: 2,
  stylePackId: "patina",
  businessName: "Naturheilpraxis Annelie Voss",
  slug: "naturheilpraxis-voss-freiburg",
  businessCategory: "Naturheilkunde",
  tagline: "Heilung beginnt mit Zuhören.",
  logo: { kind: "font", font: "Annelie Voss" },
  sections: [
    {
      type: "hero",
      headline: "Heilung beginnt mit Zuhören.",
      subheadline:
        "Ganzheitliche Begleitung für Körper und Kopf — in einer Praxis, in der Sie kein Fall sind, sondern ein Mensch.",
      ctaText: "Erstgespräch vereinbaren",
      ctaHref: "#kontakt",
      imageUrl: "/demo/patina-hero.svg",
    },
    {
      type: "services",
      headline: "Behandlungen",
      items: [
        {
          title: "Akupunktur",
          description:
            "Feine Nadeln entlang der Meridiane — zur Unterstützung von Ausgleich und innerer Ruhe.",
        },
        {
          title: "Phytotherapie",
          description:
            "Individuell abgestimmte Pflanzenheilkunde, die den Alltag begleitet statt ihn zu ersetzen.",
        },
        {
          title: "Ernährungsberatung",
          description:
            "Gemeinsam entwickelte Ernährungsgewohnheiten, angepasst an Ihren Rhythmus und Ihre Vorlieben.",
        },
        {
          title: "Ordnungstherapie",
          description:
            "Struktur für Schlaf, Bewegung und Ruhephasen nach den fünf Säulen der Ordnungstherapie.",
        },
      ],
    },
    {
      type: "about",
      headline: "Über mich",
      body: "Annelie Voss führt ihre Naturheilpraxis seit 2014 am Lorettoberg in Freiburg. Ausgebildet in Traditioneller Chinesischer Medizin und Ernährungsberatung, begleitet sie Menschen, die ihrem Körper wieder zuhören möchten — bei Erschöpfung, Verdauungsthemen oder auf der Suche nach mehr Ruhe im Alltag. Jede Behandlung beginnt mit einem ausführlichen Gespräch, nicht mit einem Rezept. Die Praxis liegt in einem Altbau mit Blick auf den Schwarzwald, bewusst klein gehalten, damit Zeit bleibt — für Sie, für Fragen, für das, was zwischen den Zeilen mitschwingt.",
      imageUrl: "/demo/patina-detail-1.svg",
    },
    {
      type: "testimonials",
      headline: "Was Klienten sagen",
      items: [
        {
          author: "Anne Kessler",
          text: "Zum ersten Mal hatte ich das Gefühl, dass sich jemand wirklich Zeit für mein ganzes Bild nimmt, nicht nur für ein Symptom.",
          rating: 5,
        },
        {
          author: "Thomas Reber",
          text: "Die Gespräche allein waren schon die Praxisgebühr wert. Ruhig, klar, ohne Druck.",
          rating: 5,
        },
        {
          author: "Miriam Lang",
          text: "Ich komme seit zwei Jahren regelmäßig und merke, wie viel bewusster ich inzwischen mit mir umgehe.",
          rating: 5,
        },
      ],
    },
    {
      type: "faq",
      headline: "Häufige Fragen",
      items: [
        {
          question: "Übernimmt die Krankenkasse die Kosten?",
          answer:
            "Viele gesetzliche und private Kassen erstatten heilpraktische Leistungen anteilig — die Details klären wir im Erstgespräch.",
        },
        {
          question: "Wie läuft das Erstgespräch ab?",
          answer:
            "Rund 60 Minuten Zeit für Ihre Geschichte, aktuelle Beschwerden und die Frage, was Sie sich von der Begleitung wünschen.",
        },
        {
          question: "Muss ich vorher etwas mitbringen?",
          answer:
            "Frühere Befunde oder Laborwerte sind hilfreich, aber kein Muss — wir beginnen dort, wo Sie gerade stehen.",
        },
      ],
    },
    {
      type: "contact",
      headline: "Kontakt",
      phone: "0761 555 8420",
      email: "praxis@voss-naturheilkunde.de",
      street: "Lorettostraße 14",
      zip: "79100",
      city: "Freiburg",
      openingHours: [{ day: "Mo–Fr", hours: "9:00 – 18:00" }],
    },
  ],
  seo: {
    title: "Naturheilpraxis Annelie Voss Freiburg — Akupunktur, Phytotherapie",
    description:
      "Naturheilpraxis in Freiburg seit 2014: Annelie Voss begleitet mit Akupunktur, Phytotherapie, Ernährungsberatung und Ordnungstherapie.",
  },
  footerNote: "Naturheilpraxis Annelie Voss · Freiburg · seit 2014",
  google: { rating: 4.9, reviewCount: 54 },
};

const PATINA_MINIMAL: WebsiteDataV2 = {
  version: 2,
  stylePackId: "patina",
  businessName: "Naturheilpraxis Annelie Voss",
  slug: "naturheilpraxis-voss-freiburg",
  businessCategory: "Naturheilkunde",
  tagline: "Heilung beginnt mit Zuhören.",
  logo: { kind: "font", font: "Annelie Voss" },
  sections: [
    {
      type: "hero",
      headline: "Heilung beginnt mit Zuhören.",
      subheadline: "Ganzheitliche Begleitung für Körper und Kopf in Freiburg.",
      ctaText: "Erstgespräch vereinbaren",
      ctaHref: "#kontakt",
      imageUrl: "/demo/patina-hero.svg",
    },
    {
      type: "services",
      headline: "Behandlungen",
      items: [
        {
          title: "Akupunktur",
          description: "Zur Unterstützung von Ausgleich und innerer Ruhe.",
        },
        {
          title: "Phytotherapie",
          description: "Individuell abgestimmte Pflanzenheilkunde.",
        },
      ],
    },
    {
      type: "contact",
      headline: "Kontakt",
      phone: "0761 555 8420",
      email: "praxis@voss-naturheilkunde.de",
      street: "Lorettostraße 14",
      zip: "79100",
      city: "Freiburg",
      openingHours: [{ day: "Mo–Fr", hours: "9:00 – 18:00" }],
    },
  ],
  seo: {
    title: "Naturheilpraxis Annelie Voss Freiburg",
    description:
      "Naturheilpraxis in Freiburg: Annelie Voss begleitet mit Akupunktur und Phytotherapie.",
  },
  footerNote: "Naturheilpraxis Annelie Voss · Freiburg · seit 2014",
  google: { rating: 4.9, reviewCount: 54 },
};

const SALON_NOIR_FULL: WebsiteDataV2 = {
  version: 2,
  stylePackId: "salon-noir",
  businessName: "NOIR Haarstudio",
  slug: "noir-haarstudio-muenchen-maxvorstadt",
  businessCategory: "Friseursalon",
  tagline: "Handwerk für Haar.",
  logo: { kind: "font", font: "NOIR Haarstudio" },
  sections: [
    {
      type: "hero",
      headline: "Handwerk für Haar.",
      subheadline:
        "NOIR Haarstudio verbindet Schnitt, Farbe und Pflege auf Ateliers-Niveau — mitten in der Münchner Maxvorstadt.",
      ctaText: "Termin buchen",
      ctaHref: "#kontakt",
      imageUrl: "/demo/salon-noir-hero.svg",
    },
    {
      type: "services",
      headline: "Leistungen",
      intro: "Vier Kernleistungen, ein Anspruch: präzise Handarbeit.",
      items: [
        {
          title: "Schnitt",
          description:
            "Präzisionsschnitt nach Beratung — auf Kopfform und Alltag abgestimmt.",
          price: "ab 45",
        },
        {
          title: "Farbe & Balayage",
          description:
            "Freihand-Balayage und Vollfärbung mit lichtreflektierenden Nuancen.",
          price: "ab 45",
        },
        {
          title: "Pflege",
          description:
            "Tiefenwirksame Kuren für Struktur, Glanz und gesundes Haar.",
          price: "ab 45",
        },
        {
          title: "Styling",
          description: "Föhnfrisuren und Hochsteckfrisuren für jeden Anlass.",
          price: "ab 45",
        },
      ],
    },
    {
      type: "about",
      headline: "Über uns",
      body: "NOIR Haarstudio wurde 2016 in der Maxvorstadt gegründet — mit dem Anspruch, Friseurhandwerk wie ein Handwerk zu behandeln, nicht wie eine schnelle Dienstleistung. Jeder Schnitt beginnt mit einer ausführlichen Beratung, jede Farbe wird individuell gemischt. Unser kleines Team aus erfahrenen Stylisten arbeitet in ruhigem Tempo, mit Champagner statt Filterkaffee und einem Blick fürs Detail, der auch nach dem Termin noch hält.",
      imageUrl: "/demo/salon-noir-hero.svg",
    },
    {
      type: "testimonials",
      headline: "Was Kundinnen und Kunden sagen",
      items: [
        {
          author: "Katharina Reuter",
          text: "Endlich ein Salon, der sich Zeit nimmt. Die Balayage hält seit Monaten ihre Form.",
          rating: 5,
        },
        {
          author: "Jonas Wieland",
          text: "Bester Herrenschnitt in München. Ruhige Atmosphäre, präzise Arbeit.",
          rating: 5,
        },
        {
          author: "Elif Demir",
          text: "Beratung, Farbe, Ergebnis — alles auf den Punkt. Ich fahre extra aus Schwabing hierher.",
          rating: 5,
        },
      ],
    },
    {
      type: "pricelist",
      headline: "Preisliste",
      categories: [
        {
          name: "Damen",
          items: [
            {
              name: "Waschen, Schneiden, Föhnen",
              price: "68",
            },
            {
              name: "Balayage komplett",
              price: "165",
            },
            {
              name: "Olaplex-Kur",
              price: "32",
            },
          ],
        },
        {
          name: "Herren",
          items: [
            {
              name: "Herrenschnitt klassisch",
              price: "42",
            },
            {
              name: "Bartkontur",
              price: "18",
            },
            {
              name: "Schnitt & Bart komplett",
              price: "55",
            },
          ],
        },
      ],
    },
    {
      type: "contact",
      headline: "Kontakt",
      phone: "089 55 17 92",
      email: "termin@noir-haarstudio.de",
      street: "Türkenstraße 42",
      zip: "80799",
      city: "München-Maxvorstadt",
      openingHours: [{ day: "Di–Sa", hours: "9:00 – 19:00" }],
    },
  ],
  seo: {
    title: "NOIR Haarstudio München-Maxvorstadt — Friseur für Schnitt & Farbe",
    description:
      "NOIR Haarstudio in München-Maxvorstadt: Schnitt, Balayage und Pflege auf Ateliers-Niveau seit 2016.",
  },
  footerNote: "NOIR Haarstudio · München-Maxvorstadt · seit 2016",
  google: { rating: 4.8, reviewCount: 167 },
};

const SALON_NOIR_MINIMAL: WebsiteDataV2 = {
  version: 2,
  stylePackId: "salon-noir",
  businessName: "NOIR Haarstudio",
  slug: "noir-haarstudio-muenchen-maxvorstadt",
  businessCategory: "Friseursalon",
  tagline: "Handwerk für Haar.",
  logo: { kind: "font", font: "NOIR Haarstudio" },
  sections: [
    {
      type: "hero",
      headline: "Handwerk für Haar.",
      subheadline: "Schnitt, Farbe und Pflege auf Ateliers-Niveau in München.",
      ctaText: "Termin buchen",
      ctaHref: "#kontakt",
      imageUrl: "/demo/salon-noir-hero.svg",
    },
    {
      type: "services",
      headline: "Leistungen",
      items: [
        {
          title: "Schnitt",
          description: "Präzisionsschnitt nach Beratung.",
          price: "ab 45",
        },
        {
          title: "Farbe & Balayage",
          description: "Freihand-Balayage mit lichtreflektierenden Nuancen.",
          price: "ab 45",
        },
      ],
    },
    {
      type: "contact",
      headline: "Kontakt",
      phone: "089 55 17 92",
      email: "termin@noir-haarstudio.de",
      street: "Türkenstraße 42",
      zip: "80799",
      city: "München-Maxvorstadt",
      openingHours: [{ day: "Di–Sa", hours: "9:00 – 19:00" }],
    },
  ],
  seo: {
    title: "NOIR Haarstudio München-Maxvorstadt",
    description:
      "NOIR Haarstudio in München-Maxvorstadt: Schnitt, Balayage und Pflege auf Ateliers-Niveau.",
  },
  footerNote: "NOIR Haarstudio · München-Maxvorstadt · seit 2016",
  google: { rating: 4.8, reviewCount: 167 },
};

const MARKTPLATZ_FULL: WebsiteDataV2 = {
  version: 2,
  stylePackId: "marktplatz",
  businessName: "Musikschule Tonleiter",
  slug: "musikschule-tonleiter-nuernberg",
  businessCategory: "Musikschule",
  tagline: "1. Stunde gratis!",
  logo: { kind: "font", font: "Tonleiter" },
  sections: [
    {
      type: "hero",
      headline: "Lernen, das Spaß macht!",
      subheadline:
        "Klavier, Gitarre, Gesang und Schlagzeug für Kinder und Erwachsene — mitten in Nürnberg.",
      ctaText: "Schnupperstunde buchen",
      ctaHref: "#kontakt",
      imageUrl: "/demo/marktplatz-hero.svg",
    },
    {
      type: "services",
      headline: "Unsere Kurse",
      intro:
        "Vier Wege, Musik zu lieben — für jedes Alter der passende Einstieg.",
      items: [
        {
          title: "Klavier",
          description:
            "Von den ersten Tönen bis zur Lieblingsmelodie — einzeln oder zu zweit.",
          price: "ab 32 €/Monat",
        },
        {
          title: "Gitarre",
          description:
            "Akustisch oder E-Gitarre, vom ersten Griff bis zum ersten Song.",
          price: "ab 32 €/Monat",
        },
        {
          title: "Gesang",
          description:
            "Stimmbildung für Kinder, Jugendliche und Erwachsene in kleinen Gruppen.",
          price: "ab 29 €/Monat",
        },
        {
          title: "Schlagzeug",
          description:
            "Rhythmusgefühl, Koordination und jede Menge Krach mit System.",
          price: "ab 34 €/Monat",
        },
      ],
    },
    {
      type: "about",
      headline: "Über uns",
      body: "Die Musikschule Tonleiter gibt es seit 2011 im Herzen von Nürnberg. Zwölf Lehrkräfte unterrichten hier vom ersten Ton bis zur Bühnenreife — in kleinen Gruppen oder ganz allein, immer im Tempo, das passt. Kein Notenlese-Zwang, keine Vorspiel-Angst: bei uns darf Musik zuerst Spaß machen, dann perfekt werden.",
      imageUrl: "/demo/marktplatz-detail-1.svg",
    },
    {
      type: "testimonials",
      headline: "Eltern erzählen",
      items: [
        {
          author: "Familie Brandt",
          text: "Unser Sohn wollte nach der ersten Schnupperstunde sofort ein eigenes Klavier. Die Geduld der Lehrerin ist unglaublich.",
          rating: 5,
        },
        {
          author: "Nadine K.",
          text: "Endlich ein Kurs, bei dem meine Tochter jede Woche freiwillig hingeht. Die Stimmung ist einfach warm und locker.",
          rating: 5,
        },
        {
          author: "Familie Özdemir",
          text: "Zwei Kinder, zwei Instrumente, ein Ort — und alle drei kommen mit einem Lächeln zurück.",
          rating: 5,
        },
      ],
    },
    {
      type: "faq",
      headline: "Häufige Fragen",
      items: [
        {
          question: "Ab welchem Alter kann mein Kind teilnehmen?",
          answer:
            "Unsere jüngsten Musikschüler starten mit 4 Jahren in der musikalischen Früherziehung — für Klavier und Gitarre empfehlen wir ab 6 Jahren.",
        },
        {
          question: "Brauchen wir Vorkenntnisse oder ein eigenes Instrument?",
          answer:
            "Nein — wir starten bei null, und für die ersten Monate können Sie sich ein Instrument in der Schule leihen.",
        },
        {
          question: "Wie funktioniert die kostenlose Schnupperstunde?",
          answer:
            "Eine reguläre Unterrichtsstunde, unverbindlich und ohne weitere Verpflichtung — einfach über das Kontaktformular anfragen.",
        },
      ],
    },
    {
      type: "gallery",
      headline: "Einblicke",
      images: [
        {
          url: "/demo/marktplatz-hero.svg",
          alt: "Übungsraum mit Klavier",
        },
        {
          url: "/demo/marktplatz-detail-1.svg",
          alt: "Gitarrenunterricht in kleiner Gruppe",
        },
        {
          url: "/demo/marktplatz-detail-2.svg",
          alt: "Kinder beim gemeinsamen Musizieren",
        },
      ],
    },
    {
      type: "contact",
      headline: "Kontakt",
      phone: "0911 555 3170",
      email: "hallo@musikschule-tonleiter.de",
      street: "Färberstraße 9",
      zip: "90402",
      city: "Nürnberg",
      openingHours: [
        { day: "Mo–Fr", hours: "14:00 – 19:00" },
        { day: "Sa", hours: "9:00 – 13:00" },
      ],
    },
  ],
  seo: {
    title:
      "Musikschule Tonleiter Nürnberg — Klavier, Gitarre, Gesang, Schlagzeug",
    description:
      "Musikschule Tonleiter in Nürnberg: Klavier-, Gitarren-, Gesangs- und Schlagzeugunterricht für Kinder und Erwachsene — erste Stunde gratis.",
  },
  footerNote: "Musikschule Tonleiter · Nürnberg · seit 2011",
  google: { rating: 4.9, reviewCount: 89 },
};

const MARKTPLATZ_MINIMAL: WebsiteDataV2 = {
  version: 2,
  stylePackId: "marktplatz",
  businessName: "Musikschule Tonleiter",
  slug: "musikschule-tonleiter-nuernberg",
  businessCategory: "Musikschule",
  tagline: "1. Stunde gratis!",
  logo: { kind: "font", font: "Tonleiter" },
  sections: [
    {
      type: "hero",
      headline: "Lernen, das Spaß macht!",
      subheadline:
        "Klavier, Gitarre und Gesang in Nürnberg — die erste Stunde ist gratis.",
      ctaText: "Schnupperstunde buchen",
      ctaHref: "#kontakt",
      imageUrl: "/demo/marktplatz-hero.svg",
    },
    {
      type: "services",
      headline: "Unsere Kurse",
      items: [
        {
          title: "Klavier",
          description: "Von den ersten Tönen bis zur Lieblingsmelodie.",
          price: "ab 32 €/Monat",
        },
        {
          title: "Gitarre",
          description: "Vom ersten Griff bis zum ersten Song.",
          price: "ab 32 €/Monat",
        },
      ],
    },
    {
      type: "contact",
      headline: "Kontakt",
      phone: "0911 555 3170",
      email: "hallo@musikschule-tonleiter.de",
      street: "Färberstraße 9",
      zip: "90402",
      city: "Nürnberg",
      openingHours: [{ day: "Mo–Fr", hours: "14:00 – 19:00" }],
    },
  ],
  seo: {
    title: "Musikschule Tonleiter Nürnberg",
    description:
      "Musikschule Tonleiter in Nürnberg: Klavier- und Gitarrenunterricht für Kinder und Erwachsene.",
  },
  footerNote: "Musikschule Tonleiter · Nürnberg · seit 2011",
  google: { rating: 4.9, reviewCount: 89 },
};

const LANDGUT_FULL: WebsiteDataV2 = {
  version: 2,
  stylePackId: "landgut",
  businessName: "Gärtnerei Grünholz",
  slug: "gaertnerei-gruenholz-ravensburg",
  businessCategory: "Gärtnerei & Baumschule",
  tagline: "Seit drei Generationen für Ravensburg.",
  logo: { kind: "font", font: "Grünholz" },
  sections: [
    {
      type: "hero",
      headline: "Vom Beet auf den Balkon.",
      subheadline:
        "Regionale Stauden, Kräuter und Beratung, die mitdenkt — seit drei Generationen.",
      ctaText: "Saison entdecken",
      ctaHref: "#kontakt",
      imageUrl: "/demo/landgut-hero.svg",
    },
    {
      type: "services",
      headline: "Leistungen",
      intro:
        "Vier Bereiche, ein Ziel: dass es bei Ihnen wächst — drinnen wie draußen.",
      items: [
        {
          title: "Stauden & Kräuter",
          description:
            "Regional gezogene Stauden, Kräuter und Saisonpflanzen — beratend ausgesucht statt von der Stange.",
        },
        {
          title: "Gartenplanung",
          description:
            "Von der ersten Skizze bis zur Bepflanzung: Gärten, die zum Grundstück und zur Jahreszeit passen.",
        },
        {
          title: "Pflanzservice",
          description:
            "Wir setzen, was wir empfehlen — inklusive Anwuchsgarantie für die erste Saison.",
        },
        {
          title: "Baumschnitt",
          description:
            "Fachgerechter Schnitt für Obstbäume, Hecken und Ziergehölze, ganzjährig planbar.",
        },
      ],
    },
    {
      type: "about",
      headline: "Über uns",
      body: "Die Gärtnerei Grünholz wird seit drei Generationen von der Familie Grünholz in Ravensburg geführt. Was als kleine Staudengärtnerei begann, ist heute ein Betrieb mit eigener Baumschule und einem Team, das den Boden hier kennt wie kaum jemand sonst. Wir setzen auf regionale Sorten, ehrliche Beratung und Pflanzen, die wirklich zum jeweiligen Standort passen — vom schattigen Hinterhof bis zum sonnigen Balkon. Wer bei uns kauft, bekommt keine Massenware, sondern etwas, das mit Absicht gezogen wurde.",
      imageUrl: "/demo/landgut-detail-1.svg",
    },
    {
      type: "testimonials",
      headline: "Was Kund:innen sagen",
      items: [
        {
          author: "Petra Simmel",
          text: "Endlich eine Gärtnerei, die mir ehrlich sagt, was an meinem Standort wirklich wächst — statt einfach zu verkaufen.",
          rating: 5,
        },
        {
          author: "Familie Hasenmayer",
          text: "Der Pflanzservice war unkompliziert und alles ist angewachsen. Unser Garten sieht aus wie aus einem anderen Leben.",
          rating: 5,
        },
        {
          author: "Jonas Rieger",
          text: "Beratung mit Zeit und Ruhe, nicht wie im Baumarkt. Man merkt, dass hier drei Generationen Wissen dahinterstehen.",
          rating: 5,
        },
      ],
    },
    {
      type: "gallery",
      headline: "Impressionen",
      images: [
        {
          url: "/demo/landgut-hero.svg",
          alt: "Pflanzreihen mit Stauden in der Gärtnerei Grünholz",
        },
        {
          url: "/demo/landgut-detail-1.svg",
          alt: "Kräutertöpfe im Verkaufsbereich",
        },
        {
          url: "/demo/landgut-detail-2.svg",
          alt: "Frisch gepflanzte Baumschule bei Sonnenaufgang",
        },
      ],
    },
    {
      type: "contact",
      headline: "Kontakt",
      phone: "0751 555 4290",
      email: "hallo@gaertnerei-gruenholz.de",
      street: "Weingartener Straße 58",
      zip: "88212",
      city: "Ravensburg",
      openingHours: [{ day: "Mo–Sa", hours: "9:00 – 18:00 (Saison)" }],
    },
  ],
  seo: {
    title:
      "Gärtnerei Grünholz Ravensburg — Stauden, Gartenplanung, Baumschnitt",
    description:
      "Gärtnerei Grünholz in Ravensburg: regionale Stauden und Kräuter, Gartenplanung, Pflanzservice und Baumschnitt — seit drei Generationen.",
  },
  footerNote: "Gärtnerei Grünholz · Ravensburg · seit drei Generationen",
  google: { rating: 4.8, reviewCount: 73 },
};

const LANDGUT_MINIMAL: WebsiteDataV2 = {
  version: 2,
  stylePackId: "landgut",
  businessName: "Gärtnerei Grünholz",
  slug: "gaertnerei-gruenholz-ravensburg",
  businessCategory: "Gärtnerei & Baumschule",
  tagline: "Seit drei Generationen für Ravensburg.",
  logo: { kind: "font", font: "Grünholz" },
  sections: [
    {
      type: "hero",
      headline: "Vom Beet auf den Balkon.",
      subheadline: "Regionale Stauden, Kräuter und Beratung aus Ravensburg.",
      ctaText: "Saison entdecken",
      ctaHref: "#kontakt",
      imageUrl: "/demo/landgut-hero.svg",
    },
    {
      type: "services",
      headline: "Leistungen",
      items: [
        {
          title: "Stauden & Kräuter",
          description: "Regional gezogen, beratend ausgesucht.",
        },
        {
          title: "Gartenplanung",
          description: "Von der Skizze bis zur Bepflanzung.",
        },
      ],
    },
    {
      type: "contact",
      headline: "Kontakt",
      phone: "0751 555 4290",
      email: "hallo@gaertnerei-gruenholz.de",
      street: "Weingartener Straße 58",
      zip: "88212",
      city: "Ravensburg",
      openingHours: [{ day: "Mo–Sa", hours: "9:00 – 18:00 (Saison)" }],
    },
  ],
  seo: {
    title: "Gärtnerei Grünholz Ravensburg",
    description:
      "Gärtnerei Grünholz in Ravensburg: regionale Stauden und Kräuter, Gartenplanung.",
  },
  footerNote: "Gärtnerei Grünholz · Ravensburg · seit drei Generationen",
  google: { rating: 4.8, reviewCount: 73 },
};

const ATELIER_FULL: WebsiteDataV2 = {
  version: 2,
  stylePackId: "atelier",
  businessName: "Studio Lenz",
  slug: "studio-lenz-fotografie-leipzig",
  businessCategory: "Fotografie",
  tagline: "Bilder, die bleiben.",
  logo: { kind: "font", font: "Studio Lenz" },
  sections: [
    {
      type: "hero",
      headline: "Bilder, die bleiben.",
      subheadline:
        "Keine Posen, keine Filter. Momente, wie sie passieren — für Menschen und Marken, die echt aussehen wollen.",
      ctaText: "Portfolio ansehen",
      ctaHref: "#galerie",
      imageUrl: "/demo/atelier-hero.svg",
    },
    {
      type: "services",
      headline: "Leistungen",
      intro: "Drei Formate, ein Blick: ehrlich, ruhig, ohne Inszenierung.",
      items: [
        {
          title: "Porträt",
          description:
            "Menschen, wie sie wirklich sind — im Studio oder an ihrem eigenen Ort.",
          price: "ab 290 €",
        },
        {
          title: "Reportage",
          description:
            "Begleitung über Stunden statt Sekunden: Hochzeiten, Events, Alltag.",
          price: "ab 690 €",
        },
        {
          title: "Marken",
          description:
            "Bildwelten für Websites, Kataloge und Social Media — konsistent kuratiert.",
          price: "auf Anfrage",
        },
      ],
    },
    {
      type: "about",
      headline: "Über das Studio",
      body: "Studio Lenz arbeitet seit 2016 in Leipzig-Plagwitz — an der Schnittstelle aus Reportage und Porträt. Kein Blitzlichtgewitter, keine gestellten Posen: Jede Serie entsteht aus Beobachtung, nicht aus Regie. Auftraggeber sind Menschen, die ein ehrliches Bild von sich wollen, und Marken, die genug haben von Stockfotografie. Entwickelt, sortiert und ausgewählt wird jede Serie von Hand — analog gedacht, digital umgesetzt.",
      imageUrl: "/demo/atelier-detail-1.svg",
    },
    {
      type: "gallery",
      headline: "Galerie",
      images: [
        {
          url: "/demo/atelier-hero.svg",
          alt: "Porträt in Streiflicht, Studio Lenz Leipzig",
        },
        {
          url: "/demo/atelier-detail-1.svg",
          alt: "Reportage-Moment auf einer Hochzeit",
        },
        {
          url: "/demo/atelier-detail-2.svg",
          alt: "Markenshooting mit reduzierter Kulisse",
        },
      ],
    },
    {
      type: "testimonials",
      headline: "Was Kund:innen sagen",
      items: [
        {
          author: "Nora Feldkamp",
          text: "Keine gestellten Posen, keine Nachbearbeitungs-Orgie — einfach Bilder, die aussehen wie wir.",
          rating: 5,
        },
        {
          author: "Elias Wachter, Wachter Manufaktur",
          text: "Das Markenshooting hat unsere Website in einem Nachmittag komplett verändert.",
          rating: 5,
        },
      ],
    },
    {
      type: "contact",
      headline: "Kontakt",
      phone: "0341 990 4471",
      email: "hallo@studio-lenz-leipzig.de",
      street: "Karl-Heine-Straße 93",
      zip: "04229",
      city: "Leipzig",
      openingHours: [{ day: "Di–Fr", hours: "10:00 – 18:00 (nach Termin)" }],
    },
  ],
  seo: {
    title: "Studio Lenz Leipzig — Porträt, Reportage, Markenfotografie",
    description:
      "Studio Lenz fotografiert in Leipzig seit 2016 Porträts, Reportagen und Markenbilder — ehrlich, ruhig, ohne Inszenierung.",
  },
  footerNote: "Studio Lenz · Leipzig · seit 2016",
  google: { rating: 5.0, reviewCount: 31 },
};

const ATELIER_MINIMAL: WebsiteDataV2 = {
  version: 2,
  stylePackId: "atelier",
  businessName: "Studio Lenz",
  slug: "studio-lenz-fotografie-leipzig",
  businessCategory: "Fotografie",
  tagline: "Bilder, die bleiben.",
  logo: { kind: "font", font: "Studio Lenz" },
  sections: [
    {
      type: "hero",
      headline: "Bilder, die bleiben.",
      subheadline:
        "Keine Posen, keine Filter — ehrliche Porträt- und Markenfotografie in Leipzig.",
      ctaText: "Portfolio ansehen",
      ctaHref: "#galerie",
      imageUrl: "/demo/atelier-hero.svg",
    },
    {
      type: "services",
      headline: "Leistungen",
      items: [
        { title: "Porträt", description: "Im Studio oder am eigenen Ort." },
        {
          title: "Marken",
          description: "Bildwelten für Website und Social Media.",
        },
      ],
    },
    {
      type: "contact",
      headline: "Kontakt",
      phone: "0341 990 4471",
      email: "hallo@studio-lenz-leipzig.de",
      street: "Karl-Heine-Straße 93",
      zip: "04229",
      city: "Leipzig",
      openingHours: [{ day: "Di–Fr", hours: "10:00 – 18:00 (nach Termin)" }],
    },
  ],
  seo: {
    title: "Studio Lenz Leipzig",
    description:
      "Studio Lenz fotografiert in Leipzig Porträts und Markenbilder.",
  },
  footerNote: "Studio Lenz · Leipzig · seit 2016",
  google: { rating: 5.0, reviewCount: 31 },
};

const FIXTURES: Partial<Record<PackId, FixtureSet>> = {
  werkbank: { full: WERKBANK_FULL, minimal: WERKBANK_MINIMAL },
  kanzlei: { full: KANZLEI_FULL, minimal: KANZLEI_MINIMAL },
  morgenlicht: { full: MORGENLICHT_FULL, minimal: MORGENLICHT_MINIMAL },
  gusto: { full: GUSTO_FULL, minimal: GUSTO_MINIMAL },
  patina: { full: PATINA_FULL, minimal: PATINA_MINIMAL },
  "salon-noir": { full: SALON_NOIR_FULL, minimal: SALON_NOIR_MINIMAL },
  marktplatz: { full: MARKTPLATZ_FULL, minimal: MARKTPLATZ_MINIMAL },
  landgut: { full: LANDGUT_FULL, minimal: LANDGUT_MINIMAL },
  atelier: { full: ATELIER_FULL, minimal: ATELIER_MINIMAL },
};

export function getFixture(packId: PackId, kind: FixtureKind): WebsiteDataV2 {
  const set = FIXTURES[packId];
  if (!set) {
    throw new Error(`Fixture fehlt für Pack: ${packId}`);
  }
  return set[kind];
}
