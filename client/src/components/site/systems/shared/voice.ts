import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { pickReviewQuote } from "../../artDirection/heroFacts";

/* ── Stimme ───────────────────────────────────────────────────────────── */

/** Anführungszeichen setzt das Markup; vorhandene aus dem Text entfernen. */
export const unquote = (text: string) =>
  text.trim().replace(/^[„"“»«‚']+|[“"”«»‘']+$/g, "");

/**
 * Die eine Stimme (pickReviewQuote: zitierfähig, keine Kritik). Sterne nur,
 * wenn die gewählte Bewertung ausdrücklich 5 trägt.
 */
export function voiceOf(
  items: SectionOf<"testimonials">["items"]
): { text: string; author: string; stars: boolean } | undefined {
  const quote = pickReviewQuote(items);
  if (!quote) return undefined;
  // Genau die Bewertung, aus der das Zitat stammt (gleiche Auswahl je Eintrag).
  const source = items.find(i => {
    const own = pickReviewQuote([i]);
    return own?.author === quote.author && own.text === quote.text;
  });
  return {
    text: unquote(quote.text),
    author: quote.author.trim(),
    stars: source?.rating === 5,
  };
}

export type Voice = { text: string; author: string; stars: boolean };

/**
 * Stimmen: zuerst die beste (voiceOf/pickReviewQuote), danach jede weitere
 * zitierfähige Bewertung in Reihenfolge der Daten — Kritik und Wertungen
 * unter 5 entfallen (gleiche Regel wie pickReviewQuote je Eintrag).
 * Aus Klar herausgelöst, geteilt mit Nacht; Verhalten unverändert.
 */
export function voiceList(items: SectionOf<"testimonials">["items"]): Voice[] {
  const lead = voiceOf(items);
  if (!lead) return [];
  const rest = items.flatMap((item): Voice[] => {
    const own = pickReviewQuote([item]);
    if (!own) return [];
    const text = unquote(own.text);
    if (own.author.trim() === lead.author && text === lead.text) return [];
    return [{ text, author: own.author.trim(), stars: item.rating === 5 }];
  });
  return [lead, ...rest];
}
