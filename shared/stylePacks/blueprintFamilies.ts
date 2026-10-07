/**
 * Branchenfamilien (2026-10-06, Betreiber: „Wir müssen alle Branchen, die es
 * in Google gibt, abdecken"). Neben Friseur/Beauty, Handwerk und Gastro
 * (blueprints.ts) bekommt jede weitere Google-Kategorie eine dieser
 * Familien: eigene Hauptaktion, eigene Überschriften, eigene FAQ-Regeln.
 * Erfunden wird nie etwas — Preise, Team und Zulassungen nur mit Beleg.
 */
import type { Blueprint } from "./blueprints";

export type FamilyId =
  | "health"
  | "advice"
  | "retail"
  | "auto"
  | "courses"
  | "stay"
  | "creative"
  | "urgent"
  | "industry";

/** Gemeinsame Verbote für jede Familie. */
const NO_INVENTION = `- Erfinde KEINE Preise, Zulassungen, Zertifikate, Gründungsjahre, Mitarbeiterzahlen, Marken oder Auszeichnungen. Nur, was in den Fakten steht.`;

const faqLine = (questions: string) =>
  `- faq: Fragen, die vor dem ersten Kontakt wirklich gestellt werden (${questions}). Antworten NUR mit belegten Fakten — sonst freundlich auf Anruf oder Nachricht verweisen.`;

/* ── Gesundheit ─────────────────────────────────────────────────────────── */

export const HEALTH =
  /arzt|ärzt|aerzt|mediziner|praxis|zahn|kieferorthop|physio|ergotherap|logopäd|logopaed|osteopath|heilprakt|naturheil|psychotherap|psycholog|chiroprakt|podolog|fußpflege|fusspflege|hebamme|tierarzt|tierklinik|tierärzt|pflegedienst|apotheke|hörakust|hoerakust|hörgerät|orthopäd|klinik|ambulan|therapeut|dentist|doctor|physician|clinic|pharmacy|veterinar|therapist|chiropract/i;

export function healthBlueprint(category: string, name: string): Blueprint {
  const text = `${category} ${name}`;
  const vet = /tierarzt|tierklinik|tierärzt|veterinar/i.test(text);
  const therapy =
    /physio|ergotherap|logopäd|logopaed|osteopath|heilprakt|naturheil|psychotherap|chiroprakt|podolog|fußpflege|fusspflege|therapeut|therapist|chiropract/i.test(
      text
    );
  const pharmacy = /apotheke|pharmacy/i.test(text);
  const patients = vet
    ? "Das sagen Tierhalterinnen und Tierhalter"
    : "Das sagen unsere Patientinnen und Patienten";
  return {
    id: "health",
    headlines: {
      services: therapy ? "Behandlungen" : "Leistungen",
      about: pharmacy ? "Die Apotheke" : "Die Praxis",
      gallery: pharmacy ? "Einblicke" : "Einblicke in die Praxis",
      testimonials: pharmacy
        ? "Das sagen unsere Kundinnen und Kunden"
        : patients,
      faq: "Gut zu wissen",
      contact: pharmacy ? "Öffnungszeiten & Anfahrt" : "Sprechzeiten & Anfahrt",
    },
    ctaText: pharmacy ? "Route planen" : "Termin vereinbaren",
    ctaAction: pharmacy ? "route" : "tel",
    hoursLabel: pharmacy ? "Öffnungszeiten" : "Sprechzeiten",
    promptLines: [
      `- Branche: ${vet ? "Tierarztpraxis" : pharmacy ? "Apotheke" : therapy ? "Therapiepraxis" : "Arzt-/Zahnarztpraxis"} (${category}). Patientinnen und Patienten suchen Vertrauen, Sprechzeiten und einen schnellen Weg zum Termin.`,
      `- hero.headline nennt Fachrichtung UND Ort, z. B. „Zahnarztpraxis in Bocholt“ oder „Physiotherapie am Marktplatz“.`,
      `- Heilmittelwerberecht: KEINE Heilversprechen, keine Erfolgsgarantien („schmerzfrei“, „heilt“), keine Diagnosen, keine Vorher-Nachher-Aussagen. Sachlich beschreiben, was angeboten wird.`,
      `- services.items: Behandlungen bzw. Leistungen mit 1–4 Wörtern, nur was zur Fachrichtung passt. Kassen- oder Privatleistungen, Fachtitel und Zusatzqualifikationen NUR nennen, wenn belegt.`,
      NO_INVENTION,
      faqLine(
        vet
          ? "Brauche ich einen Termin? Gibt es eine Notfallsprechstunde? Welche Tiere behandelt ihr?"
          : pharmacy
            ? "Kann ich Medikamente vorbestellen? Gibt es einen Botendienst? Wo ist die nächste Notdienst-Apotheke?"
            : "Wie bekomme ich einen Termin? Nehmt ihr neue Patienten auf? Ist die Praxis barrierefrei? Was bringe ich zum ersten Termin mit?"
      ),
    ],
    placeholders: pharmacy ? [] : ["team"],
    placeholderText: {
      team: "Wer behandelt, wer empfängt? Mit Fotos und Namen im Studio entsteht hier euer Praxisteam — Vertrauen beginnt beim Gesicht. Auf der fertigen Seite erscheint der Block erst mit euren Angaben.",
    },
    order: [
      "hero",
      "services",
      "about",
      "gallery",
      "testimonials",
      "faq",
      "contact",
    ],
    trust: true,
    contactMode: "visit",
    navLabels: {
      services: therapy ? "Behandlungen" : "Leistungen",
      about: pharmacy ? "Apotheke" : "Praxis",
      gallery: "Einblicke",
      testimonials: "Bewertungen",
      faq: "FAQ",
      contact: pharmacy ? "Anfahrt" : "Sprechzeiten",
    },
  };
}

/* ── Beratung & Büro ────────────────────────────────────────────────────── */

export const ADVICE =
  /steuerberat|steuerbüro|steuerkanzlei|rechtsanwalt|anwalt|anwält|kanzlei|notar|versicherung|makler|immobilien|finanzberat|finanzdienst|vermögensberat|unternehmensberat|beratung|berater|agentur|marketing|werbe|webdesign|it-dienst|it-service|software|edv|architekt|ingenieurbüro|ingenieur|gutachter|sachverständig|übersetz|dolmetsch|coach|buchhaltung|lohnbuchhalt|personalvermitt|lawyer|attorney|accountant|insurance|real estate|consult|agency|architect/i;

export function adviceBlueprint(category: string, name: string): Blueprint {
  const text = `${category} ${name}`;
  const kanzlei =
    /steuer|anwalt|anwält|kanzlei|notar|lawyer|attorney|accountant/i.test(text);
  const agency =
    /agentur|marketing|werbe|webdesign|software|it-|edv|agency/i.test(text);
  return {
    id: "advice",
    headlines: {
      services: kanzlei ? "Schwerpunkte" : "Leistungen",
      process: "So arbeiten wir zusammen",
      about: kanzlei ? "Die Kanzlei" : agency ? "Das Team" : "Über uns",
      gallery: "Einblicke",
      testimonials: kanzlei
        ? "Das sagen unsere Mandantinnen und Mandanten"
        : "Das sagen unsere Kundinnen und Kunden",
      faq: "Häufige Fragen",
      contact: "Kontakt & Erstgespräch",
    },
    ctaText: "Erstgespräch vereinbaren",
    promptLines: [
      `- Branche: ${kanzlei ? "Kanzlei" : agency ? "Agentur/Dienstleister" : "Beratung"} (${category}). Wer hier sucht, will wissen: Kennen die sich mit meinem Fall aus, wie läuft die Zusammenarbeit, wie komme ich ins Gespräch.`,
      `- hero.headline nennt Fachgebiet UND Ort, z. B. „Steuerberatung in Bocholt“ oder „Webdesign für Betriebe im Münsterland“.`,
      `- services.items: Schwerpunkte mit 1–4 Wörtern (z. B. „Jahresabschluss“, „Arbeitsrecht“, „Baufinanzierung“) — nur, was zur Kategorie und zu den Fakten passt. Keine Erfolgsversprechen, keine Rechts- oder Steuerauskünfte im Text.`,
      `- process.steps: genau 4 Schritte (Erstgespräch → Unterlagen/Analyse → Angebot oder Mandat → Umsetzung), je Schritt ein Satz. Kein „kostenlos“, keine Fristen, wenn nicht belegt.`,
      `- Kammer, Fachanwaltstitel, Zulassungen, Zertifizierungen NUR nennen, wenn belegt.`,
      NO_INVENTION,
      faqLine(
        "Wie läuft das erste Gespräch ab? Welche Unterlagen brauche ich? Arbeitet ihr auch online/digital? Für wen seid ihr da?"
      ),
    ],
    placeholders: ["team"],
    placeholderText: {
      team: "Wer berät? Mit Fotos und Namen im Studio entsteht hier euer Team — bei Beratung zählt, wem man gegenübersitzt. Auf der fertigen Seite erscheint der Block erst mit euren Angaben.",
    },
    extraSections: ["process"],
    order: [
      "hero",
      "services",
      "process",
      "about",
      "gallery",
      "testimonials",
      "faq",
      "contact",
    ],
    trust: true,
    contactMode: "inquiry",
    serviceArea: true,
    navLabels: {
      services: kanzlei ? "Schwerpunkte" : "Leistungen",
      process: "Zusammenarbeit",
      about: kanzlei ? "Kanzlei" : "Über uns",
      gallery: "Einblicke",
      testimonials: "Bewertungen",
      faq: "FAQ",
      contact: "Kontakt",
    },
  };
}

/* ── Laden & Handel ─────────────────────────────────────────────────────── */

export const RETAIL =
  /laden|geschäft|geschaeft|shop|boutique|handel|händler|haendler|markt|kiosk|blumen|florist|optiker|juwelier|uhren|goldschmied|buchhand|fahrrad|bike|schuh|mode|bekleidung|textil|spielwaren|möbel|moebel|einrichtungshaus|inneneinricht|küchenstudio|elektronik|handy|mobilfunk|drogerie|parfüm|parfum|feinkost|weinhand|getränke|getraenke|tierbedarf|zoofach|zoohandlung|tierhandel|baumarkt|gartencenter|antiquit|second-?hand|geschenk|deko|teppich|raumausstatt|sanitätshaus|store|retailer|jeweler|optician/i;

export function retailBlueprint(category: string): Blueprint {
  return {
    id: "retail",
    headlines: {
      services: "Sortiment",
      gallery: "Im Laden",
      about: "Über den Laden",
      testimonials: "Das sagen unsere Kundinnen und Kunden",
      faq: "Gut zu wissen",
      contact: "Besuch",
    },
    ctaText: "Route planen",
    ctaAction: "route",
    promptLines: [
      `- Branche: Fachgeschäft (${category}). Kundinnen und Kunden wollen wissen: Was finde ich dort, wann ist offen, wie komme ich hin.`,
      `- hero.headline nennt Sortiment UND Ort, z. B. „Blumen am Marktplatz in Rhede“ oder „Fahrräder und Werkstatt in Bocholt“.`,
      `- services.items: 4–6 Sortimentsbereiche oder Dienstleistungen als Überbegriffe (z. B. „Sträuße“, „Brautschmuck“, „Reparatur“). Marken, Hersteller und Eigenmarken NUR nennen, wenn belegt. Keine Preise, keine Rabatte.`,
      NO_INVENTION,
      faqLine(
        "Kann ich etwas vorbestellen oder reservieren lassen? Gibt es Beratung vor Ort? Gibt es Parkplätze? Liefert ihr?"
      ),
    ],
    placeholders: [],
    placeholderText: {},
    order: [
      "hero",
      "services",
      "gallery",
      "about",
      "testimonials",
      "faq",
      "contact",
    ],
    trust: true,
    contactMode: "visit",
    navLabels: {
      services: "Sortiment",
      gallery: "Im Laden",
      about: "Über uns",
      testimonials: "Bewertungen",
      faq: "FAQ",
      contact: "Anfahrt",
    },
  };
}

/* ── Auto & Mobilität ───────────────────────────────────────────────────── */

export const AUTO =
  /kfz|auto(haus|werkstatt|service|handel|händler|vermietung|teile|aufbereitung|glas|lackier|elektrik|zubehör)|autowasch|waschanlage|waschstraße|reifen|motorrad|tankstelle|abgasuntersuchung|car dealer|car repair|auto repair|tire|car wash|gas station|motorcycle/i;

export function autoBlueprint(category: string, name: string): Blueprint {
  const dealer = /autohaus|handel|händler|dealer|vermietung/i.test(
    `${category} ${name}`
  );
  return {
    id: "auto",
    headlines: {
      services: "Leistungen",
      gallery: dealer ? "Fahrzeuge & Haus" : "Die Werkstatt",
      about: "Der Betrieb",
      testimonials: "Das sagen unsere Kunden",
      faq: "Gut zu wissen",
      contact: "Termin & Anfahrt",
    },
    ctaText: dealer ? "Jetzt anrufen" : "Termin anfragen",
    ctaAction: "tel",
    promptLines: [
      `- Branche: ${dealer ? "Autohaus/Fahrzeughandel" : "Kfz-Betrieb"} (${category}). Kunden wollen schnell wissen: Was macht ihr, wann komme ich dran, wie erreiche ich euch.`,
      `- hero.headline nennt Leistung UND Ort, z. B. „Kfz-Werkstatt in Borken“ oder „Reifenservice in Bocholt“.`,
      `- services.items: Leistungen mit 1–4 Wörtern (z. B. „Inspektion“, „Reifenwechsel“, „Klimaservice“, „Unfallinstandsetzung“). Markenbindung, Meisterbetrieb, HU/AU vor Ort, Ersatzwagen oder Hol- und Bringservice NUR nennen, wenn belegt. Keine Preise oder Festpreise.`,
      NO_INVENTION,
      faqLine(
        "Wie schnell bekomme ich einen Termin? Kann ich auf mein Auto warten? Arbeitet ihr an allen Marken? Wie bekomme ich ein Angebot?"
      ),
    ],
    placeholders: [],
    placeholderText: {},
    order: [
      "hero",
      "services",
      "gallery",
      "about",
      "testimonials",
      "faq",
      "contact",
    ],
    trust: true,
    contactMode: "visit",
    navLabels: {
      services: "Leistungen",
      gallery: dealer ? "Fahrzeuge" : "Werkstatt",
      about: "Betrieb",
      testimonials: "Bewertungen",
      faq: "FAQ",
      contact: "Termin",
    },
  };
}

/* ── Sport & Kurse ──────────────────────────────────────────────────────── */

export const COURSES =
  /fitness|gym|yoga|pilates|kampfsport|karate|judo|taekwondo|boxen|boxing|kickbox|tanzschule|tanzstudio|ballett|musikschule|gesangs|klavier|gitarre|fahrschule|nachhilfe|sprachschule|schwimmschule|hundeschule|reitschule|reitstall|kletter|crossfit|personal training|trainer|kurs|akademie|martial arts|dance school|music school|driving school|tutor/i;

export function coursesBlueprint(category: string, name: string): Blueprint {
  const text = `${category} ${name}`;
  const driving = /fahrschule|driving school/i.test(text);
  const lessons =
    /musikschule|gesang|klavier|gitarre|tanz|ballett|nachhilfe|sprachschule|schwimmschule|hundeschule|reit|music|dance|tutor/i.test(
      text
    );
  const cta = driving
    ? "Jetzt anmelden"
    : lessons
      ? "Probestunde vereinbaren"
      : "Probetraining vereinbaren";
  return {
    id: "courses",
    headlines: {
      services: driving
        ? "Führerscheinklassen"
        : lessons
          ? "Unterricht & Kurse"
          : "Training & Kurse",
      gallery: "Einblicke",
      about: "Über uns",
      testimonials: driving
        ? "Das sagen unsere Fahrschülerinnen und Fahrschüler"
        : lessons
          ? "Das sagen unsere Schülerinnen und Schüler"
          : "Das sagen unsere Mitglieder",
      faq: "Gut zu wissen",
      contact: "Kontakt & Anfahrt",
    },
    ctaText: cta,
    promptLines: [
      `- Branche: ${driving ? "Fahrschule" : lessons ? "Schule/Unterricht" : "Sport/Training"} (${category}). Interessierte wollen wissen: Was kann ich lernen oder trainieren, passt das zu mir, wie fange ich an.`,
      `- hero.headline nennt Angebot UND Ort, z. B. „Kampfsport für Kinder und Erwachsene in Borken“ oder „Musikschule in Bocholt“.`,
      `- services.items: Kurse, Klassen oder Trainingsangebote mit 1–4 Wörtern — nur, was zur Kategorie und zu den Fakten passt. KEINE Preise, Tarife, Vertragslaufzeiten oder Rabatte. Keine Abnehm- oder Gesundheitsversprechen.`,
      NO_INVENTION,
      faqLine(
        driving
          ? "Wie melde ich mich an? Wie läuft die Theorie? Gibt es Intensivkurse?"
          : "Kann ich unverbindlich reinschnuppern? Brauche ich Vorkenntnisse? Für welches Alter ist das Angebot? Was bringe ich mit?"
      ),
    ],
    placeholders: ["pricelist"],
    placeholderText: {
      pricelist:
        "Trag Kurse, Tarife und Preise im Studio ein — dann stehen sie hier direkt beim Angebot. Auf der fertigen Seite erscheint der Block erst mit echten Angaben.",
    },
    order: [
      "hero",
      "services",
      "gallery",
      "about",
      "testimonials",
      "faq",
      "contact",
    ],
    trust: true,
    contactMode: "inquiry",
    navLabels: {
      services: driving ? "Klassen" : "Kurse",
      gallery: "Einblicke",
      about: "Über uns",
      testimonials: "Bewertungen",
      faq: "FAQ",
      contact: "Kontakt",
    },
  };
}

/* ── Unterkunft ─────────────────────────────────────────────────────────── */

export const STAY =
  /hotel|pension|ferienwohnung|ferienhaus|gästehaus|gaestehaus|gästezimmer|apartment|hostel|jugendherberge|camping|wohnmobil|bed and breakfast|unterkunft|lodging|guest house|\binn\b|motel/i;

export function stayBlueprint(category: string): Blueprint {
  return {
    id: "stay",
    headlines: {
      services: "Zimmer & Ausstattung",
      gallery: "Eindrücke",
      about: "Das Haus",
      testimonials: "Das sagen unsere Gäste",
      faq: "Gut zu wissen",
      contact: "Anreise & Kontakt",
    },
    ctaText: "Verfügbarkeit anfragen",
    promptLines: [
      `- Branche: Unterkunft (${category}). Gäste wollen wissen: Wie wohne ich dort, was ist in der Nähe, wie frage ich an.`,
      `- hero.headline nennt Art der Unterkunft UND Ort, z. B. „Gästehaus am Aasee in Bocholt“.`,
      `- services.items: Zimmerarten oder Ausstattung als Überbegriffe (z. B. „Doppelzimmer“, „Frühstück“, „Parkplatz“) — NUR, was belegt ist. Keine Preise, keine Sterne-Klassifizierung ohne Beleg.`,
      NO_INVENTION,
      faqLine(
        "Wann ist Check-in und Check-out? Gibt es Parkplätze? Sind Haustiere erlaubt? Gibt es Frühstück?"
      ),
    ],
    placeholders: ["pricelist"],
    placeholderText: {
      pricelist:
        "Trag Zimmer und Preise im Studio ein — dann sehen Gäste sie hier vor der Anfrage. Auf der fertigen Seite erscheint der Block erst mit echten Angaben.",
    },
    order: [
      "hero",
      "gallery",
      "services",
      "about",
      "testimonials",
      "faq",
      "contact",
    ],
    trust: true,
    contactMode: "inquiry",
    navLabels: {
      services: "Zimmer",
      gallery: "Eindrücke",
      about: "Das Haus",
      testimonials: "Bewertungen",
      faq: "FAQ",
      contact: "Anreise",
    },
  };
}

/* ── Foto, Events & Kreativ ─────────────────────────────────────────────── */

export const CREATIVE =
  /fotograf|photograph|fotostudio|video|film|\bdj\b|disc-?jockey|hochzeitsplan|eventplan|event-?agentur|veranstaltungs|tattoo|piercing|grafik|illustrat|künstler|kuenstler|atelier|galerie|\bband\b|musiker|sänger|zauber|moderat|wedding|event planner|artist/i;

export function creativeBlueprint(category: string, name: string): Blueprint {
  const tattoo = /tattoo|piercing/i.test(`${category} ${name}`);
  return {
    id: "creative",
    headlines: {
      gallery: tattoo ? "Arbeiten" : "Portfolio",
      services: "Leistungen",
      process: "So läuft's ab",
      about: "Über uns",
      testimonials: "Das sagen unsere Kundinnen und Kunden",
      faq: "Gut zu wissen",
      contact: "Anfrage",
    },
    ctaText: tattoo ? "Termin anfragen" : "Anfrage senden",
    promptLines: [
      `- Branche: ${tattoo ? "Tattoo-/Piercingstudio" : "Kreative Dienstleistung"} (${category}). Wer hier sucht, entscheidet über die Arbeiten: Stil, Qualität, Verfügbarkeit.`,
      `- hero.headline nennt Leistung UND Ort, z. B. „Hochzeitsfotografie im Münsterland“.`,
      `- services.items: Leistungen mit 1–4 Wörtern (z. B. „Hochzeiten“, „Business-Porträts“, „Imagefilm“). Keine Preise, keine Pakete, keine Auszeichnungen ohne Beleg.`,
      `- process.steps: genau 4 Schritte (Anfrage → Gespräch → Planung/Entwurf → Umsetzung/Termin), je Schritt ein Satz.`,
      NO_INVENTION,
      faqLine(
        tattoo
          ? "Wie bekomme ich einen Termin? Wie läuft die Beratung? Ab welchem Alter? Wie pflege ich das Tattoo?"
          : "Wie weit im Voraus sollte ich anfragen? Wie läuft ein Vorgespräch ab? Arbeitet ihr auch außerhalb der Stadt?"
      ),
    ],
    placeholders: [],
    placeholderText: {},
    extraSections: ["process"],
    order: [
      "hero",
      "gallery",
      "services",
      "process",
      "about",
      "testimonials",
      "faq",
      "contact",
    ],
    trust: true,
    contactMode: "inquiry",
    serviceArea: !tattoo,
    navLabels: {
      gallery: tattoo ? "Arbeiten" : "Portfolio",
      services: "Leistungen",
      process: "Ablauf",
      about: "Über uns",
      testimonials: "Bewertungen",
      faq: "FAQ",
      contact: "Anfrage",
    },
  };
}

/* ── Sofort-Dienste ─────────────────────────────────────────────────────── */

export const URGENT =
  /taxi|kurier|botendienst|schlüsseldienst|schluesseldienst|aufsperr|abschlepp|pannenhilfe|notdienst|rohrreinigung|kammerjäger|krankentransport|chauffeur|limousinen|flughafentransfer|locksmith|towing|courier|\bcab\b/i;

export function urgentBlueprint(category: string): Blueprint {
  return {
    id: "urgent",
    headlines: {
      services: "Leistungen",
      about: "Über uns",
      gallery: "Einblicke",
      testimonials: "Das sagen unsere Kunden",
      faq: "Gut zu wissen",
      contact: "Erreichbarkeit",
    },
    ctaText: "Jetzt anrufen",
    ctaAction: "tel",
    promptLines: [
      `- Branche: Dienst, den man kurzfristig braucht (${category}). Wer hier sucht, will sofort anrufen — Telefon und Erreichbarkeit stehen vor allem anderen.`,
      `- hero.headline nennt Leistung UND Ort, z. B. „Taxi in Bocholt“ oder „Schlüsseldienst für Borken und Umgebung“.`,
      `- „24 Stunden“, „rund um die Uhr“, Anfahrtszeiten, Festpreise oder Notdienst NUR nennen, wenn sie in den Fakten oder Öffnungszeiten belegt sind.`,
      NO_INVENTION,
      faqLine(
        "Wie schnell seid ihr da? In welchem Gebiet fahrt ihr? Kann ich vorbestellen? Wie bezahle ich?"
      ),
    ],
    placeholders: [],
    placeholderText: {},
    order: [
      "hero",
      "services",
      "about",
      "gallery",
      "testimonials",
      "faq",
      "contact",
    ],
    trust: true,
    contactMode: "visit",
    serviceArea: true,
    navLabels: {
      services: "Leistungen",
      about: "Über uns",
      gallery: "Einblicke",
      testimonials: "Bewertungen",
      faq: "FAQ",
      contact: "Erreichbarkeit",
    },
  };
}

/* ── Betrieb & Industrie ────────────────────────────────────────────────── */

export const INDUSTRY =
  /hersteller|herstellung|großhandel|grosshandel|großhändler|grosshändler|lieferant|zulieferer|produktion|fertigung|fabrik|maschinenbau|anlagenbau|anlagenservice|werkzeugbau|metallverarbeit|kunststoff|druckerei|verpackung|logistik|spedition|lager|manufactur|wholesal|supplier|distribut|factory|logistics/i;

export function industryBlueprint(category: string): Blueprint {
  return {
    id: "industry",
    headlines: {
      services: "Produkte & Leistungen",
      process: "Zusammenarbeit",
      about: "Das Unternehmen",
      gallery: "Einblicke",
      testimonials: "Das sagen unsere Kunden",
      faq: "Häufige Fragen",
      contact: "Kontakt & Anfrage",
    },
    ctaText: "Anfrage senden",
    promptLines: [
      `- Branche: Unternehmen für Geschäftskunden (${category}). Einkäufer und Betriebe wollen wissen: Was liefert ihr, für wen, wie läuft eine Anfrage.`,
      `- hero.headline nennt Produkt bzw. Leistung UND Ort, z. B. „Metallbearbeitung für die Industrie in Bocholt“ oder „Getränkegroßhandel im Kreis Borken“.`,
      `- services.items: Produkte, Fertigungsverfahren oder Leistungen mit 1–4 Wörtern — nur, was zur Kategorie und zu den Fakten passt. Keine Mindestmengen, Lieferzeiten, Preise oder Normen/Zertifikate ohne Beleg.`,
      `- process.steps: genau 4 Schritte (Anfrage → Abstimmung/Muster → Angebot → Lieferung/Fertigung), je Schritt ein Satz.`,
      NO_INVENTION,
      faqLine(
        "Liefert ihr auch an Privatkunden? In welches Gebiet liefert ihr? Wie läuft eine Anfrage? Gibt es Abholung vor Ort?"
      ),
    ],
    placeholders: [],
    placeholderText: {},
    extraSections: ["process"],
    order: [
      "hero",
      "services",
      "process",
      "gallery",
      "about",
      "testimonials",
      "faq",
      "contact",
    ],
    trust: true,
    contactMode: "inquiry",
    navLabels: {
      services: "Leistungen",
      process: "Zusammenarbeit",
      gallery: "Einblicke",
      about: "Unternehmen",
      testimonials: "Bewertungen",
      faq: "FAQ",
      contact: "Anfrage",
    },
  };
}

/** Familie zur Kategorie per Stichwort — Reihenfolge entscheidet bei Überschneidung. */
export function familyByKeyword(text: string): FamilyId | undefined {
  if (URGENT.test(text)) return "urgent";
  if (HEALTH.test(text)) return "health";
  if (AUTO.test(text)) return "auto";
  if (COURSES.test(text)) return "courses";
  if (STAY.test(text)) return "stay";
  if (CREATIVE.test(text)) return "creative";
  if (ADVICE.test(text)) return "advice";
  // Hersteller/Großhandel vor „Handel": „Getränkegroßhandel" ist kein Laden.
  if (INDUSTRY.test(text)) return "industry";
  if (RETAIL.test(text)) return "retail";
  return undefined;
}

export function familyBlueprint(
  family: FamilyId,
  category: string,
  name: string
): Blueprint {
  switch (family) {
    case "health":
      return healthBlueprint(category, name);
    case "advice":
      return adviceBlueprint(category, name);
    case "retail":
      return retailBlueprint(category);
    case "auto":
      return autoBlueprint(category, name);
    case "courses":
      return coursesBlueprint(category, name);
    case "stay":
      return stayBlueprint(category);
    case "creative":
      return creativeBlueprint(category, name);
    case "urgent":
      return urgentBlueprint(category);
    case "industry":
      return industryBlueprint(category);
  }
}
