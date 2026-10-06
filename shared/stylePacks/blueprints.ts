/**
 * Branchen-Baupläne (2026-10-06, Betreiber: „die Branche soll sich sofort
 * abgeholt fühlen"). Ein Bauplan legt fest, was eine Branche auf ihrer Seite
 * erwartet: Überschriften in ihrer Sprache, die Hauptaktion, welche Fragen
 * beantwortet werden und welche Extras (Preise, Team) in der Vorschau als
 * Platzhalter angeboten werden. Die Packs bleiben die Gestaltung.
 *
 * Erster Bauplan: Friseur / Barbier / Kosmetik. Alle anderen Branchen laufen
 * bis zu ihrem eigenen Bauplan unverändert („standard").
 */
import type { SectionType, WebsiteDataV2 } from "../siteContract/types";
import { designIndustryKey } from "./categoryAliases";

export type BlueprintId = "beauty" | "standard";

export type Blueprint = {
  id: BlueprintId;
  /** Feste Überschriften statt Pack-Vokabular („Das Handwerk im Journal"). */
  headlines: Partial<Record<SectionType, string>>;
  /** Hauptaktion im Einstieg, wenn das Modell keine liefert. */
  ctaText?: string;
  /** Zusätzliche Prompt-Zeilen für genau diese Branche. */
  promptLines: string[];
  /** Extras, die die Vorschau als Platzhalter zeigt, solange sie fehlen. */
  placeholders: Array<"pricelist" | "team">;
  /** Texte der Platzhalter in der Sprache der Branche. */
  placeholderText: Partial<Record<"pricelist" | "team", string>>;
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

/** Bauplan zur Kategorie (Name schärft die Unterart) — sonst Standard. */
export function blueprintFor(
  category: string | undefined,
  businessName = ""
): Blueprint {
  if (!category?.trim()) return STANDARD;
  return BEAUTY_KEYS.test(designIndustryKey(category))
    ? beautyBlueprint(category, businessName)
    : STANDARD;
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
  return {
    ...doc,
    sections: doc.sections.map(section => {
      const headline = blueprint.headlines[section.type];
      const next = headline ? { ...section, headline } : section;
      return next.type === "hero" && !next.ctaText && blueprint.ctaText
        ? { ...next, ctaText: blueprint.ctaText }
        : next;
    }) as WebsiteDataV2["sections"],
  };
}
