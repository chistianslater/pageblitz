/**
 * Baupläne der Freundlich-Familien (2026-10-13): Kinder & Familie (Kita,
 * Krippe, Tagesmutter, Hebamme) und Tiere (Tierarzt, Hundesalon,
 * Hundeschule, Tierbedarf). Keine neuen Datenfelder — Reihenfolgen wie
 * Gesundheit bzw. Sport & Kurse; Preise, Plätze, Konzepte, Zulassungen nur
 * mit Beleg.
 */
import type { Blueprint } from "./blueprints";
import {
  coursesBlueprint,
  healthBlueprint,
  retailBlueprint,
} from "./blueprintFamilies";
import {
  isChildcare,
  isMidwife,
  petKind,
  type CareFamilyId,
} from "./careWords";

const NO_INVENTION = `- Erfinde KEINE Preise, Zulassungen, Zertifikate, Gründungsjahre, Mitarbeiterzahlen, Marken oder Auszeichnungen. Nur, was in den Fakten steht.`;

const faqLine = (questions: string) =>
  `- faq: Fragen, die vor dem ersten Kontakt wirklich gestellt werden (${questions}). Antworten NUR mit belegten Fakten — sonst freundlich auf Anruf oder Nachricht verweisen.`;

/** Reihenfolge wie Gesundheit: Vorteile, Angebot, Preise, Ablauf, Team vor Stimmen und Kontakt. */
const CARE_ORDER: NonNullable<Blueprint["order"]> = [
  "hero",
  "usp",
  "services",
  "pricelist",
  "process",
  "about",
  "team",
  "gallery",
  "testimonials",
  "faq",
  "contact",
];

/* ── Kinder & Familie ───────────────────────────────────────────────────── */

function childcareBlueprint(category: string, name: string): Blueprint {
  const solo = /tagesm(u|ü)tter|tagesv(a|ä)ter|tageseltern|tagespflege/i.test(
    `${category} ${name}`
  );
  return {
    id: "family",
    headlines: {
      services: "Betreuung & Alltag",
      about: solo ? "Über mich" : "Über uns",
      team: "Unser Team",
      gallery: "Einblicke",
      testimonials: "Das sagen Eltern",
      faq: "Gut zu wissen",
      contact: "Kennenlernen & Kontakt",
    },
    ctaText: "Kennenlernen anfragen",
    hoursLabel: "Betreuungszeiten",
    promptLines: [
      `- Branche: ${solo ? "Kindertagespflege (Tagesmutter/Tagesvater)" : "Kita/Kindergarten/Krippe"} (${category}). Eltern suchen Vertrauen: Wer betreut, wie sieht der Tag aus, wie bekomme ich einen Platz.`,
      `- hero.headline nennt Betreuungsform UND Ort, z. B. „Kita im Grünen in Bocholt“ oder „Tagesmutter in Rhede“.`,
      `- services.items: Bausteine des Alltags mit 1–4 Wörtern (z. B. „Eingewöhnung“, „Freispiel“, „Mittagessen“, „Draußen spielen“) — nur, was zur Betreuungsform passt. Pädagogisches Konzept (Montessori, Waldorf, Reggio), Träger, Altersgruppen, Gruppengröße, Betreuungsschlüssel, freie Plätze, Wartelisten, Elternbeiträge NUR nennen, wenn belegt.`,
      `- Nenne keine Kindernamen und beschreibe keine einzelnen Kinder.`,
      NO_INVENTION,
      faqLine(
        "Ab welchem Alter betreut ihr? Wie läuft die Eingewöhnung? Wie melde ich mein Kind an? Gibt es Mittagessen?"
      ),
    ],
    placeholders: ["team"],
    placeholderText: {
      team: solo
        ? "Wer betreut? Mit Foto und ein paar Sätzen im Studio stellst du dich hier vor — Eltern wollen wissen, wem sie ihr Kind anvertrauen. Auf der fertigen Seite erscheint der Block erst mit deinen Angaben."
        : "Wer betreut? Mit Fotos und Namen im Studio entsteht hier euer Team — Eltern wollen wissen, wem sie ihr Kind anvertrauen. Auf der fertigen Seite erscheint der Block erst mit euren Angaben.",
    },
    order: CARE_ORDER,
    trust: true,
    contactMode: "inquiry",
    navLabels: {
      services: "Alltag",
      about: solo ? "Über mich" : "Über uns",
      gallery: "Einblicke",
      testimonials: "Stimmen",
      faq: "FAQ",
      contact: "Kontakt",
    },
  };
}

function midwifeBlueprint(category: string): Blueprint {
  const house = /geburtsh(a|ä)us|birth/i.test(category);
  return {
    id: "family",
    headlines: {
      services: "Begleitung & Kurse",
      about: house ? "Das Geburtshaus" : "Über uns",
      team: "Unser Team",
      gallery: "Einblicke",
      testimonials: "Das sagen Familien",
      faq: "Gut zu wissen",
      contact: "Anfrage & Kontakt",
    },
    ctaText: "Begleitung anfragen",
    hoursLabel: "Sprechzeiten",
    promptLines: [
      `- Branche: ${house ? "Geburtshaus" : "Hebamme/Hebammenpraxis"} (${category}). Schwangere und junge Familien suchen Vertrauen und wollen wissen: Was wird angeboten, ab wann melde ich mich, wie läuft die Begleitung.`,
      `- hero.headline nennt Angebot UND Ort, z. B. „Hebammenpraxis in Bocholt“ oder „Hebamme für Rhede und Umgebung“.`,
      `- Heilmittelwerberecht: KEINE Heilversprechen, keine Garantien („schmerzfrei“, „sichere Geburt“), keine Diagnosen. Sachlich beschreiben, was angeboten wird.`,
      `- services.items: Angebote mit 1–4 Wörtern (z. B. „Schwangerenvorsorge“, „Geburtsvorbereitung“, „Wochenbettbetreuung“, „Rückbildung“) — nur, was zur Kategorie und zu den Fakten passt. Kassenleistung, Hausbesuche, Beleggeburten, Kurszeiten und Kursgebühren NUR nennen, wenn belegt.`,
      NO_INVENTION,
      faqLine(
        "Wann sollte ich mich melden? Übernimmt die Krankenkasse die Kosten? Kommt ihr zu mir nach Hause? Welche Kurse gibt es?"
      ),
    ],
    placeholders: ["team"],
    placeholderText: {
      team: "Wer begleitet? Mit Fotos und Namen im Studio entsteht hier euer Team — Vertrauen beginnt beim Gesicht. Auf der fertigen Seite erscheint der Block erst mit euren Angaben.",
    },
    order: CARE_ORDER,
    trust: true,
    contactMode: "inquiry",
    serviceArea: !house,
    navLabels: {
      services: "Angebot",
      about: house ? "Geburtshaus" : "Über uns",
      gallery: "Einblicke",
      testimonials: "Stimmen",
      faq: "FAQ",
      contact: "Kontakt",
    },
  };
}

/* ── Tiere ──────────────────────────────────────────────────────────────── */

const PET_OWNERS = "Das sagen Tierhalterinnen und Tierhalter";

function groomingBlueprint(category: string, name: string): Blueprint {
  const cats = /katze/i.test(`${category} ${name}`);
  return {
    id: "pets",
    headlines: {
      services: "Pflege & Leistungen",
      gallery: "Einblicke",
      about: "Über den Salon",
      testimonials: PET_OWNERS,
      faq: "Gut zu wissen",
      contact: "Termin & Anfahrt",
    },
    ctaText: "Termin anfragen",
    promptLines: [
      `- Branche: ${cats ? "Katzen-/Tierpflegesalon" : "Hundesalon/Hundefriseur"} (${category}). Tierhalterinnen und Tierhalter wollen wissen: Was wird gemacht, wie geht ihr mit dem Tier um, wie bekomme ich einen Termin.`,
      `- hero.headline nennt Leistung UND Ort, z. B. „Hundesalon in Bocholt“.`,
      `- services.items: Pflegeleistungen mit 1–4 Wörtern (z. B. „Baden & Föhnen“, „Scheren“, „Trimmen“, „Krallenpflege“) — nur, was zur Kategorie passt. Rassen, Ausbildung, Preise und Dauer NUR nennen, wenn belegt.`,
      NO_INVENTION,
      faqLine(
        "Wie lange dauert ein Termin? Darf ich dabeibleiben? Was ist bei ängstlichen Tieren? Welche Rassen pflegt ihr?"
      ),
    ],
    placeholders: ["pricelist"],
    placeholderText: {
      pricelist:
        "Trag deine Leistungen mit Preisen im Studio ein — dann stehen sie hier direkt beim Angebot. Auf der fertigen Seite erscheint der Block erst mit echten Preisen.",
    },
    order: CARE_ORDER,
    trust: true,
    contactMode: "visit",
    navLabels: {
      services: "Leistungen",
      gallery: "Einblicke",
      about: "Über uns",
      testimonials: "Bewertungen",
      faq: "FAQ",
      contact: "Termin",
    },
  };
}

/**
 * Tierarzt, Hundeschule, Tierbedarf übernehmen die bewährten Baupläne
 * (Gesundheit mit Tierarzt-Zeilen, Kurse mit Probestunde, Handel) — nur die
 * Familie (und damit das System) ist „Tiere“.
 */
function petsBlueprint(category: string, name: string): Blueprint {
  const kind = petKind(category) ?? petKind(name) ?? "vet";
  if (kind === "grooming") return groomingBlueprint(category, name);
  if (kind === "school") {
    const base = coursesBlueprint(category, name);
    return {
      ...base,
      id: "pets",
      headlines: { ...base.headlines, testimonials: PET_OWNERS },
    };
  }
  if (kind === "shop") return { ...retailBlueprint(category), id: "pets" };
  // Tierheilpraktiker, Tierphysiotherapie, Pferdeklinik: Tierarzt-Zeilen.
  return { ...healthBlueprint(category, name, { vet: true }), id: "pets" };
}

export function careBlueprint(
  family: CareFamilyId,
  category: string,
  name: string
): Blueprint {
  if (family === "pets") return petsBlueprint(category, name);
  // Kategorie vor Name: „Kita" mit einer Hebamme im Namen bleibt Kita.
  const midwife =
    isMidwife(category) || (!isChildcare(category) && isMidwife(name));
  return midwife
    ? midwifeBlueprint(category)
    : childcareBlueprint(category, name);
}
