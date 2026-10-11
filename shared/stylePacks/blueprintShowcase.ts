/**
 * Bauplan-Übersicht (2026-10-06, Betreiber: „wo kann ich die Templates in der
 * Übersicht sehen?"). Je Branche ein Beispielbetrieb aus den Fixtures, so
 * aufbereitet wie eine frisch erzeugte Seite: Einstieg Bühne oder
 * Farbfläche, Bauplan angewendet. Reine Beispieldaten — keine echte Firma.
 */
import { withDesignSystem } from "../designSystems/apply";
import type { DesignSystemId } from "../designSystems/types";
import { DEFAULT_DESIGN_PROFILE } from "../siteContract/designProfile";
import { getFixture } from "../siteContract/fixtures";
import type { SectionOf, WebsiteDataV2 } from "../siteContract/types";
import { withArtDirection, withEntryComposition } from "./artDirection";
import { INDUSTRY_IMAGES } from "../industryImages";
import { pickArtTheme } from "./artThemes";
import { blueprintFor, withBlueprint } from "./blueprints";
import {
  SHOWCASES,
  type Showcase,
  type ShowcaseEntry,
} from "./blueprintShowcaseList";

export { SHOWCASES, type Showcase, type ShowcaseEntry };

/** Beispiel-Ablauf für Handwerk — die Fixtures haben keinen. */
const SAMPLE_PROCESS: SectionOf<"process"> = {
  type: "process",
  headline: "So läuft's ab",
  steps: [
    {
      title: "Anfrage",
      text: "Sie schildern Ihr Anliegen am Telefon oder per E-Mail.",
    },
    {
      title: "Gespräch",
      text: "Wir klären gemeinsam, was Sie brauchen und wie es weitergeht.",
    },
    {
      title: "Angebot",
      text: "Sie erhalten ein nachvollziehbares, schriftliches Angebot.",
    },
    {
      title: "Umsetzung",
      text: "Wir setzen alles sauber und wie besprochen um.",
    },
  ],
};

type SampleText = {
  hero: { headline: string; subheadline: string };
  /** Adresse passend zum Beispiel (die Fixture gehört zu einer anderen Firma). */
  /**
   * Fiktive Kontaktdaten: Rufnummern im Muster „Vorwahl 555 …", Domains auf
   * `.example` (RFC 2606) — die Demo-Seiten sind öffentlich und verlinken
   * per `tel:`/`mailto:`.
   */
  contact: {
    street: string;
    zip: string;
    city: string;
    phone: string;
    email: string;
  };
  /** Öffnungszeiten des Beispiels; ohne Angabe die der Fixture. */
  hours?: { day: string; hours: string }[];
  services: { title: string; description: string }[];
  about: string;
  faq: { question: string; answer: string }[];
  /**
   * Bewertungen des Beispiels. Fehlt das Feld, hat der Betrieb keine —
   * Stimmen-Abschnitt und Google-Zahlen der Fixture entfallen.
   */
  reviews?: { author: string; text: string }[];
};

/**
 * Beispieltexte für Familien ohne eigene Fixture (Auto, Sofort-Dienste) —
 * sonst stünden in der Übersicht Schreinerei-Texte unter „Kfz-Werkstatt".
 */
const SAMPLE_TEXT: Record<string, SampleText> = {
  werkstatt: {
    contact: {
      street: "Hörder Bahnhofstraße 12",
      zip: "44263",
      city: "Dortmund",
      phone: "0231 555 4471",
      email: "service@kfz-brandt.example",
    },
    hero: {
      headline: "Kfz-Werkstatt in Dortmund-Hörde",
      subheadline:
        "Inspektion, Reifen und Reparaturen für alle Marken — mit Termin, ehrlicher Beratung und Rückruf, sobald Ihr Auto fertig ist.",
    },
    services: [
      {
        title: "Inspektion",
        description:
          "Wartung nach Herstellervorgaben, mit Stempel im Serviceheft und Bericht über alles, was uns auffällt.",
      },
      {
        title: "Reifenwechsel",
        description:
          "Sommer- und Winterreifen wechseln, auswuchten und auf Wunsch bei uns einlagern.",
      },
      {
        title: "Bremsen",
        description:
          "Beläge, Scheiben und Bremsflüssigkeit prüfen und tauschen, bevor es kritisch wird.",
      },
      {
        title: "Klimaservice",
        description:
          "Klimaanlage prüfen, reinigen und befüllen, damit sie im Sommer wieder zuverlässig kühlt.",
      },
    ],
    about:
      "Seit vielen Jahren schrauben wir in Hörde an Autos aller Marken. Sie bekommen vorab eine klare Einschätzung, was nötig ist und was warten kann.\n\nWir rufen an, bevor wir etwas tun, das nicht abgesprochen ist — und wenn Ihr Auto fertig ist.",
    faq: [
      {
        question: "Wie schnell bekomme ich einen Termin?",
        answer:
          "Rufen Sie kurz an — meistens finden wir innerhalb weniger Tage einen Termin, kleine Arbeiten oft auch kurzfristig.",
      },
      {
        question: "Arbeitet ihr an allen Marken?",
        answer:
          "Ja, wir warten und reparieren Fahrzeuge aller gängigen Marken, auch mit Stempel im Serviceheft.",
      },
    ],
    reviews: [
      {
        author: "Jens K.",
        text: "Ehrlich, schnell und fair. Mir wurde genau erklärt, was gemacht werden muss und was nicht.",
      },
      {
        author: "Sabine M.",
        text: "Reifenwechsel ohne Wartezeit, sehr freundlich. Komme gern wieder.",
      },
    ],
  },
  hersteller: {
    contact: {
      street: "Industriestraße 8",
      zip: "46395",
      city: "Bocholt",
      phone: "02871 555 120",
      email: "anfrage@kruse-metalltechnik.example",
    },
    hero: {
      headline: "Metallverarbeitung für die Industrie in Bocholt",
      subheadline:
        "Laserschneiden, Kanten und Schweißen nach Zeichnung — vom Einzelteil bis zur Serie, für Betriebe aus dem Münsterland.",
    },
    services: [
      {
        title: "Laserschneiden",
        description:
          "Bleche aus Stahl, Edelstahl und Aluminium nach Ihrer Zeichnung zugeschnitten.",
      },
      {
        title: "Kanten",
        description:
          "Abkantteile in gleichbleibender Qualität, vom Muster bis zur Serie.",
      },
      {
        title: "Schweißen",
        description:
          "Baugruppen aus Stahl und Edelstahl, montagefertig vorbereitet.",
      },
      {
        title: "Oberflächen",
        description:
          "Entgraten, Schleifen und auf Wunsch Beschichtung über Partnerbetriebe.",
      },
    ],
    about:
      "Wir fertigen Blech- und Schweißteile für Maschinenbauer, Handwerksbetriebe und Industrie aus der Region. Kurze Wege und feste Ansprechpartner sind uns wichtig.\n\nSie schicken uns Zeichnung oder Muster, wir melden uns mit einem Angebot und einem realistischen Liefertermin.",
    faq: [
      {
        question: "Fertigt ihr auch Einzelteile?",
        answer:
          "Ja, vom Einzelteil über Prototypen bis zur Serie — schicken Sie uns Zeichnung oder Muster für ein Angebot.",
      },
      {
        question: "In welches Gebiet liefert ihr?",
        answer:
          "Wir liefern im Münsterland und am Niederrhein, Abholung bei uns in Bocholt ist ebenfalls möglich.",
      },
    ],
    reviews: [
      {
        author: "Thomas R.",
        text: "Zuverlässiger Partner, Teile kommen sauber und termingerecht.",
      },
      {
        author: "Andrea P.",
        text: "Schnelle Angebote und kurze Abstimmung, so muss das sein.",
      },
    ],
  },
  taxi: {
    contact: {
      street: "Rathausplatz 3",
      zip: "46414",
      city: "Rhede",
      phone: "02872 555 300",
      email: "fahrt@taxi-rhede.example",
    },
    hero: {
      headline: "Taxi in Rhede und Umgebung",
      subheadline:
        "Fahrten zum Bahnhof, zum Arzt oder zum Flughafen — einfach anrufen oder vorbestellen.",
    },
    services: [
      {
        title: "Stadtfahrten",
        description:
          "Schnell von A nach B innerhalb von Rhede und in die Nachbarorte.",
      },
      {
        title: "Flughafentransfer",
        description:
          "Pünktlich zum Flughafen Düsseldorf oder Weeze, auch frühmorgens nach Vorbestellung.",
      },
      {
        title: "Krankenfahrten",
        description: "Fahrten zu Arzt, Klinik oder Therapie nach Absprache.",
      },
      {
        title: "Kurierfahrten",
        description: "Eilige Briefe und Pakete direkt zum Empfänger gebracht.",
      },
    ],
    about:
      "Wir fahren seit Jahren in Rhede und kennen jede Abkürzung. Ob kurze Strecke oder Fahrt zum Flughafen — Sie erreichen uns telefonisch und können Fahrten vorbestellen.",
    faq: [
      {
        question: "Kann ich eine Fahrt vorbestellen?",
        answer:
          "Ja, rufen Sie einfach an und nennen Sie Abholort und Uhrzeit — besonders für frühe Flughafenfahrten empfehlen wir das.",
      },
      {
        question: "In welchem Gebiet fahrt ihr?",
        answer:
          "Wir fahren in Rhede, Bocholt und Umgebung sowie zu allen Flughäfen in der Region.",
      },
    ],
    reviews: [
      {
        author: "Petra L.",
        text: "Superpünktlich um 4 Uhr morgens da, sehr freundlicher Fahrer.",
      },
      { author: "Ahmet Y.", text: "Schnell da, sauberes Auto, fairer Preis." },
    ],
  },
  // Sofort-Dienst ohne Foto und ohne Bewertungen (Review-Fokus Raster):
  // Einstieg nur Schrift, Zeiten rund um die Uhr.
  schluesseldienst: {
    contact: {
      street: "Am Kanal 14",
      zip: "48159",
      city: "Münster",
      phone: "0251 555 2440",
      email: "hallo@schluesseldienst-nord.example",
    },
    hours: [{ day: "Mo–So", hours: "24 Stunden" }],
    hero: {
      headline: "Schlüsseldienst in Münster",
      subheadline: "Ausgesperrt? Ruf an. Wir kommen, Tag und Nacht.",
    },
    services: [
      {
        title: "Türöffnung",
        description: "Zugefallen oder abgeschlossen, Tag und Nacht.",
      },
      {
        title: "Schlosstausch",
        description:
          "Nach Schlüsselverlust oder Einzug, neuer Zylinder nach Absprache.",
      },
      {
        title: "Einbruchschutz",
        description: "Beratung vor Ort, Zusatzschlösser, Querriegel.",
      },
    ],
    about:
      "Wir öffnen deine Tür. Ohne Schaden, wo es geht.\n\nDen Preis nennen wir dir am Telefon, bevor wir losfahren.",
    faq: [
      {
        question: "Was kostet eine Türöffnung?",
        answer:
          "Das hängt von Uhrzeit und Schloss ab. Wir nennen dir den Preis am Telefon, bevor wir losfahren.",
      },
      {
        question: "Bekomme ich eine Rechnung?",
        answer: "Ja, du bekommst nach jedem Einsatz eine Rechnung.",
      },
    ],
  },
};

/** Branchenbilder statt Fixture-Fotos, wenn die Fixture nicht passt. */
function withShowcasePhotos(
  doc: WebsiteDataV2,
  photos?: string
): WebsiteDataV2 {
  if (photos === "none") return withoutPhotos(doc);
  const [name, start] = (photos ?? "").split(":");
  const set = name ? INDUSTRY_IMAGES[name] : undefined;
  if (!set) return doc;
  const first = Number(start ?? 0);
  const gallery = set.gallery ?? set.hero;
  const sections = doc.sections.map(section => {
    if (section.type === "hero")
      return { ...section, imageUrl: set.hero[first] ?? set.hero[0] };
    if (section.type === "about")
      return { ...section, imageUrl: set.about?.[0] ?? gallery[0] };
    if (section.type === "gallery")
      return {
        ...section,
        images: gallery.slice(0, 6).map((url, i) => ({
          url,
          alt: `${doc.businessName} – Eindruck ${i + 1}`,
        })),
      };
    return section;
  }) as WebsiteDataV2["sections"];
  return { ...doc, sections };
}

/** Betrieb ohne brauchbares Foto: keine Bilder im Einstieg, Über uns, Leistungen. */
function withoutPhotos(doc: WebsiteDataV2): WebsiteDataV2 {
  const sections = doc.sections
    .filter(section => section.type !== "gallery")
    .map(section => {
      if (section.type === "hero" || section.type === "about")
        return { ...section, imageUrl: undefined };
      if (section.type === "services")
        return {
          ...section,
          items: section.items.map(item => ({ ...item, imageUrl: undefined })),
        };
      return section;
    }) as WebsiteDataV2["sections"];
  return { ...doc, sections };
}

function withSampleText(doc: WebsiteDataV2, id: string): WebsiteDataV2 {
  const text = SAMPLE_TEXT[id];
  if (!text) return doc;
  const sections = doc.sections.map(section => {
    switch (section.type) {
      case "hero":
        // Hauptaktion setzt der Bauplan (die Fixture hätte „Immobilie bewerten lassen").
        return {
          ...section,
          ...text.hero,
          ctaText: undefined,
          ctaHref: undefined,
        };
      case "contact":
        return {
          ...section,
          ...text.contact,
          ...(text.hours ? { openingHours: text.hours } : {}),
        };
      case "services":
        // Einleitung der Fixture gehört zu einer anderen Firma.
        return { ...section, intro: undefined, items: text.services };
      case "about":
        return { ...section, body: text.about };
      case "faq":
        return { ...section, items: text.faq };
      case "testimonials":
        return text.reviews
          ? {
              ...section,
              items: text.reviews.map(r => ({ ...r, rating: 5 })),
            }
          : section;
      default:
        return section;
    }
  }) as WebsiteDataV2["sections"];
  const { google, tagline: _tagline, ...rest } = doc;
  return {
    ...rest,
    // Ohne Bewertungen auch keine Google-Zahlen der fremden Fixture.
    ...(text.reviews && google ? { google } : {}),
    sections: text.reviews
      ? sections
      : (sections.filter(
          s => s.type !== "testimonials"
        ) as WebsiteDataV2["sections"]),
    // Fuß und Unterzeile der Fixture gehören zu einer anderen Firma.
    footerNote: `${doc.businessName} · ${text.contact.city}`,
    seo: { title: doc.businessName, description: text.hero.subheadline },
  };
}

export function findShowcase(id: string): Showcase | undefined {
  return SHOWCASES.find(s => s.id === id);
}

/** Beispielseite wie eine frisch erzeugte: Einstieg + Bauplan. */
export function showcaseDoc(
  showcase: Showcase,
  entry: ShowcaseEntry
): WebsiteDataV2 {
  const fixture = getFixture(showcase.fixture, "full");
  // Unterseiten sind ein Extra — die Übersicht zeigt die Startseite.
  const { pages: _pages, ...withoutPages } = fixture;
  const named: WebsiteDataV2 = {
    ...withoutPages,
    ...(showcase.businessName ? { businessName: showcase.businessName } : {}),
    ...(showcase.businessCategory
      ? { businessCategory: showcase.businessCategory }
      : {}),
    ...(showcase.amenities ? { amenities: showcase.amenities } : {}),
  };
  const blueprint = blueprintFor(named.businessCategory, named.businessName);
  const texted = withShowcasePhotos(
    withSampleText(named, showcase.id),
    showcase.photos
  );
  const withExtras: WebsiteDataV2 =
    blueprint.extraSections?.includes("process") &&
    !texted.sections.some(s => s.type === "process")
      ? { ...texted, sections: [...texted.sections, SAMPLE_PROCESS] }
      : texted;
  // Schrift und Farbwelt wie bei einer neuen Seite (runJob), nicht die
  // handgesetzten Werte der Fixture.
  const directed = withArtDirection({
    ...withExtras,
    ...pickArtTheme(
      withExtras.stylePackId,
      withExtras.businessName,
      withExtras.businessCategory
    ),
  });
  const designProfile = withEntryComposition(
    {
      ...(directed.designProfile ?? DEFAULT_DESIGN_PROFILE),
      composition: "portrait",
    },
    { heroLandscape: entry === "stage", extraPhotos: 3 }
  );
  return withBlueprint({ ...directed, designProfile }, blueprint);
}

/** Beispielbetrieb im Designsystem (Systemübersicht, /demo/system/…). */
export function systemShowcaseDoc(
  showcase: Showcase,
  system: DesignSystemId,
  palette?: string
): WebsiteDataV2 {
  return withDesignSystem(showcaseDoc(showcase, "stage"), system, palette);
}
