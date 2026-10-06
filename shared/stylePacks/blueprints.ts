/**
 * Branchen-Baupläne (2026-10-06, Betreiber: „die Branche soll sich sofort
 * abgeholt fühlen"). Ein Bauplan legt fest, was eine Branche auf ihrer Seite
 * erwartet: Überschriften in ihrer Sprache, die Hauptaktion, welche Fragen
 * beantwortet werden und welche Extras (Preise, Team) in der Vorschau als
 * Platzhalter angeboten werden. Die Packs bleiben die Gestaltung.
 *
 * Baupläne: Friseur / Barbier / Kosmetik („beauty"), Handwerk („trade"),
 * Gastro („gastro": Restaurant, Imbiss, Café/Bäckerei).
 * Alle anderen Branchen laufen bis zu ihrem eigenen Bauplan unverändert
 * („standard").
 */
import type { SectionType, WebsiteDataV2 } from "../siteContract/types";
import { designIndustryKey } from "./categoryAliases";

export type BlueprintId = "beauty" | "trade" | "gastro" | "standard";

/** Unterart im Bauplan Gastro — steuert Hauptaktion und Vokabular. */
export type GastroKind = "restaurant" | "imbiss" | "cafe";

export type Blueprint = {
  id: BlueprintId;
  /** Feste Überschriften statt Pack-Vokabular („Das Handwerk im Journal"). */
  headlines: Partial<Record<SectionType, string>>;
  /** Hauptaktion im Einstieg, wenn das Modell keine liefert. */
  ctaText?: string;
  /** Zusätzliche Prompt-Zeilen für genau diese Branche. */
  promptLines: string[];
  /** Extras, die die Vorschau als Platzhalter zeigt, solange sie fehlen. */
  placeholders: Array<"pricelist" | "team" | "menu">;
  /** Texte der Platzhalter in der Sprache der Branche. */
  placeholderText: Partial<Record<"pricelist" | "team" | "menu", string>>;
  /** Abschnitte, die das Modell schreibt — ersetzt die Pack-Vorgabe. */
  sections?: SectionType[];
  /** Vom Modell gelieferte Abschnitte, die verworfen werden (nie erfinden). */
  stripSections?: SectionType[];
  /** Hauptaktion im Einstieg verlinkt Anruf oder Route statt #kontakt. */
  ctaAction?: "tel" | "route";
  /** Gastro: Unterart für Hauptaktion und Leiste. */
  gastroKind?: GastroKind;
  /** Zusätzliche Abschnitte, die das Modell für diese Branche schreibt. */
  extraSections?: SectionType[];
  /** Reihenfolge der Abschnitte; nicht genannte behalten ihren Platz am Ende. */
  order?: SectionType[];
  /** Vertrauensleiste unter dem Einstieg (nur belegte Fakten). */
  trust?: boolean;
  /** Kontaktabschnitt: Besuch (Laden) oder Anfrage (Handwerk). */
  contactMode?: "visit" | "inquiry";
  /** Feste Nav-Beschriftungen, passend zu den Überschriften (vor Pack-Labels). */
  navLabels?: Partial<Record<SectionType, string>>;
};

const STANDARD: Blueprint = {
  id: "standard",
  headlines: {},
  promptLines: [],
  placeholders: [],
  placeholderText: {},
};

const BEAUTY_KEYS =
  /^(friseur|barbier|kosmetik|nagel|wimpern|schoenheit|beauty|make-?up|augenbrauen|waxing|haarentfernung)/;

function beautyBlueprint(category: string, name: string): Blueprint {
  // Google führt viele Barbershops als „Friseursalon" — der Name verrät sie.
  const text = `${category} ${name}`;
  const barber = /barb|herren/i.test(text);
  const studio =
    !barber &&
    /kosmetik|cosmetic|nagel|nail|wimpern|lash|beauty|brauen|waxing|schönheit|schoenheit/i.test(
      text
    );
  return {
    id: "beauty",
    headlines: {
      services: "Leistungen",
      gallery: "Unsere Arbeiten",
      about: barber
        ? "Über den Laden"
        : studio
          ? "Über das Studio"
          : "Über den Salon",
      testimonials: "Das sagen unsere Kundinnen und Kunden",
      faq: "Gut zu wissen",
      contact: "Besuch",
    },
    ctaText: "Termin anfragen",
    promptLines: [
      `- Branche: ${barber ? "Barbershop/Herrenfriseur" : studio ? "Kosmetik-/Beauty-Studio" : "Friseursalon"}. Schreib so, wie Kundinnen und Kunden dieser Branche suchen.`,
      `- services.items wie eine Leistungsliste im ${studio ? "Studio" : "Salon"}: Titel mit 1–3 Wörtern (z. B. ${barber ? "„Haarschnitt“, „Fade“, „Bart trimmen“, „Kinderschnitt“" : studio ? "„Gesichtsbehandlung“, „Maniküre“, „Wimpernlifting“" : "„Damenschnitt“, „Herrenschnitt“, „Farbe & Strähnen“, „Föhnen & Styling“"}) — nur Leistungen, die zur Kategorie und zu den Fakten passen.`,
      `- about.body: 60–90 Wörter, ein bis zwei Absätze. Kein Pathos.`,
      `- faq: Fragen, die vor dem ersten Besuch wirklich gestellt werden (Termin oder spontan vorbeikommen? Kinder? Wie lange dauert es?). Antworten NUR mit belegten Fakten — keine Aussagen zu Zahlungsarten, Parkplätzen, Preisen oder Online-Buchung, wenn sie nicht in den Fakten stehen; sonst neutral auf Nachfrage verweisen.`,
    ],
    placeholders: ["pricelist", "team"],
    placeholderText: {
      pricelist:
        "Trag deine Preise im Studio ein — dann stehen sie hier direkt neben den Leistungen. Auf der fertigen Seite erscheint dieser Block erst mit echten Preisen.",
      team: studio
        ? "Wer behandelt, berät, pflegt? Mit Fotos und Namen im Studio entsteht hier euer Team — Vertrauen beginnt beim Gesicht. Auf der fertigen Seite erscheint der Block erst mit euren Angaben."
        : `Wer ${barber ? "schneidet, fadet, trimmt" : "schneidet, färbt, berät"}? Mit Fotos und Namen im Studio entsteht hier euer Team — ${barber ? "beim Barbier" : "beim Friseur"} bucht man Menschen. Auf der fertigen Seite erscheint der Block erst mit euren Angaben.`,
    },
  };
}

/**
 * Gewerke. Google ordnet Handwerker oft unpassend ein (Tischlerei Klähn:
 * „Hersteller") — deshalb zählt auch der Name.
 */
const TRADE =
  /tischler|schreiner|zimmerei|zimmerer|maler|lackier|elektr|sanitär|sanitaer|heizung|klima|installat|dachdeck|bauunternehm|generalunternehm|baufirma|bauges|maurer|fliesen|parkett|bodenleger|trockenbau|stuckat|glaserei|schlosser|metallbau|landschaftsbau|gartenbau|zaunbau|rollladen|rolladen|handwerk|sanierung|schornstein|ofenbau|kaminbau|küchenbau|treppenbau|dachdecker|gerüstbau|estrich/i;

function tradeBlueprint(category: string, name: string): Blueprint {
  const text = `${category} ${name}`;
  const emergency = /elektr|sanitär|sanitaer|heizung|installat|notdienst/i.test(
    text
  );
  return {
    id: "trade",
    headlines: {
      services: "Leistungen",
      gallery: "Referenzen",
      process: "So läuft's ab",
      about: "Der Betrieb",
      testimonials: "Das sagen unsere Kunden",
      faq: "Gut zu wissen",
      contact: "Anfrage & Kontakt",
    },
    ctaText: "Angebot anfragen",
    promptLines: [
      `- Branche: Handwerksbetrieb (${category}). Kundinnen und Kunden holen ein Angebot ein und wollen Verlässlichkeit sehen: was genau gemacht wird, wo, wie es abläuft.`,
      `- hero.headline nennt Gewerk und Ort, z. B. „Maßtischlerei in Bocholt und Umgebung“. hero.ctaText: „Angebot anfragen“.`,
      `- services.items: Titel mit 1–4 Wörtern wie in einem Leistungsverzeichnis (z. B. „Innentüren“, „Einbauschränke“, „Fassadenanstrich“, „Elektroinstallation“) — nur, was zum Gewerk und zu den Fakten passt.`,
      `- process.steps: genau 4 Schritte vom ersten Kontakt bis zur Fertigstellung (Anfrage → Termin vor Ort → Angebot → Ausführung), je Schritt ein Satz. Keine Versprechen wie „kostenlos“, „innerhalb von 24 Stunden“ oder „Festpreis“, wenn sie nicht in den Fakten stehen.`,
      `- about.body: 60–100 Wörter. Inhaber, Meistertitel, Gründungsjahr oder Innung NUR nennen, wenn sie in den Fakten stehen.`,
      `- faq: Fragen vor der Beauftragung (In welchem Umkreis arbeitet ihr? Wie schnell gibt es einen Termin? Wie entsteht das Angebot?${emergency ? " Gibt es einen Notdienst?" : ""}). Antworten NUR mit belegten Fakten, sonst neutral auf das persönliche Gespräch verweisen.`,
    ],
    placeholders: ["team"],
    placeholderText: {
      team: "Wer kommt zu euren Kunden? Mit Fotos und Namen im Studio entsteht hier euer Team — bei Handwerkern zählt, wer vor der Tür steht. Auf der fertigen Seite erscheint der Block erst mit euren Angaben.",
    },
    extraSections: ["process"],
    order: [
      "hero",
      "services",
      "gallery",
      "process",
      "about",
      "testimonials",
      "faq",
      "contact",
    ],
    trust: true,
    contactMode: "inquiry",
    navLabels: {
      services: "Leistungen",
      gallery: "Referenzen",
      process: "Ablauf",
      about: "Betrieb",
      testimonials: "Bewertungen",
      faq: "FAQ",
      contact: "Anfrage",
    },
  };
}

/**
 * Gewerk für die Kopfzeile. Google ordnet Handwerker manchmal unpassend ein
 * („Hersteller") — dann zählt das Gewerk aus dem Namen („Tischlerei").
 */
export function tradeLabel(
  category: string | undefined,
  businessName = ""
): string | undefined {
  if (!category || TRADE.test(category)) return category;
  const word = businessName
    .split(/\s+/)
    .find(w => TRADE.test(w) && /^[A-ZÄÖÜ]/.test(w));
  return word ?? category;
}

const GASTRO_KEYS =
  /^(restaurant|imbiss|catering|cafe|café|baeckerei|bäckerei|konditorei|eiscafe|eisdiele|pizzeria|bistro|gaststaette|gaststätte|kneipe|brauhaus|grill|doener|döner|burger|sushi|steakhouse)/;
const GASTRO_TEXT =
  /restaurant|ristorante|trattoria|pizzeria|bistro|gasthaus|gasthof|gaststätte|wirtshaus|brauhaus|imbiss|döner|doener|kebab|burger|sushi|grill|lieferservice|café|cafe|kaffee|bäckerei|baeckerei|backhaus|konditorei|patisserie|eiscafé|eiscafe|eisdiele|cocktail|kneipe|\bpub\b|weinbar|\bbar\b|brauerei|biergarten/i;

function gastroKind(text: string): GastroKind {
  if (
    /café|cafe|kaffee|bäckerei|baeckerei|backhaus|konditorei|patisserie|eiscaf|eisdiele/i.test(
      text
    )
  )
    return "cafe";
  if (
    /imbiss|fast-?food|döner|doener|kebab|burger|lieferservice|take-?away|schnellrestaurant|meal/i.test(
      text
    )
  )
    return "imbiss";
  return "restaurant";
}

function gastroBlueprint(category: string, name: string): Blueprint {
  const text = `${category} ${name}`;
  const kind = gastroKind(text);
  const bakery = /bäckerei|baeckerei|backhaus|konditorei|patisserie/i.test(
    text
  );
  const cafe = kind === "cafe";
  return {
    id: "gastro",
    gastroKind: kind,
    headlines: {
      menu: cafe ? "Unsere Karte" : "Speisekarte",
      services: "Unser Sortiment",
      gallery: "Einblicke",
      about: bakery
        ? "Die Bäckerei"
        : cafe
          ? "Das Café"
          : kind === "imbiss"
            ? "Über uns"
            : "Unsere Küche",
      testimonials: bakery
        ? "Das sagen unsere Kundinnen und Kunden"
        : "Das sagen unsere Gäste",
      faq: "Gut zu wissen",
      contact: kind === "imbiss" ? "Bestellen & Abholen" : "Besuch",
    },
    // Gastro-Hauptaktion steht fest (Anruf/Route) — das Modell liefert keine.
    ctaText:
      kind === "imbiss"
        ? "Jetzt bestellen"
        : cafe
          ? "Route planen"
          : "Tisch reservieren",
    ctaAction: cafe ? "route" : "tel",
    promptLines: [
      `- Branche: ${bakery ? "Bäckerei/Konditorei" : cafe ? "Café" : kind === "imbiss" ? "Imbiss/Lieferservice" : "Restaurant"} (${category}). Gäste wollen wissen: was gibt es, wann ist geöffnet, wie komme ich an einen Platz oder an mein Essen.`,
      `- hero.headline nennt Küche bzw. Angebot UND Ort, z. B. „Italienische Küche in Bocholt“ oder „Bäckerei am Marktplatz in Rhede“. Kein ctaText.`,
      `- Erfinde KEINE Gerichte, Preise, Spezialitäten, Zutaten oder Herkunftsangaben. Nenne ein Gericht nur, wenn es in der Google-Beschreibung, der bestehenden Website oder mehreren Bewertungen vorkommt — dann ohne Preis.`,
      ...(cafe
        ? [
            `- services.items: 3–5 Bereiche des Sortiments als Überbegriffe (z. B. ${bakery ? "„Brot & Brötchen“, „Kuchen & Torten“, „Snacks für unterwegs“" : "„Kaffee & Getränke“, „Kuchen“, „Frühstück“"}) — nur Bereiche, die zur Kategorie passen; Frühstück nur, wenn belegt. Keine einzelnen Produkte mit Namen, keine Preise.`,
          ]
        : []),
      `- about.body: 60–100 Wörter. Inhaber, Gründungsjahr, Herkunft der Küche oder regionale Zutaten NUR nennen, wenn sie in den Fakten stehen.`,
      `- faq: Fragen, die Gäste vor dem Besuch stellen (${kind === "imbiss" ? "Kann ich telefonisch bestellen? Liefert ihr? Gibt es vegetarische Gerichte?" : cafe ? "Muss ich reservieren? Gibt es Frühstück? Kann ich etwas mitnehmen?" : "Muss ich reservieren? Gibt es vegetarische Gerichte? Kann ich Essen mitnehmen?"}). Antworten NUR mit den belegten Google-Angaben unten — steht eine Angabe nicht da, verweise freundlich auf einen Anruf. Keine Aussagen zu Parkplätzen, Hunden, Zahlungsarten oder Allergenen ohne Beleg.`,
    ],
    placeholders: ["menu"],
    placeholderText: {
      menu: cafe
        ? "Trag dein Sortiment mit Preisen im Studio ein — dann steht es hier wie an der Theke. Auf der fertigen Seite erscheint der Block erst mit echten Angaben."
        : "Trag deine Gerichte mit Preisen im Studio ein — dann steht hier deine Karte. Auf der fertigen Seite erscheint der Block erst mit echten Angaben; erfunden wird nichts.",
    },
    sections: cafe
      ? ["hero", "services", "about", "faq", "contact"]
      : ["hero", "about", "faq", "contact"],
    stripSections: ["menu"],
    order: [
      "hero",
      "menu",
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
      menu: cafe ? "Karte" : "Speisekarte",
      services: "Sortiment",
      gallery: "Einblicke",
      about: "Über uns",
      testimonials: "Bewertungen",
      faq: "FAQ",
      contact: kind === "imbiss" ? "Bestellen" : "Anfahrt",
    },
  };
}

/** Belegte Google-Angaben als Prompt-Zeile (nur Gastro). */
export function amenityPromptLine(
  amenities: Partial<Record<string, boolean>> | undefined
): string | null {
  if (!amenities) return null;
  const labels: Record<string, string> = {
    dineIn: "Vor Ort essen",
    takeout: "Zum Mitnehmen",
    delivery: "Lieferung",
    reservable: "Reservierung möglich",
    vegetarian: "Vegetarische Gerichte",
    breakfast: "Frühstück",
    wheelchair: "Rollstuhlgerechter Eingang",
  };
  const parts = Object.entries(amenities)
    // Ein „nein" zur Barrierefreiheit gehört nicht auf die eigene Seite.
    .filter(
      ([key, v]) =>
        typeof v === "boolean" && labels[key] && (key !== "wheelchair" || v)
    )
    .map(([key, v]) => `${labels[key]}: ${v ? "ja" : "nein"}`);
  return parts.length
    ? `- Belegte Google-Angaben: ${parts.join("; ")}. Alles andere ist unbekannt.`
    : null;
}

/** Bauplan zur Kategorie (Name schärft die Unterart) — sonst Standard. */
export function blueprintFor(
  category: string | undefined,
  businessName = ""
): Blueprint {
  if (!category?.trim()) return STANDARD;
  if (BEAUTY_KEYS.test(designIndustryKey(category)))
    return beautyBlueprint(category, businessName);
  if (TRADE.test(`${category} ${businessName}`))
    return tradeBlueprint(category, businessName);
  if (
    GASTRO_KEYS.test(designIndustryKey(category)) ||
    GASTRO_TEXT.test(category)
  )
    return gastroBlueprint(category, businessName);
  return STANDARD;
}

/**
 * Überschriften und Hauptaktion des Bauplans fest setzen. Das Modell schreibt
 * die Inhalte; die Sprache der Abschnitte gehört der Branche, nicht dem Pack.
 */
export function withBlueprint(
  doc: WebsiteDataV2,
  blueprint: Blueprint
): WebsiteDataV2 {
  if (blueprint.id === "standard") return doc;
  const strip = blueprint.stripSections ?? [];
  const contact = doc.sections.find(s => s.type === "contact");
  const ctaHref = heroCtaHref(blueprint, contact);
  const sections = doc.sections
    .filter(section => !strip.includes(section.type))
    .map(section => {
      const headline = blueprint.headlines[section.type];
      const next = headline ? { ...section, headline } : section;
      if (next.type !== "hero" || !blueprint.ctaText) return next;
      // Feste Hauptaktion (Gastro): Text UND Ziel kommen aus dem Bauplan.
      if (blueprint.ctaAction)
        return ctaHref
          ? { ...next, ctaText: blueprint.ctaText, ctaHref }
          : next;
      return next.ctaText ? next : { ...next, ctaText: blueprint.ctaText };
    }) as WebsiteDataV2["sections"];
  const order = blueprint.order;
  const rank = (type: SectionType) => {
    const i = order?.indexOf(type) ?? -1;
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  // Verworfene Extras (vom Modell erfundene Speisekarte) nicht vorbuchen.
  const addOns = withoutMenuAddOn(doc.addOns, strip);
  return {
    ...doc,
    addOns,
    sections: order
      ? sections
          .map((section, i) => ({ section, i }))
          .sort(
            (a, b) => rank(a.section.type) - rank(b.section.type) || a.i - b.i
          )
          .map(({ section }) => section)
      : sections,
  };
}

/** Verworfene Speisekarte nicht als Extra vorbuchen (Checkout, Extras-Panel). */
function withoutMenuAddOn(
  addOns: WebsiteDataV2["addOns"],
  strip: SectionType[]
): WebsiteDataV2["addOns"] {
  if (!addOns || !strip.includes("menu") || !("menu" in addOns)) return addOns;
  const { menu: _menu, ...rest } = addOns;
  return Object.keys(rest).length ? rest : undefined;
}

/** Ziel der festen Hauptaktion: Anruf oder Google-Maps-Route. */
function heroCtaHref(
  blueprint: Blueprint,
  contact: WebsiteDataV2["sections"][number] | undefined
): string | undefined {
  if (!contact || contact.type !== "contact") return undefined;
  if (blueprint.ctaAction === "tel") {
    const digits = (contact.phone ?? "").replace(/[^\d+]/g, "");
    return /^\+?\d{5,20}$/.test(digits) ? `tel:${digits}` : undefined;
  }
  if (blueprint.ctaAction === "route") {
    const ort = [contact.zip, contact.city].filter(Boolean).join(" ");
    if (!ort) return undefined;
    const query = [contact.street, ort].filter(Boolean).join(", ");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }
  return undefined;
}
