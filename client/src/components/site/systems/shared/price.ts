/** „45" → „45 €"; Angaben mit Währung oder ohne Ziffer bleiben, wie sie sind. */
export function formatPrice(price: string): string {
  const trimmed = price.trim();
  if (/€|eur/i.test(trimmed) || !/\d/.test(trimmed)) return trimmed;
  return `${trimmed} €`;
}
