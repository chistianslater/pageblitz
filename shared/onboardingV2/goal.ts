import type { AddOnKey } from "../pricing";
import type { SectionOf, WebsiteDataV2 } from "../siteContract/types";

/**
 * Ziel der Website (2026-09-03, Übernahme aus vite-deploy-studio „GoalsStep",
 * auf lokale Betriebe reduziert): steuert den Hero-Button und die
 * Extra-Empfehlung im Extras-Panel. Gefragt wird einmalig nach dem
 * Design-Gate (GoalStep), änderbar im Extras-Panel.
 */

export const GOAL_KEYS = ["anrufe", "anfragen", "termine", "verkauf"] as const;
export type GoalKey = (typeof GOAL_KEYS)[number];

export interface GoalSpec {
  label: string;
  hint: string;
  /** Standard-Text des Hero-Buttons. */
  ctaText: string;
  /** Empfohlenes Extra — null, wenn die Basis reicht (Telefonnummer steht in der Kontakt-Sektion). */
  addOn: AddOnKey | null;
}

export const GOALS: Record<GoalKey, GoalSpec> = {
  anrufe: {
    label: "Anrufe",
    hint: "Kunden sollen direkt zum Hörer greifen — der Button wählt deine Nummer.",
    ctaText: "Jetzt anrufen",
    addOn: null,
  },
  anfragen: {
    label: "Anfragen",
    hint: "Kunden schreiben dir ihr Anliegen — am besten über ein Kontaktformular.",
    ctaText: "Jetzt anfragen",
    addOn: "contactForm",
  },
  termine: {
    label: "Termine",
    hint: "Kunden buchen selbst einen Termin — rund um die Uhr, ohne Telefon.",
    ctaText: "Termin vereinbaren",
    addOn: "booking",
  },
  verkauf: {
    label: "Verkauf",
    hint: "Kunden sehen Angebot und Preise und entscheiden sich direkt.",
    ctaText: "Angebot ansehen",
    addOn: "pricelist",
  },
};

const DEFAULT_CTA_TEXTS = new Set(GOAL_KEYS.map(key => GOALS[key].ctaText));

/** Leer oder ein Ziel-Standard → darf beim Zielwechsel ersetzt werden; eigener Text bleibt. */
export function isGoalDefaultCta(text: string | undefined): boolean {
  return (
    !text || text.trim().length === 0 || DEFAULT_CTA_TEXTS.has(text.trim())
  );
}

/** „0231 555 4471" → „+492315554471"; internationale Nummern bleiben, nur Ziffern. */
export function telHref(phone: string): string | null {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/[^\d]/g, "");
  if (digits.length < 5) return null;
  if (trimmed.startsWith("+")) return `tel:+${digits}`;
  if (digits.startsWith("00")) return `tel:+${digits.slice(2)}`;
  if (digits.startsWith("0")) return `tel:+49${digits.slice(1)}`;
  return `tel:+49${digits}`;
}

export function goalCtaHref(goal: GoalKey, doc: WebsiteDataV2): string {
  if (goal === "verkauf") return "#leistungen";
  if (goal === "anrufe") {
    const contact = doc.sections.find(
      (s): s is SectionOf<"contact"> => s.type === "contact"
    );
    const href = contact?.phone ? telHref(contact.phone) : null;
    if (href) return href;
  }
  return "#kontakt";
}

/** Reine Ableitung: Ziel + Hero-Button (Text nur, wenn noch Standard). */
export function applyGoal(doc: WebsiteDataV2, goal: GoalKey): WebsiteDataV2 {
  const href = goalCtaHref(goal, doc);
  return {
    ...doc,
    goal,
    sections: doc.sections.map(section => {
      if (section.type !== "hero") return section;
      return {
        ...section,
        ctaText: isGoalDefaultCta(section.ctaText)
          ? GOALS[goal].ctaText
          : section.ctaText,
        ctaHref: href,
      };
    }),
  };
}
