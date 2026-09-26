import { categoryAliasKey } from "./categoryAliases";

/**
 * Imbiss-Stimmung innerhalb von Gusto (2026-09-26, Test „Dicle Döner").
 * Gusto spricht Trattoria und Weinbar: Espresso-Dunkel, Gold, kursive
 * Serifen, gedimmte Fotos. Ein Dönerladen braucht kräftige, appetitliche
 * Farben, eine markante Schrift und satte Essensfotos — gleiches Pack, andere
 * Stimmung. Kein 21. Pack.
 *
 * Pizzeria und Restaurant bleiben bewusst klassisch; nur Lieferdienst-
 * Pizza zählt als Imbiss.
 */
const IMBISS_STAEMME = [
  "doener",
  "kebab",
  "burger",
  "imbiss",
  "falafel",
  "currywurst",
  "pommes",
  "snack",
  "foodtruck",
  "takeaway",
  "fastfood",
  "schnellrestaurant",
  "pizzaservice",
  "pizzalieferdienst",
];

export function isImbissCategory(category: string | null | undefined): boolean {
  if (!category?.trim()) return false;
  const kompakt = categoryAliasKey(category).replace(/\s+/g, "");
  return IMBISS_STAEMME.some(stamm => kompakt.includes(stamm));
}
