/**
 * Beispielbetriebe der Designsysteme (/demo/system/…, Design-Übersicht).
 * Je Branche ein Beispielbetrieb aus den Fixtures, so aufbereitet wie eine
 * frisch erzeugte Seite: Einstieg, Bauplan, System mit fester
 * Standard-Farbstimmung. Reine Beispieldaten — keine echte Firma.
 */
import { withDesignSystem, withPrimarySystem } from "../designSystems/apply";
import type { DesignSystemId } from "../designSystems/types";
import { getSystem } from "../designSystems/registry";
import { entrySeed } from "../designSystems/entry";
import { DEFAULT_DESIGN_PROFILE } from "../siteContract/designProfile";
import { getFixture } from "../siteContract/fixtures";
import type { SectionOf, WebsiteDataV2 } from "../siteContract/types";
import { INDUSTRY_IMAGES } from "../industryImages";
import { blueprintFor, withBlueprint } from "../blueprints/blueprints";
import { SHOWCASE_PALETTES } from "./showcasePalettes";
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
  /** Hauptaktion nur, wenn das Beispiel ein echtes Ziel hat (Buchungslink). */
  hero: {
    headline: string;
    subheadline: string;
    ctaText?: string;
    ctaHref?: string;
  };
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
  services: { title: string; description: string; price?: string }[];
  about: string;
  faq: { question: string; answer: string }[];
  /**
   * Bewertungen des Beispiels. Fehlt das Feld, hat der Betrieb keine —
   * Stimmen-Abschnitt und Google-Zahlen der Fixture entfallen.
   */
  reviews?: { author: string; text: string }[];
  /** Fragen auch ergänzen, wenn die Fixture keinen FAQ-Abschnitt hat. */
  addFaq?: true;
  /**
   * `false`: Google-Zahlen der Fixture weglassen (gehören zu ihr); eigene
   * Zahlen ersetzen die der Fixture (nur mit Bewertungen).
   */
  google?: false | { rating: number; reviewCount: number };
  /** Vorteile als Titel (Fakten-Chips in Klar), direkt nach dem Einstieg. */
  usp?: string[];
  /** Eigenes Team (ersetzt bzw. ergänzt das der Fixture, bucht das Add-on). */
  team?: Omit<SectionOf<"team">, "type">;
  /** Eigener Ablauf des Beispiels (ersetzt bzw. ergänzt den der Fixture). */
  process?: Omit<SectionOf<"process">, "type">;
  /** Eigene Preisliste/Wochentafel (ersetzt bzw. ergänzt die der Fixture, bucht das Add-on). */
  pricelist?: Omit<SectionOf<"pricelist">, "type">;
  /**
   * Eigene Speisekarte, wie im Studio eingetragen (nach dem Bauplan
   * eingesetzt, bucht das Extra; withStudioMenu).
   */
  menu?: Omit<SectionOf<"menu">, "type">;
  /** Aufruf mit eigenem Ziel (Reservierungs-Band in Nacht), vor den Stimmen. */
  cta?: Omit<SectionOf<"cta">, "type">;
  /**
   * `"end"`: der Aufruf schließt die Seite ab (Abschluss-Band in
   * Freundlich, Systemblatt 13/14) statt vor den Stimmen zu stehen.
   */
  ctaAt?: "end";
  /** Eigene Zahlen (ergänzt, wenn die Fixture keine hat), vor den Stimmen. */
  stats?: Omit<SectionOf<"stats">, "type">;
  /** Abschnitte der Fixture, die nicht zum Beispiel passen (z. B. doppelte Preise). */
  drop?: readonly WebsiteDataV2["sections"][number]["type"][];
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
  // Klar (2026-10-12): Zahnarzt, Physio, Kanzlei — Systemblatt 8–13,
  // „Sie"-Ansprache, Bildsätze zahnarzt/physio, Kontaktdaten fiktiv.
  zahnarzt: {
    contact: {
      street: "Lindenweg 12",
      zip: "21335",
      city: "Lüneburg",
      phone: "04131 555 0142",
      email: "praxis@dr-sommer.example",
    },
    hours: [
      { day: "Mo", hours: "8:00 – 12:00, 14:00 – 18:00" },
      { day: "Di", hours: "8:00 – 12:00, 14:00 – 18:00" },
      { day: "Mi", hours: "8:00 – 13:00" },
      { day: "Do", hours: "8:00 – 12:00, 14:00 – 19:00" },
      { day: "Fr", hours: "8:00 – 13:00" },
      { day: "Sa", hours: "geschlossen" },
      { day: "So", hours: "geschlossen" },
    ],
    hero: {
      headline: "Gut aufgehoben. Von Anfang an.",
      subheadline:
        "Behutsame Zahnmedizin für die ganze Familie. Wir erklären jeden Schritt, bevor wir anfangen.",
    },
    usp: ["Alle Kassen", "Privat"],
    services: [
      {
        title: "Vorsorge und Zahnreinigung",
        description:
          "Untersuchung, professionelle Reinigung, Röntgen nur wenn nötig.",
      },
      {
        title: "Füllungen und Wurzelbehandlung",
        description: "Zahnfarbene Füllungen, gründlich betäubt.",
      },
      {
        title: "Zahnersatz",
        description:
          "Kronen, Brücken, Prothesen. Kostenplan vorab schriftlich.",
      },
      {
        title: "Für Angstpatienten",
        description: "Mehr Zeit, Pause auf Handzeichen.",
      },
    ],
    process: {
      headline: "Ihr erster Termin",
      steps: [
        {
          title: "Anrufen oder online buchen",
          text: "Sagen Sie uns kurz, worum es geht. Wir nennen Ihnen einen Termin.",
        },
        {
          title: "Ankommen",
          text: "Den Fragebogen füllen wir gemeinsam am Empfang aus.",
        },
        {
          title: "Untersuchung und Gespräch",
          text: "Wir zeigen Ihnen die Aufnahmen am Bildschirm und erklären, was wir sehen.",
        },
        {
          title: "Ihr Plan, schriftlich",
          text: "Alle Schritte und Kosten auf Papier. Entscheiden müssen Sie nichts sofort.",
        },
      ],
    },
    team: {
      headline: "Ihr Team",
      members: [
        { name: "Dr. Katrin Sommer", role: "Zahnärztin, Inhaberin" },
        { name: "Jonas Petersen", role: "Zahnarzt" },
        { name: "Aylin Demir", role: "Prophylaxe" },
      ],
    },
    about:
      "Seit vielen Jahren behandeln wir am Lindenweg Kinder, Eltern und Großeltern. Wir nehmen uns Zeit für Ihre Fragen und erklären jeden Schritt, bevor wir anfangen.\n\nDie Praxis liegt im Erdgeschoss, ein Aufzug führt auch in die Behandlungsräume im ersten Stock.",
    faq: [
      {
        question: "Nehmen Sie neue Patienten auf?",
        answer:
          "Ja. Rufen Sie an, wir finden einen Termin und sagen Ihnen, was Sie mitbringen.",
      },
      {
        question: "Ich habe Angst. Was können Sie tun?",
        answer:
          "Wir planen mehr Zeit ein, erklären vorher jeden Schritt und machen Pause, sobald Sie die Hand heben.",
      },
      {
        question: "Was zahlt meine Kasse?",
        answer:
          "Das klären wir vor der Behandlung. Sie bekommen den Eigenanteil schriftlich.",
      },
    ],
    google: { rating: 4.8, reviewCount: 212 },
    reviews: [
      {
        author: "Renate K.",
        text: "Ich hatte zwölf Jahre Angst vor dem Bohrer. Hier wurde jeder Schritt erklärt, und ich durfte jederzeit Pause machen.",
      },
      {
        author: "Thomas B.",
        text: "Kurzfristig einen Termin bekommen, als der Zahn wehtat. Freundlich, ruhig und gründlich.",
      },
      {
        author: "Familie Ahrens",
        text: "Unsere Kinder gehen gern hin. Das sagt eigentlich alles.",
      },
    ],
  },
  physio: {
    contact: {
      street: "Mühlenstraße 4",
      zip: "29221",
      city: "Celle",
      phone: "05141 555 0187",
      email: "team@physio-lindner.example",
    },
    hours: [
      { day: "Mo–Do", hours: "7:30 – 20:00" },
      { day: "Fr", hours: "7:30 – 14:00" },
      { day: "Sa–So", hours: "geschlossen" },
    ],
    hero: {
      headline: "Termine auch abends.",
      subheadline:
        "Krankengymnastik, Manuelle Therapie und Lymphdrainage. Mit Rezept oder als Selbstzahler.",
    },
    usp: ["Alle Kassen", "Privat"],
    services: [
      {
        title: "Krankengymnastik",
        description: "Kräftigen, dehnen, wieder sicher bewegen.",
      },
      {
        title: "Manuelle Therapie",
        description: "Für Rücken, Nacken und Gelenke.",
      },
      {
        title: "Lymphdrainage",
        description: "Sanft, nach Operationen und bei Schwellungen.",
      },
      {
        title: "Hausbesuche",
        description: "Wenn Sie nicht zu uns kommen können.",
      },
    ],
    pricelist: {
      headline: "Für Selbstzahler",
      categories: [
        {
          name: "Je Behandlung",
          items: [
            { name: "Krankengymnastik", price: "32 €" },
            { name: "Manuelle Therapie", price: "38 €" },
            { name: "Lymphdrainage", price: "36 €" },
            { name: "Klassische Massage", price: "29 €" },
          ],
        },
      ],
    },
    process: {
      headline: "Ihr erster Termin",
      steps: [
        {
          title: "Verordnung mitbringen",
          text: "Ihr Rezept vom Arzt. Ohne Rezept behandeln wir als Selbstzahler.",
        },
        {
          title: "Befund",
          text: "Wir fragen nach Ihren Beschwerden und schauen uns die Bewegung an.",
        },
        {
          title: "Behandlung",
          text: "Wir beginnen gleich und erklären, was wir tun.",
        },
        {
          title: "Übungen für zu Hause",
          text: "Sie bekommen Ihre Übungen ausgedruckt mit.",
        },
      ],
    },
    team: {
      headline: "Ihr Team",
      members: [
        { name: "Marie Lindner", role: "Physiotherapeutin, Inhaberin" },
        { name: "Tobias Wendt", role: "Manuelle Therapie" },
        { name: "Svenja Koch", role: "Lymphdrainage" },
      ],
    },
    about:
      "Drei Behandlungsräume im Erdgeschoss, ein kleiner Übungsraum und ein Team, das Sie beim Namen kennt. Wir behandeln mit Rezept und als Selbstzahler.\n\nWer tagsüber arbeitet, kommt abends: Montag bis Donnerstag sind wir bis 20 Uhr da.",
    faq: [
      {
        question: "Brauche ich ein Rezept?",
        answer:
          "Für die Kasse ja. Ohne Rezept zahlen Sie selbst, die Preise stehen oben.",
      },
      {
        question: "Kommen Sie auch nach Hause?",
        answer: "Ja, mit Verordnung für Hausbesuche, in Celle und Umgebung.",
      },
      {
        question: "Wie schnell bekomme ich einen Termin?",
        answer: "Rufen Sie an. Abendtermine sind am schnellsten frei.",
      },
    ],
    addFaq: true,
    google: false,
  },
  kanzlei: {
    contact: {
      street: "Almsstraße 21",
      zip: "31134",
      city: "Hildesheim",
      phone: "05121 555 0119",
      email: "kanzlei@brandt-steuer.example",
    },
    hours: [
      { day: "Mo", hours: "8:30 – 17:00" },
      { day: "Di", hours: "8:30 – 17:00" },
      { day: "Mi", hours: "8:30 – 13:00" },
      { day: "Do", hours: "8:30 – 18:00" },
      { day: "Fr", hours: "8:30 – 13:00" },
      { day: "Sa", hours: "geschlossen" },
      { day: "So", hours: "geschlossen" },
    ],
    hero: {
      headline: "Ihre Steuern. In ruhigen Händen.",
      subheadline:
        "Für Angestellte, Rentner und kleine Betriebe. Das Erstgespräch kostet nichts.",
    },
    services: [
      {
        title: "Steuererklärung",
        description: "Für Angestellte, Rentner und Vermieter.",
      },
      {
        title: "Buchhaltung und Lohn",
        description: "Für Betriebe bis etwa 20 Mitarbeiter.",
      },
      {
        title: "Jahresabschluss",
        description: "Bilanz oder Einnahmen-Überschuss-Rechnung.",
      },
      {
        title: "Existenzgründung",
        description: "Rechtsform, Finanzamt, erste Schritte.",
      },
    ],
    process: {
      headline: "So läuft das Erstgespräch",
      steps: [
        {
          title: "Anrufen",
          text: "Wir vereinbaren einen Termin, in der Kanzlei oder am Telefon.",
        },
        {
          title: "Unterlagen",
          text: "Sie bekommen vorab eine kurze Liste, was wir sehen möchten.",
        },
        {
          title: "Gespräch",
          text: "Wir hören zu und sagen ehrlich, was wir für Sie tun können.",
        },
        {
          title: "Angebot",
          text: "Sie bekommen ein schriftliches Angebot. Ohne Verpflichtung.",
        },
      ],
    },
    team: {
      headline: "Ihr Team",
      members: [
        { name: "Henrike Brandt", role: "Steuerberaterin" },
        { name: "Mehmet Yıldız", role: "Steuerfachwirt" },
      ],
    },
    about:
      "Eine kleine Kanzlei in der Hildesheimer Innenstadt. Wir betreuen Angestellte, Rentner, Vermieter und Betriebe mit bis zu zwanzig Mitarbeitern.\n\nBelege nehmen wir auf Papier oder digital an, ganz wie es Ihnen lieber ist.",
    faq: [
      {
        question: "Was kostet die Steuererklärung?",
        answer:
          "Das richtet sich nach der Gebührenverordnung. Im Erstgespräch nennen wir Ihnen den Betrag.",
      },
      {
        question: "Muss ich in die Kanzlei kommen?",
        answer: "Nein. Belege gehen auch per Post oder digital.",
      },
      {
        question: "Helfen Sie auch Rentnern?",
        answer: "Ja, das ist ein großer Teil unserer Arbeit.",
      },
    ],
    google: false,
  },
  // Nacht (2026-10-12): Restaurant Weinberg, Salon Noir, Pension Haus am
  // See — Systemblatt 9–16 (docs/designsysteme/nacht), frei erfunden:
  // Rufnummern mit 555, Domains auf .example, keine echten Betriebe.
  weinberg: {
    contact: {
      street: "Weinstraße 12",
      zip: "67098",
      city: "Bad Dürkheim",
      phone: "06322 555 4718",
      email: "tisch@weinberg.example",
    },
    hours: [
      { day: "Mo", hours: "Ruhetag" },
      { day: "Di", hours: "Ruhetag" },
      { day: "Mi", hours: "17:30 – 23:00, Küche bis 21:30" },
      { day: "Do", hours: "17:30 – 23:00, Küche bis 21:30" },
      { day: "Fr", hours: "17:30 – 24:00, Küche bis 22:00" },
      { day: "Sa", hours: "17:30 – 24:00, Küche bis 22:00" },
      { day: "So", hours: "12:00 – 15:00, Küche bis 14:30" },
    ],
    hero: {
      headline: "Ein Abend, der bleibt.",
      subheadline:
        "Pfälzer Küche im Gewölbe des alten Weinguts. Sieben Gänge oder à la carte, dazu Rieslinge von nebenan.",
      ctaText: "Tisch reservieren",
      ctaHref: "https://tisch.weinberg.example/",
    },
    services: [],
    menu: {
      headline: "Die Karte",
      categories: [
        {
          name: "Vorspeisen",
          items: [
            {
              name: "Saibling aus dem Pfälzerwald",
              description: "Rote Bete, Meerrettich, Dill",
              price: "14,50",
            },
            {
              name: "Kürbissuppe",
              description: "geröstete Kerne, Kürbiskernöl",
              price: "9,00",
            },
            {
              name: "Kalbstatar",
              description: "Eigelb, Kapern, Brioche",
              price: "16,00",
            },
          ],
        },
        {
          name: "Hauptgänge",
          items: [
            {
              name: "Lammrücken vom Hof Berger",
              description: "Bohnen, Rosmarinjus",
              price: "32,00",
            },
            {
              name: "Zander",
              description: "Rieslingkraut, Speck, Kartoffelschaum",
              price: "28,00",
            },
            {
              name: "Pilzrisotto",
              description: "Bergkäse, Petersilienöl",
              price: "22,00",
            },
          ],
        },
        {
          name: "Zum Schluss",
          items: [
            {
              name: "Zwetschgen",
              description: "Mandel, Sauerrahmeis",
              price: "11,00",
            },
            {
              name: "Käse vom Hof Wolf",
              description: "Feigensenf, Früchtebrot",
              price: "14,00",
            },
          ],
        },
      ],
    },
    cta: {
      headline: "Tisch für heute Abend?",
      ctaText: "Online reservieren",
      ctaHref: "https://tisch.weinberg.example/",
    },
    about:
      "Im Gewölbe des alten Weinguts kochen wir mit dem, was die Pfalz gerade hergibt: Saibling aus dem Pfälzerwald, Lamm vom Hof Berger, Gemüse vom Markt.\n\nDazu Rieslinge und Spätburgunder von Winzern, die wir seit Jahren kennen. Sieben Gänge oder à la carte, jeder Gang auch vegetarisch.",
    faq: [
      {
        question: "Vegetarisch und vegan",
        answer:
          "Jeder Gang auch ohne Fleisch, bitte bei der Reservierung sagen.",
      },
      {
        question: "Hunde",
        answer: "Auf der Terrasse willkommen, im Gewölbe leider nicht.",
      },
      {
        question: "Barrierefrei",
        answer: "Gewölbe über Rampe erreichbar, WC ebenerdig.",
      },
      {
        question: "Parken",
        answer: "14 Plätze im Hof des Weinguts, abends frei.",
      },
    ],
    addFaq: true,
    google: { rating: 4.8, reviewCount: 312 },
    reviews: [
      {
        author: "Henrike S.",
        text: "Der Zander war das Beste, was ich dieses Jahr gegessen habe. Und man hat sich gemerkt, dass meine Frau keinen Koriander mag.",
      },
      {
        author: "Jonas W.",
        text: "Ruhiges Gewölbe, aufmerksamer Service und eine Weinbegleitung, die wirklich zu jedem Gang passt.",
      },
    ],
  },
  noir: {
    contact: {
      street: "Rotlintstraße 41",
      zip: "60316",
      city: "Frankfurt am Main",
      phone: "069 555 20931",
      email: "termin@salon-noir.example",
    },
    hours: [
      { day: "Mo", hours: "geschlossen" },
      { day: "Di–Fr", hours: "12:00 – 21:00" },
      { day: "Sa", hours: "9:00 – 16:00" },
      { day: "So", hours: "geschlossen" },
    ],
    hero: {
      headline: "Schnitt und Farbe am Abend.",
      subheadline:
        "Schnitt, Farbe und Balayage für Menschen, die tagsüber keine Zeit haben. Termine bis 21 Uhr, mitten im Nordend.",
    },
    services: [
      {
        title: "Damenschnitt",
        description: "Waschen, Schnitt, Föhnen",
        price: "ab 58 €",
      },
      { title: "Herrenschnitt", description: "mit Nackenrasur", price: "36 €" },
      {
        title: "Farbe",
        description: "Ansatz oder ganze Länge",
        price: "ab 72 €",
      },
      {
        title: "Balayage",
        description: "frei gemalte Strähnen, mit Pflege",
        price: "ab 140 €",
      },
      { title: "Föhnen und Styling", description: "", price: "28 €" },
      {
        title: "Hochsteckfrisur",
        description: "Hochzeit, Abend, Probetermin",
        price: "ab 65 €",
      },
    ],
    about:
      "Ein kleiner Salon im Nordend mit drei Plätzen und ruhigem Licht. Wir schneiden, färben und malen Balayage für Menschen, die tagsüber arbeiten — darum sind wir dienstags bis freitags bis 21 Uhr da.\n\nJeder Termin beginnt mit einem Gespräch über Haar, Alltag und Pflege. Was wir empfehlen, lässt sich zu Hause halten.",
    faq: [
      {
        question: "Absagen",
        answer: "Bis 24 Stunden vorher kostenlos, danach 50 % des Preises.",
      },
      { question: "Bezahlen", answer: "Karte, Apple Pay, bar." },
      { question: "Zugang", answer: "Erdgeschoss, eine Stufe am Eingang." },
    ],
    addFaq: true,
    drop: ["pricelist"],
    google: { rating: 4.9, reviewCount: 128 },
    reviews: [
      {
        author: "Meral A.",
        text: "Endlich ein Salon, in den ich nach der Arbeit gehen kann. Die Balayage sieht nach drei Monaten noch aus wie am ersten Tag.",
      },
      {
        author: "Lena K.",
        text: "Ruhig, ehrlich beraten und kein Verkaufsgespräch. Der Schnitt sitzt auch ohne Föhnen.",
      },
    ],
  },
  pension: {
    contact: {
      street: "Seestraße 3",
      zip: "82211",
      city: "Herrsching am Ammersee",
      phone: "08152 555 6630",
      email: "zimmer@haus-am-see.example",
    },
    hours: [
      { day: "Anreise", hours: "15:00 – 20:00" },
      { day: "Abreise", hours: "bis 11:00" },
      { day: "Frühstück", hours: "8:00 – 10:30" },
      { day: "Rezeption", hours: "8:00 – 20:00" },
    ],
    hero: {
      headline: "Sechs Zimmer am See.",
      subheadline:
        "Sechs Zimmer, ein Steg, Frühstück bis halb elf. Familiengeführt seit 1987, fünf Minuten vom Dampfersteg.",
    },
    services: [
      {
        title: "Seezimmer",
        description: "2 Personen · Balkon zum See",
        price: "ab 145 €/Nacht",
      },
      {
        title: "Turmzimmer",
        description: "2 Personen · Rundumblick, 3. Stock",
        price: "ab 165 €/Nacht",
      },
      {
        title: "Gartenzimmer",
        description: "2 Personen · Hund erlaubt",
        price: "ab 118 €/Nacht",
      },
      {
        title: "Bootshaus-Suite",
        description: "2 Personen · eigener Steg",
        price: "ab 220 €/Nacht",
      },
    ],
    about:
      "Familiengeführt seit 1987: sechs Zimmer direkt am Ammersee, ein eigener Steg und ein Garten bis ans Wasser.\n\nMorgens gibt es Frühstück bis halb elf, regional und auf Wunsch glutenfrei. Zum Dampfersteg sind es fünf Minuten zu Fuß.",
    faq: [
      {
        question: "Frühstück",
        answer: "Inklusive, regional, auf Wunsch auch glutenfrei.",
      },
      { question: "Hunde", answer: "Im Gartenzimmer, 15 € pro Nacht." },
      {
        question: "Kein Aufzug",
        answer: "Turmzimmer im 3. Stock nur über die Treppe.",
      },
      {
        question: "Ruderboot",
        answer: "Für Gäste kostenlos, Schwimmwesten im Bootshaus.",
      },
    ],
    addFaq: true,
    google: { rating: 4.9, reviewCount: 86 },
    reviews: [
      {
        author: "Familie Okafor",
        text: "Morgens mit dem Kaffee auf dem Steg, abends der Blick vom Turmzimmer. Wir kommen im Herbst wieder.",
      },
      {
        author: "Sabine R.",
        text: "Herzlich geführt, blitzsauber und ein Frühstück, für das man gern früh aufsteht.",
      },
    ],
  },
  // Freundlich (2026-10-13): Kita Pusteblume, Fellfreunde, Gelato Mio —
  // Systemblatt 10–18 (docs/designsysteme/freundlich), frei erfunden:
  // Rufnummern mit 555, Domains auf .example, keine echten Betriebe.
  pusteblume: {
    contact: {
      street: "Hemmstraße 12",
      zip: "28215",
      city: "Bremen-Findorff",
      phone: "0421 555 3102",
      email: "hallo@pusteblume.example",
    },
    hours: [
      { day: "Mo–Fr", hours: "7:30 – 16:30" },
      { day: "Sa", hours: "geschlossen" },
      { day: "So", hours: "geschlossen" },
    ],
    hero: {
      headline: "Klein, warm, mitten im Viertel.",
      subheadline:
        "Zwölf Kinder, vier Erzieherinnen und ein Garten mit Apfelbaum. Wir nehmen uns Zeit fürs Ankommen.",
    },
    services: [
      {
        title: "Eingewöhnung",
        description:
          "Nach dem Berliner Modell, zwei bis drei Wochen, immer mit Mama oder Papa.",
      },
      {
        title: "Tagesablauf",
        description:
          "Frühstück um 8:30, Morgenkreis, Spielen, Mittag um 11:30, Schlafen.",
      },
      {
        title: "Essen",
        description:
          "Bio-Mittagessen aus der Küche nebenan, vegetarisch an drei Tagen.",
      },
      {
        title: "Draußen",
        description:
          "Jeden Tag in den Garten, bei jedem Wetter. Matschhosen haben wir.",
      },
    ],
    about:
      "Seit 2011 betreuen wir in Findorff zwölf Kinder zwischen einem und drei Jahren, in einer Altbauwohnung mit Garten.\n\nWir sind klein, damit jedes Kind gesehen wird — und damit ihr als Eltern immer wisst, wen ihr morgens anruft.",
    stats: {
      headline: "Wir sind klein, damit jedes Kind gesehen wird.",
      items: [
        { value: "12", label: "Plätze, nie mehr" },
        { value: "1:3", label: "Betreuung im Alltag" },
        { value: "2011", label: "eröffnet in Findorff" },
      ],
    },
    process: {
      headline: "So läuft es ab",
      steps: [
        {
          title: "Kennenlernen",
          text: "Ihr schaut euch um, wir erzählen vom Alltag. Kinder dürfen mit.",
        },
        {
          title: "Anmeldung",
          text: "Ihr bekommt Bescheid, ob ein Platz frei wird, und den Vertrag.",
        },
        {
          title: "Eingewöhnung",
          text: "Mit euch, in kleinen Schritten, bis euer Kind sich wohlfühlt.",
        },
      ],
    },
    team: {
      headline: "Wer bei uns ist",
      members: [
        { name: "Anke Bremer", role: "Leitung, Erzieherin" },
        { name: "Tomás Reyes", role: "Erzieher" },
        { name: "Lea Wichmann", role: "Kinderpflegerin" },
      ],
    },
    faq: [
      {
        question: "Wie läuft die Eingewöhnung?",
        answer:
          "Nach dem Berliner Modell: die ersten Tage eine Stunde mit euch, dann werden die Zeiten länger. Rechnet mit zwei bis drei Wochen.",
      },
      {
        question: "Was kostet ein Platz?",
        answer:
          "Das richtet sich nach dem Einkommen und der Betreuungszeit. Wir rechnen es euch gern aus.",
      },
      {
        question: "Was muss mitgebracht werden?",
        answer: "Wechselkleidung, Hausschuhe, Matschhose und ein Kuscheltier.",
      },
    ],
    addFaq: true,
    google: false,
    reviews: [
      {
        author: "Jana K.",
        text: "Nach drei Wochen wollte unsere Tochter am liebsten dort übernachten.",
      },
      {
        author: "Mehmet und Sara",
        text: "Klein, herzlich und immer ehrlich zu uns Eltern.",
      },
      {
        author: "Familie Ott",
        text: "Die Eingewöhnung war entspannter als gedacht.",
      },
    ],
    cta: {
      headline: "Ein Platz für euer Kind?",
      ctaText: "Kennenlernen anfragen",
    },
    ctaAt: "end",
  },
  fellfreunde: {
    contact: {
      street: "Georg-Schumann-Straße 140",
      zip: "04159",
      city: "Leipzig-Gohlis",
      phone: "0341 555 7781",
      email: "wuff@fellfreunde.example",
    },
    hours: [
      { day: "Mo", hours: "geschlossen" },
      { day: "Di–Fr", hours: "9:00 – 18:00" },
      { day: "Sa", hours: "9:00 – 14:00" },
      { day: "So", hours: "geschlossen" },
    ],
    hero: {
      headline: "Frisch gebürstet, ganz entspannt.",
      subheadline:
        "Waschen, schneiden, Krallen kürzen. In Ruhe, ohne Käfig, mit Zeit zum Schnuppern.",
    },
    services: [
      {
        title: "Waschen und Föhnen",
        description: "Mildes Shampoo, warm geföhnt, Ohren sauber.",
        price: "ab 35 €",
      },
      {
        title: "Schneiden",
        description: "Rassetypisch oder pflegeleicht, ganz wie ihr wollt.",
        price: "ab 55 €",
      },
      {
        title: "Krallen und Pfoten",
        description: "Kürzen, Fell zwischen den Ballen, Pfotenbalsam.",
        price: "12 €",
      },
      {
        title: "Welpen-Kennenlernen",
        description: "Zwanzig Minuten Salon schnuppern, ohne Schere.",
        price: "20 €",
      },
    ],
    about:
      "Ein kleiner Salon in Gohlis mit zwei Tischen, einer Wanne und viel Zeit. Wir arbeiten ohne Boxen und ohne Zeitdruck — jeder Hund darf erst ankommen.\n\nÄngstliche Hunde planen wir mit mehr Pausen ein. Wenn es nicht geht, hören wir auf.",
    process: {
      headline: "So läuft es ab",
      steps: [
        {
          title: "Ankommen und schnuppern",
          text: "Euer Hund lernt uns kennen, bevor irgendwas passiert.",
        },
        {
          title: "Pflege in Ruhe",
          text: "Pausen, wenn er sie braucht. Keine Box, kein Zeitdruck.",
        },
        {
          title: "Abholen mit Foto",
          text: "Ihr bekommt ein Foto, sobald er fertig und trocken ist.",
        },
      ],
    },
    faq: [
      {
        question: "Mein Hund ist ängstlich. Geht das?",
        answer:
          "Ja. Wir planen mehr Zeit ein, machen Pausen und brechen ab, wenn es nicht geht. Das Kennenlernen kostet nichts extra.",
      },
      {
        question: "Wie lange dauert es?",
        answer:
          "Je nach Fell eine bis drei Stunden. Wir rufen an, wenn er fertig ist.",
      },
      {
        question: "Muss ich dableiben?",
        answer: "Nein. Ihr könnt ihn bringen und später abholen.",
      },
    ],
    addFaq: true,
    drop: ["pricelist"],
    google: { rating: 4.9, reviewCount: 86 },
    reviews: [
      {
        author: "Katrin L.",
        text: "Unser ängstlicher Balu geht inzwischen freiwillig rein. Das sagt alles.",
      },
      {
        author: "Thomas R.",
        text: "Pudelschnitt wie gewünscht, und sie haben sich Zeit genommen.",
      },
      { author: "Anja B.", text: "Endlich ein Salon ohne Käfige." },
    ],
    cta: { headline: "Termin für euren Hund?", ctaText: "Termin anfragen" },
    ctaAt: "end",
  },
  gelato: {
    contact: {
      street: "Rudolf-von-Bennigsen-Ufer 22",
      zip: "30173",
      city: "Hannover",
      phone: "0511 555 9024",
      email: "ciao@gelato-mio.example",
    },
    hours: [
      { day: "Mo–Fr", hours: "12:00 – 21:00" },
      { day: "Sa", hours: "11:00 – 22:00" },
      { day: "So", hours: "11:00 – 21:00" },
    ],
    hero: {
      headline: "Hausgemachtes Eis am Wasser.",
      subheadline:
        "Jeden Morgen frisch gerührt, mit Milch vom Hof Lindemann. Zum Mitnehmen oder auf der Terrasse.",
    },
    services: [],
    menu: {
      headline: "Was es bei uns gibt",
      categories: [
        {
          name: "Eis und mehr",
          items: [
            {
              name: "Eis in der Waffel",
              description: "Zwanzig Sorten, mindestens drei vegan.",
              price: "1,90 € je Kugel",
            },
            {
              name: "Becher",
              description: "Erdbeer, Spaghetti-Eis, Joghurt-Mango.",
              price: "ab 6,50 €",
            },
            {
              name: "Eistorten",
              description: "Auf Bestellung, drei Tage vorher.",
              price: "ab 32 €",
            },
            {
              name: "Kaffee",
              description: "Siebträger, Affogato mit einer Kugel.",
              price: "ab 2,40 €",
            },
          ],
        },
      ],
    },
    about:
      "Seit 2014 rühren wir jeden Morgen am Maschsee-Ufer frisch, mit Milch vom Hof Lindemann und Früchten der Saison.\n\nDrinnen sind zwanzig Plätze, draußen die Terrasse am Wasser. Mindestens drei Sorten sind immer vegan.",
    faq: [
      {
        question: "Habt ihr bei Regen geöffnet?",
        answer:
          "Ja, drinnen sind zwanzig Plätze. Nur bei Sturm schließen wir die Terrasse.",
      },
      {
        question: "Gibt es laktosefreie Sorten?",
        answer: "Ja, alle Sorbets und drei Sorten auf Hafermilch.",
      },
      {
        question: "Kann ich Eistorten bestellen?",
        answer: "Ja, drei Tage vorher per Telefon oder im Laden.",
      },
    ],
    addFaq: true,
    google: { rating: 4.7, reviewCount: 312 },
    reviews: [
      {
        author: "Lukas F.",
        text: "Das Pistazieneis schmeckt wie in Bologna, ehrlich.",
      },
      {
        author: "Selin Y.",
        text: "Netter Service, auch wenn die Schlange lang ist.",
      },
      {
        author: "Maren und Ole",
        text: "Die vegane Schoko ist besser als die normale.",
      },
    ],
    cta: { headline: "Bis gleich am Ufer.", ctaText: "Route planen" },
    ctaAt: "end",
  },
  // Plakat (2026-10-12): Barbier, Imbiss, Kurse — Systemblatt 8–11,
  // Bildsätze barbier/imbiss, Kontaktdaten fiktiv.
  barbier: {
    contact: {
      street: "Hafenstraße 12",
      zip: "48153",
      city: "Münster",
      phone: "0251 555 0182",
      email: "hallo@kante.example",
    },
    hours: [
      { day: "Mo–Fr", hours: "10:00 – 19:00" },
      { day: "Sa", hours: "9:00 – 15:00" },
      { day: "So", hours: "geschlossen" },
    ],
    hero: {
      headline: "Fade, Bart, fertig.",
      subheadline: "Herrenschnitte und Bartpflege an der Hafenstraße.",
    },
    services: [
      { title: "Haarschnitt", description: "Waschen, Schnitt, Styling." },
      {
        title: "Skin Fade",
        description: "Maschine bis auf die Haut, Übergang von Hand.",
      },
      { title: "Bart", description: "Kontur, Länge, Öl." },
      { title: "Rasur", description: "Klinge und zwei heiße Tücher." },
    ],
    pricelist: {
      headline: "Preise",
      categories: [
        {
          name: "Herren",
          items: [
            { name: "Haarschnitt", price: "28 €" },
            { name: "Skin Fade", price: "32 €" },
            { name: "Bart trimmen", price: "18 €" },
            { name: "Schnitt + Bart", price: "45 €" },
            { name: "Kinder bis 12", price: "22 €" },
          ],
        },
      ],
    },
    about:
      "Drei Stühle, ein Tresen, Musik in Zimmerlautstärke. Seit der Eröffnung schneiden wir an der Hafenstraße fast nur Herren und Bärte.\n\nWir nehmen uns Zeit fürs Gespräch vor dem Schnitt und sagen ehrlich, was zu deinem Haar passt.",
    faq: [
      {
        question: "Kann ich ohne Termin kommen?",
        answer: "Ja, wenn ein Stuhl frei ist. Mit Termin wartest du nicht.",
      },
      { question: "Wie bezahle ich?", answer: "Bar oder mit Karte." },
      {
        question: "Schneidet ihr auch Locken?",
        answer: "Ja, mit Schere und Zeit.",
      },
    ],
    addFaq: true,
    reviews: [
      {
        author: "Timo R.",
        text: "Schnell, sauber und freundlich. Bester Fade seit Jahren.",
      },
      {
        author: "Ali D.",
        text: "Bart sitzt endlich so, wie ich ihn will. Termin hat auf die Minute gepasst.",
      },
    ],
  },
  imbiss: {
    contact: {
      street: "Bahnhofstraße 3",
      zip: "33602",
      city: "Bielefeld",
      phone: "0521 555 0144",
      email: "bestellen@doener-ecke.example",
    },
    hours: [
      { day: "Mo", hours: "11:00 – 24:00" },
      { day: "Di–Sa", hours: "11:00 – 2:00" },
      { day: "So", hours: "12:00 – 23:00" },
    ],
    hero: {
      headline: "Döner Ecke",
      subheadline:
        "Döner, Dürüm und Pide aus dem Steinofen. Am Bahnhof, jeden Tag bis spät.",
    },
    services: [],
    about:
      "Seit Jahren am Bahnhof: Spieß von Hand geschichtet, Brot jeden Morgen aus dem Steinofen, Soßen nach eigenem Rezept.\n\nWer spät aus dem Zug steigt, bekommt bei uns noch etwas Warmes.",
    faq: [
      {
        question: "Liefert ihr?",
        answer: "Ja, im Umkreis von 3 km ab 15 € Bestellwert.",
      },
      {
        question: "Gibt es vegetarisch?",
        answer:
          "Halloumi im Brot, Pide mit Käse und Lahmacun ohne Fleisch auf Nachfrage.",
      },
    ],
    addFaq: true,
    reviews: [
      {
        author: "Selin K.",
        text: "Um eins noch warm, knusprig und riesig. Bester Döner am Bahnhof.",
      },
      {
        author: "Jonas P.",
        text: "Dürüm frisch gerollt, Soße hausgemacht, und das bis spät in die Nacht.",
      },
    ],
  },
  training: {
    contact: {
      street: "Kolpingstraße 8",
      zip: "93047",
      city: "Regensburg",
      phone: "0941 555 0127",
      email: "hallo@studio-puls.example",
    },
    hours: [
      { day: "Mo–Fr", hours: "6:30 – 21:00" },
      { day: "Sa", hours: "9:00 – 14:00" },
    ],
    hero: {
      headline: "Kurse ab 6:30",
      subheadline:
        "Kleine Gruppen, feste Trainer, ein Raum in der Altstadt. Die erste Stunde kostet nichts.",
    },
    services: [
      {
        title: "Kraftzirkel",
        description: "45 Minuten, Langhantel und Kettlebell.",
        price: "ab 12 €",
      },
      {
        title: "Rücken fit",
        description: "30 Minuten, in der Mittagspause.",
        price: "ab 9 €",
      },
      {
        title: "Yoga Flow",
        description: "60 Minuten, Matten sind da.",
        price: "ab 14 €",
      },
      {
        title: "Boxen",
        description: "60 Minuten, Handschuhe leihen wir.",
        price: "ab 14 €",
      },
      {
        title: "Probetraining",
        description: "Einmal, ohne Vertrag.",
        price: "0 €",
      },
    ],
    about:
      "Ein Raum, drei Trainer, höchstens zwölf Leute pro Kurs. Wir kennen deinen Namen und merken, wenn du fehlst.",
    faq: [
      {
        question: "Brauche ich Erfahrung?",
        answer: "Nein. Jede Übung gibt es in einer leichteren Fassung.",
      },
      {
        question: "Was muss ich mitbringen?",
        answer: "Hallenschuhe, Wasser und ein Handtuch.",
      },
    ],
    google: false,
    reviews: [
      {
        author: "Katja M.",
        text: "Kleine Gruppe, ehrliche Korrekturen. Nach drei Monaten ist mein Rücken ruhig.",
      },
    ],
  },
  // Werkstoff (2026-10-11): Handwerk, Bäckerei, Laden — Bildsätze aus
  // shared/industryImages.ts, Kontaktdaten fiktiv.
  schreinerei: {
    addFaq: true,
    contact: {
      street: "Huckarder Straße 21",
      zip: "44147",
      city: "Dortmund",
      phone: "0231 555 3180",
      email: "werkstatt@schreinerei-brandt.example",
    },
    hours: [
      { day: "Mo–Do", hours: "7:00 – 17:00" },
      { day: "Fr", hours: "7:00 – 15:00" },
    ],
    hero: {
      headline: "Gebaut, um zu bleiben.",
      subheadline:
        "Möbel, Küchen und Innenausbau nach Maß. Aus Eiche, Esche und Nussbaum.",
    },
    services: [
      {
        title: "Möbel nach Maß",
        description: "Tische, Schränke und Regale, passend für deinen Raum.",
      },
      {
        title: "Küchen",
        description: "Fronten aus Massivholz, Arbeitsplatten, Einbau vor Ort.",
      },
      {
        title: "Innenausbau",
        description: "Einbauschränke unter der Schräge, Treppen, Türen.",
      },
      {
        title: "Reparatur",
        description: "Alte Möbel aufarbeiten, Furnier ausbessern, neu ölen.",
      },
    ],
    process: {
      headline: "Vom Aufmaß bis zum Einbau",
      steps: [
        {
          title: "Aufmaß",
          text: "Wir kommen vorbei, messen und hören zu. Etwa eine Stunde.",
        },
        {
          title: "Entwurf",
          text: "Du bekommst eine Zeichnung und einen festen Preis.",
        },
        {
          title: "Einbau",
          text: "Wir bauen in der Werkstatt und bei dir ein. Meist vier bis sechs Wochen.",
        },
      ],
    },
    about:
      "Wir sind eine kleine Werkstatt in Dortmund-Huckarde: zwei Meister, ein Geselle, eine Auszubildende.\n\nWir arbeiten mit Holz aus der Region und bauen, was lange hält. Was wir zeichnen, bauen wir auch selbst ein.",
    faq: [
      {
        question: "Was kostet ein Möbel nach Maß?",
        answer:
          "Das hängt von Holz und Größe ab. Nach dem Aufmaß bekommst du einen festen Preis.",
      },
      {
        question: "Wie lange dauert es?",
        answer: "Meist vier bis sechs Wochen vom Entwurf bis zum Einbau.",
      },
      {
        question: "Arbeitet ihr auch mit eigenem Holz?",
        answer: "Ja, wenn es trocken genug ist. Wir schauen es uns vorher an.",
      },
    ],
    reviews: [
      {
        author: "Katrin S.",
        text: "Der Schrank unter der Dachschräge passt auf den Millimeter. Termin und Preis wurden genau eingehalten.",
      },
      {
        author: "Michael T.",
        text: "Unser alter Esstisch sieht aus wie neu. Ehrliche Beratung, saubere Arbeit.",
      },
    ],
  },
  maler: {
    addFaq: true,
    contact: {
      street: "Castroper Straße 148",
      zip: "44791",
      city: "Bochum",
      phone: "0234 555 2760",
      email: "info@maler-kowalski.example",
    },
    hours: [
      { day: "Mo–Do", hours: "7:00 – 16:30" },
      { day: "Fr", hours: "7:00 – 13:00" },
    ],
    hero: {
      headline: "Farbe, die hält.",
      subheadline:
        "Wände, Decken und Fassaden in Bochum. Sauber abgedeckt, pünktlich fertig.",
    },
    services: [
      {
        title: "Innenanstrich",
        description: "Wände und Decken streichen, Risse vorher ausbessern.",
      },
      {
        title: "Fassade",
        description:
          "Reinigen, grundieren, streichen. Mit Gerüst aus einer Hand.",
      },
      {
        title: "Tapezieren",
        description: "Raufaser, Vlies oder Mustertapete, Ecken auf Stoß.",
      },
      {
        title: "Spachteltechnik",
        description: "Glatte Wände in Q3/Q4 oder Kalkputz mit Struktur.",
      },
    ],
    process: {
      headline: "Vom Besichtigen bis zur Übergabe",
      steps: [
        {
          title: "Besichtigung",
          text: "Wir schauen uns die Räume an und beraten zu Farbe und Untergrund.",
        },
        {
          title: "Angebot",
          text: "Du bekommst einen festen Preis und einen Termin.",
        },
        {
          title: "Ausführung",
          text: "Wir decken ab, streichen und räumen danach wieder auf.",
        },
      ],
    },
    about:
      "Wir sind ein Meisterbetrieb in Bochum-Grumme: ein Malermeister, drei Gesellen, ein Azubi.\n\nWir arbeiten mit Farben ohne Lösemittel und kleben lieber einmal mehr ab. Nach uns ist der Raum fertig, nicht nur gestrichen.",
    faq: [
      {
        question: "Was kostet ein Zimmer streichen?",
        answer:
          "Das hängt von Fläche und Untergrund ab. Nach der Besichtigung bekommst du einen festen Preis.",
      },
      {
        question: "Muss ich die Möbel selbst rausräumen?",
        answer:
          "Nein. Wir rücken sie in die Mitte und decken alles ab. Zerbrechliches räumst du am besten vorher weg.",
      },
      {
        question: "Streicht ihr auch im Winter Fassaden?",
        answer:
          "Fassaden nur ab etwa acht Grad. Innen arbeiten wir das ganze Jahr.",
      },
    ],
    reviews: [
      {
        author: "Andrea P.",
        text: "Drei Zimmer in zwei Tagen, alles abgedeckt und sauber hinterlassen. Die Kanten sind wie gezogen.",
      },
      {
        author: "Thomas R.",
        text: "Die Fassade sieht aus wie neu. Termin und Preis wurden genau eingehalten.",
      },
    ],
  },
  gaertner: {
    addFaq: true,
    contact: {
      street: "Gievenbecker Weg 63",
      zip: "48161",
      city: "Münster",
      phone: "0251 555 8420",
      email: "garten@gruenwerk.example",
    },
    hours: [
      { day: "Mo–Fr", hours: "7:00 – 16:00" },
      { day: "Sa", hours: "nach Absprache" },
    ],
    hero: {
      headline: "Gärten, die wachsen dürfen.",
      subheadline:
        "Garten- und Landschaftsbau in Münster. Planung, Bau und Pflege aus einer Hand.",
    },
    services: [
      {
        title: "Gartengestaltung",
        description: "Beete, Wege und Sitzplätze, geplant für deinen Garten.",
      },
      {
        title: "Terrassen & Mauern",
        description: "Holz, Naturstein oder Pflaster, auf festem Unterbau.",
      },
      {
        title: "Rasen",
        description: "Rollrasen verlegen, Rasen neu anlegen oder sanieren.",
      },
      {
        title: "Gartenpflege",
        description:
          "Hecke schneiden, Laub räumen, Beete pflegen. Auch im Abo.",
      },
    ],
    process: {
      headline: "Vom ersten Rundgang bis zum fertigen Garten",
      steps: [
        {
          title: "Rundgang",
          text: "Wir gehen mit dir durch den Garten und hören zu. Etwa eine Stunde.",
        },
        {
          title: "Plan",
          text: "Du bekommst eine Skizze, eine Pflanzliste und einen festen Preis.",
        },
        {
          title: "Bau",
          text: "Wir bauen und pflanzen. Meist ein bis drei Wochen.",
        },
      ],
    },
    about:
      "Wir sind ein kleiner Betrieb in Münster-Gievenbeck: ein Gärtnermeister, drei Landschaftsgärtner, eine Auszubildende.\n\nWir pflanzen, was zum Boden passt, und bauen so, dass der Garten in zehn Jahren noch schöner ist als heute.",
    faq: [
      {
        question: "Wann ist die beste Zeit, einen Garten anzulegen?",
        answer:
          "Gepflanzt wird am besten im Frühjahr oder Herbst. Planen kannst du das ganze Jahr.",
      },
      {
        question: "Übernehmt ihr auch die Pflege?",
        answer:
          "Ja, einmalig oder regelmäßig. Viele Kunden buchen Heckenschnitt und Laub im Herbst.",
      },
      {
        question: "Entsorgt ihr den Grünschnitt?",
        answer: "Ja, wir nehmen alles mit und bringen es zur Kompostierung.",
      },
    ],
    reviews: [
      {
        author: "Claudia W.",
        text: "Aus unserem Rasenstück ist ein richtiger Garten geworden. Die Terrasse ist perfekt verlegt.",
      },
      {
        author: "Stefan H.",
        text: "Pünktlich, freundlich und alles sauber hinterlassen. Die Pflege im Herbst buchen wir jetzt jedes Jahr.",
      },
    ],
  },
  nagelstudio: {
    contact: {
      street: "Rüttenscheider Straße 87",
      zip: "45130",
      city: "Essen",
      phone: "0201 555 3091",
      email: "hallo@nagelatelier-lumi.example",
    },
    hours: [
      { day: "Mo", hours: "geschlossen" },
      { day: "Di–Fr", hours: "10:00 – 19:00" },
      { day: "Sa", hours: "9:00 – 15:00" },
    ],
    hero: {
      headline: "Nägel, die man gern ansieht.",
      subheadline:
        "Maniküre, Gel und Nageldesign in Essen-Rüttenscheid. Mit Termin, ohne Eile.",
    },
    services: [
      {
        title: "Maniküre",
        description: "Feilen, Nagelhaut pflegen, Lack nach Wahl.",
        price: "ab 32",
      },
      {
        title: "Gel & Shellac",
        description: "Hält drei bis vier Wochen, schonend abgelöst.",
        price: "ab 45",
      },
      {
        title: "Nageldesign",
        description: "French, Ombré oder kleine Motive, ganz wie du magst.",
        price: "ab 10",
      },
      {
        title: "Pediküre",
        description: "Fußbad, Hornhaut, Nägel. Im bequemen Sessel.",
        price: "ab 42",
      },
    ],
    pricelist: {
      headline: "Preisliste",
      categories: [
        {
          name: "Hände",
          items: [
            { name: "Maniküre mit Lack", price: "32" },
            { name: "Shellac", price: "45" },
            { name: "Gel-Modellage, neu", price: "65" },
            { name: "Gel auffüllen", price: "50" },
          ],
        },
        {
          name: "Füße",
          items: [
            { name: "Pediküre", price: "42" },
            { name: "Pediküre mit Shellac", price: "55" },
          ],
        },
      ],
    },
    about:
      "Wir sind zu zweit und haben drei Plätze. Jeder Termin hat genug Zeit, damit nichts schnell gehen muss.\n\nWir arbeiten mit Lacken ohne die üblichen Reizstoffe und desinfizieren jedes Werkzeug nach jeder Kundin.",
    faq: [
      {
        question: "Wie lange hält Shellac?",
        answer: "Meist drei bis vier Wochen. Danach lösen wir ihn schonend ab.",
      },
      {
        question: "Kann ich spontan vorbeikommen?",
        answer:
          "Manchmal ist ein Platz frei. Sicherer ist ein kurzer Anruf vorher.",
      },
      {
        question: "Macht ihr auch Nageldesign nach Foto?",
        answer: "Ja, bring dein Foto mit. Wir sagen dir vorher, was es kostet.",
      },
    ],
    addFaq: true,
    google: { rating: 4.9, reviewCount: 74 },
    reviews: [
      {
        author: "Selin K.",
        text: "Mein Shellac hält jetzt vier Wochen ohne Macke. Und das Studio ist richtig gemütlich.",
      },
      {
        author: "Mareike T.",
        text: "Sehr sauber, sehr genau, und man wird nie gehetzt.",
      },
    ],
  },
  sanitaer: {
    addFaq: true,
    contact: {
      street: "Kölner Straße 212",
      zip: "47805",
      city: "Krefeld",
      phone: "02151 555 6610",
      email: "service@haustechnik-yilmaz.example",
    },
    hours: [
      { day: "Mo–Do", hours: "7:30 – 17:00" },
      { day: "Fr", hours: "7:30 – 14:00" },
    ],
    hero: {
      headline: "Wasser läuft. Heizung läuft.",
      subheadline:
        "Sanitär und Heizung in Krefeld. Reparatur, neues Bad, neue Heizung.",
    },
    services: [
      {
        title: "Reparatur",
        description: "Tropfender Hahn, verstopfter Abfluss, undichte Leitung.",
      },
      {
        title: "Badsanierung",
        description: "Planung, Rohre, Fliesen, Einbau. Alles aus einer Hand.",
      },
      {
        title: "Heizung",
        description: "Wartung, Austausch, Wärmepumpe mit Förderantrag.",
      },
      {
        title: "Notdienst",
        description: "Rohrbruch am Wochenende? Ruf an, wir kommen.",
      },
    ],
    process: {
      headline: "Vom Anruf bis zum fertigen Bad",
      steps: [
        {
          title: "Anruf",
          text: "Du schilderst, was los ist. Bei Notfällen kommen wir am selben Tag.",
        },
        {
          title: "Besichtigung",
          text: "Wir schauen uns alles an und sagen ehrlich, was nötig ist.",
        },
        {
          title: "Angebot & Einbau",
          text: "Fester Preis, fester Termin. Danach räumen wir auf.",
        },
      ],
    },
    about:
      "Wir sind ein Meisterbetrieb in Krefeld-Bockum: zwei Meister, vier Gesellen, ein Azubi und zwei Kundendienstwagen.\n\nWir reparieren, bevor wir tauschen. Und wenn getauscht werden muss, erklären wir dir, warum.",
    faq: [
      {
        question: "Habt ihr einen Notdienst?",
        answer: "Ja, auch am Wochenende. Der Zuschlag steht vorher fest.",
      },
      {
        question: "Was kostet ein neues Bad?",
        answer:
          "Das hängt von Größe und Ausstattung ab. Nach der Besichtigung bekommst du einen festen Preis.",
      },
      {
        question: "Helft ihr beim Förderantrag für die Wärmepumpe?",
        answer:
          "Ja, wir bereiten die Unterlagen vor und sagen dir, was du einreichen musst.",
      },
    ],
    reviews: [
      {
        author: "Jürgen F.",
        text: "Samstagabend Rohrbruch, eine Stunde später war jemand da. Ruhig, sauber, fair abgerechnet.",
      },
      {
        author: "Nicole S.",
        text: "Unser neues Bad war in drei Wochen fertig. Genau wie besprochen.",
      },
    ],
  },
  reinigung: {
    addFaq: true,
    contact: {
      street: "Hansastraße 40",
      zip: "44137",
      city: "Dortmund",
      phone: "0231 555 9020",
      email: "anfrage@klarsicht-service.example",
    },
    hours: [
      { day: "Mo–Fr", hours: "7:00 – 18:00" },
      { day: "Sa", hours: "nach Absprache" },
    ],
    hero: {
      headline: "Sauber, bevor ihr kommt.",
      subheadline:
        "Büro-, Praxis- und Glasreinigung in Dortmund. Feste Teams, feste Zeiten.",
    },
    services: [
      {
        title: "Unterhaltsreinigung",
        description: "Büros und Praxen, täglich oder wöchentlich.",
      },
      {
        title: "Glas & Fenster",
        description: "Fenster, Rahmen, Schaufenster. Auch mit Hebebühne.",
      },
      {
        title: "Treppenhaus",
        description: "Für Hausverwaltungen, mit Reinigungsplan im Aushang.",
      },
      {
        title: "Grundreinigung",
        description: "Nach Umbau, Auszug oder einfach einmal richtig.",
      },
    ],
    process: {
      headline: "So starten wir",
      steps: [
        {
          title: "Begehung",
          text: "Wir schauen uns die Räume an und fragen, was dir wichtig ist.",
        },
        {
          title: "Angebot",
          text: "Du bekommst einen Festpreis pro Monat und einen Reinigungsplan.",
        },
        {
          title: "Festes Team",
          text: "Immer dieselben Leute, mit Schlüssel und Ansprechpartnerin.",
        },
      ],
    },
    about:
      "Wir reinigen seit vielen Jahren Büros, Praxen und Treppenhäuser in Dortmund und Umgebung. Unsere Teams sind fest angestellt und bleiben bei ihren Objekten.\n\nWenn etwas nicht passt, rufst du eine Person an, nicht eine Hotline.",
    faq: [
      {
        question: "Reinigt ihr auch abends oder früh morgens?",
        answer: "Ja. Wir richten uns nach euren Öffnungszeiten.",
      },
      {
        question: "Bringt ihr Mittel und Geräte mit?",
        answer: "Ja, alles. Auf Wunsch nur mit umweltfreundlichen Mitteln.",
      },
      {
        question: "Wie schnell könnt ihr anfangen?",
        answer: "Nach der Begehung meist innerhalb von zwei Wochen.",
      },
    ],
    reviews: [
      {
        author: "Praxis Dr. M.",
        text: "Seit zwei Jahren dasselbe Team, zuverlässig und gründlich. Wir müssen uns um nichts kümmern.",
      },
      {
        author: "Hausverwaltung K.",
        text: "Die Treppenhäuser sind jede Woche sauber, und Mängel werden sofort gemeldet.",
      },
    ],
  },
  hausreinigung: {
    addFaq: true,
    contact: {
      street: "Lindenthalgürtel 18",
      zip: "50935",
      city: "Köln",
      phone: "0221 555 4417",
      email: "hallo@sauberzeit.example",
    },
    hours: [
      { day: "Mo–Fr", hours: "8:00 – 18:00" },
      { day: "Sa", hours: "9:00 – 13:00" },
    ],
    hero: {
      headline: "Mehr Zeit für dich.",
      subheadline:
        "Haushaltsreinigung in Köln. Wöchentlich, alle zwei Wochen oder einmalig.",
    },
    services: [
      {
        title: "Regelmäßige Reinigung",
        description: "Bad, Küche, Böden, Staub. Immer dieselbe Person.",
      },
      {
        title: "Fenster putzen",
        description: "Innen und außen, Rahmen und Fensterbänke.",
      },
      {
        title: "Grundreinigung",
        description: "Vor dem Einzug, nach dem Auszug oder zum Frühjahr.",
      },
      {
        title: "Wäsche & Bügeln",
        description: "Waschen, aufhängen, bügeln. Auf Wunsch dazu.",
      },
    ],
    process: {
      headline: "So fangen wir an",
      steps: [
        {
          title: "Kennenlernen",
          text: "Wir kommen vorbei und schauen, was du brauchst. Etwa eine halbe Stunde.",
        },
        {
          title: "Fester Termin",
          text: "Du bekommst einen festen Wochentag und eine feste Reinigungskraft.",
        },
        {
          title: "Los geht's",
          text: "Du gibst den Schlüssel, wir kümmern uns. Kündbar jeden Monat.",
        },
      ],
    },
    about:
      "Wir sind ein kleiner Haushaltsservice in Köln-Lindenthal mit sechs festen Reinigungskräften. Alle sind angestellt und versichert.\n\nDu bekommst immer dieselbe Person, die deine Wohnung kennt und weiß, wo was hingehört.",
    faq: [
      {
        question: "Muss ich zu Hause sein?",
        answer:
          "Nein. Viele Kunden geben uns einen Schlüssel, er wird sicher verwahrt.",
      },
      {
        question: "Bringt ihr Putzmittel mit?",
        answer: "Ja. Wenn du eigene Mittel nutzen willst, nehmen wir die.",
      },
      {
        question: "Kann ich das von der Steuer absetzen?",
        answer:
          "Ja, als haushaltsnahe Dienstleistung. Du bekommst jeden Monat eine Rechnung dafür.",
      },
    ],
    reviews: [
      {
        author: "Julia R.",
        text: "Seit einem Jahr kommt jeden Dienstag Frau Petrović. Die Wohnung ist danach einfach schön.",
      },
      {
        author: "Markus und Lena",
        text: "Zuverlässig, freundlich und gründlich. Wir haben endlich die Wochenenden wieder.",
      },
    ],
  },
  hausarzt: {
    contact: {
      street: "Am Markt 7",
      zip: "26122",
      city: "Oldenburg",
      phone: "0441 555 2380",
      email: "praxis@dr-albers.example",
    },
    hours: [
      { day: "Mo", hours: "8:00 – 12:00, 15:00 – 18:00" },
      { day: "Di", hours: "8:00 – 12:00, 15:00 – 18:00" },
      { day: "Mi", hours: "8:00 – 12:00" },
      { day: "Do", hours: "8:00 – 12:00, 15:00 – 19:00" },
      { day: "Fr", hours: "8:00 – 12:00" },
      { day: "Sa", hours: "geschlossen" },
      { day: "So", hours: "geschlossen" },
    ],
    hero: {
      headline: "Ihre Hausarztpraxis in der Innenstadt.",
      subheadline:
        "Allgemeinmedizin für Erwachsene und Familien. Termine auch am Donnerstagabend.",
    },
    usp: ["Alle Kassen", "Privat"],
    services: [
      {
        title: "Vorsorge",
        description: "Check-up ab 35, Hautkrebs-Screening, Impfungen.",
      },
      {
        title: "Akute Beschwerden",
        description:
          "Infekte, Schmerzen, Krankschreibung. Offene Sprechstunde morgens.",
      },
      {
        title: "Chronische Erkrankungen",
        description:
          "Diabetes, Bluthochdruck, Asthma. Mit festen Kontrollterminen.",
      },
      {
        title: "Hausbesuche",
        description: "Für Patienten, die nicht in die Praxis kommen können.",
      },
    ],
    process: {
      headline: "Ihr erster Besuch",
      steps: [
        {
          title: "Anrufen",
          text: "Sagen Sie uns kurz, worum es geht. Wir nennen Ihnen einen Termin.",
        },
        {
          title: "Mitbringen",
          text: "Versichertenkarte, Medikamentenplan und, falls vorhanden, alte Befunde.",
        },
        {
          title: "Gespräch",
          text: "Wir nehmen uns Zeit für Ihre Vorgeschichte und Ihre Fragen.",
        },
      ],
    },
    team: {
      headline: "Ihr Team",
      members: [
        { name: "Dr. Hendrik Albers", role: "Facharzt für Allgemeinmedizin" },
        { name: "Dr. Mira Okafor", role: "Fachärztin für Innere Medizin" },
        { name: "Tanja Wübben", role: "Praxismanagerin" },
      ],
    },
    about:
      "Seit über zwanzig Jahren betreuen wir am Markt ganze Familien, oft über mehrere Generationen. Wir kennen unsere Patientinnen und Patienten und nehmen uns Zeit.\n\nDie Praxis ist barrierefrei, der Aufzug hält direkt vor der Tür.",
    faq: [
      {
        question: "Nehmen Sie neue Patienten auf?",
        answer: "Ja, solange es unsere Zeit zulässt. Rufen Sie einfach an.",
      },
      {
        question: "Gibt es eine offene Sprechstunde?",
        answer:
          "Ja, montags bis freitags von 8 bis 9 Uhr für akute Beschwerden, ohne Termin.",
      },
      {
        question: "Kann ich Rezepte vorbestellen?",
        answer: "Ja, telefonisch oder per E-Mail. Abholen am nächsten Werktag.",
      },
    ],
    google: { rating: 4.7, reviewCount: 138 },
    reviews: [
      {
        author: "Heike S.",
        text: "Dr. Albers hört zu und erklärt alles verständlich. Ich fühle mich hier gut aufgehoben.",
      },
      {
        author: "Ralf D.",
        text: "Morgens in der offenen Sprechstunde gewesen, nach einer halben Stunde wieder draußen.",
      },
    ],
  },
  apotheke: {
    contact: {
      street: "Lindenstraße 3",
      zip: "33602",
      city: "Bielefeld",
      phone: "0521 555 1704",
      email: "team@linden-apotheke.example",
    },
    hours: [
      { day: "Mo–Fr", hours: "8:00 – 19:00" },
      { day: "Sa", hours: "8:30 – 14:00" },
      { day: "So", hours: "geschlossen" },
    ],
    hero: {
      headline: "Beratung, die sich Zeit nimmt.",
      subheadline:
        "Ihre Apotheke an der Lindenstraße. Medikamente, Beratung und Botendienst.",
    },
    usp: ["E-Rezept", "Botendienst"],
    services: [
      {
        title: "Rezepte & E-Rezept",
        description:
          "Karte stecken, Medikamente mitnehmen. Fehlendes bis zum Nachmittag.",
      },
      {
        title: "Medikationsberatung",
        description: "Wir prüfen, ob Ihre Medikamente gut zusammenpassen.",
      },
      {
        title: "Botendienst",
        description: "Lieferung nach Hause, am selben Tag im Stadtgebiet.",
      },
      {
        title: "Messungen",
        description: "Blutdruck und Blutzucker, ohne Termin.",
      },
    ],
    process: {
      headline: "Medikamente vorbestellen",
      steps: [
        {
          title: "Anrufen oder schreiben",
          text: "Nennen Sie uns das Medikament oder senden Sie das E-Rezept.",
        },
        {
          title: "Wir bestellen",
          text: "Was nicht vorrätig ist, ist meist am Nachmittag da.",
        },
        {
          title: "Abholen oder liefern",
          text: "Sie holen es ab, oder unser Bote bringt es zu Ihnen.",
        },
      ],
    },
    team: {
      headline: "Ihr Team",
      members: [
        { name: "Sabine Kröger", role: "Apothekerin, Inhaberin" },
        { name: "Daniel Hoffmann", role: "Apotheker" },
        { name: "Lea Brinkmann", role: "PTA" },
      ],
    },
    about:
      "Die Linden-Apotheke gibt es seit 1958 an derselben Ecke. Wir kennen viele unserer Kundinnen und Kunden mit Namen und wissen, was sie brauchen.\n\nDer Eingang ist ebenerdig, und für längere Gespräche haben wir einen ruhigen Beratungsraum.",
    faq: [
      {
        question: "Kann ich ein E-Rezept bei Ihnen einlösen?",
        answer: "Ja, mit Ihrer Versichertenkarte oder über die App.",
      },
      {
        question: "Wie funktioniert der Botendienst?",
        answer:
          "Bestellen Sie bis 13 Uhr, dann liefern wir am selben Tag. Im Stadtgebiet kostenlos.",
      },
      {
        question: "Wer hat heute Notdienst?",
        answer: "Den aktuellen Notdienst finden Sie im Aushang an unserer Tür.",
      },
    ],
    google: { rating: 4.8, reviewCount: 96 },
    reviews: [
      {
        author: "Gisela M.",
        text: "Hier wird man noch richtig beraten. Und der Botendienst ist für mich ein Segen.",
      },
      {
        author: "Tim A.",
        text: "Medikament war nicht da, zwei Stunden später konnte ich es abholen.",
      },
    ],
  },
  ergotherapie: {
    contact: {
      street: "Bahnhofstraße 21",
      zip: "24937",
      city: "Flensburg",
      phone: "0461 555 3355",
      email: "praxis@ergo-hansen.example",
    },
    hours: [
      { day: "Mo–Do", hours: "8:00 – 18:00" },
      { day: "Fr", hours: "8:00 – 14:00" },
    ],
    hero: {
      headline: "Wieder selbst machen können.",
      subheadline:
        "Ergotherapie für Kinder und Erwachsene. Mit Rezept oder als Selbstzahler.",
    },
    usp: ["Alle Kassen", "Hausbesuche"],
    services: [
      {
        title: "Kinder",
        description: "Konzentration, Feinmotorik, Stifthaltung, Wahrnehmung.",
      },
      {
        title: "Nach Schlaganfall",
        description: "Alltagsbewegungen neu lernen, Schritt für Schritt.",
      },
      {
        title: "Handtherapie",
        description:
          "Nach Verletzung oder Operation, mit Schiene aus eigener Herstellung.",
      },
      {
        title: "Im Alter",
        description: "Selbstständig bleiben: Anziehen, Kochen, Gedächtnis.",
      },
    ],
    pricelist: {
      headline: "Für Selbstzahler",
      categories: [
        {
          name: "Je Behandlung",
          items: [
            { name: "Einzeltherapie, 45 Minuten", price: "48 €" },
            { name: "Handtherapie, 30 Minuten", price: "36 €" },
            { name: "Hausbesuch, Zuschlag", price: "15 €" },
          ],
        },
      ],
    },
    process: {
      headline: "Ihr erster Termin",
      steps: [
        {
          title: "Verordnung mitbringen",
          text: "Das Rezept vom Arzt. Ohne Rezept behandeln wir als Selbstzahler.",
        },
        {
          title: "Kennenlernen",
          text: "Wir fragen, was im Alltag schwerfällt, und setzen gemeinsam Ziele.",
        },
        {
          title: "Behandlung",
          text: "Meist einmal pro Woche. Mit Übungen für zu Hause.",
        },
      ],
    },
    team: {
      headline: "Ihr Team",
      members: [
        { name: "Kirsten Hansen", role: "Ergotherapeutin, Inhaberin" },
        { name: "Malte Jessen", role: "Handtherapie" },
        { name: "Aylin Çelik", role: "Pädiatrie" },
      ],
    },
    about:
      "Drei Behandlungsräume, eine kleine Übungsküche und ein Raum zum Toben für die Kinder. Wir üben, was im Alltag gebraucht wird.\n\nWer nicht in die Praxis kommen kann, den besuchen wir zu Hause oder im Pflegeheim.",
    faq: [
      {
        question: "Brauche ich ein Rezept?",
        answer:
          "Für die Kasse ja. Ohne Rezept zahlen Sie selbst, die Preise stehen oben.",
      },
      {
        question: "Kommen Sie auch nach Hause?",
        answer: "Ja, mit Verordnung für Hausbesuche, im Stadtgebiet Flensburg.",
      },
      {
        question: "Ab welchem Alter behandeln Sie Kinder?",
        answer: "Ab etwa drei Jahren. Eltern sind beim ersten Termin dabei.",
      },
    ],
    addFaq: true,
    google: false,
  },
  logopaedie: {
    contact: {
      street: "Podbielskistraße 98",
      zip: "30177",
      city: "Hannover",
      phone: "0511 555 6620",
      email: "praxis@logo-kleefeld.example",
    },
    hours: [
      { day: "Mo–Do", hours: "8:00 – 18:30" },
      { day: "Fr", hours: "8:00 – 13:00" },
    ],
    hero: {
      headline: "Gut gesprochen. Gut verstanden.",
      subheadline:
        "Logopädie für Kinder und Erwachsene in Hannover. Sprache, Sprechen, Stimme, Schlucken.",
    },
    usp: ["Alle Kassen", "Hausbesuche"],
    services: [
      {
        title: "Kinder",
        description:
          "Aussprache, Wortschatz, Satzbau. Mit Spielen statt Druck.",
      },
      {
        title: "Stottern",
        description: "Für Kinder und Erwachsene, mit Übungen für den Alltag.",
      },
      {
        title: "Stimme",
        description: "Für Heiserkeit und alle, die beruflich viel sprechen.",
      },
      {
        title: "Nach Schlaganfall",
        description: "Sprachstörungen und Schlucken, auch als Hausbesuch.",
      },
    ],
    pricelist: {
      headline: "Für Selbstzahler",
      categories: [
        {
          name: "Je Behandlung",
          items: [
            { name: "Therapie, 45 Minuten", price: "52 €" },
            { name: "Therapie, 30 Minuten", price: "38 €" },
            { name: "Stimmtraining, 60 Minuten", price: "68 €" },
          ],
        },
      ],
    },
    process: {
      headline: "Ihr erster Termin",
      steps: [
        {
          title: "Verordnung mitbringen",
          text: "Das Rezept vom Kinder- oder Hausarzt. Ohne Rezept als Selbstzahler.",
        },
        {
          title: "Befund",
          text: "Wir hören genau hin und schauen, wo es hakt. Etwa eine Stunde.",
        },
        {
          title: "Therapie",
          text: "Ein- bis zweimal pro Woche, mit kleinen Übungen für zu Hause.",
        },
      ],
    },
    team: {
      headline: "Ihr Team",
      members: [
        { name: "Anna Kleefeld", role: "Logopädin, Inhaberin" },
        { name: "Jan-Ole Riemer", role: "Logopäde, Stimme" },
        { name: "Sarah Nowak", role: "Logopädin, Kinder" },
      ],
    },
    about:
      "Unsere Praxis in der List hat zwei helle Therapieräume und eine Spielecke im Wartebereich. Kinder lernen bei uns mit Bildern, Spielen und Bewegung.\n\nErwachsene behandeln wir in Ruhe, auf Wunsch auch zu Hause.",
    faq: [
      {
        question: "Brauche ich ein Rezept?",
        answer:
          "Für die Kasse ja. Ohne Rezept zahlen Sie selbst, die Preise stehen oben.",
      },
      {
        question: "Dürfen Eltern bei der Therapie dabei sein?",
        answer: "Ja, gerade am Anfang. So können Sie zu Hause gut mitüben.",
      },
      {
        question: "Wie lange dauert eine Therapie?",
        answer:
          "Meist zehn bis zwanzig Termine. Wir sprechen regelmäßig über den Stand.",
      },
    ],
    addFaq: true,
    google: false,
  },
  architekt: {
    contact: {
      street: "Ludgeristraße 56",
      zip: "48143",
      city: "Münster",
      phone: "0251 555 7140",
      email: "buero@hollmann-architekten.example",
    },
    hours: [{ day: "Mo–Fr", hours: "9:00 – 17:30" }],
    hero: {
      headline: "Häuser, die zu ihren Menschen passen.",
      subheadline:
        "Architekturbüro in Münster. Neubau, Umbau und Sanierung, vom Entwurf bis zum Einzug.",
    },
    services: [
      {
        title: "Neubau",
        description:
          "Einfamilienhäuser und kleine Mehrfamilienhäuser, energieeffizient geplant.",
      },
      {
        title: "Umbau & Anbau",
        description: "Mehr Platz im Bestand, mit Blick auf Statik und Budget.",
      },
      {
        title: "Sanierung",
        description: "Altbauten energetisch erneuern, mit Fördermitteln.",
      },
      {
        title: "Bauleitung",
        description: "Wir koordinieren die Gewerke und sind auf der Baustelle.",
      },
    ],
    process: {
      headline: "So arbeiten wir zusammen",
      steps: [
        {
          title: "Erstgespräch",
          text: "Sie erzählen von Ihren Wünschen, wir schauen uns das Grundstück an.",
        },
        {
          title: "Entwurf",
          text: "Skizzen, Grundrisse und eine erste Kostenschätzung.",
        },
        {
          title: "Genehmigung",
          text: "Wir reichen den Bauantrag ein und klären Fragen mit dem Amt.",
        },
        {
          title: "Bau",
          text: "Ausschreibung, Bauleitung und Abnahme bis zum Einzug.",
        },
      ],
    },
    about:
      "Wir sind ein Büro mit sechs Architektinnen und Architekten im Kreuzviertel. Seit 2004 planen wir Wohnhäuser in Münster und im Münsterland.\n\nWir bauen lieber gut als groß: mit hellen Räumen, regionalen Materialien und Kosten, die vorher feststehen.",
    faq: [
      {
        question: "Was kostet ein Architekt?",
        answer:
          "Das Honorar richtet sich nach der HOAI und den Baukosten. Im Erstgespräch nennen wir Ihnen eine Größenordnung.",
      },
      {
        question: "Lohnt sich ein Architekt auch für einen Umbau?",
        answer:
          "Meist ja. Wir sehen Probleme früh und helfen beim Förderantrag.",
      },
      {
        question: "Wie lange dauert es bis zur Baugenehmigung?",
        answer: "In Münster meist drei bis sechs Monate nach dem Antrag.",
      },
    ],
    google: { rating: 4.9, reviewCount: 31 },
    reviews: [
      {
        author: "Familie Terhorst",
        text: "Aus unserem alten Bauernhaus ist ein helles Zuhause geworden. Die Kosten wurden eingehalten.",
      },
      {
        author: "Dr. Christine L.",
        text: "Gute Ideen, ehrliche Beratung und eine Bauleitung, die wirklich da war.",
      },
    ],
  },
  innenarchitekt: {
    contact: {
      street: "Gärtnerplatz 4",
      zip: "80469",
      city: "München",
      phone: "089 555 2271",
      email: "studio@raumform.example",
    },
    hours: [{ day: "Mo–Fr", hours: "10:00 – 18:00" }],
    hero: {
      headline: "Räume, in denen man bleiben will.",
      subheadline:
        "Innenarchitektur für Wohnungen, Praxen und kleine Läden in München.",
    },
    services: [
      {
        title: "Wohnräume",
        description:
          "Grundriss, Licht, Farben und Möbel, aufeinander abgestimmt.",
      },
      {
        title: "Küche & Bad",
        description: "Planung bis ins Detail, mit Handwerkern aus der Region.",
      },
      {
        title: "Praxis & Laden",
        description: "Räume, die gut funktionieren und gut aussehen.",
      },
      {
        title: "Beratung vor Ort",
        description: "Zwei Stunden, ein Plan, klare Empfehlungen.",
      },
    ],
    process: {
      headline: "So entsteht Ihr Raum",
      steps: [
        {
          title: "Kennenlernen",
          text: "Wir besuchen Sie, messen auf und hören zu, wie Sie leben.",
        },
        {
          title: "Konzept",
          text: "Moodboard, Grundriss und Materialproben zum Anfassen.",
        },
        {
          title: "Umsetzung",
          text: "Wir bestellen, koordinieren und sind beim Einbau dabei.",
        },
      ],
    },
    about:
      "Studio Raumform sind zwei Innenarchitektinnen und ein Schreiner im Glockenbachviertel. Wir planen Räume, die zu den Menschen darin passen.\n\nMaterialien und Stoffe suchen wir mit Ihnen gemeinsam aus, in unserem Studio mit über 300 Mustern.",
    faq: [
      {
        question: "Was kostet eine Beratung?",
        answer:
          "Die Beratung vor Ort kostet pauschal 280 Euro. Wird daraus ein Auftrag, rechnen wir sie an.",
      },
      {
        question: "Arbeiten Sie auch mit vorhandenen Möbeln?",
        answer: "Gern. Gute Stücke behalten wir und planen um sie herum.",
      },
      {
        question: "Wie lange dauert ein Projekt?",
        answer:
          "Eine Wohnung meist drei bis vier Monate vom Konzept bis zum Einzug.",
      },
    ],
    google: { rating: 5.0, reviewCount: 27 },
    reviews: [
      {
        author: "Katharina W.",
        text: "Unsere kleine Altbauwohnung wirkt jetzt doppelt so groß. Jede Ecke ist durchdacht.",
      },
      {
        author: "Praxis Dr. Huber",
        text: "Patienten sagen uns ständig, wie angenehm das Wartezimmer ist.",
      },
    ],
  },
  reisebuero: {
    contact: {
      street: "Ostenstraße 11",
      zip: "93047",
      city: "Regensburg",
      phone: "0941 555 8812",
      email: "reisen@fernweh-reisebuero.example",
    },
    hours: [
      { day: "Mo–Fr", hours: "9:30 – 18:30" },
      { day: "Sa", hours: "10:00 – 13:00" },
    ],
    hero: {
      headline: "Urlaub, der zu Ihnen passt.",
      subheadline:
        "Persönliche Reiseberatung in Regensburg. Pauschal, individuell oder als Rundreise.",
    },
    services: [
      {
        title: "Pauschalreisen",
        description:
          "Flug und Hotel zum Festpreis, von allen großen Veranstaltern.",
      },
      {
        title: "Rundreisen",
        description: "Selbst gefahren oder geführt, Route nach Ihren Wünschen.",
      },
      {
        title: "Kreuzfahrten",
        description:
          "Fluss und Meer, mit ehrlicher Beratung zur passenden Reederei.",
      },
      {
        title: "Gruppenreisen",
        description: "Für Vereine, Firmen und Familien, alles organisiert.",
      },
    ],
    process: {
      headline: "So planen wir Ihre Reise",
      steps: [
        {
          title: "Beratung",
          text: "Im Büro oder am Telefon. Sie erzählen, wir fragen nach.",
        },
        {
          title: "Angebote",
          text: "Zwei, drei passende Vorschläge mit allen Preisen.",
        },
        {
          title: "Buchung",
          text: "Wir buchen, schicken die Unterlagen und sind auch unterwegs erreichbar.",
        },
      ],
    },
    about:
      "Wir sind seit 1996 in der Ostenstraße und haben selbst viele der Ziele bereist, die wir verkaufen. Deshalb können wir sagen, welches Hotel wirklich ruhig ist.\n\nGeht unterwegs etwas schief, rufen Sie uns an, nicht eine Hotline.",
    faq: [
      {
        question: "Ist eine Buchung im Reisebüro teurer?",
        answer:
          "Nein. Sie zahlen denselben Preis wie beim Veranstalter, die Beratung ist inklusive.",
      },
      {
        question: "Brauche ich einen Termin?",
        answer:
          "Nicht unbedingt. Für längere Beratungen ist ein Termin aber besser.",
      },
      {
        question: "Was passiert, wenn mein Flug ausfällt?",
        answer:
          "Rufen Sie uns an. Wir kümmern uns um Umbuchung und Erstattung.",
      },
    ],
    google: { rating: 4.8, reviewCount: 112 },
    reviews: [
      {
        author: "Brigitte und Hans F.",
        text: "Die Rundreise durch Portugal war perfekt geplant. Jedes Hotel ein Treffer.",
      },
      {
        author: "Stefanie R.",
        text: "Als unser Flug ausfiel, hatte Frau Lehner innerhalb einer Stunde eine Lösung.",
      },
    ],
  },
  yoga: {
    contact: {
      street: "Bremer Platz 9",
      zip: "48155",
      city: "Münster",
      phone: "0251 555 3360",
      email: "namaste@yogaraum-ost.example",
    },
    hours: [
      { day: "Mo–Fr", hours: "7:00 – 21:00" },
      { day: "Sa–So", hours: "9:00 – 13:00" },
    ],
    hero: {
      headline: "Atmen. Ankommen. Dehnen.",
      subheadline:
        "Yoga in kleinen Gruppen im Ostviertel. Die erste Stunde kostet nichts.",
    },
    services: [
      {
        title: "Hatha Yoga",
        description: "75 Minuten, ruhig und für alle Level.",
        price: "ab 15 €",
      },
      {
        title: "Vinyasa Flow",
        description: "60 Minuten, fließend und kräftigend.",
        price: "ab 15 €",
      },
      {
        title: "Yin & Entspannung",
        description: "75 Minuten, lange Haltungen, viel Ruhe.",
        price: "ab 15 €",
      },
      {
        title: "Rückenyoga",
        description: "60 Minuten, sanft, auch mit Beschwerden.",
        price: "ab 13 €",
      },
      {
        title: "Probestunde",
        description: "Einmal, ohne Vertrag.",
        price: "0 €",
      },
    ],
    about:
      "Ein heller Raum mit Holzboden, höchstens vierzehn Matten. Matten, Blöcke und Decken sind da, du brauchst nur dich.\n\nUnsere Lehrerinnen unterrichten seit vielen Jahren und zeigen jede Haltung auch in einer leichteren Fassung.",
    faq: [
      {
        question: "Ich bin nicht beweglich. Geht das trotzdem?",
        answer: "Ja. Genau dafür ist Yoga da. Jede Haltung gibt es leichter.",
      },
      {
        question: "Was muss ich mitbringen?",
        answer: "Bequeme Kleidung und etwas zu trinken. Matten haben wir.",
      },
    ],
    google: false,
    reviews: [
      {
        author: "Miriam K.",
        text: "Nach einem Bürotag ist die Abendstunde hier mein Lieblingsort. Ruhig, freundlich, ohne Leistungsdruck.",
      },
    ],
  },
  pilates: {
    contact: {
      street: "Brückenstraße 14",
      zip: "01097",
      city: "Dresden",
      phone: "0351 555 7703",
      email: "hallo@pilates-loft.example",
    },
    hours: [
      { day: "Mo–Fr", hours: "7:00 – 20:30" },
      { day: "Sa", hours: "9:00 – 13:00" },
    ],
    hero: {
      headline: "Stark aus der Mitte.",
      subheadline:
        "Pilates auf der Matte und am Reformer in der Dresdner Neustadt. Höchstens acht pro Kurs.",
    },
    services: [
      {
        title: "Reformer Basics",
        description: "50 Minuten, Einstieg am Gerät.",
        price: "ab 26 €",
      },
      {
        title: "Reformer Flow",
        description: "50 Minuten, für alle mit Erfahrung.",
        price: "ab 26 €",
      },
      {
        title: "Matten-Pilates",
        description: "55 Minuten, Kraft und Haltung ohne Gerät.",
        price: "ab 16 €",
      },
      {
        title: "Einzelstunde",
        description: "Ganz nach deinem Körper, auch nach Verletzung.",
        price: "ab 65 €",
      },
      {
        title: "Probestunde",
        description: "Einmal am Reformer, ohne Vertrag.",
        price: "19 €",
      },
    ],
    about:
      "Ein Loft mit acht Reformern, viel Licht und Lehrerinnen mit langer Ausbildung. Wir korrigieren genau und erklären, warum.\n\nPilates stärkt Rücken, Beckenboden und Haltung. Viele kommen nach einer Physiotherapie zu uns.",
    faq: [
      {
        question: "Brauche ich Vorerfahrung für den Reformer?",
        answer:
          "Nein. Starte mit Reformer Basics, dort lernst du das Gerät kennen.",
      },
      {
        question: "Was muss ich mitbringen?",
        answer:
          "Bequeme Kleidung und rutschfeste Socken. Die gibt es auch bei uns.",
      },
    ],
    google: false,
    reviews: [
      {
        author: "Johanna B.",
        text: "Nach drei Monaten Reformer sind meine Rückenschmerzen weg. Die Lehrerinnen sehen jede Kleinigkeit.",
      },
    ],
  },
  fahrschule: {
    contact: {
      street: "Kaiserstraße 120",
      zip: "76133",
      city: "Karlsruhe",
      phone: "0721 555 4480",
      email: "info@fahrschule-becker.example",
    },
    hours: [
      { day: "Mo–Do", hours: "14:00 – 18:30" },
      { day: "Fr", hours: "14:00 – 17:00" },
    ],
    hero: {
      headline: "Führerschein ohne Umwege.",
      subheadline:
        "Klasse B, A und BE in Karlsruhe. Theorie zweimal pro Woche, Fahrstunden auch am Samstag.",
    },
    services: [
      {
        title: "Klasse B",
        description: "Auto, auch mit Automatik-Schlüsselzahl.",
        price: "Grundbetrag 390 €",
      },
      {
        title: "Fahrstunde",
        description: "45 Minuten, in der Stadt oder auf der Autobahn.",
        price: "65 €",
      },
      {
        title: "Klasse A & A2",
        description: "Motorrad, mit Übungsplatz und Leihkleidung.",
        price: "Grundbetrag 420 €",
      },
      {
        title: "Klasse BE",
        description: "Anhänger, an einem Wochenende.",
        price: "ab 580 €",
      },
      {
        title: "Intensivkurs",
        description: "Theorie in zwei Wochen, in den Ferien.",
        price: "auf Anfrage",
      },
    ],
    about:
      "Vier Fahrlehrer, fünf Autos und zwei Motorräder. Wir kennen die Prüfstrecken in Karlsruhe und üben genau dort.\n\nWer nervös ist, bekommt bei uns mehr Zeit. Bestehen ist wichtiger als schnell sein.",
    faq: [
      {
        question: "Was kostet der Führerschein insgesamt?",
        answer:
          "Das hängt von der Zahl der Fahrstunden ab. Im Beratungsgespräch rechnen wir es dir ehrlich aus.",
      },
      {
        question: "Ab wann kann ich anfangen?",
        answer:
          "Mit Theorie jederzeit. Fahren darfst du ab 16,5 Jahren für das begleitete Fahren.",
      },
    ],
    google: false,
    reviews: [
      {
        author: "Lukas M.",
        text: "Beim ersten Mal bestanden. Herr Becker bleibt auch bei Fehlern total ruhig.",
      },
    ],
  },
  hebamme: {
    contact: {
      street: "Wilhelmshöher Allee 141",
      zip: "34121",
      city: "Kassel",
      phone: "0561 555 2049",
      email: "hallo@nestwaerme.example",
    },
    hours: [
      { day: "Mo–Do", hours: "9:00 – 16:00" },
      { day: "Fr", hours: "9:00 – 13:00" },
      { day: "Sa", hours: "Kurse nach Plan" },
    ],
    hero: {
      headline: "Gut begleitet, vom ersten Ultraschall an.",
      subheadline:
        "Drei Hebammen in Kassel-Wehlheiden. Vorsorge, Kurse und Wochenbett bei euch zu Hause.",
    },
    services: [
      {
        title: "Schwangerenvorsorge",
        description:
          "Im Wechsel mit eurer Frauenärztin, in Ruhe und mit Zeit für Fragen.",
      },
      {
        title: "Geburtsvorbereitung",
        description:
          "Für Paare oder nur für Frauen, als Abend- oder Wochenendkurs.",
      },
      {
        title: "Wochenbett",
        description:
          "Hausbesuche nach der Geburt, Stillberatung, Gewicht und Nabel.",
      },
      {
        title: "Rückbildung",
        description: "Ab acht Wochen nach der Geburt, Baby darf mit.",
      },
    ],
    about:
      "Wir sind drei Hebammen mit zusammen über vierzig Jahren Erfahrung. In unseren Räumen gibt es Kurse und Sprechstunden, im Wochenbett kommen wir zu euch.\n\nMeldet euch früh, am besten in den ersten Wochen der Schwangerschaft. Dann haben wir sicher Zeit für euch.",
    stats: {
      headline: "Wir begleiten euch, von Anfang an.",
      items: [
        { value: "3", label: "Hebammen im Team" },
        { value: "12", label: "Wochen Wochenbett-Betreuung" },
        { value: "2009", label: "gegründet in Wehlheiden" },
      ],
    },
    process: {
      headline: "So läuft es ab",
      steps: [
        {
          title: "Melden",
          text: "Ruft an oder schreibt uns, sobald ihr wisst, dass ihr schwanger seid.",
        },
        {
          title: "Kennenlernen",
          text: "Ein erstes Treffen bei uns. Wir besprechen, was ihr euch wünscht.",
        },
        {
          title: "Begleitung",
          text: "Vorsorge, Kurs, und nach der Geburt kommen wir zu euch nach Hause.",
        },
      ],
    },
    team: {
      headline: "Wer bei uns ist",
      members: [
        { name: "Birte Sommerfeld", role: "Hebamme, Gründerin" },
        { name: "Yasemin Arslan", role: "Hebamme, Stillberaterin" },
        { name: "Clara Hein", role: "Hebamme" },
      ],
    },
    faq: [
      {
        question: "Wann sollten wir uns melden?",
        answer:
          "So früh wie möglich, am besten in den ersten zwölf Wochen. Hebammen sind oft lange im Voraus ausgebucht.",
      },
      {
        question: "Zahlt die Krankenkasse?",
        answer:
          "Ja. Vorsorge, Kurse und Wochenbett zahlt die gesetzliche Kasse. Nur der Partnerbeitrag im Kurs kostet extra.",
      },
      {
        question: "Kommt ihr auch nach einem Kaiserschnitt?",
        answer: "Ja, natürlich. Die Wochenbett-Besuche sind genauso.",
      },
    ],
    addFaq: true,
    google: false,
    reviews: [
      {
        author: "Lisa und Jonas",
        text: "Birte hat uns durch das erste Wochenbett getragen. Jede Frage durfte gestellt werden.",
      },
      {
        author: "Merve A.",
        text: "Der Geburtsvorbereitungskurs hat mir so viel Angst genommen. Danke!",
      },
    ],
  },
  tierarzt: {
    contact: {
      street: "Parkallee 33",
      zip: "28209",
      city: "Bremen",
      phone: "0421 555 6090",
      email: "praxis@tierarzt-stadtpark.example",
    },
    hours: [
      { day: "Mo–Fr", hours: "9:00 – 12:00, 15:00 – 19:00" },
      { day: "Sa", hours: "10:00 – 12:00" },
      { day: "So", hours: "Notdienst nach Anruf" },
    ],
    hero: {
      headline: "In guten Händen, von Kopf bis Pfote.",
      subheadline:
        "Kleintierpraxis für Hunde, Katzen und Kaninchen. In Ruhe, mit Zeit zum Ankommen.",
    },
    services: [
      {
        title: "Vorsorge & Impfung",
        description:
          "Jährlicher Check, Impfungen, Entwurmung, Heimtierausweis.",
      },
      {
        title: "Untersuchung",
        description: "Wenn euer Tier nicht frisst, humpelt oder sich kratzt.",
      },
      {
        title: "Zahnpflege",
        description: "Zahnstein entfernen in leichter Narkose.",
      },
      {
        title: "Kastration",
        description: "Für Katze, Kater, Hündin und Rüde, mit Nachkontrolle.",
      },
    ],
    about:
      "Unsere Praxis liegt direkt am Bürgerpark. Hunde und Katzen warten bei uns getrennt, damit alle ruhig bleiben.\n\nWir nehmen uns Zeit, erklären jede Behandlung und sagen euch vorher, was sie kostet.",
    process: {
      headline: "So läuft euer Besuch",
      steps: [
        {
          title: "Termin machen",
          text: "Ruft an oder schreibt uns. Bei Notfällen kommt sofort.",
        },
        {
          title: "Ankommen",
          text: "Euer Tier darf erst schnuppern. Leckerli gibt es am Tisch.",
        },
        {
          title: "Untersuchung",
          text: "Wir erklären, was wir sehen, und nennen die Kosten vorher.",
        },
      ],
    },
    faq: [
      {
        question: "Was tun im Notfall?",
        answer:
          "Ruft an, auch am Wochenende. Wir sagen euch, ob ihr sofort kommen solltet.",
      },
      {
        question: "Was kostet eine Impfung?",
        answer:
          "Das richtet sich nach der Gebührenordnung. Wir nennen euch den Preis vorher.",
      },
      {
        question: "Kann ich mein ängstliches Tier mitbringen?",
        answer:
          "Ja. Sagt uns Bescheid, dann planen wir mehr Zeit und einen ruhigen Termin ein.",
      },
    ],
    addFaq: true,
    drop: ["pricelist"],
    google: { rating: 4.9, reviewCount: 143 },
    reviews: [
      {
        author: "Sandra P.",
        text: "Unsere Katze hasst Tierarztbesuche. Hier war sie ganz ruhig, weil sich alle Zeit genommen haben.",
      },
      {
        author: "Michael B.",
        text: "Sonntags angerufen, sofort Hilfe bekommen. Wir sind sehr dankbar.",
      },
    ],
    cta: { headline: "Termin für euer Tier?", ctaText: "Termin anfragen" },
    ctaAt: "end",
  },
  baeckerei: {
    contact: {
      street: "Zunftgasse 6",
      zip: "86150",
      city: "Augsburg",
      phone: "0821 555 2610",
      email: "hallo@baeckerei-steinofen.example",
    },
    hours: [
      { day: "Mo–Fr", hours: "6:00 – 18:00" },
      { day: "Sa", hours: "6:00 – 13:00" },
      { day: "So", hours: "7:30 – 11:00" },
    ],
    hero: {
      headline: "Brot und Brötchen, ab 6 Uhr frisch.",
      subheadline:
        "Sauerteig mit Zeit, Brötchen aus dem Steinofen und Kuchen vom Blech.",
    },
    services: [
      {
        title: "Brot",
        description: "Sauerteigbrote aus Roggen, Dinkel und Emmer.",
      },
      {
        title: "Brötchen",
        description: "Aus dem Steinofen, ab 6 Uhr, samstags auch Laugengebäck.",
      },
      {
        title: "Kuchen",
        description:
          "Blechkuchen und Torten, auf Bestellung auch ganze Bleche.",
      },
    ],
    process: {
      headline: "Ein Backtag",
      steps: [
        {
          title: "3:30 Teig",
          text: "Der Sauerteig vom Vortag kommt in die Knetmaschine.",
        },
        {
          title: "4:30 Ofen",
          text: "Erst die Brötchen, dann die großen Laibe.",
        },
        {
          title: "6:00 Laden auf",
          text: "Brötchen, Brot und der erste Kaffee.",
        },
        { title: "11:30 Mittag", text: "Belegte Brote und eine Suppe." },
        { title: "14:00 Kuchen", text: "Blechkuchen aus der zweiten Runde." },
        {
          title: "18:00 Feierabend",
          text: "Was übrig bleibt, holt die Tafel ab.",
        },
      ],
    },
    pricelist: {
      headline: "Brot der Woche",
      categories: [
        {
          name: "Wochentafel",
          items: [
            { name: "Montag", description: "Roggenmischbrot", price: "4,20" },
            { name: "Dienstag", description: "Dinkel-Vollkorn", price: "5,10" },
            { name: "Mittwoch", description: "Kartoffelbrot", price: "4,60" },
            { name: "Donnerstag", description: "Walnussbrot", price: "5,80" },
            { name: "Freitag", description: "Bauernlaib", price: "4,40" },
            { name: "Samstag", description: "Sonntagsstuten", price: "3,90" },
          ],
        },
      ],
    },
    about:
      "Gebacken wird nachts, verkauft ab sechs. Unser Sauerteig bekommt Zeit, das Mehl kommt aus einer Mühle im Umland.\n\nAlle anderen Brote gibt es jeden Tag. Vorbestellen geht bis 16 Uhr am Vortag.",
    faq: [
      {
        question: "Kann ich Brot vorbestellen?",
        answer: "Ja, bis 16 Uhr am Vortag, im Laden oder am Telefon.",
      },
      {
        question: "Backt ihr auch Torten auf Bestellung?",
        answer: "Ja. Sag uns drei Tage vorher Bescheid.",
      },
    ],
    reviews: [
      {
        author: "Andrea K.",
        text: "Das beste Roggenbrot in der Stadt. Samstags lohnt es sich, früh zu kommen.",
      },
      {
        author: "Tobias R.",
        text: "Freundlich, schnell, und die Brötchen sind um sechs wirklich warm.",
      },
    ],
  },
  laden: {
    google: false,
    contact: {
      street: "Marktplatz 7",
      zip: "48231",
      city: "Warendorf",
      phone: "02581 555 0388",
      email: "hallo@laden-am-markt.example",
    },
    hours: [
      { day: "Mo–Fr", hours: "9:00 – 18:30" },
      { day: "Sa", hours: "9:00 – 14:00" },
    ],
    hero: {
      headline: "Papier, Haushalt und kleine Geschenke.",
      subheadline: "Direkt am Marktplatz.",
    },
    services: [
      {
        title: "Papeterie",
        description: "Hefte, Karten, gute Stifte, Füller.",
      },
      {
        title: "Haushalt",
        description: "Emaille, Bürsten, Küchentücher aus Leinen.",
      },
      { title: "Geschenke", description: "Kleines für Kinder und Gastgeber." },
      {
        title: "Schulbedarf",
        description: "Ranzen, Hefte und die Listen der Schulen.",
      },
      { title: "Bastelbedarf", description: "Papier, Farben, Kleber, Wolle." },
    ],
    about:
      "Ein kleiner Laden am Marktplatz: Papier, Dinge für den Haushalt und Geschenke. Wer etwas Bestimmtes sucht, fragt einfach — wir wissen meistens, wo es liegt.",
    faq: [
      {
        question: "Packt ihr Geschenke ein?",
        answer: "Ja, mit Papier aus unserem Sortiment.",
      },
      {
        question: "Gibt es Gutscheine?",
        answer: "Ja, im Laden in jeder Höhe.",
      },
      {
        question: "Könnt ihr etwas bestellen?",
        answer: "Ja. Frag einfach im Laden oder am Telefon.",
      },
    ],
    reviews: [
      {
        author: "Heike W.",
        text: "Hier findet man noch den Bleistift, den es sonst nirgends gibt. Und jemand weiß, wo er liegt.",
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
  const [name, start, picks] = (photos ?? "").split(":");
  if (start === "weak") return withWeakPhotos(doc, name, picks);
  const set = name ? INDUSTRY_IMAGES[name] : undefined;
  if (!set) return doc;
  const first = Number(start ?? 0);
  const all = set.gallery ?? set.hero;
  // Dritter Teil (`"name:0:3"`): Galeriebild 3 wird das Über-uns-Foto und
  // fehlt dafür in der Galerie (jedes Foto nur einmal).
  const aboutAt = picks === undefined || picks === "" ? -1 : Number(picks);
  const aboutPhoto = all[aboutAt];
  const gallery = aboutPhoto ? all.filter(u => u !== aboutPhoto) : all;
  const sections = doc.sections.map(section => {
    if (section.type === "hero")
      return { ...section, imageUrl: set.hero[first] ?? set.hero[0] };
    if (section.type === "about")
      return {
        ...section,
        imageUrl: aboutPhoto ?? set.about?.[0] ?? gallery[0],
      };
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

/**
 * Betrieb mit schwachen Fotos (`"name:weak:i,j"`, Werkstoff-Laden): kein
 * Einstiegs- und kein Über-uns-Foto, nur die gewählten Galeriebilder des
 * Bildsatzes (ohne Auswahl die ersten zwei).
 */
function withWeakPhotos(
  doc: WebsiteDataV2,
  name: string,
  picks?: string
): WebsiteDataV2 {
  const set = INDUSTRY_IMAGES[name];
  if (!set) return withoutPhotos(doc);
  const gallery = set.gallery ?? set.hero;
  const chosen = picks
    ? picks.split(",").flatMap(i => gallery[Number(i)] ?? [])
    : gallery.slice(0, 2);
  const sections = withoutPhotos(doc).sections.slice();
  const at = doc.sections.findIndex(s => s.type === "gallery");
  const images = chosen.map((url, i) => ({
    url,
    alt: `${doc.businessName} – Eindruck ${i + 1}`,
  }));
  const original = doc.sections[at];
  if (at !== -1 && original.type === "gallery")
    sections.splice(at, 0, { ...original, images });
  return { ...doc, sections: sections as WebsiteDataV2["sections"] };
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
          headline: text.hero.headline,
          subheadline: text.hero.subheadline,
          ctaText: text.hero.ctaText,
          ctaHref: text.hero.ctaHref,
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
      case "process":
        return text.process ? { ...section, ...text.process } : section;
      case "pricelist":
        return text.pricelist ? { ...section, ...text.pricelist } : section;
      case "team":
        return text.team ? { ...section, ...text.team } : section;
      case "stats":
        return text.stats ? { ...section, ...text.stats } : section;
      case "usp":
        return text.usp
          ? { ...section, items: text.usp.map(title => ({ title })) }
          : section;
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
  const has = (type: string) => doc.sections.some(s => s.type === type);
  // Ablauf, Preise, Team bzw. Fragen, die die Fixture nicht hat, kommen hinzu.
  const added: WebsiteDataV2["sections"][number][] = [
    ...(text.process && !has("process")
      ? [{ type: "process" as const, ...text.process }]
      : []),
    ...(text.pricelist && !has("pricelist")
      ? [{ type: "pricelist" as const, ...text.pricelist }]
      : []),
    ...(text.stats && !has("stats")
      ? [{ type: "stats" as const, ...text.stats }]
      : []),
    ...(text.team && !has("team")
      ? [{ type: "team" as const, ...text.team }]
      : []),
    ...(text.addFaq && !doc.sections.some(s => s.type === "faq")
      ? [{ type: "faq" as const, items: text.faq }]
      : []),
  ];
  // Ergänzte Abschnitte stehen vor Fragen und Kontakt; die Folge setzt
  // danach der Bauplan (withBlueprint), wie bei echten Seiten.
  const kept = text.drop
    ? sections.filter(s => !(text.drop as readonly string[]).includes(s.type))
    : sections;
  const tail = kept.findIndex(s => s.type === "faq" || s.type === "contact");
  const at = tail === -1 ? kept.length : tail;
  const merged = [
    ...kept.slice(0, at),
    ...added,
    ...kept.slice(at),
  ] as WebsiteDataV2["sections"];
  // Vorteile (Fakten-Chips) direkt nach dem Einstieg, falls die Fixture keine hat.
  const all = (
    text.usp && !has("usp")
      ? merged.flatMap((s): WebsiteDataV2["sections"][number][] =>
          s.type === "hero"
            ? [s, { type: "usp", items: text.usp!.map(title => ({ title })) }]
            : [s]
        )
      : merged
  ) as WebsiteDataV2["sections"];
  const ownGoogle = text.google ? text.google : google;
  // Gebuchte Add-ons für ergänzte Preise/Team (sonst blendet das Gating sie aus).
  const addOns =
    text.pricelist || text.team
      ? {
          addOns: {
            ...doc.addOns,
            ...(text.pricelist ? { pricelist: true } : {}),
            ...(text.team ? { team: true } : {}),
          },
        }
      : {};
  return {
    ...rest,
    ...addOns,
    // Ohne Bewertungen auch keine Google-Zahlen der fremden Fixture.
    ...(text.reviews && ownGoogle && text.google !== false
      ? { google: ownGoogle }
      : {}),
    sections: text.reviews
      ? all
      : (all.filter(
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

/**
 * Beispielbetrieb wie eine frisch erzeugte Seite, noch ohne System:
 * Fixture + Beispieltexte + Fotos + Bauplan, Einstieg laut
 * `showcase.systemEntry` (Standard „stage“). Schriftpaar und Farbwerte der
 * Fixture entfallen — Schrift und Farben bringt das System.
 */
export function showcaseBase(showcase: Showcase): WebsiteDataV2 {
  const fixture = getFixture(showcase.fixture, "full");
  // Unterseiten sind ein Extra — die Übersicht zeigt die Startseite.
  const {
    pages: _pages,
    fontPairId: _fontPairId,
    colorOverrides: _colorOverrides,
    ...withoutPages
  } = fixture;
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
  // Einstieg wie in der Übersicht festgelegt — unabhängig von der
  // Fotolage (auch ein Beispiel ohne Foto zeigt die gewählte Fassung).
  const designProfile = {
    ...DEFAULT_DESIGN_PROFILE,
    composition: showcase.systemEntry ?? "stage",
    seed: entrySeed(withExtras),
  };
  return withSampleAction(
    withStudioMenu(
      withBlueprint({ ...withExtras, designProfile }, blueprint),
      showcase.id
    ),
    showcase.id
  );
}

/**
 * Nach dem Bauplan: Bringt ein Beispiel eine eigene Hauptaktion mit echtem
 * Ziel mit (Weinberg: Buchungslink), gilt sie — der Gastro-Bauplan setzt
 * sonst fest „Anrufen" ein. Nur Beispiele mit `hero.ctaHref`; alle anderen
 * bleiben unverändert.
 */
function withSampleAction(doc: WebsiteDataV2, id: string): WebsiteDataV2 {
  const hero = SAMPLE_TEXT[id]?.hero;
  if (!hero?.ctaHref) return doc;
  return {
    ...doc,
    sections: doc.sections.map(s =>
      s.type === "hero"
        ? { ...s, ctaText: hero.ctaText ?? s.ctaText, ctaHref: hero.ctaHref }
        : s
    ) as WebsiteDataV2["sections"],
  };
}

/**
 * Nach dem Bauplan: Die Gastro-Baupläne verwerfen erzeugte Speisekarten
 * (`stripSections`) — eine Karte trägt der Betrieb im Studio selbst ein.
 * Beispiele mit eigener Karte (Nacht-Weinberg) bekommen sie danach wie eine
 * im Studio eingetragene: direkt nach dem Einstieg, Extra gebucht. Ein
 * eigener Aufruf (Reservierungs-Band) steht vor den Stimmen, mit
 * `ctaAt: "end"` am Schluss (Abschluss-Band); eigene Zahlen folgen den
 * Leistungen.
 */
function withStudioMenu(doc: WebsiteDataV2, id: string): WebsiteDataV2 {
  const text = SAMPLE_TEXT[id];
  if (!text?.menu && !text?.cta && !text?.stats) return doc;
  const stats: WebsiteDataV2["sections"][number][] = text.stats
    ? doc.sections.filter(s => s.type === "stats")
    : [];
  const rest = doc.sections.filter(
    s =>
      !(text.menu && s.type === "menu") &&
      !(text.cta && s.type === "cta") &&
      !stats.includes(s)
  );
  const out: WebsiteDataV2["sections"][number][] = [];
  const cta = text.cta ? [{ type: "cta" as const, ...text.cta }] : [];
  const before =
    text.ctaAt === "end"
      ? -1
      : rest.findIndex(
          s =>
            s.type === "testimonials" ||
            s.type === "faq" ||
            s.type === "contact"
        );
  rest.forEach((s, i) => {
    if (i === before) out.push(...cta);
    out.push(s);
    if (s.type === "hero" && text.menu)
      out.push({ type: "menu", ...text.menu });
    // Eigene Zahlen direkt nach den Leistungen (Systemblatt Freundlich 12).
    if (s.type === "services") out.push(...stats);
  });
  if (before === -1) out.push(...cta);
  return {
    ...doc,
    ...(text.menu ? { addOns: { ...doc.addOns, menu: true } } : {}),
    sections: out as WebsiteDataV2["sections"],
  };
}

/** Beispielbetrieb im Designsystem (Systemübersicht, /demo/system/…). */
export function systemShowcaseDoc(
  showcase: Showcase,
  system: DesignSystemId,
  palette?: string
): WebsiteDataV2 {
  const base = showcaseBase(showcase);
  // Dunkles Papier (Nacht): Abendmotive statt heller Tagesfotos.
  const doc =
    getSystem(system)?.scheme === "dark" && showcase.evening
      ? withEveningPhotos(base, showcase.evening)
      : base;
  // Ohne Wahl die feste Standard-Farbstimmung des Beispiels [E3].
  return withDesignSystem(
    doc,
    system,
    palette ?? SHOWCASE_PALETTES[showcase.id]?.[system]
  );
}

/** Hauptsystem eines Beispielbetriebs (erstes freigeschaltetes des Tripels). */
export function showcasePrimarySystem(showcase: Showcase): DesignSystemId {
  return withPrimarySystem(showcaseBase(showcase)).system!;
}

/**
 * Fotos eines Beispielbetriebs durch die Abendmotive des Bildsatzes
 * ersetzen (Nacht N2+N3): Einstieg = Motiv 1, Über uns = Motiv 2, Galerie
 * = der Rest — jedes Foto einmal. Nur dort, wo schon ein Foto steht.
 */
export function withEveningPhotos(
  doc: WebsiteDataV2,
  setKey: string
): WebsiteDataV2 {
  const evening = INDUSTRY_IMAGES[setKey]?.evening ?? [];
  if (evening.length === 0) return doc;
  const [hero, about, ...rest] = evening;
  const sections = doc.sections.map(section => {
    if (section.type === "hero" && section.imageUrl)
      return { ...section, imageUrl: hero };
    if (section.type === "about" && section.imageUrl && about)
      return { ...section, imageUrl: about };
    if (section.type === "gallery" && section.images.length > 0 && rest.length)
      return {
        ...section,
        images: rest.map((url, i) => ({
          url,
          alt: `${doc.businessName} – Eindruck ${i + 1}`,
        })),
      };
    return section;
  }) as WebsiteDataV2["sections"];
  return { ...doc, sections };
}
