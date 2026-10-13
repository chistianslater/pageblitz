import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import "../registry";
import { SiteRenderer } from "../../SiteRenderer";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { withDesignSystem } from "../../../../../../shared/designSystems/apply";
import { INDUSTRY_IMAGES } from "../../../../../../shared/industryImages";
import {
  findShowcase,
  systemShowcaseDoc,
} from "../../../../../../shared/showcases/blueprintShowcase";

/**
 * Testhilfen für Freundlich: die drei Betriebe aus Systemblatt 10 (alles
 * erfunden: 555-Nummern, `.example`) — Kita Pusteblume (kein Foto, Wald),
 * Fellfreunde (gutes Foto, Himmel), Gelato Mio (schwaches Foto, Beere).
 */
export const freundlichDoc = (palette?: string, showcase = "musikschule") =>
  systemShowcaseDoc(findShowcase(showcase)!, "freundlich", palette);

/** Fixture-Dokument (Unterseiten, Extras) in Freundlich. */
export const freundlichFixture = (
  kind: "full" | "minimal" | "features" = "full",
  palette?: string
) => withDesignSystem(getFixture("werkbank", kind), "freundlich", palette);

/** Donnerstag, 15.10.2026, 10 Uhr in Berlin. */
export const TEST_NOW = new Date("2026-10-15T10:00:00+02:00");

export const render = (
  data = freundlichDoc(),
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

export type Doc = ReturnType<typeof freundlichDoc>;
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

/** Bildwirkung des Einstiegsfotos setzen (stage = Prüfung „gut"). */
export const withComposition = (
  doc: Doc,
  composition: "stage" | "portrait"
): Doc => ({
  ...doc,
  designProfile: { ...doc.designProfile!, composition },
});

/** Ohne jedes Foto (Einstieg, Über uns, Galerie). */
export function withoutPhotos(doc: Doc): Doc {
  const rest = without(doc, "gallery");
  return {
    ...rest,
    sections: rest.sections.map(s => {
      if (s.type === "hero" || s.type === "about") {
        const { imageUrl: _drop, ...r } = s;
        return r as typeof s;
      }
      return s;
    }),
  };
}

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr"] as const;

/** Abschnitte in fester Reihenfolge: Einstieg + Kontakt aus dem Dokument, dazwischen `middle`, danach `after`. */
function arrange(doc: Doc, middle: Sec[], after: Sec[] = []): Doc {
  const hero = doc.sections.find(s => s.type === "hero")!;
  const contact = doc.sections.find(s => s.type === "contact")!;
  return { ...doc, sections: [hero, ...middle, contact, ...after] };
}

const voices = (...items: [string, string][]) => ({
  type: "testimonials" as const,
  headline: "Was andere sagen",
  items: items.map(([author, text]) => ({ author, text, rating: 5 })),
});

const faq = (...items: [string, string][]) => ({
  type: "faq" as const,
  headline: "Gut zu wissen",
  items: items.map(([question, answer]) => ({ question, answer })),
});

const gallery = (urls: readonly string[], alt: string) => ({
  type: "gallery" as const,
  headline: "Aus dem Alltag",
  images: urls.slice(0, 3).map((url, i) => ({ url, alt: `${alt} ${i + 1}` })),
});

/** Systemblatt 10 links: Kita Pusteblume, kein Foto (Wald). */
export function pusteblumeDoc(palette = "wald"): Doc {
  let doc: Doc = {
    ...freundlichDoc(palette, "musikschule"),
    businessName: "Kita Pusteblume",
    businessCategory: "Kita",
    blueprintFamily: "family",
    tagline: undefined,
    google: undefined,
    amenities: undefined,
  };
  doc = { ...doc, features: { ...doc.features, contactForm: true } };
  doc = withContact(doc, {
    phone: "0555 3102 44",
    email: "hallo@pusteblume.example",
    street: "Hemmstraße 12",
    zip: "28215",
    city: "Bremen-Findorff",
    openingHours: [
      ...WEEKDAYS.map(day => ({ day, hours: "7:30 – 16:30" })),
      { day: "Sa", hours: "geschlossen" },
      { day: "So", hours: "geschlossen" },
    ],
  });
  doc = patchSection(doc, "hero", h => ({
    ...h,
    headline: "Klein, warm, mitten im Viertel.",
    subheadline:
      "Zwölf Kinder, vier Erzieherinnen und ein Garten mit Apfelbaum. Wir nehmen uns Zeit fürs Ankommen.",
    ctaText: "Platz anfragen",
    ctaHref: undefined,
  }));
  doc = arrange(
    doc,
    [
      {
        type: "services",
        headline: "Ein Tag bei uns",
        intro:
          "Feste Abläufe geben Sicherheit. Dazwischen ist viel Platz zum Spielen.",
        items: [
          { title: "Eingewöhnung", description: "Nach dem Berliner Modell, zwei bis drei Wochen, immer mit Mama oder Papa." },
          { title: "Tagesablauf", description: "Frühstück um 8:30, Morgenkreis, Spielen, Mittag um 11:30, Schlafen." },
          { title: "Essen", description: "Bio-Mittagessen aus der Küche nebenan, vegetarisch an drei Tagen." },
          { title: "Draußen", description: "Jeden Tag in den Garten, bei jedem Wetter. Matschhosen haben wir." },
        ],
      },
      {
        type: "stats",
        headline: "Wir sind klein, damit jedes Kind gesehen wird.",
        items: [
          { value: "12", label: "Plätze, nie mehr" },
          { value: "1:3", label: "Betreuung im Alltag" },
          { value: "2011", label: "eröffnet in Findorff" },
        ],
      },
      {
        type: "process",
        headline: "So läuft es ab",
        steps: [
          { title: "Kennenlernen", text: "Ihr schaut euch um, wir erzählen vom Alltag. Kinder dürfen mit." },
          { title: "Anmeldung", text: "Ihr bekommt Bescheid, ob ein Platz frei wird, und den Vertrag." },
          { title: "Eingewöhnung", text: "Mit euch, in kleinen Schritten, bis euer Kind sich wohlfühlt." },
        ],
      },
      {
        type: "team",
        headline: "Wer bei uns ist",
        members: [
          { name: "Anke Bremer", role: "Leitung, Erzieherin" },
          { name: "Tomás Reyes", role: "Erzieher" },
          { name: "Lea Wichmann", role: "Kinderpflegerin" },
        ],
      },
      voices(
        ["Jana K.", "Nach drei Wochen wollte unsere Tochter am liebsten dort übernachten."],
        ["Mehmet und Sara", "Klein, herzlich und immer ehrlich zu uns Eltern."],
        ["Familie Ott", "Die Eingewöhnung war entspannter als gedacht."]
      ),
      faq(
        ["Wie läuft die Eingewöhnung?", "Nach dem Berliner Modell: die ersten Tage eine Stunde mit euch, dann werden die Zeiten länger. Rechnet mit zwei bis drei Wochen."],
        ["Was kostet ein Platz?", "Das richtet sich nach dem Einkommen und der Betreuungszeit. Wir rechnen es euch gern aus."],
        ["Was muss mitgebracht werden?", "Wechselkleidung, Hausschuhe, Matschhose und ein Kuscheltier."]
      ),
    ] as Sec[],
    [{ type: "cta", headline: "Ein Platz für euer Kind?", ctaText: "Platz anfragen" }] as Sec[]
  );
  return withoutPhotos(withComposition(doc, "portrait"));
}

/** Systemblatt 10 Mitte: Hundesalon Fellfreunde, gutes Foto (Himmel). */
export function fellfreundeDoc(palette = "himmel"): Doc {
  let doc: Doc = {
    ...freundlichDoc(palette, "friseur"),
    businessName: "Fellfreunde",
    businessCategory: "Hundesalon",
    blueprintFamily: "pets",
    tagline: undefined,
    google: { rating: 4.9, reviewCount: 86 },
    amenities: { wheelchair: true },
  };
  doc = { ...doc, features: { ...doc.features, contactForm: true } };
  doc = withContact(doc, {
    phone: "0555 7781 20",
    email: "wuff@fellfreunde.example",
    street: "Georg-Schumann-Straße 140",
    zip: "04159",
    city: "Leipzig-Gohlis",
    openingHours: [
      { day: "Mo", hours: "geschlossen" },
      ...WEEKDAYS.slice(1).map(day => ({ day, hours: "9:00 – 18:00" })),
      { day: "Sa", hours: "9:00 – 14:00" },
      { day: "So", hours: "geschlossen" },
    ],
  });
  doc = patchSection(doc, "hero", h => ({
    ...h,
    headline: "Frisch gebürstet, ganz entspannt.",
    subheadline:
      "Waschen, schneiden, Krallen kürzen. In Ruhe, ohne Käfig, mit Zeit zum Schnuppern.",
    ctaText: "Termin anfragen",
    ctaHref: undefined,
    imageUrl: INDUSTRY_IMAGES.hundesalon.hero[0],
  }));
  doc = arrange(
    doc,
    [
      {
        type: "services",
        headline: "Was wir für euren Hund tun",
        intro:
          "Preise je nach Größe und Fell. Am Telefon sagen wir euch den genauen Preis.",
        items: [
          { title: "Waschen und Föhnen", description: "Mildes Shampoo, warm geföhnt, Ohren sauber.", price: "ab 35 €" },
          { title: "Schneiden", description: "Rassetypisch oder pflegeleicht, ganz wie ihr wollt.", price: "ab 55 €" },
          { title: "Krallen und Pfoten", description: "Kürzen, Fell zwischen den Ballen, Pfotenbalsam.", price: "12 €" },
          { title: "Welpen-Kennenlernen", description: "Zwanzig Minuten Salon schnuppern, ohne Schere.", price: "20 €" },
        ],
      },
      {
        type: "process",
        headline: "So läuft es ab",
        steps: [
          { title: "Ankommen und schnuppern", text: "Euer Hund lernt uns kennen, bevor irgendwas passiert." },
          { title: "Pflege in Ruhe", text: "Pausen, wenn er sie braucht. Keine Box, kein Zeitdruck." },
          { title: "Abholen mit Foto", text: "Ihr bekommt ein Foto, sobald er fertig und trocken ist." },
        ],
      },
      gallery(INDUSTRY_IMAGES.hundesalon.gallery ?? [], "Hund im Salon"),
      voices(
        ["Katrin L.", "Unser ängstlicher Balu geht inzwischen freiwillig rein. Das sagt alles."],
        ["Thomas R.", "Pudelschnitt wie gewünscht, und sie haben sich Zeit genommen."],
        ["Anja B.", "Endlich ein Salon ohne Käfige."]
      ),
      faq(
        ["Mein Hund ist ängstlich. Geht das?", "Ja. Wir planen mehr Zeit ein, machen Pausen und brechen ab, wenn es nicht geht. Das Kennenlernen kostet nichts extra."],
        ["Wie lange dauert es?", "Je nach Fell eine bis drei Stunden. Wir rufen an, wenn er fertig ist."],
        ["Muss ich dableiben?", "Nein. Ihr könnt ihn bringen und später abholen."]
      ),
    ] as Sec[],
    [{ type: "cta", headline: "Termin für euren Hund?", ctaText: "Termin anfragen" }] as Sec[]
  );
  return withComposition(doc, "stage");
}

/** Systemblatt 10 rechts: Eiscafé Gelato Mio, schwaches Foto (Beere). */
export function gelatoDoc(palette = "beere"): Doc {
  let doc: Doc = {
    ...freundlichDoc(palette, "cafe"),
    businessName: "Gelato Mio",
    businessCategory: "Eiscafé",
    blueprintFamily: "gastro",
    tagline: undefined,
    google: { rating: 4.7, reviewCount: 312 },
    amenities: { takeout: true, vegetarian: true },
  };
  doc = withContact(doc, {
    phone: "0555 9024 66",
    email: "ciao@gelato-mio.example",
    street: "Rudolf-von-Bennigsen-Ufer 22",
    zip: "30173",
    city: "Hannover",
    openingHours: [
      ...WEEKDAYS.map(day => ({ day, hours: "12:00 – 21:00" })),
      { day: "Sa", hours: "11:00 – 22:00" },
      { day: "So", hours: "11:00 – 21:00" },
    ],
  });
  doc = patchSection(doc, "hero", h => ({
    ...h,
    headline: "Hausgemachtes Eis am Wasser.",
    subheadline:
      "Jeden Morgen frisch gerührt, mit Milch vom Hof Lindemann. Zum Mitnehmen oder auf der Terrasse.",
    ctaText: "Route planen",
    ctaHref: undefined,
    imageUrl: INDUSTRY_IMAGES.eisdiele.hero[0],
  }));
  doc = { ...doc, addOns: { ...doc.addOns, menu: true } };
  doc = arrange(
    doc,
    [
      {
        type: "menu",
        headline: "Was es bei uns gibt",
        categories: [
          {
            name: "Eis und mehr",
            items: [
              { name: "Eis in der Waffel", description: "Zwanzig Sorten, mindestens drei vegan.", price: "1,90 € je Kugel" },
              { name: "Becher", description: "Erdbeer, Spaghetti-Eis, Joghurt-Mango.", price: "ab 6,50 €" },
              { name: "Eistorten", description: "Auf Bestellung, drei Tage vorher.", price: "ab 32 €" },
              { name: "Kaffee", description: "Siebträger, Affogato mit einer Kugel.", price: "ab 2,40 €" },
            ],
          },
        ],
      },
      gallery(INDUSTRY_IMAGES.eisdiele.gallery ?? [], "Eis"),
      voices(
        ["Lukas F.", "Das Pistazieneis schmeckt wie in Bologna, ehrlich."],
        ["Selin Y.", "Netter Service, auch wenn die Schlange lang ist."],
        ["Maren und Ole", "Die vegane Schoko ist besser als die normale."]
      ),
      faq(
        ["Habt ihr bei Regen geöffnet?", "Ja, drinnen sind zwanzig Plätze. Nur bei Sturm schließen wir die Terrasse."],
        ["Gibt es laktosefreie Sorten?", "Ja, alle Sorbets und drei Sorten auf Hafermilch."],
        ["Kann ich Eistorten bestellen?", "Ja, drei Tage vorher per Telefon oder im Laden."]
      ),
    ] as Sec[],
    [{ type: "cta", headline: "Bis gleich am Ufer.", ctaText: "Route planen" }] as Sec[]
  );
  return withComposition(doc, "portrait");
}
