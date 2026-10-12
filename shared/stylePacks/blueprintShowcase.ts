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
        description: "Untersuchung, professionelle Reinigung, Röntgen nur wenn nötig.",
      },
      {
        title: "Füllungen und Wurzelbehandlung",
        description: "Zahnfarbene Füllungen, gründlich betäubt.",
      },
      {
        title: "Zahnersatz",
        description: "Kronen, Brücken, Prothesen. Kostenplan vorab schriftlich.",
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
      { title: "Skin Fade", description: "Maschine bis auf die Haut, Übergang von Hand." },
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
        answer: "Halloumi im Brot, Pide mit Käse und Lahmacun ohne Fleisch auf Nachfrage.",
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
      { title: "Kraftzirkel", description: "45 Minuten, Langhantel und Kettlebell.", price: "ab 12 €" },
      { title: "Rücken fit", description: "30 Minuten, in der Mittagspause.", price: "ab 9 €" },
      { title: "Yoga Flow", description: "60 Minuten, Matten sind da.", price: "ab 14 €" },
      { title: "Boxen", description: "60 Minuten, Handschuhe leihen wir.", price: "ab 14 €" },
      { title: "Probetraining", description: "Einmal, ohne Vertrag.", price: "0 €" },
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
      case "process":
        return text.process ? { ...section, ...text.process } : section;
      case "pricelist":
        return text.pricelist ? { ...section, ...text.pricelist } : section;
      case "team":
        return text.team ? { ...section, ...text.team } : section;
      case "usp":
        return text.usp ? { ...section, items: text.usp.map(title => ({ title })) } : section;
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
    ...(text.team && !has("team")
      ? [{ type: "team" as const, ...text.team }]
      : []),
    ...(text.addFaq && !doc.sections.some(s => s.type === "faq")
      ? [{ type: "faq" as const, items: text.faq }]
      : []),
  ];
  // Ergänzte Abschnitte stehen vor Fragen und Kontakt; die Folge setzt
  // danach der Bauplan (withBlueprint), wie bei echten Seiten.
  const tail = sections.findIndex(s => s.type === "faq" || s.type === "contact");
  const at = tail === -1 ? sections.length : tail;
  const merged = [
    ...sections.slice(0, at),
    ...added,
    ...sections.slice(at),
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
  return withDesignSystem(
    showcaseDoc(showcase, showcase.systemEntry ?? "stage"),
    system,
    palette
  );
}
