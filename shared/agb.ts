/**
 * Allgemeine Geschäftsbedingungen von Pageblitz — EINZIGE Quelle des
 * AGB-Texts (Seite `/agb`, Checkout-Häkchen, Stripe-Metadaten,
 * docs/agb-entwurf.md). Entwurf 2026-10-13, vom Betreiber freigegeben
 * (Mahnfrist 14 Tage, Ankündigung Preisänderungen 6 Wochen) und zur
 * anwaltlichen Prüfung gegeben.
 *
 * Versionierung: Jede inhaltliche Änderung bekommt eine neue AGB_VERSION
 * (Datum der Fassung). Der Checkout speichert die akzeptierte Version an
 * Stripe-Session/-Subscription (`agb_version`) und in
 * `subscriptions.agbVersion`; ein Studio-Tab mit alter Version wird vom
 * Server abgewiesen (server/onboardingV2/routerCommerce.ts).
 *
 * Preise kommen ausschließlich aus shared/pricing.ts / shared/pricingText.ts
 * (server/pricingLiterals.test.ts). Anbieterangaben = Impressum
 * (client/src/pages/PageblitzImpressum.tsx).
 */
import {
  ADDON_KEYS,
  ADDON_NAMES,
  PLANS,
  TRIAL_DAYS,
  VAT,
  addonPrice,
  formatEuro,
} from "./pricing";
import { PRICE_MONTHLY, PRICE_YEARLY } from "./pricingText";
import { CONTACT_EMAIL } from "./const";

/** Fassung der AGB (Datum, ISO). Neue Fassung = neuer Wert. */
export const AGB_VERSION = "2026-10-13";
/** „Stand“ für die Anzeige. */
export const AGB_STAND = "13.10.2026";
export const AGB_PATH = "/agb";
export const AGB_URL = `https://pageblitz.de${AGB_PATH}`;

/** Anbieter laut Impressum. */
export const AGB_PROVIDER = {
  brand: "Pageblitz",
  brandNote: "eine Marke von Schau und Horch",
  owner: "Christian Nießing, Diplom Designer",
  street: "Zum Waldschlösschen 19",
  zipCity: "46395 Bocholt",
  country: "Deutschland",
  email: CONTACT_EMAIL,
  phone: "+49 2871 349 2100",
  vatId: "DE277120646",
  seatCity: "Bocholt",
} as const;

/**
 * Pflicht-Häkchen im Checkout (B2B + AGB in einem). `linkText` wird auf der
 * Seite als Link auf AGB_PATH (neuer Tab) gerendert.
 */
export const CHECKOUT_CONSENT = {
  before:
    "Ich bestelle als Unternehmer oder Selbstständiger (§ 14 BGB) und akzeptiere die ",
  linkText: "AGB",
  after: ".",
} as const;
export const CHECKOUT_CONSENT_TEXT = `${CHECKOUT_CONSENT.before}${CHECKOUT_CONSENT.linkText}${CHECKOUT_CONSENT.after}`;

export interface AgbSection {
  /** Anker auf der Seite, z. B. `laufzeit`. */
  id: string;
  /** Überschrift ohne Paragraphen-Nummer. */
  title: string;
  /** Absätze; Nummerierung „(1)“ usw. entsteht beim Rendern. */
  paragraphs: readonly string[];
}

const Y = PLANS.yearly;
const P = AGB_PROVIDER;

const ADDON_LIST = ADDON_KEYS.map(
  key => `${ADDON_NAMES[key]} (${formatEuro(addonPrice(key))}/Monat)`
).join(", ");

export const AGB_SECTIONS: readonly AgbSection[] = [
  {
    id: "geltung",
    title: "Geltungsbereich und Anbieter",
    paragraphs: [
      `Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge über die Nutzung von Pageblitz zwischen ${P.owner}, ${P.street}, ${P.zipCity}, ${P.country}, handelnd unter „${P.brand} – ${P.brandNote}“ (USt-IdNr. ${P.vatId}; nachfolgend „Anbieter“), und seinen Kunden (nachfolgend „Kunde“).`,
      "Abweichende, entgegenstehende oder ergänzende Geschäftsbedingungen des Kunden werden nicht Vertragsbestandteil, auch wenn der Anbieter ihnen nicht ausdrücklich widerspricht.",
    ],
  },
  {
    id: "unternehmer",
    title: "Nur für Unternehmer",
    paragraphs: [
      "Das Angebot richtet sich ausschließlich an Unternehmer im Sinne von § 14 BGB, also an natürliche oder juristische Personen und rechtsfähige Personengesellschaften, die bei Vertragsschluss in Ausübung ihrer gewerblichen oder selbstständigen beruflichen Tätigkeit handeln. Verträge mit Verbrauchern (§ 13 BGB) schließt der Anbieter nicht.",
      "Der Kunde bestätigt vor der Bestellung ausdrücklich, als Unternehmer zu handeln. Der Anbieter darf den Nachweis der Unternehmereigenschaft verlangen (z. B. Gewerbeanmeldung oder USt-IdNr.). Hat der Kunde die Unternehmereigenschaft wahrheitswidrig bestätigt, darf der Anbieter den Vertrag außerordentlich kündigen.",
    ],
  },
  {
    id: "leistungen",
    title: "Leistungen",
    paragraphs: [
      "Pageblitz erstellt mithilfe künstlicher Intelligenz (KI) aus den Angaben des Kunden – etwa Firmenname, Daten aus einem Google-Unternehmensprofil, Texten und Bildern – eine Website für den Betrieb des Kunden und stellt sie für die Vertragslaufzeit online bereit (Software as a Service).",
      `Zum Grundumfang gehören: Bereitstellung und Betrieb (Hosting) der Website auf Servern in der Europäischen Union einschließlich SSL-Verschlüsselung, eine Adresse unter einer Subdomain von pageblitz.de, die Möglichkeit, eine eigene Domain des Kunden zu verbinden, das Bearbeiten von Inhalten, Bildern und Gestaltung im Pageblitz-Studio (auch mithilfe der Studio-KI) sowie aus den Angaben des Kunden erzeugte Vorlagen für Impressum und Datenschutzerklärung (siehe § 13).`,
      `Gegen gesondertes Entgelt können Erweiterungen („Extras“) hinzugebucht werden: ${ADDON_LIST}. Der jeweils aktuelle Funktionsumfang ergibt sich aus der Leistungsbeschreibung im Studio zum Zeitpunkt der Buchung.`,
      `Support leistet der Anbieter über den Hilfe-Chat im Studio und Kundenkonto (KI-Assistent mit Weiterleitung an einen Menschen) sowie per E-Mail an ${P.email}. Bestimmte Reaktionszeiten sind nicht geschuldet, sofern nicht ausdrücklich anders vereinbart.`,
      "Der Anbieter darf die Software weiterentwickeln und Funktionen ändern, soweit der vertraglich vereinbarte Kern der Leistung (Erstellung, Bearbeitung und Bereitstellung der Website) erhalten bleibt und die Änderung für den Kunden zumutbar ist.",
    ],
  },
  {
    id: "vertragsschluss",
    title: "Vertragsschluss",
    paragraphs: [
      "Die kostenlose Website-Vorschau ist noch kein Vertrag. Der Vertrag kommt zustande, wenn der Kunde im Studio Tarif und Extras wählt, die Unternehmereigenschaft bestätigt, diese AGB akzeptiert und die Bestellung beim Zahlungsdienstleister Stripe abschließt.",
      "Der Anbieter speichert den Zeitpunkt der Bestätigung und die akzeptierte Fassung dieser AGB. Die jeweils gültige Fassung ist unter pageblitz.de/agb abrufbar.",
    ],
  },
  {
    id: "test",
    title: "Kostenlose Testphase",
    paragraphs: [
      `Die ersten ${TRIAL_DAYS} Tage ab Bestellung sind kostenlos (Testphase). Kündigt der Kunde innerhalb der Testphase, endet der Vertrag mit Ablauf der Testphase, ohne dass Kosten entstehen.`,
      "Kündigt der Kunde nicht, beginnt nach Ablauf der Testphase die kostenpflichtige Nutzung im gewählten Tarif; die erste Zahlung wird automatisch fällig.",
    ],
  },
  {
    id: "preise",
    title: "Preise und Zahlung",
    paragraphs: [
      `Es gelten die bei Bestellung im Studio angezeigten Preise. Grundpreise: Jahrestarif ${PRICE_YEARLY} pro Monat, Monatstarif ${PRICE_MONTHLY} pro Monat. Extras kosten in beiden Tarifen denselben Monatspreis (§ 3 Abs. 3). Alle Preise sind Bruttopreise inklusive ${VAT.ratePercent} % Umsatzsteuer.`,
      "Die Entgelte werden monatlich im Voraus fällig und über den Zahlungsdienstleister Stripe (Stripe Payments Europe Ltd., Dublin, Irland) mit dem bei der Bestellung hinterlegten Zahlungsmittel eingezogen. Rechnungen werden elektronisch bereitgestellt.",
      "Werden Extras während eines Abrechnungsmonats hinzugebucht oder abbestellt, wird das Entgelt für den angebrochenen Monat anteilig berechnet bzw. gutgeschrieben.",
    ],
  },
  {
    id: "laufzeit",
    title: "Laufzeit und Kündigung",
    paragraphs: [
      `Jahrestarif: Die Mindestlaufzeit beträgt ${Y.termMonths} Monate und beginnt mit der ersten Zahlung nach der Testphase. Abgerechnet wird monatlich. Der Vertrag verlängert sich jeweils um weitere ${Y.renewMonths} Monate, wenn er nicht spätestens ${Y.noticeMonths} Monat vor Ablauf der jeweiligen Laufzeit gekündigt wird. Eine verspätete Kündigung wird zum Ende der folgenden Laufzeit wirksam.`,
      "Monatstarif: Der Vertrag läuft auf unbestimmte Zeit und kann jederzeit zum Ende des laufenden Abrechnungsmonats gekündigt werden.",
      "Extras haben keine eigene Mindestlaufzeit – auch nicht im Jahrestarif. Sie können jederzeit im Studio abbestellt werden und enden spätestens mit dem Vertrag über den Grundtarif.",
      `Die Kündigung erfolgt im Kundenkonto unter „Abonnement“ oder in Textform (z. B. per E-Mail an ${P.email}). Das Kundenkonto zeigt Laufzeitende und Kündigungsfrist an.`,
      "Das Recht beider Seiten zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.",
    ],
  },
  {
    id: "tarifwechsel",
    title: "Tarifwechsel",
    paragraphs: [
      `Ein Wechsel vom Monatstarif in den Jahrestarif ist jederzeit im Kundenkonto möglich. Er gilt ab der nächsten Abbuchung; mit dieser Zahlung beginnt eine neue Mindestlaufzeit von ${Y.termMonths} Monaten.`,
      `Ein Wechsel vom Jahrestarif in den Monatstarif ist nur zum Ende der jeweiligen Laufzeit möglich. Der Wunsch ist dem Anbieter spätestens ${Y.noticeMonths} Monat vor Laufzeitende in Textform mitzuteilen.`,
    ],
  },
  {
    id: "verzug",
    title: "Zahlungsverzug und Sperrung",
    paragraphs: [
      "Schlägt ein Einzug fehl oder gerät der Kunde mit einer Zahlung in Verzug, gelten die gesetzlichen Regeln. Der Kunde trägt die Kosten, die durch eine von ihm zu vertretende Rücklastschrift oder Zahlungsablehnung entstehen.",
      "Ist der Kunde mit einer fälligen Zahlung in Verzug, darf der Anbieter die Website nach vorheriger Ankündigung in Textform und fruchtlosem Ablauf einer Zahlungsfrist von 14 Tagen vorübergehend sperren (offline nehmen). Die Pflicht zur Zahlung der vereinbarten Entgelte bleibt während der Sperrung bestehen. Nach Zahlung wird die Website unverzüglich wieder freigeschaltet.",
      "Bei Verzug mit einem Betrag, der zwei Monatsentgelten entspricht, darf der Anbieter den Vertrag außerordentlich kündigen.",
    ],
  },
  {
    id: "preisaenderung",
    title: "Preisänderungen",
    paragraphs: [
      "Der Anbieter darf die Entgelte zum Beginn einer neuen Laufzeit (Jahrestarif) bzw. eines neuen Abrechnungsmonats (Monatstarif) anpassen, um gestiegene Kosten für Betrieb, Hosting, KI-Dienste oder Zahlungsabwicklung auszugleichen. Während einer laufenden Mindestlaufzeit bleibt der vereinbarte Preis unverändert.",
      "Preisänderungen kündigt der Anbieter mindestens 6 Wochen vor ihrem Wirksamwerden in Textform an. Der Kunde kann den Vertrag in diesem Fall bis zum Wirksamwerden der Änderung zu diesem Zeitpunkt kündigen (Sonderkündigungsrecht); der Anbieter weist in der Ankündigung darauf hin. Kündigt der Kunde nicht, gilt der neue Preis ab dem angekündigten Zeitpunkt.",
      "Ändert sich der gesetzliche Umsatzsteuersatz, ändern sich die Bruttopreise entsprechend.",
    ],
  },
  {
    id: "pflichten",
    title: "Pflichten des Kunden und Inhalte",
    paragraphs: [
      "Der Kunde ist für alle Inhalte verantwortlich, die er bereitstellt, freigibt oder auf seiner Website veröffentlicht – insbesondere Texte, Fotos, Logos, Preise, Öffnungszeiten und Kontaktdaten. Er sichert zu, die erforderlichen Rechte (Urheber-, Marken-, Persönlichkeits- und Nutzungsrechte) an selbst gelieferten Inhalten zu besitzen.",
      "Der Kunde darf keine rechtswidrigen Inhalte veröffentlichen, insbesondere keine Inhalte, die Rechte Dritter verletzen, irreführend oder wettbewerbswidrig sind, gegen Jugendschutz- oder Strafgesetze verstoßen oder Schadsoftware enthalten. Die Website darf nicht für Spam oder für Zwecke genutzt werden, die den Betrieb von Pageblitz beeinträchtigen.",
      "Werden Rechtsverletzungen bekannt oder machen Dritte begründet Ansprüche geltend, darf der Anbieter betroffene Inhalte oder die Website vorübergehend sperren. Er informiert den Kunden und gibt ihm, soweit zumutbar, Gelegenheit zur Abhilfe.",
      "Der Kunde stellt den Anbieter von Ansprüchen Dritter frei, die auf von ihm bereitgestellten oder freigegebenen Inhalten beruhen, einschließlich angemessener Kosten der Rechtsverteidigung, soweit der Kunde die Rechtsverletzung zu vertreten hat.",
      "Der Kunde hält seine Zugangsdaten geheim und informiert den Anbieter unverzüglich, wenn er einen Missbrauch vermutet.",
    ],
  },
  {
    id: "ki",
    title: "KI-erzeugte Inhalte",
    paragraphs: [
      "Texte, Bildvorschläge, Gestaltung und Antworten des KI-Chats werden ganz oder teilweise automatisch erzeugt. Sie können sachlich falsch, unvollständig oder unpassend sein und Angaben enthalten, die nicht auf den Betrieb des Kunden zutreffen.",
      "Der Kunde ist verpflichtet, alle erzeugten Inhalte vor der Veröffentlichung und bei Änderungen auf Richtigkeit, Vollständigkeit und Rechtmäßigkeit zu prüfen und bei Bedarf zu korrigieren. Mit der Freischaltung macht er sich die Inhalte zu eigen.",
      "Der Anbieter schuldet keinen bestimmten wirtschaftlichen Erfolg, insbesondere keine bestimmten Platzierungen in Suchmaschinen, Besucherzahlen, Anfragen oder Umsätze.",
    ],
  },
  {
    id: "rechtstexte",
    title: "Impressum und Datenschutzerklärung der Kundenwebsite",
    paragraphs: [
      "Die von Pageblitz aus den Angaben des Kunden erzeugten Texte für Impressum und Datenschutzerklärung sind unverbindliche Vorlagen und keine Rechtsberatung. Sie können die Verhältnisse des Kunden nicht vollständig abbilden.",
      "Der Kunde bleibt als Betreiber seiner Website allein dafür verantwortlich, dass Impressum, Datenschutzerklärung und sonstige Pflichtangaben vollständig, richtig und aktuell sind. Er prüft die Vorlagen und lässt sie im Zweifel rechtlich prüfen.",
    ],
  },
  {
    id: "nutzungsrechte",
    title: "Nutzungsrechte",
    paragraphs: [
      "Software, Designsysteme, Vorlagen und Programmcode von Pageblitz bleiben Eigentum des Anbieters. Der Kunde erhält für die Vertragslaufzeit das einfache, nicht übertragbare Recht, sie im Rahmen dieses Vertrags für seine Website zu nutzen.",
      "Der Kunde räumt dem Anbieter für die Vertragslaufzeit das einfache Recht ein, die von ihm bereitgestellten Inhalte zu speichern, zu bearbeiten (z. B. Bildgröße, Zuschnitt) und auf der Website öffentlich zugänglich zu machen, soweit dies zur Vertragserfüllung nötig ist.",
      "Bildnachweise eingebundener Stockfotos (z. B. von Unsplash) dürfen nicht entfernt werden, soweit die Lizenz sie verlangt.",
    ],
  },
  {
    id: "verfuegbarkeit",
    title: "Verfügbarkeit und Wartung",
    paragraphs: [
      "Der Anbieter bemüht sich um eine möglichst unterbrechungsfreie Erreichbarkeit der Websites. Eine bestimmte Verfügbarkeit ist nicht geschuldet, sofern sie nicht ausdrücklich gesondert vereinbart wird.",
      "Wartungsarbeiten führt der Anbieter nach Möglichkeit in nutzungsarmen Zeiten durch. Längere planbare Unterbrechungen kündigt er vorher an.",
      "Ausfälle, die der Anbieter nicht zu vertreten hat – etwa durch höhere Gewalt, Störungen im Internet außerhalb seines Einflussbereichs, Ausfälle von Vorleistern oder Angriffe Dritter –, begründen keine Ansprüche des Kunden.",
    ],
  },
  {
    id: "haftung",
    title: "Haftung",
    paragraphs: [
      "Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei Verletzung von Leben, Körper oder Gesundheit, nach dem Produkthaftungsgesetz sowie im Umfang einer übernommenen Garantie.",
      "Bei leichter Fahrlässigkeit haftet der Anbieter nur bei Verletzung einer wesentlichen Vertragspflicht (Kardinalpflicht), also einer Pflicht, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung der Kunde regelmäßig vertrauen darf. Die Haftung ist in diesem Fall auf den bei Vertragsschluss vorhersehbaren, vertragstypischen Schaden begrenzt.",
      "Im Übrigen ist die Haftung ausgeschlossen. Die verschuldensunabhängige Haftung für bei Vertragsschluss vorhandene Mängel (§ 536a Abs. 1 Alt. 1 BGB) ist ausgeschlossen.",
      "Für den Verlust von Daten haftet der Anbieter nur in Höhe des Aufwands, der bei ordnungsgemäßer, regelmäßiger Datensicherung zur Wiederherstellung erforderlich gewesen wäre. Der Kunde bewahrt Kopien seiner Originaldateien (z. B. Fotos, Logos, Texte) selbst auf.",
      "Die vorstehenden Beschränkungen gelten auch zugunsten der Erfüllungs- und Verrichtungsgehilfen des Anbieters.",
    ],
  },
  {
    id: "datenschutz",
    title: "Datenschutz und Auftragsverarbeitung",
    paragraphs: [
      "Wie der Anbieter personenbezogene Daten des Kunden verarbeitet, steht in der Datenschutzerklärung unter pageblitz.de/datenschutz.",
      "Soweit über die Website des Kunden personenbezogene Daten von Besuchern verarbeitet werden – etwa über Kontaktformular, Terminbuchung, KI-Chat oder Besucherstatistik –, ist der Kunde Verantwortlicher und der Anbieter Auftragsverarbeiter (Art. 28 DSGVO). Hierfür gilt der Vertrag über die Auftragsverarbeitung (AVV) des Anbieters, der Bestandteil dieses Vertrags ist und dem Kunden auf Anfrage bereitgestellt wird.",
    ],
  },
  {
    id: "vertragsende",
    title: "Vertragsende, Herausgabe und Domains",
    paragraphs: [
      "Mit Ende des Vertrags nimmt der Anbieter die Website offline; die Subdomain unter pageblitz.de wird freigegeben. Ein Anspruch auf eine bestimmte Subdomain besteht nicht, auch nicht nach Vertragsende.",
      `Auf Verlangen in Textform, das innerhalb von 30 Tagen nach Vertragsende beim Anbieter eingeht, stellt der Anbieter dem Kunden die von ihm eingebrachten Inhalte (Texte, Fotos, Logo) in einem gängigen Dateiformat zur Verfügung. Ein Anspruch auf Herausgabe des Programmcodes, der Designsysteme oder einer lauffähigen Kopie der Website besteht nicht. Nach Ablauf der 30 Tage darf der Anbieter die Daten löschen, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.`,
      "Der Anbieter registriert keine Domains im Namen des Kunden. Eine eigene Domain bleibt beim Domain-Anbieter des Kunden registriert und wird lediglich per DNS-Eintrag mit Pageblitz verbunden. Nach Vertragsende entfernt oder ändert der Kunde diesen Eintrag selbst; einer Übertragung bedarf es nicht.",
    ],
  },
  {
    id: "schluss",
    title: "Schlussbestimmungen",
    paragraphs: [
      "Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.",
      `Ist der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist ausschließlicher Gerichtsstand für alle Streitigkeiten aus diesem Vertrag der Sitz des Anbieters (${P.seatCity}). Der Anbieter darf den Kunden auch an dessen allgemeinem Gerichtsstand verklagen.`,
      "Erklärungen zum Vertrag (z. B. Kündigung, Ankündigungen, Herausgabeverlangen) bedürfen der Textform; eine E-Mail genügt. Die Kündigung im Kundenkonto steht der Textform gleich.",
      "Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. An die Stelle der unwirksamen Bestimmung tritt die gesetzliche Regelung.",
    ],
  },
];

/** Paragraphen-Label „§ 3“. */
export function agbSectionNumber(index: number): string {
  return `§ ${index + 1}`;
}

/** Klartext/Markdown der AGB (für docs/agb-entwurf.md und Prüfungen). */
export function agbToMarkdown(): string {
  const head = [
    "# Allgemeine Geschäftsbedingungen (AGB) von Pageblitz",
    "",
    `Fassung ${AGB_VERSION} · Stand: ${AGB_STAND}`,
    "",
  ];
  const body = AGB_SECTIONS.flatMap((section, i) => [
    `## ${agbSectionNumber(i)} ${section.title}`,
    "",
    ...section.paragraphs.flatMap((p, j) => [
      section.paragraphs.length > 1 ? `(${j + 1}) ${p}` : p,
      "",
    ]),
  ]);
  return [...head, ...body].join("\n").trimEnd() + "\n";
}
