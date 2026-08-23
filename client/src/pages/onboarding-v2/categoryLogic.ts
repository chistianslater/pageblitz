/**
 * Reine Logik der Kategorie-Rückfrage (Plan B7 Task 5, Spec §2.1): Wenn die
 * GMB-Kette keine belastbare Branche liefert, fragt das Studio vor der
 * Generierung nach. Die Vorschläge kommen aus den strukturierten
 * Onboarding-Branchengruppen (shared/gmbCategories.ts — dieselbe Quelle wie
 * der CategoryPicker der StartPage), Freitext bleibt erlaubt.
 */

import { CATEGORY_GROUPS } from "@shared/gmbCategories";

/** Alle Branchen, flach und dedupliziert — Quelle der Vorschlagsliste. */
export const ALL_CATEGORIES: string[] = Array.from(
  new Set(CATEGORY_GROUPS.flatMap(g => g.categories))
);

/** Obergrenze der Vorschlagsliste — mehr Einträge hälfen beim Tippen nicht. */
export const MAX_CATEGORY_SUGGESTIONS = 8;

/**
 * Filtert die Branchenliste zum Tippstand: Präfix-Treffer zuerst (das ist
 * beim Tippen fast immer der gesuchte Eintrag), dann Teilstring-Treffer,
 * beides case-insensitiv. Leere Eingabe → keine Vorschläge (die Liste
 * öffnet erst, wenn der Nutzer tippt).
 */
export function filterCategorySuggestions(
  query: string,
  limit: number = MAX_CATEGORY_SUGGESTIONS
): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const prefix: string[] = [];
  const substring: string[] = [];
  for (const category of ALL_CATEGORIES) {
    const lower = category.toLowerCase();
    if (lower.startsWith(q)) prefix.push(category);
    else if (lower.includes(q)) substring.push(category);
  }
  return [...prefix, ...substring].slice(0, limit);
}
