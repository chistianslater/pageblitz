import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import "../../packs";
import "../registry";
import { SiteRenderer } from "../../SiteRenderer";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { withDesignSystem } from "../../../../../../shared/designSystems/apply";
import { INDUSTRY_IMAGES } from "../../../../../../shared/industryImages";
import {
  findShowcase,
  systemShowcaseDoc,
} from "../../../../../../shared/stylePacks/blueprintShowcase";

/**
 * Testhilfen für Klar: die drei Betriebe aus Systemblatt 8 (alles
 * erfunden: 555-Nummern, `.example`) auf Basis der Beispielbetriebe
 * Zahnarzt, Heilpraktikerin, Steuerberater.
 */
export const klarDoc = (palette?: string, showcase = "zahnarzt") =>
  systemShowcaseDoc(findShowcase(showcase)!, "klar", palette);

/** Fixture-Dokument (Unterseiten, Extras) in Klar. */
export const klarFixture = (
  kind: "full" | "minimal" | "features" = "full",
  palette?: string
) => withDesignSystem(getFixture("werkbank", kind), "klar", palette);

/** Dienstag, 13.10.2026, 10 Uhr in Berlin. */
export const TEST_NOW = new Date("2026-10-13T10:00:00+02:00");

export const render = (
  data = klarDoc(),
  preview = false,
  basePath = "",
  pathname?: string,
  slug = "",
  now = TEST_NOW
) =>
  renderToStaticMarkup(
    <SiteRenderer
      data={data}
      slug={slug}
      basePath={basePath}
      islandsMode={preview ? "preview" : "live"}
      preview={preview}
      pathname={pathname}
      now={now}
    />
  );

export type Doc = ReturnType<typeof klarDoc>;
type Sec = Doc["sections"][number];
type Patch<T extends Sec["type"]> = (
  s: Extract<Sec, { type: T }>
) => Extract<Sec, { type: T }>;

/** Abschnitt eines Typs ersetzen. */
export function patchSection<T extends Sec["type"]>(
  doc: Doc,
  type: T,
  patch: Patch<T>
): Doc {
  return {
    ...doc,
    sections: doc.sections.map(s =>
      s.type === type ? patch(s as Extract<typeof s, { type: T }>) : s
    ),
  };
}

/** Kontakt-Abschnitt ersetzen. */
export const withContact = (
  doc: Doc,
  patch: Partial<Extract<Sec, { type: "contact" }>>
) => patchSection(doc, "contact", c => ({ ...c, ...patch }));

/** Abschnitt (Typ) entfernen. */
export const without = (doc: Doc, ...types: Sec["type"][]): Doc => ({
  ...doc,
  sections: doc.sections.filter(s => !types.includes(s.type)),
});

/** Bildwirkung des Einstiegsfotos setzen (stage = großes Querformat). */
export const withComposition = (
  doc: Doc,
  composition: "stage" | "portrait"
): Doc => ({
  ...doc,
  designProfile: { ...doc.designProfile!, composition },
});

/** Vorteile-Abschnitt mit diesen Titeln (Fakten-Chips). */
export function withUsp(doc: Doc, titles: string[]): Doc {
  const usp = { type: "usp" as const, items: titles.map(title => ({ title })) };
  const rest = doc.sections.filter(s => s.type !== "usp");
  const at = rest.findIndex(s => s.type === "hero") + 1;
  return {
    ...doc,
    sections: [...rest.slice(0, at), usp, ...rest.slice(at)] as Doc["sections"],
  };
}

/** Systemblatt 8 links: Zahnarztpraxis Dr. Sommer, gutes Foto (Lind). */
export function zahnDoc(palette = "lind"): Doc {
  const base = klarDoc(palette, "zahnarzt");
  let doc: Doc = {
    ...base,
    businessName: "Zahnarztpraxis Dr. Sommer",
    businessCategory: "Zahnarztpraxis",
    google: { rating: 4.8, reviewCount: 212 },
    amenities: { wheelchair: true },
    // Gebuchtes Kontaktformular: „Termin vereinbaren" führt zu #kontakt.
    features: { ...base.features, contactForm: true },
  };
  doc = withContact(doc, {
    phone: "04131 555 0142",
    email: "praxis@dr-sommer.example",
    street: "Lindenweg 12",
    zip: "21335",
    city: "Lüneburg",
    openingHours: [
      { day: "Mo", hours: "8:00 – 12:00, 14:00 – 18:00" },
      { day: "Di", hours: "8:00 – 12:00, 14:00 – 18:00" },
      { day: "Mi", hours: "8:00 – 13:00" },
      { day: "Do", hours: "8:00 – 12:00, 14:00 – 19:00" },
      { day: "Fr", hours: "8:00 – 13:00" },
      { day: "Sa", hours: "geschlossen" },
      { day: "So", hours: "geschlossen" },
    ],
  });
  doc = patchSection(doc, "hero", h => ({
    ...h,
    headline: "Gut aufgehoben. Von Anfang an.",
    subheadline:
      "Behutsame Zahnmedizin für die ganze Familie. Wir erklären jeden Schritt, bevor wir anfangen.",
    ctaText: "Termin vereinbaren",
    ctaHref: undefined,
    imageUrl: INDUSTRY_IMAGES.zahnarzt.hero[0],
  }));
  return withComposition(withUsp(doc, ["Alle Kassen", "Privat"]), "stage");
}

/** Systemblatt 8 Mitte: Physiotherapie Lindner, schwaches Foto (Sand). */
export function physioDoc(palette = "sand"): Doc {
  let doc: Doc = {
    ...klarDoc(palette, "naturheil"),
    businessName: "Physiotherapie Lindner",
    businessCategory: "Physiotherapie",
  };
  delete doc.google;
  delete doc.amenities;
  doc = withContact(doc, {
    phone: "05141 555 0187",
    email: "team@physio-lindner.example",
    street: "Mühlenstraße 4",
    zip: "29221",
    city: "Celle",
    openingHours: [
      { day: "Mo–Do", hours: "7:30 – 20:00" },
      { day: "Fr", hours: "7:30 – 14:00" },
      { day: "Sa–So", hours: "geschlossen" },
    ],
  });
  doc = patchSection(doc, "hero", h => ({
    ...h,
    headline: "Termine auch abends.",
    subheadline:
      "Krankengymnastik, Manuelle Therapie und Lymphdrainage. Mit Rezept oder als Selbstzahler.",
    ctaText: "Termin anfragen",
    ctaHref: undefined,
    imageUrl: INDUSTRY_IMAGES.physio.hero[0],
  }));
  doc = patchSection(doc, "services", s => ({
    ...s,
    headline: "Behandlungen",
    items: [
      {
        title: "Krankengymnastik",
        description: "Kräftigen, dehnen, wieder sicher bewegen.",
      },
      {
        title: "Manuelle Therapie",
        description: "Für Rücken, Nacken und Gelenke.",
      },
      {
        title: "Hausbesuche",
        description: "Wenn Sie nicht zu uns kommen können.",
      },
    ],
  }));
  return withComposition(withUsp(doc, ["Alle Kassen", "Privat"]), "portrait");
}

/** Systemblatt 8 rechts: Steuerkanzlei Brandt, ohne Foto (Wasser). */
export function kanzleiDoc(palette = "wasser"): Doc {
  let doc: Doc = {
    ...klarDoc(palette, "steuerberater"),
    businessName: "Steuerkanzlei Brandt",
    businessCategory: "Steuerberater",
  };
  delete doc.google;
  delete doc.amenities;
  doc = withContact(doc, {
    phone: "05121 555 0119",
    email: "kanzlei@brandt-steuer.example",
    street: "Almsstraße 21",
    zip: "31134",
    city: "Hildesheim",
    openingHours: [
      { day: "Mo", hours: "8:30 – 17:00" },
      { day: "Di", hours: "8:30 – 17:00" },
      { day: "Mi", hours: "8:30 – 13:00" },
      { day: "Do", hours: "8:30 – 18:00" },
      { day: "Fr", hours: "8:30 – 13:00" },
      { day: "Sa", hours: "geschlossen" },
      { day: "So", hours: "geschlossen" },
    ],
  });
  doc = patchSection(doc, "hero", h => {
    const { imageUrl: _drop, ...rest } = h;
    return {
      ...rest,
      headline: "Ihre Steuern. In ruhigen Händen.",
      subheadline:
        "Für Angestellte, Rentner und kleine Betriebe. Das Erstgespräch kostet nichts.",
      ctaText: "Erstgespräch vereinbaren",
      ctaHref: undefined,
    };
  });
  return without(doc, "usp");
}

/** HTML eines Kapitels (`kl-sec kl-<typ>`), leer wenn es fehlt. */
export const sectionHtml = (html: string, type: string) => {
  const at = html.search(new RegExp(`class="kl-sec kl-${type}[" ]`));
  if (at === -1) return "";
  const start = html.lastIndexOf("<section", at);
  return html.slice(start, html.indexOf("</section>", start));
};

/** Abschnitte ersetzen: Einstieg bleibt vorn, danach `rest` in Reihenfolge. */
function withSections(doc: Doc, rest: Sec[]): Doc {
  const keep = (t: Sec["type"]) => doc.sections.filter(s => s.type === t);
  return {
    ...doc,
    sections: [...keep("hero"), ...keep("usp"), ...rest, ...keep("contact")],
  };
}

/**
 * Ganze Seite Zahnarztpraxis Dr. Sommer nach Systemblatt 9–11 und 13
 * (alles erfunden): Leistungen, erster Termin, Team (Monogramme), Galerie,
 * Stimmen, Fragen, Kontakt.
 */
export function zahnFullDoc(palette = "lind"): Doc {
  return withSections(zahnDoc(palette), [
    {
      type: "services",
      headline: "Was wir für Sie tun",
      items: [
        { title: "Vorsorge und Zahnreinigung", description: "Untersuchung, professionelle Reinigung, Röntgen nur wenn nötig.", price: "ab 89 €" },
        { title: "Füllungen und Wurzelbehandlung", description: "Zahnfarbene Füllungen, gründlich betäubt." },
        { title: "Zahnersatz", description: "Kronen, Brücken, Prothesen. Kostenplan vorab schriftlich.", price: "auf Anfrage" },
        { title: "Für Angstpatienten", description: "Mehr Zeit, Pause auf Handzeichen." },
      ],
      link: { text: "Alle Leistungen", href: "/leistungen" },
    },
    {
      type: "process",
      steps: [
        { title: "Anrufen oder online buchen", text: "Sagen Sie uns kurz, worum es geht. Wir nennen Ihnen einen Termin." },
        { title: "Ankommen", text: "Den Fragebogen füllen wir gemeinsam am Empfang aus." },
        { title: "Untersuchung und Gespräch", text: "Wir zeigen Ihnen die Aufnahmen am Bildschirm und erklären, was wir sehen." },
        { title: "Ihr Plan, schriftlich", text: "Alle Schritte und Kosten auf Papier. Entscheiden müssen Sie nichts sofort." },
      ],
    },
    {
      type: "team",
      members: [
        { name: "Dr. Katrin Sommer", role: "Zahnärztin, Inhaberin" },
        { name: "Jonas Petersen", role: "Zahnarzt" },
        { name: "Aylin Demir", role: "Prophylaxe" },
      ],
    },
    {
      type: "gallery",
      headline: "Einblicke in die Praxis",
      images: INDUSTRY_IMAGES.zahnarzt.gallery!.slice(0, 3).map((url, i) => ({
        url,
        alt: ["Behandlungsraum", "Empfang", "Röntgenbild am Bildschirm"][i],
      })),
    },
    {
      type: "testimonials",
      headline: "Was Patienten sagen",
      items: [
        { author: "Renate K.", text: "Ich hatte zwölf Jahre Angst vor dem Bohrer. Hier wurde jeder Schritt erklärt, und ich durfte jederzeit Pause machen.", rating: 5 },
        { author: "Jens M.", text: "Kurze Wartezeit, freundlicher Empfang und eine ruhige Behandlung ohne Hektik.", rating: 4 },
      ],
    },
    {
      type: "faq",
      items: [
        { question: "Nehmen Sie neue Patienten auf?", answer: "Ja. Rufen Sie an, wir finden einen Termin und sagen Ihnen, was Sie mitbringen." },
        { question: "Ich habe Angst. Was können Sie tun?", answer: "Wir nehmen uns mehr Zeit und machen Pause, sobald Sie die Hand heben." },
        { question: "Was zahlt meine Kasse?", answer: "Vorsorge und Füllungen zahlt die Kasse. Für alles andere bekommen Sie vorher einen Kostenplan." },
      ],
    },
    { type: "cta", headline: "Wir freuen uns auf Sie.", ctaText: "Termin vereinbaren" },
  ] as Sec[]);
}

/** Ganze Seite Physiotherapie Lindner (Sand): mit Preisliste und Aufruf. */
export function physioFullDoc(palette = "sand"): Doc {
  const base = physioDoc(palette);
  const services = base.sections.find(s => s.type === "services")!;
  return withSections(base, [
    {
      ...(services as Extract<Sec, { type: "services" }>),
      items: [
        { title: "Krankengymnastik", description: "Kräftigen, dehnen, wieder sicher bewegen." },
        { title: "Manuelle Therapie", description: "Für Rücken, Nacken und Gelenke." },
        { title: "Lymphdrainage", description: "Sanft, nach Operationen und bei Schwellungen." },
        { title: "Hausbesuche", description: "Wenn Sie nicht zu uns kommen können." },
      ],
    },
    {
      type: "pricelist",
      headline: "Preise für Selbstzahler",
      categories: [
        {
          name: "Für Selbstzahler, je Behandlung",
          items: [
            { name: "Krankengymnastik", price: "32 €" },
            { name: "Manuelle Therapie", price: "38 €" },
            { name: "Lymphdrainage", price: "36 €" },
            { name: "Klassische Massage", price: "29" },
          ],
        },
      ],
    },
    {
      type: "process",
      steps: [
        { title: "Verordnung mitbringen", text: "Ihr Rezept vom Arzt. Ohne Rezept behandeln wir als Selbstzahler." },
        { title: "Befund", text: "Wir fragen nach Ihren Beschwerden und schauen uns die Bewegung an." },
        { title: "Behandlung", text: "Wir beginnen gleich und erklären, was wir tun." },
        { title: "Übungen für zu Hause", text: "Sie bekommen Ihre Übungen ausgedruckt mit." },
      ],
    },
    {
      type: "team",
      members: [
        { name: "Marie Lindner", role: "Physiotherapeutin, Inhaberin" },
        { name: "Tobias Wendt", role: "Manuelle Therapie" },
        { name: "Svenja Koch", role: "Lymphdrainage" },
      ],
    },
    {
      type: "faq",
      items: [
        { question: "Brauche ich ein Rezept?", answer: "Für die Kasse ja. Ohne Rezept zahlen Sie selbst, die Preise stehen oben." },
        { question: "Kommen Sie auch nach Hause?", answer: "Ja, mit Verordnung für Hausbesuche." },
        { question: "Wie schnell bekomme ich einen Termin?", answer: "Meist in der gleichen Woche, abends auch kurzfristig." },
      ],
    },
    { type: "cta", headline: "Rufen Sie an, wir finden einen Abend.", ctaText: "Termin anfragen" },
  ] as Sec[]);
}

/** Ganze Seite Steuerkanzlei Brandt (Wasser): ohne Fotos, mit Erstgespräch. */
export function kanzleiFullDoc(palette = "wasser"): Doc {
  return withSections(kanzleiDoc(palette), [
    {
      type: "services",
      headline: "Wobei wir helfen",
      items: [
        { title: "Steuererklärung", description: "Für Angestellte, Rentner und Vermieter." },
        { title: "Buchhaltung und Lohn", description: "Für Betriebe bis etwa 20 Mitarbeiter." },
        { title: "Jahresabschluss", description: "Bilanz oder Einnahmen-Überschuss-Rechnung." },
        { title: "Existenzgründung", description: "Rechtsform, Finanzamt, erste Schritte." },
      ],
    },
    {
      type: "process",
      steps: [
        { title: "Anrufen", text: "Wir vereinbaren einen Termin, in der Kanzlei oder am Telefon." },
        { title: "Unterlagen", text: "Sie bekommen vorab eine kurze Liste, was wir sehen möchten." },
        { title: "Gespräch", text: "Wir hören zu und sagen ehrlich, was wir für Sie tun können." },
        { title: "Angebot", text: "Sie bekommen ein schriftliches Angebot. Ohne Verpflichtung." },
      ],
    },
    {
      type: "team",
      members: [
        { name: "Henrike Brandt", role: "Steuerberaterin" },
        { name: "Mehmet Yıldız", role: "Steuerfachwirt" },
      ],
    },
    {
      type: "faq",
      items: [
        { question: "Was kostet die Steuererklärung?", answer: "Das richtet sich nach der Gebührenverordnung. Im Erstgespräch nennen wir Ihnen den Betrag." },
        { question: "Muss ich in die Kanzlei kommen?", answer: "Nein. Vieles klären wir am Telefon oder per E-Mail." },
        { question: "Helfen Sie auch Rentnern?", answer: "Ja, gern. Auch bei der ersten Steuererklärung nach dem Berufsleben." },
      ],
    },
    { type: "cta", headline: "Ein Gespräch kostet nichts.", ctaText: "Erstgespräch vereinbaren" },
  ] as Sec[]);
}
