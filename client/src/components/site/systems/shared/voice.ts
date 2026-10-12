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
